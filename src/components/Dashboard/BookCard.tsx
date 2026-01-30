import { motion } from 'framer-motion'
import { Eye, Trash2, Share2, BookOpen } from 'lucide-react'
import { Book } from '../../types'

interface BookCardProps {
  book: Book
  index: number
  onRead: (bookId: string) => void
  onDelete: (bookId: string) => void
  onShare: (book: Book) => void
}

export default function BookCard({ book, index, onRead, onDelete, onShare }: BookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="glass-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-primary-100 to-accent-100 overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-primary-300" />
          </div>
        )}
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRead(book.id)}
              className="flex-1 bg-white/90 backdrop-blur-sm text-slate-800 px-4 py-2 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-white transition-colors"
            >
              <Eye className="w-4 h-4" />
              閱讀
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onShare(book)}
              className="bg-white/90 backdrop-blur-sm text-slate-800 p-2 rounded-xl hover:bg-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Page Count Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-slate-700">
          {book.total_pages} 頁
        </div>
      </div>

      {/* Book Info */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {book.title}
        </h3>
        {book.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {book.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{new Date(book.created_at).toLocaleDateString('zh-TW')}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(book.id)}
            className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
