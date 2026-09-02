## Context

`supabase-prisma-setup` 的 design.md 已經定了兩件事，這裡是第一次真正兌現：（1）RLS 的 `is_admin()` 需要 `public.User.id` 與 Supabase Auth 的 `auth.users.id` 相同；（2）授權主要在 Next.js 伺服器端強制執行，RLS 是第二道防線。目前 `/admin` 完全不存在，`middleware.ts` 只處理 next-intl 的語系路由。

## Goals / Non-Goals

**Goals:**
- `/admin/*`（除了 `/admin/login`）只有 `role == ADMIN` 能進，其餘一律導回登入頁
- 登入機制簡單可靠：Email/Password，不依賴 Resend 或其他尚未就緒的外部服務
- 建立可重複使用的「取得目前登入使用者＋角色」介面，供 A2-A6 之後直接呼叫

**Non-Goals:**
- 不做 Magic Link、忘記密碼、自助註冊
- 不做 A2-A6 的實際管理功能
- 不用 Supabase 的 Row Level Security 作為後台的主要防線——如 Context 所述，授權責任在應用層

## Decisions

**1. `/admin/*` 路由完全獨立於 `[locale]`，不套用 next-intl**
`src/app/admin/...` 與 `src/app/[locale]/...` 是同層的兩棵路由樹；`middleware.ts` 的邏輯改為：請求路徑以 `/admin` 開頭時，只跑 Supabase session 刷新，不跑 next-intl 的語系偵測／導向；其餘路徑維持原本的 next-intl middleware。
理由：後台是音樂人自己用的內部工具，技術規格書沒有要求後台要多語系；硬套用 `[locale]` 前綴只會讓網址變成 `/zh-TW/admin` 這種對內部工具毫無意義的形式，且會讓 `/admin/login` 的重定向邏輯多一層語系判斷的複雜度。

**2. 用 `@supabase/ssr`，不用已棄用的 `@supabase/auth-helpers-nextjs`**
建立 `src/lib/supabase/server.ts`（給 Server Component／Server Action／Route Handler 用，綁定 `next/headers` 的 cookies）與 `src/lib/supabase/middleware.ts`（給 middleware 用，綁定 request/response 的 cookies 做 session 刷新）。
理由：`@supabase/ssr` 是 Supabase 官方目前主推、對 Next.js App Router 支援最完整的套件；`auth-helpers-nextjs` 已標示為棄用。不建立瀏覽器端 client——登入／登出都透過 Server Action 完成，目前沒有任何頁面需要在瀏覽器端直接呼叫 Supabase Auth API，避免建立用不到的程式碼。

**3. ADMIN 角色判斷用 Prisma 查 `public.User.role`，不查 Supabase 的 user metadata**
Middleware 只負責「這個人有沒有登入（session 是否有效）」，不判斷角色；實際的角色判斷放在 Server Component layout，用 Supabase session 拿到的 `auth.users.id`，透過 Prisma 查 `User.findUnique({ where: { id } })`，檢查 `role === 'ADMIN'`。查不到資料列（`null`）視同無權限。
理由：延續 `supabase-prisma-setup` 已定案的「授權在應用層」原則；角色資訊本來就存在我們自己的 `User` 表，沒有必要另外維護一份 Supabase user metadata 當作 SSOT，避免兩處資料不同步。Middleware 不查資料庫是效能考量（middleware 在每個請求都會跑，加一次資料庫查詢的延遲不划算），角色判斷放在 layout 只在實際進入 `/admin/*` 時才查一次。

實作時發現：`/admin` 在 `[locale]` 之外，本身沒有任何 root layout 可繼承 `<html>/<body>`（與先前 `not-found.tsx` 踩過的坑同源），所以 `src/app/admin/layout.tsx` 必須是提供 `<html>/<body>` 的 root layout，且會套用到 `/admin/login` 本身。若把角色判斷直接放在這個 root layout，未登入使用者造訪 `/admin/login` 時會被同一個 layout 攔截、`redirect("/admin/login")`，形成無限重定向。因此拆成：`src/app/admin/layout.tsx`（root layout，僅提供 `<html>/<body>`，不做權限檢查）＋ `src/app/admin/(protected)/layout.tsx`（route group，不影響網址，僅套用在除了 `/admin/login` 以外的頁面，做實際的角色判斷）。`/admin/login/page.tsx` 自己有「已登入且為 ADMIN 則導向 `/admin`」的邏輯，不需要外層 layout 幫忙。

**4. 第一個 ADMIN 帳號的建立流程：使用者建 Auth 帳號 → 給我 UUID → 我建對應 `User` 資料列**
不做任何「自動把第一個註冊的人設成 ADMIN」之類的特殊邏輯。
理由：這本來就是規格書要求的「無公開註冊入口」，第一個（也是唯一一個）ADMIN 帳號本質上是一次性的手動設定動作，做成自動化特殊邏輯反而是多餘的複雜度，且會留下一個「誰都能觸發變成 ADMIN」的安全隱憂（即使只在極短時間窗口內）。

**5. 登入用 Server Action，不用 Client Component 直接呼叫 Supabase Auth**
`/admin/login` 的表單是 Client Component（處理輸入與錯誤顯示），但送出時呼叫 Server Action，Server Action 內用 `src/lib/supabase/server.ts` 的 client 呼叫 `signInWithPassword`，成功後設定 cookie 並用 `redirect("/admin")`。
理由：與 `lessons-page`／`commissions-page` 已經確立的「Server Action 處理表單提交」模式一致；帳密驗證邏輯留在伺服器端，不需要額外的 API Route。

## Risks / Trade-offs

- [風險] Middleware 只刷新 session、不查角色，代表理論上一個「已登入但非 ADMIN」的使用者，在 layout 檢查完成前的極短暫時間內，middleware 這一層不會擋下它 → 緩解：實際渲染內容的權限判斷仍然在 layout 裡對每一次請求執行（Server Component 每次請求都重新渲染，不會有「畫面先閃現後台內容才被踢出」的情況，因為 layout 在把 children 傳給瀏覽器之前就已經 `redirect()` 了）
- [風險] 目前只有一個 ADMIN 帳號，若忘記密碼沒有自助復原流程 → 緩解：已於 Non-Goals 記錄；音樂人可直接到 Supabase Dashboard 重設密碼，不需要應用層的忘記密碼頁面

## Open Questions

（無——帳號建立流程需要使用者配合，屬於執行步驟而非待決策問題）
