## Why

技術規格書 P2「樂譜數位商城」尚未開發。Supabase 資料層（`supabase-prisma-setup`）已連線並可查詢，這是第一個直接讀取真實 Prisma 資料（而非假資料層）的頁面，讓樂譜商品可以被訪客瀏覽、篩選並查看詳情。

## What Changes

- 建立 `/sheets` 樂譜列表頁：讀取已上架（`isPublished: true`）的樂譜商品，提供關鍵字搜尋、難易度與曲風篩選（即時前端過濾，不重新打伺服器）
- 建立 `/sheets/[id]` 樂譜詳情頁：曲目資訊（曲名、調性、難易度、曲風、價格、說明）、預覽圖（疊加簡易動態浮水印、禁止右鍵）、試聽按鈕（串接既有的全站 GlobalAudioPlayer／Zustand store）
- 「加入購物車」按鈕先以停用狀態呈現並標註「功能開發中」——真正的購物車／結帳邏輯屬於後續 P3 change，本次不實作
- 資料存取直接使用 `src/lib/prisma.ts` 的 Prisma Client，伺服器端明確加上 `isPublished: true` 條件（授權主要在應用層執行，RLS 為第二道防線，沿用 `supabase-prisma-setup` 的既有決策）

## Capabilities

### New Capabilities
- `sheet-music-catalog`: 樂譜列表頁的瀏覽、搜尋、篩選行為
- `sheet-music-detail`: 樂譜詳情頁的資訊呈現、預覽保護、試聽整合

### Modified Capabilities

（無）

## Impact

- 新增：`src/app/[locale]/sheets/page.tsx`、`src/app/[locale]/sheets/[id]/page.tsx`、`src/components/sheets/*`
- 新增翻譯 key：`messages/*.json` 補上 sheets 頁面相關文案（四語系）
- 不涉及購物車、結帳、金流——「加入購物車」按鈕只是視覺佔位
- 不涉及後台樂譜上傳／編輯介面（屬於 `/admin` 系列 change）
- 不新增 Prisma schema 欄位；沿用現有 `SheetMusic` model，`difficulty`／`genre` 為自由字串，篩選選項從實際資料中動態取值，不寫死列舉清單
