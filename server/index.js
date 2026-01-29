/**
 * FlipReact Plus Server
 * Express server for handling PDF uploads, conversions, and book management
 */

const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');
const path = require('path');
const fs = require('fs').promises;
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'));
    }
  }
});

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Get all books
 */
app.get('/api/books', (req, res) => {
  try {
    const books = db.getAllBooks();
    res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch books'
    });
  }
});

/**
 * Get a specific book by ID
 */
app.get('/api/books/:id', (req, res) => {
  try {
    const book = db.getBook(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    res.json({
      success: true,
      book
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch book'
    });
  }
});

/**
 * Upload and process PDF/images
 */
app.post('/api/upload', upload.array('files', 100), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const { title = 'Uploaded Book' } = req.body;
    const bookId = nanoid(10);
    
    // Process files
    const pages = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const filename = `${bookId}-page-${i}.${file.mimetype.split('/')[1]}`;
      const filepath = path.join(UPLOADS_DIR, filename);
      
      // Save file
      await fs.writeFile(filepath, file.buffer);
      
      pages.push({
        index: i,
        contentUrl: `/uploads/${filename}`,
        type: (i === 0 || i === req.files.length - 1) ? 'cover' : 'content',
        filename
      });
    }
    
    // Create book entry
    const id = db.createBook({
      title,
      description: `Uploaded book with ${pages.length} pages`,
      coverUrl: pages[0]?.contentUrl || '',
      pages,
      pageCount: pages.length
    });
    
    const book = db.getBook(id);
    
    res.json({
      success: true,
      message: 'Book uploaded successfully',
      book
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload book'
    });
  }
});

/**
 * Generate QR code for a book
 */
app.get('/api/books/:id/qrcode', async (req, res) => {
  try {
    const book = db.getBook(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    const bookUrl = `${req.protocol}://${req.get('host')}/book/${book.id}`;
    const qrCode = await QRCode.toDataURL(bookUrl);
    
    res.json({
      success: true,
      qrCode,
      url: bookUrl
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code'
    });
  }
});

/**
 * Delete a book
 */
app.delete('/api/books/:id', async (req, res) => {
  try {
    const book = db.getBook(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    // Delete associated files
    if (book.pages && Array.isArray(book.pages)) {
      for (const page of book.pages) {
        if (page.filename) {
          const filepath = path.join(UPLOADS_DIR, page.filename);
          await fs.unlink(filepath).catch(() => {});
        }
      }
    }
    
    // Delete from database
    db.deleteBook(req.params.id);
    
    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete book'
    });
  }
});

/**
 * Serve uploaded files
 */
app.use('/uploads', express.static(UPLOADS_DIR));

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 50MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         FlipReact Plus Server                        ║
║                                                       ║
║  Server is running on:                               ║
║  → http://localhost:${PORT}                            ║
║                                                       ║
║  API Endpoints:                                      ║
║  → GET  /api/health                                  ║
║  → GET  /api/books                                   ║
║  → GET  /api/books/:id                               ║
║  → POST /api/upload                                  ║
║  → GET  /api/books/:id/qrcode                        ║
║  → DEL  /api/books/:id                               ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
