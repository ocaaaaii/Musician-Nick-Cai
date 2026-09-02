## Why

技術規格書 P3「結帳與自動發送流程」尚未開發，`/sheets/[id]` 的「加入購物車」按鈕目前是停用狀態（「即將推出」），整個網站還沒有任何付款、訂單建立、或自動交付機制——樂譜商店目前只能瀏覽，不能真的購買。這是把商店從「展示」變成「能收錢」的關鍵一塊。

與使用者確認過三個前提：(1) 這次先做單本「立即購買」，不做多本購物車；(2) 使用綠界官方公開的測試環境商家憑證（`MerchantID: 2000132`），之後音樂人自己註冊真實商家帳號再更換；(3) 使用者已提供 Resend API Key。

## What Changes

- 建立 `/checkout/[sheetId]` 頁面：顯示該樂譜的標題與價格，表單填 Email、選擇付款方式（信用卡／WebATM／超商代碼），送出後導向綠界付款頁
- 建立 `POST /api/payment/ecpay-checkout`：接收結帳表單，建立 `PENDING` 狀態的 `Order`／`OrderItem`，產生綠界所需的加密參數與 `CheckMacValue`，回傳自動送出的表單頁導向綠界收銀台
- 建立 `POST /api/payment/ecpay-callback`：接收綠界 Server-to-Server 回傳，重新驗證 `CheckMacValue` 與金額，更新訂單為 `SUCCESS`，產生 R2 24 小時簽章下載連結，透過 Resend 寄送下載信
- `/sheets/[id]` 的「加入購物車」按鈕改為「立即購買」，連結至 `/checkout/[sheetId]`
- 安裝 `resend` 套件；新增 `ECPAY_*`／`RESEND_API_KEY`／`NEXT_PUBLIC_SITE_URL` 環境變數

## Capabilities

### New Capabilities
- `ecpay-checkout`: 建立訂單並導向綠界付款頁的行為
- `ecpay-payment-callback`: 驗證付款結果、更新訂單、自動交付下載連結的行為

### Modified Capabilities

（無——`/sheets/[id]` 按鈕從停用改為可用，屬於兌現既有規劃，非變更行為）

## Impact

- 新增：`src/app/[locale]/checkout/[sheetId]/page.tsx`、`src/app/api/payment/ecpay-checkout/route.ts`、`src/app/api/payment/ecpay-callback/route.ts`、`src/lib/ecpay.ts`、`src/lib/email.ts`
- 修改：`src/lib/r2.ts`（新增產生簽章 GET 網址的函式）、`src/components/sheets/SheetMusicDetail.tsx`（「加入購物車」→「立即購買」）
- **不包含**：多本購物車、Cart Drawer——見上方 Why 的決定，留待之後單獨的 change
- **不包含**：`/admin/orders` 的「重發下載信」按鈕——這個 change 補上了「第一次寄送」的邏輯，重發功能是下一步可以直接重用同一套寄信函式的小工作，但不在這次範圍內
- **已知限制**：本機開發環境（`localhost`）無法讓綠界的伺服器主動打到 `ecpay-callback`（Server-to-Server webhook 需要公開可達的網址），因此本機驗證只能測到「建立訂單＋導向綠界收銀台」這一段；`ecpay-callback` 的邏輯改用手動組出符合簽章的測試請求直接呼叫該路由來驗證，而非透過真的綠界測試付款觸發，詳見 design.md
