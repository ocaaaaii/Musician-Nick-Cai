## Purpose

讓音樂人在買家反映沒收到下載信時，能自己在後台一鍵補發，不需要等工程師協助。

## ADDED Requirements

### Requirement: 已完成訂單可重發下載信
`/admin/orders` SHALL 為每筆 `status: SUCCESS` 的訂單提供「重發下載信」按鈕，點擊後 SHALL 為該訂單所有樂譜重新產生時效 24 小時的 R2 簽章下載網址，並透過 Resend 重新寄送至該訂單的買家 Email。

#### Scenario: 對成功訂單重發下載信
- **WHEN** ADMIN 對一筆 `status: SUCCESS` 的訂單點擊「重發下載信」
- **THEN** 系統 SHALL 為該訂單所有樂譜產生新的 24 小時簽章網址，並寄出包含這些連結的信件到訂單的 `userEmail`

#### Scenario: 未完成訂單不提供重發功能
- **WHEN** 訂單的 `status` 為 `PENDING` 或 `FAILED`
- **THEN** 該筆訂單 SHALL NOT 顯示「重發下載信」按鈕

### Requirement: 重發失敗時顯示明確錯誤
寄信過程失敗時，系統 SHALL 在畫面上顯示明確的失敗訊息，不得讓 ADMIN 誤以為已經成功寄出。

#### Scenario: Resend 拒絕寄送
- **WHEN** Resend API 回傳寄送失敗
- **THEN** 系統 SHALL 顯示重發失敗的訊息
