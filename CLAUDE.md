# 鋼琴專家個人品牌與數位商城網站 (含後台 CMS) - 技術規格書

## 1. 專案概述 (Project Overview)

本專案旨在為一位鋼琴專家（具備編曲、採譜/抓譜、教學能力）打造高自動化的個人品牌、數位商城與**完全自主維護的後台 CMS 系統**。

  

- **主要目標**：品牌展示、數位樂譜自動化販售（自動交付）、教學預約、客製化採譜/合作委託，以及**免工程師協助的全站動態內容管理**。
    
      
    
- **核心原則**：採用全免費生態系 (Zero-Cost Infrastructure Stack)、極佳的音訊體驗、高安全性（PDF 防盜連 + RLS 權限控管）與模組化開發。
    
      
    

## 2. 技術 Stack 與系統架構 (Tech Stack)

### 2.1 核心架構

- **Framework**: Next.js 14+ (App Router, TypeScript)
    
      
    
- **Styling**: Tailwind CSS + shadcn/ui + Lucide Icons
    
      
    
- **Deployment**: Vercel (Hobby Free Tier)
    
      
    
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth + RLS 權限控管)
    
      
    
- **Cloud Storage**: Cloudflare R2 (儲存樂譜 PDF、封面圖、試聽音檔，使用 Signed URL，免流量費)
    
      
    
- **Email Service**: Resend API (自動發送樂譜下載信件與委託通知)
    
      
    
- **Payment**: 綠界科技 (ECPay) API (台灣在地金流)
    
      
    
- **Forms/Booking**: Calendly 嵌入 / 客製化 React Hook Form
    
      
    

### 2.2 防盜連與交付架構 (Security & Delivery Architecture)

```
[User Checkout] -> [ECPay Payment] -> [ECPay Webhook (/api/payment/ecpay-callback)]
                                            |
                                  (Verify CheckMacValue)
                                            |
                                 [Generate R2 Signed URL]
                                            |
                                 [Send Email via Resend] -> [User Receives Download Link]
```

## 3. 資料庫 Schema (Prisma Schema Example)

程式碼片段

```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  USER
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}

enum CommissionType {
  TRANSCRIPTION // 打譜/採譜
  LESSON        // 鋼琴教學
  COLLABORATION // 合作邀約
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
}

// 1. 後台維護：個人品牌與首頁設定 (單筆紀錄 Site Meta)
model ProfileConfig {
  id              String   @id @default("site-config")
  heroTitle       String   // 首頁大標題
  heroSubtitle    String   // 副標題
  heroVideoUrl    String?  // 背景影片/形象影片 URL
  aboutBio        String   @db.Text // 個人簡介 (支援 Markdown)
  styleTags       String[] // 擅長風格標籤 array
  instagramUrl    String?  // IG 帳號連結
  contactEmail    String?  // 合作 Email
  calendlyUrl     String?  // Calendly 預約連結
  updatedAt       DateTime @updatedAt
}

// 2. 後台維護：精選影片管理
model FeaturedVideo {
  id          String   @id @default(uuid())
  title       String
  youtubeUrl  String   // YouTube 連結或 Video ID
  sortOrder   Int      @default(0) // 排序
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
}

// 3. 後台維護：樂譜商品管理
model SheetMusic {
  id               String      @id @default(uuid())
  title            String
  description      String?     @db.Text
  price            Decimal     @db.Decimal(10, 2)
  difficulty       String      // Beginner, Intermediate, Advanced
  genre            String      // Pop, Jazz, Classical, Anime
  key              String?     // 樂曲調性
  pdfFileKey       String      // Cloudflare R2 私有路徑 (非公開 URL)
  sampleImages     String[]    // 浮水印預覽圖 URL (公開)
  audioSampleUrl   String      // 試聽音檔 URL (公開)
  isPublished      Boolean     @default(true)
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  orderItems       OrderItem[]
}

// 4. 後台維護：服務與課程定價說明
model ServicePackage {
  id          String         @id @default(uuid())
  type        CommissionType
  title       String         // 服務名稱 (如: 流行單曲採譜 / 一對一高階鋼琴課)
  priceInfo   String         // 價格說明 (如: NT$ 1,500 起 / 每堂 $2,000)
  description String         @db.Text // 服務內容說明
  isPublished Boolean        @default(true)
  sortOrder   Int            @default(0)
}

model Order {
  id              String        @id @default(uuid())
  userEmail       String
  totalAmount     Decimal       @db.Decimal(10, 2)
  status          PaymentStatus @default(PENDING)
  paymentMethod   String?
  merchantTradeNo String        @unique // 綠界交易單號
  tradeNo         String?       // 綠界回傳之通關單號
  userId          String?
  user            User?         @relation(fields: [userId], references: [id])
  orderItems      OrderItem[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model OrderItem {
  id           String     @id @default(uuid())
  orderId      String
  order        Order      @relation(fields: [orderId], references: [id])
  sheetMusicId String
  sheetMusic   SheetMusic @relation(fields: [sheetMusicId], references: [id])
  price        Decimal    @db.Decimal(10, 2)
}

model Commission {
  id          String         @id @default(uuid())
  type        CommissionType
  name        String
  email       String
  phone       String?
  audioUrl    String?        // 委託採譜的參考音檔/YouTube連結
  details     String         @db.Text
  isHandled   Boolean        @default(false)
  createdAt   DateTime       @default(now())
}
```

