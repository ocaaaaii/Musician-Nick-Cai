## Why

`/lessons`（教學詢問）與 `/commissions`（採譜委託／合作邀約）的表單自建立以來就完全沒有垃圾訊息防護，這在兩個 change 的 design.md 都記錄為已知缺口。現在網站已經真的上線在即（正準備部署），公開表單被垃圾機器人濫用只是時間問題，該補上了。

## What Changes

- 兩個表單各自新增一個隱藏的蜜罐欄位（honeypot）：真人看不到、不會填，機器人自動填表通常會填入
- 兩個表單各自新增表單載入時間戳記，送出時若時間過短（低於一個合理的人類最短填表時間）視為機器人
- 任一防護觸發時，伺服器端 SHALL 表現得像正常送出成功（不建立 `Commission` 紀錄，但前端顯示成功訊息）——不讓機器人知道自己被擋下，這是蜜罐機制本身的標準做法

## Capabilities

### Modified Capabilities
- `lesson-inquiry`：送出邏輯新增機器人偵測
- `commission-inquiry`：送出邏輯新增機器人偵測

## Impact

- 修改：`src/lib/validation/lesson-inquiry.ts`、`commission-inquiry.ts`（新增蜜罐/時間戳欄位的型別與檢查）、`src/app/[locale]/lessons/actions.ts`、`src/app/[locale]/commissions/actions.ts`、對應的兩個表單元件
- **不包含** reCAPTCHA／Cloudflare Turnstile 這類需要額外第三方服務與金鑰的方案——蜜罐＋時間戳是不需要新憑證、能過濾大多數自動化垃圾機器人的第一道防線；若之後垃圾訊息仍然嚴重，再評估導入需要金鑰的方案
