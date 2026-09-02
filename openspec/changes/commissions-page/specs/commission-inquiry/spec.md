## Purpose

讓訪客能提交具體的採譜委託或合作邀約需求，並讓音樂人日後查看委託清單時能立刻分辨這是哪一種請求、需要什麼樣的參考資料。

## ADDED Requirements

### Requirement: 委託類型可選擇且會寫入對應紀錄
表單 SHALL 提供委託類型選項（採譜委託／合作邀約），使用者選擇的類型 MUST 對應寫入 `Commission.type`（`TRANSCRIPTION` 或 `COLLABORATION`）。

#### Scenario: 選擇採譜委託送出
- **WHEN** 使用者選擇「採譜委託」並填妥其餘欄位送出
- **THEN** 系統 SHALL 建立一筆 `type: TRANSCRIPTION` 的 `Commission` 紀錄

#### Scenario: 選擇合作邀約送出
- **WHEN** 使用者選擇「合作邀約」並填妥其餘欄位送出
- **THEN** 系統 SHALL 建立一筆 `type: COLLABORATION` 的 `Commission` 紀錄

### Requirement: 參考音檔為選填但格式須合理
表單 SHALL 提供參考音檔／YouTube 連結欄位，此欄位為選填；若使用者有填寫，MUST 是格式合理的網址，格式不合理時 MUST 阻擋送出並提示。

#### Scenario: 留空參考連結
- **WHEN** 使用者不填寫參考音檔／YouTube 連結欄位直接送出（其餘必填欄位皆已填妥）
- **THEN** 系統 SHALL 允許送出成功

#### Scenario: 填寫格式不合理的參考連結
- **WHEN** 使用者在參考連結欄位填入不像網址的文字（如純文字、缺少協定）
- **THEN** 系統 SHALL 阻擋送出並提示格式錯誤

### Requirement: 必填欄位驗證且前後端一致
姓名、Email、委託內容說明 SHALL 為必填，驗證規則 MUST 同時存在於前端即時提示與伺服器端最終把關，不可只靠前端。

#### Scenario: 略過前端直接呼叫伺服器端
- **WHEN** 必填欄位缺漏的請求直接呼叫伺服器端的送出邏輯
- **THEN** 伺服器端 SHALL 拒絕寫入並回傳錯誤，不建立 `Commission` 紀錄

### Requirement: 提交成功與失敗的明確呈現
成功時 SHALL 顯示明確成功訊息並將表單轉為唯讀狀態；失敗時 SHALL 顯示錯誤訊息且畫面 MUST NOT 呈現成功狀態。

#### Scenario: 伺服器端寫入失敗
- **WHEN** 表單驗證通過但資料庫寫入過程發生錯誤
- **THEN** 系統 SHALL 顯示送出失敗的錯誤訊息，表單 MUST 維持可編輯狀態供使用者重試
