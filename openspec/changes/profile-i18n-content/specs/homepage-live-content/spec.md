## Purpose

讓首頁顯示的品牌內容與精選影片是資料庫中的真實資料，且品牌文案能依訪客語系顯示對應版本。

## MODIFIED Requirements

### Requirement: 首頁品牌區塊讀取資料庫內容，依語系顯示對應版本
首頁的 Hero、關於我、風格標籤區塊 SHALL 讀取 `ProfileConfig` 資料表中 `id: "site-config"` 的即時內容，並依訪客當下的語系顯示 `heroTitle`、`heroSubtitle`、`aboutBio`、`styleTags` 對應語系的版本；對應語系版本缺漏或為空時 SHALL 退回顯示中文版本。社群連結（IG／YouTube／Email）不分語系，四語系皆顯示相同內容。

#### Scenario: 造訪英文版首頁，且英文版文案已填寫
- **WHEN** 訪客造訪 `/en`，且資料庫 `heroTitle`／`heroSubtitle`／`aboutBio`／`styleTags` 的 `en` 鍵值皆有內容
- **THEN** Hero 標題、副標題、關於我簡介、風格標籤 SHALL 顯示 `en` 版本的內容

#### Scenario: 造訪日文版首頁，但日文版文案尚未填寫
- **WHEN** 訪客造訪 `/ja`，但資料庫 `aboutBio` 的 `ja` 鍵值為空或不存在
- **THEN** 關於我簡介 SHALL 退回顯示中文（`zh-TW`）版本的內容，不得顯示空白

#### Scenario: 造訪任一語系的首頁
- **WHEN** 訪客造訪 `/`、`/en`、`/ja` 或 `/ko`
- **THEN** 社群連結（Instagram、YouTube、Email）SHALL 皆為資料庫 `ProfileConfig` 的當前內容，四語系顯示相同的連結