## 4. 詳細頁面與模組規格 (Pages & Feature Requirements)

### 4.1 全站通用組件 (Global Layout)

- **Sticky Bottom Audio Player**: 必須位於 Root Layout，使用者切換頁面時音訊**不得中斷**。支援播放/暫停、進度條、音量控制與目前試聽曲名顯示。
    
      
    
- **Header / Navbar**: Logo、品牌名稱、頁面導覽（關於我、樂譜商城、教學服務, 客製委託）、購物車圖示 (Cart Drawer)。
    
      
    

### 4.2 前台頁面規格 (Client Portal)

#### P1. 首頁與個人品牌區 (`/`)

- **Hero Section**: 讀取 DB `ProfileConfig` 之標題與背景影片/照片。
    
      
    
- **About Section**: 讀取 DB `ProfileConfig` 之簡介與風格標籤 (Badges)。
    
      
    
- **Featured Videos**: 讀取 DB `FeaturedVideo` 嵌入精選 YouTube 演奏影片卡片。
    
      
    
- **Social Links**: 讀取 DB `ProfileConfig` 之 IG 與 Email。
    
      
    

#### P2. 樂譜數位商城 (`/sheets`)

- **篩選與搜尋**: 依難易度、曲風、關鍵字 (Search Bar) 即時過濾樂譜。
    
      
    
- **樂譜單頁 (`/sheets/[id]`)**:
    
      
    - 曲目詳細資訊（調性、難易度、頁數、價格）。
        
          
        
    - **試聽按鈕**: 點擊後同步至底欄 Audio Player 播放該曲試聽檔。
        
          
        
    - **樂譜預覽**: 僅展示轉為圖片檔的第一頁（加蓋動態浮水印，禁止右鍵下載）。
        
          
        
    - **購買按鈕**: 加入購物車 / 立即結帳。
        
          
        

#### P3. 結帳與自動發送流程 (`/checkout` & `/api/payment`)

- **Checkout Page**: 填寫 Email（無須強制註冊），選取綠界付款方式（信用卡/WEBATM/超商代碼）。
    
      
    
- **API: `/api/payment/ecpay-checkout`**: 生成綠界表單所需的加密參數與 `CheckMacValue` 並 redirect 至綠界付款頁。
    
      
    
- **API: `/api/payment/ecpay-callback` (Webhook)**:
    
      
    1. 接收綠界回傳之 POST Data。
        
          
        
    2. 重新驗證 `CheckMacValue`，確保金額與交易合法。
        
          
        
    3. 更新資料庫訂單狀態為 `SUCCESS`。
        
          
        
    4. 調用 Cloudflare R2 API 產生 24 小時有效之 Signed URL。
        
          
        
    5. 使用 Resend 發送包含 Signed URL 的下載信件至買家 Email。
        
          
        

#### P4. 鋼琴教學與委託服務 (`/lessons` & `/commissions`)

- 讀取 DB `ServicePackage` 動態呈現各服務說明與價格起價。
    
      
    
- **預約/委託表單**: 嵌入 Calendly 或提交採譜/合作需求，資料寫入 DB 並自動發信至音樂人 Email。
    
      
    

### 4.3 後台 CMS 管理系統規格 (Admin Portal - `/admin`)

後台需要 Auth 保護（僅限 `role == ADMIN` 的 Supabase 用戶登入），包含以下管理子頁面：

  

#### A1. 登入頁 (`/admin/login`)

- 使用 Supabase Auth（Email/Password 或 Magic Link）。非 Admin 帳號嘗試存取`/admin/*` 自動重定向至登入頁。
    
      
    

#### A2. 個人品牌與首頁管理 (`/admin/profile`)

- **個人簡介編輯**：Rich Text 或 Markdown 編輯器更新 `About Bio`。
    
      
    
