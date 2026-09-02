## 1. Server Action

- [x] 1.1 建立 `src/app/admin/(protected)/commissions/actions.ts`：`toggleCommissionHandled(id, isHandled)`，單純更新 `Commission.isHandled`，回傳結構化成功/錯誤結果

## 2. 頁面與元件

- [x] 2.1 建立 `src/app/admin/(protected)/commissions/page.tsx`（Server Component）：查詢所有 `Commission`，`orderBy: [{ isHandled: "asc" }, { createdAt: "desc" }]`
- [x] 2.2 建立 `src/components/admin/CommissionBoard.tsx`（Client Component）：列出所有委託（類型標籤／姓名／Email／電話／參考連結／內容／時間／已處理核取方塊），勾選後樂觀更新本地排序並呼叫 `toggleCommissionHandled`
- [x] 2.3 `src/app/admin/(protected)/page.tsx` 的模組清單中，「委託與詢問看板」項目改為可點擊連結至 `/admin/commissions`，移除「即將推出」標記

## 3. 整體驗收

- [x] 3.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 3.2 瀏覽器驗證：`/admin/commissions` 未登入正確導向 `/admin/login`，無編譯錯誤
- [x] 3.3 瀏覽器驗證：勾選/取消勾選已處理狀態，確認資料庫正確更新且清單排序即時反映——使用者登入後自行測試通過
