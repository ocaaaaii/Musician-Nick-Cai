## Context

套用 `redesign-existing-projects` skill 的稽核流程（Scan → Diagnose → Fix）。掃描結果：`src/app/globals.css` 對 `body` 套用單一 `bg-paper`，全站每個區塊（Header／Hero／About／FeaturedVideos／樂譜／教學／委託頁）都沿用這個色，色調上完全平面、零層次；區塊分隔一律是 `border-t border-ink/10` 實心細線；卡片元件（`SheetMusicCard`／`LessonPackages`／`CommissionPackages`）都是「純邊框＋透明底色」的通用樣式。這對應稽核清單裡的「Empty, flat sections with no visual depth」「Flat design with zero texture」「Generic card look (border + shadow + white background)」三項。

## Goals / Non-Goals

**Goals:**
- 建立三階淺色調層次（`bone`／`khaki`／`paper`），讓區塊之間有可辨識的色調變化
- 加入全站雜訊紋理，打破純平面色塊
- 分隔線改為漸層淡出，卡片改為淺色調底＋柔和陰影，降低「純邊框」的通用感
- 保留既有的字體系統、互動語彙（ArrowLink／UnderlineLink／hover 狀態）、GSAP 動效、五線譜頁尾裝飾，不重做已經成立的設計決策

**Non-Goals:**
- 不换字體、不改色彩家族（仍是暖色系中性色 + 單一 brass 強調色，不引入第二個強調色）
- 不改任何頁面的資訊架構、互動邏輯、資料查詢
- 不做深色模式；深色頁尾（`ink`）維持唯一的深色錨點，不新增其他深色區塊（避免稽核清單警告的「light 頁面中間突然插入一塊深色」）

## Decisions

**1. 新增 `bone`（#F5F1E8）與 `khaki`（#E3DCC9）兩個淺色 token，與既有 `paper`（#C4BFBA）組成由淺到深的三階層次**
`bone` 最淺（近白米白）、`khaki` 居中（淺卡其）、`paper` 最深（暖灰石，目前的主色）。三者都是同一個暖色調家族的不同明度，而非跳出去的新色相。
理由：使用者明確要「白／米白／淺卡其」，這三個詞剛好對應一個從淺到深的暖色階；用同一色相家族的明度變化做層次，不會出現稽核清單警告的「隨機深色區塊」違和感——三階都還是「淺色」，只是彼此有差異。

**2. 區塊指定色調，製造閱讀節奏，不是每頁都一樣的平面色**
首頁：Hero 用 `paper`（保留現有照片+漸層的視覺重量）、About 用 `bone`（最淺，讓引言文字乾淨突出）、FeaturedVideos 用 `khaki`（居中，與前後區塊都能分辨）、頁尾維持 `ink`。樂譜／教學／委託頁：整頁底用 `khaki`，內部資訊卡片用 `bone`（卡片比頁面背景淺一階，製造「卡片浮起」的層次，取代原本的純邊框）。
理由：色調變化本身就是最自然的分隔手法，比額外畫線更有「設計過」的質感；卡片比背景淺一階能達到「浮起」的視覺效果，不需要陰影也能分辨層次，陰影是額外加強而非唯一手段。

**3. 分隔線改為漸層淡出（邊緣透明），不再是滿版實心細線**
用 `background-image: linear-gradient(...)` 做一條「中間深、兩端漸淡至透明」的水平線，取代 `border-t border-ink/10`。
理由：滿版實心細線是稽核清單裡「flat, no depth」的典型症狀之一；漸層淡出的線條在視覺上更輕、更像是「設計來的收邊」而非「div 之間隨手加的邊框」。

**4. 全站雜訊紋理用一張固定定位、`pointer-events-none` 的 SVG feTurbulence 疊層，透明度極低（約 3%）**
在 `RootLayout`（`src/app/[locale]/layout.tsx`）掛一個固定滿版的疊層 div，`background-image` 用 inline SVG data URI 產生的雜訊圖案，`mix-blend-mode: overlay`。
理由：這是稽核清單「Flat design with zero texture」的直接解法，也是使用者要求「加強質感」最低成本、影響最大的單一改動；固定定位＋極低透明度確保不影響任何文字對比度或可讀性，`pointer-events-none` 確保不擋任何互動。

**5. 卡片元件改為淺一階底色 + 帶色調陰影，邊框降到幾乎看不見（或移除）**
`border-ink/10` 改為 `border-ink/5`（或移除，視實際效果取捨）+ `shadow-[0_1px_3px_rgba(28,29,31,0.08)]`（用 `ink` 的低透明度而非泛用黑色陰影）。
理由：稽核清單明確點名「border + shadow + white background」是最通用的 AI 卡片樣式；改成「淺一階底色 + 色調陰影 + 幾乎無邊框」保留「這是一張卡片」的辨識度，但去掉最通用的視覺特徵。

## Risks / Trade-offs

- [風險] 雜訊疊層若透明度沒調好，可能影響文字可讀性或在特定螢幕上出現摩爾紋 → 緩解：先用約 3% 透明度實作，截圖檢視文字對比度與行動裝置畫面後再微調
- [風險] 三階色調彼此對比度低（都是淺色），若螢幕校色差可能不容易分辨 → 緩解：色調差異取自使用者指定的三個具體詞彙（白/米白/淺卡其），彼此明度差刻意拉開到肉眼可辨識的程度，並用截圖驗證

## Open Questions

（無）
