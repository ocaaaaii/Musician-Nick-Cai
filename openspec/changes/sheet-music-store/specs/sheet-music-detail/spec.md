## Purpose

讓訪客在購買前充分了解一份樂譜的內容與適合程度，同時保護樂譜正本不被預覽頁面直接下載取得。

## ADDED Requirements

### Requirement: 顯示完整曲目資訊
詳情頁 SHALL 顯示曲名、價格、難易度、曲風、調性（若有）與說明文字；不存在的樂譜 ID 或未上架商品 MUST 回傳 404，不得顯示部分資訊。

#### Scenario: 造訪不存在或未上架的樂譜 ID
- **WHEN** 使用者造訪的 `/sheets/[id]` 對應的樂譜不存在，或存在但 `isPublished` 為假
- **THEN** 系統 SHALL 回傳 404

### Requirement: 預覽圖具備防盜保護
詳情頁 SHALL 顯示樂譜預覽圖並疊加浮水印樣式，預覽圖 MUST 停用右鍵選單（防止直接另存圖片），且 MUST NOT 提供任何指向樂譜正本檔案（`pdfFileKey`）的可存取連結。

#### Scenario: 於預覽圖按右鍵
- **WHEN** 使用者對樂譜預覽圖按右鍵
- **THEN** 系統 SHALL 攔截並不顯示瀏覽器預設的另存圖片選單

#### Scenario: 沒有預覽圖時的降級呈現
- **WHEN** 該樂譜商品的 `sampleImages` 為空陣列
- **THEN** 詳情頁 SHALL 顯示中性的佔位圖形，不得因缺少圖片而報錯或留白破版

### Requirement: 試聽整合全站播放器
詳情頁 SHALL 提供試聽按鈕，點擊後 MUST 透過全站共用的音訊播放狀態（Zustand store）播放該樂譜的 `audioSampleUrl`，而非另外建立獨立的音訊播放元件。

#### Scenario: 點擊試聽按鈕
- **WHEN** 使用者點擊試聽按鈕
- **THEN** 全站底部音訊播放器 SHALL 開始播放該樂譜的試聽音檔，並顯示該曲名

### Requirement: 購買入口先以視覺佔位呈現
詳情頁 SHALL 顯示「加入購物車」按鈕，但因購物車與結帳尚未實作，該按鈕 MUST 呈現為停用狀態並附上說明文字，不得呈現看似可用但實際無作用的互動。

#### Scenario: 點擊尚未實作的購買按鈕
- **WHEN** 使用者查看「加入購物車」按鈕
- **THEN** 系統 SHALL 明確以停用樣式與說明文字表示此功能尚未開放，不產生任何靜默失敗的點擊行為
