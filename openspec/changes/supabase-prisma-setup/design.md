## Context

專案目前完全沒有程式碼，只有技術規格書。技術規格書指定 Supabase（PostgreSQL + Auth + RLS）作為資料庫與驗證服務，並指定 Prisma 作為 ORM。這兩者的權限模型不完全重疊：Prisma 透過固定的 Postgres 連線角色直接存取資料庫，並不會自動帶入 Supabase Auth 的 JWT（`auth.uid()`）context；而 Supabase RLS 政策預設是設計給透過 Supabase 用戶端（PostgREST／`supabase-js`）、帶有使用者 JWT 的請求使用。這個落差會直接影響「RLS 政策實際在哪一層生效」的設計，必須在此決定清楚，否則後續 API Route 開發容易誤以為 RLS 會自動保護 Prisma 查詢。

## Goals / Non-Goals

**Goals:**
- 建立 Prisma Schema 與 migration，作為全站唯一的資料結構定義來源
- 明確定義「授權檢查」實際發生在哪一層（Next.js 伺服器端 vs. Supabase RLS），避免兩層互相假設對方已處理
- RLS 政策以「defense-in-depth」為目的套用在資料庫層，即使目前規劃中大部分讀寫都經由受信任的伺服器端 Prisma 連線

**Non-Goals:**
- 不實作 `/admin/login` 頁面或 Supabase Auth 的登入 UI（屬於後續「後台驗證」change）
- 不實作 Cloudflare R2、Resend、ECPay 的任何串接
- 不實作任何前台/後台頁面或 API Route，僅止於資料層基礎建設

## Decisions

**1. Prisma 定義 Schema，RLS 政策以獨立 SQL 管理**
Prisma migration 只負責資料表結構（schema shape）。RLS 政策（`ENABLE ROW LEVEL SECURITY` 與 `CREATE POLICY`）不透過 Prisma 定義，而是維護在獨立的 SQL 檔案（`supabase/rls-policies.sql`），於 Prisma migration 完成後手動套用至 Supabase。
理由：Prisma 目前對 RLS policy 沒有原生語法支援；硬把 policy 塞進 Prisma migration 的 `//` raw SQL 區塊會讓 schema.prisma 難以維護，也難以獨立審查安全規則。分開管理讓「資料結構變更」與「權限規則變更」可以獨立 review。

**2. 授權主要在 Next.js 伺服器端強制執行，RLS 作為第二道防線**
所有 API Route／Server Action 在呼叫 Prisma 前，MUST 先透過共用的授權輔助函式（例如 `requireAdmin()`）驗證 Supabase session 與 role。RLS 政策仍會套用在資料表上，但其主要防護對象是「未來若有前端直接透過 `supabase-js` 存取資料庫」的情境，而非現行以伺服器端 Prisma 為主的存取路徑。
理由：Prisma 使用固定的資料庫連線角色，不會自動套用發送請求之使用者的 JWT，因此單靠 RLS 無法防止一段寫錯的伺服器端程式碼繞過授權；必須把授權責任明確放在應用層。

**3. Prisma 連線採用 Supabase 連線池（pooled）+ 直連（direct）雙 URL，並透過 `prisma.config.ts` 與 driver adapter 設定（Prisma 7 架構）**
執行期查詢使用 Supabase 連線池網址（`DATABASE_URL`，帶 `pgbouncer=true`），migration 則使用直連網址（`DIRECT_URL`）。
理由：這是 Supabase 官方針對 Prisma 的建議模式——連線池在 transaction mode 下與 Prisma 的 prepared statement 及 migration DDL 操作不相容，需要用直連網址跑 migration，避免正式環境因連線數爆滿或 migration 失敗。

**實作時發現的修正**（Prisma 7 breaking change，撰寫本 Decision 時尚未知悉）：Prisma 7 移除了 `schema.prisma` datasource 區塊裡的 `url`／`directUrl` 屬性，且所有資料庫都必須透過 driver adapter 建立連線，不能再讓 Prisma Client 直接讀取 env 變數連線。實際架構因此調整為：
- `schema.prisma` 的 `datasource db` 只保留 `provider = "postgresql"`，不含任何連線字串
- 專案根目錄新增 `prisma.config.ts`，其 `datasource.url` 讀取 `DIRECT_URL`——這是 Prisma CLI（`migrate`、`db seed`、`generate` 的 config 載入階段）唯一使用的連線設定
- 應用程式執行期改由 [`src/lib/prisma.ts`](../../../src/lib/prisma.ts) 建立單例：安裝 `@prisma/adapter-pg`，以 `DATABASE_URL`（連線池）建立 `PrismaPg` adapter，傳入 `new PrismaClient({ adapter })`
- 這個修正不影響本 Decision 的核心理由（pooled 給執行期、direct 給 migration），只是把「兩個 URL 分別在哪裡設定」從 schema.prisma 改到 `prisma.config.ts` + 應用程式碼兩處

