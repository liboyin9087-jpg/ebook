import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BookContainer } from './components/Book/BookContainer';
import { Toolbar } from './components/UI/Toolbar';
import { ThumbnailSidebar } from './components/UI/ThumbnailSidebar';
import { BookmarkSidebar } from './components/UI/BookmarkSidebar';
import { LibraryModal } from './components/UI/LibraryModal';
import { Loader } from './components/UI/Loader';
import { ViewState, PageData } from './types';
import { DEFAULT_BOOK } from './constants';

const App: React.FC = () => {
  // Application Data State
  const [pages, setPages] = useState<PageData[]>(DEFAULT_BOOK.pages);
  const [bookTitle, setBookTitle] = useState<string>(DEFAULT_BOOK.title);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // View State (Scale defaults to 1.0 = 100%)
  const [viewState, setViewState] = useState<ViewState>({
    currentPage: 0,
    totalPages: DEFAULT_BOOK.pages.length,
    scale: 1, 
    showThumbnails: false,
    showBookmarks: false,
    showLibrary: false,
    isFullscreen: false,
  });

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('flipbook_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load bookmarks", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('flipbook_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle Resize with debounce for better performance
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      
      resizeTimerRef.current = setTimeout(() => {
        const width = window.innerWidth;
        // If mobile, we must scale down to fit the double spread or single page
        if (width < 768) {
          setViewState(prev => ({ ...prev, scale: 0.6 }));
        } else if (width < 1024) {
          // On tablet, maybe slight reduction
          setViewState(prev => ({ ...prev, scale: 0.8 }));
        } else {
          // On desktop, keep default 100% (scale 1) unless user changed it
          setViewState(prev => {
               if (prev.scale < 1) return { ...prev, scale: 1 };
               return prev;
          });
        }
      }, 150); // Debounce 150ms
    };
    
    // Initial check
    handleResize(); 
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, []);

  // Update total pages when content changes
  useEffect(() => {
    setViewState(prev => ({ ...prev, totalPages: pages.length, currentPage: 0 }));
    // Clear bookmarks on book change to avoid index mismatches
    setBookmarks([]);
  }, [pages]);

  // Action Handler
  const handleAction = useCallback((action: string, payload?: any) => {
    setViewState(prev => {
      switch (action) {
        case 'next':
          return { ...prev, currentPage: Math.min(prev.totalPages - 1, prev.currentPage + 2) };
        case 'prev':
          return { ...prev, currentPage: Math.max(0, prev.currentPage - 2) };
        case 'zoomIn':
          return { ...prev, scale: Math.min(2, prev.scale + 0.1) };
        case 'zoomOut':
          return { ...prev, scale: Math.max(0.5, prev.scale - 0.1) };
        case 'toggleThumbnails':
          return { ...prev, showThumbnails: !prev.showThumbnails, showBookmarks: false, showLibrary: false };
        case 'toggleBookmarksList':
          return { ...prev, showBookmarks: !prev.showBookmarks, showThumbnails: false, showLibrary: false };
        case 'toggleLibrary':
          return { ...prev, showLibrary: !prev.showLibrary, showThumbnails: false, showBookmarks: false };
        case 'jumpTo':
          const target = payload as number;
          const normalizedTarget = target % 2 === 0 ? target : target - 1;
          return { ...prev, currentPage: normalizedTarget };
        default:
          return prev;
      }
    });

    if (action === 'toggleBookmarkCurrent') {
      setViewState(currentState => {
        const pageToBookmark = currentState.currentPage;
        setBookmarks(currentBookmarks => {
          if (currentBookmarks.includes(pageToBookmark)) {
             return currentBookmarks.filter(b => b !== pageToBookmark);
          } else {
             return [...currentBookmarks, pageToBookmark];
          }
        });
        return currentState;
      });
    } else if (action === 'removeBookmark') {
      const indexToRemove = payload as number;
      setBookmarks(prev => prev.filter(b => b !== indexToRemove));
    }
  }, []);

  // Handle Book Selection from Library or Upload
  const handleLoadBook = (newPages: PageData[], title: string) => {
    setPages(newPages);
    setBookTitle(title);
    setViewState(prev => ({
        ...prev, 
        currentPage: 0, 
        totalPages: newPages.length,
        showLibrary: false
    }));
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleAction('next');
      if (e.key === 'ArrowLeft') handleAction('prev');
      if (e.key === 'Escape') setViewState(prev => ({ ...prev, showThumbnails: false, showBookmarks: false, showLibrary: false }));
      if (e.key === 'b' || e.key === 'B') handleAction('toggleBookmarkCurrent');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction]);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 overflow-hidden relative font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black opacity-80 pointer-events-none" />
      
      {isLoading && <Loader />}
      
      <div className="flex-1 relative overflow-hidden flex flex-col">
        
        <ThumbnailSidebar 
          isOpen={viewState.showThumbnails}
          currentPage={viewState.currentPage}
          pages={pages}
          onPageSelect={(index) => handleAction('jumpTo', index)}
          onClose={() => handleAction('toggleThumbnails')}
        />

        <BookmarkSidebar 
          isOpen={viewState.showBookmarks}
          bookmarks={bookmarks}
          onPageSelect={(index) => handleAction('jumpTo', index)}
          onRemoveBookmark={(index) => handleAction('removeBookmark', index)}
          onClose={() => handleAction('toggleBookmarksList')}
        />

        <LibraryModal 
          isOpen={viewState.showLibrary}
          onSelectBook={handleLoadBook}
          onClose={() => handleAction('toggleLibrary')}
        />

        <main className="flex-1 w-full h-full relative z-10 p-4 lg:p-10">
           <BookContainer 
             viewState={viewState}
             pages={pages}
             setViewState={setViewState}
           />
        </main>
      </div>

      <Toolbar 
        viewState={viewState}
        bookmarks={bookmarks}
        bookTitle={bookTitle}
        onAction={handleAction}
      />
    </div>
  );
};

export default App;