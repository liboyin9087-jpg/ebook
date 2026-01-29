import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Upload, BookOpen, Link2, Trash2, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../src/lib/supabase';
import type { Book } from '../../src/lib/supabase';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

interface BookDisplay extends Book {
  pages?: string[];
}

export const Dashboard: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [books, setBooks] = useState<BookDisplay[]>([]);
  const [share, setShare] = useState<{ url: string; bookId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // 從 Supabase 載入已上傳的電子書
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBooks(data || []);
    } catch (e) {
      console.error('Failed to load books', e);
    }
  };

  const handleUpload = async () => {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) {
      setError('請選擇檔案');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      const bookId = `book-${Date.now()}`;
      const firstFile = files[0];
      const fileName = firstFile.name.replace(/\.[^/.]+$/, '');
      
      let imagesToUpload: { blob: Blob; index: number }[] = [];

      // Check if it's a PDF
      if (firstFile.type === 'application/pdf') {
        setUploadProgress(10);
        
        // Convert PDF to images
        const arrayBuffer = await firstFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        setUploadProgress(20);
        
        // Render each page as image
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // Higher quality
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            
            // Convert to blob with error handling
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
            });
            
            if (!blob) {
              throw new Error(`無法轉換頁面 ${i} 為圖片`);
            }
            
            imagesToUpload.push({ blob, index: i - 1 });
          }
          
          setUploadProgress(20 + (i / pdf.numPages) * 30);
        }
      } else {
        // Images
        for (let i = 0; i < files.length; i++) {
          imagesToUpload.push({ blob: files[i], index: i });
        }
        setUploadProgress(20);
      }

      // 1. 建立書本記錄
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .insert({
          id: bookId,
          title: fileName,
          page_count: imagesToUpload.length,
        })
        .select()
        .single();

      if (bookError) {
        console.error('Book creation error:', bookError);
        throw new Error('建立書本記錄失敗：' + bookError.message);
      }

      setUploadProgress(50);

      // 2. 上傳每個頁面檔案到 Supabase Storage
      for (let i = 0; i < imagesToUpload.length; i++) {
        const { blob, index } = imagesToUpload[i];
        const filePath = `${bookId}/page-${index}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('ebook-pages')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg'
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`上傳頁面 ${index + 1} 失敗：` + uploadError.message);
        }

        // 3. 建立頁面記錄
        const { error: pageError } = await supabase
          .from('book_pages')
          .insert({
            book_id: bookId,
            page_number: index,
            file_path: filePath,
          });

        if (pageError) {
          console.error('Page record error:', pageError);
          throw new Error(`建立頁面記錄 ${index + 1} 失敗：` + pageError.message);
        }
        
        setUploadProgress(50 + ((i + 1) / imagesToUpload.length) * 45);
      }

      setUploadProgress(100);
      setSuccess(`成功上傳 ${imagesToUpload.length} 頁！`);

      // 重新載入書本列表
      await fetchBooks();

      // 產生分享連結
      const url = `${window.location.origin}/book/${bookId}`;
      setShare({ url, bookId });

      // 清空檔案選擇
      if (fileRef.current) fileRef.current.value = '';
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || '上傳失敗，請確認 Supabase 設定是否正確');
      console.error('Upload error:', e);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此電子書嗎？')) return;
    
    try {
      // 1. 刪除 Storage 中的檔案
      const { data: pages } = await supabase
        .from('book_pages')
        .select('file_path')
        .eq('book_id', id);

      if (pages) {
        const filePaths = pages.map(p => p.file_path);
        await supabase.storage.from('ebook-pages').remove(filePaths);
      }

      // 2. 刪除頁面記錄
      await supabase.from('book_pages').delete().eq('book_id', id);

      // 3. 刪除書本記錄
      await supabase.from('books').delete().eq('id', id);

      // 重新載入列表
      await fetchBooks();
      if (share?.bookId === id) setShare(null);
    } catch (e: any) {
      alert('刪除失敗：' + e.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('已複製連結到剪貼簿！');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a new change event to trigger upload
      const event = new Event('change', { bubbles: true });
      if (fileRef.current) {
        // Store files for processing
        const dt = new DataTransfer();
        Array.from(e.dataTransfer.files).forEach(file => dt.items.add(file));
        fileRef.current.files = dt.files;
        handleUpload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* 標題區 */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
            電子書管理平台
          </h1>
          <p className="text-sm md:text-base text-gray-600">上傳 PDF 或圖片，立即產生專屬分享連結與 QR Code</p>
        </div>

        {/* Global notifications */}
        {success && (
          <div className="mb-6 max-w-4xl mx-auto">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* 上傳區塊 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 flex items-center gap-2 text-gray-800">
              <Upload className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              上傳電子書
            </h2>
            
            <div className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                  dragActive 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  multiple
                  onChange={() => setError(null)}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  或拖放檔案到此處
                </p>
              </div>

              <button
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? `上傳中... ${Math.round(uploadProgress)}%` : '開始上傳'}
              </button>

              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2.5 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">上傳失敗</p>
                    <p className="text-xs mt-1">{error}</p>
                  </div>
                </div>
              )}

              {share && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 md:p-6 mt-6">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    分享連結
                  </h3>
                  <div className="bg-white rounded-lg p-3 mb-3 break-all text-xs md:text-sm border border-green-200">
                    <a href={share.url} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {share.url}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(share.url)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors mb-4"
                  >
                    複製連結
                  </button>
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-md">
                      <QRCode value={share.url} size={140} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 電子書列表 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 flex items-center gap-2 text-gray-800">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              已上傳電子書 ({books.length})
            </h2>

            {books.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>尚未上傳任何電子書</p>
                <p className="text-xs mt-2">請使用左側上傳功能新增電子書</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate mb-1">{book.title}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(book.created_at).toLocaleString('zh-TW')} · {book.page_count} 頁
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <a
                          href={`/book/${book.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          title="閱讀"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
