## 1. 驗證邏輯

- [x] 1.1 建立 `src/lib/validation/service-package.ts`：匯出 `validateServicePackageInput(input)`，檢查 `type`（須為合法 enum 值）、`title`、`priceInfo`、`description` 必填，回傳結構化欄位錯誤

## 2. Server Actions

- [x] 2.1 建立 `src/app/admin/(protected)/services/actions.ts`：`createServicePackage(input)`、`updateServicePackage(id, input)`、`deleteServicePackage(id)`、`toggleServicePackagePublished(id, isPublished)`，皆呼叫對應驗證，成功後 `revalidatePath("/[locale]", "layout")`

## 3. 頁面與元件

- [x] 3.1 建立 `src/app/admin/(protected)/services/page.tsx`（Server Component）：查詢所有 `ServicePackage`（含未上架），依 `type` 分組、組內依 `sortOrder` 排序
- [x] 3.2 建立 `src/components/admin/ServicePackageManager.tsx`（Client Component）：依類型分三個區塊列出項目（標題／價格說明／排序／上下架 Switch／編輯／刪除），新增/編輯用同一個表單（含類型下拉選單），刪除前彈出確認
- [x] 3.3 `src/app/admin/(protected)/page.tsx` 的模組清單中，「服務與定價管理」項目改為可點擊連結至 `/admin/services`，移除「即將推出」標記

## 4. 整體驗收

- [x] 4.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 4.2 驗證：`/admin/services` 未登入正確導向 `/admin/login`；前台 `/lessons`、`/commissions` 無回歸（皆正常顯示既有種子資料：教學 1 筆、採譜/合作 3 筆）
- [ ] 4.3 瀏覽器驗證：新增一筆測試服務項目，確認出現在對應前台頁面（`/lessons` 或 `/commissions`）；下架後前台不再顯示；刪除該測試項目——待使用者登入後自行測試
- [ ] 4.4 瀏覽器驗證：必填欄位留空時前端正確阻擋並提示——待使用者登入後自行測試
