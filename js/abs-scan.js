import { sendCmd, pauseLiveWait, resumeLive, pHex } from './obd.js';
import { comm, app } from './state.js';
import { getInfo } from './data/database.js';

function parseMsgs(resp) {
  const out = [];
  let multi = null;
  const flush = () => { if (multi && multi.length) out.push(multi); multi = null; };
  String(resp || '').split(/[\r\n]+/).forEach(raw => {
    const t = raw.trim().toUpperCase();
    const m = t.match(/^([0-9A-F]):\s*([0-9A-F ]+)$/);
    if (m) { (multi = multi || []).push(...pHex(m[2])); return; }
    const c = t.replace(/\s/g, '');
    if (!c || !/^[0-9A-F]+$/.test(c)) return;
    if (c.length === 3) { flush(); multi = []; return; }
    flush();
    if (c.length % 2 === 0) out.push(pHex(t));
  });
  flush();
  return out;
}

function dtcFromPairs(b) {
  const o = [];
  for (let k = 0; k + 1 < b.length; k += 2) {
    const a = b[k], c = b[k + 1];
    if (!a && !c) continue;
    o.push(['P','C','B','U'][a >> 6] +
      ((a >> 4) & 3).toString(16) + (a & 15).toString(16) +
      (c >> 4).toString(16) + (c & 15).toString(16));
  }
  return o;
}

function parseUDS(resp) {
  let ok = false;
  const codes = [];
  parseMsgs(resp).forEach(m => {
    if (m[0] !== 0x59 || m[1] !== 0x02) return;
    ok = true;
    const body = m.slice(3);
    if (body.length < 2) return;
    let step = 4;
    if (body.length % 4 !== 0 && body.length % 3 === 0) step = 3;
    for (let p = 0; p + 2 <= body.length; p += step) {
      dtcFromPairs([body[p], body[p + 1]]).forEach(c => {
        if (!codes.includes(c)) codes.push(c);
      });
    }
  });
  return { ok, codes };
}

const MODULES = [
  { addr: '7E1', name: 'ABS', icon: '🛞' },
  { addr: '7E2', name: 'Airbag / SRS', icon: '🛡️' },
  { addr: '7E3', name: 'BCM', icon: '🔌' },
  { addr: '7E4', name: 'TCU', icon: '⚙️' }
];

export async function scanABS() {
  const l = document.getElementById('dtcList');
  if (!l) return;

  if (app.isDemo) {
    const demo = [
      { code: 'C0035', module: 'ABS', status: 'ok' },
      { code: 'C0110', module: 'ABS', status: 'ok' },
      { code: 'B0001', module: 'Airbag', status: 'ok' }
    ];
    renderABS(demo);
    return;
  }

  if (comm.isProcessing || comm.cmdQ.length > 0) {
    alert('العملية قيد التنفيذ — انتظر');
    return;
  }
  if (!app.isConnected) {
    l.innerHTML = '<p class="text-amber-400 text-center py-4">غير متصل</p>';
    return;
  }

  l.innerHTML = '<p class="text-purple-400 text-center py-4">جاري فحص الوحدات...</p>';
  await pauseLiveWait();

  const results = [];

  try {
    for (const mod of MODULES) {
      try {
        await sendCmd('AT SH ' + mod.addr, 800, 0);
        const resp = await sendCmd('19 02 FF', 2500, 0);
        const parsed = parseUDS(resp);
        if (!parsed.ok) continue;
        for (const code of parsed.codes) {
          results.push({ code, module: mod.name, status: 'ok' });
        }
      } catch (_) {}
    }
    try { await sendCmd('AT SH 7DF', 800, 0); } catch (_) {}
    renderABS(results);
  } catch (e) {
    l.innerHTML = '<p class="text-red-400 text-center py-4">خطأ: ' + e.message + '</p>';
  } finally {
    resumeLive();
  }
}

function renderABS(faults) {
  const l = document.getElementById('dtcList');
  if (!l) return;

  if (!faults.length) {
    l.innerHTML = '<div class="bg-green-900/30 text-green-400 p-4 rounded-xl text-center font-bold">✅ لا أعطال في الوحدات</div>';
    return;
  }

  let h = '<div class="bg-purple-700 text-white text-xs font-bold p-2 rounded-lg mb-2 text-center">🛞 فحص الوحدات المتقدمة</div>';

  faults.forEach(f => {
    const info = getInfo(f.code);
    h += '<div class="code-card bg-purple-900/30 border-r-4 border-purple-500 rounded-xl p-3">';
    h += '<div class="flex items-center gap-2 mb-1 flex-wrap">';
    h += '<span class="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">' + f.module + '</span>';
    h += '<span class="font-mono font-bold text-purple-300">' + f.code + '</span>';
    h += '</div>';
    h += '<div class="text-xs text-gray-300">' + info.title + '</div>';
    h += '</div>';
  });

  l.innerHTML = h;

  try {
    const hist = JSON.parse(localStorage.getItem('checkdiga_hist') || '[]');
    hist.unshift({ date: new Date().toISOString(), faults: faults.map(f => ({ code: f.code, type: 'abs' })) });
    localStorage.setItem('checkdiga_hist', JSON.stringify(hist.slice(0, 20)));
  } catch (_) {}
}
