## Purpose

讓國際買家能用自己國家發行的信用卡、Apple Pay、Google Pay 購買樂譜，不受限於綠界僅支援台灣本地發卡的限制。

## ADDED Requirements

### Requirement: 結帳頁提供 Stripe 作為第二個付款選項
`/checkout/[sheetId]` SHALL 在既有的綠界付款按鈕旁提供 Stripe 付款按鈕，兩者共用同一份 Email 欄位與樂譜資訊。

#### Scenario: 選擇 Stripe 付款
- **WHEN** 訪客填妥 Email 並點擊 Stripe 付款按鈕
- **THEN** 系統 SHALL 建立一筆 `provider: STRIPE`、`status: PENDING` 的訂單，並將瀏覽器導向 Stripe 託管的付款頁

### Requirement: Stripe 訂單以新台幣計價
建立 Stripe Checkout Session 時，SHALL 使用新台幣（TWD）作為計價幣別，金額 SHALL 與該樂譜的 `SheetMusic.price` 一致。

#### Scenario: 建立 Stripe Checkout Session
- **WHEN** 系統為某筆樂譜建立 Stripe Checkout Session
- **THEN** Session 的幣別 SHALL 為 `twd`，金額 SHALL 等於該樂譜當下的 `price`

### Requirement: 樂譜下架或不存在時阻擋建立訂單
`POST /api/payment/stripe-checkout` SHALL 在建立 Session 前重新確認樂譜存在且已上架，不符合時 MUST NOT 建立訂單或 Stripe Session。

#### Scenario: 樂譜已被下架
- **WHEN** 訪客送出結帳請求，但該樂譜的 `isPublished` 已變為 `false`
- **THEN** 系統 SHALL 拒絕建立訂單，不呼叫 Stripe API
