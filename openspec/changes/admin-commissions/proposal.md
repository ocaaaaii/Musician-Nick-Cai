## Why

技術規格書 A6「委託與詢問看板」尚未開發。`/lessons`（教學詢問）與 `/commissions`（採譜委託／合作邀約）兩個前台頁面都已經在寫入 `Commission` 資料表，但音樂人目前完全看不到這些詢問，只能靠工程師查資料庫——這是後台管理系列裡最後一塊、也是最貼近「有人主動聯繫我」這種即時性需求的頁面。

## What Changes

- 建立 `/admin/commissions` 頁面：列出所有 `Commission`（涵蓋 `LESSON`／`TRANSCRIPTION`／`COLLABORATION` 三種類型，分別來自 `/lessons` 與 `/commissions` 兩個前台頁面），顯示類型、姓名、Email、電話、參考連結（如有）、委託內容、建立時間
- 預設排序：未處理排前面、已處理排後面，各自區塊內依建立時間新到舊排序
- 提供「已處理／已聯繫」勾選切換

## Capabilities

### New Capabilities
- `admin-commission-board`: 後台檢視委託/詢問清單與標記處理狀態的行為

### Modified Capabilities

（無）

## Impact

- 新增：`src/app/admin/(protected)/commissions/actions.ts`、`page.tsx`，`src/components/admin/CommissionBoard.tsx`
- `src/app/admin/(protected)/page.tsx` 的模組清單「委託與詢問看板」項目改為可點擊連結
- **不包含**：刪除委託紀錄的介面——這是聯繫歷史紀錄，不應該被刪除，只有「已處理」狀態可以切換
- **不包含**：主動通知（新委託進來時 email/推播提醒音樂人）——這屬於 Resend 整合的範圍，尚未建立，音樂人目前需要自己定期查看這個頁面
