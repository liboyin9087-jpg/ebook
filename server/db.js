/**
 * Simple in-memory database for storing books
 * In production, this should be replaced with a real database
 */

class Database {
  constructor() {
    this.books = new Map();
    this.nextId = 1;
  }

  /**
   * Create a new book entry
   * @param {Object} bookData - Book data including title, pages, etc.
   * @returns {string} - The book ID
   */
  createBook(bookData) {
    const id = `book-${this.nextId++}`;
    const book = {
      id,
      ...bookData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.books.set(id, book);
    return id;
  }

  /**
   * Get a book by ID
   * @param {string} id - Book ID
   * @returns {Object|null} - Book data or null if not found
   */
  getBook(id) {
    return this.books.get(id) || null;
  }

  /**
   * Get all books
   * @returns {Array} - Array of all books
   */
  getAllBooks() {
    return Array.from(this.books.values());
  }

  /**
   * Update a book
   * @param {string} id - Book ID
   * @param {Object} updates - Updates to apply
   * @returns {boolean} - True if successful, false if book not found
   */
  updateBook(id, updates) {
    const book = this.books.get(id);
    if (!book) return false;
    
    const updatedBook = {
      ...book,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.books.set(id, updatedBook);
    return true;
  }

  /**
   * Delete a book
   * @param {string} id - Book ID
   * @returns {boolean} - True if successful, false if book not found
   */
  deleteBook(id) {
    return this.books.delete(id);
  }

  /**
   * Clear all books
   */
  clear() {
    this.books.clear();
    this.nextId = 1;
  }
}

module.exports = new Database();
