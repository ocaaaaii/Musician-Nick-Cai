## Purpose

讓訪客一進站就能理解這位鋼琴專家是誰、擅長什麼風格，並能進一步瀏覽精選演奏與聯繫方式，建立品牌第一印象。

## ADDED Requirements

### Requirement: Hero 區塊呈現品牌主張
首頁 SHALL 顯示品牌大標題與副標題，內容來源為品牌設定資料（`ProfileConfig` 形狀），且在資料來源未提供形象影片時 MUST 呈現靜態形象照作為替代。

#### Scenario: 沒有形象影片時顯示照片
- **WHEN** 品牌設定資料的 `heroVideoUrl` 為空
- **THEN** Hero 區塊 SHALL 顯示形象照，不留空白區域

### Requirement: About 區塊呈現簡介與風格標籤
首頁 SHALL 顯示個人簡介文字與風格標籤列表，風格標籤數量不固定時版面 MUST 能正常換行呈現，不溢出容器。

#### Scenario: 風格標籤數量較多
- **WHEN** 風格標籤數量超過一行可容納的寬度
- **THEN** 標籤列表 SHALL 自動換行，不被容器截斷或造成橫向捲動

### Requirement: 精選影片區塊呈現卡片列表
首頁 SHALL 以卡片形式列出精選影片，每張卡片 MUST 顯示標題與可點擊前往 YouTube 的連結；當精選影片清單為空時，系統 SHALL 隱藏整個區塊而非顯示空白卡片列。

#### Scenario: 尚無精選影片
- **WHEN** 精選影片清單為空陣列
- **THEN** 首頁 SHALL 不渲染精選影片區塊的標題與容器

### Requirement: 社群與聯絡資訊呈現
首頁 SHALL 顯示 Instagram 連結與聯絡 Email（當品牌設定有提供時），且連結 MUST 可正常開啟對應的外部服務或郵件客戶端。

#### Scenario: 缺少聯絡 Email
- **WHEN** 品牌設定資料的 `contactEmail` 為空
- **THEN** 系統 SHALL 隱藏 Email 連結項目，不顯示無效連結

### Requirement: 版面響應式呈現
首頁在行動裝置寬度（小於平板斷點）下，所有區塊 SHALL 維持可讀性，不得有文字溢出容器或橫向捲動。

#### Scenario: 行動裝置檢視首頁
- **WHEN** 使用者以行動裝置寬度瀏覽首頁
- **THEN** Hero、About、精選影片、社群區塊 SHALL 依序垂直堆疊呈現，且不出現橫向捲動軸
