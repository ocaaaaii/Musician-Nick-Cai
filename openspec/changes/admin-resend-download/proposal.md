## Why

技術規格書 A5 提到的「重發樂譜下載信」按鈕，在 `admin-orders` 當時因為 Resend 寄信邏輯還沒建立而刻意跳過。`checkout-flow` 已經把 `sendDownloadEmail`／`createDownloadUrl` 這兩個核心函式建好並驗證過，現在補上這個按鈕只是重用既有邏輯的小工作。

## What Changes

- `/admin/orders` 每筆 `status: SUCCESS` 的訂單旁新增「重發下載信」按鈕，點擊後為該訂單所有樂譜重新產生 24 小時 R2 簽章網址並透過 Resend 重新寄送
- 非 `SUCCESS` 狀態的訂單不顯示這個按鈕（`PENDING`／`FAILED` 沒有已完成的付款，不該有下載內容可寄）

## Capabilities

### New Capabilities
- `admin-resend-download`: 後台針對已完成訂單重新寄送下載信的行為

## Impact

- 新增：`src/app/admin/(protected)/orders/actions.ts`
- 修改：`src/components/admin/OrderList.tsx`（改為 Client Component 以支援按鈕互動與寄送狀態回饋）
