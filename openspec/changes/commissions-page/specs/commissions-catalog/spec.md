## Purpose

讓有委託／合作需求的訪客了解音樂人提供哪些採譜與合作服務、大致費用，並清楚分辨兩種不同性質的服務。

## ADDED Requirements

### Requirement: 依類型分組顯示已上架服務
`/commissions` 頁面 SHALL 分別顯示 `ServicePackage` 中 `type` 為 `TRANSCRIPTION`（採譜）與 `type` 為 `COLLABORATION`（合作邀約）且 `isPublished` 為真的項目，兩種類型 MUST 在畫面上可清楚區分（不得混在同一無標示的清單中）。

#### Scenario: 兩種類型皆有已上架項目
- **WHEN** 資料庫中同時存在已上架的 `TRANSCRIPTION` 與 `COLLABORATION` 項目
- **THEN** 頁面 SHALL 分別以各自的標題區塊顯示，訪客能分辨哪些是採譜服務、哪些是合作邀約

#### Scenario: 存在其他類型的服務項目
- **WHEN** 資料庫中有 `type: LESSON` 的服務項目
- **THEN** `/commissions` 頁面 SHALL 不顯示這些項目

### Requirement: 未上架項目不顯示
SHALL 只顯示 `isPublished` 為真的項目；未上架的 `TRANSCRIPTION`／`COLLABORATION` 項目 MUST NOT 出現。

#### Scenario: 存在未上架的委託服務
- **WHEN** 資料庫中有 `isPublished: false` 的 `TRANSCRIPTION` 或 `COLLABORATION` 項目
- **THEN** 頁面 SHALL 不顯示該項目

### Requirement: 個別類型無已上架項目時的降級呈現
當某一類型（採譜或合作）沒有任何已上架項目時，該類型的區塊 SHALL 顯示該類型專屬的空狀態文字，而非省略整個區塊標題或顯示空白。

#### Scenario: 合作邀約尚未設定任何項目
- **WHEN** 沒有任何已上架的 `COLLABORATION` 項目，但 `TRANSCRIPTION` 有
- **THEN** 合作邀約區塊 SHALL 顯示空狀態文字，採譜區塊正常顯示內容
