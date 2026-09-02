## 1. 共用機器人偵測邏輯

- [x] 1.1 建立 `src/lib/validation/anti-spam.ts`：匯出 `isLikelyBot({ honeypot, formLoadedAt }: { honeypot: string; formLoadedAt: number })`，蜜罐非空或 `Date.now() - formLoadedAt < 1500` 時回傳 `true`

## 2. 教學詢問表單

- [x] 2.1 `src/lib/validation/lesson-inquiry.ts`：`LessonInquiryInput` 新增 `honeypot`／`formLoadedAt` 欄位（不做一般欄位驗證，交給 `isLikelyBot` 判斷）
- [x] 2.2 `src/components/lessons/LessonInquiryForm.tsx`：新增視覺隱藏的蜜罐輸入框（非 `display: none`），`useState` 惰性初始化記錄表單掛載時的 `Date.now()` 作為 `formLoadedAt`，兩者隨表單送出
- [x] 2.3 `src/app/[locale]/lessons/actions.ts`：`submitLessonInquiry` 先呼叫 `isLikelyBot`，判定為機器人時直接回傳 `{ ok: true }` 但不寫入 `Commission`

## 3. 委託表單

- [x] 3.1 `src/lib/validation/commission-inquiry.ts`：`CommissionInquiryInput` 新增 `honeypot`／`formLoadedAt` 欄位
- [x] 3.2 `src/components/commissions/CommissionInquiryForm.tsx`：同 2.2 的蜜罐欄位與時間戳
- [x] 3.3 `src/app/[locale]/commissions/actions.ts`：`submitCommissionInquiry` 同 2.3 的機器人偵測與偽裝成功

## 4. 整體驗收

- [x] 4.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 4.2 瀏覽器驗證：正常填寫並等待超過 1.5 秒再送出兩個表單，確認成功寫入 `Commission`（測試資料事後已清除）
- [x] 4.3 瀏覽器驗證（改用瀏覽器內即時執行 JS 直接操作表單，比腳本呼叫 Server Action 更貼近真實情境）：(a) 完全同步、無延遲地填值並送出（模擬機器人零延遲提交）——未寫入 `Commission`；(b) 正常填值後刻意再填入蜜罐欄位、等待 2 秒才送出（排除時間因素、單獨驗證蜜罐）——未寫入 `Commission`；(c) 正常填值、等待超過時間門檻、蜜罐留空送出——正確寫入 `Commission`。三種情境畫面上都顯示相同的成功訊息，機器人偵測對使用者完全無感，符合設計預期
