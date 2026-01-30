import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize,
  Grid3x3,
  Bookmark,
  Home
} from 'lucide-react'
import { dbHelpers } from '../../lib/supabase'
import { Book, BookPage } from '../../types'
import Loading from '../UI/Loading'

export default function Reader() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()

  const [book, setBook] = useState<Book | null>(null)
  const [pages, setPages] = useState<BookPage[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set())
  const [_isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    loadBook()
    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem(`bookmarks-${bookId}`)
    if (savedBookmarks) {
      setBookmarks(new Set(JSON.parse(savedBookmarks)))
    }

    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage()
      if (e.key === 'ArrowLeft') previousPage()
      if (e.key === 'b' || e.key === 'B') toggleBookmark()
      if (e.key === 't' || e.key === 'T') setShowThumbnails(prev => !prev)
      if (e.key === 'Escape') setShowThumbnails(false)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [bookId])

  const loadBook = async () => {
    if (!bookId) return

    try {
      setLoading(true)
      const [bookData, pagesData] = await Promise.all([
        dbHelpers.getBook(bookId),
        dbHelpers.getBookPages(bookId),
      ])

      setBook(bookData)
      setPages(pagesData)
    } catch (error) {
      console.error('載入書籍失敗:', error)
      toast.error('載入書籍失敗')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const nextPage = useCallback(() => {
    if (currentPage < pages.length) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(prev => prev + 1)
        setIsTransitioning(false)
      }, 300)
    }
  }, [currentPage, pages.length])

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(prev => prev - 1)
        setIsTransitioning(false)
      }, 300)
    }
  }, [currentPage])

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= pages.length) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage(pageNumber)
        setIsTransitioning(false)
        setShowThumbnails(false)
      }, 300)
    }
  }

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200))
  }

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50))
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const toggleBookmark = () => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev)
      if (newBookmarks.has(currentPage)) {
        newBookmarks.delete(currentPage)
        toast.info('已移除書籤')
      } else {
        newBookmarks.add(currentPage)
        toast.success('已加入書籤')
      }
      localStorage.setItem(`bookmarks-${bookId}`, JSON.stringify([...newBookmarks]))
      return newBookmarks
    })
  }

  if (loading || !book) {
    return <Loading message="正在載入電子書..." />
  }

  const currentPageData = pages[currentPage - 1]

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass-dark px-6 py-4 flex items-center justify-between border-b border-slate-700/30"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-white"
          >
            <Home className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold text-white">{book.title}</h1>
            <p className="text-sm text-slate-400">
              第 {currentPage} 頁 / 共 {pages.length} 頁
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={zoomOut}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-white"
            title="縮小"
          >
            <ZoomOut className="w-5 h-5" />
          </motion.button>
          
          <div className="px-3 py-1 bg-slate-700/50 rounded-lg text-white text-sm min-w-[60px] text-center">
            {zoom}%
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={zoomIn}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-white"
            title="放大"
          >
            <ZoomIn className="w-5 h-5" />
          </motion.button>

          <div className="w-px h-6 bg-slate-700" />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleBookmark}
            className={`p-2 hover:bg-slate-700/50 rounded-lg transition-colors ${
              bookmarks.has(currentPage) ? 'text-yellow-400' : 'text-white'
            }`}
            title="書籤"
          >
            <Bookmark className="w-5 h-5" fill={bookmarks.has(currentPage) ? 'currentColor' : 'none'} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-white"
            title="縮圖"
          >
            <Grid3x3 className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-white"
            title="全螢幕"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        {/* Page Navigation - Left */}
        <motion.button
          whileHover={{ scale: 1.2, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={previousPage}
          disabled={currentPage === 1}
          className={`p-4 rounded-full bg-slate-800/80 backdrop-blur-sm text-white shadow-2xl transition-opacity ${
            currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <ChevronLeft className="w-8 h-8" />
        </motion.button>

        {/* Page View */}
        <div className="flex-1 flex items-center justify-center mx-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="relative"
              style={{
                maxWidth: `${zoom}%`,
                maxHeight: `${zoom}%`,
              }}
            >
              <img
                src={currentPageData.image_url}
                alt={`第 ${currentPage} 頁`}
                className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-2xl"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Page Navigation - Right */}
        <motion.button
          whileHover={{ scale: 1.2, x: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextPage}
          disabled={currentPage === pages.length}
          className={`p-4 rounded-full bg-slate-800/80 backdrop-blur-sm text-white shadow-2xl transition-opacity ${
            currentPage === pages.length ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <ChevronRight className="w-8 h-8" />
        </motion.button>
      </div>

      {/* Thumbnail Sidebar */}
      <AnimatePresence>
        {showThumbnails && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-80 glass-dark border-l border-slate-700/30 overflow-y-auto p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">所有頁面</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowThumbnails(false)}
                className="p-1 hover:bg-slate-700/50 rounded-lg text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {pages.map((page) => (
                <motion.div
                  key={page.page_number}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(page.page_number)}
                  className={`
                    relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                    ${page.page_number === currentPage 
                      ? 'border-primary-500 shadow-lg shadow-primary-500/30' 
                      : 'border-slate-700 hover:border-slate-600'}
                  `}
                >
                  <img
                    src={page.image_url}
                    alt={`頁面 ${page.page_number}`}
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="flex items-center justify-between text-white text-xs">
                      <span>第 {page.page_number} 頁</span>
                      {bookmarks.has(page.page_number) && (
                        <Bookmark className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Progress */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          style={{ width: `${(currentPage / pages.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}
