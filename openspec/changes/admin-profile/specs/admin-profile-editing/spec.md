## Purpose

讓音樂人不需要工程師協助，就能自行更新首頁會顯示的品牌文案、聯絡方式與精選影片。

## ADDED Requirements

### Requirement: 個人品牌設定可編輯並即時反映於首頁
`/admin/profile` SHALL 提供表單編輯 `ProfileConfig` 的 `heroTitle`、`heroSubtitle`、`aboutBio`、`styleTags`、`instagramUrl`、`youtubeUrl`、`contactEmail`、`calendlyUrl`；存檔成功後，首頁下一次讀取 MUST 反映最新內容。

#### Scenario: 修改 Hero 標題並存檔
- **WHEN** ADMIN 在 `/admin/profile` 修改 `heroTitle` 並送出存檔
- **THEN** 系統 SHALL 更新資料庫中 `ProfileConfig` 的 `heroTitle`，且首頁下次載入 MUST 顯示新標題

#### Scenario: 必填欄位留空
- **WHEN** ADMIN 將 `heroTitle`、`heroSubtitle` 或 `aboutBio` 清空後嘗試存檔
- **THEN** 系統 SHALL 阻擋送出並提示必填錯誤，不得更新資料庫

#### Scenario: 選填連結欄位格式不正確
- **WHEN** ADMIN 在 `instagramUrl`、`youtubeUrl`、`calendlyUrl` 填入不符合網址格式的文字
- **THEN** 系統 SHALL 阻擋送出並提示格式錯誤

#### Scenario: 選填連結欄位留空
- **WHEN** ADMIN 將 `instagramUrl`、`youtubeUrl`、`contactEmail` 或 `calendlyUrl` 清空後存檔
- **THEN** 系統 SHALL 允許存檔成功，該欄位存為空值

### Requirement: 風格標籤可自由新增與刪除
`/admin/profile` SHALL 提供介面讓 ADMIN 新增或刪除任意數量的風格標籤，且變更 MUST 隨主表單一併存檔。

#### Scenario: 新增一個標籤後存檔
- **WHEN** ADMIN 輸入新標籤文字並加入清單，接著存檔
- **THEN** 系統 SHALL 將新標籤併入 `ProfileConfig.styleTags` 陣列寫入資料庫

#### Scenario: 刪除既有標籤後存檔
- **WHEN** ADMIN 從清單移除一個既有標籤，接著存檔
- **THEN** 系統 SHALL 寫入不含該標籤的 `styleTags` 陣列

### Requirement: 精選影片可新增、編輯、刪除與上下架
`/admin/profile` SHALL 提供 `FeaturedVideo` 的新增、編輯（標題／連結／來源平台／排序）、刪除、上下架切換功能，來源平台 SHALL 可選擇 YouTube 或 Instagram Reels。

#### Scenario: 新增一支 YouTube 精選影片
- **WHEN** ADMIN 選擇來源平台為 YouTube，填寫標題與連結並送出新增
- **THEN** 系統 SHALL 建立一筆 `platform: YOUTUBE` 的新 `FeaturedVideo` 紀錄，預設為已上架

#### Scenario: 新增一支 Instagram Reels 精選影片
- **WHEN** ADMIN 選擇來源平台為 Instagram Reels，填寫標題與 Reels 連結並送出新增
- **THEN** 系統 SHALL 建立一筆 `platform: INSTAGRAM` 的新 `FeaturedVideo` 紀錄，預設為已上架

#### Scenario: 下架一支精選影片
- **WHEN** ADMIN 將某筆影片的上架狀態切換為未上架
- **THEN** 系統 SHALL 更新該筆 `FeaturedVideo.isPublished` 為 `false`，首頁 MUST 不再顯示該影片

#### Scenario: 刪除一支精選影片
- **WHEN** ADMIN 對某筆影片執行刪除
- **THEN** 系統 SHALL 從資料庫移除該筆 `FeaturedVideo` 紀錄，且此操作 MUST 為立即生效（不進垃圾桶、不可復原）

#### Scenario: 新增影片時必填欄位缺漏
- **WHEN** ADMIN 未填寫標題或 YouTube 連結就送出新增
- **THEN** 系統 SHALL 阻擋送出並提示必填錯誤，不得建立紀錄
