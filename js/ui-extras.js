import { DTC_DATABASE, getInfo } from './data/database.js';
import { user } from './state.js';

const SYMPTOMS_DB = [
  { label: 'اهتزاز المحرك', icon: '📳', codes: ['P0300','P0301','P0302','P0303','P0304','P0171'] },
  { label: 'دخان أسود', icon: '🖤', codes: ['P0299','P0172','P0175','P0101'] },
  { label: 'دخان أبيض', icon: '⬜', codes: ['P0217','P0118','P0115'] },
  { label: 'لا تشتغل', icon: '🔑', codes: ['P0335','P0340','U0100','P0230'] },
  { label: 'استهلاك مرتفع', icon: '⛽', codes: ['P0171','P0172','P0420','P0101'] },
  { label: 'ضعف التسارع', icon: '🐢', codes: ['P0101','P0299','P0171','P0420'] },
  { label: 'Check Engine', icon: '🚨', codes: ['P0420','P0171','P0300','P0442'] },
  { label: 'حرارة مرتفعة', icon: '🌡️', codes: ['P0217','P0115','P0118','P0128'] },
  { label: 'ضغط الزيت', icon: '🛢️', codes: ['P0524','P0520'] },
  { label: 'مشكلة الجير', icon: '⚙️', codes: ['P0700','P0715','P0720','P0730','P0741'] },
  { label: 'خمول غير مستقر', icon: '📉', codes: ['P0505','P0171','P0300'] },
  { label: 'الفرامل', icon: '🛑', codes: ['C0035','C0040','C0045','C0050','U0121'] }
];

const POPULAR = ['P0300','P0171','P0420','P0128','P0442','P0455','P0301','P0174','U0100','P0299','P2002','C0035'];

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}

function sanitizeCode(s) {
  if (s == null) return '';
  return String(s).toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20);
}

export function isFav(c) {
  return user.favorites.indexOf(sanitizeCode(c)) >= 0;
}

export function toggleFav(c) {
  const x = sanitizeCode(c);
  const i = user.favorites.indexOf(x);
  if (i >= 0) user.favorites.splice(i, 1); else user.favorites.push(x);
  localStorage.setItem('checkdiga_favs', JSON.stringify(user.favorites));
  updFavCount();
  return isFav(x);
}

export function updFavCount() {
  const e = document.getElementById('favCount');
  if (!e) return;
  if (user.favorites.length) {
    e.textContent = user.favorites.length;
    e.classList.remove('hidden');
  } else e.classList.add('hidden');
}

export function renderFav() {
  const l = document.getElementById('favoritesList');
  if (!l) return;
  if (!user.favorites.length) {
    l.innerHTML = '<p class="text-gray-500 text-center py-6">لا توجد أكواد في المفضلة</p>';
    return;
  }
  let h = '<div class="space-y-2">';
  user.favorites.forEach(c => {
    const i = getInfo(c);
    h += '<div class="code-card bg-gray-900 rounded-xl p-3" data-code="' + c + '">';
    h += '<div class="flex items-center justify-between gap-2 mb-1">';
    h += '<span class="font-mono font-bold text-amber-400">' + c + '</span>';
    h += '<button class="text-red-400 text-xs" data-rm-fav="' + c + '">حذف</button>';
    h += '</div>';
    h += '<div class="text-xs text-gray-400">' + escapeHtml(i.title) + '</div>';
    h += '</div>';
  });
  h += '</div>';
  l.innerHTML = h;
  l.querySelectorAll('[data-rm-fav]').forEach(b => {
    b.onclick = function (e) {
      e.stopPropagation();
      toggleFav(b.dataset.rmFav);
      renderFav();
    };
  });
}
export function initSymp() {
  const e = document.getElementById('symptomChips');
  if (!e) return;
  let h = '';
  SYMPTOMS_DB.forEach((s, i) => {
    h += '<button class="symptom-chip" data-sym="' + i + '">' + s.icon + ' ' + escapeHtml(s.label) + '</button>';
  });
  e.innerHTML = h;
  e.querySelectorAll('[data-sym]').forEach(b => {
    b.onclick = () => showSymp(parseInt(b.dataset.sym, 10));
  });
}

