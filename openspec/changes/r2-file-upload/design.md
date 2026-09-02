## Context

`admin-sheets` 已把資料庫欄位（`pdfFileKey`／`sampleImages`／`audioSampleUrl`）與表單基礎架構建好，只是取值方式是手動貼網址。這裡要接上真正的檔案上傳，且不動資料庫 schema。

## Goals / Non-Goals

**Goals:**
- 音樂人可以直接從電腦選檔上傳 PDF、封面/預覽圖、試聽音檔，不需要自己先找地方host檔案
- 上傳走瀏覽器直傳 R2（Presigned URL），不經過我們自己的伺服器中轉，避免大檔案（尤其 PDF）拖慢/佔用伺服器資源

**Non-Goals:**
- 不做 PDF 的存取控制／簽章下載（見 proposal.md「已知限制」，留給 P3）
- 不做圖片浮水印處理
- 不做上傳進度條以外的檔案處理（裁切、壓縮、轉檔等）
- 不做伺服器端檔案大小硬性限制（見 Risks）

## Decisions

**1. 用 Presigned PUT URL 直傳，不經過我們的 Next.js 伺服器**
Server Action `createUploadUrl` 只負責「產生一個限時可用的簽章 PUT 網址」，實際的檔案位元組由瀏覽器直接 PUT 給 R2。
理由：技術規格書一開始就是這樣設計的（`/api/admin/upload-presigned-url`，只是這裡用 Server Action 而非獨立 API Route，與本專案其餘所有表單提交一致的模式）。若讓檔案先上傳到我們的伺服器再轉傳，PDF 檔案可能有數十 MB，會佔用 Vercel serverless function 的執行時間與記憶體，且 Vercel Hobby tier 對單一請求大小/執行時間有限制，直傳可以完全避開這個問題。

**2. 物件路徑用 `{kind}/sheets/{uuid}.{ext}` 命名，`kind` 對應 `private`／`public` 前綴**
PDF 存到 `private/sheets/{uuid}.pdf`，圖片/音檔存到 `public/sheets/{uuid}.{ext}`。副檔名從瀏覽器回報的檔名推斷，取不到副檔名時退回依 content type 猜測。
理由：延續技術規格書原本「私有目錄／公開目錄」的路徑命名意圖，即使目前這個 bucket 整個是 Public Access（見已知限制），保留這個路徑慣例讓之後要拆成兩個 bucket 或加簽章保護時，只需要調整存取邏輯、不需要重新搬移既有檔案。用 `uuid` 而非原始檔名，避免不同樂譜上傳同名檔案互相覆蓋，也避免檔名本身洩漏中文字元等在 URL 中可能有編碼問題的內容。

**3. Content type 驗證只做基本的 MIME 類型比對，不驗證檔案內容本身**
`createUploadUrl` 依 `kind` 檢查瀏覽器回報的 `contentType`（PDF 須為 `application/pdf`，圖片須以 `image/` 開頭，音檔須以 `audio/` 開頭），不做「打開檔案確認真的是合法 PDF/圖片」這類內容層級的驗證。
理由：瀏覽器回報的 content type 本來就可能被偽造（這不是防禦惡意使用者的安全邊界），但這裡的使用情境是音樂人自己上傳自己的商品素材，不是開放給不受信任的公眾使用者上傳，基本 MIME 檢查已足夠過濾「選錯檔案」這類最常見的操作失誤。

**4. 不做伺服器端檔案大小限制，只做前端提示**
`SheetMusicManager` 的檔案選擇器選檔後，若超過建議大小（PDF 20MB／圖片 5MB／音檔 15MB）只顯示提示文字，不阻擋上傳。
理由：Presigned PUT URL（`getSignedUrl` + `PutObjectCommand`）不像 `createPresignedPost` 那樣能在簽章層級直接限制檔案大小，要做到伺服器端強制限制需要改用更複雜的 POST 表單簽章機制；音樂人是唯一使用者，不是需要防範惡意大檔案攻擊的公開上傳介面，前端提示已足夠達成「避免不小心選錯超大檔案」的目的。

## Risks / Trade-offs

- [風險] PDF 目前透過 bucket 的公開網址即可直接存取，沒有真正的付費牆保護 → 緩解：已於 proposal.md 記錄為已知限制，這是刻意分階段處理，真正的下載保護要等 P3 結帳流程建立時一併設計（屆時勢必要重新檢視是否需要獨立的私有 bucket）
- [風險] Content type 可被偽造，理論上可以上傳非預期類型的檔案到對應路徑 → 緩解：已於 Decision 3 記錄，使用情境是可信任的單一管理者，不是公開上傳
- [風險] 沒有伺服器端檔案大小限制，理論上可以上傳異常大的檔案佔用 R2 儲存額度 → 緩解：已於 Decision 4 記錄；R2 免費額度是 10GB／月，單一使用者的樂譜素材不太可能意外超過，且超過額度只是產生費用（$0.015/GB），不是服務中斷

## Open Questions

（無）
