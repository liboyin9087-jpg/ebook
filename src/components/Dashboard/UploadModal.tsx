import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image as ImageIcon, Check } from 'lucide-react'

interface UploadModalProps {
  onClose: () => void
  onUpload: (files: File[]) => Promise<void>
}

export default function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    },
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    try {
      setUploading(true)
      setProgress(0)

      // Simulate progress (in real implementation, track actual upload progress)
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      await onUpload(files)
      
      setProgress(100)
      clearInterval(interval)
      
      // Close modal after successful upload
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error('Upload error:', error)
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">上傳電子書</h2>
            <p className="text-sm text-slate-600 mt-1">
              支援 PDF 檔案或多張圖片
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </motion.button>
        </div>

        {/* Dropzone */}
        {!uploading && (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-300
              ${isDragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'}
            `}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? 'text-primary-500' : 'text-slate-400'}`} />
              <p className="text-lg font-medium text-slate-700 mb-2">
                {isDragActive ? '放開檔案以上傳' : '拖放檔案到這裡'}
              </p>
              <p className="text-sm text-slate-500">
                或點擊選擇檔案
              </p>
            </motion.div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && !uploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <h3 className="font-medium text-slate-700">已選擇的檔案 ({files.length})</h3>
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-slate-200"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  {file.type === 'application/pdf' ? (
                    <FileText className="w-5 h-5 text-primary-600" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-primary-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-3">
                <Upload className="w-8 h-8 text-primary-600 animate-bounce" />
              </div>
              <p className="font-medium text-slate-700">正在上傳...</p>
              <p className="text-sm text-slate-500 mt-1">{progress}%</p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Actions */}
        {!uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 mt-8"
          >
            <button
              onClick={handleUpload}
              disabled={files.length === 0}
              className={`
                flex-1 btn-primary flex items-center justify-center gap-2
                ${files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Check className="w-5 h-5" />
              <span>開始上傳</span>
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              取消
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
