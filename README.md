<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FlipReact Plus - 專業電子書閱讀平台

一個現代化、市場化的電子書閱讀平台，使用 React、Tailwind CSS 和 Supabase 構建。提供類似 FlipBuilder 的高品質閱讀體驗，完整的響應式設計，以及強大的書籍管理功能。

## ✨ 核心特色

### 📱 完美響應式設計
- **多裝置適配**: 桌面、平板、手機完美顯示，不變形
- **自適應縮放**: 自動調整閱讀區域以適應螢幕大小
- **觸控手勢**: 支援滑動翻頁，專為移動裝置優化
- **流暢動畫**: 頁面翻轉動畫在所有裝置上都流暢自然

### 📖 專業閱讀體驗
- **高品質翻頁效果**: 媲美 FlipBuilder 的 3D 翻頁動畫
- **靈活縮放控制**: 支援 30% 到 250% 的縮放範圍
- **縮圖導航**: 側邊欄快速瀏覽所有頁面
- **書籤功能**: 標記重要頁面，自動保存
- **全螢幕模式**: 沉浸式閱讀體驗
- **鍵盤快捷鍵**: 方向鍵翻頁、B 鍵書籤、T 鍵縮圖

### 📤 強大上傳功能
- **PDF 轉換**: 自動將 PDF 轉換為高品質圖片頁面
- **拖放上傳**: 支援拖放檔案上傳
- **進度顯示**: 即時顯示上傳和處理進度
- **錯誤處理**: 完善的錯誤提示和處理機制
- **批次圖片**: 支援多張圖片組成電子書

### 🔗 分享與管理
- **QR Code 生成**: 自動生成分享用 QR Code
- **連結分享**: 一鍵複製分享連結
- **書籍管理**: 檢視、刪除已上傳的電子書
- **即時預覽**: 上傳後立即可閱讀

### ☁️ Supabase 後端
- **雲端儲存**: 使用 Supabase Storage 儲存頁面
- **資料庫管理**: PostgreSQL 資料庫管理書籍資訊
- **安全可靠**: 完整的錯誤處理和連線管理
- **可擴展**: 易於擴展的雲端架構

## 🚀 快速開始

### 系統需求

- Node.js 18 或更高版本
- npm 或 yarn
- Supabase 帳號（免費方案即可）

### 安裝步驟

1. **Clone 專案**
   ```bash
   git clone https://github.com/liboyin9087-jpg/ebook.git
   cd ebook
   ```

2. **安裝相依套件**
   ```bash
   npm install
   ```

3. **設定 Supabase**
   
   按照 `SUPABASE_SETUP.md` 的指示完成：
   - 建立 Supabase 專案
   - 建立資料表 (books, book_pages)
   - 建立 Storage Bucket (ebook-pages)
   - 設定權限政策

4. **設定環境變數**
   
   建立 `.env` 檔案：
   ```bash
   VITE_SUPABASE_URL=你的_supabase_url
   VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
   ```

5. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   開啟瀏覽器訪問 `http://localhost:3000`

### 開發模式

