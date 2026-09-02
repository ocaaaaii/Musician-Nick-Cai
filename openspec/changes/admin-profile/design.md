## Context

`admin-auth` 已經把 `/admin/(protected)/*` 的權限保護建好，這是第一個實際掛在裡面的管理頁面。首頁目前讀的是兩個明確標註「P1 完成後就該替換」的假資料模組，且各自依 `locale` 分支出四語言內容。這次要決定：資料庫內容要不要跟著分四語言存，還是後台只維護一份中文內容。

## Goals / Non-Goals

**Goals:**
- 音樂人能在 `/admin/profile` 修改首頁會顯示的所有文字內容與精選影片，存檔後首頁立即反映
- 首頁不再依賴假資料層
- 表單驗證前後端一致，沿用既有 Server Action 模式

**Non-Goals:**
- 不做多語言內容存儲（見 Decision 1）
- 不做 `heroVideoUrl`／圖片上傳（見 proposal.md Impact）
- 不做 Markdown 富文本編輯器

## Decisions

**1. 資料庫內容改為單一中文版本，首頁四語言都顯示同一份內容**
`ProfileConfig`／`FeaturedVideo` 維持技術規格書原本的 schema（單一語言欄位），不新增 JSON 多語言欄位、不做 migration。`getProfileConfig()`／`getFeaturedVideos()` 拿掉 `locale` 參數，直接查詢單一資料列／清單。
理由：這是與使用者確認過的決定（見對話紀錄）。多語言內容儲存需要 migration 且後台表單要多一層語言切換，複雜度明顯提高；音樂人目前是一人維運，只維護一份中文內容、讓後台儘量簡單，比保留四語言假資料的翻譯品質更符合「後台好維護」的優先順序。次要好處：`next-intl` 的 `messages/*.json`（UI 介面文字，如按鈕、標籤）不受影響，仍然是四語言——這裡改變的只是「音樂人自己輸入的品牌內容」這一類資料。

**2. 首頁假資料模組原地替換 body，不整個刪除重寫呼叫端**
`src/lib/content/profile.ts`／`featured-videos.ts` 保留檔案與 `getProfileConfig()`／`getFeaturedVideos()` 這兩個函式名稱，只把內部實作從假資料換成 `prisma.profileConfig.findUniqueOrThrow(...)`／`prisma.featuredVideo.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } })`。
理由：程式碼原本的註解就是這樣寫的（"Swap this body...callers already treat this as async"），呼叫端 `src/app/[locale]/page.tsx` 幾乎不用改（只拿掉傳入的 `locale` 參數），改動範圍最小。`findUniqueOrThrow` 是合理選擇：`site-config` 這筆資料本來就該恆常存在（後台管理的是同一筆，不會被刪除），查不到視為系統性錯誤而非可預期的空狀態。

**3. `/admin/profile` 拆成兩個獨立表單／Server Action：`ProfileForm`（品牌設定）與 `FeaturedVideoManager`（影片清單）**
`ProfileForm` 是 Client Component（因為風格標籤需要動態新增/刪除的互動狀態，沿用 `LoginForm` 已驗證過的「plain useState + 直接呼叫 Server Action」模式，不用 `useFormState`）；`FeaturedVideoManager` 也是 Client Component，管理本地影片清單狀態，每個操作（新增/更新/刪除）呼叫對應 Server Action 後更新本地狀態。兩者是同一個頁面下的兩個獨立區塊，各自存檔，不合併成一個大表單。
理由：`ProfileConfig` 是單筆設定、`FeaturedVideo` 是清單式資料，操作模式（單一 submit vs. 逐筆增刪改）本質不同，合併成一個表單只會讓「存檔」按鈕語意不清（存的是設定還是影片改動？）。分開後每個區塊有自己清楚的存檔/新增回饋。

**4. 影片排序用直接編輯 `sortOrder` 數字欄位，不做拖曳排序**
每筆影片有一個可編輯的排序數字輸入框，音樂人自行輸入想要的順序值；不實作拖放排序 UI。
理由：拖放排序需要額外的互動邏輯與函式庫（或手刻），對「首頁最多顯示幾支精選影片」這種低頻操作是不成比例的工程投入；數字輸入框雖然不如拖放直覺，但已足夠達成目的，且與現有其他管理欄位（如 `ServicePackage.sortOrder`，未來 A4 也會遇到同樣的欄位）維持一致的維護模式。

**5. 精選影片支援 YouTube 與 Instagram Reels 兩種來源，Instagram 用官方原生嵌入樣式**
`FeaturedVideo` 新增 `platform`（`VideoPlatform` enum：`YOUTUBE`／`INSTAGRAM`）欄位，`youtubeUrl` 改名為通用的 `videoUrl`。首頁渲染時依 `platform` 分支：`YOUTUBE` 沿用現有的自家風格卡片（灰階縮圖＋hover 播放圖示）；`INSTAGRAM` 改用 Instagram 官方 `embed.js` 小工具（`<blockquote class="instagram-media">`），顯示 Instagram 自己的原生播放器樣式。
理由：這是套用過程中使用者提出的追加需求。Instagram 沒有像 YouTube 那樣公開、免金鑰的縮圖 API（`img.youtube.com/vi/{id}/...` 這種可預測網址在 Instagram 不存在，官方 oEmbed API 目前需要 Meta App 存取權杖），要嘛自己想辦法生縮圖（需要額外的擷取/儲存基礎設施，遠超這次範圍），要嘛用 Instagram 官方提供、不需金鑰即可運作的原生嵌入小工具。已與使用者確認：接受 Instagram 卡片與自家風格卡片視覺不一致並存於同一個網格，不做視覺統一處理。
實作細節：`embed.js` 用 `next/script`（`strategy="lazyOnload"`）載入，只在畫面上至少有一支 Instagram 影片時才載入；該腳本載入時會自動處理頁面上所有 `.instagram-media` blockquote，不需要為每支影片各自載入一次。

## Risks / Trade-offs

- [風險] 拿掉多語言內容後，英/日/韓版本的訪客會看到中文的品牌文案 → 緩解：已於 Decision 1 記錄為使用者確認過的取捨；UI 介面文字（導覽列、按鈕、表單標籤等）仍完整四語言，只有音樂人自訂的品牌敘述文字變成單一語言
- [風險] 首頁切換到即時資料庫後，若後台誤刪 `FeaturedVideo` 清空清單，首頁該區塊會直接消失（非顯示錯誤或預設內容）→ 緩解：這與現有 `FeaturedVideos.tsx` 的 `videos.length === 0` 分支行為一致（已存在的既有邏輯，非本次新增風險），是預期中的優雅降級
- [風險] `findUniqueOrThrow` 代表若 `site-config` 這筆資料因故被刪除，首頁會直接噴 500 而非降級顯示 → 緩解：這筆資料只能透過後台的 `updateProfile`（`update`，不是可刪除的操作）異動，後台完全沒有提供刪除 `ProfileConfig` 的介面，實務上不會發生
- [風險] Instagram 卡片與 YouTube 卡片視覺風格不一致 → 緩解：已於 Decision 5 記錄為使用者確認過的取捨
- [風險] Instagram 的嵌入內容仰賴該則貼文維持公開狀態；若音樂人之後把該則 Reels 設為非公開或刪除，嵌入會失效顯示空白/錯誤 → 緩解：這是 Instagram 官方嵌入機制本身的限制，不是本次實作可以控制的範圍，音樂人自行維護 Reels 的公開狀態

## Open Questions

（無）