**4. RLS 政策透過共用 UUID 將 `User.id` 對應到 `auth.users.id` 判斷 ADMIN 身分**
`role` 欄位存在 Prisma 的 `User` model（`public.User` 資料表），而非 Supabase 內建的 `auth.users`。為了讓 RLS 政策能判斷「目前這個已登入請求是不是 ADMIN」，`public.User.id` MUST 與觸發該請求的 `auth.users.id` 使用相同 UUID（即後台管理員帳號建立時，`public.User` 那筆紀錄的 id 直接採用 Supabase Auth 產生的使用者 UUID，而不是各自獨立產生）。RLS 政策透過一個 `is_admin()` SQL helper function 比對 `auth.uid()` 與 `public."User".id` 且 `role = 'ADMIN'` 來判斷權限。
理由：這是 Supabase + 自訂使用者資料表最常見、風險最低的關聯方式，不需要額外同步機制；一旦兩邊 id 不一致，`is_admin()` 永遠回傳 false，會讓後台完全打不開，因此屬於「安全失敗」（fail-closed）而非「安全開放」，符合本專案對安全性的要求。此決定未寫入原始 proposal／specs，是在撰寫 RLS 政策時才發現的必要實作細節，記錄於此供後續 `/admin/login`（Supabase Auth）change 承接。

**5. `ProfileConfig` 以固定 ID 實作單例**
沿用技術規格書中 `id String @id @default("site-config")` 的作法，以固定字串主鍵確保全站只有一筆品牌設定，而非額外引入單例表格的 lock 機制。
理由：符合現有規格書設計，且對這個規模的專案已經足夠簡單可靠；額外的單例強制機制在此屬於過度工程。

## Risks / Trade-offs

- [風險] RLS 政策撰寫錯誤可能誤鎖合法存取或洩漏未發布內容 → 緩解：政策套用後，於本地/測試環境以「已登入 ADMIN」「一般使用者」「匿名」三種身分分別跑過 `database-access-control` spec 中列出的每個 Scenario 再上線
- [風險] 伺服器端授權檢查若遺漏在某支 API Route，會因為 RLS 只是第二道防線而非主要防線，導致實際上未受保護 → 緩解：所有 `/admin/*` 與涉及非公開資料的 API Route 統一透過同一個 `requireAdmin()`／`requireAuth()` helper 呼叫，不允許個別 Route 自行兜授權邏輯
- [風險] 連線池模式下 migration 失敗或行為不一致 → 緩解：嚴格區分 `DATABASE_URL`（執行期，池化）與 `DIRECT_URL`（僅 migration 使用直連）
- [風險，套用時發現] PostgREST 的 `Prefer: return=representation`（插入後要求回傳該筆資料）在只有 INSERT policy、沒有搭配 SELECT policy 時會失敗（`42501`），即使 `WITH CHECK` 本身允許該筆寫入——因為 RETURNING 語意上還是要「讀回」剛寫入的那一列。實測：`SET LOCAL ROLE anon` 直接在 SQL 層 INSERT 成功，但同一份資料透過 Supabase REST API 用 anon key + `return=representation` 卻回傳 RLS 違規；改用 `return=minimal` 則正常 → 緩解：本專案的訪客寫入（委託表單、訂單建立）一律經由 Next.js Server Action／API Route 呼叫 Prisma（見 Decision 2，走特權連線，不受此限制），不透過瀏覽器端直接呼叫 Supabase REST/`supabase-js` 寫入，因此目前架構不會踩到這個限制；若未來真的要讓前端直接寫入 Supabase，需要額外設計「可讀回但範圍受限」的 SELECT policy，或應用端一律使用 `return=minimal`

## Migration Plan

1. 建立 Supabase 專案，取得 `DATABASE_URL`（連線池）、`DIRECT_URL`（直連）、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`，寫入 `.env`（不進版控）與 `.env.example`（進版控，僅留欄位名稱）
2. 安裝 Prisma，依技術規格書建立 `prisma/schema.prisma`
3. 執行 `prisma migrate dev --name init` 建立初始 migration 並套用到 Supabase
4. 撰寫 `supabase/rls-policies.sql`，涵蓋 `database-access-control` spec 中所有 Requirement，於 Supabase SQL Editor 或 CLI 套用
5. 撰寫 `prisma/seed.ts`，於 `prisma.config.ts` 的 `migrations.seed` 設定執行指令（Prisma 7 不再讀取 `package.json` 的 `prisma.seed` 欄位），執行 `prisma db seed` 建立範例資料
6. 手動以三種身分（ADMIN、一般/匿名、伺服器端服務角色）驗證 spec 中的每個 Scenario——實務上「一般/匿名」以 Supabase REST API + anon key 測試，「伺服器端」以 `SET LOCAL ROLE` 或直接 Prisma 連線測試，兩者行為不同（見上方新增的 Risk）

無需 rollback 策略之外的特殊安排：這是全新專案的第一批資料表，若 migration 有誤可直接刪除 Supabase 專案重建，不涉及既有生產資料。

## Open Questions

- Supabase 專案的正式環境地區（region）與方案（Free/Pro tier）由使用者選定，不影響本 change 的 schema／RLS 設計，待實際建立 Supabase 專案時再確認即可
