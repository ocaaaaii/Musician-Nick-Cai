## Why

後端資料層（Supabase 專案建立）目前卡在等待使用者提供憑證，無法繼續。為了讓使用者能盡快看到實際畫面並確認視覺方向，先以靜態假資料建立全站共用外殼（Header/導覽、GlobalAudioPlayer 殼層）與首頁品牌區塊，之後 P1 的 Supabase 連線完成後再把假資料換成真正的 Prisma 查詢。

## What Changes

- 建立全站 Tailwind 設計 token（色彩、字體），實作使用者指定的暖色系視覺方向（暖米背景、深藏青文字、漸層強調色塊、黃銅強調色）
- 建立 Root Layout 共用外殼：Header/Navbar（Logo、導覽連結、購物車圖示佔位）、GlobalAudioPlayer 殼層（Zustand 狀態管理，無曲目播放時隱藏，供後續樂譜商城功能接上）
- 建立首頁（`/`）四個區塊：Hero（大標題／副標題／形象照與漸層色塊融合）、About（個人簡介與風格標籤）、Featured Videos（精選演奏影片卡片）、Social/Footer（IG、Email、深色頁尾）
- 建立型別與假資料層（`src/lib/content/`），資料形狀對齊 Prisma 的 `ProfileConfig`／`FeaturedVideo` model，目前回傳寫死的範例內容；當 P1 的 Supabase 連線完成後，只需替換這層的實作為真正的 Prisma 查詢，頁面元件不需改動

## Capabilities

### New Capabilities
- `global-layout`: 全站共用外殼——Header/Navbar 與 GlobalAudioPlayer 殼層
- `homepage-brand`: 首頁品牌區塊——Hero／About／Featured Videos／Social

### Modified Capabilities

（無）

## Impact

- 新增：`src/app/layout.tsx` 改寫、`src/components/layout/`、`src/app/page.tsx` 改寫、`src/components/home/`、`src/lib/content/`、Tailwind 設計 token 設定
- 不涉及真實資料庫查詢——資料來源為假資料層，待 `supabase-prisma-setup` change 的 Supabase 連線步驟完成後另開 change 接上
- 不涉及音訊播放的實際串接（試聽 MP3 尚不存在），GlobalAudioPlayer 僅建立可重用的殼層與狀態管理
- 不涉及購物車實際功能，僅在 Header 保留視覺佔位圖示
