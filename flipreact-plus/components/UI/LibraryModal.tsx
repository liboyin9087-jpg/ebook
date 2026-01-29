import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { SAMPLE_LIBRARY } from '../../constants';
import { BookData, PageData } from '../../types';
import { Upload, BookOpen, ImageIcon, X, FileText, Loader2 } from '../Icons';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

interface LibraryModalProps {
  isOpen: boolean;
  onSelectBook: (pages: PageData[], title: string) => void;
  onClose: () => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onSelectBook, onClose }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const files = Array.from(e.target.files);

      try {
        // Check if PDF
        const pdfFile = files.find(f => f.type === 'application/pdf');

        if (pdfFile) {
          setProcessingStatus('Loading PDF document...');
          
          // Convert PDF to ArrayBuffer
          const arrayBuffer = await pdfFile.arrayBuffer();
          
          // Load PDF Document
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          
          const newPages: PageData[] = [];
          
          // Loop through each page
          for (let i = 1; i <= pdf.numPages; i++) {
            setProcessingStatus(`Rendering page ${i} of ${pdf.numPages}...`);
            
            const page = await pdf.getPage(i);
            
            // Set scale for quality (1.5 or 2.0 is usually good for screen reading)
            const viewport = page.getViewport({ scale: 1.5 });
            
            // Prepare canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            if (context) {
              await page.render({ canvasContext: context, viewport }).promise;
              
              // Convert to Data URL
              const imageUrl = canvas.toDataURL('image/jpeg', 0.85);
              
              newPages.push({
                index: i - 1,
                contentUrl: imageUrl,
                type: (i === 1 || i === pdf.numPages) ? 'cover' : 'content'
              });
            }
          }
          
          onSelectBook(newPages, pdfFile.name.replace('.pdf', ''));
          onClose();

        } else {
          // Image Handling
          setProcessingStatus('Processing images...');
          
          // Sort files naturally (page-1, page-2, page-10)
          files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

          const newPages: PageData[] = files.map((file, i) => ({
            index: i,
            contentUrl: URL.createObjectURL(file),
            type: i === 0 || i === files.length - 1 ? 'cover' : 'content'
          }));

          onSelectBook(newPages, `Custom Upload (${files.length} pages)`);
          onClose();
        }

      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to process file. Please try again.");
      } finally {
        setIsProcessing(false);
        setProcessingStatus('');
      }
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-gray-900/90 flex flex-col items-center justify-center text-white">
            <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
            <p className="text-xl font-medium">{processingStatus}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-brand-500" />
            Library & Upload
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button 
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'library' ? 'text-brand-400 border-b-2 border-brand-500 bg-gray-800/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            Browse Library
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'upload' ? 'text-brand-400 border-b-2 border-brand-500 bg-gray-800/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            Upload PDF or Images
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-900">
          {activeTab === 'library' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_LIBRARY.map((book) => (
                <div 
                  key={book.id}
                  onClick={() => {
                    onSelectBook(book.pages, book.title);
                    onClose();
                  }}
                  className="group relative aspect-[1/1.4] rounded-lg overflow-hidden cursor-pointer border border-gray-700 hover:border-brand-500 transition-all shadow-lg hover:shadow-brand-500/20"
                >
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-400 transition-colors">{book.title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-2">{book.description}</p>
                    <div className="mt-2 text-xs font-mono text-gray-400">{book.pages.length} Pages</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-8 text-center">
              <div className="flex gap-8">
                 <div className="flex flex-col items-center gap-2 text-gray-400">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                      <FileText size={32} className="text-red-400" />
                    </div>
                    <span className="text-sm font-medium">PDF Document</span>
                 </div>
                 <div className="flex flex-col items-center gap-2 text-gray-400">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                      <ImageIcon size={32} className="text-green-400" />
                    </div>
                    <span className="text-sm font-medium">Image Series</span>
                 </div>
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-bold text-white">Upload your Book</h3>
                <p className="text-gray-400">
                  Select a <strong>PDF file</strong> or a set of <strong>ordered Images</strong>.
                  <br/>
                  We will automatically convert them into a flipbook.
                </p>
              </div>
              
              <label className="relative cursor-pointer group">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,application/pdf" 
                  onChange={handleFileUpload}
                  className="hidden" 
                />
                <div className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium shadow-lg shadow-brand-500/30 transition-all flex items-center gap-3 text-lg">
                  <Upload size={24} />
                  Select File(s)
                </div>
              </label>
              
              <div className="text-sm text-gray-500 border-t border-gray-800 pt-6 mt-4 w-full max-w-lg">
                 <ul className="space-y-1">
                    <li>• For Images: Name them <code>page-01.jpg</code>, <code>page-02.jpg</code>, etc.</li>
                    <li>• For PDF: Processing large files may take a moment.</li>
                 </ul>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};