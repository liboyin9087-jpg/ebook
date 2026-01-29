# Supabase 資料庫設定指南

請按照以下步驟設定 Supabase：

## 1. 建立 Supabase 專案

1. 前往 https://supabase.com 註冊並建立新專案
2. 取得專案的 URL 和 anon key

## 2. 建立資料表

在 Supabase SQL Editor 中執行以下 SQL：

```sql
-- 建立 books 資料表
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  page_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立 book_pages 資料表
CREATE TABLE book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, page_number)
);

-- 建立索引
CREATE INDEX idx_book_pages_book_id ON book_pages(book_id);
CREATE INDEX idx_books_created_at ON books(created_at DESC);

-- 啟用 RLS (Row Level Security)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取
CREATE POLICY "Allow public read access on books" ON books
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on book_pages" ON book_pages
  FOR SELECT USING (true);

-- 允許所有人新增 (可依需求調整為需登入)
CREATE POLICY "Allow public insert on books" ON books
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on book_pages" ON book_pages
  FOR INSERT WITH CHECK (true);

-- 允許所有人刪除 (可依需求調整)
CREATE POLICY "Allow public delete on books" ON books
  FOR DELETE USING (true);

CREATE POLICY "Allow public delete on book_pages" ON book_pages
  FOR DELETE USING (true);
```

## 3. 建立 Storage Bucket

1. 前往 Storage 頁面
2. 建立名為 `ebook-pages` 的 bucket
3. 設定為 Public bucket（或依需求設定權限）
4. 設定 CORS 允許所有來源

## 4. 設定環境變數

建立 `.env` 檔案：

```bash
VITE_SUPABASE_URL=你的_supabase_project_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

並在 Vercel 專案設定中也加入相同的環境變數。

## 5. 完成！

設定完成後即可使用 Supabase 儲存電子書資料和檔案。
