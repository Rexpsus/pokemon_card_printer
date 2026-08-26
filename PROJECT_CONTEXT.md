# PROJECT_CONTEXT.md — 卡片列印排版工具

> AI 專用上下文。目標：讓未來的 AI Task 在 30 秒內讀懂此專案。

---

## 專案目標與核心功能

- 純前端工具，讓使用者上傳卡片圖片或自日本 Pokémon 官網抓取牌組，進行可拖曳排序、調整數量的排版。
- 自動計算 A4 紙張利用率（每頁 3×3 = 9 張），產生輪播預覽，並支援瀏覽器原生列印。
- 無後端、無構建、無框架，完全在瀏覽器中運作，所有狀態存於記憶體。

## 技術棧與關鍵 Libs

| 技術 | 版本 / 來源 | 用法特點 |
|------|-------------|----------|
| **Vanilla JS (ES Modules)** | ES2020+ | `type="module"`，無 bundler，直接 import/export |
| **SortableJS** | 1.15.0 (CDN) | 拖曳排序預覽區卡片，onEnd callback 同步 filesArray |
| **CSS Custom Properties** | — | `:root` / `[data-theme="dark"]` 雙主題切換 |
| **CSS Grid** | — | 預覽區 `auto-fill`、A4 紙張 `3×3` |
| **requestAnimationFrame** | — | 輪播無限滾動動畫，非 setInterval |
| **localStorage** | — | 主題偏好 key: `card-theme` |
| **Blob URL** | — | `URL.createObjectURL` / `revokeObjectURL` 管理上傳圖片 |
| **CORS Proxy** | 無 | `deckFetcher.js` 直接 fetch 日本官網，需使用者自行處理 CORS |

## 目錄架構與檔案地圖

```
/
├── index.html              # 唯一入口，載入所有模組 & CDN SortableJS
├── style.css               # 全部樣式（含 @media print 與深色主題）
├── cards/                  # 靜態範例圖片（手動放置）
│   ├── 1.jpg ~ 6.jpg
│   └── 0xxxxx_*.jpg        # 從官網抓取的歷史樣本
├── js/
│   ├── main.js             # 主入口：初始化事件、SortableJS、主題 restore
│   ├── state.js            # 狀態管理（封閉式封裝 + 驗證）
│   │   ├── _filesArray     # 核心資料 { id, url, quantity }[]（module-scoped，不 export）
│   │   ├── getFilesArray() # 唯讀 getter（回傳 shallow copy）
│   │   ├── addFiles()      # 新增卡片（含 id/url 型別驗證）
│   │   ├── updateQuantity()# 更新數量（自動 clamp 1~99）
│   │   ├── removeFile()    # 刪除卡片（blob revoke 由 UI 層 preview.js 負責）
│   │   ├── getAndClearRejectedItems() # 取得並清除上次被過濾的無效項目
│   │   ├── reorderFiles()  # @deprecated 排序（無元件使用）
│   │   ├── subscribe()     # 訂閱狀態變更
│   │   └── scrollX, isAccelerating, loopWidth, isHovering  # 輪播動畫狀態（mutable export）
│   ├── preview.js          # 預覽區渲染、上傳檔案處理、廢紙提醒
│   │   ├── renderPreview() # @deprecated 由 subscribe 自動觸發，僅供向後相容
│   │   ├── handleFiles()   # 接受 FileList → Blob URL → 加入 filesArray
│   │   └── refreshStatus() # 計算總張數 mod 9，顯示紙張利用提示
│   ├── carousel.js         # A4 列印預覽輪播 + 無限滾動動畫
│   │   ├── generateCarousel() # 根據 filesArray × quantity 生成 sheet
│   │   ├── scrollAnimate()    # rAF loop，自動慢速左移 / 按住加速
│   │   └── setupNav()         # 滑鼠/觸控長按加速
│   ├── deckFetcher.js      # 抓取日本官網牌組
│   │   ├── fetchDeckData() # fetch → regex 解析 → setFilesArray
│   │   └── targetCategories: deck_pke, deck_gds, deck_tool, ...
│   └── lightbox.js         # 燈箱放大檢視
│       ├── openLightbox(url)
│       └── closeLightbox()
```

## 資料流與核心邏輯流程

```
[使用者操作]
  ├─ 上傳圖片 ──→ handleFiles(files)
  │                  └─ URL.createObjectURL → { id: 'f-{timestamp}', url: blob, quantity: 1 }
  │                     → addFiles() → 觸發 subscriber → renderPreview()
  ├─ 輸入牌組網址 → fetchDeckData()
  │                  └─ fetch → regex → { id: 'ptcg-{id}-{rand}', url: 'https://...', quantity: qty }
  │                     → setFilesArray → 觸發 subscriber → renderPreview()
  └─ 拖曳排序 ──→ SortableJS onEnd → 根據 DOM 順序重新排序 → setFilesArray(sorted)

renderPreview() 流程：
  1. 顯示/隱藏按鈕 (printBtn, clearAllBtn, sortTip)
  2. 清除 DOM 中已被移除的卡片（含 blob URL revoke）
  3. 為 filesArray 中每個項目建立 DOM (或 reorder)
  4. 綁定事件：刪除、放大、增減數量
  5. 呼叫 refreshStatus()

refreshStatus() → generateCarousel()
  ├─ 展開 quantity：filesArray → 平面 URL 陣列
  ├─ 每 9 張為一頁 (sheet)，不足 9 張顯示廢紙提醒
  ├─ 若內容寬度 > container 寬度 → 啟用輪播 + 複製 clones * 2 份
  └─ 否則置中靜態顯示

scrollAnimate() (rAF loop)：
  ├─ 每幀 scrollX += -0.8 (自動) 或 ±18 (按住按鈕)
  ├─ 左邊界回繞：scrollX <= -loopWidth*2 → +loopWidth
  └─ 右邊界回繞：scrollX >= 0 (右加速) → -loopWidth

列印流程：
  └─ window.print() → @media print 隱藏 UI、sheet 展開全頁、page-break-after
```

