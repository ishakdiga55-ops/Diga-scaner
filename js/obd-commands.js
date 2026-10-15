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

const FF_PIDS = {
  0x04: 'حمل المحرك',
  0x05: 'حرارة سائل التبريد',
  0x0B: 'ضغط المشعب',
  0x0C: 'دورات المحرك',
  0x0D: 'سرعة السيارة',
  0x0F: 'حرارة هواء السحب',
  0x10: 'تدفق الهواء MAF',
  0x11: 'موضع الخانق',
  0x2F: 'مستوى الوقود',
  0x42: 'فولت الوحدة',
  0x46: 'حرارة البيئة'
};

function ffValue(pid, a, b) {
  if (pid === 0x0C) return Math.round((a * 256 + b) / 4) + ' RPM';
  if (pid === 0x0D) return a + ' كم/س';
  if (pid === 0x05) return (a - 40) + ' °C';
  if (pid === 0x04) return Math.round(a * 100 / 255) + ' %';
  if (pid === 0x11) return Math.round(a * 100 / 255) + ' %';
  if (pid === 0x0B) return a + ' kPa';
  if (pid === 0x0F) return (a - 40) + ' °C';
  if (pid === 0x10) return Math.round((a * 256 + b) / 100) + ' g/s';
  if (pid === 0x2F) return Math.round(a * 100 / 255) + ' %';
  if (pid === 0x42) return ((a * 256 + b) / 1000).toFixed(2) + ' V';
  if (pid === 0x46) return (a - 40) + ' °C';
  return a + '';
}

