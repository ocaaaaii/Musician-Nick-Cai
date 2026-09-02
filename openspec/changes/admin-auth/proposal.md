## Why

技術規格書 A1-A6 的「後台 CMS 管理系統」都建立在同一個前提上：只有 `role == ADMIN` 的使用者能進入 `/admin/*`。目前完全沒有這一層，`/admin` 底下任何頁面都還不存在。這是後續 A2（品牌設定）、A3（樂譜商品）、A4（服務定價）、A5（訂單）、A6（委託看板）全部要依賴的地基，必須先做且獨立成一個 change。

## What Changes

- 安裝 `@supabase/ssr`、`@supabase/supabase-js`，建立 Supabase Auth 的瀏覽器端／伺服器端 client
- 建立 `/admin/login` 登入頁：Email/Password 登入（不做 Magic Link、不做註冊頁——只有音樂人一人使用，帳號由使用者自己在 Supabase Dashboard 建立，不開放自助註冊）
- 建立 `/admin/*` 的存取保護：未登入或非 `role == ADMIN` 的使用者，存取任何 `/admin/*`（除了 `/admin/login` 本身）一律導回 `/admin/login`
- 建立最小可用的 `/admin` 登入後首頁（僅顯示「已登入為 ADMIN」與登出按鈕，作為後續 A2-A6 頁面的掛載點，不含任何實際管理功能）
- 建立登出功能
- `/admin/*` 路由 **不** 走 `[locale]` 的多語系路由——後台是音樂人自己用的內部工具，技術規格書沒有要求後台需要多語系，刻意保持路由簡單（`middleware.ts` 的 next-intl matcher 需排除 `/admin`）

## Capabilities

### New Capabilities
- `admin-authentication`: 登入、登出、Session 管理
- `admin-route-protection`: `/admin/*` 的存取權限守門（僅 ADMIN 可進）

### Modified Capabilities

（無）

## Impact

- 新增：`src/lib/supabase/client.ts`、`src/lib/supabase/server.ts`、`src/app/admin/login/page.tsx`、`src/app/admin/login/actions.ts`、`src/app/admin/layout.tsx`、`src/app/admin/page.tsx`、`src/app/admin/actions.ts`（登出）
- 修改：`src/middleware.ts`（合併 Supabase session 刷新邏輯，並排除 `/admin` 路徑不套用 next-intl 的語系導向）
- **需要使用者協助的步驟**：Supabase Auth 帳號的建立無法由我代為執行（帳號建立、密碼設定屬於使用者本人才能做的事）。我會請使用者到 Supabase Dashboard 建立一個 Auth 使用者，並提供該帳號的 UUID／Email，我再據此建立對應的 `public.User` 資料列（`role: ADMIN`，`id` 與 Auth 帳號的 UUID 相同——這是 `supabase-prisma-setup` change 的 design.md Decision 4 早就定好的規則，這裡是第一次真正實踐它）
- **不包含**：A2-A6 的實際管理功能（品牌設定、樂譜商品、服務定價、訂單、委託看板）——這些是後續各自獨立的 change
- **不包含**：Magic Link 登入、自助註冊頁、忘記密碼流程——單一使用者的內部工具，先用最簡單可靠的 Email/Password
