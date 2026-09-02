## Purpose

讓有興趣上課的訪客快速了解音樂人提供哪些教學方案、多少錢，且看到的內容永遠跟音樂人在後台維護的內容一致。

## ADDED Requirements

### Requirement: 僅顯示已上架的教學方案
`/lessons` 頁面 SHALL 只顯示 `ServicePackage` 中 `type` 為 `LESSON` 且 `isPublished` 為真的項目，依 `sortOrder` 排序。

#### Scenario: 存在未上架的教學方案
- **WHEN** 資料庫中有 `type: LESSON`、`isPublished: false` 的服務項目
- **THEN** 頁面 SHALL 不顯示該項目

#### Scenario: 存在其他類型的服務項目
- **WHEN** 資料庫中有 `type: TRANSCRIPTION` 或 `type: COLLABORATION` 的服務項目
- **THEN** `/lessons` 頁面 SHALL 不顯示這些項目

### Requirement: 沒有已上架方案時的降級呈現
當沒有任何已上架的 `LESSON` 服務項目時，頁面 SHALL 顯示明確的空狀態說明，而非空白區塊。

#### Scenario: 尚未設定任何教學方案
- **WHEN** 資料庫中沒有任何 `type: LESSON` 且已上架的服務項目
- **THEN** 頁面 SHALL 顯示空狀態文字，引導訪客改用聯絡方式詢問