function showSymp(i) {
  const s = SYMPTOMS_DB[i];
  if (!s) return;
  const d = document.getElementById('searchResults');
  const c = document.getElementById('searchCount');
  if (!d) return;
  let h = '<div class="bg-purple-900/30 rounded-xl p-3 mb-3 border-r-4 border-purple-500"><div class="font-bold text-sm text-purple-200">' + s.icon + ' ' + escapeHtml(s.label) + '</div></div><div class="space-y-2">';
  s.codes.forEach(cd => {
    const inf = getInfo(cd);
    const cl = { critical: '#dc2626', high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[inf.severity] || '#64748b';
    h += '<div class="code-card bg-gray-900 rounded-xl p-3 flex items-center gap-3" data-code="' + cd + '">';
    h += '<div class="w-1 self-stretch rounded-full" style="background:' + cl + '"></div>';
    h += '<div class="flex-1"><div class="font-mono font-bold text-red-300 text-sm">' + cd + '</div>';
    h += '<div class="text-xs text-gray-400">' + escapeHtml(inf.title) + '</div></div>';
    h += '</div>';
  });
  h += '</div>';
  d.innerHTML = h;
  if (c) c.textContent = '(' + s.codes.length + ')';
}

export function initPop() {
  const e = document.getElementById('popularCodes');
  if (!e) return;
  e.innerHTML = POPULAR.map(c => {
    const i = getInfo(c);
    return '<button class="code-card bg-gray-900 rounded-xl p-2.5 text-right" data-code="' + c + '"><div class="font-mono font-bold text-red-300 text-xs">' + c + '</div><div class="text-[10px] text-gray-500 truncate">' + escapeHtml(i.title) + '</div></button>';
  }).join('');
  e.querySelectorAll('[data-code]').forEach(b => {
    b.onclick = () => showDetail(b.dataset.code);
  });
}

export function initFamily() {
  const e = document.getElementById('familyBrowser');
  if (!e) return;
  const fs = [
    { k: 'P0', l: 'P0xxx المحرك', i: '⚙️', c: '#3b82f6' },
    { k: 'P1', l: 'P1xxx مصنّعين', i: '🏭', c: '#8b5cf6' },
    { k: 'P2', l: 'P2xxx محرك SAE', i: '🔧', c: '#a855f7' },
    { k: 'P3', l: 'P3xxx صيني', i: '🇨🇳', c: '#ec4899' },
    { k: 'B0', l: 'B0xxx الهيكل', i: '🚗', c: '#f59e0b' },
    { k: 'C0', l: 'C0xxx الشاسيه', i: '🛑', c: '#ef4444' },
    { k: 'U0', l: 'U0xxx الشبكة', i: '📡', c: '#10b981' },
    { k: 'U3', l: 'U3xxx كهربائي', i: '⚡', c: '#06b6d4' }
  ];
  e.innerHTML = fs.map(f => '<button class="code-card bg-gray-900 rounded-xl p-3 text-right border-l-4" style="border-color:' + f.c + '" data-fam="' + f.k + '"><div class="font-bold text-xs" style="color:' + f.c + '">' + f.i + ' ' + f.l + '</div></button>').join('');
  e.querySelectorAll('[data-fam]').forEach(b => {
    b.onclick = () => browseFam(b.dataset.fam);
  });
}

function browseFam(p) {
  const d = document.getElementById('searchResults');
  const c = document.getElementById('searchCount');
  if (!d) return;
  const res = [];
  for (const k of Object.keys(DTC_DATABASE)) {
    if (k.split('_')[0].toUpperCase().startsWith(p)) res.push(k);
    if (res.length >= 80) break;
  }
  if (!res.length) {
    d.innerHTML = '<p class="text-xs text-gray-500 text-center py-2">لا توجد نتائج</p>';
    return;
  }
  let h = '<div class="text-xs text-gray-400 mb-2">عائلة ' + p + 'xxx — ' + res.length + ' عطل</div><div class="space-y-1">';
  res.forEach(cd => {
    const i = getInfo(cd);
    h += '<div class="code-card bg-gray-900 rounded-lg p-2 text-xs flex justify-between items-center" data-code="' + cd + '">';
    h += '<span><span class="font-mono text-red-300 font-bold">' + cd + '</span> — ' + escapeHtml(i.title) + '</span>';
    h += '</div>';
  });
  h += '</div>';
  d.innerHTML = h;
  if (c) c.textContent = '(' + res.length + ')';
}

export function initSevFilters() {
  const e = document.getElementById('severityFilters');
  if (!e) return;
  e.querySelectorAll('[data-severity]').forEach(b => {
    b.onclick = function () {
      e.querySelectorAll('[data-severity]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    };
  });
}

export function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = function () {
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('bg-blue-600', 'text-white');
        t.classList.add('bg-gray-800', 'text-gray-400');
      });
      tab.classList.remove('bg-gray-800', 'text-gray-400');
      tab.classList.add('bg-blue-600', 'text-white');
      document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
      const target = document.getElementById('panel-' + tab.dataset.tab);
      if (target) target.classList.remove('hidden');
      if (tab.dataset.tab === 'favorites') renderFav();
      if (tab.dataset.tab === 'history') renderHist();
      if (tab.dataset.tab === 'stats') renderStats();
    };
  });
}

