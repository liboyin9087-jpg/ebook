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
      className={`absolute left-0 top-0 bottom-16 bg-gray-900/95 border-r border-gray-800 w-64 transform transition-all duration-300 ease-in-out z-40 backdrop-blur-sm shadow-2xl ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
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
            className={`cursor-pointer group flex flex-col gap-2 transition-all duration-200 ${currentPage === page.index ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
          >
            <div className={`relative aspect-[1/1.4] w-full rounded overflow-hidden border-2 transition-all duration-200 ${currentPage === page.index ? 'border-brand-500 shadow-lg shadow-brand-500/50' : 'border-transparent group-hover:border-gray-600 group-hover:shadow-lg'}`}>
              <img 
                src={page.contentUrl} 
                alt={`Thumbnail ${page.index}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
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