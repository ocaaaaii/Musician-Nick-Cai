## Why

目前專案僅有技術規格文件與品牌照片，尚未有任何可運作的資料層。後續所有前台頁面（品牌區、樂譜商城、訂單）與後台 CMS 都依賴一套穩定的資料庫 Schema 與存取權限規則，因此必須優先建立 Supabase 專案、Prisma Schema 與 RLS 權限控管，作為後面所有功能開發的地基。

## What Changes

- 建立 Supabase 專案（PostgreSQL + Auth），並將連線資訊納入環境變數管理
- 依技術規格書導入 Prisma Schema，涵蓋 `User`、`ProfileConfig`、`FeaturedVideo`、`SheetMusic`、`ServicePackage`、`Order`、`OrderItem`、`Commission` 共 8 個 model 與對應 enum（`Role`、`PaymentStatus`、`CommissionType`）
- 執行首次 migration，建立資料表結構
- 設計並套用 Supabase RLS 政策：
  - 前台匿名/一般使用者僅可讀取已發布內容（`isPublished = true` 的樂譜、影片、服務），且只能新增自己的訂單/委託資料，不可讀取他人資料
  - 僅 `role = ADMIN` 的使用者可讀寫所有表格（含未發布內容、訂單狀態、委託處理狀態）
- 撰寫本地開發用的 seed script，填入少量測試資料以利後續前台頁面開發

## Capabilities

### New Capabilities
- `database-schema`: Prisma Schema 定義與 migration，建立本專案所有核心資料表結構
- `database-access-control`: Supabase RLS 政策，定義 ADMIN 與一般使用者/匿名訪客對各資料表的讀寫權限

### Modified Capabilities

（無，此為全新專案的第一批資料層能力）

## Impact

- 新增：`prisma/schema.prisma`、`prisma/migrations/`、`prisma/seed.ts`、RLS policy SQL（`supabase/migrations/` 或等效目錄）
- 新增環境變數：`DATABASE_URL`、`DIRECT_URL`（Prisma migration 用）、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`
- 不涉及 Cloudflare R2、Resend、ECPay 的設定——這些屬於獨立的後續 change（檔案儲存與金流/信件整合）
- 不涉及任何前端頁面或 API Route 實作，純資料層基礎建設
