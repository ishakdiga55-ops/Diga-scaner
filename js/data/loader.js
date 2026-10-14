import { DTC_DATABASE, buildDTCIndex, buildSearchIndex } from './database.js';
import { app } from '../state.js';

const OBDEX_BASE = "https://cdn.jsdelivr.net/gh/foerbsnavi/OBDex@main/data/generic/";
const OBDEX_FILES = [
  'P0xxx_enriched.yaml', 'P1xxx_enriched.yaml', 'P2xxx_enriched.yaml',
  'P3xxx_enriched.yaml', 'B0xxx_enriched.yaml', 'C0xxx_enriched.yaml',
  'U0xxx_enriched.yaml', 'U3xxx_enriched.yaml'
];
const LOCAL_FILES = [
  'dtc_p.json', 'dtc_b.json', 'dtc_c.json', 'dtc_u.json',
  'dtc_modern.json', 'dtc_full.json',
  'dtc_european.json', 'dtc_european2.json',
  'dtc_chinese.json', 'dtc_chinese2.json',
  'dtc_chinese3.json', 'dtc_chinese4.json'
];

function log(msg) {
  const c = document.getElementById('console');
  if (!c) return;
  const t = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  c.textContent += '\n[' + t + '] ' + msg;
  c.scrollTop = c.scrollHeight;
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
    const r = await fetch('./' + fn + '?t=' + Date.now());
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

function processInChunks(items, fn, cs) {
  cs = cs || 300;
  return new Promise(resolve => {
    let i = 0;
    function next() {
      const end = Math.min(i + cs, items.length);
      for (; i < end; i++) fn(items[i]);
      if (i < items.length) {
        if (window.requestIdleCallback) requestIdleCallback(next, { timeout: 50 });
        else setTimeout(next, 0);
      } else resolve();
    }
    next();
  });
}

async function loadWal33D() {
  let db = null;
  try {
    if (typeof initSqlJs !== 'function') { log('WARN: sql.js غير محمّلة'); return 0; }
    log('INFO: Wal33D — تحميل قاعدة المصنّعين...');
    const SQL = await initSqlJs({ locateFile: f => 'https://cdn.jsdelivr.net/npm/sql.js@1.10.2/dist/' + f });
    const resp = await fetch('./dtc_codes_v0.1.0.db');
    if (!resp.ok) { log('INFO: ملف Wal33D غير موجود'); return 0; }
    const buf = await resp.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buf));
    log('OK: Wal33D — DB محمّلة');
    const tRes = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tables = (tRes[0] && tRes[0].values) ? tRes[0].values.flat() : [];
    if (!tables.length) return 0;
    const mainTable = tables.find(x => /dtc|codes|trouble|fault/i.test(x)) || tables[0];
    const cRes = db.exec('PRAGMA table_info(' + mainTable + ')');
    const colNames = (cRes[0] && cRes[0].values) ? cRes[0].values.map(r => r[1]) : [];
    const codeCol = colNames.find(c => /^(code|dtc|dtc_code|fault_code)$/i.test(c)) || colNames.find(c => /code/i.test(c)) || colNames[0];
    const descCol = colNames.find(c => /^(description|desc|title|name|text)$/i.test(c)) || colNames.find(c => /desc|title|name|text/i.test(c)) || colNames[1];
    const makeCol = colNames.find(c => /^(make|manufacturer|brand|oem|mfr)$/i.test(c)) || colNames.find(c => /make|manuf|brand|oem/i.test(c));
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
    await processInChunks(rows, row => {
      const cd = String(row.code || '').toUpperCase().trim();
      if (!cd || cd.length < 4 || cd.length > 10) return;
      if (DTC_DATABASE[cd]) return;
      const title = String(row.title || '').trim();
      if (!title) return;
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
    });
    log('OK: Wal33D — ' + added + ' كود جديد');
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

  let obdexAdded = 0, localAdded = 0;

  // 1. OBDex CDN
  log('INFO: مرحلة 1/3 — OBDex CDN...');
  if (!window.jsyaml) {
    log('WARN: js-yaml غير متاح');
  } else {
    for (let f = 0; f < OBDEX_FILES.length; f++) {
      if (bt) bt.textContent = 'OBDex: ' + OBDEX_FILES[f] + ' (' + (f + 1) + '/' + OBDEX_FILES.length + ')';
      const items = await fetchYaml(OBDEX_FILES[f]);
      if (!items.length) continue;
      await processInChunks(items, item => {
        const c = convItem(item);
        if (!c) return;
        const cd = String(item.code).toUpperCase().trim();
        if (DTC_DATABASE[cd]) return;
        DTC_DATABASE[cd] = c;
        obdexAdded++;
      });
    }
    log('OK: OBDex — ' + obdexAdded + ' كود');
  }

  // 2. ملفات محلية
  log('INFO: مرحلة 2/3 — ملفات محلية...');
  for (let f = 0; f < LOCAL_FILES.length; f++) {
    if (bt) bt.textContent = 'محلي: ' + LOCAL_FILES[f] + ' (' + (f + 1) + '/' + LOCAL_FILES.length + ')';
    const items = await fetchLocalJSON(LOCAL_FILES[f]);
    if (!items.length) continue;
    const isEuro = LOCAL_FILES[f].indexOf('european') >= 0;
    const isChinese = LOCAL_FILES[f].indexOf('chinese') >= 0;
    await processInChunks(items, item => {
      const cd = String(item.code || '').toUpperCase().trim();
      if (!cd) return;
      if (DTC_DATABASE[cd]) return;
      const lv = convItem(item);
      if (!lv) return;
      if (isChinese && !lv.brand) lv.brand = '🇨🇳 صيني';
      if (isEuro && !lv.brand) lv.brand = '🇪🇺 أوروبي';
      DTC_DATABASE[cd] = lv;
      localAdded++;
    });
  }
  log('OK: محلي — ' + localAdded + ' كود');

  // 3. Wal33D SQLite
  log('INFO: مرحلة 3/3 — Wal33D...');
  if (bt) bt.textContent = 'Wal33D: تحميل...';
  await loadWal33D();

  app.obdexLoaded = true;
  buildDTCIndex();
  buildSearchIndex();

  const tot = Object.keys(DTC_DATABASE).length;
  if (b) b.style.display = 'none';
  log('OK: الإجمالي النهائي: ' + tot);

  const countEl = document.getElementById('heroCount');
  if (countEl) countEl.textContent = tot.toLocaleString('en-US');
  const sc = document.getElementById('statCodes');
  if (sc) sc.textContent = tot.toLocaleString('en-US');
}
