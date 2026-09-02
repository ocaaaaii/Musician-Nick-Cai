## Why

音樂人的目標是「賣譜給全世界」，但綠界（ECPay）個人賣家帳號 2023 年起已不支援海外發卡信用卡交易，且不論等級一律只能新台幣結算；WebATM／超商代碼更是完全只有台灣本地買家能用。這代表現行結帳流程實質上排除了絕大多數國際買家。與使用者確認：加入 Stripe 作為第二個付款選項，與綠界並存——綠界服務台灣買家（含超商代碼等在地支付習慣），Stripe 服務國際買家（支援幾乎所有國家發卡、真正的 Apple Pay／Google Pay）。

## What Changes

- `Order` 新增 `provider`（`ECPAY`／`STRIPE`）欄位，記錄這筆訂單走哪個金流
- 建立 `POST /api/payment/stripe-checkout`：建立 Stripe Checkout Session（`mode: payment`），建立對應 `PENDING` 訂單，303 導向 Stripe 的付款頁
- 建立 `POST /api/payment/stripe-callback`：驗證 Stripe webhook 簽章，處理 `checkout.session.completed` 事件，驗證金額，更新訂單為 `SUCCESS`，重用既有的 R2 簽章網址與 Resend 寄信邏輯
- `/checkout/[sheetId]` 表單新增第二個送出按鈕（用 `formaction` 屬性指向 Stripe 的 route，不需要 JavaScript），與既有的綠界按鈕並列
- 幣別維持新台幣（TWD）——見 design.md Decision 3，不做多幣別

## Capabilities

### New Capabilities
- `stripe-checkout`: 建立 Stripe 訂單並導向 Stripe 付款頁的行為
- `stripe-payment-callback`: 驗證 Stripe 付款結果、更新訂單、自動交付下載連結的行為

### Modified Capabilities

（無——`ecpay-checkout`／`ecpay-payment-callback` 邏輯不變，只是現在是兩個選項之一）

## Impact

- 新增：`src/lib/stripe.ts`、`src/app/api/payment/stripe-checkout/route.ts`、`src/app/api/payment/stripe-callback/route.ts`
- 修改：`prisma/schema.prisma`（`Order.provider` 欄位＋新 enum，需要 migration）、`src/app/[locale]/checkout/[sheetId]/page.tsx`（新增 Stripe 按鈕）
- 安裝 `stripe` 套件；新增 `STRIPE_SECRET_KEY`／`STRIPE_WEBHOOK_SECRET` 環境變數
- **待使用者提供**：Stripe 測試金鑰（`sk_test_...`）——使用者要求先把架構建好，金鑰稍後給，因此這次 apply 時無法真正呼叫 Stripe API 做端對端測試，只能驗證程式碼結構、型別、既有流程無回歸
- **不包含**：多幣別／依買家所在地自動換算價格——見 design.md Decision 3
- **不包含**：Apple Pay 網域驗證（Stripe Dashboard 端的手動設定，不是程式碼工作）——留給使用者在拿到金鑰、實際啟用 Stripe 後自行完成，會在完成時提醒
