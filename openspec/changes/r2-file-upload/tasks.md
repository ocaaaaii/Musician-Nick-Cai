## 1. R2 用戶端

- [x] 1.1 建立 `src/lib/r2.ts`：`S3Client`，`endpoint` 用 `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`，`region: "auto"`，憑證讀 `R2_ACCESS_KEY_ID`／`R2_SECRET_ACCESS_KEY`

## 2. Presigned URL Server Action

- [x] 2.1 建立 `src/app/admin/(protected)/sheets/upload-actions.ts`：`createUploadUrl(kind: "pdf" | "image" | "audio", fileName: string, contentType: string)`，驗證 `contentType` 符合 `kind`，產生 `{kind === "pdf" ? "private" : "public"}/sheets/{uuid}.{ext}` 路徑，回傳 `{ uploadUrl, key, publicUrl? }`（`publicUrl` 只有 `image`／`audio` 才回傳，`pdf` 只回傳 `key`）

## 3. 表單改用真正上傳

- [x] 3.1 `SheetMusicManager.tsx`：PDF 欄位改為 `<input type="file" accept="application/pdf">`，選檔後呼叫 `createUploadUrl("pdf", ...)`，取得 `uploadUrl` 後用 `fetch(uploadUrl, { method: "PUT", body: file })` 直傳，成功後把 `key` 寫入 `form.pdfFileKey`，顯示上傳中/完成/失敗狀態
- [x] 3.2 同上，試聽音檔欄位改為 `<input type="file" accept="audio/*">`，成功後把 `publicUrl` 寫入 `form.audioSampleUrl`
- [x] 3.3 同上，預覽圖欄位改為支援多檔的 `<input type="file" accept="image/*" multiple>`，每張成功後把 `publicUrl` 加入 `form.sampleImages` 陣列；清單支援移除單張已上傳的圖片
- [x] 3.4 檔案選擇後若超過建議大小（PDF 20MB／圖片 5MB／音檔 15MB）顯示提示文字（不阻擋上傳，見 design.md Decision 4）

## 4. R2 Bucket CORS 設定（需使用者協助）

- [x] 4.1 以腳本直接測試 R2 連線：產生 Presigned PUT URL、PUT 一個測試檔案、透過公開網址 GET 回來確認內容一致——全部成功，R2 憑證與 bucket 存取正常；測試檔案已清除
- [x] 4.2 使用者已於 Cloudflare Dashboard 設定 CORS 規則（允許 `http://localhost:3000` 的 `PUT`／`GET`）

## 5. 整體驗收

- [x] 5.1 執行 `npx tsc --noEmit` 與 `npx eslint src --quiet`，確認無錯誤
- [x] 5.2 CORS 驗證：在瀏覽器頁面（`http://localhost:3000` origin）用 `fetch()` 對 Presigned PUT URL 實際發出跨網域請求，狀態 200、無 CORS 錯誤，確認瀏覽器端直傳可行；測試檔案已清除
- [x] 5.3 瀏覽器驗證：上傳完成後的公開網址可直接被瀏覽器 `fetch()` 讀取（200，內容正確）——與 5.2 同一次測試一併確認
- [x] 5.4 瀏覽器驗證：透過 `/admin/sheets` 表單實際上傳真實 PDF/圖片/音檔並存檔；選擇類型不符的檔案被正確拒絕並提示——使用者登入後自行測試通過
