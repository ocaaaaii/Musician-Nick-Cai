## Context

這是後台管理系列第一個純檢視（不含新增/編輯/刪除）頁面。訂單本來就不該在後台被手動修改——訂單狀態應該只由 ECPay webhook（P3，尚未建立）更新，人工介入訂單資料容易造成金流對帳問題。

## Goals / Non-Goals

**Goals:**
- 音樂人能查看所有訂單與收入概況，不需要工程師協助查資料庫
- 統計數字（總營收、各狀態訂單數）在頁面載入時即時算出，不是快取的舊數字

**Non-Goals:**
- 不提供編輯/刪除訂單的介面（見 Context）
- 不做重發下載信（見 proposal.md）
- 不做圖表化的時間序列營收報表

## Decisions

**1. 訂單清單為純檢視，完全沒有 Server Action**
`/admin/orders` 的 Server Component 直接查詢並渲染，沒有任何寫入操作，因此不需要 `actions.ts`。
理由：與 Context 所述一致——訂單資料的唯一合法寫入來源是 ECPay webhook（未來 P3），後台介面提供編輯功能只會製造「後台改的資料」與「金流實際狀態」不一致的風險，這是金流系統的基本紀律，不是本次隨意的範圍縮減。

**2. 收入統計用 Prisma `aggregate`／`groupBy` 即時計算，不做快取或預先計算的統計表**
`totalRevenue` 用 `prisma.order.aggregate({ where: { status: "SUCCESS" }, _sum: { totalAmount: true } })`，各狀態訂單數用 `prisma.order.groupBy({ by: ["status"], _count: true })`。
理由：目前訂單量規模（音樂人個人商店，非高流量電商）即時查詢的效能成本可忽略；預先計算/快取統計數字會引入「何時該重新計算」的額外複雜度（例如需要在每次訂單狀態變更時重新計算，而訂單狀態變更目前發生在還沒建立的 P3 webhook 裡），在真的出現效能問題之前不需要這一層。

## Risks / Trade-offs

- [風險] 訂單量成長後，即時 `aggregate` 查詢效能可能下降 → 緩解：已於 Decision 2 記錄為刻意的簡單優先選擇；音樂人個人商店的訂單量級不太可能在短期內達到需要優化的規模，真的發生時再加索引或快取不遲
- [風險] 沒有重發下載信功能，若買家真的沒收到信，音樂人目前無法在後台自助處理 → 緩解：已於 proposal.md 記錄為依賴 P3／Resend 的已知缺口，並非本次遺漏；音樂人可透過查看訂單詳情取得買家 Email 與購買項目，暫時用其他方式（如手動寄送）處理個案

## Open Questions

（無）
