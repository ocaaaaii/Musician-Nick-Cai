## Why

技術規格書 P4「鋼琴教學與委託服務」的另一半尚未開發：`/commissions`（採譜委託與合作邀約）。`lessons-page` change 已建立「動態呈現服務項目 + 詢問表單寫入 Commission」的模式，這裡是第二個套用同一模式、但欄位與委託類型不同的頁面。

## What Changes

- 建立 `/commissions` 頁面：讀取 `ServicePackage`（`type` 為 `TRANSCRIPTION` 或 `COLLABORATION`、已上架），依類型分組呈現說明與價格
- 建立委託表單：委託類型（採譜／合作，可選擇）、姓名、Email、電話（選填）、參考音檔或 YouTube 連結（選填，主要給採譜委託用）、委託內容說明，送出後寫入對應 `type` 的 `Commission`
- 表單提交採 Server Action + 前後端共用驗證，沿用 `lessons-page` 已驗證過的模式
- 本頁 **不** 提供 Calendly embed 選項——委託／合作是開放式的需求描述，不是排時段預約，Calendly 在概念上不適用於這個頁面（`/lessons` 才是排課時段的場景）

## Capabilities

### New Capabilities
- `commissions-catalog`: 採譜／合作服務項目的動態呈現
- `commission-inquiry`: 委託表單的提交與驗證行為（含委託類型選擇與參考音檔欄位）

### Modified Capabilities

（無）

## Impact

- 新增：`src/app/[locale]/commissions/page.tsx`、`src/components/commissions/*`、對應的 Server Action、`src/lib/validation/commission-inquiry.ts`
- 新增翻譯 key：`messages/*.json` 補上 commissions 頁面相關文案（四語系）
- 刻意不與 `lessons-page` 共用表單元件/驗證模組——兩者欄位不同（委託類型選擇、參考音檔），各自獨立實作比提前抽象一個「泛用委託表單」更簡單清楚，這點在 design.md 說明
- **不包含**：自動發信通知音樂人（Resend 未設定，與 `lessons-page` 相同排除範圍）
- **不包含**：垃圾訊息防護
- **不包含**：`/admin` 後台管理介面
- 套用過程中使用者要求新增一筆內容：`prisma/seed.ts` 補上「鋼琴合作／伴奏邀約」（`COLLABORATION` 類型，`sortOrder: 2`），並將既有「商業合作邀約」改為 `sortOrder: 3`，已同步套用到現有 Supabase 資料庫（非測試資料，是實際內容）
