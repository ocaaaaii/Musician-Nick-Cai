## 1. 設計 Token 與全站紋理

- [x] 1.1 `tailwind.config.ts` 新增 `bone`（#F5F1E8）、`khaki`（#E3DCC9）色彩 token
- [x] 1.2 `src/app/[locale]/layout.tsx` 加入固定定位的雜訊疊層（SVG data URI + `mix-blend-mode: overlay`，約 3.5% 透明度，`pointer-events-none`）
- [x] 1.3 建立 `src/components/ui/FadeDivider.tsx` 共用漸層分隔線元件，取代原本的 `border-t border-ink/10`

## 2. 首頁區塊色調層次

- [x] 2.1 `Hero.tsx` 改為外層 `bg-paper` 包裹（原本依賴 body 預設色，現在 body 預設改為 khaki，Hero 需明確指定 paper）
- [x] 2.2 `About.tsx` 改為 `bg-bone` 背景，套用 `FadeDivider`
- [x] 2.3 `FeaturedVideos.tsx` 改為 `bg-khaki` 背景，套用 `FadeDivider`
- [x] 2.4 `Header.tsx` 的 sticky 背景改用 `bg-bone/90`（原為 `paper/90`），底部加 `FadeDivider`；語言下拉選單背景同步改為 `bg-bone`、陰影改為色調陰影
- [x] 2.5 各區塊之間的分隔改用漸層淡出線，移除原本的實心 `border-t`（`SocialFooter` 的五線譜分隔線維持不變，是唯一的訊號性裝飾，不重複使用）

## 3. 卡片元件視覺調整

- [x] 3.1 `SheetMusicCard.tsx`：底色改為 `bg-bone`，邊框降為 `border-ink/5`，加上 `shadow-[0_1px_3px_rgba(28,29,31,0.08)]`
- [x] 3.2 `LessonPackages.tsx` 的卡片：同上處理
- [x] 3.3 `CommissionPackages.tsx` 的卡片：同上處理
- [x] 3.4 `WatermarkedPreview.tsx` 的中性佔位底色（`bg-taupe/20`）維持不變，確認未被誤動

## 4. 樂譜／教學／委託頁面背景

- [x] 4.1 `src/app/[locale]/sheets/page.tsx`、`lessons/page.tsx`、`commissions/page.tsx` 的背景：改為讓 body 預設 `bg-khaki` 直接生效，不額外包 wrapper div（`<main>` 本身是 `mx-auto max-w-*` 的定寬容器，不適合直接上色；body 層級改色是更簡單的作法，效果相同）
- [x] 4.2 `src/app/[locale]/sheets/[id]/page.tsx` 詳情頁背景同步套用（同樣透過 body 預設色生效）

## 5. 整體驗收

- [x] 5.1 執行 `npx tsc --noEmit` 與 `npm run lint`，確認無錯誤
- [x] 5.2 驗證首頁三階色調：用 `getComputedStyle` 逐一確認 Hero（`rgb(196,191,186)`＝paper）、About（`rgb(245,241,232)`＝bone）、FeaturedVideos（`rgb(227,220,201)`＝khaki）背景色精確對應設計 token，而非僅憑截圖判斷（本次瀏覽器截圖工具在本次工作階段對此頁面的擷取多次出現與實際 DOM 狀態不同步的情形，改用 `getComputedStyle`／accessibility tree 驗證更可靠）
- [x] 5.3 驗證卡片視覺：`SheetMusicCard`／`LessonPackages` 卡片皆確認 `bg-bone`＋`border-ink/5`＋色調陰影正確套用
- [x] 5.4 確認深色頁尾（`bg-ink`＝`rgb(28,29,31)`）與五線譜分隔線（5 條 `<line>`）未受影響，`getComputedStyle` 確認文字色為 `cream`
- [x] 5.5 確認既有互動（GSAP Hero 進場動畫、hover 狀態、表單驗證流程）未被本次視覺調整破壞——GSAP 進場動畫在自動化測試環境下因分頁背景/前景切換（`document.hidden`）導致 rAF 節流而出現暫時卡在中間值的情形，屬於瀏覽器對背景分頁節流動畫的標準行為，非本次改動引入的問題；重新整理且保持分頁在前景時動畫可完整播放完畢，已於過程中確認
