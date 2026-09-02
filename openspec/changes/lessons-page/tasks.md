## 1. 翻譯檔案

- [x] 1.1 於 `messages/zh-TW.json`、`en.json`、`ja.json`、`ko.json` 新增 `lessons` 區塊：頁面標題、空狀態文字、表單欄位標籤（姓名/Email/電話/訊息）、必填錯誤提示、送出按鈕、成功/失敗訊息

## 2. 驗證邏輯

- [x] 2.1 建立 `src/lib/validation/lesson-inquiry.ts`：匯出 `validateLessonInquiry(input)`，檢查姓名/Email/訊息必填、Email 格式，回傳結構化的欄位錯誤（前後端共用）

## 3. 教學方案呈現

- [x] 3.1 建立 `src/app/[locale]/lessons/page.tsx`（Server Component），查詢 `servicePackage.findMany({ where: { type: 'LESSON', isPublished: true }, orderBy: { sortOrder: 'asc' } })` 與 `profileConfig`（取得 `calendlyUrl`）
- [x] 3.2 建立 `src/components/lessons/LessonPackages.tsx`：呈現課程卡片（標題、價格說明、描述），清單為空時顯示空狀態文字
- [x] 3.3 序列化 `ServicePackage`（`priceInfo` 為字串，未使用 Decimal 類型欄位，不需額外序列化處理）

## 4. 預約/詢問表單

- [x] 4.1 建立 `src/app/[locale]/lessons/actions.ts`：`"use server"` 的 `submitLessonInquiry`，呼叫 `validateLessonInquiry`，通過後 `prisma.commission.create({ type: 'LESSON', ... })`，回傳結構化成功/錯誤結果
- [x] 4.2 建立 `src/components/lessons/CalendlyEmbed.tsx`：接收 `calendlyUrl`，渲染 iframe
- [x] 4.3 建立 `src/components/lessons/LessonInquiryForm.tsx`（Client Component）：姓名/Email/電話/訊息欄位，即時呼叫 `validateLessonInquiry` 顯示欄位錯誤，送出時呼叫 Server Action，處理 loading/成功/失敗三種狀態
- [x] 4.4 `page.tsx` 依 `profileConfig.calendlyUrl` 是否有值，二擇一渲染 `CalendlyEmbed` 或 `LessonInquiryForm`
- [x] 4.5 修正根層級 404 處理：刪除 `sheet-music-store` change 建立的 `src/app/not-found.tsx`（會觸發 Next.js「not-found.tsx doesn't have a root layout」錯誤），改為新增 `src/app/[locale]/[...catchAll]/page.tsx`（呼叫 `notFound()`），詳見 design.md 的 Risk 說明

## 5. 整體驗收

- [x] 5.1 執行 `npx tsc --noEmit` 與 `npm run lint`，確認無錯誤
- [x] 5.2 瀏覽器驗證：`/lessons` 顯示已上架的 LESSON 服務項目；建立測試用未上架項目確認不顯示後撤銷
- [x] 5.3 瀏覽器驗證表單：留白必填欄位無法送出並顯示提示；填妥後送出成功寫入 `Commission`（用 Prisma 查詢確認欄位值正確）並顯示成功訊息、表單轉為唯讀；測試資料已清除
- [x] 5.4 中文（`zh-TW`）已完整驗證頁面文案與表單流程；其餘三語系（`en`／`ja`／`ko`）翻譯檔內容與 `zh-TW` 走同一套 key 結構撰寫，經檢視無缺漏
- [x] 5.5 桌面（1200px）與行動裝置（375px）寬度皆截圖驗證版面正常，無橫向捲動

## 6. 額外驗證（超出原定範圍，套用時發現值得確認）

- [x] 6.1 驗證根層級 404 修正：造訪完全不匹配任何頁面的路徑（`/commissions`，尚未建立），確認正確顯示 `[locale]/not-found.tsx` 的 404 頁面，不再觸發 hydration 錯誤或空白畫面
- [x] 6.2 驗證 Calendly／表單二擇一：暫時將 `ProfileConfig.calendlyUrl` 設為測試網址，確認頁面改為顯示 iframe 且表單消失；驗證後已還原為 `null`
