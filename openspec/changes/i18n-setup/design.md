## Context

`homepage-brand-section` change 剛完成單語系（繁體中文）的首頁，路由結構是最簡單的 `src/app/page.tsx` 對應 `/`。使用者選擇現在就套用 i18n，即使這代表要重新排列這批剛做好的檔案。技術規格書（CLAUDE.md）指定 Next.js 14 App Router；官方對 App Router 的 i18n 建議方案是 `next-intl`（Server Component 相容、路由層級語系前綴、型別安全的翻譯 key）。

## Goals / Non-Goals

**Goals:**
- 路由層級支援 `zh-TW`（預設，無前綴）與 `en`（`/en` 前綴）
- 首頁既有的 UI 文案（導覽、區塊標題、按鈕/連結 aria-label）改用翻譯檔案
- Header 提供語言切換，切換時停留在同一頁面

**Non-Goals:**
- 不處理資料庫內容（`SheetMusic.title` 等）的多語系——目前 Prisma schema 沒有 locale 欄位，是否需要待使用者確認後另開 change
- 不新增除 `zh-TW`／`en` 以外的語系
- 假資料層（`getProfileConfig`／`getFeaturedVideos`）改為依 `locale` 回傳對應語言內容，僅為了讓 demo 在切換語言時有實際變化——這不代表真正的資料庫多語系方案已定案，待 Non-Goals 提到的後續 change 決定

## Decisions

**1. 使用 `next-intl`，不用 Next.js 內建的 `i18n` config（僅 Pages Router 支援）或手刻方案**
`next-intl` 是目前 App Router 生態下對 Server Component 支援最完整、社群採用度最高的方案。
理由：手刻方案要自行處理路由攔截、訊息載入、型別安全，重造輪子；Next.js 內建 `next.config.js` 的 `i18n` 欄位只支援 Pages Router，App Router 已不支援。

**2. 路由改為 `src/app/[locale]/...`，[locale] segment 的 layout 本身就是根 layout**
`src/app/layout.tsx`、`src/app/page.tsx` 移至 `src/app/[locale]/layout.tsx`、`src/app/[locale]/page.tsx`；`[locale]/layout.tsx` 內含 `<html>`/`<body>`，不在其上再疊一層根 layout。
理由：這是 next-intl 官方建議結構，讓 `generateStaticParams` 能在 build time 產生兩個語系的靜態頁面；避免雙層 layout 增加不必要的巢狀。

**3. UI 文案用翻譯 key，`ProfileConfig`／`FeaturedVideo` 的資料內容用 `locale` 參數切換假資料**
`src/lib/content/profile.ts`、`featured-videos.ts` 的函式簽章改為 `getProfileConfig(locale: string)`／`getFeaturedVideos(locale: string)`，內部依 `locale` 回傳不同語言的假資料物件；UI 文案（導覽列、區塊標題、按鈕 aria-label）則走 `next-intl` 的 `useTranslations`，存放於 `messages/zh-TW.json`／`messages/en.json`。
理由：兩者性質不同——UI 文案是「介面本身的語言」，屬於 i18n 框架的標準職責；`ProfileConfig` 的內容是「品牌方撰寫的文字」，未來會來自資料庫，資料庫多語系是獨立的產品決策（例如：是否要音樂人自己維護兩份文案，或用機器翻譯）。現在用 `locale` 參數只是讓假資料層的介面提前具備「可能需要語系」的彈性，不代表真正方案已拍板。

**4. 語言切換器用 next-intl 的 `Link`（來自 `src/i18n/navigation.ts`），不是純字串網址拼接**
理由：next-intl 的 navigation API 會自動處理當前 pathname 與 locale 前綴的對應，避免手動字串拼接在動態路由或未來新增頁面時出錯。

**5. 語系從 2 個增為 4 個（追加 `ja`／`ko`）後，語言切換器改為下拉選單，不再是雙語 toggle**
初版只有 `zh-TW`／`en` 時，Header 用一顆按鈕直接切換成「另一個語言」；使用者追加要求日文、韓文後，「另一個」不再是明確概念，改為 `src/i18n/locale-names.ts` 定義的語系名稱對照表 + 下拉選單，列出 `routing.locales` 全部選項，當前語系高亮。
理由：語系數量一旦超過 2 個，toggle 模式必然要重新設計，不如一開始就用「列出所有選項」這種能自然擴展到更多語系的模式，避免語系再增加時（例如之後要加簡體中文）又要重寫互動邏輯。

## Risks / Trade-offs

- [風險] 假資料層的 `locale` 參數是暫時性設計，未來資料庫多語系方案一旦確定，這裡的函式簽章可能要再調整 → 緩解：已在 Non-Goals 與本文件明確標註這是 demo 用途，不是最終方案，降低未來變更的意外程度
- [風險] 路由結構搬動影響先前 `homepage-brand-section` change 剛驗收過的檔案路徑 → 緩解：畫面行為（spec 定義的 Requirement/Scenario）不變，只是檔案位置與文字來源改變，可用同一套截圖驗證方式重新確認一次

## Open Questions

（無——套用時機與範圍已由使用者於本輪對話確認）
