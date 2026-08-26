// 預覽區渲染與卡片管理
import { getFilesArray, addFiles, updateQuantity, removeFile, getAndClearRejectedItems, subscribe } from './state.js';
import { openLightbox } from './lightbox.js';
import { generateCarousel } from './carousel.js';

// 訂閱狀態變更，自動重新渲染
subscribe(() => { renderPreview(); });

export function showToast(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, duration);
}

/**
 * 重新渲染預覽區。
 * @deprecated 無需手動呼叫 — 狀態變更後會經由 subscribe 自動觸發。
 *             保留 export 僅供向後相容，未來版本可能移除。
 */
export function renderPreview() {
  // 檢查上次 setFilesArray 是否有被過濾的無效項目，若有則顯示 toast 錯誤提示
  const rejected = getAndClearRejectedItems();
  if (rejected.length > 0) {
    showToast(`無法載入 ${rejected.length} 個卡片項目：資料格式錯誤`, 'error', 8000);
  }

  const container = document.getElementById('preview');
  const hasFiles = getFilesArray().length > 0;
  document.getElementById('printBtn').style.display = hasFiles ? 'block' : 'none';
  document.getElementById('clearAllBtn').style.display = hasFiles ? 'block' : 'none';
  document.getElementById('ui-sort-tip').style.display = hasFiles ? 'flex' : 'none';

  const currentIds = getFilesArray().map(f => f.id);
  Array.from(container.children).forEach(el => { 
    if (!currentIds.includes(el.dataset.id)) {
      const img = el.querySelector('img');
      if(img && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
      el.remove(); 
    }
  });

  getFilesArray().forEach((file, index) => {
    let el = container.querySelector(`[data-id="${file.id}"]`);
    if (!el) {
      el = document.createElement('div');
      el.className = 'preview-item';
      el.dataset.id = file.id;
      el.innerHTML = `
        <button class="remove-btn" title="刪除">✕</button>
        <button class="zoom-btn" title="放大">⛶</button>
        <img src="${file.url}" style="width:100%;height:100%;object-fit:cover;pointer-events:none;" onerror="this.src='https://via.placeholder.com/140x196?text=Image+Error'">
        <div class="qty-overlay">
          <div class="qty-group">
            <button class="qty-btn" data-dir="-1">-</button>
            <input type="number" class="qty-input" value="${file.quantity}">
            <button class="qty-btn" data-dir="1">+</button>
          </div>
        </div>`;
      container.insertBefore(el, container.children[index]);
      
      // 放大功能綁定
      el.querySelector('.zoom-btn').onclick = () => openLightbox(file.url);

      el.querySelector('.remove-btn').onclick = () => { 
        el.classList.add('removing'); 
        setTimeout(() => { 
          if(file.url.startsWith('blob:')) URL.revokeObjectURL(file.url);
          removeFile(file.id);
        }, 300); 
      };

      const input = el.querySelector('.qty-input');
      input.onclick = (e) => e.target.select();
      input.oninput = (e) => { updateQuantity(file.id, parseInt(e.target.value) || 1); };
      input.onblur = (e) => { e.target.value = getFilesArray().find(f => f.id === file.id)?.quantity ?? file.quantity; };
      el.querySelectorAll('.qty-btn').forEach(b => b.onclick = () => { 
        const currentQty = getFilesArray().find(f => f.id === file.id)?.quantity ?? file.quantity;
        const newQty = currentQty + parseInt(b.dataset.dir);
        updateQuantity(file.id, newQty); 
        input.value = getFilesArray().find(f => f.id === file.id)?.quantity ?? file.quantity; 
      });
    } else if (container.children[index] !== el) { 
      container.insertBefore(el, container.children[index]); 
    }
  });
  refreshStatus();
}

export function handleFiles(files) {
  const items = [];
  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      items.push({ id: 'f-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), url: url, quantity: 1 });
    }
  });
  if (items.length > 0) addFiles(items);
}

export function refreshStatus() {
  const total = getFilesArray().reduce((s, f) => s + f.quantity, 0);
  const rem = total % 9;
  const alert = document.getElementById('alert-wrapper');
  if (total > 0 && rem !== 0) {
    document.getElementById('waste-alert').innerHTML = `💡 <b>紙張利用提醒：</b> 最後一頁只有 ${rem} 張卡片，建議補 ${9 - rem} 張卡片填滿紙張。`;
    alert.classList.add('active');
  } else alert.classList.remove('active');
  generateCarousel();
}