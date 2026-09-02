## 1. 安裝與基礎設定

- [x] 1.1 安裝 `next-intl`
- [x] 1.2 建立 `src/i18n/routing.ts`（定義 `locales: ['zh-TW', 'en']`、`defaultLocale: 'zh-TW'`）與 `src/i18n/navigation.ts`（`createNavigation`）
- [x] 1.3 建立 `src/i18n/request.ts`（`getRequestConfig`，依 locale 載入對應 `messages/*.json`）
- [x] 1.4 建立 `src/middleware.ts`，套用 next-intl 的 middleware 與 matcher
- [x] 1.5 更新 `next.config.mjs`，套用 `createNextIntlPlugin()`

## 2. 翻譯檔案

- [x] 2.1 建立 `messages/zh-TW.json`：涵蓋 nav（4 個導覽項＋購物車＋選單開關＋語言切換 aria-label）、hero（kicker／location／scroll）、about（title）、featuredVideos（title）、footer（instagram／youtube／email aria-label）、audioPlayer（play／pause／close aria-label）
- [x] 2.2 建立對應的 `messages/en.json`，內容為英文翻譯

## 3. 路由結構搬遷

- [x] 3.1 建立 `src/app/[locale]/layout.tsx`（原 `src/app/layout.tsx` 內容搬入，含 `generateStaticParams`、`hasLocale` 檢查與 404 fallback、`NextIntlClientProvider`）
- [x] 3.2 建立 `src/app/[locale]/page.tsx`（原 `src/app/page.tsx` 內容搬入，`getProfileConfig`／`getFeaturedVideos` 改為傳入 `locale`）
- [x] 3.3 刪除原 `src/app/layout.tsx`、`src/app/page.tsx`
- [x] 3.4 驗證 `/` 與 `/en` 皆可正常渲染（瀏覽器截圖確認），`/fr` 回傳 404（已確認分頁標題顯示「404: This page could not be found.」）

## 4. 元件改用翻譯 key

- [x] 4.1 `Header.tsx`：導覽連結、購物車 aria-label、選單開關 aria-label 改用 `useTranslations('nav')`；新增語言切換控制項（`@/i18n/navigation` 的 `useRouter().replace(pathname, { locale })`，切換後停留同頁——已截圖確認 About/FeaturedVideos/Footer 內容同步切換）
- [x] 4.2 `Hero.tsx`：kicker／location／scroll 文字改用 `useTranslations('hero')`
- [x] 4.3 `About.tsx`：「關於我」標題改用 `useTranslations('about')`
- [x] 4.4 `FeaturedVideos.tsx`：「精選演奏」標題改用 `useTranslations('featuredVideos')`
- [x] 4.5 `SocialFooter.tsx`：Instagram／YouTube／Email 的 aria-label 改用 `useTranslations('footer')`，並新增 YouTube 連結項（`profile.youtubeUrl` 存在時顯示，圖示用 lucide 的 `Video`）
- [x] 4.6 `GlobalAudioPlayer.tsx`：播放/暫停/關閉的 aria-label 改用 `useTranslations('audioPlayer')`

## 5. 假資料層語系化

- [x] 5.1 `profile.ts`：`getProfileConfig(locale: string)`，`zh-TW`／`en` 各回傳一份對應語言的內容（含新增的 `youtubeUrl` 欄位）
- [x] 5.2 `featured-videos.ts`：`getFeaturedVideos(locale: string)`，`zh-TW`／`en` 各回傳一份對應語言的標題
- [x] 5.3 `prisma/schema.prisma` 的 `ProfileConfig` 已新增 `youtubeUrl String?` 欄位（本次對話中使用者直接要求，未走完整 propose 流程，於此記錄）——`npx prisma generate` 重新產生型別後 `npx tsc --noEmit` 通過

## 6. 整體驗收

- [x] 6.1 執行 `npm run lint` 與 `npx tsc --noEmit`，確認無錯誤
- [x] 6.2 於瀏覽器分別開啟 `/` 與 `/en`，截圖確認文案語言正確、語言切換器可正常切換且停留同頁（以 `window.location.pathname` 驗證為 `/en`）
- [ ] 6.3 於行動裝置寬度重新確認 Header（含新增的語言切換器）不破版——桌面寬度已截圖確認；行動選單展開的點擊在本工具環境反覆逾時（非程式錯誤，console 無錯誤訊息、程式碼為標準 `useState` 切換），視覺版面本身在 375px 寬度下未見跑版，但選單展開互動尚未能直接截圖驗證，記錄為已知限制

## 7. 追加語系（使用者於套用後要求新增日文／韓文）

- [x] 7.1 `src/i18n/routing.ts` 的 `locales` 加入 `'ja'`、`'ko'`
- [x] 7.2 建立 `messages/ja.json`、`messages/ko.json`（對齊既有 key 結構的日／韓文翻譯）
- [x] 7.3 建立 `src/i18n/locale-names.ts`，提供語系代碼對應顯示名稱（中文／EN／日本語／한국어）
- [x] 7.4 `Header.tsx` 語言切換器改為下拉選單（列出 `routing.locales` 全部選項，含點外部關閉），移除原本雙語 toggle 邏輯
- [x] 7.5 `profile.ts`／`featured-videos.ts` 新增 `ja`／`ko` 對應內容
- [x] 7.6 `specs/i18n-routing/spec.md` 的「網址反映語系」Requirement 更新為四語系
- [x] 7.7 瀏覽器驗證：`/ja`、`/ko` 皆正確渲染對應語言（以 `getPageText` 逐字確認 nav／hero／about／featuredVideos／footer 全部翻譯正確），透過下拉選單點選「日本語」可正確切換
