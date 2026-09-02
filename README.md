# Musician Nick Cai — 鋼琴專家個人品牌與數位商城

一位鋼琴專家（編曲 / 採譜 / 教學）的個人品牌網站與樂譜數位商城，附一套音樂人可自主維運、不需工程師協助的後台 CMS。目前品牌首頁與資料層基礎建設已完成，樂譜商城、金流、後台管理仍在開發中。

## ✨ 特色

- **多語系品牌首頁**：Hero、簡介、精選演奏影片、社群連結四個區塊，支援繁體中文（預設）、英文、日文、韓文，Header 提供語言切換下拉選單。
- **全站共用音訊播放器殼層**：以 Zustand 管理播放狀態，設計上可跨頁面不中斷播放（試聽功能將於樂譜商城完成後接上）。
- **低飽和編輯感視覺系統**：暖灰中性色調 + 單一赤陶強調色，箭頭位移／底線展開兩種統一的互動語彙，搭配 GSAP 進場與捲動動效。
- **資料層與權限控管**：Prisma Schema 涵蓋品牌設定、樂譜商品、服務定價、訂單、委託等核心模型；RLS 政策以「伺服器端授權為主、資料庫層為第二道防線」設計（詳見 `openspec/changes/supabase-prisma-setup/design.md`）。
- **Spec-driven 開發流程**：所有功能變更都透過 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 走 proposal → specs → design → tasks → apply 的流程管理，變更歷史留在 `openspec/changes/`。

## 🛠 技術棧

- **框架**：Next.js 14（App Router）+ TypeScript
- **樣式**：Tailwind CSS
- **動畫**：GSAP（進場時間軸、捲動觸發淡入，尊重 `prefers-reduced-motion`）
- **多語系**：next-intl（`zh-TW` / `en` / `ja` / `ko`，語系前綴路由）
- **資料庫 / 驗證**：Supabase（PostgreSQL + Auth + RLS，尚待建立實際專案）
- **ORM**：Prisma 7（driver adapter 架構，`@prisma/adapter-pg`）
- **狀態管理**：Zustand
- **圖示**：Lucide React
- **規劃中**：Cloudflare R2（樂譜檔案儲存）、Resend（自動發信）、綠界 ECPay（金流）

## 📂 專案結構

```
/src
  /app/[locale]        語系路由（layout、首頁）
  /components
    /layout            Header、GlobalAudioPlayer 殼層
    /home               Hero、About、FeaturedVideos、SocialFooter
    /ui                 共用互動元件（ArrowLink、UnderlineLink、Reveal）
  /i18n                 next-intl 路由、導覽、語系名稱設定
  /lib
    /content            假資料層（型別對齊 Prisma model，待接上真實查詢）
    /store              Zustand store（音訊播放狀態）
  middleware.ts         語系偵測與導向
/messages               各語系翻譯檔（zh-TW / en / ja / ko）
/prisma
  schema.prisma         核心資料模型
  seed.ts               本地開發種子資料
/supabase
  rls-policies.sql      Row Level Security 政策
/openspec
  changes/              每個功能變更的 proposal / specs / design / tasks
```

詳細技術規格請見 [`CLAUDE.md`](./CLAUDE.md)。

## 🚀 開始使用

### 安裝

```bash
npm install
```

### 設定環境變數

複製 `.env.example` 為 `.env`，填入 Supabase 連線資訊：

```bash
cp .env.example .env
```

```
DATABASE_URL=（Supabase 連線池網址，pgbouncer=true）
DIRECT_URL=（Supabase 直連網址，供 migration 使用）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 本機開發

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

### 型別檢查與 Lint

```bash
npx tsc --noEmit
npm run lint
```

### 資料庫（需先建立 Supabase 專案）

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

## ⚠️ 目前進度 / 已知限制

- **Supabase 專案尚未建立**：`.env` 目前為本機佔位值，資料庫 migration／RLS 套用／種子資料寫入都還無法執行，見 `openspec/changes/supabase-prisma-setup/tasks.md`。
- **首頁內容為假資料**：`src/lib/content/` 目前回傳寫死的範例內容（含多語系版本），待資料庫連線完成後換成真正的 Prisma 查詢，頁面元件不需改動。
- **樂譜商城、教學/委託頁面、後台 CMS 尚未開發**：目前只完成全站外殼與首頁品牌區。
- **金流與檔案儲存尚未串接**：Cloudflare R2、Resend、綠界 ECPay 三項整合都還沒開始。

## 🎹 專案精神

以最少的工程師依賴，讓音樂人能自己維運整個品牌與商城——每個功能變更都留下清楚的規格紀錄，方便日後追溯「為什麼這樣做」。
