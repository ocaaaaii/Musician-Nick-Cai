## Why

使用者要求用已安裝的 taste-skill（`redesign-existing-projects`）打磨全站視覺，具體方向：加入白／米白／淺卡其等淺色元素，並加強畫面分隔與區塊的質感。目前全站（Header、Hero、About、FeaturedVideos、樂譜/教學/委託頁）都套用同一個 `bg-paper`（單一暖灰石色），從首頁到頁尾沒有任何色調層次，區塊之間只靠一條 `border-ink/10` 細線分隔——這正好對應 `redesign-existing-projects` skill 稽核清單裡的「Empty, flat sections with no visual depth」與「Flat design with zero texture」。這是純視覺調整，不改變任何頁面的功能或商業邏輯。

## What Changes

- 新增兩個淺色調 token（`bone` 近白米白、`khaki` 淺卡其），與既有 `paper`（暖灰石）組成三階淺色調層次，讓不同區塊有色調變化而非單一平面色
- 全站疊加一層極低透明度的雜訊紋理（noise/grain overlay），打破目前純平面色塊的無質感問題
- 區塊分隔線從單一實心細線改為漸層淡出的分隔線（邊緣自然消失，而非死板的一條線切齊）
- 卡片元件（`SheetMusicCard`、`LessonPackages`、`CommissionPackages`）從「純邊框＋平面底色」改為淺色調底＋帶色調的柔和陰影，降低邊框存在感
- 首頁 Hero／About／FeaturedVideos 三區改用不同淺色調（層次感），頁尾維持既有深色不變
- 樂譜商城／教學／委託頁面的背景與資訊卡片套用同一組新色調

## Capabilities

（本 change 純視覺調整，不新增或修改任何可觀察行為，`.openspec.yaml` 已設定 `skip_specs: true`）

## Impact

- 修改：`tailwind.config.ts`（新增色彩 token）、`src/app/globals.css`（雜訊疊層）
- 修改：`src/components/layout/Header.tsx`、`src/components/home/Hero.tsx`、`src/components/home/About.tsx`、`src/components/home/FeaturedVideos.tsx`、`src/components/home/SocialFooter.tsx`（分隔線處理）
- 修改：`src/components/sheets/SheetMusicCard.tsx`、`src/components/lessons/LessonPackages.tsx`、`src/components/commissions/CommissionPackages.tsx`（卡片視覺）
- 修改：`src/app/[locale]/sheets/page.tsx`、`src/app/[locale]/lessons/page.tsx`、`src/app/[locale]/commissions/page.tsx`（背景色調）
- 不涉及任何資料查詢、表單邏輯、路由行為的變更
- 不涉及 `/sheets/[id]` 詳情頁的浮水印預覽輪播邏輯（僅視覺微調其外層背景色，不動 `WatermarkedPreview.tsx` 內部邏輯）
