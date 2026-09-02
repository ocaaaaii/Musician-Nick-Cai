## 1. 驗證邏輯

- [x] 1.1 建立 `src/lib/validation/profile.ts`：匯出 `validateProfileUpdate(input)`，檢查 `heroTitle`／`heroSubtitle`／`aboutBio` 必填，`instagramUrl`／`youtubeUrl`／`calendlyUrl`（選填，若有填寫須為合理 URL 格式），回傳結構化欄位錯誤
- [x] 1.2 同檔案匯出 `validateFeaturedVideoInput(input)`：檢查 `title`／`videoUrl` 必填，`videoUrl` 須為合理 URL 格式（欄位名稱因 0. 的 platform 支援而由 `youtubeUrl` 改為通用的 `videoUrl`）

## 0. 精選影片支援 YouTube／Instagram 兩種來源（套用時使用者追加需求）

- [x] 0.1 `schema.prisma`：`FeaturedVideo.youtubeUrl` 改名 `videoUrl`，新增 `platform`（`VideoPlatform` enum：`YOUTUBE`／`INSTAGRAM`，預設 `YOUTUBE`）；執行 `npx prisma migrate dev`（套用時表為空表，無資料流失）
- [x] 0.2 `src/components/home/FeaturedVideos.tsx`：依 `platform` 分支渲染，`YOUTUBE` 沿用既有自家風格卡片，`INSTAGRAM` 改用 `next/script` 載入 `embed.js` 的官方原生嵌入 blockquote（僅在清單中存在至少一支 Instagram 影片時載入腳本）
- [x] 0.3 `FeaturedVideoManager.tsx`／`actions.ts`／`validation/profile.ts`：新增/編輯表單與驗證邏輯支援選擇來源平台

## 2. 首頁改讀即時資料庫內容

- [x] 2.1 改寫 `src/lib/content/profile.ts`：`getProfileConfig()` 拿掉 `locale` 參數，改為 `prisma.profileConfig.findUniqueOrThrow({ where: { id: "site-config" } })`
- [x] 2.2 改寫 `src/lib/content/featured-videos.ts`：`getFeaturedVideos()` 拿掉 `locale` 參數，改為查詢 `isPublished: true`、依 `sortOrder` 排序
- [x] 2.3 更新 `src/app/[locale]/page.tsx`：呼叫端拿掉傳入的 `locale` 參數，`params`/`locale` 不再被使用，一併移除
- [x] 2.4 更新現有 `ProfileConfig` 資料列：把 `aboutBio`／`styleTags` 補齊到目前假資料層 zh-TW 版本的完整內容，避免切換後內容倒退
- [x] 2.5 刪除示範用的 `FeaturedVideo`（Rick Astley 連結那筆），確認首頁精選影片區塊在無已上架影片時正確隱藏；`prisma/seed.ts` 同步移除示範影片的種子邏輯

## 3. 個人品牌設定表單

- [x] 3.1 建立 `src/app/admin/(protected)/profile/actions.ts`：`updateProfile(input)` 呼叫 `validateProfileUpdate`，通過後 `prisma.profileConfig.update(...)`，成功後 `revalidatePath("/[locale]", "layout")` 讓首頁下次讀取立即反映，回傳結構化成功/錯誤結果
- [x] 3.2 建立 `src/components/admin/ProfileForm.tsx`（Client Component）：`heroTitle`／`heroSubtitle`／`aboutBio`／`instagramUrl`／`youtubeUrl`／`contactEmail`／`calendlyUrl` 欄位＋風格標籤新增/刪除介面（本地 state 陣列），送出時呼叫 `updateProfile`，處理 loading／成功／錯誤狀態

## 4. 精選影片管理

- [x] 4.1 同 `actions.ts` 新增：`addFeaturedVideo(input)`、`updateFeaturedVideo(id, input)`、`deleteFeaturedVideo(id)`，新增/更新前呼叫 `validateFeaturedVideoInput`，皆於成功後 revalidate 首頁
- [x] 4.2 建立 `src/components/admin/FeaturedVideoManager.tsx`（Client Component）：列出所有影片（含未上架），每筆可編輯標題／連結／來源平台／排序數字／上下架切換／刪除，底部提供新增影片的小表單；新增成功後 `router.refresh()` 取得伺服器指派的 id

## 5. 頁面組裝

- [x] 5.1 建立 `src/app/admin/(protected)/profile/page.tsx`（Server Component）：以 Prisma 直接查詢完整 `ProfileConfig` 與全部 `FeaturedVideo`（含未上架，依 `sortOrder` 排序），渲染 `ProfileForm` 與 `FeaturedVideoManager`
- [x] 5.2 `src/app/admin/(protected)/page.tsx` 的模組清單中，「個人品牌與首頁」項目改為可點擊連結至 `/admin/profile`，移除「即將推出」標記

## 6. 整體驗收

- [x] 6.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 6.2 瀏覽器驗證：首頁（含 `/en`）Hero／關於我／風格標籤／社群連結皆顯示資料庫 `ProfileConfig` 內容，精選影片區塊在目前資料庫狀態（無已上架影片）正確隱藏
- [x] 6.3 瀏覽器驗證：`/admin/profile` 修改欄位並存檔，重新整理首頁確認已更新——使用者登入後自行測試通過
- [x] 6.4 瀏覽器驗證：以 Prisma 直接寫入一支 YouTube 與一支 Instagram 測試 `FeaturedVideo`，確認首頁正確渲染兩種樣式——YouTube 沿用自家卡片，Instagram 的 `embed.js` 成功把 blockquote 轉成原生 iframe；發現並修正一個問題：Instagram 只是把原始 blockquote 改名 class（非隱藏），會在格線多出一個空格子，已於 `globals.css` 加上 `.instagram-media-registered { display: none }` 修正；測試資料已清除。透過 `/admin/profile` 表單新增/刪除影片的操作流程，使用者登入後自行測試通過
- [x] 6.5 瀏覽器驗證：必填欄位留空、URL 格式錯誤時前端正確阻擋並提示——使用者登入後自行測試通過
- [x] 6.6 瀏覽器驗證：風格標籤新增/刪除後存檔，確認資料庫陣列正確更新——使用者登入後自行測試通過
