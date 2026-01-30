# Supabase 設置指南

本文件將指導您完成 Supabase 後端的完整設置流程,包括資料庫建立、權限設定和儲存配置。

## 建立 Supabase 專案

首先,前往 Supabase 官方網站註冊帳號並建立新專案。選擇適合您的地區,這將影響資料存取的延遲時間。建立完成後,您將獲得專案的 URL 和 API 金鑰,請妥善保存這些資訊。

## 資料庫結構設置

### Books 資料表

books 資料表儲存電子書的基本資訊。請在 Supabase SQL Editor 中執行以下語句來建立資料表:

```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  total_pages INTEGER NOT NULL DEFAULT 0,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 建立索引以提升查詢效能
CREATE INDEX idx_books_created_at ON books(created_at DESC);
```

這個資料表設計包含了電子書的所有必要欄位。id 欄位使用 UUID 確保全球唯一性,created_at 和 updated_at 欄位自動追蹤時間資訊。我們還為 created_at 欄位建立了索引,這將顯著提升書籍列表的查詢效能。

### Book Pages 資料表

book_pages 資料表儲存每一頁的圖片連結。執行以下語句來建立資料表:

```sql
CREATE TABLE book_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, page_number)
);

-- 建立索引以提升查詢效能
CREATE INDEX idx_book_pages_book_id ON book_pages(book_id);
CREATE INDEX idx_book_pages_page_number ON book_pages(book_id, page_number);
```

這個資料表透過 book_id 欄位與 books 資料表建立關聯。ON DELETE CASCADE 確保當書籍被刪除時,所有相關的頁面記錄也會自動刪除。UNIQUE 約束保證同一本書不會有重複的頁碼。

## Row Level Security (RLS) 設置

為了保護資料安全,我們需要設置適當的存取權限政策。執行以下語句來啟用 RLS 並設置公開讀取政策:

```sql
-- 啟用 RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取書籍
CREATE POLICY "Public books are viewable by everyone"
  ON books FOR SELECT
  USING (true);

-- 允許所有人讀取頁面
CREATE POLICY "Public book pages are viewable by everyone"
  ON book_pages FOR SELECT
  USING (true);

-- 允許所有人插入書籍(在生產環境中應該限制此權限)
CREATE POLICY "Anyone can insert books"
  ON books FOR INSERT
  WITH CHECK (true);

-- 允許所有人插入頁面(在生產環境中應該限制此權限)
CREATE POLICY "Anyone can insert book pages"
  ON book_pages FOR INSERT
  WITH CHECK (true);

-- 允許所有人刪除書籍(在生產環境中應該限制此權限)
CREATE POLICY "Anyone can delete books"
  ON books FOR DELETE
  USING (true);

-- 允許所有人刪除頁面(在生產環境中應該限制此權限)
CREATE POLICY "Anyone can delete book pages"
  ON book_pages FOR DELETE
  USING (true);
```

這些政策設置允許公開存取,適合演示和開發環境。在生產環境中,您應該實作適當的身份驗證機制,並將插入和刪除權限限制給授權用戶。

## Storage Bucket 設置

檔案儲存需要建立 Storage Bucket。請按照以下步驟操作:

1. 在 Supabase 控制台中,前往 Storage 部分
2. 點擊「New bucket」建立新的 bucket
3. 將 bucket 命名為 `ebook-pages`
4. 選擇 Public bucket 選項,這樣圖片才能被公開存取
5. 點擊建立完成設置

建立完成後,您需要設置 Storage 政策以允許檔案操作。在 Storage 的 Policies 頁面執行以下設置:

```sql
-- 允許所有人上傳檔案到 ebook-pages bucket
CREATE POLICY "Public upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ebook-pages');

-- 允許所有人刪除檔案
CREATE POLICY "Public delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'ebook-pages');

-- 允許所有人讀取檔案
CREATE POLICY "Public access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ebook-pages');
```

這些政策確保應用程式能夠自由地上傳、讀取和刪除圖片檔案。

## 環境變數設置

完成 Supabase 設置後,您需要在專案中配置環境變數。在專案根目錄建立 .env 檔案並填入以下內容:

```
VITE_SUPABASE_URL=您的_supabase_專案_url
VITE_SUPABASE_ANON_KEY=您的_supabase_anon_金鑰
```

這些資訊可以在 Supabase 控制台的 Settings > API 頁面找到。請確保使用 anon/public 金鑰而非 service_role 金鑰,後者具有完全權限,不應暴露在前端代碼中。

## 驗證設置

設置完成後,建議進行基本的驗證測試。您可以在 Supabase SQL Editor 中執行簡單的查詢來確認資料表已正確建立:

```sql
SELECT * FROM books;
SELECT * FROM book_pages;
```

同時檢查 Storage bucket 是否已建立且政策設置正確。嘗試上傳一個測試檔案,確認上傳和存取功能正常運作。

## 疑難排解

如果遇到權限錯誤,請先檢查 RLS 政策是否正確啟用。如果檔案上傳失敗,確認 Storage bucket 的名稱與代碼中的設定一致。如果資料查詢出現問題,檢查環境變數是否正確配置。

## 生產環境注意事項

在將應用程式部署到生產環境前,請務必重新評估權限設置。實作適當的身份驗證機制,限制資料操作權限僅給授權用戶。定期備份資料庫,並監控 Storage 使用量以避免超出配額。

設置完成後,您的 Supabase 後端已準備就緒,可以開始使用電子書平台了。
