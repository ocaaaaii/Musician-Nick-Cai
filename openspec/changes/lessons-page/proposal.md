## Why

技術規格書 P4「鋼琴教學與委託服務」尚未開發。音樂人需要一個頁面動態呈現教學服務的定價與內容，並讓有興趣的訪客能實際留下聯絡方式，而不只是看得到價格卻無法行動。

## What Changes

- 建立 `/lessons` 頁面：讀取 `ServicePackage`（`type: LESSON`、已上架）動態呈現課程說明與價格
- 建立預約詢問表單：姓名、Email、電話（選填）、訊息，送出後寫入 `Commission`（`type: LESSON`），伺服器端與前端皆驗證必填欄位
- 若 `ProfileConfig.calendlyUrl` 已設定，改為嵌入 Calendly iframe 取代表單（規格書允許兩者擇一）；目前資料庫該欄位為空，故實際會呈現表單路徑
- 表單提交採 Next.js Server Action 直接寫 Prisma，不新建 API Route

## Capabilities

### New Capabilities
- `lessons-catalog`: 教學服務項目的動態呈現
- `lesson-inquiry`: 預約/詢問表單的提交與驗證行為

### Modified Capabilities

（無）

## Impact

- 新增：`src/app/[locale]/lessons/page.tsx`、`src/components/lessons/*`、對應的 Server Action
- 新增翻譯 key：`messages/*.json` 補上 lessons 頁面相關文案（四語系）
- **不包含**：委託提交後「自動發信通知音樂人」——Resend 尚未設定（見 `supabase-prisma-setup` proposal 的排除範圍），表單會成功寫入資料庫，但音樂人目前需自行到後台/資料庫查看，待 Resend change 完成後另外接上發信
- **不包含**：`/admin` 後台管理 `ServicePackage` 的介面
- **不包含**：`/commissions` 頁面（採譜／合作邀約），本次僅做 `/lessons`；若之後兩頁需要共用表單邏輯，屬於該 change 自行決定是否重構，不在此預先抽象
- **不包含**：垃圾訊息防護（reCAPTCHA 等）——公開表單目前無防護機制，記錄為已知風險
