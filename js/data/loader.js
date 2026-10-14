import { DTC_DATABASE, buildDTCIndex, buildSearchIndex } from './database.js';
import { app } from '../state.js';

const OBDEX_BASE = "https://cdn.jsdelivr.net/gh/foerbsnavi/OBDex@main/data/generic/";
const OBDEX_FILES = [
  'P0xxx_enriched.yaml', 'P1xxx_enriched.yaml', 'P2xxx_enriched.yaml',
  'P3xxx_enriched.yaml', 'B0xxx_enriched.yaml', 'C0xxx_enriched.yaml',
  'U0xxx_enriched.yaml', 'U3xxx_enriched.yaml'
];

const QUICK_FILES = [
  'dtc_p.json', 'dtc_b.json', 'dtc_c.json', 'dtc_u.json',
  'dtc_full.json', 'dtc_modern.json', 'dtc_core.json'
];

const SLOW_FILES = [
  'dtc_european.json', 'dtc_european2.json',
  'dtc_chinese.json', 'dtc_chinese2.json',
  'dtc_chinese3.json', 'dtc_chinese4.json'
];

// 💾 Cache constants
const CACHE_KEY = 'digascaner_obdex_v1';
const CACHE_TIME_KEY = 'digascaner_obdex_time_v1';
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 أيام

function log(msg) {
  const c = document.getElementById('console');
  if (!c) return;
  const t = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  c.textContent += '\n[' + t + '] ' + msg;
  c.scrollTop = c.scrollHeight;
}

function updateCount() {
  const tot = Object.keys(DTC_DATABASE).length;
  if (tot < 10000) return tot;
  const fmt = tot.toLocaleString('en-US');
  const e1 = document.getElementById('heroCount');
  const e2 = document.getElementById('statCodes');
  if (e1) e1.textContent = fmt;
  if (e2) e2.textContent = fmt;
  return tot;
}

function mapCat(c) {
  if (!c) return 'engine';
  c = String(c).toLowerCase();
  return { powertrain: 'engine', body: 'electronics', chassis: 'brakes', network: 'electronics' }[c] || 'engine';
}

function mapCatFromCode(c) {
  const ch = String(c).charAt(0).toUpperCase();
  return { P: 'engine', B: 'electronics', C: 'brakes', U: 'electronics' }[ch] || 'engine';
}

function convItem(it) {
  if (!it || !it.code) return null;
  const code = String(it.code).toUpperCase().trim();
  if (!code || code === 'P0000') return null;
  const tAr = (it.title && it.title.ar) ? it.title.ar : '';
  const tEn = (it.title && it.title.en) ? it.title.en : (typeof it.title === 'string' ? it.title : code);
  let dAr = '', dEn = '';
  if (it.description) {
    if (typeof it.description === 'object') { dAr = it.description.ar || ''; dEn = it.description.en || ''; }
    else dEn = String(it.description);
  }
  if (!dAr && it.desc) dAr = String(it.desc);
  return {
    zone: it.zone || mapCat(it.category),
    title: tAr || tEn || code,
    title_en: tEn,
    desc: dAr || dEn,
    severity: it.severity || 'medium',
    brand: it.brand || undefined,
    symptoms: Array.isArray(it.symptoms) ? it.symptoms : [],
    causes: Array.isArray(it.common_causes) ? it.common_causes : [],
    steps: Array.isArray(it.steps) ? it.steps : [],
    repair: it.repair || {},
    related: Array.isArray(it.related_codes) ? it.related_codes : []
  };
}

// ✅ الحل 2: بدون ?t= — يستفيد من كاش المتصفح
async function fetchLocalJSON(fn) {
  try {
    const r = await fetch('./' + fn);
    if (!r.ok) return [];
    const d = await r.json();
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.codes)) return d.codes;
    if (d && Array.isArray(d.data)) return d.data;
    if (d && typeof d === 'object') {
      return Object.entries(d).map(([k, v]) => {
        if (v && typeof v === 'object') return { code: k, ...v };
        return { code: k, title: String(v) };
      });
    }
    return [];
  } catch (_) { return []; }
}

