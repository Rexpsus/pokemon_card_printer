// 日本官網牌組抓取
import { setFilesArray } from './state.js';

export async function fetchDeckData() {
  const urlInput = document.getElementById('deckUrl').value.trim();
  const fetchBtn = document.getElementById('fetchBtn');
  if (!urlInput) { alert("請輸入網址！"); return; }
  fetchBtn.innerText = "讀取中...";
  fetchBtn.disabled = true;

  try {
    const response = await fetch(urlInput);
    if (!response.ok) throw new Error(`網路回應不正常: ${response.status}`);
    const htmlText = await response.text();
    const imgMap = {};
    const imgRegex = /searchItemCardPict\[(\d+)\]\s*=\s*'([^']+)';/g;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(htmlText)) !== null) {
      imgMap[imgMatch[1]] = "https://www.pokemon-card.com" + imgMatch[2];
    }
    const targetCategories = ['deck_pke','deck_gds','deck_tool','deck_tech','deck_sup','deck_sta','deck_ene','deck_ajs'];
    let totalImportedSpecies = 0;
    let totalCardsSum = 0;
    const newCards = [];

    targetCategories.forEach(catId => {
      const catRegex = new RegExp(`id="${catId}"\\s+value="([^"]+)"`);
      const match = htmlText.match(catRegex);
      if (match && match[1]) {
        const dataStr = match[1];
        const entries = dataStr.split('-');
        entries.forEach(entry => {
          const parts = entry.split('_'); 
          if (parts.length >= 2) {
            const id = parts[0];
            const qty = parseInt(parts[1]);
            const imgSrc = imgMap[id];
            if (imgSrc) {
              newCards.push({
                id: 'ptcg-' + id + '-' + Math.random().toString(36).slice(2, 6),
                url: imgSrc,
                quantity: qty
              });
              totalImportedSpecies++;
              totalCardsSum += qty;
            }
          }
        });
      }
    });

    if (totalImportedSpecies === 0) {
      alert("無法在網頁中找到任何卡片資訊。");
    } else {
      setFilesArray(newCards);
      if (totalCardsSum < 60) alert(`⚠️ 注意：此牌組僅抓取到 ${totalCardsSum} 張卡片，不足 60 張！`);
      document.getElementById('preview').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    console.error('fetchDeckData 錯誤:', error);
    alert("發生錯誤，詳情請見 Console");
  } finally {
    fetchBtn.innerText = "抓取牌組";
    fetchBtn.disabled = false;
  }
}