export function renderHist() {
  const c = document.getElementById('historyContent');
  if (!c) return;
  let h = [];
  try { h = JSON.parse(localStorage.getItem('checkdiga_hist') || '[]'); } catch (_) { h = []; }
  if (!h.length) {
    c.innerHTML = '<p class="text-gray-500 text-center py-6">لا يوجد سجل بعد</p>';
    return;
  }
  let html = '';
  h.forEach(e => {
    const d = new Date(e.date);
    html += '<div class="bg-gray-900 rounded-xl p-3 mb-2 border-r-4 border-blue-500">';
    html += '<div class="flex justify-between mb-2"><span class="text-xs text-gray-400">' + d.toLocaleDateString('ar') + ' ' + d.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) + '</span>';
    html += '<span class="text-xs text-blue-400 font-bold">' + e.faults.length + ' عطل</span></div>';
    html += '<div class="flex flex-wrap gap-1">';
    e.faults.slice(0, 10).forEach(f => {
      html += '<span class="font-mono text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">' + f.code + '</span>';
    });
    html += '</div></div>';
  });
  c.innerHTML = html;
}

export function clearHist() {
  if (confirm('حذف السجل بالكامل؟')) {
    localStorage.removeItem('checkdiga_hist');
    renderHist();
  }
}

export function renderStats() {
  const c = document.getElementById('statsContent');
  if (!c) return;
  const tot = Object.keys(DTC_DATABASE).length;
  const sev = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const k of Object.keys(DTC_DATABASE)) {
    const s = DTC_DATABASE[k].severity || 'medium';
    if (sev[s] !== undefined) sev[s]++;
  }
  c.innerHTML = '<div class="text-center mb-4"><div class="text-5xl font-extrabold text-blue-400">' + tot.toLocaleString('en-US') + '</div><div class="text-xs text-gray-400">عطل في القاعدة</div></div>'
    + '<div class="grid grid-cols-2 gap-2 mb-3">'
    + '<div class="bg-gray-900 rounded-lg p-2 text-center"><div class="text-red-400 font-bold">' + sev.critical + '</div><div class="text-[10px] text-gray-500">حرج</div></div>'
    + '<div class="bg-gray-900 rounded-lg p-2 text-center"><div class="text-orange-400 font-bold">' + sev.high + '</div><div class="text-[10px] text-gray-500">خطير</div></div>'
    + '<div class="bg-gray-900 rounded-lg p-2 text-center"><div class="text-amber-400 font-bold">' + sev.medium + '</div><div class="text-[10px] text-gray-500">متوسط</div></div>'
    + '<div class="bg-gray-900 rounded-lg p-2 text-center"><div class="text-emerald-400 font-bold">' + sev.low + '</div><div class="text-[10px] text-gray-500">منخفض</div></div>'
    + '</div>';
}

