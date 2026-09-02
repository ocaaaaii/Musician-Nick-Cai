## Why

技術規格書 A3「樂譜商品管理」尚未開發，音樂人目前完全無法自行上下架樂譜商品。完整的 A3（含 R2 直傳 PDF／封面圖／試聽 MP3）需要 Cloudflare R2 的憑證（Account ID、Bucket、Access Key、公開 domain），這些尚未備妥。與使用者確認：先做不需要 R2 的部分——樂譜商品的列表、基本欄位新增/編輯/刪除、上下架——檔案相關欄位先以文字欄位（貼入已存在的網址／路徑）暫代，R2 憑證到位後再補上真正的直傳元件。

## What Changes

- 建立 `/admin/sheets` 頁面：列出所有 `SheetMusic`（含未上架），顯示標題、價格、難易度、曲風、上架狀態、銷售量（依 `OrderItem` 關聯且對應 `Order.status === SUCCESS` 計算）
- 新增／編輯樂譜表單：曲名、描述、價格、難易度、曲風、調性——皆為一般文字/數字欄位，`difficulty`／`genre` 沿用 `/sheets` 前台既有的「自由文字、由現有資料動態產生篩選選項」模式，不做成固定下拉選單
- 檔案相關三個必填欄位（`pdfFileKey`、`sampleImages`、`audioSampleUrl`）暫時以純文字輸入框呈現（貼入手動已知的網址／路徑字串），非真正的檔案上傳；介面上明確標示「暫時：貼上網址，尚未支援直接上傳」
- 上下架 Switch、刪除功能

## Capabilities

### New Capabilities
- `admin-sheet-music-editing`: 後台樂譜商品的列表、新增、編輯、刪除、上下架行為（不含檔案上傳機制本身）

### Modified Capabilities

（無）

## Impact

- 新增：`src/app/admin/(protected)/sheets/page.tsx`、`actions.ts`，`src/components/admin/SheetMusicManager.tsx`（或拆分的列表/表單元件），`src/lib/validation/sheet-music.ts`
- `src/app/admin/(protected)/page.tsx` 的模組清單「樂譜商品管理」項目改為可點擊連結
- **不包含**：R2 直傳（Presigned URL API route、`@aws-sdk/client-s3` 整合、瀏覽器端直傳元件）——待使用者提供 R2 憑證後另立 change 補上，屆時會把本次的純文字網址欄位升級為真正的上傳元件，資料庫欄位（`pdfFileKey`／`sampleImages`／`audioSampleUrl`）本身不需要變動
- **不包含**：浮水印預覽圖的動態生成——`sampleImages` 目前就是存公開圖片網址，本次沒有新增浮水印處理邏輯
- **不包含**：銷售統計以外的營收報表（月報表、圖表等），A5（`/admin/orders`）才是完整的訂單與收入頁面，這裡的「銷售量」只是列表上的輔助資訊
