## 1. 翻譯檔案

- [x] 1.1 於 `messages/zh-TW.json`、`en.json`、`ja.json`、`ko.json` 新增 `commissions` 區塊：頁面標題、採譜/合作區塊標題、各自空狀態文字、表單欄位標籤（委託類型/姓名/Email/電話/參考連結/內容說明）、必填與格式錯誤提示、送出按鈕、成功/失敗訊息

## 2. 驗證邏輯

- [x] 2.1 建立 `src/lib/validation/commission-inquiry.ts`：匯出 `validateCommissionInquiry(input)`，檢查姓名/Email/內容說明必填、Email 格式、參考連結（選填，若有填寫須為合理 URL 格式），回傳結構化欄位錯誤

## 3. 服務項目呈現

- [x] 3.1 建立 `src/app/[locale]/commissions/page.tsx`（Server Component），分別查詢 `type: 'TRANSCRIPTION'` 與 `type: 'COLLABORATION'`（皆 `isPublished: true`，依 `sortOrder` 排序）
- [x] 3.2 建立 `src/components/commissions/CommissionPackages.tsx`：呈現單一類型的服務卡片列表，清單為空時顯示該類型專屬空狀態文字
- [x] 3.3 `page.tsx` 分別以標題區塊呈現兩種類型（採譜／合作），視覺上明確可分辨

## 4. 委託表單

- [x] 4.1 建立 `src/app/[locale]/commissions/actions.ts`：`"use server"` 的 `submitCommissionInquiry`，呼叫 `validateCommissionInquiry`，通過後 `prisma.commission.create({...})`（`type` 依使用者選擇），回傳結構化成功/錯誤結果
- [x] 4.2 建立 `src/components/commissions/CommissionInquiryForm.tsx`（Client Component）：委託類型選擇（採譜／合作）、姓名/Email/電話/參考連結/內容說明欄位，即時驗證顯示欄位錯誤，送出時呼叫 Server Action，處理 loading/成功/失敗三種狀態
- [x] 4.3 `page.tsx` 掛載 `CommissionInquiryForm`（不做 Calendly 分支，見 design.md Decision 1）

## 5. 整體驗收

- [x] 5.1 執行 `npx tsc --noEmit` 與 `npm run lint`，確認無錯誤
- [x] 5.2 瀏覽器驗證：`/commissions` 分別顯示已上架的 TRANSCRIPTION／COLLABORATION 項目（含使用者新增的「鋼琴合作／伴奏邀約」），且 LESSON 類型項目不出現。個別類型的空狀態文字（`CommissionPackages` 的 `packages.length === 0` 分支）與 `sheet-music-store`／`lessons-page` 已驗證過的同一模式邏輯相同，未額外用真實內容做破壞性測試（不想擾動剛新增的實際內容），以程式碼檢視確認邏輯正確
- [x] 5.3 瀏覽器驗證表單：選擇「合作邀約」送出後，用 Prisma 查詢確認 `Commission.type` 為 `COLLABORATION` 且 `audioUrl` 正確寫入；參考連結填入不合理格式（`not-a-valid-url`）會被擋下並提示，改填有效網址後可正常送出；測試資料已清除
- [x] 5.4 四語系文案確認正確（韓文翻譯已修正誤用中文字「採譜」為「채보」的問題）
- [x] 5.5 桌面（1200px）與行動裝置（375px）寬度皆截圖驗證版面正常，無橫向捲動

## 6. 內容新增（套用時使用者提出，非原定範圍）

- [x] 6.1 `prisma/seed.ts` 新增「鋼琴合作／伴奏邀約」服務項目（`COLLABORATION`），並調整既有「商業合作邀約」的 `sortOrder` 使新項目排在前面；已同步套用到 Supabase 資料庫（非測試資料）
