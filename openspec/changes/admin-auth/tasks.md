## 1. Supabase Auth 基礎設施

- [x] 1.1 安裝 `@supabase/ssr`、`@supabase/supabase-js`
- [x] 1.2 建立 `src/lib/supabase/server.ts`：`createClient()` 綁定 `next/headers` 的 cookies，供 Server Component／Server Action 使用
- [x] 1.3 建立 `src/lib/supabase/middleware.ts`：`updateSession(request)` 綁定 request/response cookies，刷新 Supabase session

## 2. Middleware 路由分流

- [x] 2.1 修改 `src/middleware.ts`：請求路徑以 `/admin` 開頭時執行 `updateSession`，其餘路徑維持原本的 next-intl middleware
- [x] 2.2 驗證：造訪 `/admin` 網址不會被加上語系前綴（不會變成 `/zh-TW/admin`）；造訪一般頁面（如 `/sheets`）語系路由行為不受影響 —— `/admin` 直接命中 `updateSession` 分支（見 2.1），未經過 next-intl；其餘路由行為未變動（middleware 邏輯本身未觸碰 else 分支）

## 3. 登入頁與登入邏輯

- [x] 3.1 建立 `src/app/admin/login/page.tsx`：若已登入且為 ADMIN，`redirect("/admin")`；否則渲染登入表單
- [x] 3.2 建立 `src/components/admin/LoginForm.tsx`（Client Component）：Email／密碼欄位，送出時呼叫 Server Action，處理 loading／錯誤狀態
- [x] 3.3 建立 `src/app/admin/login/actions.ts`：`login(formData)` 呼叫 `supabase.auth.signInWithPassword`，成功時 `redirect("/admin")`，失敗時回傳結構化錯誤供表單顯示

## 4. 後台存取保護與登出

- [x] 4.0 建立 `src/app/admin/layout.tsx` 作為 root layout（提供 `<html>/<body>`，因為 `/admin` 在 `[locale]` 之外沒有可繼承的 root layout）；不在此做權限檢查，避免套用到 `/admin/login` 造成無限重定向（詳見 design.md 決策 3 補充）
- [x] 4.1 建立 `src/app/admin/(protected)/layout.tsx`（route group，不影響網址）：取得 Supabase session（`supabase.auth.getUser()`），未登入則 `redirect("/admin/login")`；已登入則用 Prisma 查 `User.findUnique({ where: { id: user.id } })`，`role !== 'ADMIN'`（含查無資料）一律 `redirect("/admin/login")`
- [x] 4.2 建立 `src/app/admin/(protected)/actions.ts`：`logout()` 呼叫 `supabase.auth.signOut()`，`redirect("/admin/login")`
- [x] 4.3 建立 `src/app/admin/(protected)/page.tsx`：登入後的最小首頁（網址仍是 `/admin`），顯示「已登入為 ADMIN」與登出按鈕，作為後續 A2-A6 頁面的掛載點

## 5. 建立第一個 ADMIN 帳號（需使用者協助）

- [x] 5.1 請使用者於 Supabase Dashboard → Authentication → Users 建立一個 Auth 使用者（Email／密碼），並提供該帳號的 UUID 與 Email —— UUID `0caace8e-51d2-48dd-b988-cc3df69021a7`，Email `joannewu0314@gmail.com`
- [x] 5.2 依使用者提供的 UUID，透過 Prisma 建立對應的 `public.User` 資料列（`id` = 該 UUID，`role: ADMIN`，`email` = 使用者提供的 Email）

## 6. 整體驗收

- [x] 6.1 執行 `npx tsc --noEmit` 與 `npm run lint`，確認無錯誤 —— 皆無錯誤（`npx eslint src --quiet` 亦通過）
- [x] 6.2 瀏覽器驗證：未登入直接造訪 `/admin` 導向 `/admin/login` —— 確認，`window.location.href` 為 `/admin/login`
- [x] 6.3 瀏覽器驗證：使用第 5 步建立的帳密登入成功，導向 `/admin`，顯示已登入狀態 —— 使用者以真實 ADMIN 帳密登入確認成功
- [x] 6.4 瀏覽器驗證：輸入錯誤密碼登入失敗，顯示錯誤訊息，停留在登入頁 —— 確認，顯示「帳號或密碼錯誤」，網址仍為 `/admin/login`
- [ ] 6.5 瀏覽器驗證：已登入時造訪 `/admin/login` 直接導向 `/admin` —— 待 5.1/5.2 完成後測試
- [ ] 6.6 瀏覽器驗證：點擊登出後，再次造訪 `/admin` 導向 `/admin/login` —— 待 5.1/5.2 完成後測試
- [ ] 6.7 驗證非 ADMIN 角色被擋下：可暫時建立一筆 `role: USER` 的測試 User 資料列並用對應 Auth 帳號測試（若無法輕易建立測試 Auth 帳號，至少以程式碼檢視 `layout.tsx` 的角色判斷邏輯確認正確，並記錄於此）—— 待 5.1 完成後測試
