import React from 'react';
import { ViewState } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Bookmark,
  Library
} from '../Icons';

interface ToolbarProps {
  viewState: ViewState;
  bookmarks: number[];
  bookTitle: string;
  onAction: (action: string, payload?: any) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ viewState, bookmarks, bookTitle, onAction }) => {
  const isCurrentPageBookmarked = bookmarks.includes(viewState.currentPage);

  return (
    <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4 lg:px-8 shadow-lg relative z-50">
      {/* Left Group: Library & Thumbnails */}
      <div className="flex items-center space-x-2">
         <button 
          onClick={() => onAction('toggleLibrary')}
          className={`p-2 rounded-lg transition-all duration-200 mr-2 hover:scale-110 active:scale-95 ${viewState.showLibrary ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          title="Open Library"
        >
          <Library size={20} />
        </button>

        <div className="h-6 w-px bg-gray-700 mx-2" />

        <button 
          onClick={() => onAction('toggleThumbnails')}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${viewState.showThumbnails ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          title="Page Thumbnails"
        >
          <Grid size={20} />
        </button>
        <button 
          onClick={() => onAction('toggleBookmarksList')}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${viewState.showBookmarks ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          title="View Bookmarks"
        >
          <Bookmark size={20} className={bookmarks.length > 0 ? "fill-current" : ""} />
        </button>
      </div>

      {/* Center Group: Navigation */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-1 max-w-[200px] truncate hidden md:block">{bookTitle}</span>
        <div className="flex items-center space-x-2 bg-gray-800 rounded-full px-4 py-1.5">
          <button 
            onClick={() => onAction('prev')}
            disabled={viewState.currentPage === 0}
            className="p-1 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-125 active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="px-4 font-mono text-sm text-brand-400 min-w-[80px] text-center select-none">
            {viewState.currentPage + 1} <span className="text-gray-500">/</span> {viewState.totalPages}
          </div>

          <button 
            onClick={() => onAction('next')}
            disabled={viewState.currentPage >= viewState.totalPages - 1}
            className="p-1 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-125 active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Right Group: Zoom */}
      <div className="flex items-center space-x-2">
        <button 
            onClick={() => onAction('toggleBookmarkCurrent')}
            className={`p-2 rounded-lg transition-all duration-200 mr-2 hover:scale-110 active:scale-95 ${isCurrentPageBookmarked ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            title={isCurrentPageBookmarked ? "Remove Bookmark" : "Bookmark this Page"}
          >
            <Bookmark size={20} className={isCurrentPageBookmarked ? "fill-current" : ""} />
        </button>

        <div className="h-6 w-px bg-gray-700 mx-2" />

        <button 
          onClick={() => onAction('zoomOut')}
          className="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <span className="text-xs text-gray-500 font-mono w-12 text-center select-none">
          {Math.round(viewState.scale * 100)}%
        </span>
        <button 
          onClick={() => onAction('zoomIn')}
          className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
      </div>
    </div>
  );
};