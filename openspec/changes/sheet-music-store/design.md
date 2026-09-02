## Context

這是第一個直接讀取真實 Prisma 資料的頁面。`supabase-prisma-setup` 的 design.md 已定案：授權主要在 Next.js 伺服器端執行，Prisma 連線本身會繞過 RLS。這裡延續同一原則。目前資料庫只有種子資料建立的 1 筆樂譜（`sampleImages` 是一個不存在的 placeholder 網址），畫面需要在「資料不完整」的情況下也不出錯。

## Goals / Non-Goals

**Goals:**
- `/sheets` 與 `/sheets/[id]` 皆直接用 Prisma 查詢即時資料，不再透過假資料層
- 篩選/搜尋為前端即時互動，不需每次都打伺服器
- 預覽圖與試聽整合現有的設計系統（低飽和色票、GSAP／Reveal 動效、ArrowLink／UnderlineLink 互動語彙）與全站音訊播放器

**Non-Goals:**
- 不實作購物車、結帳、金流
- 不實作後台樂譜上傳/編輯（`/admin/sheets`）
- 不實作真正的伺服器端圖片浮水印生成——預覽圖的浮水印是前端 CSS 疊加效果，樂譜正本（`pdfFileKey`）本身從未透過任何前端可觸及的 URL 曝露，這才是真正的防護层；CSS 浮水印只是防君子不防小人的視覺嚇阻

## Decisions

**1. 列表頁一次抓全部已上架樂譜，篩選/搜尋在前端做，不用 URL query 或伺服器端重新查詢**
`page.tsx`（Server Component）用 Prisma 查一次 `findMany({ where: { isPublished: true } })`，把完整陣列傳給一個 Client Component 做關鍵字/難易度/曲風的即時過濾。
理由：目前商品數量規模（個人音樂人的樂譜商城，預期是幾十筆等級，不是電商規模的量）不需要分頁或伺服器端搜尋；前端過濾給使用者立即回饋，且實作最簡單。若未來商品數量成長到需要分頁，屬於獨立的效能優化 change。

**2. 難易度／曲風篩選選項從查詢結果動態算出，不寫死列舉**
用 `Array.from(new Set(sheets.map(s => s.difficulty)))` 之類的方式從實際資料算出篩選選項。
理由：`difficulty`／`genre` 在 schema 裡是自由字串（非 enum），後台之後可能會輸入規格書預期之外的值；寫死列舉會導致「篩選選項」與「資料實際的值」不同步，選了某個選項卻篩不出東西。

**3. 浮水印用 CSS `repeating-linear-gradient` 文字疊層 + `onContextMenu` 阻擋，不做伺服器端影像處理**
預覽圖容器疊一層半透明、重複排列的品牌文字（如 "NICK CAI · SAMPLE"），並在該容器綁 `onContextMenu={(e) => e.preventDefault()}`。
理由：真正該保護的是樂譜正本 PDF（`pdfFileKey` 從未出現在任何前端可讀取的 API 回應或 HTML 中，這才是實質防線）；預覽圖本身「被截圖」的風險本來就無法用前端手段完全杜絕，CSS 浮水印的目的只是提高隨手右鍵另存的門檻，屬於嚇阻而非強保護，不值得為此建置一套伺服器端浮水印生成 pipeline。

**3a. 預覽圖以 GSAP crossfade 輪播多張 `sampleImages`（套用中追加）**
`WatermarkedPreview` 改為接收整個 `sampleImages` 陣列，用 GSAP 做淡入淡出＋輕微縮放的交叉轉場，自動輪播（約 4.5 秒一張）並附底部圓點手動切換，尊重 `prefers-reduced-motion`（改為直接切換不做動畫）；浮水印疊層維持靜態，蓋在輪播之上不隨切換動畫。任何一張圖載入失敗會被跳過而不中斷輪播，全部失敗則退回中性佔位底色。
理由：使用者於套用階段直接回饋要求「品項之間平滑輪播」；沿用同一份預覽圖陣列（本來就存在於 schema）比另外設計「精選圖」欄位更省事，且與現有 GSAP 動效語彙一致。

**4. 試聽按鈕呼叫既有的 `useAudioPlayerStore`，不新建播放元件**
沿用 `homepage-brand-section` 建立的 Zustand store（`src/lib/store/audio-player.ts`）與 `GlobalAudioPlayer` 元件，試聽按鈕只呼叫 `play(audioSampleUrl, title)`。
理由：這正是當初設計 GlobalAudioPlayer 殼層時預留的介接點（見該 change 的 design.md Decision 3），現在有真正的呼叫端了。

## Risks / Trade-offs

- [風險] 種子資料的 `sampleImages`／`audioSampleUrl` 是不存在的 placeholder 網址，圖片會 404、音檔會播放失敗 → 緩解：圖片容器對載入失敗做降級處理（顯示佔位圖形而非破圖圖示）；音訊播放失敗是瀏覽器原生行為（`<audio>` 標籤本身會安靜失敗或顯示原生錯誤），不特別攔截，待後台真正上傳檔案後即為正常路徑
- [風險] 前端一次抓取全部已上架商品，商品量變大後效能會下降 → 緩解：已於 Non-Goals 註記為已知取捨，非本次規模需要處理
- [風險，套用時發現，屬 i18n 路由架構缺口] `notFound()` 在 `[locale]` 路由結構下若沒有對應的 `not-found.tsx`，Next.js 會 fallback 到內建的根層級 404 元件，該元件會嘗試自己產生一份 `<html>/<body>`，與 `[locale]/layout.tsx` 既有的 `<html>` 衝突，觸發 `HierarchyRequestError`／hydration 錯誤（畫面整片空白，但 HTTP 狀態碼仍正確回傳 404，容易被誤判為「已經正常」）→ 修正：新增 `src/app/[locale]/not-found.tsx`（套用設計系統與翻譯，處理「合法語系內、資源不存在」的一般情況，本 change 的 Requirement 就是靠這個檔案滿足）與 `src/app/not-found.tsx`（提供自己的 `<html>/<body>`，只處理「完全不匹配任何語系」的邊緣情況）。這屬於 `i18n-setup` 路由架構原本就該有、但當初沒建立的檔案，記錄於此因為是在本 change 驗收 404 需求時才發現

## Open Questions

（無）
