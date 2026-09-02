## Purpose

透過 Supabase RLS 定義誰能讀寫哪些資料，確保匿名訪客與一般使用者只能存取應公開的內容，未發布內容、他人訂單與委託資料，以及管理性操作僅限管理員存取。

## ADDED Requirements

### Requirement: 匿名訪客僅能讀取已發布內容
系統 SHALL 允許匿名訪客與一般使用者讀取 `isPublished = true` 的樂譜商品、精選影片與服務定價，且 MUST 禁止讀取未發布（`isPublished = false`）的對應資料。

#### Scenario: 訪客請求未發布樂譜
- **WHEN** 未登入的訪客嘗試查詢一筆 `isPublished = false` 的樂譜商品
- **THEN** 系統 SHALL 回傳空結果或拒絕存取，不得洩漏該筆資料內容

#### Scenario: 訪客瀏覽已發布樂譜列表
- **WHEN** 未登入的訪客查詢樂譜商城列表
- **THEN** 系統 SHALL 僅回傳 `isPublished = true` 的樂譜商品

### Requirement: 使用者僅能建立而非讀取他人訂單與委託
系統 SHALL 允許匿名訪客或一般使用者建立新的訂單與委託申請，但 MUST 禁止其讀取非自己建立（或無法驗證為本人）的訂單、委託內容。

#### Scenario: 訪客建立委託申請
- **WHEN** 前台使用者提交採譜委託表單
- **THEN** 系統 SHALL 允許該筆委託資料被寫入

#### Scenario: 訪客嘗試讀取他人訂單
- **WHEN** 未登入使用者嘗試依 orderId 查詢非本人建立的訂單
- **THEN** 系統 SHALL 拒絕該次讀取

### Requirement: 僅管理員可執行管理性操作
系統 SHALL 僅允許 `role = ADMIN` 的已登入使用者讀寫所有資料表的全部欄位，包含未發布內容、訂單付款狀態、委託處理狀態、品牌設定與服務定價。

#### Scenario: 一般使用者嘗試修改訂單狀態
- **WHEN** 非管理員角色的使用者嘗試將某筆訂單的付款狀態改為 SUCCESS
- **THEN** 系統 SHALL 拒絕該次寫入

#### Scenario: 管理員更新品牌設定
- **WHEN** 已登入且 role 為 ADMIN 的使用者更新品牌設定內容
- **THEN** 系統 SHALL 允許該次寫入並儲存變更

### Requirement: 服務端金流與交付流程使用特權存取
系統 SHALL 允許伺服器端流程（如綠界付款回調處理）以具備完整權限的服務角色更新訂單狀態，且此權限 MUST NOT 透過前端直接暴露給使用者。

#### Scenario: 金流回調更新訂單為成功
- **WHEN** 伺服器端的付款回調流程驗證付款成功
- **THEN** 系統 SHALL 允許該流程以服務角色將對應訂單狀態更新為 SUCCESS，即使該次請求並非來自已登入的 ADMIN 使用者
