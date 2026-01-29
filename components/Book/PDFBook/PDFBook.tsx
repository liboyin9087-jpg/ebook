import React, { useRef, useState } from 'react';
import { PageFlip } from 'page-flip';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// 設定 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export const PDFBook: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);

  // 處理 PDF 檔案上傳
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      // 讀取 PDF 檔案為 ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages: HTMLCanvasElement[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        pages.push(canvas);
      }
      // 清空舊內容
      if (bookRef.current) bookRef.current.innerHTML = '';
      // 建立 page-flip 實例
      if (bookRef.current) {
        const pageElements = pages.map((canvas, idx) => {
          const div = document.createElement('div');
          div.className = 'page';
          div.appendChild(canvas);
          return div;
        });
        const pf = new PageFlip(bookRef.current, {
          width: 400,
          height: 600,
          size: 'stretch',
          minWidth: 300,
          maxWidth: 1000,
          minHeight: 400,
          maxHeight: 1200,
          showCover: true,
        });
        pf.loadFromHTML(pageElements);
        pageFlipRef.current = pf;
      }
    } catch (err) {
      setError('PDF 載入失敗，請確認檔案格式或內容。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {loading && <div>載入中...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div ref={bookRef} className="book-container" style={{ marginTop: 20 }} />
      <div className="controls" style={{ marginTop: 20 }}>
        <button onClick={() => pageFlipRef.current?.flipPrev()}>上一頁</button>
        <button onClick={() => pageFlipRef.current?.flipNext()}>下一頁</button>
      </div>
    </div>
  );
};
