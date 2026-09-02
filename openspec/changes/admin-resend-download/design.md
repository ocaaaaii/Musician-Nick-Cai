## Context

`checkout-flow` 的 `ecpay-callback` 已經有「訂單成功→產生 R2 簽章網址→Resend 寄信」這條邏輯，重發功能本質上就是讓音樂人手動再觸發一次同樣的流程，不需要新的核心邏輯。

## Goals / Non-Goals

**Goals:**
- 音樂人能在 `/admin/orders` 對任一筆成功訂單一鍵重發下載信，不需要工程師協助
- 重發失敗時要有清楚的錯誤回饋（例如 Resend 因收件位址問題拒絕寄送——這是 `checkout-flow` design.md 已記錄的已知限制，重發時同樣會遇到）

**Non-Goals:**
- 不記錄「重發次數」或寄信歷史——訂單資料表沒有這類欄位，也沒有明確需求要新增

## Decisions

**1. 重發時重新產生新的 R2 簽章網址，不重用/儲存第一次產生的網址**
每次點擊「重發」都呼叫 `createDownloadUrl` 重新簽一組新的 24 小時網址，而不是把 webhook 當時產生的網址存進資料庫重複使用。
理由：R2 簽章網址設計上就是即時產生、有時效性的東西（`checkout-flow` design.md 已說明），資料庫沒有欄位儲存它，重新產生是最簡單且符合原本設計意圖的做法——買家點的永遠是「從現在起 24 小時內有效」的最新連結，而不是可能早就過期的舊連結。

**2. `OrderList.tsx` 改為 Client Component**
原本是純檢視的 Server Component（`admin-orders` design.md 記錄過「訂單清單為純檢視，完全沒有 Server Action」），現在因為要支援「點擊重發→顯示寄送中/成功/失敗狀態」這種互動，必須改為 Client Component。
理由：這是 `admin-orders` 原本 Non-Goal 的自然演進，不是推翻先前決定——先前決定的是「訂單資料不能被後台編輯」，重發下載信不修改訂單資料本身（只是重新觸發一次寄信副作用），與那個決定的精神並不衝突。

## Risks / Trade-offs

- [風險] Resend 免驗證網域寄信限制（見 `checkout-flow` design.md）在重發時同樣適用，音樂人可能會誤以為「重發」壞掉了 → 緩解：按鈕的錯誤訊息會明確區分「寄送失敗」的情況，音樂人若持續遇到失敗，這會是他去驗證 Resend 網域的訊號

## Open Questions

（無）
