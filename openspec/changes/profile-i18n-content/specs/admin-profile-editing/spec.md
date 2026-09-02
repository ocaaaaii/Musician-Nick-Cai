## Purpose

讓音樂人不需要工程師協助，就能自行更新首頁會顯示的品牌文案、聯絡方式與精選影片，且品牌文案能依語系分別維護。

## MODIFIED Requirements

### Requirement: 個人品牌設定可編輯並即時反映於首頁
`/admin/profile` SHALL 提供表單編輯 `ProfileConfig` 的 `instagramUrl`、`youtubeUrl`、`contactEmail`、`calendlyUrl`；`heroTitle`、`heroSubtitle`、`aboutBio`、`styleTags` SHALL 依語系（中文、英文、日文、韓文）分別編輯，畫面 SHALL 提供語言頁籤切換。存檔成功後，首頁下一次讀取 MUST 反映最新內容。

#### Scenario: 修改中文版 Hero 標題並存檔
- **WHEN** ADMIN 切換到中文頁籤，修改 `heroTitle` 的中文版本並送出存檔
- **THEN** 系統 SHALL 只更新 `heroTitle` 的 `zh-TW` 鍵值，其他語系版本不受影響，中文語系首頁下次載入 MUST 顯示新標題

#### Scenario: 修改英文版 Hero 標題，中文版不受影響
- **WHEN** ADMIN 切換到英文頁籤，修改 `heroTitle` 的英文版本並送出存檔
- **THEN** 系統 SHALL 只更新 `heroTitle` 的 `en` 鍵值，中文版首頁顯示的內容 MUST NOT 改變

#### Scenario: 中文版必填欄位留空
- **WHEN** ADMIN 將 `heroTitle`、`heroSubtitle` 或 `aboutBio` 的中文版清空後嘗試存檔
- **THEN** 系統 SHALL 阻擋送出並提示必填錯誤，不得更新資料庫

#### Scenario: 英／日／韓版本留空
- **WHEN** ADMIN 將 `heroTitle`、`heroSubtitle` 或 `aboutBio` 的英文、日文或韓文版本留空後存檔（中文版有值）
- **THEN** 系統 SHALL 允許存檔成功

### Requirement: 風格標籤可自由新增與刪除，且各語系標籤各自獨立
`/admin/profile` SHALL 針對每個語系分別提供風格標籤的新增/刪除介面，某語系新增或刪除標籤 MUST NOT 影響其他語系的標籤清單。

#### Scenario: 在英文頁籤新增一個標籤
- **WHEN** ADMIN 在英文頁籤新增一個風格標籤並存檔
- **THEN** 系統 SHALL 只更新 `styleTags` 的 `en` 鍵值陣列，中文、日文、韓文的標籤清單 MUST NOT 改變
