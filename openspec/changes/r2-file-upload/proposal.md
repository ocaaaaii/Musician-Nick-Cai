## Why

`admin-sheets` 刻意把樂譜的 PDF／預覽圖／試聽音檔三個欄位做成暫時的純文字貼網址輸入框，因為當時 Cloudflare R2 憑證還沒備妥。使用者現在已經建立好 R2 bucket（`nick-cai-assets`）並提供憑證，這裡把那三個欄位換成真正的直傳元件，兌現 `admin-sheets` design.md Decision 1 當時說好的升級路徑。

## What Changes

- 新增 `src/lib/r2.ts`：封裝 R2 的 `S3Client`（R2 端點、憑證皆從環境變數讀取）
- 新增 Server Action：`createUploadUrl(kind, fileName, contentType)`，依檔案類型（`pdf`／`image`／`audio`）驗證 content type、產生唯一物件路徑、回傳可直傳的 Presigned PUT URL
- `SheetMusicManager.tsx` 的 PDF／試聽音檔／預覽圖三個欄位改為檔案選擇器：選檔後由瀏覽器端直接 PUT 到 R2（不經過我們的伺服器），成功後把回傳的路徑／公開網址寫入表單欄位，UI 行為與其餘欄位一致（存檔時一併送出）
- 保留原本的必填/格式驗證，檔案上傳只是取得欄位值的方式改變，資料庫欄位與後續存檔邏輯不變

## Capabilities

### Modified Capabilities
- `admin-sheet-music-editing`: 新增／編輯樂譜時，PDF／預覽圖／試聽音檔改為真正上傳而非貼網址

## Impact

- 新增：`src/lib/r2.ts`、`src/app/admin/(protected)/sheets/upload-actions.ts`
- 修改：`src/components/admin/SheetMusicManager.tsx`（三個欄位換成上傳元件）
- `.env` 新增 R2 相關變數（`R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET_NAME`、`R2_PUBLIC_URL`），已設定完成，不進版控
- **已知限制**：使用者在 Cloudflare 只建立了一個 bucket 並開啟整個 bucket 的 Public Access，PDF 走的 `private/` 路徑前綴目前只是命名慣例，並非真正的存取控制——任何人只要拿到物件路徑就能透過 `R2_PUBLIC_URL` 直接讀取，包括 PDF。真正的付費下載保護（簽章網址、24 小時時效）要等 P3（結帳與 ECPay webhook）建立時一併處理；這裡先解決「音樂人能自己上傳檔案」，不解決「PDF 防盜連」，兩者是不同階段的問題，詳見 design.md