### State 管理（重要）

- 採用 **封閉式封裝**（非 React），`filesArray` 為 module-scoped `_filesArray`，不直接 export。
- 所有寫入操作統一經由 `_setFilesArray()` 處理，包含型別驗證、數量 clamp 1~99、無效項目過濾。
- 外部模組透過以下 API 存取：
  - `getFilesArray()` — 唯讀 getter，回傳 shallow copy（防止外部 mutation）
  - `addFiles(items)` — 新增卡片（id 重複時自動重新生成）
  - `updateQuantity(id, newQty)` — 更新數量（自動 clamp 1~99）
  - `removeFile(id)` — 刪除卡片（blob revoke 由 UI 層 preview.js 處理）
  - `getAndClearRejectedItems()` — 取得並清除上次被過濾的無效項目（供 UI 層使用）
  - `reorderFiles(orderedIds)` — **@deprecated** 無元件使用，請用 `setFilesArray`
  - `setFilesArray(newArray)` — 向後相容（仍經過驗證）
  - `subscribe(fn)` — 訂閱狀態變更，回傳取消訂閱函式
- 模組間依賴關係（直接 import）：
  ```
  state.js  — 被所有模組直接 import（核心依賴）
  main.js   → state.js, preview.js, carousel.js, deckFetcher.js, lightbox.js
  preview.js → state.js, lightbox.js, carousel.js
  carousel.js → state.js
  deckFetcher.js → state.js（不經 preview.js）
  ```
- `preview.js` 另透過 `subscribe(fn)` 訂閱狀態變更、透過 `refreshStatus()` 呼叫 `generateCarousel()`，均為 function call 而非 import 依賴。
- Scroll mutable export（`scrollX` 等）另有對應 setter：`setScrollX()`, `setIsAccelerating()`, `setLoopWidth()`, `setIsHovering()`。
- 所有 UI 更新為「全量重繪」（`renderPreview()` / `generateCarousel()`），非選擇性 patch。
- Scroll 狀態（`scrollX`, `isAccelerating`, `loopWidth`, `isHovering`）為 mutable export，以利 rAF 高效讀取。

## 開發規範與注意事項

### 命名原則

| 項目 | 規則 | 範例 |
|------|------|------|
| 資料夾 | 小寫 | `js/`, `cards/` |
| JS 檔案 | camelCase, 名詞/動詞 | `deckFetcher.js`, `preview.js` |
| 函式 | camelCase, 動詞前綴 | `fetchDeckData`, `openLightbox` |
| DOM id | camelCase 或 kebab | `themeToggle`, `scrollLeftBtn`, `alert-wrapper` |
| CSS class | kebab-case | `preview-item`, `qty-overlay`, `sortable-ghost` |
| 資料 id prefix | `f-` 本機 / `ptcg-` 牌組 | `f-1723456789`, `ptcg-047878-abc` |

### 禁止使用的語法 / 注意事項

- **禁止** 使用 TypeScript、JSX、Babel 等轉譯工具 — 純 vanilla ES Module 專案。
- **禁止** 引入 npm 套件或 node_modules — 無 package.json、無 bundler。
- **禁止** 使用 jQuery 或 DOM 框架 — 所有 DOM 操作皆為原生。
- **禁止** 修改 `state.js` 為 reactive 或 Proxy — 保持 mutable export 模式。
- **禁止** 在非 `@media print` 情境下依賴列印精確尺寸（不同瀏覽器有差異）。
- **注意** `deckFetcher.js` 依賴日本官網 HTML 結構（regex 解析），若官網改版會直接 break。
- **注意** 刪除卡片時須手動 `URL.revokeObjectURL`，否則記憶體洩漏。`getFilesArray()` 回傳 shallow copy，url 仍指向原始 blob。
- **注意** `subscribe()` 回傳的取消函式應在元件卸載時呼叫，避免 listener 洩漏。
- **注意** 輪播複製 clones 數量為 2 份（原始 + 2 份 clone = 3 倍），scrollX 回繞邏輯依賴此機制。
- **注意** `renderPreview()` 已標記 `@deprecated`，由 `subscribe(() => renderPreview())` 自動觸發，無需手動呼叫。
- **注意** `getFilesArray()` 每次回傳全新陣列與物件，不應用 `===` 比對兩次呼叫結果。
