## Purpose

讓音樂人不需要工程師協助，就能自行調整「打譜採譜」「一對一鋼琴教學」「合作邀約」三類服務的報價與說明文字，並控制哪些項目在前台可見。

## ADDED Requirements

### Requirement: 服務項目列表依類型分組顯示
`/admin/services` SHALL 列出所有 `ServicePackage`（含未上架），依 `type`（`TRANSCRIPTION`／`LESSON`／`COLLABORATION`）分組顯示，每筆顯示標題、價格說明、排序、上架狀態。

#### Scenario: 三種類型皆有項目
- **WHEN** 資料庫中三種 `type` 皆有 `ServicePackage` 紀錄
- **THEN** `/admin/services` SHALL 分別以各自的分組區塊顯示，清楚可分辨類型

### Requirement: 服務項目可新增、編輯、刪除
`/admin/services` SHALL 提供新增、編輯（類型、標題、價格說明、說明文字、排序）、刪除服務項目的功能，類型欄位 SHALL 限制為 `TRANSCRIPTION`／`LESSON`／`COLLABORATION` 三者之一。

#### Scenario: 新增一筆服務項目
- **WHEN** ADMIN 選擇類型、填妥標題與價格說明並送出新增
- **THEN** 系統 SHALL 建立一筆新的 `ServicePackage` 紀錄，預設為已上架

#### Scenario: 必填欄位缺漏
- **WHEN** ADMIN 未填寫標題、價格說明或說明文字就送出
- **THEN** 系統 SHALL 阻擋送出並提示必填錯誤，不得建立或更新紀錄

#### Scenario: 刪除服務項目
- **WHEN** ADMIN 對某筆服務項目執行刪除
- **THEN** 系統 SHALL 從資料庫移除該筆紀錄，前台對應頁面 MUST 不再顯示

### Requirement: 服務項目可上下架，異動後前台立即反映
`/admin/services` SHALL 提供切換單筆服務項目 `isPublished` 狀態的功能；任何新增、編輯、刪除、上下架異動 SHALL 使 `/lessons`、`/commissions` 前台頁面的下一次讀取反映最新狀態。

#### Scenario: 下架一筆教學服務項目
- **WHEN** ADMIN 將某筆 `type: LESSON` 的服務項目下架
- **THEN** `/lessons` 頁面 SHALL 不再顯示該項目

#### Scenario: 新增一筆委託服務項目
- **WHEN** ADMIN 新增一筆 `type: TRANSCRIPTION` 或 `type: COLLABORATION` 的已上架服務項目
- **THEN** `/commissions` 頁面 SHALL 顯示該新項目