- **風格標籤設定**：可自由新增/刪除風格 Tag（如：流行改編、爵士即興、動漫 OST）。
    
      
    
- **聯絡方式與預約連結**：更新 IG 帳號、Email、Calendly 嵌入網址。
    
      
    
- **精選影片管理**：新增/刪除/排序首頁展示的 YouTube 影片連結。
    
      
    

#### A3. 樂譜商品管理 (`/admin/sheets`)

- **商品列表**：顯示所有樂譜（含上架/下架狀態、價格、銷售量統計）。
    
      
    
- **新增/編輯樂譜**：
    
      
    - 基本欄位：曲名、價格、風格、難易度、調性、描述。
        
          
        
    - **檔案上傳組件 (Direct Upload to R2)**：
        
          
        1. 上傳樂譜正本 PDF $\rightarrow$ 直傳 R2 私有目錄（自動加密路徑）。
            
              
            
        2. 上傳封面/預覽第一頁 PNG $\rightarrow$ 直傳 R2 公開目錄。
            
              
            
        3. 上傳試聽 MP3 $\rightarrow$ 直傳 R2 公開目錄。
            
              
            
    - **一鍵上下架** Switch 開關。
        
          
        

#### A4. 服務與定價管理 (`/admin/services`)

- 新增/編輯「打譜採譜」、「一對一鋼琴教學」、「商業合作」的收費標準與說明文字，讓音樂人隨時可調整報價。
    
      
    

#### A5. 訂單與收入統計 (`/admin/orders`)

- 查看歷史樂譜銷售訂單（買家 Email、購買曲目、付款金額、付款狀態）。
    
      
    
- **手動補發功能**：提供「重發樂譜下載信」按鈕，若買家沒收到信可一鍵補發。
    
      
    

#### A6. 委託與詢問看板 (`/admin/commissions`)

- 查看前台發起的採譜委託、合作邀約清單，可勾選標記「已處理/已聯繫」。
    
      
    

## 5. 給 Claude 的開發提示詞範例 (Prompt Examples for Claude)

當你開始讓 Claude 寫程式碼時，可以使用以下架構提示詞：

  

### 提示詞 1：建立 API Route (綠界 Webhook 與 Signed URL)

> "請基於本 Spec 的需求，使用 Next.js 14 App Router (TypeScript) 寫出 `/app/api/payment/ecpay-callback/route.ts`。
> 
> 需求：
> 
>   
> 
> 1. 解析綠界的 POST 回傳資料，並驗證 CheckMacValue。
>     
>       
>     
> 2. 使用 Prisma 更新 `Order` 狀態為 SUCCESS。
>     
>       
>     
> 3. 調用 `@aws-sdk/client-s3` 針對 Cloudflare R2 產生私有 PDF 的 `getSignedUrl` (時效 24小時)。
>     
>       
>     
> 4. 使用 Resend SDK 寄送樂譜下載信給買家。
>     
>     請包含完整的錯誤處理 (Error Handling) 與 TypeScript 型別定義。"
>     
>       
>     

### 提示詞 2：寫全站播放器 Component

> "請使用 React + Tailwind CSS + Lucide Icons 寫一個可置於 Next.js Root Layout 的 `GlobalAudioPlayer.tsx`。
> 
> 需求：
> 
>   
> 
> 1. 使用 Zustand 管理全局播放狀態 (currentTrackUrl, trackTitle, isPlaying)。
>     
>       
>     
> 2. 固定於螢幕底部 (Fixed bottom)，具備播放/暫停、進度條、當前時間/總時長、音量控制。
>     
>       
>     
> 3. 移動端 (Mobile) 自動收合為簡化版，點擊可展開。
>     
>       
>     
> 4. 切換頁面時音訊播放不可中斷。"
>     
>       
>     

### 提示詞 3：寫後台樂譜上傳組件 (R2 Direct Upload + CMS)

> "請使用 React, shadcn/ui (Form, Input, Button) 與 `@aws-sdk/client-s3` 寫一個後台樂譜新增頁面 `/app/admin/sheets/new/page.tsx`。
> 
> 需求：
> 
>   
> 
> 1. 表單包含：曲名、價格、難易度 (Select)、曲風 (Select)、PDF 正本上傳、預覽圖上傳、試聽 MP3 上傳。
>     
>       
>     
> 2. 檔案上傳時，先請求 Server Route `/api/admin/upload-presigned-url` 取得 Cloudflare R2 預簽名 URL，再由前端直傳 R2。
>     
>       
>     
> 3. 提交表單後，將資料寫入 Prisma `SheetMusic` 資料表並 Redirect 回樂譜列表頁。"
>