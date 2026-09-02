## Context

使用者提供了一張參考截圖（暖米色背景、深藏青大標、漸層色塊、深色頁尾）作為視覺方向。P1 的 Supabase 連線尚未完成，使用者選擇「兩者都要，前端先行」——先用假資料把畫面做出來，之後再接上真實資料，不等後端。

**視覺方向修正（第一版實作後）**：使用者看過第一版（暖色漸層融合照片）後回饋不滿意「把照片變成彩色風格」，並提供第二批參考圖（多個低飽和度、黑白/單色調攝影、細字級距標籤、克制留白的品牌網站，以及一張直接標明 hex/HSB 數值的「高級感配色」色票）。這批參考的方向明確且一致，直接取代原本的暖色漸層色票：
- 色彩改為中性、低飽和度為主（取自使用者提供的色票：`#1C1D1F`／`#C4BFBA`／`#6F6865`／`#8B8D95`／`#8A9492`），僅保留一個內斂的暖色系強調色（rust／赤陶色）作為互動狀態使用，不再有大面積漸層色塊
- 照片改為黑白／單一色調處理，不做彩色漸層疊加
- 使用者明確要求版面編排與**介面互動性**（hover、按鈕）要有自己的風格，不是靜態產出後就結束
- Tailwind token 的 **class 名稱**（`paper`／`ink`／`brass`／`cream`）維持不變以降低元件改動範圍，但 hex 值與用途改為對齊新方向；`dusk-violet`／`ember`／`amber`／`dusk-gradient` 移除

## Goals / Non-Goals

**Goals:**
- 落地使用者指定的暖色系視覺方向為可重用的 Tailwind 設計 token
- 建立首頁與全站外殼，資料存取透過一層可替換的介面，讓 P1 完成後接上真實 Prisma 查詢時，頁面元件不需重寫
- 建立音訊播放的狀態管理殼層，即使目前沒有真實試聽音檔也不影響其他頁面開發

**Non-Goals:**
- 不實作真實資料庫查詢（見 `supabase-prisma-setup` change）
- 不實作樂譜商城、教學、委託等其他頁面（後續 change）
- 不實作購物車功能，僅保留視覺佔位

## Decisions

**1. 設計 Token 化為 Tailwind theme extend，不寫死在元件裡**
色彩（`paper`／`ink`／`dusk-violet`／`ember`／`amber`／`brass`／`cream`）與字體（Fraunces／Inter／IBM Plex Mono）定義在 `tailwind.config.ts` 的 `theme.extend`，元件一律透過 Tailwind class（如 `bg-paper`、`text-ink`、`font-display`）使用，不在元件內寫死 hex 值。
理由：之後若要微調色調或换字體，只需改一個檔案；也讓「設計系統」與「頁面內容」的關注點分離。

**2. 假資料層以型別對齊 Prisma model，用函式介面包裝而非直接 import 假資料物件**
新增 `src/lib/content/profile.ts`、`src/lib/content/featured-videos.ts`，各自匯出 `async function getProfileConfig()` / `async function getFeaturedVideos()`，型別直接複用 Prisma 產生的 `ProfileConfig`／`FeaturedVideo` type（從 `@prisma/client` import type），目前函式內部回傳寫死的範例資料。
理由：頁面元件呼叫的是函式介面，不是資料物件本身；等 Supabase 連線完成後，只需把函式內部實作換成 `prisma.profileConfig.findUnique(...)`，呼叫端（頁面元件）完全不用改，符合 Impact 段落宣稱的「不需改動頁面元件」。

**3. GlobalAudioPlayer 用 Zustand 建立狀態殼層，`currentTrackUrl` 為 `null` 時整個元件回傳 `null`**
狀態（`currentTrackUrl`、`trackTitle`、`isPlaying`）放在 Zustand store（`src/lib/store/audio-player.ts`），元件本身在 `currentTrackUrl` 為空時直接不渲染，避免首頁出現一個「沒有內容的播放器」佔用版面。
理由：符合 `global-layout` spec 的「尚無曲目播放時不顯示播放器」需求；Zustand store 獨立於元件生命週期，天然滿足「切換頁面不中斷播放」的需求，不需要額外的 context 或 URL state 同步。

**4. 形象照改為 CSS `grayscale` 濾鏡處理，不做彩色漸層疊加（修正原 Decision）**
Hero 照片改用 `filter: grayscale(1)` 搭配極低透明度的單一中性色（`charcoal`）疊層，不再套用漸層背景與 `mix-blend-mode` 疊色。合成方式仍純粹用 CSS（濾鏡與疊層皆為 CSS 屬性），維持「換照片不需重新合成」的原始理由，只是視覺結果改為黑白／單色調而非彩色。

**5. 互動語彙統一為「細邊框按鈕 + 箭頭位移」與「底線展開」兩種模式，不做每個元件各自發明樣式**
所有主要 CTA（Hero 若有按鈕、精選影片卡片、頁尾連結）使用同一套按鈕元件：細邊框、hover 時邊框/底色反轉、內含箭頭圖示且 hover 時箭頭向右位移；導覽連結與文字連結一律用「底線由左至右展開」的 hover 效果，不用變色作為唯一回饋。所有 transition 遵守 `prefers-reduced-motion`。
理由：使用者明確要求「介面互動性…都希望很有自己的風格」，但風格一致比每處都不同更重要——統一兩種可辨識的互動語彙，讓整站有清楚的「觸覺」，而不是零散的特效堆疊。

## Risks / Trade-offs

- [風險] 假資料層與 Prisma schema 的欄位如果之後有調整（例如 `supabase-prisma-setup` change 的 spec 有變動），假資料型別會跟著過期 → 緩解：假資料層直接 `import type` 自 `@prisma/client`，TypeScript 編譯時就會因型別不符而報錯，不會悄悄地資料形狀不一致
- [風險] 漸層色塊與照片合成的視覺效果高度仰賴實際照片的明暗與色調，現有 `pic.png` 效果不一定是最終定案 → 緩解：合成邏輯用 CSS 參數化（漸層角度、透明度可調），非一次性寫死，方便之後換照片或微調

## Open Questions

（無——視覺方向已由使用者提供參考圖確認，資料串接時機已由使用者選擇「前端先行」）
