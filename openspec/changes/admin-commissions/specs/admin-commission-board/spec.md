## Purpose

讓音樂人不需要工程師協助，就能在單一畫面看到所有教學詢問與委託邀約，優先處理尚未回覆的項目。

## ADDED Requirements

### Requirement: 委託清單顯示完整聯繫資訊，未處理項目排前面
`/admin/commissions` SHALL 列出所有 `Commission`（涵蓋 `LESSON`／`TRANSCRIPTION`／`COLLABORATION` 三種類型），每筆顯示類型、姓名、Email、電話（如有）、參考連結（如有）、委託內容、建立時間。排序 SHALL 為未處理（`isHandled: false`）優先於已處理，各自區塊內依建立時間新到舊排序。

#### Scenario: 存在未處理與已處理的委託
- **WHEN** 資料庫中同時有 `isHandled: false` 與 `isHandled: true` 的 `Commission`
- **THEN** 未處理項目 SHALL 全部顯示在已處理項目之前

#### Scenario: 委託包含選填欄位
- **WHEN** 某筆 `Commission` 有填寫 `phone` 或 `audioUrl`
- **THEN** 該筆紀錄 SHALL 顯示這些欄位；未填寫時 SHALL 不顯示空白欄位

### Requirement: 可切換委託的處理狀態，且清單完全不提供刪除或編輯內容的介面
`/admin/commissions` SHALL 提供切換單筆 `isHandled` 狀態的功能；不 SHALL 提供刪除或編輯委託內容（姓名、Email、詳情等）的介面。

#### Scenario: 標記一筆委託為已處理
- **WHEN** ADMIN 將某筆委託的處理狀態勾選為已處理
- **THEN** 系統 SHALL 更新該筆 `Commission.isHandled` 為 `true`，且該筆紀錄的排序 SHALL 移到已處理區塊（排在所有未處理項目之後）

#### Scenario: 取消標記已處理
- **WHEN** ADMIN 將某筆已處理的委託取消勾選
- **THEN** 系統 SHALL 更新該筆 `Commission.isHandled` 為 `false`，排序移回未處理區塊
