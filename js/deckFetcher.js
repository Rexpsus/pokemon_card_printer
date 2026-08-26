// 日本官網牌組抓取
import { setFilesArray } from './state.js';
import { t } from './i18n.js';

export async function fetchDeckData() {
  const urlInput = document.getElementById('deckUrl').value.trim();
  const fetchBtn = document.getElementById('fetchBtn');
  if (!urlInput) { alert(t('error.enterUrl')); return; }
  fetchBtn.innerText = t('common.loading');
  fetchBtn.disabled = true;

  try {
    const response = await fetch(urlInput);
    if (!response.ok) throw new Error(t('error.network', response.status));
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
      alert(t('error.noCardsFound'));
    } else {
      setFilesArray(newCards);
      if (totalCardsSum < 60) alert(t('info.notEnoughCards', totalCardsSum));
      document.getElementById('preview').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    console.error('fetchDeckData 錯誤:', error);
    alert(t('error.fetch'));
  } finally {
    fetchBtn.innerText = t('common.button.fetchDeck');
    fetchBtn.disabled = false;
  }
}