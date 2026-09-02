## Purpose

讓訪客能針對單一樂譜完成結帳，導向綠界收銀台完成付款。

## ADDED Requirements

### Requirement: 結帳頁顯示樂譜資訊並收集必要付款資料
`/checkout/[sheetId]` SHALL 顯示該樂譜的標題與價格，並提供表單收集 Email 與付款方式（信用卡／WebATM／超商代碼）。

#### Scenario: 造訪已上架樂譜的結帳頁
- **WHEN** 訪客造訪一個已上架樂譜的 `/checkout/[sheetId]`
- **THEN** 頁面 SHALL 顯示該樂譜標題與價格，以及 Email 與付款方式欄位

#### Scenario: 造訪不存在或未上架樂譜的結帳頁
- **WHEN** `sheetId` 對應的樂譜不存在，或存在但 `isPublished: false`
- **THEN** 系統 SHALL 回傳 404

### Requirement: 送出結帳表單會建立待付款訂單並導向綠界
表單送出後，系統 SHALL 建立一筆 `status: PENDING` 的 `Order`（含對應 `OrderItem`），產生綠界收銀台所需的簽章參數，並將瀏覽器導向綠界付款頁。

#### Scenario: 成功送出結帳表單
- **WHEN** 訪客填妥 Email 與付款方式並送出
- **THEN** 系統 SHALL 建立一筆 `PENDING` 訂單，`totalAmount` 等於樂譜價格，並將瀏覽器導向綠界收銀台，帶有正確簽章的 `CheckMacValue`

#### Scenario: Email 格式不正確
- **WHEN** 訪客填入格式不正確的 Email
- **THEN** 系統 SHALL 阻擋送出並提示格式錯誤，不得建立訂單

### Requirement: 每筆訂單的商家交易編號唯一
系統 SHALL 為每次結帳產生唯一的 `merchantTradeNo`，符合綠界規定的格式（英數字、20 字元以內）。

#### Scenario: 短時間內連續建立多筆訂單
- **WHEN** 同一秒內有多個訪客分別完成結帳
- **THEN** 每筆訂單的 `merchantTradeNo` SHALL 互不相同
