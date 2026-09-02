## 1. Supabase 專案與環境變數

- [ ] 1.1 建立 Supabase 專案，並確認可於 Supabase Dashboard 看到專案的 Project URL 與 API Keys
- [ ] 1.2 取得連線池網址（`DATABASE_URL`，含 `pgbouncer=true`）與直連網址（`DIRECT_URL`），並確認兩者可分別以 `psql` 或 Prisma 成功連線
- [ ] 1.3 建立 `.env`（不進版控）填入 `DATABASE_URL`、`DIRECT_URL`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`，並建立 `.env.example`（僅留欄位名稱，進版控）
- [x] 1.4 確認 `.gitignore` 已排除 `.env`，執行 `git status` 驗證 `.env` 不會被追蹤

## 2. Prisma Schema 與 Migration

- [x] 2.1 安裝 `prisma`、`@prisma/client` 依賴，執行 `npx prisma init` 建立 `prisma/` 目錄結構
- [x] 2.2 依技術規格書與 `database-schema` spec，於 `prisma/schema.prisma` 定義 `Role`、`PaymentStatus`、`CommissionType` enum 與 `User`、`ProfileConfig`、`FeaturedVideo`、`SheetMusic`、`ServicePackage`、`Order`、`OrderItem`、`Commission` 共 8 個 model
- [ ] 2.3 執行 `npx prisma migrate dev --name init`，驗證 migration 成功套用且 Supabase Dashboard 的 Table Editor 可看到全部資料表
- [x] 2.4 執行 `npx prisma generate`，驗證 `@prisma/client` 可在專案中正常 import 且型別對應 schema.prisma

## 3. Row Level Security 政策

- [x] 3.1 撰寫 `supabase/rls-policies.sql`，為每張資料表加上 `ENABLE ROW LEVEL SECURITY`
- [x] 3.2 依 `database-access-control` spec 撰寫「匿名/一般使用者僅讀已發布內容」的 SELECT policy（`SheetMusic`、`FeaturedVideo`、`ServicePackage`）
- [x] 3.3 撰寫「使用者可新增但不可讀取他人 Order／Commission」的 INSERT/SELECT policy
- [x] 3.4 撰寫「僅 ADMIN 可完整讀寫所有資料表」的 policy
- [ ] 3.5 於 Supabase SQL Editor 套用 `rls-policies.sql`，並依 spec 中每個 Scenario 手動驗證（匿名查未發布樂譜應回空結果、一般使用者改訂單狀態應被拒絕、ADMIN 應可讀寫全部欄位）

## 4. Seed 資料與驗證

- [x] 4.1 撰寫 `prisma/seed.ts`，為每張核心資料表建立至少一筆範例資料，並以 upsert 或條件式建立確保可重複執行
- [ ] 4.2 於 `package.json` 設定 `prisma.seed` 指令，執行 `npx prisma db seed` 驗證種子資料成功寫入且重複執行不產生重複紀錄
- [ ] 4.3 驗證 `Order.merchantTradeNo` 唯一性約束：嘗試插入重複交易單號的第二筆訂單，確認被資料庫拒絕
- [ ] 4.4 確認 design.md 的 Migration Plan 六個步驟皆已完成，並於本 change 的 proposal.md 對照 Impact 段落逐項覆核
