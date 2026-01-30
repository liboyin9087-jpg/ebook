import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'ebook-platform',
    },
  },
})

// Storage bucket names
export const STORAGE_BUCKETS = {
  EBOOK_PAGES: 'ebook-pages',
} as const

// Helper functions for storage operations
export const storageHelpers = {
  /**
   * Upload a file to Supabase storage
   */
  async uploadFile(bucket: string, path: string, file: File | Blob) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error
    return data
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  },

  /**
   * Delete multiple files from storage
   */
  async deleteFiles(bucket: string, paths: string[]) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (error) throw error
  },
}

// Helper functions for database operations
export const dbHelpers = {
  /**
   * Insert a new book record
   */
  async insertBook(data: {
    title: string
    description?: string
    total_pages: number
    cover_url?: string
  }) {
    const { data: book, error } = await supabase
      .from('books')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return book
  },

  /**
   * Get all books
   */
  async getAllBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get a single book by ID
   */
  async getBook(bookId: string) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete a book
   */
  async deleteBook(bookId: string) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)

    if (error) throw error
  },

  /**
   * Insert book pages
   */
  async insertBookPages(pages: {
    book_id: string
    page_number: number
    image_url: string
  }[]) {
    const { error } = await supabase
      .from('book_pages')
      .insert(pages)

    if (error) throw error
  },

  /**
   * Get all pages for a book
   */
  async getBookPages(bookId: string) {
    const { data, error } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', bookId)
      .order('page_number', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Delete all pages for a book
   */
  async deleteBookPages(bookId: string) {
    const { error } = await supabase
      .from('book_pages')
      .delete()
      .eq('book_id', bookId)

    if (error) throw error
  },
}
