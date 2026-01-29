import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Upload, BookOpen, Link2, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../src/lib/supabase';
import type { Book } from '../../src/lib/supabase';

interface BookDisplay extends Book {
  pages?: string[];
}

export const Dashboard: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [books, setBooks] = useState<BookDisplay[]>([]);
  const [share, setShare] = useState<{ url: string; bookId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 從 Supabase 載入已上傳的電子書
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBooks(data || []);
    } catch (e) {
      console.error('Failed to load books', e);
    }
  };

  const handleUpload = async () => {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) {
      setError('請選擇檔案');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const bookId = `book-${Date.now()}`;
      const fileName = files[0].name.replace(/\.[^/.]+$/, '');

      // 1. 建立書本記錄
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .insert({
          id: bookId,
          title: fileName,
          page_count: files.length,
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // 2. 上傳每個頁面檔案到 Supabase Storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `${bookId}/page-${i}`;
        
        const { error: uploadError } = await supabase.storage
          .from('ebook-pages')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // 3. 建立頁面記錄
        const { error: pageError } = await supabase
          .from('book_pages')
          .insert({
            book_id: bookId,
            page_number: i,
            file_path: filePath,
          });

        if (pageError) throw pageError;
      }

      // 重新載入書本列表
      await fetchBooks();

      // 產生分享連結
      const url = `${window.location.origin}/book/${bookId}`;
      setShare({ url, bookId });

      // 清空檔案選擇
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: any) {
      setError(e.message || '上傳失敗');
      console.error('Upload error:', e);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此電子書嗎？')) return;
    
    try {
      // 1. 刪除 Storage 中的檔案
      const { data: pages } = await supabase
        .from('book_pages')
        .select('file_path')
        .eq('book_id', id);

      if (pages) {
        const filePaths = pages.map(p => p.file_path);
        await supabase.storage.from('ebook-pages').remove(filePaths);
      }

      // 2. 刪除頁面記錄
      await supabase.from('book_pages').delete().eq('book_id', id);

      // 3. 刪除書本記錄
      await supabase.from('books').delete().eq('id', id);

      // 重新載入列表
      await fetchBooks();
      if (share?.bookId === id) setShare(null);
    } catch (e: any) {
      alert('刪除失敗：' + e.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已複製連結！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* 標題區 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            電子書管理平台
          </h1>
          <p className="text-gray-600">上傳 PDF 或圖片，立即產生專屬分享連結與 QR Code</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 上傳區塊 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
              <Upload className="w-6 h-6 text-indigo-600" />
              上傳電子書
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-indigo-200 rounded-xl p-6 hover:border-indigo-400 transition-colors bg-indigo-50/30">
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  multiple
                />
              </div>

              <button
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? '上傳中...' : '開始上傳'}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {share && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mt-6">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    分享連結
                  </h3>
                  <div className="bg-white rounded-lg p-3 mb-3 break-all text-sm border border-green-200">
                    <a href={share.url} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {share.url}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(share.url)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors mb-4"
                  >
                    複製連結
                  </button>
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-md">
                      <QRCode value={share.url} size={160} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 電子書列表 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              已上傳電子書 ({books.length})
            </h2>

            {books.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>尚未上傳任何電子書</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate mb-1">{book.title}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(book.created_at).toLocaleString('zh-TW')} · {book.page_count} 頁
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`/book/${book.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          title="閱讀"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
