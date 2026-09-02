## Purpose

確保後台管理功能只有音樂人本人（`role == ADMIN`）能存取，任何未登入或權限不足的請求都不能看到後台內容，即使只是短暫閃現。

## ADDED Requirements

### Requirement: 未登入存取後台一律導向登入頁
未登入使用者存取 `/admin/*`（`/admin/login` 本身除外）SHALL 一律被導向 `/admin/login`，MUST NOT 呈現任何後台頁面內容。

#### Scenario: 未登入直接造訪後台網址
- **WHEN** 未登入的使用者直接造訪 `/admin` 或任何 `/admin/*` 子頁面
- **THEN** 系統 SHALL 導向 `/admin/login`，不渲染該頁面的實際內容

### Requirement: 已登入但非 ADMIN 角色一律導向登入頁
已登入但對應的 `User.role` 不是 `ADMIN` 的使用者，存取 `/admin/*`（`/admin/login` 除外）SHALL 同樣被導向 `/admin/login`。

#### Scenario: 一般使用者（role: USER）登入後嘗試進入後台
- **WHEN** 已登入但 `role` 為 `USER` 的使用者存取 `/admin`
- **THEN** 系統 SHALL 導向 `/admin/login`，不渲染後台內容

### Requirement: 找不到對應 User 資料時視為無權限
若已登入的 Supabase Auth 使用者在 `public.User` 表中找不到對應資料列（`id` 不匹配任何 `User.id`），SHALL 視同非 ADMIN 處理，導向 `/admin/login`。

#### Scenario: Auth 帳號存在但沒有對應的 User 資料列
- **WHEN** 使用者的 Supabase Auth session 有效，但資料庫的 `public.User` 表中找不到 `id` 相符的資料列
- **THEN** 系統 SHALL 視為無權限，導向 `/admin/login`，不得因為「查不到資料」而預設放行

### Requirement: ADMIN 使用者可正常存取後台
已登入且 `role == ADMIN` 的使用者 SHALL 能正常存取 `/admin/*` 底下已存在的頁面。

#### Scenario: ADMIN 登入後存取後台首頁
- **WHEN** 已登入且 `role == ADMIN` 的使用者存取 `/admin`
- **THEN** 系統 SHALL 正常渲染該頁面內容
