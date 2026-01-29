export interface BookConfig {
  title: string;
  totalPageCount: number;
  allowZoom: boolean;
  theme: 'light' | 'dark';
}

export interface PageData {
  index: number;
  contentUrl: string; // URL to image or PDF page
  type: 'cover' | 'content';
}

export interface BookData {
  id: string;
  title: string;
  coverUrl: string;
  pages: PageData[];
  description?: string;
}

export enum FlipDirection {
  NEXT = 'next',
  PREV = 'prev'
}

export interface ViewState {
  currentPage: number; // The index of the page currently on the Right side (or single view)
  totalPages: number;
  scale: number;
  showThumbnails: boolean;
  showBookmarks: boolean;
  showLibrary: boolean;
  isFullscreen: boolean;
}