export function showDetail(cod) {
  cod = String(cod);
  const isBranded = /_[A-Z]+$/.test(cod);
  const cleanCode = sanitizeCode(cod.replace(/_[A-Z]+$/, ''));
  const info = isBranded ? (DTC_DATABASE[cod] || getInfo(cleanCode)) : getInfo(cod);
  const m = document.getElementById('dtcDetailModal');
  const c = document.getElementById('dtcDetailContent');
  if (!m || !c) return;
  const sm = { critical: { bg: '#dc2626', l: 'حرج' }, high: { bg: '#ef4444', l: 'خطير' }, medium: { bg: '#f59e0b', l: 'متوسط' }, low: { bg: '#10b981', l: 'منخفض' } };
  const sv = sm[info.severity] || { bg: '#64748b', l: 'غير محدد' };
  let h = '<div class="text-center mb-4"><div class="font-mono font-bold text-3xl text-red-400 mb-1">' + escapeHtml(cleanCode) + '</div>';
  h += '<div class="text-base font-bold text-white">' + escapeHtml(info.title || 'عطل غير معروف') + '</div>';
  if (info.title_en && info.title_en !== info.title) h += '<div class="text-xs text-gray-500 mt-1" dir="ltr">' + escapeHtml(info.title_en) + '</div>';
  h += '<div class="flex justify-center gap-2 mt-3 flex-wrap"><span class="text-xs px-3 py-1 rounded-full text-white font-bold" style="background:' + sv.bg + '">' + sv.l + '</span>';
  if (info.zone) h += '<span class="text-xs px-3 py-1 rounded-full bg-blue-600 text-white font-bold">' + escapeHtml(info.zone) + '</span>';
  if (info.brand) h += '<span class="text-xs px-3 py-1 rounded-full bg-purple-600 text-white font-bold">🏭 ' + escapeHtml(info.brand) + '</span>';
  h += '</div></div>';
  if (info.desc) h += '<div class="bg-gray-900/60 rounded-xl p-4 mb-3 border-r-4 border-blue-500"><div class="text-xs text-gray-300">' + escapeHtml(info.desc) + '</div></div>';
  const blk = (it, t, col) => {
    if (!it || !it.length) return '';
    return '<div class="bg-gray-900/60 rounded-xl p-4 mb-3 border-r-4" style="border-color:' + col + '"><div class="font-bold text-sm mb-2" style="color:' + col + '">' + t + '</div><ul class="space-y-1.5">' + it.map(i => '<li class="text-xs text-gray-300">• ' + escapeHtml(i) + '</li>').join('') + '</ul></div>';
  };
  h += blk(info.symptoms, '🔴 الأعراض', '#ef4444');
  h += blk(info.causes, '⚙️ الأسباب المحتملة', '#f59e0b');
  h += blk(info.steps, '📋 خطوات الفحص', '#10b981');
  c.innerHTML = h;
  m.classList.remove('hidden');
}

export function renderHist() {
  const c = document.getElementById('historyContent');
  if (!c) return;
  let h = [];
  try { h = JSON.parse(localStorage.getItem('checkdiga_hist') || '[]'); } catch (_) { h = []; }
  if (!h.length) {
    c.innerHTML = '<p class="text-gray-500 text-center py-6">لا يوجد سجل بعد</p>';
    return;
  }
  let html = '';
  h.forEach(e => {
    const d = new Date(e.date);
    html += '<div class="bg-gray-900 rounded-xl p-3 mb-2 border-r-4 border-blue-500">';
    html += '<div class="flex justify-between mb-2"><span class="text-xs text-gray-400">' + d.toLocaleDateString('ar') + ' ' + d.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) + '</span>';
    html += '<span class="text-xs text-blue-400 font-bold">' + e.faults.length + ' عطل</span></div>';
    html += '<div class="flex flex-wrap gap-1">';
    e.faults.slice(0, 10).forEach(f => {
      html += '<span class="font-mono text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">' + f.code + '</span>';
    });
    html += '</div></div>';
  });
  c.innerHTML = html;
}

export function clearHist() {
  if (confirm('حذف السجل بالكامل؟')) {
    localStorage.removeItem('checkdiga_hist');
    renderHist();
  }
}

