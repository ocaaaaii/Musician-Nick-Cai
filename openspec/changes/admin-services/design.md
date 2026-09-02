## Context

這是後台管理系列第四個頁面，資料型態（清單式、多筆各自增刪改）與 `admin-sheets` 的 `SheetMusicManager` 幾乎相同，差別是欄位更少、沒有檔案上傳、多了「依類型分組顯示」的需求（因為 `ServicePackage.type` 直接對應到不同的前台頁面）。

## Goals / Non-Goals

**Goals:**
- 音樂人能自行新增/編輯/刪除/上下架/排序服務項目，不再需要工程師改 seed 或下 SQL
- 存檔後 `/lessons`、`/commissions` 前台頁面立即反映

**Non-Goals:**
- 不重新設計 `priceInfo` 為結構化的數字欄位——沿用既有 `String` 自由文字（見 Decision 1）

## Decisions

**1. `priceInfo` 維持自由文字欄位，不拆成數字+單位**
後台編輯 `priceInfo` 用一般文字輸入框，允許輸入「NT$ 1,500 起」、「每堂 NT$ 2,000」、「面議」這類自然語言價格說明。
理由：資料庫欄位本來就是 `String`（技術規格書原始設計），前台三個現有項目的價格說明本來就不是單一數字能表達的（「起」、「每堂」、「面議」都是有意義的差異），拆成結構化欄位會需要同時改 schema、seed 資料與前台渲染邏輯，且沒有明確的規格要求要這麼做。

**2. `type` 用下拉選單限制在三個合法值，不開放自由文字**
新增/編輯表單的類型欄位是 `<select>`，選項固定為 `TRANSCRIPTION`／`LESSON`／`COLLABORATION`（對應 Prisma 的 `CommissionType` enum）。
理由：`type` 直接決定這筆資料會出現在哪個前台頁面（`/lessons` 只讀 `LESSON`，`/commissions` 只讀 `TRANSCRIPTION`／`COLLABORATION`），打錯字（如打成小寫或多打空格）會讓這筆資料在所有前台頁面都不會出現且難以排查，用下拉選單直接杜絕這個錯誤來源；這與 `difficulty`／`genre`（`admin-sheets` 選擇保留自由文字）不同，差別在於後者只是篩選用的展示標籤、打錯字只是篩選選項多一個雜訊，不影響資料能否顯示。

**3. 存檔後同時 revalidate `/lessons` 與 `/commissions`，不分別判斷 `type` 只 revalidate 其中一個**
沿用 `admin-profile`／`admin-sheets` 的 `revalidatePath("/[locale]", "layout")` 模式，任何 `ServicePackage` 異動都重新驗證整個 `[locale]` layout 底下的頁面。
理由：與其在 Server Action 裡判斷「這筆資料是哪個 type、只 revalidate 對應頁面」這種微優化，不如直接沿用已經在用的全域 revalidate 模式，程式碼更一致、不用擔心漏判某個 type 導致某頁面沒更新到。revalidate 的成本本身很低（只是清快取，不是重新整個網站的build），這裡沒有效能疑慮需要精細化處理。

## Risks / Trade-offs

- [風險] `priceInfo` 自由文字沒有格式驗證，音樂人可能打錯字或格式不一致（如「NT$1500」vs「NT$ 1,500」）→ 緩解：這是刻意的權衡（見 Decision 1），前台本來就是直接顯示這個字串，格式一致性交由音樂人自行維護，比強制格式規則更符合實際使用情境的彈性需求

## Open Questions

（無）
