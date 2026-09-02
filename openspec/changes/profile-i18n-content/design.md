## Context

`admin-profile` design.md Decision 1 明確記錄了「單一中文內容」是與使用者確認過的取捨，也記錄了這個決定的成本（失去多語言差異）。使用者現在要拿回這個差異化能力。這是本專案第一次有資料庫欄位需要「依語系存放內容」，之前 `next-intl` 的 `messages/*.json` 處理的是介面文字（按鈕、標籤），不是音樂人自訂的品牌內容。

## Goals / Non-Goals

**Goals:**
- 音樂人能在後台針對中／英／日／韓分別編輯 Hero 標題、副標題、關於我簡介、風格標籤
- 首頁依訪客語系顯示對應版本，某語系版本還沒填寫時不會開天窗（退回中文）
- 既有的真實中文內容在 migration 過程中不遺失

**Non-Goals:**
- 不做其他內容（樂譜、服務項目、影片標題）的多語言化——見 proposal.md
- 不做自動翻譯功能（音樂人自己輸入每個語系的文字，不整合翻譯 API）

## Decisions

**1. 用單一 JSON 欄位存放語系對照表，不建立獨立的多語言資料表**
`heroTitle`／`heroSubtitle`／`aboutBio`／`styleTags` 都改成 Prisma `Json` 型別，存放 `{ "zh-TW": "...", "en": "...", "ja": "...", "ko": "..." }`（`styleTags` 每個語系存一個字串陣列）。不另外建立像 `ProfileConfigTranslation` 這樣的關聯表。
理由：`ProfileConfig` 本來就是單筆的 site-wide 設定（`id` 固定是 `"site-config"`），不是會有「多筆、每筆都要各自翻譯」的清單資料；JSON 欄位對這種「單一設定、少數幾個語系」的情境是最簡單直接的做法，不需要多一張表、多一層 join 查詢。

**2. `getProfileConfig(locale)` 拿回 `locale` 參數，在讀取時就把 JSON 解析成扁平字串／陣列**
`getProfileConfig` 的回傳型別不再是 Prisma 的 `ProfileConfig`（那個型別的 `heroTitle` 現在是 `JsonValue`），而是一個新的 `ResolvedProfileConfig` 型別，把 4 個 JSON 欄位解析成 `Hero.tsx`／`About.tsx`／`SocialFooter.tsx` 原本就在用的單一字串／字串陣列。解析邏輯：`(value as Record<string, string>)[locale] || (value as Record<string, string>)["zh-TW"]`，缺漏或空字串時退回中文版。
理由：前台元件不應該關心「這個欄位背後是不是 JSON、有沒有多語系」這種細節，維持它們原本簡單的 `profile.heroTitle: string` 介面；把「依語系解析＋退回中文」這個邏輯集中在資料讀取層的單一函式，其他地方完全不用重複這個判斷。

**3. 英／日／韓的起始內容：套用時直接翻譯現有中文版放進去**
套用這個 change 時，會把資料庫現有的中文內容（`heroTitle`／`heroSubtitle`／`aboutBio`／`styleTags`）翻譯成英／日／韓，一併寫入 migration 後的資料列，而不是留白等音樂人自己填。
理由：與使用者確認過的決定；留白會讓其他三個語系的訪客看到退回中文的內容，不如先給一個堪用的起始翻譯，音樂人之後可以直接在後台微調文字，比從空白開始寫容易。

**4. Migration 用手動改寫的 SQL，把既有中文值包進新 JSON 結構的 `zh-TW` 鍵，而非清空重建**
schema 變更（`String`→`Json`、`String[]`→`Json`）用 `prisma migrate dev --create-only` 產生骨架，手動把 `ALTER COLUMN ... TYPE JSONB` 的 `USING` 子句改成 `jsonb_build_object('zh-TW', "欄位名稱")`（`styleTags` 額外用 `to_jsonb(...)` 包住陣列），讓既有的真實中文內容保留下來成為 `zh-TW` 鍵的值，而不是讓 Prisma 預設的破壞性重建把資料庫裡的真實內容清空。英／日／韓的值則是 migration 之後另外用一支腳本 `update` 進去（見 Decision 3）。
理由：這張表現在存的是正式站在用的真實品牌文案（不是種子測試資料），跟先前 `FeaturedVideo` 那次「表是空的所以隨便重建沒差」的情況不同，這裡必須用保資料的方式處理。

**5. 表單驗證：中文為必填（做為退回內容的來源），英／日／韓選填**
`validateProfileUpdate` 只檢查每個欄位的 `"zh-TW"` 值非空；`en`／`ja`／`ko` 可以留空，留空時前台自動退回中文（見 Decision 2），不擋表單送出。
理由：中文是唯一保證一定存在、用來兜底的語系，其餘三語系本質上是「有更好，沒有也不會讓網站開天窗」的加值內容；如果要求四語系都填完才能存檔，會讓音樂人沒辦法「先改完中文就存檔，翻譯之後再慢慢補」這種很自然的編輯節奏。

## Risks / Trade-offs

- [風險] JSON 欄位失去資料庫層級的型別/必填檢查（不像原本的 `String` 欄位那樣資料庫本身會擋 `null`）→ 緩解：正確性檢查移到應用層（Decision 5 的驗證函式＋Decision 2 的退回邏輯），這與專案裡其餘欄位「授權/驗證在應用層而非資料庫層」的既有原則一致
- [風險] 英／日／韓的起始翻譯是我自己翻的，可能有音樂人不滿意的措辭 → 緩解：已於 Decision 3 記錄為刻意的「先求堪用起始值」，翻譯完成後會請音樂人自己檢視微調
- [風險] Migration 的手動 SQL 如果寫錯，可能真的遺失正式站內容 → 緩解：套用前會先用腳本讀出並印出當下的真實資料庫內容做為備份記錄，且用 `--create-only` 讓我能在真正執行前先檢視產生的 SQL

## Open Questions

（無）
