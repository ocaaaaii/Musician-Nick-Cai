## Purpose

讓音樂人不需要工程師協助，就能查看樂譜商店的訂單歷史與收入概況。

## ADDED Requirements

### Requirement: 訂單清單顯示完整購買資訊
`/admin/orders` SHALL 列出所有 `Order`，依建立時間新到舊排序，每筆顯示買家 Email、購買曲目（`OrderItem` 關聯的 `SheetMusic` 標題）、總金額、付款狀態、建立時間。

#### Scenario: 存在多筆不同狀態的訂單
- **WHEN** 資料庫中同時有 `PENDING`、`SUCCESS`、`FAILED` 狀態的訂單
- **THEN** `/admin/orders` SHALL 全部列出，且每筆的付款狀態清楚可辨識

#### Scenario: 訂單包含多筆商品
- **WHEN** 某筆訂單的 `orderItems` 包含多個 `SheetMusic`
- **THEN** 該筆訂單 SHALL 顯示所有購買曲目的標題，而非只顯示其中一筆

### Requirement: 收入統計即時反映當前資料
`/admin/orders` SHALL 顯示總營收（僅計 `status: SUCCESS` 的訂單金額加總）與各付款狀態的訂單數量，統計數字 SHALL 反映頁面載入當下的資料庫狀態。

#### Scenario: 存在失敗與待處理訂單
- **WHEN** 資料庫中有 `status: FAILED` 或 `status: PENDING` 的訂單
- **THEN** 總營收 SHALL NOT 計入這些訂單的金額

#### Scenario: 新增一筆成功訂單後重新載入頁面
- **WHEN** 資料庫新增一筆 `status: SUCCESS` 的訂單後，ADMIN 重新載入 `/admin/orders`
- **THEN** 總營收 SHALL 反映包含這筆新訂單的加總金額
