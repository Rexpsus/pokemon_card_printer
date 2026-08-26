// 全域狀態管理
// 採用封閉式管理：所有 mutation 都經過 _setFilesArray() 統一驗證與通知

let _filesArray = [];
let _listeners = [];
let _lastRejectedItems = []; // 存放最近一次被過濾的無效項目

// 統一的內部 setter — 所有寫入操作都經過此函式
function _setFilesArray(newArray) {
  if (!Array.isArray(newArray)) {
    console.error('setFilesArray: 參數必須為陣列');
    return;
  }
  const rejected = [];
  const validated = newArray.map(item => {
    if (typeof item.id !== 'string' || typeof item.url !== 'string') {
      console.warn('setFilesArray: 跳過無效項目', item);
      rejected.push(item);
      return null;
    }
    return {
      id: item.id,
      url: item.url,
      quantity: Math.max(1, Math.min(99, Number.isFinite(item.quantity) ? Math.round(item.quantity) : 1))
    };
  }).filter(Boolean);

  _lastRejectedItems = rejected;
  _filesArray = validated;
  _notifyListeners();
}

function _notifyListeners() {
  for (const fn of _listeners) {
    try { fn(_filesArray); } catch (e) { console.error('Listener error:', e); }
  }
}

// === Public API ===

// 唯讀 getter（回傳 shallow copy，防止外部 mutation）
export function getFilesArray() {
  return _filesArray.map(item => ({ ...item }));
}

// 新增卡片（若 id 已存在則自動重新生成新 id，避免重複）
export function addFiles(items) {
  if (!Array.isArray(items)) items = [items];
  const existingIds = new Set(_filesArray.map(f => f.id));
  const dedupedItems = items.map(item => {
    if (existingIds.has(item.id)) {
      const newId = `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      console.warn(`addFiles: id "${item.id}" 已存在，重新生成為 "${newId}"`);
      existingIds.add(newId);
      return { ...item, id: newId };
    }
    existingIds.add(item.id);
    return item;
  });
  _setFilesArray([..._filesArray, ...dedupedItems]);
}

// 更新單一卡片數量（含 clamp 1~99）
export function updateQuantity(id, newQty) {
  _setFilesArray(_filesArray.map(item => {
    if (item.id === id) {
      return { ...item, quantity: Math.max(1, Math.min(99, Number.isFinite(newQty) ? Math.round(newQty) : 1)) };
    }
    return item;
  }));
}

// 刪除卡片（由呼叫端自行處理 blob URL revoke 與動畫時序）
export function removeFile(id) {
  _setFilesArray(_filesArray.filter(f => f.id !== id));
}

/**
 * 排序（根據 id 順序重新排列）
 * @deprecated 目前無任何元件使用此函式。若需排序請直接操作 `setFilesArray()`。
 *             未來版本可能移除。
 */
export function reorderFiles(orderedIds) {
  orderedIds = [...new Set(orderedIds)];
  const idSet = new Set(orderedIds);
  const ordered = orderedIds.map(id => _filesArray.find(f => f.id === id)).filter(Boolean);
  const remaining = _filesArray.filter(f => !idSet.has(f.id));
  _setFilesArray([...ordered, ...remaining]);
}

// 向後相容 — 保留 setFilesArray 但改為經過驗證
export function setFilesArray(newArray) {
  _setFilesArray(newArray);
}

// 訂閱狀態變更（回傳取消訂閱函式）
export function subscribe(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

// 取得並清除上次被過濾的無效項目（給 UI 層使用）
export function getAndClearRejectedItems() {
  const items = _lastRejectedItems;
  _lastRejectedItems = [];
  return items;
}

// === Scroll 狀態（純值，保持 mutable export 以利 rAF 高效讀取）===
export let scrollX = 0;
export let isAccelerating = 0;
export let loopWidth = 0;
export let isHovering = false;

export function setScrollX(value) { scrollX = value; }
export function setIsAccelerating(value) { isAccelerating = value; }
export function setLoopWidth(value) { loopWidth = value; }
export function setIsHovering(value) { isHovering = value; }