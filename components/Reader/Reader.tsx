import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, ZoomIn, ZoomOut, Maximize, Grid, Bookmark, BookmarkCheck } from 'lucide-react';
import { supabase } from '../../src/lib/supabase';

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
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [isFlipping, setIsFlipping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive scale adjustment
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScale(0.5);
      } else if (width < 1024) {
        setScale(0.7);
      } else {
        setScale(1);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load bookmarks from localStorage
  useEffect(() => {
    if (!id) return;
    const saved = localStorage.getItem(`bookmarks_${id}`);
    if (saved) {
      setBookmarks(new Set(JSON.parse(saved)));
    }
  }, [id]);

  // Save bookmarks to localStorage
  useEffect(() => {
    if (!id) return;
    localStorage.setItem(`bookmarks_${id}`, JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks, id]);

  useEffect(() => {
    if (!id) return;
    
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      
      // 1. 載入書本資料
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (bookError) {
        console.error('Book load error:', bookError);
        throw new Error('無法載入電子書資料');
      }
      if (!bookData) throw new Error('找不到電子書');

      setBook(bookData);

      // 2. 載入頁面資料
      const { data: pagesData, error: pagesError } = await supabase
        .from('book_pages')
        .select('*')
        .eq('book_id', id)
        .order('page_number', { ascending: true });

      if (pagesError) {
        console.error('Pages load error:', pagesError);
        throw new Error('無法載入頁面資料');
      }

      if (!pagesData || pagesData.length === 0) {
        throw new Error('此電子書沒有頁面');
      }

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
      alert('載入電子書失敗：' + (e.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(currentPage + 1);
      setTimeout(() => setIsFlipping(false), 600);
    }
  }, [currentPage, pages.length, isFlipping]);

  const prevPage = useCallback(() => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(currentPage - 1);
      setTimeout(() => setIsFlipping(false), 600);
    }
  }, [currentPage, isFlipping]);

  const zoomIn = () => setScale(Math.min(scale + 0.2, 2.5));
  const zoomOut = () => setScale(Math.max(scale - 0.2, 0.3));
  
  const toggleBookmark = useCallback(() => {
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(currentPage)) {
      newBookmarks.delete(currentPage);
    } else {
      newBookmarks.add(currentPage);
    }
    setBookmarks(newBookmarks);
  }, [bookmarks, currentPage]);

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setShowThumbnails(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'Escape') setShowThumbnails(false);
      if (e.key === 'b' || e.key === 'B') toggleBookmark();
      if (e.key === 't' || e.key === 'T') setShowThumbnails(!showThumbnails);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage, toggleBookmark, showThumbnails]);

  // Touch gestures for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          nextPage();
        } else {
          prevPage();
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextPage, prevPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
        <div className="text-white text-xl">載入電子書中...</div>
      </div>
    );
  }

  if (!book || pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8 text-center">
        <div className="text-white text-2xl mb-4">⚠️ 找不到電子書</div>
        <p className="text-gray-400 mb-6">此電子書可能已被刪除或不存在</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
        >
          返回首頁
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* 頂部工具列 */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex-shrink-0"
            title="返回首頁"
          >
            <Home className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <h1 className="text-white text-sm md:text-xl font-semibold truncate">{book.title}</h1>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              showThumbnails ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title="縮圖預覽"
          >
            <Grid className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              bookmarks.has(currentPage) ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={bookmarks.has(currentPage) ? '移除書籤' : '加入書籤'}
          >
            {bookmarks.has(currentPage) ? (
              <BookmarkCheck className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex-shrink-0"
            title="縮小"
          >
            <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <span className="text-white text-xs md:text-sm px-2 hidden sm:inline">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex-shrink-0"
            title="放大"
          >
            <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => document.documentElement.requestFullscreen()}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors ml-1 md:ml-2 flex-shrink-0"
            title="全螢幕"
          >
            <Maximize className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* 縮圖側邊欄 */}
      {showThumbnails && (
        <div className="fixed left-0 top-[57px] md:top-[65px] bottom-0 w-64 bg-gray-900/98 backdrop-blur-sm border-r border-gray-700 z-30 overflow-y-auto shadow-xl">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
              <span>所有頁面</span>
              <button
                onClick={() => setShowThumbnails(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {pages.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => goToPage(idx)}
                  className={`relative group transition-all ${
                    idx === currentPage
                      ? 'ring-2 ring-indigo-500 scale-105'
                      : 'hover:ring-2 hover:ring-gray-500'
                  }`}
                >
                  <img
                    src={page}
                    alt={`Page ${idx + 1}`}
                    className="w-full aspect-[3/4] object-cover rounded shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold">{idx + 1}</span>
                  </div>
                  {bookmarks.has(idx) && (
                    <div className="absolute top-1 right-1">
                      <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 閱讀區域 */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-2 md:p-8 relative overflow-hidden"
        style={{
          marginLeft: showThumbnails ? '256px' : '0',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <div 
          className={`relative transition-all ${isFlipping ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            transitionDuration: '500ms',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          <img
            src={pages[currentPage]}
            alt={`Page ${currentPage + 1}`}
            className="max-w-full max-h-[75vh] md:max-h-[80vh] rounded-lg shadow-2xl"
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)'
            }}
          />
          {/* Page indicator on image */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentPage + 1} / {pages.length}
          </div>
        </div>
      </div>

      {/* 底部控制列 */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto gap-2 md:gap-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 0 || isFlipping}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed text-sm md:text-base shadow-lg flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">上一頁</span>
          </button>

          <div className="text-white text-sm md:text-lg font-semibold text-center flex-1">
            <span className="block sm:hidden">{currentPage + 1}/{pages.length}</span>
            <span className="hidden sm:block">第 {currentPage + 1} / {pages.length} 頁</span>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === pages.length - 1 || isFlipping}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed text-sm md:text-base shadow-lg flex-shrink-0"
          >
            <span className="hidden sm:inline">下一頁</span>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* 縮圖預覽輪播（底部） - 僅桌面版顯示 */}
        {!showThumbnails && (
          <div className="mt-3 md:mt-4 hidden md:flex gap-2 overflow-x-auto pb-2">
            {pages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => goToPage(idx)}
                className={`relative flex-shrink-0 border-2 rounded transition-all ${
                  idx === currentPage
                    ? 'border-indigo-500 scale-110 shadow-lg'
                    : 'border-gray-600 hover:border-gray-400 hover:scale-105'
                }`}
              >
                <img
                  src={page}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-12 h-16 object-cover rounded"
                />
                {bookmarks.has(idx) && (
                  <div className="absolute -top-1 -right-1">
                    <BookmarkCheck className="w-3 h-3 text-yellow-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
