## Why

`admin-profile`當時與使用者確認過，品牌文案（Hero 標題／副標題、關於我簡介、風格標籤）先做成單一中文版本，四語系都顯示同一份內容，理由是「後台只維護一份內容，避免多語言表單的複雜度」。使用者現在改變主意，要求後台可以切換四種語言分別編輯這四個欄位——這個 change 就是兌現 `admin-profile` design.md 當時記錄的「之後若真的需要，屆時再評估」。

## What Changes

- `ProfileConfig` 的 `heroTitle`、`heroSubtitle`、`aboutBio`、`styleTags` 四個欄位改為 JSON，各自存放 `{ "zh-TW": ..., "en": ..., "ja": ..., "ko": ... }` 這樣的語系對照結構（`styleTags` 每個語系存一組陣列）
- `/admin/profile` 的品牌設定表單新增語言頁籤（中文／EN／日本語／한국어），這四個欄位依選取的頁籤分別編輯；其餘欄位（IG／YouTube／Email／Calendly 連結）維持不分語言，不放進頁籤裡
- 首頁改回依訪客當下的語系讀取對應版本的文案，讀不到對應語系版本時 SHALL 退回顯示中文版（不會出現空白）
- 英／日／韓三語系目前沒有實際內容，這次套用時直接翻譯一版放進資料庫作為起始值（見 design.md Decision 3），之後音樂人可以自己在後台微調

## Capabilities

### Modified Capabilities
- `admin-profile-editing`：品牌文案四欄位改為分語系編輯
- `homepage-live-content`：首頁品牌文案改為依語系讀取，不再是四語系同一份中文

## Impact

- 修改：`prisma/schema.prisma`（4 個欄位型別變更，需要 migration，且資料庫已有真實內容，migration 要保留現有中文內容而非清空重建）
- 修改：`src/lib/content/profile.ts`（`getProfileConfig()` 拿回 `locale` 參數，回傳值把 JSON 依語系解析成前台元件原本預期的單一字串／陣列）
- 修改：`src/lib/validation/profile.ts`、`src/app/admin/(protected)/profile/actions.ts`、`src/components/admin/ProfileForm.tsx`（表單改為語言頁籤，驗證邏輯調整為「中文為必填、其餘語系選填並在缺漏時前台退回中文」）
- 修改：`src/app/[locale]/page.tsx`（呼叫 `getProfileConfig` 時重新傳入 `locale`）
- **不包含**：`FeaturedVideo.title`、`SheetMusic`、`ServicePackage` 的多語言化——與使用者確認過這次範圍只限首頁品牌文案（Hero／關於我／風格標籤），這幾個維持單一中文
