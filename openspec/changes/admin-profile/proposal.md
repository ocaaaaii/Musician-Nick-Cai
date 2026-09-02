## Why

技術規格書 A2「個人品牌與首頁管理」尚未開發。`admin-auth` 已完成登入與 `role == ADMIN` 的路由保護，`/admin` 目前只有一個空殼首頁。同時，目前首頁的 Hero／About／精選影片其實還是接在 `homepage-brand-section`／`i18n-setup` 兩個 change 留下的「假資料層」（`src/lib/content/profile.ts`、`src/lib/content/featured-videos.ts`，程式碼註解本來就寫明「P1 資料庫連上後即可替換」），不是真的讀資料庫；精選影片那筆種子資料甚至是一個 Rick Astley 的示範連結。這個 change 要一次把「後台可編輯」與「首頁真的讀資料庫」接起來，否則做了後台編輯也不會反映在首頁上。

## What Changes

- 建立 `/admin/profile` 頁面：編輯 `ProfileConfig`（Hero 標題／副標題、關於我簡介、風格標籤、IG／YouTube／Email／Calendly 連結）與管理 `FeaturedVideo`（新增／編輯／刪除／排序／上下架）
- `FeaturedVideo` 新增 `platform` 欄位（YouTube／Instagram Reels 兩種來源），`youtubeUrl` 改名為通用的 `videoUrl`；首頁依來源分別渲染（YouTube 用現有自家風格卡片，Instagram 用官方原生嵌入小工具）——套用過程中使用者追加的需求，詳見 design.md Decision 5
- 首頁（`Hero`／`About`／`FeaturedVideos`／`SocialFooter`）改為讀取 Prisma 的 `ProfileConfig`／已上架 `FeaturedVideo`，取代 `src/lib/content/profile.ts`、`src/lib/content/featured-videos.ts` 的假資料
- 內容改為單一中文版本，不再依語言分支（見 design.md Decision 1）——`ProfileConfig`／`FeaturedVideo` 本來就沒有多語言欄位，這與規格書的 schema 一致
- 移除首頁精選影片區塊目前的示範資料（Rick Astley 連結），改為空清單（畫面上該區塊直接隱藏，行為與現有「無已上架影片時不顯示區塊」邏輯一致），待音樂人自己在後台新增真實影片

## Capabilities

### New Capabilities
- `admin-profile-editing`: 後台編輯個人品牌設定與精選影片的行為
- `homepage-live-content`: 首頁改為讀取即時資料庫內容，取代假資料層

### Modified Capabilities

（無——`homepage-brand-section`／`i18n-setup` 當時就已經把「串接真資料庫」列為留待之後的工作，這裡是兌現而非變更既有規格）

## Impact

- 新增：`src/app/admin/(protected)/profile/page.tsx`、`actions.ts`，`src/components/admin/ProfileForm.tsx`、`FeaturedVideoManager.tsx`，`src/lib/validation/profile.ts`
- 資料庫 migration：`FeaturedVideo.youtubeUrl` → `videoUrl`，新增 `platform`（`VideoPlatform` enum，預設 `YOUTUBE`）欄位；套用時該表為空表，無資料流失風險
- 修改：`src/lib/content/profile.ts`、`src/lib/content/featured-videos.ts`（body 換成 Prisma 查詢，簽名拿掉 `locale` 參數）、`src/app/[locale]/page.tsx`（呼叫端同步更新）
- 資料庫：更新現有 `ProfileConfig` 那筆資料，補齊目前假資料層裡比較完整的中文文案（`aboutBio` 少了一句、`styleTags` 少了「即興伴奏」），讓切換過去時內容不倒退；刪除示範用的 `FeaturedVideo`（Rick Astley 連結）
- **不包含**：`heroVideoUrl` 欄位的後台編輯介面——目前 `Hero.tsx` 沒有渲染這個欄位（寫死本地照片 `/images/nick-cai.png`），要接起來需要圖片/影片上傳到 R2 的基礎設施，R2 還沒建立，留給之後的 change（可能與 A3 樂譜檔案上傳一起做）
- **不包含**：`aboutBio` 的 Markdown 富文本編輯器——規格書提到但目前 `About.tsx` 本來就是把 `aboutBio`當純文字渲染，沒有 Markdown 解析；用純文字框已經足夠，之後若真的需要格式化文字再評估
- **不包含**：Email／即時通知（音樂人存檔後不會收到通知信，Resend 尚未設定）
