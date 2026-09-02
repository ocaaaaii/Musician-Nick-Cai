## Purpose

讓音樂人能安全登入後台管理系統，且系統上沒有任何公開的自助註冊入口——後台帳號只有一個，只能由使用者自己在 Supabase 建立。

## ADDED Requirements

### Requirement: Email/Password 登入
`/admin/login` SHALL 提供 Email 與密碼輸入欄位，送出後 MUST 呼叫 Supabase Auth 驗證帳密。

#### Scenario: 帳密正確
- **WHEN** 使用者輸入正確的 Email 與密碼並送出
- **THEN** 系統 SHALL 建立登入 session 並導向 `/admin`

#### Scenario: 帳密錯誤
- **WHEN** 使用者輸入錯誤的 Email 或密碼並送出
- **THEN** 系統 SHALL 顯示登入失敗的錯誤訊息，MUST NOT 建立 session 或導向 `/admin`

### Requirement: 已登入時造訪登入頁自動導向後台
若使用者已經是登入狀態（且為 ADMIN），造訪 `/admin/login` SHALL 直接導向 `/admin`，不重複顯示登入表單。

#### Scenario: 已登入 ADMIN 造訪登入頁
- **WHEN** 已登入的 ADMIN 使用者造訪 `/admin/login`
- **THEN** 系統 SHALL 直接導向 `/admin`

### Requirement: 登出
後台頁面 SHALL 提供登出功能，登出後 MUST 清除 session 並導向 `/admin/login`。

#### Scenario: 點擊登出
- **WHEN** 已登入的使用者觸發登出
- **THEN** 系統 SHALL 清除該次登入的 session，之後造訪 `/admin/*`（`/admin/login` 除外）SHALL 視為未登入

### Requirement: 無公開註冊入口
系統 SHALL NOT 提供任何公開可存取的帳號註冊頁面或 API；新增後台使用者僅能透過 Supabase 後台直接建立。

#### Scenario: 嘗試造訪不存在的註冊頁
- **WHEN** 使用者造訪任何形式的註冊路徑（如 `/admin/register`、`/admin/signup`）
- **THEN** 系統 SHALL 回傳 404，不存在對應頁面
