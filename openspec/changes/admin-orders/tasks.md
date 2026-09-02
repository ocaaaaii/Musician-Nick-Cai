## 1. 頁面與元件

- [x] 1.1 建立 `src/app/admin/(protected)/orders/page.tsx`（Server Component）：查詢所有 `Order`（含 `orderItems.sheetMusic`），依 `createdAt` 新到舊排序；`prisma.order.aggregate` 算總營收（`status: SUCCESS`）；`prisma.order.groupBy(["status"])` 算各狀態訂單數；`Decimal` 欄位（`totalAmount`）序列化為 number 再傳給 Client Component
- [x] 1.2 建立 `src/components/admin/OrderList.tsx`：頂部顯示統計卡片（總營收、各狀態訂單數），下方列出訂單（買家 Email、購買曲目、金額、狀態、時間）
- [x] 1.3 `src/app/admin/(protected)/page.tsx` 的模組清單中，「訂單與收入統計」項目改為可點擊連結至 `/admin/orders`，移除「即將推出」標記

## 2. 整體驗收

- [x] 2.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 2.2 驗證：`/admin/orders` 未登入正確導向 `/admin/login`，無編譯錯誤
- [x] 2.3 驗證統計數字正確性：以 Prisma 直接查詢比對，總營收 NT$150、`SUCCESS` 訂單數 1，與種子資料相符
