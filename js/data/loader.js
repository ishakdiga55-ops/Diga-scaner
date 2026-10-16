/* ============================================
   CheckDiga Pro — Smart Loader with IndexedDB Cache
   ============================================ */

import { DTC_DATABASE, buildDTCIndex, buildSearchIndex } from './database.js';
import { app } from '../state.js';

const OBDEX_BASE = "https://raw.githack.com/foerbsnavi/OBDex/main/data/generic/";
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

/* --- IndexedDB Cache Helpers --- */
const DB_NAME = 'CheckDigaCacheDB';
const STORE_NAME = 'codesStore';

function openCacheDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getCachedDB() {
  try {
    const db = await openCacheDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('full_database');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (_) {
    return null;
  }
}

async function saveCachedDB(dataObj) {
  try {
    const db = await openCacheDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(dataObj, 'full_database');
  } catch (e) {
    console.warn('Cache save failed:', e);
  }
}

function log(msg) {
  const c = document.getElementById('console');
  if (!c) return;
  const t = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  c.textContent += '\n[' + t + '] ' + msg;
  c.scrollTop = c.scrollHeight;
}

function updateCount() {
  const tot = Object.keys(DTC_DATABASE).length;
  if (tot < 1000) return tot;
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
    lv._local = opts.isLocal ? true : undefined;
    DTC_DATABASE[cd] = lv;
    added++;
  }
  return added;
}

async function loadWal33D() {
  let db = null;
  try {
    if (typeof initSqlJs !== 'function') return 0;
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
    return added;
  } catch (_) {
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

  // ⚡ الخطوة 0: فحص التخزين المؤقت المحلي (IndexedDB Cache) للفتح الفوري
  const cachedData = await getCachedDB();
  if (cachedData && typeof cachedData === 'object' && Object.keys(cachedData).length > 100) {
    Object.assign(DTC_DATABASE, cachedData);
    buildDTCIndex();
    buildSearchIndex();
    updateCount();
    app.obdexLoaded = true;
    if (b) b.style.display = 'none';
    log('⚡ تم التحميل الفوري من الكاش المحلي!');
    return;
  }

  // ⚡ المرحلة 1: الملفات المحلية السريعة
  log('INFO: تحميل الملفات المحلية...');
  if (bt) bt.textContent = 'تحميل الملفات المحلية...';

  for (const f of QUICK_FILES) {
    const items = await fetchLocalJSON(f);
    if (items.length) addItems(items, { isLocal: true });
  }
  buildDTCIndex();
  buildSearchIndex();
  updateCount();

  // ⚡ المرحلة 2: الملفات الإقليمية
  if (bt) bt.textContent = 'تحميل الملفات الإقليمية...';
  const slowResults = await Promise.all(
    SLOW_FILES.map(async (f) => {
      const items = await fetchLocalJSON(f);
      return { f, items };
    })
  );
  for (const { f, items } of slowResults) {
    if (!items.length) continue;
    const isEuro = f.indexOf('european') >= 0;
    const isChinese = f.indexOf('chinese') >= 0;
    addItems(items, { isEuro, isChinese, isLocal: true });
  }
  buildDTCIndex();
  buildSearchIndex();
  updateCount();

  if (b) b.style.display = 'none';

  // حفظ النسخة الأولية في الكاش لفتحها بسرعة في المرة القادمة
  saveCachedDB(DTC_DATABASE);

  // 🚀 المرحلة 3: OBDex CDN و Wal33D في الخلفية
  setTimeout(async () => {
    let obdexCount = 0;
    const results = await Promise.all(
      OBDEX_FILES.map(async (f) => await fetchYaml(f))
    );
    for (const items of results) {
      if (items && items.length) obdexCount += addItems(items);
    }
    await loadWal33D();

    app.obdexLoaded = true;
    buildDTCIndex();
    buildSearchIndex();
    updateCount();
    
    // تحديث الكاش بالبيانات الكاملة الجديدة
    saveCachedDB(DTC_DATABASE);
    log('OK: اكتمل تحميل قاعدة البيانات بالكامل وحفظها محلياً.');
  }, 500);
}
