## Context

`sheet-music-store` 已建立第一個讀取真實 Prisma 資料的模式（Server Component 查詢 + 明確 `isPublished` 過濾）。本頁沿用同一原則，並新增第一個「訪客可寫入資料」的表單流程——`sheet-music-store` 的購物車故意留白，這裡則是本專案第一個真正落地的訪客寫入功能。

## Goals / Non-Goals

**Goals:**
- `/lessons` 動態呈現教學方案，音樂人改資料庫內容即反映在頁面（雖然後台 CMS 尚未建置，但資料層已支援）
- 建立可重複使用的「Server Action 表單提交」模式，供之後 `/commissions` 或其他表單參考
- 表單驗證前後端一致，不因跳過前端而能寫入無效資料

**Non-Goals:**
- 不寄送自動通知信（Resend 未設定）
- 不做垃圾訊息防護
- 不做 `/commissions` 頁面或抽出共用表單元件——目前只有一個消費者，抽象為時過早

## Decisions

**1. 表單提交用 Next.js Server Action，不建立獨立 API Route**
在 `src/app/[locale]/lessons/actions.ts` 定義一個 `"use server"` 函式，前端表單元件直接呼叫，回傳結構化的成功/錯誤結果供前端顯示狀態。
理由：Server Action 是目前 Next.js App Router 官方建議的表單處理方式，比手刻 API Route 少一層樣板程式碼；且天生具備 CSRF 防護（same-origin 限制）。

**2. 前後端驗證用同一份規則定義，不重複寫兩套邏輯**
用一個簡單的驗證函式（`validateLessonInquiry`）同時被 Client Component（即時欄位提示）與 Server Action（送出前最終把關）呼叫。
理由：`sheet-music-store` 的 spec 已經確立「不能只靠前端驗證」的原則；共用同一份規則能保證兩邊行為一致，不會出現「前端說可以送、後端卻拒絕」或反過來的落差。

**3. Calendly／表單的切換用簡單條件渲染，不建立額外的「顯示模式」設定欄位**
`ProfileConfig.calendlyUrl` 有值就渲染 iframe，否則渲染表單，兩者互斥即可，不需要額外的 enum 欄位描述「目前用哪種模式」。
理由：`calendlyUrl` 本身有沒有值就已經足夠表達這個二選一狀態，多加一個設定欄位是不必要的間接層。

**4. 送出成功後表單改為「已送出」的唯讀狀態，不做倒數重新開放**
成功送出後，表單元件切換成顯示感謝訊息的狀態，不提供「再送一次」的按鈕（使用者要再詢問可以重新整理頁面）。
理由：符合 spec 的「MUST 清空或停用以避免重複送出」要求，且不需要額外設計節流/重複提交防護邏輯——重新整理頁面本身就是最簡單的節流機制。

## Risks / Trade-offs

- [風險] 沒有垃圾訊息防護，公開表單可能被機器人濫用寫入大量無效 `Commission` 紀錄 → 緩解：已於 Non-Goals 記錄為已知風險；後台委託清單（尚未建置）之後可加已讀/封鎖機制，屬於獨立 change
- [風險] 沒有 Resend，音樂人不會即時收到通知，只能靠自己去看資料庫或之後的後台 → 緩解：已於 proposal.md 明確排除並說明原因，待 Resend change 完成後再接上
- [風險，套用時發現，修正 `sheet-music-store` design.md 先前的錯誤結論] 手動測試 `/lessons` 時，瀏覽器意外跳轉到未建立過的 `/commissions` 路徑，觸發 Next.js 14 的 `not-found.tsx doesn't have a root layout` 錯誤。原因：`sheet-music-store` 當初建立的 `src/app/not-found.tsx`（自帶 `<html>/<body>`，處理「完全不匹配任何語系」的邊緣情況）本身就違反 Next.js 的限制——因為專案的實際根 layout 是 `[locale]/layout.tsx` 而非 `app/layout.tsx`，Next.js 不認得這種「用 not-found.tsx 自己充當根 layout」的寫法 → 修正：刪除 `src/app/not-found.tsx`；改為新增 `src/app/[locale]/[...catchAll]/page.tsx`，內容只呼叫 `notFound()`。middleware 已保證所有實際渲染到 App Router 的路徑都帶有語系前綴，因此這個 catch-all 頁面能攔截所有「有語系前綴但沒有對應頁面」的路徑，讓 `notFound()` 正常冒泡到同層的 `[locale]/not-found.tsx`，不再需要（也不能有）自帶 `<html>` 的根層級 not-found

## Open Questions

（無）
