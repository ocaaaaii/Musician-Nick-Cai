## 1. 環境與依賴

- [x] 1.1 安裝 `resend` 套件
- [x] 1.2 `.env` 新增 `RESEND_API_KEY`（已由使用者提供）、`ECPAY_MERCHANT_ID`／`ECPAY_HASH_KEY`／`ECPAY_HASH_IV`／`ECPAY_CHECKOUT_URL`（綠界官方測試環境憑證）、`NEXT_PUBLIC_SITE_URL`（本機為 `http://localhost:3000`）

## 2. 綠界簽章邏輯

- [x] 2.1 建立 `src/lib/ecpay.ts`：`generateCheckMacValue(params)`，實作參數排序→組字串→.NET 風格 URL 編碼→雜湊→轉大寫的完整演算法。**修正**：一開始用 MD5，實際串接綠界測試環境時收到「CheckMacValue Error」，查證後確認 `EncryptType: 1` 代表綠界現行 API 要求 **SHA256**、非 MD5（並參考一個公開 Node.js 綠界 SDK 的實作核對編碼細節與排序邏輯），修正後才簽章成功
- [x] 2.2 同檔案：`buildEcpayFormFields(order)`，組出綠界收銀台所需的完整參數（`MerchantID`、`MerchantTradeNo`、`MerchantTradeDate`、`PaymentType: "aio"`、`TotalAmount`、`TradeDesc`、`ItemName`、`ReturnURL`、`ClientBackURL`、`ChoosePayment`、`EncryptType: 1` 等），並附上 `CheckMacValue`

## 3. R2 簽章下載網址

- [x] 3.1 `src/lib/r2.ts` 新增 `createDownloadUrl(key: string): Promise<string>`，用 `GetObjectCommand` + `getSignedUrl`，時效 24 小時（86400 秒）

## 4. Resend 寄信

- [x] 4.1 建立 `src/lib/email.ts`：`sendDownloadEmail({ to, items }: { to: string; items: { title: string; downloadUrl: string }[] })`，用 Resend SDK 寄送含所有下載連結的信件，寄件人暫用 `onboarding@resend.dev`

## 5. 結帳頁與建立訂單

- [x] 5.1 建立 `src/app/[locale]/checkout/[sheetId]/page.tsx`（Server Component）：查詢樂譜，不存在或未上架時 `notFound()`；渲染樂譜資訊與結帳表單（`<form method="POST" action="/api/payment/ecpay-checkout">`，含隱藏欄位 `sheetMusicId`）
- [x] 5.2 建立 `src/lib/validation/checkout.ts`：`validateCheckoutInput(input)`，檢查 Email 格式、付款方式為合法選項

## 6. `POST /api/payment/ecpay-checkout`

- [x] 6.1 建立 `src/app/api/payment/ecpay-checkout/route.ts`：解析表單、驗證輸入，查詢樂譜確認仍為已上架，產生唯一 `merchantTradeNo`，建立 `PENDING` 的 `Order`＋`OrderItem`，用 `buildEcpayFormFields` 產生簽章參數，回傳自動送出表單的 HTML（`Content-Type: text/html`）

## 7. `POST /api/payment/ecpay-callback`

- [x] 7.1 建立 `src/app/api/payment/ecpay-callback/route.ts`：解析 `application/x-www-form-urlencoded` body，重新計算 `CheckMacValue` 比對，查詢對應訂單，驗證金額，`RtnCode === "1"` 時更新訂單為 `SUCCESS`＋產生 R2 簽章網址＋寄送 Resend 下載信，否則更新為 `FAILED`；依綠界規定回應 `1|OK` 或 `0|Error`

## 8. 前台串接

- [x] 8.1 `src/components/sheets/SheetMusicDetail.tsx`：「加入購物車」按鈕改為「立即購買」，連結至 `/checkout/[sheetId]`，移除停用狀態與「即將推出」文字；改用 `@/i18n/navigation` 的 `Link`（而非 `next/link`）才會正確帶上語系前綴，過程中發現並修正這個 import 錯誤

## 9. 整體驗收

- [x] 9.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 9.2 瀏覽器驗證：從 `/sheets/[id]` 點「立即購買」進入結帳頁，正確顯示樂譜標題與價格
- [x] 9.3 瀏覽器驗證：送出結帳表單後，資料庫正確建立 `PENDING` 訂單，瀏覽器成功導向綠界測試環境收銀台頁面，頁面正確顯示訂單編號、商店名稱、商品明細與金額（不觸發真實扣款）
- [x] 9.4 腳本驗證：手動組出簽章正確的模擬綠界回傳請求，直接呼叫本機 `/api/payment/ecpay-callback`，確認訂單正確更新為 `SUCCESS`（含 `tradeNo`／`paymentMethod`）、R2 簽章網址成功產生（無例外拋出）。Resend 寄信呼叫本身執行成功但被 Resend 拒絕（測試用 `example.com` 收件位址觸發 422「請使用測試信箱」），驗證了 design.md Decision 5 記錄的已知限制確實存在——這不是程式邏輯錯誤，回應正確處理了 Resend 回傳的結果而未讓例外中斷整個 webhook 流程
- [x] 9.5 腳本驗證：模擬簽章不符與金額不符的請求，皆正確回應 `0|Error`；金額不符的請求確認訂單 `updatedAt` 未變動，維持原本的 `PENDING` 狀態未被覆寫
