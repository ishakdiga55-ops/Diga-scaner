import { DTC_DATABASE, SEARCH_INDEX, BY_PREFIX, getInfo } from '../data/database.js';
import { getAIDIagnosis } from '../ai-service.js';

let sTimer = null;

export function initSearch() {
  const i = document.getElementById('dtcSearchInput');
  if (!i) return;
  i.addEventListener('input', e => {
    clearTimeout(sTimer);
    sTimer = setTimeout(() => searchDTC(e.target.value), 180);
  });
  i.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      clearTimeout(sTimer);
      searchDTC(e.target.value);
    }
  });
}

export function searchDTC(q) {
  const d = document.getElementById('searchResults');
  if (!d) return;
  const cEl = document.getElementById('searchCount');
  const raw = String(q).slice(0, 50);
  const qq = raw.trim().toUpperCase();
  const ql = raw.trim().toLowerCase();

  if (qq.length < 2) {
    d.innerHTML = '';
    if (cEl) cEl.textContent = '';
    return;
  }

  if (!SEARCH_INDEX.length) return;

  const looksLikeCode = /^[PCBU][0-9A-F]*$/i.test(qq);
  let candidates = null;
  if (looksLikeCode && qq.length <= 5) {
    candidates = BY_PREFIX.get(qq) || [];
  }

  const m = [];
  const source = candidates || SEARCH_INDEX;

  for (let idx = 0; idx < source.length && m.length < 80; idx++) {
    const item = source[idx];
    let match = false;
    if (candidates) match = true;
    else {
      if (item._titleLc === null) {
        item._titleLc = (item.info.title || '').toLowerCase();
        item._titleEnLc = (item.info.title_en || '').toLowerCase();
        item._brandLc = (item.info.brand || '').toLowerCase();
      }
      match = item.code.indexOf(qq) >= 0 ||
              item.cleanCode.indexOf(qq) >= 0 ||
              item._titleLc.indexOf(ql) >= 0 ||
              item._titleEnLc.indexOf(ql) >= 0 ||
              item._brandLc.indexOf(ql) >= 0;
    }
    if (match) m.push(item);
  }

  if (!m.length) {
    if (looksLikeCode && qq.length >= 3) {
      d.innerHTML = '<div class="p-4 bg-gray-900 rounded-xl text-center space-y-2"><p class="text-xs text-yellow-400">⚡ الكود غير موجود محلياً، يتم فحصه عبر الذكاء الاصطناعي...</p></div>';
      if (cEl) cEl.textContent = '(جاري التحليل...)';

      getAIDIagnosis(qq, "كود فحص غير معروف").then(aiText => {
        let resHtml = '<div class="p-4 bg-gray-900 rounded-xl space-y-3 text-right" dir="rtl">';
        resHtml += '<div class="font-mono text-red-400 font-bold text-sm">🤖 تحليل الذكاء الاصطناعي للكود: ' + qq + '</div>';
        resHtml += '<div class="text-xs text-gray-300 whitespace-pre-line leading-relaxed">' + aiText + '</div>';
        resHtml += '</div>';
        d.innerHTML = resHtml;
        if (cEl) cEl.textContent = '(تحليل ذكي)';
      });
    } else {
      d.innerHTML = '<p class="text-xs text-gray-500 text-center py-4">لا توجد نتائج</p>';
      if (cEl) cEl.textContent = '';
    }
    return;
  }

  let h = '<div class="space-y-2">';
  m.forEach(x => {
    const cl = { critical: '#dc2626', high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[x.info.severity] || '#64748b';
    h += '<div class="code-card bg-gray-900 rounded-xl p-3 flex items-center gap-3" data-key="' + x.cleanCode + '">';
    h += '<div class="w-1 self-stretch rounded-full" style="background:' + cl + '"></div>';
    h += '<div class="flex-1 min-w-0">';
    h += '<div class="font-mono text-red-300 font-bold text-sm">' + x.cleanCode + '</div>';
    h += '<div class="text-xs text-gray-400 mt-0.5 truncate">' + (x.info.title || '') + '</div>';
    h += '</div></div>';
  });
  h += '</div>';
  d.innerHTML = h;

  if (cEl) cEl.textContent = '(' + m.length + ' نتيجة)';
}
