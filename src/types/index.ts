// Database types
export interface Book {
  id: string
  title: string
  description?: string
  total_pages: number
  cover_url?: string
  created_at: string
  updated_at?: string
}

export interface BookPage {
  id: string
  book_id: string
  page_number: number
  image_url: string
  created_at: string
}

export interface Bookmark {
  bookId: string
  pageNumber: number
}

// Upload types
export interface UploadProgress {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

// Reader types
export interface ReaderConfig {
  zoom: number
  fullscreen: boolean
  showThumbnails: boolean
}

// Component prop types
export interface BookCardProps {
  book: Book
  onRead: (bookId: string) => void
  onDelete: (bookId: string) => void
}

export interface ReaderControlsProps {
  currentPage: number
  totalPages: number
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onPreviousPage: () => void
  onNextPage: () => void
  onToggleThumbnails: () => void
  onToggleBookmark: () => void
  onToggleFullscreen: () => void
  isBookmarked: boolean
  showThumbnails: boolean
  isFullscreen: boolean
}

export interface ThumbnailGridProps {
  pages: BookPage[]
  currentPage: number
  onPageSelect: (pageNumber: number) => void
}

export interface PageViewerProps {
  pages: BookPage[]
  currentPage: number
  zoom: number
  onPageChange: (pageNumber: number) => void
}

// Utility types
export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface NotificationOptions {
  type: NotificationType
  message: string
  duration?: number
}
