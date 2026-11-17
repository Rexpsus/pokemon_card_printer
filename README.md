# 🃏 卡片列印排版工具 / Card Print Layout Tool

[繁體中文](#繁體中文) ｜ [English](#english)

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-3b82f6)](https://rexpsus.github.io/pokemon_card_printer/)
[![JS: ES Modules](https://img.shields.io/badge/JS-ES%20Modules-gold)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![i18n: zh-Hant / en / ja](https://img.shields.io/badge/i18n-zh--Hant%20%7C%20en%20%7C%20ja-blue)](./locales/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](./LICENSE)
[![Deploy](https://github.com/Rexpsus/pokemon_card_printer/actions/workflows/deploy.yml/badge.svg)](https://github.com/Rexpsus/pokemon_card_printer/actions/workflows/deploy.yml)

---

## ⚠️ 免責聲明 / Disclaimer

本工具僅供**列印測試**使用（例如新卡組上市前的試打與牌組驗證）。

- 本專案不提供、不販售、不散布任何卡牌圖片；所有圖片皆由使用者自行上傳，或由使用者自行從官方網站取得。
- **若你要實際遊玩，請支持正版、購買官方卡牌。**
- 本專案與 Pokémon、Nintendo、Creatures Inc.、GAME FREAK 無任何關聯；所有商標與著作權均屬其各自所有者。

This tool is intended for **print testing only** (e.g., playtesting a deck before new cards are released).

- This project does not provide, sell, or distribute any card images. All images are uploaded by the user, or retrieved from the official website by the user.
- **If you want to play, please support the official release and buy real cards.**
- This project is not affiliated with Pokémon, Nintendo, Creatures Inc., or GAME FREAK. All trademarks and copyrights belong to their respective owners.

---

## 繁體中文

上傳卡片圖片或貼上日本官方牌組網址，自動排成 **A4 3×3（每頁 9 張、每張 63×88mm）**，列印後可沿紙張四周的刻度裁切。

### 功能

| 功能 | 說明 |
|---|---|
| 上傳圖片 | 拖放或點擊選擇本地卡片圖片 |
| 牌組抓取 | 貼上 `pokemon-card.com` 牌組網址，自動解析卡片與數量 |
| 排序／數量 | 拖曳調整順序，每張卡可設定 1–99 張 |
| A4 排版 | 3×3、每張 63×88mm，並提示最後一頁剩餘張數 |
| 裁切刻度 | 紙張四周 16 個刻度，卡片正面無任何線條 |
| 輪播預覽 | 瀏覽所有頁面，長按兩側按鈕可加速 |
| 燈箱放大 | 點擊卡片 ⛶ 檢視細節 |
| 深色模式／三語系 | 繁中／English／日本語，偏好自動儲存 |
| 自動部署 | GitHub Actions 部署 GitHub Pages（`?v=sha` cache busting） |

### 使用方式

**A — 上傳本地卡片**

1. 點擊上傳區或將圖片拖入
2. 拖曳卡片調整順序、用 +/− 調整數量
3. 點擊「🖨️ 立即列印 (A4)」

**B — 使用日本官方牌組**

1. 點擊「📖 牌組參考」到 Pokecabook 尋找牌組
2. 取得 `https://www.pokemon-card.com/deck/result.html/deckID/...` 網址
3. 貼上網址後點擊「抓取牌組」

### 🖨️ 列印與裁切

| 設定 | 值 |
|---|---|
| 紙張 | A4 |
| 邊界 | **無（None）** |
| 縮放 | **100%**（不要選 Fit to page） |
| 頁首／頁尾 | 關閉 |

> 版面會使用紙張四周 10.5mm（左右）／16.4mm（上下）的留白放置裁切刻度，因此邊界必須選「無」。

- 每張卡 **63 × 88mm**，每頁 3×3；第 1 頁為卡片 1–9、第 2 頁為 10–18，依此類推
- 紙張四周共 **16 個刻度**（每條裁切線的兩端各一個），只印在留白處，**卡片正面沒有任何線條**

| 垂直裁切線（距紙左緣） | 水平裁切線（距紙上緣） |
|---|---|
| 10.5 / 73.5 / 136.5 / 199.5 mm | 16.4 / 104.4 / 192.4 / 280.4 mm |

1. 直尺對準上緣與下緣同一組刻度，一刀切整條
2. 依序完成 4 刀（垂直）
3. 轉 90°，改用左／右緣刻度再切 4 刀

### 技術

| 技術 | 用途 |
|---|---|
| Vanilla JS（ES Modules） | 核心程式，無 bundler |
| SortableJS 1.15.0 | 拖曳排序（CDN） |
| CSS Grid | 預覽與 A4 3×3 排版 |
| `locales/*.json` + `data-i18n` | 繁中／英／日 |
| requestAnimationFrame | 輪播動畫（可見時才執行） |
| localStorage | 語言與主題偏好 |
| Blob URL | 上傳圖片記憶體管理 |
| GitHub Actions | 部署 gh-pages 與 cache busting |

### 注意事項

- 🖨️ **列印**：版面以「A4、邊界＝無、縮放＝100%」設計；使用預設邊界或 Fit to page 會造成裁切。
- 🌐 **CORS**：牌組抓取直接 `fetch` 日本官網，受同源政策限制。
- 🔗 **官網相容性**：`deckFetcher.js` 依賴官網 HTML 結構（`searchItemCardPict` regex），官網改版會失效。
- 💾 **記憶體**：刪除卡片時自動 `URL.revokeObjectURL`。
- 📦 **零依賴政策**：無 `package.json`／npm／bundler，請勿引入外部套件。

### 🧪 除錯

- 網址加 `?noscroll`：停用輪播自動滾動，方便用 DevTools 檢查樣式
- Console 執行 `carousel.pause()` / `carousel.resume()`：凍結／恢復輪播

---

## English

Upload card images or paste a Japanese official deck URL, and the tool lays them out as **A4 3×3 (9 cards per page, 63×88mm each)** — ready to print and cut along the marks in the paper margins.

### Features

| Feature | Description |
|---|---|
| Upload images | Drag & drop or pick local card images |
| Fetch deck | Paste a `pokemon-card.com` deck URL to parse cards and quantities |
| Sort / quantity | Drag to reorder; 1–99 copies per card |
| A4 layout | 3×3 grid, 63×88mm per card, with a remaining-slot notice |
| Cut marks | 16 marks in the paper margins — nothing printed on the cards |
| Carousel preview | Browse all pages; hold the side buttons to scroll faster |
| Lightbox | Click ⛶ on a card to zoom |
| Dark mode / i18n | zh-Hant / English / 日本語, preferences persisted |
| Auto deploy | GitHub Actions to GitHub Pages (`?v=sha` cache busting) |

### How to use

**A — Upload local cards**

1. Click the upload area or drop images into it
2. Drag cards to reorder and use +/− to set quantities
3. Click "🖨️ Print Now (A4)"

**B — Use a Japanese official deck**

1. Click "📖 Deck Reference" to browse decks on Pokecabook
2. Copy the `https://www.pokemon-card.com/deck/result.html/deckID/...` URL
3. Paste the URL and click "Fetch Deck"

### 🖨️ Printing & cutting

| Setting | Value |
|---|---|
| Paper | A4 |
| Margins | **None** |
| Scale | **100%** (do not use "Fit to page") |
| Headers / footers | Off |

> The layout uses 10.5mm (left/right) and 16.4mm (top/bottom) of paper margin for the cut marks, so "Margins: None" is required.

- Each card is **63 × 88mm**, 9 per page; page 1 holds cards 1–9, page 2 holds 10–18, and so on
- **16 cut marks** (both ends of every cut line) are printed only in the margins — **the card faces have no lines at all**

| Vertical cut lines (from left paper edge) | Horizontal cut lines (from top paper edge) |
|---|---|
| 10.5 / 73.5 / 136.5 / 199.5 mm | 16.4 / 104.4 / 192.4 / 280.4 mm |

1. Align a ruler with the matching top and bottom marks and cut the full line
2. Repeat for the 4 vertical cuts
3. Rotate 90° and make the 4 horizontal cuts using the left/right marks

### Tech stack

| Tech | Purpose |
|---|---|
| Vanilla JS (ES Modules) | Core logic, no bundler |
| SortableJS 1.15.0 | Drag & drop sorting (CDN) |
| CSS Grid | Preview and A4 3×3 layout |
| `locales/*.json` + `data-i18n` | zh-Hant / English / 日本語 |
| requestAnimationFrame | Carousel animation (only while visible) |
| localStorage | Language and theme preferences |
| Blob URL | Uploaded image memory management |
| GitHub Actions | gh-pages deploy with cache busting |

### Limitations

- 🖨️ **Printing**: the layout is designed for "A4 / Margins: None / Scale: 100%". Default margins or "Fit to page" will crop the layout.
- 🌐 **CORS**: deck fetching calls the Japanese official site directly and is subject to same-origin restrictions.
- 🔗 **Site compatibility**: `deckFetcher.js` depends on the official site's HTML structure (`searchItemCardPict` regex) and breaks if it changes.
- 💾 **Memory**: blob URLs are revoked when cards are deleted.
- 📦 **Zero dependencies**: no `package.json`, npm, or bundler — please do not add external packages.

### 🧪 Debug

- Append `?noscroll` to the URL to stop the carousel auto-scroll (handy for DevTools)
- Run `carousel.pause()` / `carousel.resume()` in the Console

---

## 📁 專案結構 / Project Structure

```
card-printer/
├── index.html               # Entry page (UI, control panel, i18n attributes)
├── style.css                # All styles (theme, grid, print, responsive)
├── locales/                 # Translations
│   ├── zh-Hant.json
│   ├── en.json
│   └── ja.json
├── js/                      # ES Modules
│   ├── main.js              # Bootstrap: init, events, SortableJS
│   ├── i18n.js              # i18n engine (async load, race protection)
│   ├── state.js             # State management (encapsulated + subscribe)
│   ├── preview.js           # Preview grid, uploads, waste alert
│   ├── carousel.js          # A4 carousel, cut marks, animation control
│   ├── deckFetcher.js       # Deck fetching: fetch → regex → state
│   └── lightbox.js          # Zoom lightbox
├── .github/workflows/       # GitHub Actions deploy
└── LICENSE                  # MIT
```

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

<p align="center"><sub>Made with ❤️ for Pokémon TCG players</sub></p>
