<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FlipReact Plus - 3D Flipbook Reader

A modern, production-ready 3D flipbook reader built with React, Tailwind CSS, and Framer Motion. Features realistic page turning animations, zoom controls, PDF upload support, and a complete backend server for book management.

## ✨ Features

- 📖 **Realistic Page Turning**: 3D animations with Framer Motion
- 🔍 **Zoom Controls**: Scale from 50% to 200%
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 📄 **PDF Support**: Upload and convert PDFs to flipbooks
- 🖼️ **Image Upload**: Support for JPEG, PNG, GIF, WebP
- 🔖 **Bookmarks**: Save and manage your favorite pages
- 📚 **Library**: Browse sample books or upload your own
- ⌨️ **Keyboard Navigation**: Arrow keys and shortcuts
- 🌓 **Dark Theme**: Modern dark UI
- 🚀 **Backend Server**: REST API for book management
- 📊 **QR Code Generation**: Share books easily

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/liboyin9087-jpg/ebook.git
   cd ebook
   ```

2. **Install all dependencies** (client + server)
   ```bash
   npm run install:all
   ```

3. **Set up environment variables** (optional)
   - Copy `.env.local` and update if needed
   - Set `GEMINI_API_KEY` if using AI features

### Development

**Run client only:**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

**Run server only:**
```bash
npm run dev:server
```
The API will be available at `http://localhost:3001`

**Run both client and server:**
```bash
npm run dev:all
```

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## 🔌 API Endpoints

The backend server provides the following REST API:

- `GET /api/health` - Health check
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get specific book
- `POST /api/upload` - Upload PDF or images
- `GET /api/books/:id/qrcode` - Generate QR code for book
- `DELETE /api/books/:id` - Delete a book

## ⌨️ Keyboard Shortcuts

- `Arrow Right` - Next page
- `Arrow Left` - Previous page
- `B` - Toggle bookmark on current page
- `Escape` - Close sidebars/modals

## 🎨 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **PDF.js** - PDF rendering
- **Lucide React** - Icons

### Backend
- **Express.js** - Web framework
- **Multer** - File uploads
- **PDF-lib** - PDF manipulation
- **QRCode** - QR code generation
- **Nanoid** - ID generation

## 📁 Project Structure

```
ebook/
├── components/         # React components
│   ├── Book/          # Book container and page components
│   └── UI/            # UI components (toolbar, sidebars, modals)
├── src/
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions and constants
├── server/            # Backend server
│   ├── index.js       # Express server
│   ├── db.js          # Database (in-memory)
│   └── uploads/       # Uploaded files storage
├── public/            # Static assets
├── App.tsx            # Main application component
└── package.json       # Dependencies and scripts
```

## 🌐 Deployment

### Deploy to Vercel/Netlify (Frontend)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` directory

### Deploy Server (Backend)

The server can be deployed to:
- **Heroku**: Push to Heroku with Procfile
- **Railway**: Connect your GitHub repo
- **DigitalOcean**: Deploy as a Node.js app
- **AWS/GCP**: Use container or serverless deployment

Environment variables needed:
- `PORT` - Server port (default: 3001)

## 🔧 Configuration

### Vite Configuration
Edit `vite.config.ts` to customize build settings.

### TypeScript Configuration
Edit `tsconfig.json` for TypeScript compiler options.

### Server Configuration
Edit `server/index.js` to modify:
- Port number
- File size limits
- CORS settings
- Upload directory

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

View the app in AI Studio: https://ai.studio/apps/drive/1aS5CfNUZxyRPzyT-u50pFaaTpkUwR9Rl

Made with ❤️ using React and modern web technologies

