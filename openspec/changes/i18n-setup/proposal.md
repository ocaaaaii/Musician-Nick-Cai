## Why

音樂人的受眾不限於中文使用者，使用者希望全站支援多語系（「音樂無國界」）。目前 `homepage-brand-section` change 剛完成的頁面（`src/app/layout.tsx`、`src/app/page.tsx` 與所有 `src/components/home/*`）全部是寫死的繁體中文字串，且路由結構是單一語系（`src/app/page.tsx` 直接對應 `/`）。導入 i18n 需要調整路由結構本身，屬於架構層級的變動，會影響後續每一個要新增的頁面，因此獨立開一個 change 先把規則定清楚，而不是直接塞進首頁 change 裡。

## What Changes

- 導入 `next-intl`（Next.js App Router 官方推薦的 i18n 方案，支援 Server Component）
- 路由結構改為 `src/app/[locale]/...`，支援 `zh-TW`（預設）、`en`、`ja`、`ko` 四個語系（使用者於套用後追加要求日文／韓文），網址如 `/`（預設語系不加前綴）、`/en`、`/ja`、`/ko`
- 建立翻譯檔案結構（`messages/zh-TW.json`、`messages/en.json`、`messages/ja.json`、`messages/ko.json`），首波僅涵蓋 `homepage-brand-section` change 已完成的字串（導覽選單、Hero、About、精選演奏、頁尾）
- Header 新增語言切換器（下拉選單，因語系數量超過 2 個，不再適用單純切換 toggle）
- **BREAKING**：`homepage-brand-section` 已建立的頁面與元件中寫死的中文字串，需改為透過 `next-intl` 的翻譯函式讀取

## Capabilities

### New Capabilities
- `i18n-routing`: 全站語系路由與語言切換機制

### Modified Capabilities

（無——`homepage-brand` 尚未 archive 進主 spec，不適用 Modified 流程；其畫面行為不因語系而改變，僅文字來源機制受影響，於 Impact 段落說明）

## Impact

- 新增：`src/i18n/`（next-intl 設定）、`messages/zh-TW.json`、`messages/en.json`、`src/middleware.ts`（locale 偵測與導向）
- 大幅調整：`src/app/layout.tsx`、`src/app/page.tsx` 需搬移至 `src/app/[locale]/` 底下；`Header`、`Hero`、`About`、`FeaturedVideos`、`SocialFooter` 需把寫死字串換成翻譯 key
- 不涉及後端資料的多語系（例如 `SheetMusic.title` 目前 schema 沒有多語欄位）——資料庫內容的多語系是否需要，待使用者確認後可另開 change，本次僅處理介面文字（UI copy）的多語系
- 假資料層（`getProfileConfig`／`getFeaturedVideos`）目前回傳的內容也是中文寫死；本次連動調整為依語系回傳對應內容，或改為回傳語系無關的資料 + 由元件端組合翻譯文字（實作細節留待 design.md 決定）
