## Context

這是全站第一次串接外部金流與寄信服務，也是第一次出現 `src/app/api/*` Route Handler（先前所有表單都是 Server Action）。綠界的付款頁導向機制是「伺服器產生簽章表單→瀏覽器自動 POST 送出」，不是單純的 redirect，所以這裡沒辦法沿用既有的 Server Action 模式，必須用 Route Handler。

## Goals / Non-Goals

**Goals:**
- 訪客能完成「選定一本樂譜→填 Email→選付款方式→導向綠界付款→付款成功→收到下載信」的完整流程
- `CheckMacValue` 的產生與驗證邏輯正確且雙向一致（送出去的表單、收回來的 webhook 都要能通過綠界的驗證）
- 金額驗證：webhook 收到的金額與資料庫訂單金額不符時，不得將訂單標記為成功

**Non-Goals:**
- 不做多本購物車（見 proposal.md）
- 不做付款失敗後的重試/取消訂單流程——`FAILED` 狀態單純記錄，沒有讓訪客重新導向付款的介面
- 不做庫存/超賣控制——數位商品沒有庫存限制的概念

## Decisions

**1. 綠界導向用 Route Handler 回傳自動送出的 HTML 表單，不用 redirect**
`POST /api/payment/ecpay-checkout` 建立訂單後，不是回傳 302 redirect，而是回傳一個 `Content-Type: text/html` 的頁面，內含一個 `<form method="POST" action="{綠界收銀台網址}">`（欄位是 hidden input，值是簽章過的參數），並在頁面載入時用一行 `<script>` 自動 `form.submit()`。
理由：綠界要求付款頁的所有參數與 `CheckMacValue` 必須透過 POST body 傳遞（欄位多、簽章值本身就很長，不可能塞進 URL query string），瀏覽器沒有「伺服器端 302 帶大量 POST body」這種機制，業界對接綠界的標準做法就是這個自動送出表單的 pattern。

**2. `CheckMacValue` 邏輯獨立成 `src/lib/ecpay.ts`，產生與驗證共用同一個核心函式**
`generateCheckMacValue(params)` 實作綠界文件記載的演算法：參數依 key 字母排序（不分大小寫）→組成 `key=value&...`→前後加上 `HashKey=...&`／`&HashIV=...`→用 .NET 風格的 URL 編碼（`encodeURIComponent` 後把 `%20` 換成 `+`、轉小寫、再把 `%2d %5f %2e %21 %2a %28 %29` 還原成 `- _ . ! * ( )`）→SHA256→轉大寫。`ecpay-checkout` 用它產生簽章、`ecpay-callback` 用同一個函式重新計算後跟收到的 `CheckMacValue` 比對。實作時第一版誤用 MD5，串接測試環境時收到「CheckMacValue Error」才發現：`EncryptType: 1` 這個固定帶入的參數代表綠界現行 API 要求 SHA256（MD5 是舊版已不建議使用的雜湊方式），修正後才簽章成功——過程中查證了一個公開的 Node.js 綠界 SDK 實作作為對照依據。
理由：兩邊如果各自實作一份簽章邏輯，未來這個演算法要調整（例如綠界文件更新）時很容易兩邊不同步；共用同一個函式從根本上排除這個風險。

**3. `ecpay-callback` 的金額驗證：比對 webhook 回傳的 `TradeAmt` 與資料庫訂單的 `totalAmount`，不符則拒絕標記成功**
即使 `CheckMacValue` 驗證通過、`RtnCode === '1'`，仍會額外檢查 `Number(TradeAmt) === order.totalAmount`；不符時記錄錯誤但不更新訂單狀態，回應綠界 `0|Error` 讓其重試（而非靜默接受）。
理由：`CheckMacValue` 只證明「這個請求真的來自綠界」，不保證金額沒有在其他地方被竄改（例如理論上惡意使用者攔截並重放一個金額被改過的舊請求，只要沒有這層驗證就會被接受）；技術規格書本身也明確要求「重新驗證 CheckMacValue，確保金額與交易合法」，金額比對是這句話的具體實作。

**4. R2 簽章下載連結：用既有的 `r2Client` 加上 `GetObjectCommand` + `getSignedUrl`，時效 24 小時**
在 `src/lib/r2.ts` 新增 `createDownloadUrl(key: string)`，回傳一個 24 小時後失效的簽章 GET 網址。`ecpay-callback` 對訂單裡每一筆 `OrderItem` 的 `sheetMusic.pdfFileKey` 各自產生一個簽章網址。
理由：延續 `admin-sheets`／`r2-file-upload` 已經在用的 R2 用戶端與 bucket 設定；這是這個 bucket 第一次真正發揮「私有路徑」的用途——先前 `admin-sheets` 的 design.md 就記錄過「bucket 整個開了 Public Access，`private/` 只是命名慣例、不是真正的存取控制」這個已知缺口，簽章網址本身不受這個缺口影響（它是額外疊加的一層時效性存取，即使 bucket 是公開的，簽章網址依然有效），但也不會反過來修補這個缺口——只要有人知道 `private/sheets/{uuid}.pdf` 這個路徑，還是可以透過 `R2_PUBLIC_URL` 直接存取，不需要簽章。這個缺口的徹底修補（真正的私有 bucket 或關閉 Public Access）留給之後有需要時再處理，這裡不擴大範圍。

**5. Resend 寄信位址暫用 `onboarding@resend.dev`，明確記錄已知限制**
`src/lib/email.ts` 的寄件人固定用 Resend 提供的預設測試網域 `onboarding@resend.dev`，沒有另外設定/驗證音樂人自己的網域。
理由：使用者只提供了 API Key，沒有提及已驗證的寄信網域；Resend 的免費/未驗證網域模式**只能寄到帳號擁有者自己註冊 Resend 時用的 Email**，寄給其他真實買家會被 Resend 拒絕。這是本次已知且必須告知使用者的限制——正式上線前音樂人需要自行在 Resend 驗證一個網域（通常是他自己的網域，例如串接自訂網域後用 `noreply@nickcai.com` 之類），否則買家收不到下載信。

**6. 本機開發驗證策略：手動組出簽章正確的請求直接呼叫 `ecpay-callback`，不依賴綠界真的觸發 webhook**
見 proposal.md「已知限制」。驗證時會寫一個一次性腳本，用 `generateCheckMacValue` 產生一個模擬綠界回傳格式的合法簽章請求，直接 `fetch` 本機的 `/api/payment/ecpay-callback`，藉此驗證簽章驗證、金額比對、訂單更新、R2 簽章網址產生、Resend 寄信這一整條邏輯，而不必真的透過綠界測試環境完成一筆付款（那需要公開網址）。

## Risks / Trade-offs

- [風險] 本機無法測試綠界真的觸發 webhook 的路徑（网络可達性、綠界實際回傳格式的細節差異）→ 緩解：已於 Decision 6 記錄替代驗證方式；正式部署到 Vercel（有公開網址）後，建議用綠界測試環境走一次完整真實付款流程做最終驗證
- [風險] `onboarding@resend.dev` 只能寄給 Resend 帳號擁有者自己 → 緩解：已於 Decision 5 明確記錄，會在完成後直接告知使用者這個限制與後續要做的事（驗證自己的網域）
- [風險] 使用綠界測試環境憑證，任何人都能用同一組憑證產生「看起來合法」的測試請求 → 緩解：測試環境的付款本來就不是真實金流（不會真的扣款），這是綠界測試環境設計上的預期行為，正式上線前必須換成音樂人自己申請的真實商家憑證（已於 proposal.md 記錄）

## Open Questions

（無）
