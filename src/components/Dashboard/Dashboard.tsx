import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { BookOpen, Upload, Share2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { dbHelpers, storageHelpers, STORAGE_BUCKETS } from '../../lib/supabase'
import { PDFProcessor } from '../../utils/pdfProcessor'
import { Book } from '../../types'
import Loading from '../UI/Loading'
import UploadModal from './UploadModal'
import BookCard from './BookCard'

export default function Dashboard() {
  const navigate = useNavigate()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [shareBook, setShareBook] = useState<Book | null>(null)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const data = await dbHelpers.getAllBooks()
      setBooks(data)
    } catch (error) {
      console.error('載入書籍失敗:', error)
      toast.error('載入書籍列表失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (files: File[]) => {
    try {
      for (const file of files) {
        if (file.type === 'application/pdf') {
          await uploadPDF(file)
        } else if (file.type.startsWith('image/')) {
          await uploadImages([file])
        }
      }
      await loadBooks()
      setShowUploadModal(false)
      toast.success('上傳成功!')
    } catch (error) {
      console.error('上傳失敗:', error)
      toast.error('上傳失敗,請稍後再試')
    }
  }

  const uploadPDF = async (file: File) => {
    const metadata = await PDFProcessor.getPDFMetadata(file)
    
    // Convert PDF to images
    const pages = await PDFProcessor.convertPDFToImages(file, (current, total) => {
      console.log(`轉換進度: ${current}/${total}`)
    })

    // Create book record
    const book = await dbHelpers.insertBook({
      title: metadata.title || file.name,
      description: `作者: ${metadata.author || '未知'}`,
      total_pages: pages.length,
    })

    // Upload pages to storage
    const pageRecords = []
    for (const page of pages) {
      const path = `${book.id}/page-${page.pageNumber}.jpg`
      await storageHelpers.uploadFile(STORAGE_BUCKETS.EBOOK_PAGES, path, page.imageBlob)
      const imageUrl = storageHelpers.getPublicUrl(STORAGE_BUCKETS.EBOOK_PAGES, path)
      
      pageRecords.push({
        book_id: book.id,
        page_number: page.pageNumber,
        image_url: imageUrl,
      })
    }

    // Insert page records
    await dbHelpers.insertBookPages(pageRecords)

    // Update cover URL
    // Note: You would need to add an update function to dbHelpers
  }

  const uploadImages = async (files: File[]) => {
    // Create book record
    const book = await dbHelpers.insertBook({
      title: `電子書 ${new Date().toLocaleDateString()}`,
      total_pages: files.length,
    })

    // Upload images
    const pageRecords = []
    for (let i = 0; i < files.length; i++) {
      const path = `${book.id}/page-${i + 1}.jpg`
      await storageHelpers.uploadFile(STORAGE_BUCKETS.EBOOK_PAGES, path, files[i])
      const imageUrl = storageHelpers.getPublicUrl(STORAGE_BUCKETS.EBOOK_PAGES, path)
      
      pageRecords.push({
        book_id: book.id,
        page_number: i + 1,
        image_url: imageUrl,
      })
    }

    await dbHelpers.insertBookPages(pageRecords)
  }

  const handleDelete = async (bookId: string) => {
    if (!confirm('確定要刪除這本書嗎?')) return

    try {
      // Get all pages to delete storage files
      const pages = await dbHelpers.getBookPages(bookId)
      const paths = pages.map(p => {
        const url = new URL(p.image_url)
        return url.pathname.split('/').slice(-2).join('/')
      })

      // Delete from storage
      await storageHelpers.deleteFiles(STORAGE_BUCKETS.EBOOK_PAGES, paths)

      // Delete from database
      await dbHelpers.deleteBookPages(bookId)
      await dbHelpers.deleteBook(bookId)

      await loadBooks()
      toast.success('刪除成功')
    } catch (error) {
      console.error('刪除失敗:', error)
      toast.error('刪除失敗,請稍後再試')
    }
  }

  const handleRead = (bookId: string) => {
    navigate(`/read/${bookId}`)
  }

  const handleShare = (book: Book) => {
    setShareBook(book)
  }

  const copyShareLink = () => {
    if (shareBook) {
      const url = `${window.location.origin}/read/${shareBook.id}`
      navigator.clipboard.writeText(url)
      toast.success('連結已複製到剪貼簿')
    }
  }

  if (loading) {
    return <Loading message="載入書籍庫中..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b border-white/20 shadow-lg">
        <div className="page-container">
          <div className="flex items-center justify-between py-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  FlipReact Plus
                </h1>
                <p className="text-sm text-slate-600 font-medium">專業電子書閱讀平台</p>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              <span>上傳電子書</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-container py-12">
        {books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="p-8 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
              <BookOpen className="w-24 h-24 text-primary-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
                還沒有電子書
              </h2>
              <p className="text-slate-600 text-center mb-6">
                開始上傳您的第一本電子書,打造專屬的數位書庫
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary mx-auto flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>立即上傳</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                index={index}
                onRead={handleRead}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}

      {/* Share Modal */}
      {shareBook && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShareBook(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-8 rounded-3xl max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              分享電子書
            </h3>
            
            <div className="bg-white p-6 rounded-2xl mb-6">
              <QRCodeSVG
                value={`${window.location.origin}/read/${shareBook.id}`}
                size={200}
                className="mx-auto"
                level="H"
              />
            </div>

            <p className="text-sm text-slate-600 mb-4 text-center">
              掃描 QR Code 或複製連結即可開始閱讀
            </p>

            <div className="flex gap-3">
              <button
                onClick={copyShareLink}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                <span>複製連結</span>
              </button>
              <button
                onClick={() => setShareBook(null)}
                className="btn-secondary"
              >
                關閉
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
