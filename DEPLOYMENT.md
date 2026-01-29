# Vercel 部署指南

本專案已配置好 Vercel 部署，按照以下步驟即可上線。

## 前置作業

### 1. 完成 Supabase 設定

請先按照 `SUPABASE_SETUP.md` 完成 Supabase 資料庫和 Storage 的設定。

### 2. 取得 Supabase 憑證

登入 Supabase Dashboard，取得：
- `VITE_SUPABASE_URL`：專案 URL
- `VITE_SUPABASE_ANON_KEY`：Anon/Public Key

## Vercel 部署步驟

### 方法一：使用 Vercel CLI（推薦）

1. 安裝 Vercel CLI
```bash
npm i -g vercel
```

2. 登入 Vercel
```bash
vercel login
```

3. 部署專案
```bash
vercel
```

4. 設定環境變數
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

5. 重新部署以套用環境變數
```bash
vercel --prod
```

### 方法二：使用 Vercel Dashboard

1. 前往 https://vercel.com 註冊/登入

2. 點擊 "Import Project"

3. 選擇此 GitHub Repository

4. 在 "Environment Variables" 區塊新增：
   - `VITE_SUPABASE_URL` = 你的 Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = 你的 Supabase Anon Key

5. 點擊 "Deploy"

## 驗證部署

部署完成後：

1. 開啟 Vercel 提供的網址
2. 測試上傳 PDF 或圖片
3. 確認能正常顯示和閱讀
4. 測試響應式設計（手機、平板、桌面）

## 自訂網域（選用）

在 Vercel Dashboard 的 "Domains" 頁面可以設定自訂網域。

## 常見問題

### Q: 上傳後頁面無法顯示？

檢查 Supabase Storage Bucket 的權限設定：
- Bucket 必須設為 Public
- 或設定正確的 RLS Policy

### Q: 部署後環境變數不生效？

確認：
1. 環境變數名稱前綴為 `VITE_`
2. 已重新部署（環境變數修改後需要重新 deploy）

### Q: PDF 上傳失敗？

確認：
1. Supabase Storage Bucket 已建立（名稱：`ebook-pages`）
2. Bucket 大小限制足夠
3. 網路連線正常

## 效能優化建議

1. **圖片優化**：上傳前先壓縮圖片
2. **CDN**：Vercel 自動提供 CDN
3. **快取**：已在 `vercel.json` 配置 assets 快取

## 監控與分析

Vercel 提供：
- 即時分析
- 錯誤追蹤
- 效能監控

在 Dashboard 的 "Analytics" 頁面查看。

## 更新部署

每次 git push 到 main 分支，Vercel 會自動重新部署。

或手動部署：
```bash
vercel --prod
```