async function fetchYaml(fn) {
  try {
    const r = await fetch(OBDEX_BASE + fn);
    if (!r.ok) return [];
    const t = await r.text();
    if (!window.jsyaml) return [];
    let d = window.jsyaml.load(t);
    if (!d) return [];
    if (!Array.isArray(d)) {
      const arr = [];
      for (const k of Object.keys(d)) {
        const v = d[k];
        if (v && typeof v === 'object') { if (!v.code) v.code = k; arr.push(v); }
      }
      d = arr;
    }
    return d;
  } catch (_) { return []; }
}

function addItems(items, opts) {
  opts = opts || {};
  let added = 0;
  for (const item of items) {
    const cd = String(item.code || '').toUpperCase().trim();
    if (!cd || DTC_DATABASE[cd]) continue;
    const lv = convItem(item);
    if (!lv) continue;
    if (opts.isChinese && !lv.brand) lv.brand = '🇨🇳 صيني';
    if (opts.isEuro && !lv.brand) lv.brand = '🇪🇺 أوروبي';
    DTC_DATABASE[cd] = lv;
    added++;
  }
  return added;
}

// ✅ الحل 1: حفظ OBDex في localStorage
function saveOBDexCache() {
  try {
    const obdexData = {};
    let count = 0;
    for (const k of Object.keys(DTC_DATABASE)) {
      const info = DTC_DATABASE[k];
      // احفظ فقط الأكواد من OBDex (التي ليس لها brand محلي)
      if (info && !info._local) {
        obdexData[k] = info;
        count++;
      }
    }
    if (count < 100) return; // لا داعي لحفظ قليل
    const json = JSON.stringify(obdexData);
    // إذا كبير جداً — تجاهل
    if (json.length > 4.5 * 1024 * 1024) {
      log('INFO: Cache كبير جداً — تجاهل');
      return;
    }
    localStorage.setItem(CACHE_KEY, json);
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    log('OK: حفظ OBDex في الكاش (' + count + ' كود)');
  } catch (e) {
    log('WARN: فشل حفظ Cache — ' + e.message);
  }
}

function loadOBDexCache() {
  try {
    const timeStr = localStorage.getItem(CACHE_TIME_KEY);
    if (!timeStr) return 0;
    const time = parseInt(timeStr, 10);
    if (Date.now() - time > CACHE_MAX_AGE) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);
      return 0;
    }
    const json = localStorage.getItem(CACHE_KEY);
    if (!json) return 0;
    const data = JSON.parse(json);
    let count = 0;
    for (const k of Object.keys(data)) {
      if (!DTC_DATABASE[k]) {
        DTC_DATABASE[k] = data[k];
        count++;
      }
    }
    return count;
  } catch (_) { return 0; }
}

async function loadWal33D() {
  let db = null;
  try {
    if (typeof initSqlJs !== 'function') return 0;
    log('INFO: Wal33D...');
    const SQL = await initSqlJs({ locateFile: f => 'https://cdn.jsdelivr.net/npm/sql.js@1.10.2/dist/' + f });
    const resp = await fetch('./dtc_codes_v0.1.0.db');
    if (!resp.ok) return 0;
    const buf = await resp.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buf));
    const tRes = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tables = (tRes[0] && tRes[0].values) ? tRes[0].values.flat() : [];
    if (!tables.length) return 0;
    const mainTable = tables.find(x => /dtc|codes|trouble|fault/i.test(x)) || tables[0];
    const cRes = db.exec('PRAGMA table_info(' + mainTable + ')');
    const colNames = (cRes[0] && cRes[0].values) ? cRes[0].values.map(r => r[1]) : [];
    const codeCol = colNames.find(c => /^(code|dtc|dtc_code|fault_code)$/i.test(c)) || colNames[0];
    const descCol = colNames.find(c => /^(description|desc|title|name|text)$/i.test(c)) || colNames[1];
    const makeCol = colNames.find(c => /^(make|manufacturer|brand|oem|mfr)$/i.test(c));
    const q = makeCol
      ? 'SELECT ' + codeCol + ' AS code, ' + descCol + ' AS title, ' + makeCol + ' AS make FROM ' + mainTable
      : 'SELECT ' + codeCol + ' AS code, ' + descCol + ' AS title FROM ' + mainTable;
    const r = db.exec(q);
    if (!r[0]) return 0;
    const cols = r[0].columns;
    const rows = r[0].values.map(row => {
      const o = {}; cols.forEach((c, i) => o[c] = row[i]); return o;
    });
    let added = 0;
    for (const row of rows) {
      const cd = String(row.code || '').toUpperCase().trim();
      if (!cd || cd.length < 4 || cd.length > 10) continue;
      if (DTC_DATABASE[cd]) continue;
      const title = String(row.title || '').trim();
      if (!title) continue;
      const make = row.make ? String(row.make).trim() : '';
      DTC_DATABASE[cd] = {
        zone: mapCatFromCode(cd),
        title: title.length > 90 ? title.slice(0, 90) : title,
        title_en: title,
        desc: title,
        severity: 'medium',
        brand: make || undefined
      };
      added++;
    }
    log('OK: Wal33D — ' + added + ' كود');
    return added;
  } catch (e) {
    log('ERR: Wal33D — ' + e.message);
    return 0;
  } finally {
    if (db) try { db.close(); } catch (_) {}
  }
}

