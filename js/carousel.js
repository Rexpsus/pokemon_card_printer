// 輪播與列印預覽
import { getFilesArray, scrollX, setScrollX, isAccelerating, setIsAccelerating, loopWidth, setLoopWidth, isHovering } from './state.js';
import { t } from './i18n.js';

// 裁切線座標（mm，以紙張左上角為原點；需與 style.css 的 @media print 保持一致）
const CUT_X = [10.5, 73.5, 136.5, 199.5];    // 垂直裁切線
const CUT_Y = [16.4, 104.4, 192.4, 280.4];   // 水平裁切線
const CUT_TICKS = [
  ...CUT_X.map(x => `<i class="ctick ctick-t" style="left:${x}mm"></i>`),
  ...CUT_X.map(x => `<i class="ctick ctick-b" style="left:${x}mm"></i>`),
  ...CUT_Y.map(y => `<i class="ctick ctick-l" style="top:${y}mm"></i>`),
  ...CUT_Y.map(y => `<i class="ctick ctick-r" style="top:${y}mm"></i>`),
].join('');

// ── 輪播動畫控制（除錯 / 省電）──────────────────────────────
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
const NO_AUTO_SCROLL = new URLSearchParams(location.search).has('noscroll');
let isPaused = false;   // window.carousel.pause()
let isVisible = true;   // #printArea 是否在視窗內
let rafId = null;
let lastTransform = null;

function shouldRun() {
  return loopWidth > 0
    && !isPaused
    && !NO_AUTO_SCROLL
    && isVisible
    && document.visibilityState === 'visible'
    && (!REDUCE_MOTION.matches || isAccelerating !== 0);
}

// 值沒變就不寫 inline style（避免 hover / 暫停時每幀刷新 DevTools）
function applyTransform() {
  const area = document.getElementById('printArea');
  if (!area) return;
  const value = `translateX(${scrollX}px)`;
  if (value === lastTransform) return;
  area.style.transform = value;
  lastTransform = value;
}

export function generateCarousel() {
  const area = document.getElementById('printArea');
  const wrapper = document.getElementById('carousel');
  const container = document.querySelector('.carousel-container');
  let all = [];
  getFilesArray().forEach(f => { for (let i = 0; i < f.quantity; i++) all.push(f.url); });
  if (!all.length) {
    wrapper.style.display = 'none';
    setScrollX(0);
    setLoopWidth(0);
    stopCarousel();
    area.style.removeProperty('transform');
    lastTransform = null;
    return;
  }
  wrapper.style.display = 'block'; area.innerHTML = '';
  const pagesCount = Math.ceil(all.length / 9);
  const createSheet = (idx, isClone = false) => {
    const s = document.createElement('div'); s.className = 'sheet';
    all.slice(idx * 9, (idx + 1) * 9).forEach(url => { s.innerHTML += `<div class="card"><img src="${url}"></div>`; });
    s.innerHTML += `<div class="page-number">${t('ui.pageNumber', (idx % pagesCount) + 1)}</div>`;
    if (!isClone) s.innerHTML += CUT_TICKS;
    return s;
  };
  for (let i = 0; i < pagesCount; i++) area.appendChild(createSheet(i));
  area.lastElementChild?.classList.add('sheet-last');
  const totalContentWidth = (280 * pagesCount) + (40 * (pagesCount - 1));
  if (totalContentWidth > container.offsetWidth) {
    wrapper.classList.add('has-scroll');
    const newLoopWidth = totalContentWidth + 40;
    setLoopWidth(newLoopWidth);
    for(let j=0; j<2; j++) for(let i=0; i<pagesCount; i++) {
        const clone = createSheet(i, true); clone.classList.add('clone'); area.appendChild(clone);
    }
    if (scrollX >= 0) setScrollX(-newLoopWidth); 
    document.querySelectorAll('.nav-btn').forEach(b => b.style.display = 'flex');
  } else {
    wrapper.classList.remove('has-scroll');
    setLoopWidth(0);
    setScrollX(0);
    document.querySelectorAll('.nav-btn').forEach(b => b.style.display = 'none');
  }
  applyTransform();
  startCarousel();
}

function tick() {
  rafId = null;
  if (!shouldRun()) return;
  if (!isHovering || isAccelerating !== 0) {
    setScrollX(scrollX + (isAccelerating !== 0 ? isAccelerating * 18 : -0.8));
  }
  if (scrollX <= -loopWidth * 2) setScrollX(scrollX + loopWidth);
  if (scrollX >= 0 && isAccelerating > 0) setScrollX(scrollX - loopWidth);
  applyTransform();
  rafId = requestAnimationFrame(tick);
}

/** 需要時才啟動 rAF 迴圈（沒卡片 / 不在畫面 / 分頁在背景時完全不跑） */
export function startCarousel() {
  if (rafId === null && shouldRun()) rafId = requestAnimationFrame(tick);
}

export function stopCarousel() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
}

/** 除錯用：凍結輪播並移除 inline transform，讓 DevTools 完全乾淨 */
export function pauseCarousel() {
  isPaused = true;
  stopCarousel();
  const area = document.getElementById('printArea');
  if (area) { area.style.removeProperty('transform'); lastTransform = null; }
  console.info('[carousel] paused — run carousel.resume() to continue');
}

export function resumeCarousel() {
  isPaused = false;
  applyTransform();
  startCarousel();
}

export function initCarousel() {
  const area = document.getElementById('printArea');
  if (area && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) startCarousel();
    }).observe(area);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') startCarousel();
  });
  REDUCE_MOTION.addEventListener?.('change', () => {
    if (shouldRun()) startCarousel(); else stopCarousel();
  });
  startCarousel();
}

export function setupNav(id, dir) {
  const btn = document.getElementById(id);
  const start = (e) => { e.preventDefault(); setIsAccelerating(dir); startCarousel(); };
  const end = () => setIsAccelerating(0);
  btn.onmousedown = start; btn.ontouchstart = start;
  btn.onmouseup = btn.onmouseleave = btn.ontouchend = end;
}