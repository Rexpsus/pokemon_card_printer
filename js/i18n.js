// i18n 多國語系支援
// 從 locales/*.json 非同步載入翻譯，支援階層式 Key-Value

let _messages = {};        // 當前語言的翻譯表
let _currentLang = 'zh-Hant';
let _loadAbortController = null;

const LANG_LIST = ['zh-Hant', 'en', 'ja'];

/**
 * 格式化字串："{0}" → 對應的參數值
 */
function format(str, ...args) {
  if (!args || args.length === 0) return str;
  return str.replace(/\{(\d+)\}/g, (_, idx) => {
    const i = parseInt(idx, 10);
    return i < args.length ? String(args[i]) : _;
  });
}

/**
 * 取得目前語言的翻譯字串
 * @param {string} key - 階層式 key，如 "common.button.fetchDeck"
 * @param {...any} args - 插值參數（選擇性）
 * @returns {string}
 */
export function t(key, ...args) {
  let text = _messages[key];
  if (text === undefined || text === null) {
    console.warn(`i18n: missing key "${key}" for language "${_currentLang}"`);
    text = key;
  }
  return format(text, ...args);
}

/**
 * 取得當前語言代碼
 * @returns {string}
 */
export function getCurrentLang() {
  return _currentLang;
}

/**
 * 取得可用語言列表
 * @returns {string[]}
 */
export function getLangList() {
  return [...LANG_LIST];
}

/**
 * 載入並套用指定語言的翻譯
 * @param {string} lang
 * @returns {Promise<void>}
 */
async function loadLanguage(lang) {
  // 取消前一次尚未完成的請求
  if (_loadAbortController) {
    _loadAbortController.abort();
  }
  _loadAbortController = new AbortController();
  const signal = _loadAbortController.signal;

  try {
    const response = await fetch(`locales/${lang}.json`, { signal });
    if (!response.ok) {
      throw new Error(`Failed to load locales/${lang}.json: ${response.status}`);
    }
    const data = await response.json();
    // 請求完成後，確認沒有被新的切換打斷
    if (!signal.aborted) {
      _messages = data;
      _currentLang = lang;
      _loadAbortController = null;
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      // 被新的語言切換打斷，忽略
      return;
    }
    console.error('i18n loadLanguage error:', err);
    // 若載入失敗，保留上一份翻譯
  }
}

/**
 * 套用翻譯到所有 [data-i18n] / [data-i18n-html] / [data-i18n-attr] 元素
 */
function applyTranslations() {
  // 純文字元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // 支援 HTML 的元素（如 wasteAlert）
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
  });

  // 屬性翻譯 (placeholder, title 等)
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const attr = el.getAttribute('data-i18n-attr');
    const key = el.getAttribute(`data-i18n-${attr}`);
    if (key) {
      el.setAttribute(attr, t(key));
    }
  });

  // 更新 <html lang>
  document.documentElement.lang = _currentLang;
}

/**
 * 同步下拉選單的選取狀態
 */
function syncLangSelect() {
  const sel = document.getElementById('langSelect');
  if (sel) sel.value = _currentLang;
}

/**
 * 切換語言（非同步載入翻譯檔後套用）
 * @param {string} lang
 * @returns {Promise<void>}
 */
export async function setLanguage(lang) {
  if (!LANG_LIST.includes(lang)) return;
  await loadLanguage(lang);
  try {
    localStorage.setItem('card-lang', lang);
  } catch (e) { /* ignore */ }
  applyTranslations();
  syncLangSelect();
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: _currentLang } }));
}

/**
 * 初始化 i18n（從 localStorage 恢復偏好、載入翻譯）
 * @returns {Promise<void>}
 */
export async function initI18n() {
  let savedLang = 'zh-Hant';
  try {
    savedLang = localStorage.getItem('card-lang') || 'zh-Hant';
  } catch (e) { /* ignore */ }
  if (!LANG_LIST.includes(savedLang)) savedLang = 'zh-Hant';
  await loadLanguage(savedLang);
  applyTranslations();
  syncLangSelect();
}