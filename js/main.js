// 主入口 - 初始化所有功能
import { getFilesArray, setFilesArray, setIsHovering } from './state.js';
import { closeLightbox } from './lightbox.js';
import { fetchDeckData } from './deckFetcher.js';
import { handleFiles } from './preview.js';
import { scrollAnimate, setupNav } from './carousel.js';
import { initI18n, setLanguage, t } from './i18n.js';

// 按鈕圖示旋轉
document.querySelector('.btn-left .btn-icon').style.transform = 'rotate(-90deg)';
document.querySelector('.btn-right .btn-icon').style.transform = 'rotate(90deg)';

// i18n 初始化（恢復語言偏好、套用翻譯）
await initI18n();

// 語言切換 — 下拉選單
document.getElementById('langSelect').onchange = (e) => {
  setLanguage(e.target.value);
};

// 深色模式初始化
if (localStorage.getItem('card-theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// 燈箱關閉事件
document.getElementById('imgModal').onclick = (e) => {
  if (e.target.id === 'imgModal' || e.target.className === 'modal-close') closeLightbox();
};
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// 牌組抓取按鈕
document.getElementById('fetchBtn').onclick = fetchDeckData;

// Pokecabook 牌組參考按鈕
document.getElementById('pokecabookBtn').onclick = () => {
  window.open('https://pokecabook.com/archives/category/deck-recipe', '_blank', 'noopener');
};

// 拖放上傳
const dropZone = document.querySelector('.file-input-label');
dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
dropZone.ondragleave = () => dropZone.classList.remove('dragover');
dropZone.ondrop = (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); };
document.getElementById('fileInput').onchange = (e) => { handleFiles(e.target.files); e.target.value = ''; };

// 輪播導航
setupNav('scrollLeftBtn', 1);
setupNav('scrollRightBtn', -1);

document.querySelector('.carousel-container').onmouseenter = () => {
  setIsHovering(true);
};
document.querySelector('.carousel-container').onmouseleave = () => {
  setIsHovering(false);
};

// SortableJS 拖曳排序
new Sortable(document.getElementById('preview'), {
  animation: 200,
  ghostClass: 'sortable-ghost',
  dragClass: 'sortable-drag',
  onEnd: () => {
    const ids = Array.from(document.getElementById('preview').children).map(el => el.dataset.id);
    const sorted = [...getFilesArray()].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    setFilesArray(sorted);
  }
});

// 回到頂部按鈕
window.onscroll = () => {
  const btn = document.getElementById('backToTop');
  const printBtn = document.getElementById('printBtn');
  if (!printBtn || printBtn.style.display === 'none') { btn.style.display = 'none'; return; }
  btn.style.display = (printBtn.getBoundingClientRect().top < 0) ? 'flex' : 'none';
};

// 清空所有卡片
document.getElementById('clearAllBtn').onclick = () => {
  if (confirm(t('action.confirmClear'))) {
    getFilesArray().forEach(f => { if (f.url.startsWith('blob:')) URL.revokeObjectURL(f.url); });
    Array.from(document.getElementById('preview').children).forEach(child => child.classList.add('removing'));
    setTimeout(() => { setFilesArray([]); }, 300);
  }
};

// 回到頂部
document.getElementById('backToTop').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// 列印
document.getElementById('printBtn').onclick = () => window.print();

// 深色模式切換
document.getElementById('themeToggle').onclick = () => {
  const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('card-theme', t);
};

// 啟動輪播動畫
scrollAnimate();