# 🃏 卡片列印排版工具 / Card Print Layout Tool

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-3b82f6)](https://rexpsus.github.io/pokemon_card_printer/)
[![JS: ES Modules](https://img.shields.io/badge/JS-ES%20Modules-gold)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![i18n: zh-Hant / en / ja](https://img.shields.io/badge/i18n-zh--Hant%20%7C%20en%20%7C%20ja-blue)](./locales/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](./LICENSE)
[![Deploy](https://github.com/Rexpsus/pokemon_card_printer/actions/workflows/deploy.yml/badge.svg)](https://github.com/Rexpsus/pokemon_card_printer/actions/workflows/deploy.yml)


---

一個**完全在瀏覽器中執行**的 Pokémon TCG 卡片排版列印工具。  
上傳自行掃描的卡片圖片，或從**日本 Pokémon 官方網站**直接抓取牌組，  
自動排版為 **A4 紙張 3×3（每頁 9 張）** 的佈局，支援拖曳排序、數量調整、深色模式與多國語系。

> 🚫 **零後端、零建構、零框架** — 純 Vanilla JS ES Modules，打開瀏覽器即可使用。

---

## ✨ 功能特色 / Features

| # | 功能 | 說明 |
|---|------|------|
| 🖼️ | **上傳圖片 / Upload Images** | 拖放或點擊選擇本地卡片圖片，自動轉為 Blob URL 顯示 |
| 🔗 | **牌組網址抓取 / Fetch Deck** | 貼上日本 `pokemon-card.com` 牌組網址，自動解析卡片列表與數量 |
| 📖 | **牌組參考 / Deck Reference** | 一鍵開啟 [Pokecabook](https://pokecabook.com/archives/category/deck-recipe) 牌組庫，協助找尋牌組網址 |
| ↔️ | **拖曳排序 / Drag & Sort** | 使用 SortableJS 拖曳調整卡片順序，延遲啟動防止誤觸 |
| 🔢 | **數量調整 / Quantity Control** | 每張卡片可自訂 1~99 張，自動累計總張數 |
| 📐 | **A4 自動排版 / Auto Layout** | 以 3×3 網格排列，自動計算紙張利用率，顯示**廢紙提醒**（最後一頁不滿 9 張時） |
| 🎠 | **輪播預覽 / Carousel Preview** | 無限滾動動畫瀏覽所有頁面；長按兩側按鈕加速滾動 |
| 🖨️ | **瀏覽器列印 / Browser Print** | `@media print` 精準 A4 分頁輸出，無需任何外掛 |
| 🔍 | **燈箱放大 / Lightbox Zoom** | 點擊卡片 ⛶ 放大檢視細節 |
| 🌓 | **深色模式 / Dark Mode** | 快速切換淺色 / 深色主題，偏好自動儲存 |
| 🌐 | **三語支援 / i18n** | 繁體中文 / English / 日本語，一鍵切換，`AbortController` 防競態 |
| 🚀 | **自動部署 / Auto Deploy** | GitHub Actions 推送即部署至 GitHub Pages，附 `?v=sha` cache busting |

---

## 🚀 立即試用 / Live Demo

🔗 **GitHub Pages：** [https://rexpsus.github.io/pokemon_card_printer/](https://rexpsus.github.io/pokemon_card_printer/)

打開即可使用，無需安裝、無需註冊、無需下載。

---

## 🖨️ 使用說明 / How to Use

### 情境 A — 上傳本地卡片
1. 點擊「📂 點擊選擇或拖放圖片至此」，或直接將圖片拖入該區域
2. 卡片出現在預覽區，拖曳卡片可調整順序
3. 點擊卡片下方的 + / - 調整每張卡片的數量
4. 點擊「🖨️ 立即列印 (A4)」觸發瀏覽器列印對話框

### 情境 B — 使用日本官網牌組
1. 先點擊「📖 牌組參考」前往 [Pokecabook](https://pokecabook.com/archives/category/deck-recipe) 找到感興趣的牌組
2. 在 Pokecabook 中取得該牌組的日本官網網址（通常以 `https://www.pokemon-card.com/deck/result.html/deckID/...` 開頭）
3. 將網址貼入輸入框，點擊「抓取牌組」
4. 卡片自動載入，後續操作同上

### 情境 C — 混合使用
- 先抓取牌組作為基底，再上傳自己的卡片補充 → 所有卡片可混排

### 進階操作
- 🔍 點擊卡片上的 ⛶ 按鈕放大檢視
- 🎠 使用輪播兩側 ▲ 按鈕**長按**可加速滾動
- 🗑️ 點擊「清空所有卡片」一鍵重置
- 🌓 右上角切換深色 / 淺色主題
- 🌐 右上角下拉選單切換語言

---

## 🛠 技術棧 / Tech Stack

| 技術 | 用途 |
|------|------|
| **Vanilla JS (ES2020+ Modules)** | 核心程式語言，`type="module"`，無 bundler、無框架 |
| **SortableJS 1.15.0** | 卡片拖曳排序（CDN 載入） |
| **自製 i18n 系統** | `locales/*.json` + `data-i18n` 屬性驅動，支援繁中 / 英 / 日 |
| **CSS Custom Properties** | 淺色 / 深色雙主題切換 |
| **CSS Grid** | 預覽區 `auto-fill` 佈局與 A4 3×3 排版 |
| **requestAnimationFrame** | 輪播無限滾動動畫（非 `setInterval`） |
| **localStorage** | 語言與主題偏好持久化 |
| **Blob URL** | 上傳圖片記憶體管理（`createObjectURL` / `revokeObjectURL`） |
| **GitHub Actions** | 自動部署至 gh-pages，自動 cache busting |

---

## 📁 目錄結構 / Project Structure

```
card-printer/
├── index.html               # 🏠 唯一入口頁面（所有按鈕、控制面板、i18n 屬性）
├── style.css                # 🎨 全部樣式（主題、Grid、列印、響應式設計）
├── locales/                 # 🌐 多語系翻譯檔
│   ├── zh-Hant.json         #    繁體中文
│   ├── en.json              #    English
│   └── ja.json              #    日本語
├── js/                      # 📦 核心 JavaScript 模組（ES Modules）
│   ├── main.js              #     主入口：初始化、事件綁定、SortableJS 實例化
│   ├── i18n.js              #     多語系引擎：非同步載入翻譯、DOM 套用、競態防護
│   ├── state.js             #     狀態管理：封閉式封裝、訂閱通知、驗證機制
│   ├── preview.js           #     預覽區渲染：上傳處理、刪除動畫、廢紙提醒
│   ├── carousel.js          #     A4 輪播預覽：無限滾動動畫（rAF 驅動）
│   ├── deckFetcher.js       #     牌組抓取：fetch → regex → 載入 state
│   └── lightbox.js          #     燈箱控制：放大檢視卡片
├── .github/workflows/       # 🤖 GitHub Actions 自動部署腳本
└── LICENSE                  # 📄 MIT License
```

---

## ⚠️ 注意事項 / Known Limitations

- 🌐 **CORS 限制**：牌組抓取功能直接 `fetch` 日本 Pokémon 官網，因瀏覽器同源政策限制，可能需要您自行處理 CORS（例如使用 CORS Proxy 套件或在本機啟動 HTTP Server 測試）。GitHub Pages 環境下同樣受此限制。
- 🔗 **官網相容性**：`deckFetcher.js` 依賴日本官網特定 HTML 結構（`searchItemCardPict[\\d+]` regex 解析），若官網改版會直接失效，屆時需更新解析邏輯。
- 💾 **記憶體管理**：刪除卡片時會自動 `URL.revokeObjectURL`；但請注意，`getFilesArray()` 回傳的是 shallow copy，仍指向原始 blob。
- 🖨️ **列印尺寸**：不同瀏覽器的 `@media print` 呈現有微小差異，建議先透過輪播預覽確認排版，再執行列印。
- 📦 **零依賴政策**：本專案無 `package.json`、無 npm、無 bundler。請勿引入外部套件或框架。

---

## 📄 License

本專案採用 **MIT License**。詳見 [LICENSE](./LICENSE) 檔案。

---

<p align="center">
  Made with ❤️ for Pokémon TCG players<br>
  <sub>無後端 · 無框架 · 只需瀏覽器</sub>
</p> 
