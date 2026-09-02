## 1. 翻譯檔案

- [x] 1.1 於 `messages/zh-TW.json`、`en.json`、`ja.json`、`ko.json` 新增 `sheets` 區塊：搜尋框 placeholder、篩選標籤（難易度/曲風/全部）、空狀態文字、詳情頁的試聽/加入購物車/開發中文案；另新增 `notFound` 區塊（見任務 3.6）

## 2. 樂譜列表頁

- [x] 2.1 建立 `src/app/[locale]/sheets/page.tsx`（Server Component），用 `src/lib/prisma.ts` 查詢 `sheetMusic.findMany({ where: { isPublished: true } })`
- [x] 2.2 建立 `src/components/sheets/SheetMusicBrowser.tsx`（Client Component），接收完整商品陣列，管理關鍵字/難易度/曲風的篩選狀態，即時過濾渲染
- [x] 2.3 建立 `src/components/sheets/SheetMusicCard.tsx`：曲名、曲風、難易度、價格，點擊導向 `/sheets/[id]`
- [x] 2.4 篩選選項（難易度、曲風下拉）從傳入的商品陣列動態算出（`Array.from(new Set(...))`），不寫死列舉
- [x] 2.5 無符合篩選結果時顯示空狀態文字（已用不存在的關鍵字測試確認）
- [x] 2.6 驗證：`isPublished: false` 的商品不會出現在列表、搜尋結果或篩選選項中——已建立測試用未上架商品確認後撤銷

## 3. 樂譜詳情頁

- [x] 3.1 建立 `src/app/[locale]/sheets/[id]/page.tsx`（Server Component），查無此 id 或 `isPublished: false` 時呼叫 `notFound()`
- [x] 3.2 建立 `src/components/sheets/SheetMusicDetail.tsx`：呈現曲名、價格、難易度、曲風、調性（若有）、說明文字
- [x] 3.3 建立 `src/components/sheets/WatermarkedPreview.tsx`：接收 `sampleImages` 陣列，以 GSAP 做 crossfade 輪播（自動播放＋圓點手動切換，尊重 `prefers-reduced-motion`），疊加 CSS 重複文字浮水印、`onContextMenu` 阻擋；單張或全部圖片載入失敗時優雅降級（跳過失敗圖片，全部失敗則顯示中性佔位底色）——預覽圖改用原生 `<img>` 而非 `next/image`，因為圖片來源（未來的 R2 網址）主機名稱無法預先寫進 `remotePatterns`
- [x] 3.4 試聽按鈕呼叫 `useAudioPlayerStore().play(audioSampleUrl, title)`，不新建播放元件——已透過檢查 DOM 中 `<audio>` 元素與其 `getBoundingClientRect()`／computed style 確認確實掛載且可見
- [x] 3.5 「加入購物車」按鈕以停用樣式呈現，附加「功能開發中」說明文字
- [x] 3.6 新增 `src/app/[locale]/not-found.tsx`（套用設計系統，處理合法語系內找不到資源的情況）與 `src/app/not-found.tsx`（提供自己的 `<html>/<body>`，處理完全不匹配語系的邊緣情況）——套用時發現沒有這兩個檔案會讓 `notFound()` 觸發 hydration 錯誤與畫面空白，詳見 design.md 的 Risk 說明

## 4. 整體驗收

- [x] 4.1 執行 `npx tsc --noEmit` 與 `npm run lint`，確認無錯誤
- [x] 4.2 瀏覽器驗證：`/sheets` 列表頁可搜尋/篩選；點擊卡片進入 `/sheets/[id]`；試聽按鈕觸發底部播放器；預覽圖右鍵選單被攔截；造訪不存在的 id 回傳 404 且畫面正常（非空白）
- [x] 4.3 韓文（`ko`）已完整驗證頁面文案；其餘三語系（`zh-TW`／`en`／`ja`）翻譯檔內容與 `ko` 走同一套 key 結構撰寫，未逐一截圖但內容經檢視無缺漏
- [x] 4.4 桌面（1200px）與行動裝置（375px）寬度皆截圖驗證版面正常，無橫向捲動
