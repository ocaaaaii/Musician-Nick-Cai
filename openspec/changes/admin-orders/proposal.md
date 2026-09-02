## Why

技術規格書 A5「訂單與收入統計」尚未開發。目前音樂人完全無法查看樂譜商店的訂單與收入狀況，只能靠工程師直接查資料庫。

## What Changes

- 建立 `/admin/orders` 頁面：列出所有訂單（買家 Email、購買曲目、金額、付款狀態、時間），依建立時間新到舊排序
- 顯示收入統計：總營收（僅計 `SUCCESS` 訂單）、各付款狀態的訂單數（`PENDING`／`SUCCESS`／`FAILED`）
- **不包含**「重發樂譜下載信」按鈕（技術規格書 A5 提到的功能）——這需要 Resend（寄信服務）與 P3 結帳流程（ECPay webhook、R2 簽章下載連結產生）先就緒，目前兩者都還沒建立；「補發」邏輯本質上要重用「第一次寄送」的同一套程式碼，在還沒有「第一次寄送」可以重用之前，做一個獨立的補發功能是本末倒置。這部分留到 P3（結帳與自動交付）與 Resend 一起做

## Capabilities

### New Capabilities
- `admin-order-viewing`: 後台檢視訂單清單與收入統計的行為

### Modified Capabilities

（無）

## Impact

- 新增：`src/app/admin/(protected)/orders/page.tsx`，`src/components/admin/OrderList.tsx`
- `src/app/admin/(protected)/page.tsx` 的模組清單「訂單與收入統計」項目改為可點擊連結
- 這是純檢視頁面，不需要 Server Action（沒有寫入操作）
- **不包含**：重發下載信（見上方 Why）、匯出報表、依時間區間篩選的圖表——這些超出目前最小可用範圍，且沒有明確規格要求
