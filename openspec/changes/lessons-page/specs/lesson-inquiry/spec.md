## Purpose

讓有興趣的訪客能實際留下聯絡方式與需求，而不是看完價格後找不到下一步行動；同時避免無效或空白的詢問污染音樂人的委託清單。

## ADDED Requirements

### Requirement: Calendly 與表單擇一呈現
`/lessons` 頁面 SHALL 依 `ProfileConfig.calendlyUrl` 是否有值決定呈現方式：有值時嵌入 Calendly，無值時呈現詢問表單，兩者 MUST NOT 同時顯示。

#### Scenario: 尚未設定 Calendly 連結
- **WHEN** `ProfileConfig.calendlyUrl` 為空
- **THEN** 頁面 SHALL 顯示詢問表單，不嘗試嵌入任何 iframe

#### Scenario: 已設定 Calendly 連結
- **WHEN** `ProfileConfig.calendlyUrl` 有值
- **THEN** 頁面 SHALL 嵌入該連結的 Calendly iframe，不顯示詢問表單

### Requirement: 表單必填欄位驗證
詢問表單 SHALL 要求姓名、Email、訊息內容為必填，電話為選填；Email 格式不正確或必填欄位空白時 MUST 阻擋送出並顯示錯誤提示，且此驗證 MUST 同時存在於前端與伺服器端（不可只靠前端）。

#### Scenario: 必填欄位留白直接送出
- **WHEN** 使用者未填寫姓名或訊息內容就按下送出
- **THEN** 系統 SHALL 阻擋送出並提示哪些欄位必填，不呼叫伺服器端寫入

#### Scenario: 略過前端直接呼叫伺服器端
- **WHEN** 必填欄位缺漏的請求直接呼叫伺服器端的送出邏輯（略過前端驗證）
- **THEN** 伺服器端 SHALL 拒絕寫入並回傳錯誤，不建立 `Commission` 紀錄

### Requirement: 提交成功寫入委託紀錄
表單驗證通過後，系統 SHALL 建立一筆 `Commission` 紀錄，`type` 為 `LESSON`，`isHandled` 預設為否，並向使用者顯示明確的成功狀態。

#### Scenario: 成功提交
- **WHEN** 使用者填妥所有必填欄位並送出
- **THEN** 系統 SHALL 寫入一筆 `Commission` 紀錄且 `isHandled` 為否，並顯示送出成功的訊息，表單 MUST 清空或停用以避免重複送出

### Requirement: 提交失敗時的呈現
當伺服器端寫入失敗（如資料庫連線問題），系統 SHALL 顯示明確的錯誤訊息，且 MUST NOT 誤導使用者以為已送出成功。

#### Scenario: 伺服器端寫入失敗
- **WHEN** 表單驗證通過但資料庫寫入過程發生錯誤
- **THEN** 系統 SHALL 顯示送出失敗的錯誤訊息，且畫面狀態 MUST NOT 呈現「已送出成功」
