import React from 'react';
import { motion } from 'framer-motion';
import { PageData } from '../../types';

interface PageSheetProps {
  pageIndex: number; // The logical index (0, 1, 2...)
  frontData: PageData;
  backData: PageData;
  flipState: number; // 0 (flat), -180 (flipped left)
  zIndex: number;
  onFlipComplete?: () => void;
}

/**
 * A PageSheet represents a physical piece of paper.
 * It has a FRONT (odd index usually) and a BACK (even index).
 * In 3D space, it rotates around the Y axis (spine).
 */
export const PageSheet: React.FC<PageSheetProps> = ({
  pageIndex,
  frontData,
  backData,
  flipState,
  zIndex,
}) => {
  // Logic: 
  // If we are pageIndex 0 (Cover), Front is Cover, Back is Page 1.
  // If we are pageIndex 1 (Physical Sheet 2), Front is Page 2, Back is Page 3.
  
  return (
    <motion.div
      className="absolute top-0 left-1/2 w-1/2 h-full origin-left preserve-3d"
      style={{ 
        zIndex,
        width: 'calc(50% - 1px)', // Slight gap for spine
        willChange: 'transform',
      }}
      animate={{ rotateY: flipState }}
      transition={{ 
        duration: 0.7,
        ease: [0.43, 0.13, 0.23, 0.96], // Smoother easing for realistic paper flip
        type: "spring",
        stiffness: 80,
        damping: 20,
      }}
      initial={false}
    >
      {/* FRONT OF THE SHEET (Right Side Page) */}
      <div 
        className="absolute inset-0 backface-hidden bg-white shadow-page-right border-l border-gray-200 overflow-hidden"
      >
        <div className="w-full h-full relative">
          <img 
            src={frontData.contentUrl} 
            alt={`Page ${frontData.index}`}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="lazy"
            decoding="async"
            onLoad={(e) => e.currentTarget.style.opacity = '1'}
            style={{ opacity: 0 }}
          />
          <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono bg-white/80 px-2 rounded">
             {frontData.index + 1}
          </div>
          {/* Gradient overlay for spine depth */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* BACK OF THE SHEET (Left Side Page) */}
      <div 
        className="absolute inset-0 backface-hidden rotate-y-180 bg-white shadow-page-left border-r border-gray-200 overflow-hidden"
      >
        <div className="w-full h-full relative">
          <img 
            src={backData.contentUrl} 
            alt={`Page ${backData.index}`}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="lazy"
            decoding="async"
            onLoad={(e) => e.currentTarget.style.opacity = '1'}
            style={{ opacity: 0 }}
          />
          <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono bg-white/80 px-2 rounded">
             {backData.index + 1}
          </div>
          {/* Gradient overlay for spine depth */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
};
