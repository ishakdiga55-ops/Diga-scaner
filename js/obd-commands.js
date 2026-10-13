import { sendCmd, pauseLiveWait, resumeLive, pHex } from './obd.js';
import { comm, app } from './state.js';
import { getInfo } from './data/database.js';
import { runDiag, dispSmart, dispHealth } from './analysis.js';

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

function parseDTC(resp, mark) {
  let ok = false;
  const codes = [];
  parseMsgs(resp).forEach(m => {
    if (m[0] !== mark) return;
    ok = true;
    const body = m.slice(1);
    dtcFromPairs(comm.isCAN === false ? body : body.slice(1)).forEach(c => {
      if (!codes.includes(c)) codes.push(c);
    });
  });
  return { ok, codes };
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
export async function readDTCs() {
  if (comm.isProcessing || comm.cmdQ.length > 0) {
    alert('⚠️ العملية قيد التنفيذ — انتظر');
    return;
  }
  const l = document.getElementById('dtcList');
  if (!l) return;
  if (!app.isConnected && !app.isDemo) {
    l.innerHTML = '<p class="text-amber-400 text-center py-4">⚠️ غير متصل</p>';
    return;
  }
  l.innerHTML = '<p class="text-blue-400 text-center py-4"><span class="spinner"></span> قراءة الأعطال...</p>';
  await pauseLiveWait();
  try {
    const p3 = parseDTC(await sendCmd('03', 8000), 0x43);
    const p7 = parseDTC(await sendCmd('07', 8000), 0x47);
    const pa = parseDTC(await sendCmd('0A', 8000), 0x4A);
    if (!p3.ok) {
      l.innerHTML = '<div class="bg-amber-900/30 text-amber-300 p-4 rounded-xl text-center font-bold">⚠️ لم تردّ السيارة<br><span class="text-xs font-normal">تأكد أن المفتاح على ON.</span></div>';
      return;
    }
    const all = [];
    p3.codes.forEach(c => all.push({ code: c, system: 'engine', type: 'confirmed' }));
    p7.codes.forEach(c => { if (!all.some(f => f.code === c)) all.push({ code: c, system: 'engine', type: 'pending' }); });
    pa.codes.forEach(c => { if (!all.some(f => f.code === c)) all.push({ code: c, system: 'engine', type: 'permanent' }); });
    if (!all.length) {
      l.innerHTML = '<div class="bg-green-900/30 text-green-400 p-4 rounded-xl text-center"><div class="font-bold mb-1">✅ لا أعطال مسجلة</div></div>';
      return;
    }
    renderFaults(all);
    disp (!Smart(all.map(f => f.code));
    dispHealth(all, runDiag(all.map(f => f.code)));
  } catch (e) {
    l.innerHTML = '<p class="text-red-400 text-center py-4">❌ خطأ: ' + e.message + '</p>';
  } finally {
    resumeLive();
  }
}

export async function scanAll() {
  if (comm.isProcessing || comm.cmdQ.length > 0) {
    alert('⚠️ العملية قيد التنفيذ — انتظر');
    return;
  }
  const l = document.getElementById('dtcList');
  ifl) return;
  if (!app.isConnected && !app.isDemo) {
    l.innerHTML = '<p class="text-amber-400 text-center py-4">⚠️ غير متصل</p>';
    return;
  }
  l.innerHTML = '<p class="text-blue-400 text-center py-4"><span class="spinner"></span> جاري الفحص الشامل...</p>';
  await pauseLiveWait();
  try {
    const all = [];
    let answered = 0;
    for (let n = 0; n < 8; n++) {
      const a = '7E' + n;
      await sendCmd('AT SH ' + a, 800, 0);
      const p = parseUDS(await sendCmd('19 02 FF', 2500, 0));
      if (!p.ok) continue;
      answered++;
      const sys = n === 0 ? 'engine' : n === 1 ? 'transmission' : null;
      p.codes.forEach(c => {
        if (!all.some(f => f.code === c))
          all.push({ code: c, system: sys || ('ECU ' + a), type: 'confirmed' });
      });
    }
    try { await sendCmd('AT SH 7DF', 800, 0); } catch (_) {}
    if (!answered) {
      l.innerHTML = '<div class="bg-amber-900/30 text-amber-300 p-4 rounded-xl text-center font-bold">⚠️ لم تردّ أي وحدة</div>';
      return;
    }
    if (!all.length) {
      l.innerHTML = '<div class="bg-green-900/30 text-green-400 p-4 rounded-xl text-center font-bold">✅ لا أعطال</div>';
      return;
    }
    renderFaults(all);
    dispSmart(all.map(f => f.code));
    dispHealth(all, runDiag(all.map(f => f.code)));
  } catch (e) {
    l.innerHTML = '<p class="text-red-400 text-center py-4">❌ خطأ: ' + e.message + '</p>';
  } finally {
    resumeLive();
  }
}

export async function clearDTCs() {
  if (!app.isConnected && !app.isDemo) { alert('غير متصل'); return; }
  if (!confirm('⚠️ مسح الأعطال سيحذف freeze frame.\nمتابعة؟')) return;
  const l = document.getElementById('dtcList');
  await pauseLiveWait();
  try {
    const r = await sendCmd('04', 5000, 0);
    if (parseMsgs(r).some(m => m[0] === 0x44)) {
      if (l) l.innerHTML = '<p class="text-green-400 text-center py-4">✅ تم مسح الأعطال</p>';
    } else {
      if (l) l.innerHTML = '<p class="text-amber-400 text-center py-4">⚠️ لم تؤكد السيارة المسح.</p>';
    }
  } catch (e) {
    if (l) l.innerHTML = '<p class="text-red-400 text-center py-4">❌ ' + e.message + '</p>';
  } finally {
    resumeLive();
  }
}

function renderFaults(faults) {
  const l = document.getElementById('dtcList');
  if (!l) return;
  if (!faults.length) {
    l.innerHTML = '<p class="text-gray-500 text-center py-4">لا أعطال</p>';
    return;
  }
  const sysMap = {
    engine: 'المحرك', exhaust: 'العوادم', electronics: 'الكهرباء',
    fuel: 'الوقود', cooling: 'التبريد', brakes: 'الفرامل',
    airbag: 'الوسائد', transmission: 'الجير', abs: 'ABS'
  };
  let h = '<div class="bg-emerald-700 text-white text-xs font-bold p-2 rounded-lg mb-2 text-center">🚗 بيانات مقروءة فعلياً من السيارة</div>';
  faults.forEach(f => {
    const info = getInfo(f.code);
    const tl = f.type === 'pending' ? 'مؤقت' : f.type === 'permanent' ? 'دائم' : 'مؤكد';
    const tc = f.type === 'pending' ? 'bg-amber-600' : f.type === 'permanent' ? 'bg-purple-600' : 'bg-red-600';
    h += '<div class="code-card bg-red-900/30 border-r-4 border-red-500 rounded-xl p-3" data-code="' + f.code + '">';
    h += '<div class="flex items-center gap-2 mb-1 flex-wrap">';
    h += '<span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">' + (sysMap[f.system] || f.system) + '</span>';
    h += '<span class="font-mono font-bold text-red-300">' + f.code + '</span>';
    h += '<span class="text-[9px] px-1.5 py-0.5 rounded ' + tc + ' text-white font-bold">' + tl + '</span>';
    h += '</div>';
    h += '<div class="text-xs text-gray-300">' + info.title + '</div>';
    h += '</div>';
  });
  l.innerHTML = h;

  try {
    const hist = JSON.parse(localStorage.getItem('checkdiga_hist') || '[]');
    hist.unshift({ date: new Date().toISOString(), faults: faults.map(f => ({ code: f.code, type: f.type })) });
    localStorage.setItem('checkdiga_hist', JSON.stringify(hist.slice(0, 20)));
  } catch (_) {}
}
