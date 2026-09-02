## Context

`lessons-page` 已建立「Server Component 查詢已上架服務 + Server Action 表單提交 + 前後端共用驗證」的完整模式，且已修正了 `[locale]` 路由下 404 處理的問題。本頁沿用同一整體架構，差異在於：這裡涵蓋兩種委託類型（不是單一固定類型），且表單多一個「參考音檔／連結」欄位。

## Goals / Non-Goals

**Goals:**
- `/commissions` 依類型分組動態呈現 `TRANSCRIPTION`／`COLLABORATION` 服務項目
- 委託表單支援類型選擇與參考連結，驗證規則前後端一致
- 沿用 `lessons-page` 已驗證過的 Server Action 模式，不重新發明

**Non-Goals:**
- 不提供 Calendly 選項（見 Decision 1）
- 不寄送自動通知信、不做垃圾訊息防護、不做後台管理介面——與 `lessons-page` 排除範圍相同

## Decisions

**1. 不比照 `/lessons` 提供 Calendly／表單二擇一——這裡只有表單**
`/lessons` 的 Calendly 選項是給「預約一對一上課時段」用的；`/commissions`（採譜委託、合作邀約）本質是開放式需求描述，沒有「時段」可約，Calendly 排程介面在概念上不適用。
理由：技術規格書 P4 原文把兩者寫在一起（「嵌入 Calendly 或提交...需求」），但那是描述兩個頁面加起來的兩種可能形式，不是每頁都要兩者兼備；照搬到這裡會生出一個沒有意義的「Calendly 委託時段」介面。

**2. 委託表單、驗證邏輯與 `lessons-page` 各自獨立實作，不抽出共用元件**
新增 `src/lib/validation/commission-inquiry.ts`、`src/components/commissions/CommissionInquiryForm.tsx`，不重用或修改 `lessons-page` 的 `lesson-inquiry.ts`／`LessonInquiryForm.tsx`。
理由：兩份表單的欄位形狀不同（這裡多了委託類型選擇與參考連結，`/lessons` 沒有），且 `type` 在 `/lessons` 是寫死的常數、這裡是使用者可選的值。共用會需要一個帶條件分支的泛用元件，複雜度反而比兩份各自約 30 行的簡單驗證函式／表單元件更高。若之後出現第三個類似表單，屆時再評估是否值得抽象。
- 例外：`ServicePackage` 卡片的呈現邏輯（標題／價格／描述）與 `lessons-page` 的 `LessonPackages.tsx` 結構完全相同，只是資料來源類型不同——這裡新建 `CommissionPackages.tsx` 屬於同樣理由的刻意重複（元件本身簡單到抽象不划算），但记录於此以便之後如果第三次出現同樣的卡片需求時考慮抽出共用元件

**3. 參考連結欄位用簡單的 URL 格式檢查，不驗證連結是否真的可存取**
`validateCommissionInquiry` 只檢查字串是否符合基本 URL 格式（例如 `new URL(input)` 不拋出例外），不發送請求驗證該連結是否存在或可達。
理由：委託時提供的參考連結可能是還沒公開的私人分享連結、或音樂人自己才能看的內容，伺服器端不應該也不需要主動存取；格式檢查已足夠過濾「使用者打錯字」這類最常見的錯誤輸入。

## Risks / Trade-offs

- [風險] 表單與驗證邏輯與 `lessons-page` 有小部分重複（必填檢查、Email 格式）→ 緩解：已於 Decision 2 說明這是刻意選擇，重複的部分很小且穩定，不預期常改動
- [風險] 沒有 Resend／垃圾訊息防護，與 `lessons-page` 相同 → 緩解：已於 proposal.md 排除範圍註記，待對應 change 完成後處理

## Open Questions

（無）
