## Purpose

在綠界確認付款結果後，安全地更新訂單狀態並自動把樂譜下載連結交付給買家，不需要音樂人手動介入。

## ADDED Requirements

### Requirement: Webhook 必須驗證簽章與金額才能標記訂單成功
`POST /api/payment/ecpay-callback` SHALL 重新計算收到參數的 `CheckMacValue` 並與請求中的值比對；SHALL 額外驗證回傳金額與訂單金額相符。任一驗證失敗時 MUST NOT 將訂單標記為 `SUCCESS`。

#### Scenario: 簽章驗證失敗
- **WHEN** 收到的請求 `CheckMacValue` 與重新計算的值不一致
- **THEN** 系統 SHALL 拒絕該請求，不更新任何訂單狀態

#### Scenario: 金額不符
- **WHEN** 簽章驗證通過，但 `TradeAmt` 與資料庫訂單的 `totalAmount` 不一致
- **THEN** 系統 SHALL 拒絕該請求，不將訂單標記為 `SUCCESS`

#### Scenario: 找不到對應訂單
- **WHEN** 收到的 `MerchantTradeNo` 在資料庫中查無對應訂單
- **THEN** 系統 SHALL 回應失敗，不建立新訂單

### Requirement: 驗證通過的成功付款會更新訂單並自動交付下載連結
驗證通過且 `RtnCode` 表示交易成功時，系統 SHALL 將對應訂單更新為 `SUCCESS`（含 `tradeNo`、`paymentMethod`），為訂單內每筆樂譜產生時效 24 小時的 R2 簽章下載網址，並透過 Resend 寄送包含下載連結的信件至買家 Email。

#### Scenario: 付款成功
- **WHEN** 綠界回傳 `RtnCode: 1` 且金額與簽章驗證皆通過
- **THEN** 系統 SHALL 將訂單 `status` 更新為 `SUCCESS`，寄出包含該訂單所有樂譜下載連結的信件到 `Order.userEmail`

#### Scenario: 綠界回傳付款失敗
- **WHEN** 綠界回傳的 `RtnCode` 不等於 `1`
- **THEN** 系統 SHALL 將訂單 `status` 更新為 `FAILED`，不產生下載連結、不寄送信件

### Requirement: Webhook 依綠界規定的格式回應
系統 SHALL 依綠界規定回應純文字 `1|OK`（處理成功）或 `0|Error`（處理失敗），讓綠界判斷是否需要重試通知。

#### Scenario: 成功處理一筆通知
- **WHEN** 系統成功處理完一筆 webhook 通知（無論訂單本身付款成功或失敗，只要通知本身被正確接收與處理）
- **THEN** 回應內容 SHALL 為純文字 `1|OK`

#### Scenario: 驗證失敗的通知
- **WHEN** 簽章或金額驗證失敗
- **THEN** 回應內容 SHALL 為純文字 `0|Error`
