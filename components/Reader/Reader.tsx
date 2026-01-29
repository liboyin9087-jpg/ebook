import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface BookData {
  id: string;
  title: string;
  page_count: number;
  created_at: string;
}

export const Reader: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookData | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      // 1. 載入書本資料
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (bookError) throw bookError;
      if (!bookData) throw new Error('找不到電子書');

      setBook(bookData);

      // 2. 載入頁面資料
      const { data: pagesData, error: pagesError } = await supabase
        .from('book_pages')
        .select('*')
        .eq('book_id', id)
        .order('page_number', { ascending: true });

      if (pagesError) throw pagesError;

      // 3. 取得每一頁的公開 URL
      const pageUrls = await Promise.all(
        pagesData.map(async (page) => {
          const { data } = supabase.storage
            .from('ebook-pages')
            .getPublicUrl(page.file_path);
          return data.publicUrl;
        })
      );

      setPages(pageUrls);
    } catch (e: any) {
      console.error('Failed to load book', e);
      alert('載入電子書失敗：' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const zoomIn = () => setScale(Math.min(scale + 0.1, 2));
  const zoomOut = () => setScale(Math.max(scale - 0.1, 0.5));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  if (!book || pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8">
        <div className="text-white text-2xl mb-4">找不到電子書</div>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          返回首頁
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* 頂部工具列 */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="返回首頁"
          >
            <Home className="w-5 h-5" />
          </button>
          <h1 className="text-white text-xl font-semibold">{book.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="縮小"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm px-3">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="放大"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => document.documentElement.requestFullscreen()}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors ml-2"
            title="全螢幕"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 閱讀區域 */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-auto">
        <div className="relative" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
          <img
            src={pages[currentPage]}
            alt={`Page ${currentPage + 1}`}
            className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* 底部控制列 */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            上一頁
          </button>

          <div className="text-white text-lg font-semibold">
            第 {currentPage + 1} / {pages.length} 頁
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === pages.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            下一頁
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 縮圖預覽 */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {pages.map((page, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`flex-shrink-0 border-2 rounded transition-all ${
                idx === currentPage
                  ? 'border-indigo-500 scale-110'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <img
                src={page}
                alt={`Thumbnail ${idx + 1}`}
                className="w-16 h-20 object-cover rounded"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