export function renderStats() {
  const c = document.getElementById('statsContent');
  if (!c) return;
  const tot = Object.keys(DTC_DATABASE).length;
  const sev = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const k of Object.keys(DTC_DATABASE)) {
    const s = DTC_DATABASE[k].severity || 'medium';
    if (sev[s] !== undefined) sev[s]++;
  }
  c.innerHTML = '<div class="text-center mb-4"><div class="text-5xl font-extrabold text-blue-400">' + tot.toLocaleString('en-US') + '</div><div class="text-xs text-gray-400">عطل في القاعدة</div></div>'
    + '<div class="grid grid-cols-2 gap-2 mb-3">'
    + '<div class="bg-gray-900 rounded-lg p-2 text-center"><div class="text-red-400 font-bold">' + sev.critical + '</div><div class="text-[10px] text-gray-500">حرج</div></div>'
    + '<div class="bg-gray-900 rounded-lg p-2 text-center"><div class="text-orange-400 font-bold">' + sev.high + '</div><div class="text-[10px] text-gray-500">خطير</div></div>'
    + '<div class="bg-gray-900 rounded-lg p-2 text-center"><div class="text-amber-400 font-bold">' + sev.medium + '</div><div class="text-[10px] text-gray-500">متوسط</div></div>'
    + '<div class="bg-gray-900 rounded-lg p-2 text-center"><div class="text-emerald-400 font-bold">' + sev.low + '</div><div class="text-[10px] text-gray-500">منخفض</div></div>'
    + '</div>';
}

export function showDetail(cod) {
  cod = String(cod);
  const isBranded = /_[A-Z]+$/.test(cod);
  const cleanCode = sanitizeCode(cod.replace(/_[A-Z]+$/, ''));
  const info = isBranded ? (DTC_DATABASE[cod] || getInfo(cleanCode)) : getInfo(cod);
  const m = document.getElementById('dtcDetailModal');
  const c = document.getElementById('dtcDetailContent');
  if (!m || !c) return;
  const sm = { critical: { bg: '#dc2626', l: 'حرج' }, high: { bg: '#ef4444', l: 'خطير' }, medium: { bg: '#f59e0b', l: 'متوسط' }, low: { bg: '#10b981', l: 'منخفض' } };
  const sv = sm[info.severity] || { bg: '#64748b', l: 'غير محدد' };
  let h = '<div class="text-center mb-4"><div class="font-mono font-bold text-3xl text-red-400 mb-1">' + escapeHtml(cleanCode) + '</div>';
  h += '<div class="text-base font-bold text-white">' + escapeHtml(info.title || 'عطل غير معروف') + '</div>';
  if (info.title_en && info.title_en !== info.title) h += '<div class="text-xs text-gray-500 mt-1" dir="ltr">' + escapeHtml(info.title_en) + '</div>';
  h += '<div class="flex justify-center gap-2 mt-3 flex-wrap"><span class="text-xs px-3 py-1 rounded-full text-white font-bold" style="background:' + sv.bg + '">' + sv.l + '</span>';
  if (info.zone) h += '<span class="text-xs px-3 py-1 rounded-full bg-blue-600 text-white font-bold">' + escapeHtml(info.zone) + '</span>';
  if (info.brand) h += '<span class="text-xs px-3 py-1 rounded-full bg-purple-600 text-white font-bold">🏭 ' + escapeHtml(info.brand) + '</span>';
  h += '</div></div>';
  if (info.desc) h += '<div class="bg-gray-900/60 rounded-xl p-4 mb-3 border-r-4 border-blue-500"><div class="text-xs text-gray-300">' + escapeHtml(info.desc) + '</div></div>';
  const blk = (it, t, col) => {
    if (!it || !it.length) return '';
    return '<div class="bg-gray-900/60 rounded-xl p-4 mb-3 border-r-4" style="border-color:' + col + '"><div class="font-bold text-sm mb-2" style="color:' + col + '">' + t + '</div><ul class="space-y-1.5">' + it.map(i => '<li class="text-xs text-gray-300">• ' + escapeHtml(i) + '</li>').join('') + '</ul></div>';
  };
  h += blk(info.symptoms, '🔴 الأعراض', '#ef4444');
  h += blk(info.causes, '⚙️ الأسباب المحتملة', '#f59e0b');
  h += blk(info.steps, '📋 خطوات الفحص', '#10b981');
  c.innerHTML = h;
  m.classList.remove('hidden');
}
