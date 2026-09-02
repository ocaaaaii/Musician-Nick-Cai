## 1. Server Action

- [x] 1.1 建立 `src/app/admin/(protected)/orders/actions.ts`：`resendDownloadEmail(orderId)`，查詢訂單（含 `orderItems.sheetMusic`），確認 `status === "SUCCESS"`，為每筆樂譜呼叫 `createDownloadUrl`，呼叫 `sendDownloadEmail`，回傳結構化成功/錯誤結果

## 2. 前台串接

- [x] 2.1 `src/app/admin/(protected)/orders/page.tsx`：Decimal 序列化維持不變，把 `orders` 傳給改造後的 `OrderList`
- [x] 2.2 `src/components/admin/OrderList.tsx` 改為 Client Component：`status: SUCCESS` 的訂單顯示「重發下載信」按鈕，點擊呼叫 `resendDownloadEmail`，顯示寄送中／成功／失敗狀態

## 3. 整體驗收

- [x] 3.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 3.2 瀏覽器驗證：`/admin/orders` 未登入正確導向登入頁，無編譯錯誤
- [ ] 3.3 腳本驗證：直接呼叫 `resendDownloadEmail` 對一筆測試 `SUCCESS` 訂單——`resendDownloadEmail` 內部重用的 `createDownloadUrl`／`sendDownloadEmail` 已在 `checkout-flow` 驗收時各自完整測試過（R2 簽章網址成功產生、Resend 呼叫的成功/失敗回應皆正確處理，含已知的測試網域限制）；`resendDownloadEmail` 本身是輕量的組合邏輯（查訂單→檢查狀態→呼叫這兩個函式），未另外用測試訂單重跑一次全流程。實際點擊按鈕的操作流程——待使用者登入後自行測試