```bash
# 前端開發
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 📱 響應式設計展示

### 桌面版 (Desktop)
![Desktop View](https://github.com/user-attachments/assets/4ae657d0-0bd6-4b09-8e36-1aca9e63b1bd)

### 平板版 (Tablet)
![Tablet View](https://github.com/user-attachments/assets/0bf79c6c-e2ad-41c0-ad8a-5dc94d225574)

### 手機版 (Mobile)
![Mobile View](https://github.com/user-attachments/assets/286bb417-00bf-4a3d-886c-91870f55f270)

## ⌨️ 鍵盤快捷鍵

在閱讀器中：
- `→` - 下一頁
- `←` - 上一頁
- `B` - 切換當前頁面書籤
- `T` - 開關縮圖側邊欄
- `Escape` - 關閉側邊欄

## 🎨 技術架構

### 前端技術
- **React 19** - UI 框架
- **TypeScript** - 型別安全
- **Vite** - 建置工具和開發伺服器
- **Tailwind CSS** - CSS 框架
- **PDF.js** - PDF 渲染和轉換
- **Lucide React** - 圖示庫
- **React Router** - 路由管理

### 後端技術
- **Supabase** - 後端即服務 (BaaS)
  - PostgreSQL 資料庫
  - Storage (檔案儲存)
  - 即時 API
  - 身份驗證 (可選)

### 部署平台
- **Vercel** - 前端託管
- **Supabase Cloud** - 後端服務

## 📁 專案結構

```
ebook/
├── components/              # React 元件
│   ├── Dashboard/          # 管理儀表板
│   ├── Reader/             # 電子書閱讀器
│   ├── Book/               # 書本容器元件
│   └── UI/                 # UI 元件
├── src/
│   ├── lib/                # 函式庫 (Supabase 客戶端)
│   ├── types/              # TypeScript 型別定義
│   └── utils/              # 工具函數
├── public/                 # 靜態資源
├── App.tsx                 # 主應用元件
├── MainApp.tsx             # 路由配置
├── index.html              # HTML 入口
├── vercel.json             # Vercel 部署配置
├── SUPABASE_SETUP.md       # Supabase 設定指南
└── DEPLOYMENT.md           # 部署指南
```

## 🌐 部署到 Vercel

### 自動部署

1. 在 Vercel 匯入此 GitHub Repository
2. 設定環境變數：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. 點擊部署

詳細步驟請參考 `DEPLOYMENT.md`

### 手動部署

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

## 🔧 使用說明

### 上傳電子書

1. 進入管理平台首頁
2. 選擇 PDF 檔案或多張圖片
3. 點擊「開始上傳」
4. 等待處理完成（PDF 會自動轉換為圖片）
5. 獲得分享連結和 QR Code

### 閱讀電子書

1. 點擊「閱讀」按鈕或掃描 QR Code
2. 使用工具列控制：
   - 縮放按鈕：放大/縮小
   - 書籤按鈕：標記當前頁
   - 縮圖按鈕：開啟頁面導航
   - 全螢幕按鈕：進入全螢幕模式
3. 使用底部控制列翻頁
4. 在手機上可以滑動翻頁

## 🎯 功能亮點

### 與 FlipBuilder 相比

✅ **相同或更好的功能**
- 高品質的翻頁動畫
- 完整的響應式設計
- 縮圖導航
- 書籤功能
- 分享功能（連結 + QR Code）
- PDF 自動轉換

✅ **額外優勢**
- 完全免費開源
- 可自行部署掌控
- 使用現代化技術棧
- 易於客製化和擴展
- 雲端後端（Supabase）
- 自動 CDN 加速（Vercel）

## 🔒 安全性

- 環境變數保護敏感資訊
- Supabase Row Level Security (RLS)
- 安全的檔案上傳驗證
- XSS 和 CSRF 防護
- HTTPS 強制加密

## 🐛 問題排除

### PDF 上傳失敗

1. 檢查 Supabase Storage Bucket 是否已建立
2. 確認 Bucket 名稱為 `ebook-pages`
3. 檢查 Bucket 權限設定
4. 查看瀏覽器 Console 的錯誤訊息

### 頁面無法顯示

1. 確認 Supabase 資料表已正確建立
2. 檢查 RLS 政策是否正確
3. 驗證檔案已成功上傳到 Storage
4. 確認 Storage Bucket 為 Public

### 環境變數不生效

1. 確認變數名稱以 `VITE_` 開頭
2. 重新啟動開發伺服器
3. 在 Vercel 重新部署

## 📊 效能優化

- PDF 轉高品質 JPEG（品質 90%）
- 圖片自動 CDN 快取
- 程式碼分割和懶載入
- 資源壓縮和最小化
- 瀏覽器快取策略

## 🤝 貢獻

歡迎提交 Pull Request 或開 Issue！

## 📝 授權

ISC License

## 🔗 相關連結

- [Supabase 文件](https://supabase.com/docs)
- [Vercel 文件](https://vercel.com/docs)
- [React 文件](https://react.dev)
- [PDF.js 文件](https://mozilla.github.io/pdf.js/)

---

Made with ❤️ by liboyin9087-jpg

如有問題或建議，請在 GitHub 開 Issue

