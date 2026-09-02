## Purpose

在 Stripe 確認付款成功後，安全地更新訂單狀態並自動交付樂譜下載連結，行為與綠界的 webhook 對稱一致。

## ADDED Requirements

### Requirement: Webhook 必須驗證簽章與金額才能標記訂單成功
`POST /api/payment/stripe-callback` SHALL 用 Stripe SDK 驗證 `Stripe-Signature` header 與原始請求內容；驗證失敗時 MUST NOT 處理該請求內容。驗證通過後，SHALL 額外比對 Stripe 回傳的金額與訂單金額是否一致，不一致時 MUST NOT 將訂單標記為 `SUCCESS`。

#### Scenario: 簽章驗證失敗
- **WHEN** 請求的 `Stripe-Signature` 無法用設定的 webhook secret 驗證通過
- **THEN** 系統 SHALL 拒絕該請求，不更新任何訂單狀態

#### Scenario: 金額不符
- **WHEN** 簽章驗證通過，但 Stripe 回傳的金額與資料庫訂單金額不一致
- **THEN** 系統 SHALL 拒絕該請求，不將訂單標記為 `SUCCESS`

### Requirement: 付款完成事件會更新訂單並自動交付下載連結
收到 `checkout.session.completed` 事件且驗證通過時，系統 SHALL 將對應訂單更新為 `SUCCESS`，為訂單內每筆樂譜產生時效 24 小時的 R2 簽章下載網址，並透過 Resend 寄送至買家 Email——與綠界 webhook 使用相同的下游邏輯。

#### Scenario: Stripe 付款完成
- **WHEN** 系統收到驗證通過的 `checkout.session.completed` 事件，且金額比對相符
- **THEN** 系統 SHALL 將對應訂單 `status` 更新為 `SUCCESS`，寄出包含該訂單所有樂譜下載連結的信件到訂單的 `userEmail`

#### Scenario: 找不到對應訂單
- **WHEN** 事件中的 Session ID 在資料庫查無對應訂單
- **THEN** 系統 SHALL 不建立新訂單，安全地結束處理
