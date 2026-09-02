## Purpose

讓有興趣的訪客能實際留下聯絡方式與需求，而不是看完價格後找不到下一步行動；同時避免無效、空白或機器人灌水的詢問污染音樂人的委託清單。

## MODIFIED Requirements

### Requirement: 提交成功寫入委託紀錄
表單驗證通過且未被判定為機器人送出後，系統 SHALL 建立一筆 `Commission` 紀錄，`type` 為 `LESSON`，`isHandled` 預設為否，並向使用者顯示明確的成功狀態。表單 SHALL 包含一個真人不可見的蜜罐欄位與一個送出時間戳；蜜罐欄位有值，或送出時間與表單載入時間差小於 1.5 秒時，SHALL 視為機器人送出——系統 MUST 顯示與正常成功相同的畫面狀態，但 MUST NOT 建立 `Commission` 紀錄。

#### Scenario: 成功提交
- **WHEN** 使用者填妥所有必填欄位並送出，蜜罐欄位為空且送出時間距表單載入超過 1.5 秒
- **THEN** 系統 SHALL 寫入一筆 `Commission` 紀錄且 `isHandled` 為否，並顯示送出成功的訊息，表單 MUST 清空或停用以避免重複送出

#### Scenario: 蜜罐欄位被填寫
- **WHEN** 送出的請求中蜜罐欄位有值
- **THEN** 系統 SHALL 顯示與正常成功相同的畫面狀態，但 MUST NOT 建立 `Commission` 紀錄

#### Scenario: 送出速度過快
- **WHEN** 送出時間與表單載入時間戳的差距小於 1.5 秒
- **THEN** 系統 SHALL 顯示與正常成功相同的畫面狀態，但 MUST NOT 建立 `Commission` 紀錄
