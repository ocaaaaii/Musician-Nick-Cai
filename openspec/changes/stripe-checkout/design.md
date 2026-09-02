## Context

`checkout-flow` 已經建好「建立 PENDING 訂單→導向金流頁→webhook 驗證→更新 SUCCESS→R2 簽章網址→Resend 寄信」這整套模式，且驗證過金流簽章驗證＋金額比對的重要性。這裡是同一個模式的第二次套用，付款服務商從綠界換成 Stripe，下游（R2／Resend）完全重用不變。

## Goals / Non-Goals

**Goals:**
- 國際買家能用自己國家發行的卡片、Apple Pay、Google Pay 完成購買
- 不重新設計已經驗證過的「webhook 驗證→交付」核心邏輯，只替換金流服務商特定的部分（簽章演算法、API 呼叫方式）
- 兩個金流的訂單記錄在同一張 `Order` 表，後台 `/admin/orders` 不需要改動就能看到兩種來源的訂單

**Non-Goals:**
- 不做多幣別／依地區自動定價
- 不做「自動判斷買家所在地、推薦適合的金流」——由買家自己選

## Decisions

**1. 用 Stripe Checkout（託管付款頁），不用 Stripe Elements 自建表單**
`stripe.checkout.sessions.create()` 產生一個 Stripe 託管的付款頁網址，直接 303 導向過去；不在自己的網站上用 Stripe.js 刻信用卡輸入框。
理由：與綠界的 AioCheckOut 模式（伺服器產生表單/連結→導向服務商託管頁）完全一致，不需要另外處理 PCI 合規、卡號輸入 UI、3D Secure 驗證流程——這些 Stripe Checkout 全部內建處理好。Apple Pay／Google Pay 也是 Checkout 頁面內建，不需要另外整合 Stripe.js 的 Payment Request Button。

**2. `Order.merchantTradeNo` 重用作為通用的「服務商交易參照 ID」，不新增 `stripeSessionId` 欄位**
Stripe 訂單建立時，`merchantTradeNo` 存的是 Stripe Checkout Session 的 `session.id`（如 `cs_test_...`），不是綠界格式的商家交易編號。
理由：這個欄位本質上就是「這筆訂單在外部金流系統裡的唯一識別碼」，兩邊都需要靠它在 webhook 收到通知時反查對應的 `Order`；新增一個平行的 `stripeSessionId` 欄位只會讓查詢邏輯要多判斷「該查哪個欄位」，而 `merchantTradeNo` 已經是 `@unique`，直接重用語意上完全合理，只是欄位命名還留著綠界的痕跡（可接受的技術債，不影響正確性）。

**3. 兩個金流都用新台幣（TWD）計價，不做多幣別**
Stripe Checkout Session 的 `currency` 設定為 `"twd"`，`unit_amount` 直接用 `SheetMusic.price`（TWD 是 Stripe 的「零小數」貨幣，金額不用乘以 100）。國際買家看到的價格仍是 NT$ 計價，實際扣款金額由買家發卡銀行的匯率換算決定。
理由：`SheetMusic.price` 目前只有單一 TWD 欄位，做多幣別需要另外維護匯率或每個商品輸入多組價格，這對「音樂人一人維運、樂譜定價通常是台幣幾百塊」的情境是不成比例的複雜度；用 TWD 計價讓國際買家用信用卡付款是完全常見且被廣泛接受的模式（等同於任何美金計價商品被非美國持卡人購買時的情況），Stripe／Visa／Mastercard 都原生支援這種跨幣別扣款。

**4. Stripe webhook 驗證用官方 SDK 的 `stripe.webhooks.constructEvent`，讀取原始 request body**
`stripe-callback` route 用 `request.text()` 取得未解析的原始 body（不能先 JSON.parse，簽章是對原始位元組算的），搭配 `Stripe-Signature` header 與 `STRIPE_WEBHOOK_SECRET` 呼叫 SDK 內建的驗證函式。
理由：這是 Stripe 官方文件明確要求的作法，手動重新實作簽章演算法（像 `ecpay.ts` 那樣自己刻）沒有必要——Stripe 的 Node SDK 已經提供這個驗證函式，直接用比自己重寫更不容易出錯。

**5. 金額驗證比對 `session.amount_total` 與資料庫訂單金額，邏輯與 ECPay 對稱**
延續 `checkout-flow` design.md 的原則：`CheckMacValue`／Stripe 簽章只證明「這個請求真的來自服務商」，不保證金額沒有在別處被竄改，所以額外比對金額是必要的第二層防護，兩個服務商的 webhook handler 都要做。

**6. `/checkout/[sheetId]` 表單用兩個 `formaction` 不同的送出按鈕，不引入 Client Component**
沿用同一個 `<form>`（Email、隱藏 `sheetMusicId`、綠界專屬的付款方式 radio），新增第二顆按鈕 `<button formaction="/api/payment/stripe-checkout">`，瀏覽器原生支援依點擊的按鈕決定表單送去哪個 `action`，不需要 JavaScript 或把頁面改成 Client Component。
理由：`checkout-flow` 的頁面本來就刻意保持純 Server Component＋原生表單（不需要為了「選一個要導向的網址」這種小事引入客戶端狀態管理），`formaction` 是瀏覽器原生就支援的標準屬性，完全達成需求且維持這個簡單性。

## Risks / Trade-offs

- [風險] 使用者要求先建好架構、金鑰稍後給，這次沒有真實 Stripe 帳號可以做端對端測試 → 緩解：已於 proposal.md 記錄；驗收範圍限縮在型別檢查、程式碼審視、確認既有綠界流程無回歸，實際 Stripe 呼叫留給使用者提供金鑰後補測
- [風險] TWD 計價對某些國際買家來說可能不如原生幣別直覺 → 緩解：已於 Decision 3 記錄為刻意的簡化取捨
- [風險] Apple Pay 需要在 Stripe Dashboard 手動驗證網域才會顯示，程式碼本身無法完成這一步 → 緩解：已於 proposal.md 記錄，會在使用者設定好金鑰、實際可用時提醒這個手動步驟

## Open Questions

（無）
