import { DTC_DATABASE, buildDTCIndex, buildSearchIndex } from './database.js';
import { app } from '../state.js';

const LOCAL_FILES = [
  'dtc_p.json', 'dtc_b.json', 'dtc_c.json', 'dtc_u.json',
  'dtc_modern.json', 'dtc_full.json',
  'dtc_european.json', 'dtc_european2.json',
  'dtc_chinese.json', 'dtc_chinese2.json',
  'dtc_chinese3.json', 'dtc_chinese4.json'
];

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
  const tEn = (it.title && it.title.en) ? it.title.en
    : (typeof it.title === 'string' ? it.title : code);

  let dAr = '', dEn = '';
  if (it.description) {
    if (typeof it.description === 'object') {
      dAr = it.description.ar || '';
      dEn = it.description.en || '';
    } else dEn = String(it.description);
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

export async function loadFullDatabase() {
  if (app.obdexLoaded) return;

  const b = document.getElementById('dbStatus');
  const bt = document.getElementById('dbStatusText');
  if (b) b.style.display = 'block';

  let added = 0;

  for (let f = 0; f < LOCAL_FILES.length; f++) {
    if (bt) bt.textContent = LOCAL_FILES[f] + ' (' + (f + 1) + '/' + LOCAL_FILES.length + ')';
    const items = await fetchLocalJSON(LOCAL_FILES[f]);
    if (!items.length) continue;

    const isEuro = LOCAL_FILES[f].includes('european');
    const isChinese = LOCAL_FILES[f].includes('chinese');

    for (const item of items) {
      const cd = String(item.code || '').toUpperCase().trim();
      if (!cd) continue;
      const lv = convItem(item);
      if (!lv) continue;

      if (DTC_DATABASE[cd]) {
        if (!DTC_DATABASE[cd].desc && lv.desc) DTC_DATABASE[cd].desc = lv.desc;
        continue;
      }

      if (isChinese && !lv.brand) lv.brand = '🇨🇳 صيني';
      if (isEuro && !lv.brand) lv.brand = '🇪🇺 أوروبي';
      DTC_DATABASE[cd] = lv;
      added++;
    }
  }

  app.obdexLoaded = true;
  buildDTCIndex();
  buildSearchIndex();

  const tot = Object.keys(DTC_DATABASE).length;
  if (b) b.style.display = 'none';
  console.log('OK: قاعدة البيانات — ' + tot + ' كود');

  const countEl = document.getElementById('heroCount');
  if (countEl) countEl.textContent = tot.toLocaleString('en-US');
}
