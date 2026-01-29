import { PageData, BookData } from './types';

export const APP_CONFIG = {
  ASPECT_RATIO: 1.414, // Standard A4 ratio (Height / Width)
};

// Helper to generate a mock book
const generateMockPages = (count: number, seed: number): PageData[] => {
  const pages = Array.from({ length: count }, (_, i) => ({
    index: i,
    type: (i === 0 || i === count - 1) ? 'cover' as const : 'content' as const,
    contentUrl: `https://picsum.photos/600/850?random=${seed * 100 + i}${i > 0 && i < count - 1 ? '&grayscale' : ''}`,
  }));
  return pages;
};

export const SAMPLE_LIBRARY: BookData[] = [
  {
    id: 'book-1',
    title: 'Modern Web Development',
    description: 'A comprehensive guide to React and Tailwind CSS.',
    coverUrl: 'https://picsum.photos/600/850?random=100',
    pages: generateMockPages(12, 1)
  },
  {
    id: 'book-2',
    title: 'Nature Photography',
    description: 'A collection of stunning landscapes from around the world.',
    coverUrl: 'https://picsum.photos/600/850?random=200',
    pages: generateMockPages(8, 2)
  },
  {
    id: 'book-3',
    title: 'Minimalist Architecture',
    description: 'Exploring space and light in modern structures.',
    coverUrl: 'https://picsum.photos/600/850?random=300',
    pages: generateMockPages(10, 3)
  }
];

// Initial default
export const DEFAULT_BOOK = SAMPLE_LIBRARY[0];
