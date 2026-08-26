// 輪播與列印預覽
import { getFilesArray, scrollX, setScrollX, isAccelerating, setIsAccelerating, loopWidth, setLoopWidth, isHovering } from './state.js';
import { t } from './i18n.js';

export function generateCarousel() {
  const area = document.getElementById('printArea');
  const wrapper = document.getElementById('carousel');
  const container = document.querySelector('.carousel-container');
  let all = [];
  getFilesArray().forEach(f => { for(let i=0; i<f.quantity; i++) all.push(f.url); });
  if(!all.length) { wrapper.style.display = 'none'; setScrollX(0); return; }
  wrapper.style.display = 'block'; area.innerHTML = '';
  const pagesCount = Math.ceil(all.length / 9);
  const createSheet = (idx) => {
    const s = document.createElement('div'); s.className = 'sheet';
    all.slice(idx * 9, (idx + 1) * 9).forEach(url => { s.innerHTML += `<div class="card"><img src="${url}"></div>`; });
    s.innerHTML += `<div class="page-number">${t('ui.pageNumber', (idx % pagesCount) + 1)}</div>`;
    return s;
  };
  for(let i=0; i<pagesCount; i++) area.appendChild(createSheet(i));
  const totalContentWidth = (280 * pagesCount) + (40 * (pagesCount - 1));
  if (totalContentWidth > container.offsetWidth) {
    wrapper.classList.add('has-scroll');
    const newLoopWidth = totalContentWidth + 40;
    setLoopWidth(newLoopWidth);
    for(let j=0; j<2; j++) for(let i=0; i<pagesCount; i++) {
        const clone = createSheet(i); clone.classList.add('clone'); area.appendChild(clone);
    }
    if (scrollX >= 0) setScrollX(-newLoopWidth); 
    document.querySelectorAll('.nav-btn').forEach(b => b.style.display = 'flex');
  } else {
    wrapper.classList.remove('has-scroll');
    setLoopWidth(0);
    setScrollX(0);
    document.querySelectorAll('.nav-btn').forEach(b => b.style.display = 'none');
  }
  area.style.transform = `translateX(${scrollX}px)`;
}

export function scrollAnimate() {
  if (loopWidth > 0) {
    const area = document.getElementById('printArea');
    if (!isHovering || isAccelerating !== 0) {
        const newScrollX = scrollX + ((isAccelerating !== 0) ? isAccelerating * 18 : -0.8);
        setScrollX(newScrollX);
    }
    if (scrollX <= -loopWidth * 2) setScrollX(scrollX + loopWidth);
    if (scrollX >= 0 && isAccelerating > 0) setScrollX(scrollX - loopWidth);
    area.style.transform = `translateX(${scrollX}px)`;
  }
  requestAnimationFrame(scrollAnimate);
}

export function setupNav(id, dir) {
  const btn = document.getElementById(id);
  const start = (e) => { e.preventDefault(); setIsAccelerating(dir); };
  const end = () => setIsAccelerating(0);
  btn.onmousedown = start; btn.ontouchstart = start;
  btn.onmouseup = btn.onmouseleave = btn.ontouchend = end;
}