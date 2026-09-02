## Purpose

讓音樂人不需要工程師協助，就能自行管理樂譜商店的商品清單：新增新樂譜、調整內容與價格、上下架，並掌握各樂譜的銷售量。

## MODIFIED Requirements

### Requirement: 樂譜商品可新增、編輯、刪除
`/admin/sheets` SHALL 提供新增、編輯（標題、描述、價格、難易度、曲風、調性、`pdfFileKey`、`sampleImages`、`audioSampleUrl`）、刪除樂譜的功能。`pdfFileKey`、`sampleImages`、`audioSampleUrl` SHALL 透過直接上傳檔案取得，而非手動貼入網址字串。

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

#### Scenario: 上傳 PDF 正本
- **WHEN** ADMIN 在新增/編輯表單選擇一個 PDF 檔案
- **THEN** 系統 SHALL 將檔案直傳至 R2 的私有路徑（`private/sheets/{uuid}.pdf`），並將該路徑寫入 `pdfFileKey` 欄位

#### Scenario: 上傳試聽音檔或預覽圖
- **WHEN** ADMIN 在新增/編輯表單選擇音檔或圖片檔案
- **THEN** 系統 SHALL 將檔案直傳至 R2 的公開路徑，並將完整公開網址寫入 `audioSampleUrl` 或加入 `sampleImages` 陣列

#### Scenario: 選擇的檔案類型不符
- **WHEN** ADMIN 在 PDF 欄位選擇非 `application/pdf` 的檔案（或圖片/音檔欄位選到不符 MIME 類型的檔案）
- **THEN** 系統 SHALL 拒絕該次上傳並提示檔案類型不正確
