## 1. 設計 Token 與字體

- [x] 1.1 於 `tailwind.config.ts` 新增色彩 token（`paper`、`ink`、`taupe`、`slate`、`mist`、`brass`、`cream`——依使用者第二輪回饋改為低飽和中性色，取代最初的暖色漸層色票），並確認 `bg-paper` 等 class 可正常編譯
- [x] 1.2 用 `next/font/google` 引入 Fraunces（display）、Inter（body）、IBM Plex Mono（utility），設定為 CSS 變數並在 `tailwind.config.ts` 對應 `font-display`／`font-body`／`font-mono`
- [x] 1.3 於 `src/app/globals.css` 設定 `body` 預設背景與文字色為 `paper`／`ink`，驗證預設頁面已套用新色彩

## 2. 假資料層

- [x] 2.1 建立 `src/lib/content/profile.ts`，匯出 `getProfileConfig()`，回傳型別對齊 `ProfileConfig` 的範例資料（含大標題、副標題、簡介、風格標籤、IG、Email）
- [x] 2.2 建立 `src/lib/content/featured-videos.ts`，匯出 `getFeaturedVideos()`，回傳型別對齊 `FeaturedVideo[]` 的範例資料（`youtubeUrl` 使用 example.com 佔位網址，避免展示真實第三方影片縮圖）
- [x] 2.3 執行 `npx tsc --noEmit`，驗證假資料型別與 `@prisma/client` 匯出的型別相容

## 3. 全站外殼（Header + GlobalAudioPlayer 殼層）

- [x] 3.1 建立 `src/lib/store/audio-player.ts`，用 Zustand 定義 `currentTrackUrl`／`trackTitle`／`isPlaying` 狀態與對應 actions
- [x] 3.2 建立 `src/components/layout/Header.tsx`：Logo、導覽連結（底線展開 hover 效果）、購物車圖示佔位，行動裝置下可展開/收合選單
- [x] 3.3 建立 `src/components/layout/GlobalAudioPlayer.tsx`：讀取 Zustand store，`currentTrackUrl` 為空時回傳 `null`；有值時顯示固定於底部的播放列（播放/暫停、進度條、音量、曲名），行動裝置自動收合為簡化版
- [x] 3.4 修改 `src/app/layout.tsx`，掛載 `Header` 與 `GlobalAudioPlayer`，套用 Fraunces/Inter/Plex Mono 字體變數
- [x] 3.5 於瀏覽器驗證：切換至任一不存在頁面/子路徑仍可看到相同 Header；`GlobalAudioPlayer` 在無曲目時不佔版面（皆以桌面/行動寬度截圖確認）

## 4. 首頁區塊

- [x] 4.1 建立 `src/components/home/Hero.tsx`：大標題（Fraunces）、副標題、形象照（依使用者回饋改為原色、僅降低飽和度，非黑白或彩色漸層疊加），`heroVideoUrl` 為空時顯示照片，加入邊角小標籤與 GSAP 進場動畫
- [x] 4.2 建立 `src/components/home/About.tsx`：簡介文字與風格標籤（細邊框膠囊，hover 時填色為 brass），標籤自動換行
- [x] 4.3 建立 `src/components/home/FeaturedVideos.tsx`：卡片列表呈現，清單為空時整個區塊不渲染（`videos.length === 0` guard，已由程式碼檢視確認）；卡片圖片 hover 時由灰階轉為原色
- [x] 4.4 建立 `src/components/home/SocialFooter.tsx`：深色底、IG／Email 連結（`contactEmail` 為空時隱藏該項，hover 有位移回饋）、五線譜狀分隔線裝飾（僅此處使用一次）
- [x] 4.5 改寫 `src/app/page.tsx`，組合以上四個區塊，資料透過 `getProfileConfig()`／`getFeaturedVideos()` 取得，並用 `Reveal` 元件包裝 About/FeaturedVideos/SocialFooter 做捲動進場動畫
- [x] 4.6 於瀏覽器以桌面寬度（900–1280px）與行動裝置寬度（375px）分別截圖驗證：無橫向捲動、風格標籤正常換行、Header 導覽在 `md` 斷點正確切換

## 5. 互動與動效（使用者第二輪回饋新增，原 tasks 未列）

- [x] 5.1 建立 `src/components/ui/ArrowLink.tsx`、`src/components/ui/UnderlineLink.tsx`：統一的按鈕/連結互動語彙（箭頭位移／底線展開），供全站共用
- [x] 5.2 安裝 GSAP，於 `Hero` 建立進場動畫時間軸（kicker→headline→subtitle→photo 依序淡入位移），尊重 `prefers-reduced-motion`
- [x] 5.3 建立 `src/components/ui/Reveal.tsx`（IntersectionObserver + GSAP），套用於 About/FeaturedVideos/SocialFooter 的捲動進場動畫，同樣尊重 `prefers-reduced-motion`

## 6. 整體驗收

- [x] 6.1 執行 `npm run lint` 與 `npx tsc --noEmit`，確認無錯誤
- [x] 6.2 於瀏覽器截圖桌面版與行動版首頁，對照 design.md 修正後的視覺方向（低飽和中性色、原色照片、細字級距標籤）與使用者第二批參考圖逐項自我檢查；hover 狀態（導覽底線、風格標籤填色）以截圖驗證
- [x] 6.3 確認 proposal.md 的 Impact 段落所列檔案皆已建立或修改完成
