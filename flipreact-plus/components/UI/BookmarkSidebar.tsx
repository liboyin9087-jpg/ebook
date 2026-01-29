import React from 'react';
import { Trash2, Bookmark } from '../Icons';

interface BookmarkSidebarProps {
  isOpen: boolean;
  bookmarks: number[];
  onPageSelect: (index: number) => void;
  onRemoveBookmark: (index: number) => void;
  onClose: () => void;
}

export const BookmarkSidebar: React.FC<BookmarkSidebarProps> = ({ 
  isOpen, 
  bookmarks, 
  onPageSelect,
  onRemoveBookmark,
  onClose
}) => {
  // Sort bookmarks numerically
  const sortedBookmarks = [...bookmarks].sort((a, b) => a - b);

  return (
    <div 
      className={`absolute left-0 top-0 bottom-16 bg-gray-900/95 border-r border-gray-800 w-64 transform transition-transform duration-300 z-40 backdrop-blur-sm ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Bookmark size={16} className="text-brand-500" />
          Bookmarks
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-2">
        {sortedBookmarks.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8 italic">
            No bookmarks yet.<br/>Click the bookmark icon to add one.
          </div>
        ) : (
          sortedBookmarks.map((pageIndex) => (
            <div 
              key={pageIndex}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-transparent hover:border-brand-500/30 group transition-all"
            >
              <button 
                onClick={() => onPageSelect(pageIndex)}
                className="flex-1 text-left"
              >
                <span className="text-sm text-gray-300 group-hover:text-brand-400 font-mono">
                  Page {pageIndex + 1}
                </span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBookmark(pageIndex);
                }}
                className="text-gray-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove bookmark"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};