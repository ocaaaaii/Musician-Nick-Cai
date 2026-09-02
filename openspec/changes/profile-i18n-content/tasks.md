## 1. 備份現有內容

- [x] 1.1 腳本讀出並記錄目前 `ProfileConfig` 的真實內容（`heroTitle`／`heroSubtitle`／`aboutBio`／`styleTags`），做為 migration 前的備份與英/日/韓翻譯的依據

## 2. 資料庫 Migration

- [x] 2.1 `schema.prisma`：`heroTitle`／`heroSubtitle`／`aboutBio`／`styleTags` 改為 `Json` 型別
- [x] 2.2 `npx prisma migrate dev --create-only` 產生骨架，手動修改 `USING` 子句為 `jsonb_build_object('zh-TW', "欄位")`（`styleTags` 用 `jsonb_build_object('zh-TW', to_jsonb("styleTags"))`），確保既有中文內容原地保留為 `zh-TW` 鍵值，不遺失
- [x] 2.3 套用 migration，查詢確認資料庫裡的既有中文內容正確保留在新的 JSON 結構中——過程中遇到一次卡住的 advisory lock（前一次 `migrate dev` 因逾時被中止，但伺服器端連線沒有正常關閉），用 `pg_terminate_backend` 手動清除該筆殘留連線後才能繼續；套用後直接查資料庫確認 `zh-TW` 內容與 migration 前的備份一致，無遺失
- [x] 2.4 執行資料填入腳本：把 1.1 備份的中文內容翻譯成英／日／韓，`update` 進資料庫的 `en`／`ja`／`ko` 鍵值

## 3. 資料讀取層

- [x] 3.1 `src/lib/content/profile.ts`：`getProfileConfig(locale)` 拿回 `locale` 參數，查詢後把 4 個 JSON 欄位依語系解析成扁平字串／陣列（缺漏或空值時退回 `zh-TW`），定義 `ResolvedProfileConfig` 型別取代直接使用 Prisma 的 `ProfileConfig` 型別
- [x] 3.2 `src/app/[locale]/page.tsx`：呼叫 `getProfileConfig(locale)` 時重新傳入 `locale`
- [x] 3.3 `src/components/home/Hero.tsx`／`About.tsx`／`SocialFooter.tsx`：`profile` prop 型別改用 `ResolvedProfileConfig`（元件內部邏輯不需改變，因為解析後仍是扁平字串／陣列）

## 4. 驗證邏輯與 Server Action

- [x] 4.1 `src/lib/validation/profile.ts`：`ProfileUpdateInput` 的 `heroTitle`／`heroSubtitle`／`aboutBio` 改為 `{ "zh-TW": string; en?: string; ja?: string; ko?: string }`，`styleTags` 改為對應的陣列版本；`validateProfileUpdate` 只檢查每個欄位的 `zh-TW` 值非空
- [x] 4.2 `src/app/admin/(protected)/profile/actions.ts`：`updateProfile` 把整個語系物件（trim 過、清掉空值的版本）寫入對應欄位（Prisma `Json` 型別）

## 5. 後台表單

- [x] 5.1 `src/components/admin/ProfileForm.tsx`：新增語言頁籤 UI（中文／EN／日本語／한국어），選取的頁籤決定目前編輯的是哪個語系的 `heroTitle`／`heroSubtitle`／`aboutBio`／風格標籤；IG／YouTube／Email／Calendly 欄位維持在頁籤外、不分語系

## 6. 整體驗收

- [x] 6.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 6.2 瀏覽器驗證：`/zh-TW`、`/en`、`/ja`、`/ko` 首頁分別正確顯示對應語系的 Hero 標題/副標題、關於我簡介、風格標籤內容，四語系文字皆不相同且正確對應
- [x] 6.3 驗證：`/admin/profile` 未登入正確導向登入頁，無編譯錯誤，確認頁面與元件的型別串接正確
- [ ] 6.4 瀏覽器驗證：`/admin/profile` 實際切換語言頁籤、編輯後存檔，確認只有該語系被更新——待使用者登入後自行測試
