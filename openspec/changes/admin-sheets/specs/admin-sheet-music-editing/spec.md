## Purpose

讓音樂人不需要工程師協助，就能自行管理樂譜商店的商品清單：新增新樂譜、調整內容與價格、上下架，並掌握各樂譜的銷售量。

## ADDED Requirements

### Requirement: 商品列表顯示所有樂譜與銷售量
`/admin/sheets` SHALL 列出所有 `SheetMusic`（含未上架），每筆顯示標題、價格、難易度、曲風、上架狀態、銷售量。銷售量 SHALL 只計入對應 `Order.status` 為 `SUCCESS` 的 `OrderItem`。

#### Scenario: 存在已上架與未上架的樂譜
- **WHEN** 資料庫中同時有 `isPublished: true` 與 `isPublished: false` 的 `SheetMusic`
- **THEN** `/admin/sheets` SHALL 兩者皆顯示，並清楚標示各自的上架狀態

#### Scenario: 樂譜有失敗或待處理的訂單
- **WHEN** 某筆樂譜關聯的 `OrderItem` 對應到 `status: PENDING` 或 `status: FAILED` 的 `Order`
- **THEN** 該筆樂譜的銷售量 SHALL NOT 計入這些 `OrderItem`

### Requirement: 樂譜商品可新增、編輯、刪除
`/admin/sheets` SHALL 提供新增、編輯（標題、描述、價格、難易度、曲風、調性、`pdfFileKey`、`sampleImages`、`audioSampleUrl`）、刪除樂譜的功能。

#### Scenario: 新增一筆樂譜商品
- **WHEN** ADMIN 填妥所有必填欄位並送出新增
- **THEN** 系統 SHALL 建立一筆新的 `SheetMusic` 紀錄，預設為已上架

#### Scenario: 必填欄位缺漏
- **WHEN** ADMIN 未填寫標題、價格、難易度、曲風、`pdfFileKey`、`audioSampleUrl` 其中之一就送出
- **THEN** 系統 SHALL 阻擋送出並提示必填錯誤，不得建立或更新紀錄

#### Scenario: 價格為非正數
- **WHEN** ADMIN 填入的價格為零或負數
- **THEN** 系統 SHALL 阻擋送出並提示格式錯誤

#### Scenario: 刪除已有訂單紀錄的樂譜
- **WHEN** ADMIN 嘗試刪除一筆已被至少一個 `OrderItem` 引用的 `SheetMusic`
- **THEN** 系統 SHALL 阻擋刪除並提示無法刪除（避免破壞既有訂單的關聯完整性），建議改為下架

### Requirement: 樂譜商品可上下架
`/admin/sheets` SHALL 提供切換單筆樂譜 `isPublished` 狀態的功能，下架後前台 `/sheets` MUST 不再顯示該樂譜。

#### Scenario: 下架一筆樂譜
- **WHEN** ADMIN 將某筆樂譜的上架狀態切換為未上架
- **THEN** 系統 SHALL 更新該筆 `SheetMusic.isPublished` 為 `false`