export async function loadFullDatabase() {
  if (app.obdexLoaded) return;

  const b = document.getElementById('dbStatus');
  const bt = document.getElementById('dbStatusText');
  if (b) b.style.display = 'block';

  log('INFO: تحميل الملفات المحلية...');
  if (bt) bt.textContent = 'تحميل الملفات المحلية...';

  // الملفات السريعة
  for (const f of QUICK_FILES) {
    const items = await fetchLocalJSON(f);
    if (items.length) {
      for (const item of items) {
        const cd = String(item.code || '').toUpperCase().trim();
        if (!cd || DTC_DATABASE[cd]) continue;
        const lv = convItem(item);
        if (!lv) continue;
        lv._local = true;
        DTC_DATABASE[cd] = lv;
      }
    }
  }
  buildDTCIndex();
  buildSearchIndex();
  updateCount();
  log('OK: محلي — ' + Object.keys(DTC_DATABASE).length + ' كود');

  // الملفات الإقليمية
  if (bt) bt.textContent = 'تحميل الملفات الإقليمية...';
  for (const f of SLOW_FILES) {
    const items = await fetchLocalJSON(f);
    if (!items.length) continue;
    const isEuro = f.indexOf('european') >= 0;
    const isChinese = f.indexOf('chinese') >= 0;
    for (const item of items) {
      const cd = String(item.code || '').toUpperCase().trim();
      if (!cd || DTC_DATABASE[cd]) continue;
      const lv = convItem(item);
      if (!lv) continue;
      if (isChinese && !lv.brand) lv.brand = '🇨🇳 صيني';
      if (isEuro && !lv.brand) lv.brand = '🇪🇺 أوروبي';
      lv._local = true;
      DTC_DATABASE[cd] = lv;
    }
  }
  buildDTCIndex();
  buildSearchIndex();
  updateCount();
  log('OK: إقليمي — ' + Object.keys(DTC_DATABASE).length + ' كود');

  if (b) b.style.display = 'none';

  // 🚀 تحميل OBDex — أولاً من الكاش
  setTimeout(async () => {
    // جرب الكاش أولاً
    const cachedCount = loadOBDexCache();
    if (cachedCount > 100) {
      log('OK: OBDex من الكاش — ' + cachedCount + ' كود');
      buildDTCIndex();
      buildSearchIndex();
      updateCount();
      // شغّل Wal33D فقط
      log('INFO: Wal33D في الخلفية...');
      await loadWal33D();
      app.obdexLoaded = true;
      buildDTCIndex();
      buildSearchIndex();
      const tot = updateCount();
      log('OK: الإجمالي النهائي: ' + tot);
      return;
    }

    // لم يوجد كاش → حمّل من CDN
    log('INFO: OBDex CDN في الخلفية...');
    let obdexCount = 0;
    for (let f = 0; f < OBDEX_FILES.length; f++) {
      const items = await fetchYaml(OBDEX_FILES[f]);
      if (items.length) obdexCount += addItems(items);
    }
    log('OK: OBDex — ' + obdexCount + ' كود');

    log('INFO: Wal33D في الخلفية...');
    await loadWal33D();

    app.obdexLoaded = true;
    buildDTCIndex();
    buildSearchIndex();
    const tot = updateCount();
    log('OK: الإجمالي النهائي: ' + tot);

    // احفظ في الكاش للزيارة القادمة
    saveOBDexCache();
  }, 500);
}
