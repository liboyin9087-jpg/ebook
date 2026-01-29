import React from 'react';
import { PageSheet } from './PageSheet';
import { PageData, ViewState } from '../../types';

interface BookContainerProps {
  viewState: ViewState;
  pages: PageData[];
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
}

export const BookContainer: React.FC<BookContainerProps> = ({ viewState, pages, setViewState }) => {
  // We divide total pages by 2 to get number of "Sheets"
  const totalSheets = Math.ceil(pages.length / 2);

  const calculateZIndex = (sheetIndex: number, currentSheetIndex: number) => {
    // Simple logic: The pages closer to the "open" spread should be on top.
    const distance = Math.abs(sheetIndex - currentSheetIndex);
    return 100 - distance; 
  };

  // Current Sheet Index represents which sheet is currently "Active" on the right.
  const currentSheetIndex = Math.floor(viewState.currentPage / 2);

  // Safety check for empty book
  if (pages.length === 0) return null;

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
      style={{ 
        transform: `scale(${viewState.scale})`,
        willChange: 'transform',
      }}
    >
      {/* The Book Stage */}
      <div 
        className="relative perspective-2000"
        style={{ 
          width: 'min(90vw, 1200px)', 
          height: 'min(85vh, 800px)',
          aspectRatio: '1.5', // Aspect ratio for double spread
        }}
      >
        {/* Placeholder for the left side base (Back Cover context) */}
        <div className="absolute left-0 top-0 w-1/2 h-full bg-white shadow-2xl rounded-l-sm" />
        {/* Placeholder for the right side base (Front Cover context) */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-white shadow-2xl rounded-r-sm" />

        {/* Render Sheets */}
        {Array.from({ length: totalSheets }).map((_, i) => {
          const frontPage = pages[i * 2];
          // Handle case where we have odd number of pages (last page back is blank/cover)
          const backPage = pages[i * 2 + 1] || { 
            index: -1, 
            contentUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Transparent 
            type: 'content' 
          }; 

          // Determine flip state
          const isFlipped = i < currentSheetIndex;
          
          return (
            <PageSheet
              key={i}
              pageIndex={i}
              frontData={frontPage}
              backData={backPage}
              flipState={isFlipped ? -180 : 0}
              zIndex={calculateZIndex(i, currentSheetIndex)}
            />
          );
        })}
      </div>
    </div>
  );
};