## Purpose

讓訪客能提交具體的採譜委託或合作邀約需求，同時避免機器人灌水的請求污染音樂人的委託清單。

## MODIFIED Requirements

### Requirement: 提交成功與失敗的明確呈現
成功時 SHALL 顯示明確成功訊息並將表單轉為唯讀狀態；失敗時 SHALL 顯示錯誤訊息且畫面 MUST NOT 呈現成功狀態。表單 SHALL 包含一個真人不可見的蜜罐欄位與一個送出時間戳；蜜罐欄位有值，或送出時間與表單載入時間差小於 1.5 秒時，SHALL 視為機器人送出——系統 MUST 顯示與正常成功相同的畫面狀態，但 MUST NOT 建立 `Commission` 紀錄。

#### Scenario: 伺服器端寫入失敗
- **WHEN** 表單驗證通過但資料庫寫入過程發生錯誤
- **THEN** 系統 SHALL 顯示送出失敗的錯誤訊息，表單 MUST 維持可編輯狀態供使用者重試

#### Scenario: 蜜罐欄位被填寫
- **WHEN** 送出的請求中蜜罐欄位有值
- **THEN** 系統 SHALL 顯示與正常成功相同的畫面狀態，但 MUST NOT 建立 `Commission` 紀錄

#### Scenario: 送出速度過快
- **WHEN** 送出時間與表單載入時間戳的差距小於 1.5 秒
- **THEN** 系統 SHALL 顯示與正常成功相同的畫面狀態，但 MUST NOT 建立 `Commission` 紀錄
