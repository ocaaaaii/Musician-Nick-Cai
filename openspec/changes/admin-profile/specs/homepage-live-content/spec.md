## Purpose

讓首頁顯示的品牌內容與精選影片是資料庫中的真實資料，而不是開發階段留下的假資料，使 A2 後台編輯的成果能真正反映在對外頁面上。

## ADDED Requirements

### Requirement: 首頁品牌區塊讀取資料庫內容
首頁的 Hero、關於我、社群連結區塊 SHALL 讀取 `ProfileConfig` 資料表中 `id: "site-config"` 的即時內容，不得使用寫死或依語言分支的假資料。

#### Scenario: 造訪任一語系的首頁
- **WHEN** 訪客造訪 `/`（或 `/en`、`/ja`、`/ko`）
- **THEN** Hero 標題、副標題、關於我簡介、風格標籤、社群連結 SHALL 皆為資料庫 `ProfileConfig` 的當前內容，四語系顯示相同的品牌內容文字

### Requirement: 精選影片區塊只顯示已上架影片
首頁精選影片區塊 SHALL 只顯示 `FeaturedVideo` 中 `isPublished: true` 的紀錄，依 `sortOrder` 排序；沒有任何已上架影片時 SHALL 不顯示整個區塊。

#### Scenario: 資料庫沒有任何已上架影片
- **WHEN** `FeaturedVideo` 資料表中沒有 `isPublished: true` 的紀錄
- **THEN** 首頁 SHALL 不顯示精選影片區塊（不得顯示空區塊標題或假資料）

#### Scenario: 存在已上架與未上架影片
- **WHEN** 資料庫中同時有已上架與未上架的 `FeaturedVideo`
- **THEN** 首頁 SHALL 只顯示已上架的影片，依 `sortOrder` 由小到大排序

### Requirement: 精選影片依來源平台以不同樣式渲染
首頁 SHALL 依 `FeaturedVideo.platform` 分別渲染：`YOUTUBE` 使用自家風格的縮圖卡片，`INSTAGRAM` 使用 Instagram 官方原生嵌入樣式；兩種樣式 MAY 在視覺上不一致，此為已知且接受的取捨。

#### Scenario: 已上架影片包含 YouTube 與 Instagram 兩種來源
- **WHEN** 已上架的 `FeaturedVideo` 清單同時包含 `platform: YOUTUBE` 與 `platform: INSTAGRAM` 的紀錄
- **THEN** 首頁 SHALL 將 YouTube 項目渲染為自家風格卡片，Instagram 項目渲染為 Instagram 官方嵌入元件，兩者並存於同一區塊
