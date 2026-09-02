## 1. 驗證邏輯

- [ ] 1.1 建立 `src/lib/validation/sheet-music.ts`：匯出 `validateSheetMusicInput(input)`，檢查 `title`／`difficulty`／`genre`／`pdfFileKey`／`audioSampleUrl` 必填，`price` 須為正數，回傳結構化欄位錯誤

## 2. Server Actions

- [ ] 2.1 建立 `src/app/admin/(protected)/sheets/actions.ts`：`createSheetMusic(input)`、`updateSheetMusic(id, input)` 呼叫 `validateSheetMusicInput`，通過後寫入 Prisma；`sampleImages` 由 textarea 換行字串轉陣列（逐行 trim、過濾空字串）
- [ ] 2.2 同檔案：`deleteSheetMusic(id)`，執行前檢查是否存在關聯 `OrderItem`，若有則拒絕並回傳錯誤訊息
- [ ] 2.3 同檔案：`toggleSheetMusicPublished(id, isPublished)`，直接更新 `isPublished`
- [ ] 2.4 上述異動成功後皆 `revalidatePath` 前台 `/sheets` 相關路徑

## 3. 頁面與元件

- [ ] 3.1 建立 `src/app/admin/(protected)/sheets/page.tsx`（Server Component）：查詢所有 `SheetMusic`（含未上架），帶 `_count`（只計 `Order.status: SUCCESS` 的 `orderItems`），依建立時間排序
- [ ] 3.2 建立 `src/components/admin/SheetMusicManager.tsx`（Client Component）：商品列表（標題／價格／難易度／曲風／銷售量／上下架 Switch／編輯／刪除按鈕），新增/編輯用同一個表單（`pdfFileKey`／`audioSampleUrl` 文字輸入、`sampleImages` textarea，皆標註「暫時：貼上網址」），刪除前彈出確認
- [ ] 3.3 `src/app/admin/(protected)/page.tsx` 的模組清單中，「樂譜商品管理」項目改為可點擊連結至 `/admin/sheets`，移除「即將推出」標記

## 4. 整體驗收

- [x] 4.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 4.2 驗證：以 Prisma 直接查詢確認 `_count`（只計 `SUCCESS` 訂單）邏輯正確——「示範樂譜」的種子訂單為 `SUCCESS`，查詢結果 `salesCount: 1`，符合預期；`/admin/sheets` 未登入會正確導向 `/admin/login`；前台 `/sheets` 無回歸（正常顯示種子樂譜）
- [ ] 4.3 瀏覽器驗證：新增一筆測試樂譜，確認出現在列表與前台 `/sheets`；下架後前台不再顯示；刪除該測試樂譜（不涉及訂單，應可成功刪除）——待使用者登入後自行測試
- [ ] 4.4 瀏覽器驗證：必填欄位留空、價格為零或負數時前端正確阻擋並提示——待使用者登入後自行測試
- [ ] 4.5 瀏覽器驗證：嘗試刪除已有訂單關聯的樂譜（種子資料中的「示範樂譜」有一筆種子訂單）被正確阻擋並提示改用下架——待使用者登入後自行測試
