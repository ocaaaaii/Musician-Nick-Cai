## 1. 環境與依賴

- [x] 1.1 安裝 `stripe` 套件
- [x] 1.2 `.env` 新增 `STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`（待使用者提供，先留空/佔位）

## 2. 資料庫

- [x] 2.1 `schema.prisma`：新增 `PaymentProvider` enum（`ECPAY`／`STRIPE`），`Order` 新增 `provider PaymentProvider @default(ECPAY)`；執行 migration
- [x] 2.2 `src/app/api/payment/ecpay-checkout/route.ts` 建立訂單時明確帶入 `provider: "ECPAY"`（原本靠 schema 預設值，改為明確寫出以利閱讀）

## 3. Stripe 用戶端

- [x] 3.1 建立 `src/lib/stripe.ts`：匯出設定好 `STRIPE_SECRET_KEY` 的 Stripe SDK client 實例

## 4. `POST /api/payment/stripe-checkout`

- [x] 4.1 建立 `src/app/api/payment/stripe-checkout/route.ts`：解析表單、驗證 Email，查詢樂譜確認已上架，建立 Stripe Checkout Session（`mode: payment`、`currency: twd`、金額對應 `SheetMusic.price`），建立 `PENDING` 訂單（`provider: STRIPE`、`merchantTradeNo` 存 `session.id`），303 導向 `session.url`

## 5. `POST /api/payment/stripe-callback`

- [x] 5.1 建立 `src/app/api/payment/stripe-callback/route.ts`：讀取原始 body，用 `stripe.webhooks.constructEvent` 驗證簽章，處理 `checkout.session.completed` 事件，查詢對應訂單，驗證金額，通過後更新訂單為 `SUCCESS`＋產生 R2 簽章網址＋寄送 Resend 下載信（重用 `checkout-flow` 的既有函式）

## 6. 前台串接

- [x] 6.1 `src/app/[locale]/checkout/[sheetId]/page.tsx`：新增 Stripe 付款按鈕（`formaction="/api/payment/stripe-checkout"`），與既有綠界按鈕並列，各自加上清楚的標籤（「綠界結帳（台灣）」／「Stripe 結帳（國際／Apple Pay／Google Pay）」）；同時建立 `/checkout/success` 頁面作為 Stripe 的 `success_url` 落地頁（純資訊性，不依賴瀏覽器到達此頁判斷訂單成功——訂單狀態只由 webhook 更新）

## 7. 整體驗收

- [x] 7.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 7.2 瀏覽器驗證：`/checkout/[sheetId]` 正確顯示兩個付款按鈕
- [x] 7.3 瀏覽器驗證：確認既有綠界結帳流程無回歸——填表送出後正確建立訂單並導向綠界測試環境收銀台，訂單資訊正確顯示
- [x] 7.4 瀏覽器驗證 Stripe 路徑的程式邏輯（在沒有真實金鑰的前提下能驗證的範圍）：點擊 Stripe 按鈕正確送到 `/api/payment/stripe-checkout`，該路由正確執行到「建立 Stripe client」這一步才因為 `STRIPE_SECRET_KEY` 是空字串而丟出例外（`Neither apiKey nor config.authenticator provided`），證實表單路由、Email 驗證、樂譜查詢等前置邏輯都正確執行，只差真實金鑰。真正建立 Session、導向付款頁、webhook 驗證與更新訂單——待使用者提供 `STRIPE_SECRET_KEY` 並在 Stripe Dashboard 設定 webhook 後另行測試
