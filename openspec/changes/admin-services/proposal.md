## Why

技術規格書 A4「服務與定價管理」尚未開發。`ServicePackage` 目前只能靠工程師直接改 `prisma/seed.ts` 或手動下 SQL 調整報價與說明文字，音樂人自己完全無法調整——這與 `/lessons`、`/commissions` 兩個前台頁面已經完全動態讀取 `ServicePackage` 的現況不一致，是後台管理系列裡缺的一塊。

## What Changes

- 建立 `/admin/services` 頁面：列出所有 `ServicePackage`（含未上架），依 `type`（採譜／教學／合作）分組顯示
- 新增／編輯／刪除 `ServicePackage`：類型（下拉選單，`TRANSCRIPTION`／`LESSON`／`COLLABORATION`）、標題、價格說明（自由文字，如「NT$ 1,500 起」，非固定數字欄位——沿用資料庫 `priceInfo: String` 的既有設計）、說明文字、排序數字、上下架
- 存檔後 revalidate `/lessons`、`/commissions` 兩個前台頁面

## Capabilities

### New Capabilities
- `admin-service-package-editing`: 後台服務項目的列表、新增、編輯、刪除、上下架、依類型分組呈現行為

### Modified Capabilities

（無）

## Impact

- 新增：`src/app/admin/(protected)/services/page.tsx`、`actions.ts`，`src/components/admin/ServicePackageManager.tsx`，`src/lib/validation/service-package.ts`
- `src/app/admin/(protected)/page.tsx` 的模組清單「服務與定價管理」項目改為可點擊連結
- **不包含**：`/commissions` 頁面的委託表單、`/lessons` 頁面的 Calendly／表單邏輯——這裡只管理 `ServicePackage` 本身的內容，不動前台頁面既有的預約/委託表單行為