function ffHtml(dtc, rows) {
  let h = '<div style="text-align:center;padding-bottom:14px;border-bottom:1px solid #374151;margin-bottom:14px;">';
  h += '<div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">ظروف السيارة لحظة تسجيل العطل</div>';
  h += '<div style="font-size:17px;font-weight:bold;">❄️ Freeze Frame</div>';
  if (dtc) h += '<div style="font-family:monospace;color:#f87171;font-size:19px;font-weight:bold;margin-top:6px;">' + dtc + '</div>';
  h += '</div>';
  if (!rows.length) {
    h += '<div style="text-align:center;padding:30px 20px;color:#9ca3af;">';
    h += '<div style="font-size:36px;margin-bottom:10px;">📭</div>';
    h += '<div style="font-weight:bold;margin-bottom:6px;color:#e5e7eb;">لا توجد بيانات Freeze Frame</div>';
    h += '<div style="font-size:12px;">السيارة لم تسجّل ظروف الأعطال</div>';
    h += '</div>';
    return h;
  }
  h += '<div style="display:flex;flex-direction:column;gap:6px;">';
  rows.forEach(r => {
    h += '<div style="display:flex;justify-content:space-between;background:#111827;padding:11px 13px;border-radius:8px;">';
    h += '<span style="font-size:13px;color:#9ca3af;">' + r[0] + '</span>';
    h += '<span style="font-weight:bold;font-size:14px;color:#fff;">' + r[1] + '</span>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

async function openFreezeFrame() {
  let modal = document.getElementById('ffModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ffModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;overflow-y:auto;padding:16px;';
    modal.innerHTML =
      '<div style="max-width:600px;margin:24px auto;background:#1f2937;border-radius:16px;padding:20px;position:relative;">' +
        '<button id="ffClose" style="position:absolute;top:12px;left:12px;background:#dc2626;color:#fff;width:32px;height:32px;border-radius:50%;border:none;font-size:18px;font-weight:bold;cursor:pointer;">×</button>' +
        '<div id="ffBody" style="padding-top:8px;color:#e5e7eb;font-family:Cairo,sans-serif;direction:rtl;text-align:right;"></div>' +
      '</div>';
    document.body.appendChild(modal);
    document.getElementById('ffClose').onclick = function () { modal.style.display = 'none'; };
    modal.onclick = function (e) { if (e.target.id === 'ffModal') modal.style.display = 'none'; };
  }
  const body = document.getElementById('ffBody');
  modal.style.display = 'block';

  if (app.isDemo) {
    body.innerHTML = ffHtml('P0301', [
      ['دورات المحرك', '2850 RPM'],
      ['سرعة السيارة', '45 كم/س'],
      ['حرارة سائل التبريد', '88 °C'],
      ['حمل المحرك', '65 %'],
      ['موضع الخانق', '22 %'],
      ['ضغط المشعب', '45 kPa'],
      ['حرارة هواء السحب', '32 °C'],
      ['مستوى الوقود', '67 %'],
      ['فولت الوحدة', '14.20 V']
    ]);
    return;
  }

  if (!app.isConnected) { body.innerHTML = ffHtml(null, []); return; }

  body.innerHTML = '<div style="text-align:center;padding:30px;color:#9ca3af;">جاري القراءة...</div>';

  const rows = [];
  const pidList = Object.keys(FF_PIDS).map(Number);
  for (const pid of pidList) {
    try {
      const hex = pid.toString(16).toUpperCase().padStart(2, '0');
      const resp = await sendCmd('02 ' + hex, 2500, 0);
      const bytes = pHex(resp);
      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x42 && bytes[i + 1] === pid) {
          const a = bytes[i + 2] || 0;
          const b = bytes[i + 3] || 0;
          rows.push([FF_PIDS[pid], ffValue(pid, a, b)]);
          break;
        }
      }
    } catch (_) {}
  }
  body.innerHTML = ffHtml(null, rows);
}

function updSysGrid(faults) {
  const items = document.querySelectorAll('.sys-item');
  items.forEach(e => e.classList.remove('good', 'bad', 'unknown'));

  if (!faults || !faults.length) {
    items.forEach(e => e.classList.add('good'));
    return;
  }

  const affected = new Set();
  faults.forEach(f => {
    try {
      const info = getInfo(f.code);
      if (info && info.zone) affected.add(info.zone);
    } catch (_) {}
    if (f.system) affected.add(f.system);
  });

  items.forEach(e => {
    if (affected.has(e.dataset.sys)) e.classList.add('bad');
    else e.classList.add('good');
  });
}

export async function readDTCs() {
  const l = document.getElementById('dtcList');
  if (!l) return;

  if (app.isDemo) {
    const demoFaults = [
      { code: 'P0301', system: 'engine', type: 'confirmed' },
      { code: 'P0171', system: 'fuel', type: 'confirmed' },
      { code: 'P0420', system: 'exhaust', type: 'pending' },
      { code: 'U0100', system: 'electronics', type: 'confirmed' }
    ];
    renderFaults(demoFaults);
    dispSmart(demoFaults.map(f => f.code));
    dispHealth(demoFaults, runDiag(demoFaults.map(f => f.code)));
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
  l.innerHTML = '<p class="text-blue-400 text-center py-4">قراءة الأعطال...</p>';
  await pauseLiveWait();
  try {
    const p3 = parseDTC(await sendCmd('03', 8000), 0x43);
    const p7 = parseDTC(await sendCmd('07', 8000), 0x47);
    const pa = parseDTC(await sendCmd('0A', 8000), 0x4A);
    if (!p3.ok) {
      l.innerHTML = '<div class="bg-amber-900/30 text-amber-300 p-4 rounded-xl text-center font-bold">لم ترد السيارة — تأكد أن المفتاح على ON</div>';
      updSysGrid([]);
      return;
    }
    const all = [];
    p3.codes.forEach(c => all.push({ code: c, system: 'engine', type: 'confirmed' }));
    p7.codes.forEach(c => { if (!all.some(f => f.code === c)) all.push({ code: c, system: 'engine', type: 'pending' }); });
    pa.codes.forEach(c => { if (!all.some(f => f.code === c)) all.push({ code: c, system: 'engine', type: 'permanent' }); });
    if (!all.length) {
      l.innerHTML = '<div class="bg-green-900/30 text-green-400 p-4 rounded-xl text-center font-bold">لا أعطال مسجلة</div>';
      updSysGrid([]);
      return;
    }
    renderFaults(all);
    dispSmart(all.map(f => f.code));
    dispHealth(all, runDiag(all.map(f => f.code)));
  } catch (e) {
    l.innerHTML = '<p class="text-red-400 text-center py-4">خطأ: ' + e.message + '</p>';
  } finally {
    resumeLive();
  }
}

export async function scanAll() {
  const l = document.getElementById('dtcList');
  if (!l) return;

  if (app.isDemo) {
    const demoFaults = [
      { code: 'P0300', system: 'engine', type: 'confirmed' },
      { code: 'P0171', system: 'fuel', type: 'confirmed' },
      { code: 'P0420', system: 'exhaust', type: 'pending' },
      { code: 'U0100', system: 'electronics', type: 'confirmed' }
    ];
    renderFaults(demoFaults);
    dispSmart(demoFaults.map(f => f.code));
    dispHealth(demoFaults, runDiag(demoFaults.map(f => f.code)));
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
  l.innerHTML = '<p class="text-blue-400 text-center py-4">جاري الفحص الشامل...</p>';
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
      l.innerHTML = '<div class="bg-amber-900/30 text-amber-300 p-4 rounded-xl text-center font-bold">لم ترد أي وحدة</div>';
      updSysGrid([]);
      return;
    }
    if (!all.length) {
      l.innerHTML = '<div class="bg-green-900/30 text-green-400 p-4 rounded-xl text-center font-bold">لا أعطال</div>';
      updSysGrid([]);
      return;
    }
    renderFaults(all);
    dispSmart(all.map(f => f.code));
    dispHealth(all, runDiag(all.map(f => f.code)));
  } catch (e) {
    l.innerHTML = '<p class="text-red-400 text-center py-4">خطأ: ' + e.message + '</p>';
  } finally {
    resumeLive();
  }
}

export async function clearDTCs() {
  const l = document.getElementById('dtcList');
  if (app.isDemo) {
    if (l) l.innerHTML = '<p class="text-green-400 text-center py-4">تم مسح الأعطال (تجريبي)</p>';
    updSysGrid([]);
    return;
  }
  if (!app.isConnected) { alert('غير متصل'); return; }
  if (!confirm('مسح الأعطال سيحذف freeze frame. متابعة؟')) return;
  await pauseLiveWait();
  try {
    const r = await sendCmd('04', 5000, 0);
    if (parseMsgs(r).some(m => m[0] === 0x44)) {
      if (l) l.innerHTML = '<p class="text-green-400 text-center py-4">تم مسح الأعطال</p>';
      updSysGrid([]);
    } else {
      if (l) l.innerHTML = '<p class="text-amber-400 text-center py-4">لم تؤكد السيارة المسح</p>';
    }
  } catch (e) {
    if (l) l.innerHTML = '<p class="text-red-400 text-center py-4">' + e.message + '</p>';
  } finally {
    resumeLive();
  }
}

function renderFaults(faults) {
  const l = document.getElementById('dtcList');
  if (!l) return;
  if (!faults.length) {
    l.innerHTML = '<p class="text-gray-500 text-center py-4">لا أعطال</p>';
    updSysGrid([]);
    return;
  }
  const sysMap = {
    engine: 'المحرك', exhaust: 'العوادم', electronics: 'الكهرباء',
    fuel: 'الوقود', cooling: 'التبريد', brakes: 'الفرامل',
    airbag: 'الوسائد', transmission: 'الجير', abs: 'ABS'
  };
  let h = '<div class="bg-emerald-700 text-white text-xs font-bold p-2 rounded-lg mb-2 text-center">بيانات مقروءة</div>';
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
    h += '<div class="text-xs text-gray-300 mb-2">' + info.title + '</div>';
    h += '<button type="button" class="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold" data-ff="1">❄️ ظروف العطل</button>';
    h += '</div>';
  });
  l.innerHTML = h;

  l.querySelectorAll('[data-ff]').forEach(b => {
    b.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openFreezeFrame();
    };
  });

  updSysGrid(faults);

  try {
    const hist = JSON.parse(localStorage.getItem('checkdiga_hist') || '[]');
    hist.unshift({ date: new Date().toISOString(), faults: faults.map(f => ({ code: f.code, type: f.type })) });
    localStorage.setItem('checkdiga_hist', JSON.stringify(hist.slice(0, 20)));
  } catch (_) {}
}
