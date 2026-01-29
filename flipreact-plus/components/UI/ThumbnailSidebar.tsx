import React from 'react';
import { PageData } from '../../types';

interface ThumbnailSidebarProps {
  isOpen: boolean;
  currentPage: number;
  pages: PageData[];
  onPageSelect: (index: number) => void;
  onClose: () => void;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({ 
  isOpen, 
  currentPage, 
  pages,
  onPageSelect,
  onClose
}) => {
  return (
    <div 
      className={`absolute left-0 top-0 bottom-16 bg-gray-900/95 border-r border-gray-800 w-64 transform transition-transform duration-300 z-40 backdrop-blur-sm ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-white font-semibold">Pages</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-4">
        {pages.map((page) => (
          <div 
            key={page.index}
            onClick={() => onPageSelect(page.index)}
            className={`cursor-pointer group flex flex-col gap-2 ${currentPage === page.index ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            <div className={`relative aspect-[1/1.4] w-full rounded overflow-hidden border-2 ${currentPage === page.index ? 'border-brand-500' : 'border-transparent group-hover:border-gray-600'}`}>
              <img 
                src={page.contentUrl} 
                alt={`Thumbnail ${page.index}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <span className={`text-xs text-center ${currentPage === page.index ? 'text-brand-400' : 'text-gray-500'}`}>
              Page {page.index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};