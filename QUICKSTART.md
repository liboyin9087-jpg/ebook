# 快速開始指南

這份指南將幫助你在 5 分鐘內啟動並運行 FlipReact Plus 電子書平台。

## 📋 前置需求

在開始之前，請確保你已安裝：
- Node.js 18 或更高版本
- npm 或 yarn
- 一個 Supabase 帳號（免費）

## 🚀 5 分鐘快速啟動

### 步驟 1: 複製專案 (30 秒)

```bash
git clone https://github.com/liboyin9087-jpg/ebook.git
cd ebook
```

### 步驟 2: 安裝依賴 (1 分鐘)

```bash
npm install
```

### 步驟 3: 設定 Supabase (2 分鐘)

1. 前往 [Supabase](https://supabase.com) 註冊並建立專案

2. 在 SQL Editor 執行以下 SQL:

```sql
-- 建立 books 資料表
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  page_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立 book_pages 資料表
CREATE TABLE book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  UNIQUE(book_id, page_number)
);

-- 啟用公開讀取
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON books FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON book_pages FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON book_pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON books FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON book_pages FOR DELETE USING (true);
```

3. 在 Storage 建立 Bucket：
   - 名稱：`ebook-pages`
   - 設為 Public
   - 允許所有檔案類型

4. 複製你的 Supabase 憑證

### 步驟 4: 設定環境變數 (30 秒)

建立 `.env` 檔案：

```bash
VITE_SUPABASE_URL=https://你的專案.supabase.co
VITE_SUPABASE_ANON_KEY=你的_anon_key
```

### 步驟 5: 啟動開發伺服器 (30 秒)

```bash
npm run dev
```

開啟瀏覽器訪問 `http://localhost:3000`

## 🎉 完成！

你現在可以：
1. 上傳 PDF 或圖片
2. 閱讀電子書
3. 分享給其他人

## 📱 測試響應式設計

在瀏覽器中按 F12 開啟開發者工具，切換裝置模擬：
- iPhone (375x667)
- iPad (768x1024)
- Desktop (1920x1080)

## 🚀 部署到 Vercel

### 選項 1: 使用 Vercel Dashboard

1. 前往 [vercel.com](https://vercel.com)
2. 匯入你的 GitHub repository
3. 設定環境變數：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 點擊 Deploy

### 選項 2: 使用 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel

# 設定環境變數
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 生產部署
vercel --prod
```

## 🎯 下一步

- 📖 閱讀 [README.md](./README.md) 了解所有功能
- 📚 查看 [COMPARISON.md](./COMPARISON.md) 了解與 FlipBuilder 的比較
- 🐛 遇到問題？查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 的問題排除章節

## 💡 快速提示

### 上傳技巧
- 支援拖放檔案
- PDF 會自動轉換為圖片
- 建議圖片尺寸：1200x1600px

### 閱讀技巧
- 使用方向鍵翻頁
- 按 `B` 加入書籤
- 按 `T` 開啟縮圖
- 手機上可滑動翻頁

### 分享技巧
- 複製分享連結
- 掃描 QR Code
- 直接傳送網址

## 🆘 需要協助？

1. **查看文件**: 所有功能都有詳細說明
2. **常見問題**: DEPLOYMENT.md 有問題排除
3. **開 Issue**: 在 GitHub 提出問題
4. **社群支援**: 查看現有的 Issues

## 🎊 享受使用！

FlipReact Plus 現在已經準備好為你服務了。開始創建美麗的電子書吧！

---

**提示**: 這個平台完全開源且免費，你可以隨意修改和擴展功能。
