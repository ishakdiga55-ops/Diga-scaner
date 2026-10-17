import { sendCmd, pauseLiveWait, resumeLive, pHex } from './obd.js';
import { comm, app, session } from './state.js';
import { getInfo } from './data/database.js';
import { runDiag, dispSmart, dispHealth } from './analysis.js';

var opBusy = false;
var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

/* ═══════════ أدوات مساعدة ═══════════ */

// إيقاف القراءة الحية أولاً، ثم انتظار فراغ الطابور، ثم الفحص
async function prepareBus() {
  await pauseLiveWait();
  for (var i = 0; i < 50 && (comm.isProcessing || comm.cmdQ.length > 0); i++) await sleep(100);
  return !(comm.isProcessing || comm.cmdQ.length > 0);
}

// يتأكد أن السيارة ما زالت ترد (للتمييز بين "لا أعطال" و"السيارة لا ترد")
async function ecuAlive() {
  try {
    var r = await sendCmd('0100', 4000, 0);
    return String(r).replace(/[^0-9A-F]/gi, '').toUpperCase().indexOf('4100') >= 0;
  } catch (_) { return false; }
}

function box(kind, text) {
  var c = kind === 'ok' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-300';
  return '<div class="' + c + ' p-4 rounded-xl text-center font-bold">' + text + '</div>';
}

function storeLast(faults) {
  try {
    localStorage.setItem('checkdiga_last', JSON.stringify((faults || []).map(function (f) {
      return { code: f.code, type: f.type };
    })));
  } catch (_) {}
}

function noFaults(html) {
  var l = document.getElementById('dtcList');
  if (l) l.innerHTML = html;
  updSysGrid([]);
  storeLast([]);
}

function showResults(all) {
  renderFaults(all);
  var codes = all.map(function (f) { return f.code; });
  dispSmart(codes);
  dispHealth(all, runDiag(codes));
}

/* ═══════════ تحليل الردود ═══════════ */

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

// كل أمر في try/catch: فشل 07 أو 0A لا يُضيّع نتيجة 03
async function readMode(cmd, mark) {
  try {
    var resp = await sendCmd(cmd, 8000);
    var p = parseDTC(resp, mark);
    p.noData = !p.ok && /NO DATA/i.test(String(resp || ''));
    return p;
  } catch (e) {
    return { ok: false, codes: [], noData: false, err: e };
  }
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

/* ═══════════ Freeze Frame ═══════════ */

var FF_PIDS = {};
FF_PIDS[0x04] = 'حمل المحرك';
FF_PIDS[0x05] = 'حرارة سائل التبريد';
FF_PIDS[0x0B] = 'ضغط المشعب';
FF_PIDS[0x0C] = 'دورات المحرك';
FF_PIDS[0x0D] = 'سرعة السيارة';
FF_PIDS[0x0F] = 'حرارة هواء السحب';
FF_PIDS[0x10] = 'تدفق الهواء MAF';
FF_PIDS[0x11] = 'موضع الخانق';
FF_PIDS[0x2F] = 'مستوى الوقود';
FF_PIDS[0x42] = 'فولت الوحدة';
FF_PIDS[0x46] = 'حرارة البيئة';

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
  var h = '<div style="text-align:center;padding-bottom:14px;border-bottom:1px solid #374151;margin-bottom:14px;">';
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
  rows.forEach(function (r) {
    h += '<div style="display:flex;justify-content:space-between;background:#111827;padding:11px 13px;border-radius:8px;">';
    h += '<span style="font-size:13px;color:#9ca3af;">' + r[0] + '</span>';
    h += '<span style="font-weight:bold;font-size:14px;color:#fff;">' + r[1] + '</span>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

// الصيغة الصحيحة: الطلب "02 PID 00" والرد "42 PID 00 A B"
async function readFFPid(pid) {
  var hex = pid.toString(16).toUpperCase().padStart(2, '0');
  var bytes = pHex(await sendCmd('02 ' + hex + ' 00', 2500, 0));
  for (var j = 0; j + 3 < bytes.length; j++) {
    if (bytes[j] === 0x42 && bytes[j + 1] === pid) {
      return [bytes[j + 3] || 0, bytes[j + 4] || 0];
    }
  }
  return null;
}

// PID 02 في Mode 02 يُرجع كود العطل الذي سُجّل لأجله الـ Freeze Frame
async function readFFCode() {
  try {
    var bytes = pHex(await sendCmd('02 02 00', 2500, 0));
    for (var j = 0; j + 3 < bytes.length; j++) {
      if (bytes[j] === 0x42 && bytes[j + 1] === 0x02) {
        var c = dtcFromPairs([bytes[j + 3] || 0, bytes[j + 4] || 0]);
        return c.length ? c[0] : null;
      }
    }
  } catch (_) {}
  return null;
}

async function openFreezeFrame() {
  var modal = document.getElementById('ffModal');
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
  var body = document.getElementById('ffBody');
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

  if (opBusy) {
    body.innerHTML = '<div style="text-align:center;padding:30px;color:#9ca3af;">العملية قيد التنفيذ — انتظر</div>';
    return;
  }
  opBusy = true;
  body.innerHTML = '<div style="text-align:center;padding:30px;color:#9ca3af;">جاري القراءة...</div>';

  try {
    // إيقاف القراءة الحية أثناء قراءة Freeze Frame حتى لا تتداخل الأوامر
    if (!(await prepareBus())) {
      body.innerHTML = '<div style="text-align:center;padding:30px;color:#9ca3af;">الاتصال مشغول — أعد المحاولة</div>';
      return;
    }
    var dtc = await readFFCode();
    var rows = [];
    var miss = 0;
    var pidList = Object.keys(FF_PIDS).map(Number);
    for (var i = 0; i < pidList.length; i++) {
      var pid = pidList[i];
      try {
        var v = await readFFPid(pid);
        if (v) { rows.push([FF_PIDS[pid], ffValue(pid, v[0], v[1])]); miss = 0; }
        else miss++;
      } catch (_) { miss++; }
      // لا داعي لانتظار كل PID إذا لم تسجّل السيارة أي إطار
      if (!rows.length && miss >= 3) break;
    }
    body.innerHTML = ffHtml(dtc, rows);
  } finally {
    opBusy = false;
    resumeLive();
  }
}

/* ═══════════ واجهة الأنظمة ═══════════ */

function updSysGrid(faults) {
  var items = document.querySelectorAll('.sys-item');
  items.forEach(function (e) { e.classList.remove('good', 'bad', 'unknown'); });

  if (!faults || !faults.length) {
    items.forEach(function (e) { e.classList.add('good'); });
    return;
  }

  var affected = new Set();
  faults.forEach(function (f) {
    try {
      var info = getInfo(f.code);
      if (info && info.zone) affected.add(info.zone);
    } catch (_) {}
    if (f.system) affected.add(f.system);
  });

  items.forEach(function (e) {
    if (affected.has(e.dataset.sys)) e.classList.add('bad');
    else e.classList.add('good');
  });
}

function hideRelatedUI() {
  try {
    var h = document.getElementById('healthBadge');
    var d = document.getElementById('smartDiagnosis');
    var e = document.getElementById('proExportBar');
    if (h) h.classList.add('hidden');
    if (d) d.classList.add('hidden');
    if (e) e.classList.add('hidden');
    session.lastFaults = [];
    session.lastDiag = [];
  } catch (_) {}
  storeLast([]);
}

/* ═══════════ قراءة الأعطال ═══════════ */

export async function readDTCs() {
  var l = document.getElementById('dtcList');
  if (!l) return;

  if (app.isDemo) {
    showResults([
      { code: 'P0301', system: 'engine', type: 'confirmed' },
      { code: 'P0171', system: 'fuel', type: 'confirmed' },
      { code: 'P0420', system: 'exhaust', type: 'pending' },
      { code: 'U0100', system: 'electronics', type: 'confirmed' }
    ]);
    return;
  }

  if (!app.isConnected) {
    l.innerHTML = '<p class="text-amber-400 text-center py-4">غير متصل</p>';
    return;
  }
  if (opBusy) { alert('العملية قيد التنفيذ — انتظر'); return; }

  opBusy = true;
  l.innerHTML = '<p class="text-blue-400 text-center py-4">قراءة الأعطال...</p>';
  try {
    if (!(await prepareBus())) {
      l.innerHTML = box('warn', 'الاتصال مشغول — أعد المحاولة');
      return;
    }
    var p3 = await readMode('03', 0x43);
    var p7 = await readMode('07', 0x47);
    var pa = await readMode('0A', 0x4A);

    // NO DATA على الأمر 03 قد يعني "لا أعطال" — نتأكد أن السيارة ما زالت ترد
    if (!p3.ok && !(p3.noData && await ecuAlive())) {
      l.innerHTML = box('warn', 'لم ترد السيارة — تأكد أن المفتاح على ON');
      updSysGrid([]);
      return;
    }

    var all = [];
    p3.codes.forEach(function (c) { all.push({ code: c, system: 'engine', type: 'confirmed' }); });
    p7.codes.forEach(function (c) { if (!all.some(function (f) { return f.code === c; })) all.push({ code: c, system: 'engine', type: 'pending' }); });
    pa.codes.forEach(function (c) { if (!all.some(function (f) { return f.code === c; })) all.push({ code: c, system: 'engine', type: 'permanent' }); });

    if (!all.length) { noFaults(box('ok', 'لا أعطال مسجلة')); return; }
    showResults(all);
  } catch (e) {
    l.innerHTML = '<p class="text-red-400 text-center py-4">خطأ: ' + e.message + '</p>';
  } finally {
    opBusy = false;
    resumeLive();
  }
}

export async function scanAll() {
  var l = document.getElementById('dtcList');
  if (!l) return;

  if (app.isDemo) {
    showResults([
      { code: 'P0300', system: 'engine', type: 'confirmed' },
      { code: 'P0171', system: 'fuel', type: 'confirmed' },
      { code: 'P0420', system: 'exhaust', type: 'pending' },
      { code: 'U0100', system: 'electronics', type: 'confirmed' }
    ]);
    return;
  }

  if (!app.isConnected) {
    l.innerHTML = '<p class="text-amber-400 text-center py-4">غير متصل</p>';
    return;
  }
  // الفحص الشامل يعتمد عناوين CAN 11-bit (7E0..7E7)
  if (comm.isCAN === false) {
    l.innerHTML = box('warn', 'الفحص الشامل يحتاج بروتوكول CAN — استخدم "فحص المحرك"');
    return;
  }
  if (comm.isCAN11 === false) {
    l.innerHTML = box('warn', 'السيارة تستخدم CAN 29-bit وهو غير مدعوم في الفحص الشامل — استخدم "فحص المحرك"');
    return;
  }
  if (opBusy) { alert('العملية قيد التنفيذ — انتظر'); return; }

  opBusy = true;
  var headerChanged = false;
  l.innerHTML = '<p class="text-blue-400 text-center py-4">جاري الفحص الشامل...</p>';
  try {
    if (!(await prepareBus())) {
      l.innerHTML = box('warn', 'الاتصال مشغول — أعد المحاولة');
      return;
    }
    var all = [];
    var answered = 0;
    for (var n = 0; n < 8; n++) {
      var addr = '7E' + n;
      try {
        headerChanged = true;
        await sendCmd('AT SH ' + addr, 800, 0);
        var p = parseUDS(await sendCmd('19 02 FF', 2500, 0));
        if (!p.ok) continue;
        answered++;
        var sys = n === 0 ? 'engine' : n === 1 ? 'transmission' : null;
        p.codes.forEach(function (c) {
          if (!all.some(function (f) { return f.code === c; }))
            all.push({ code: c, system: sys || ('ECU ' + addr), type: 'confirmed' });
        });
      } catch (_) { /* هذه الوحدة لم ترد — ننتقل للتي بعدها */ }
    }
    if (!answered) {
      l.innerHTML = box('warn', 'لم ترد أي وحدة على فحص UDS — استخدم "فحص المحرك"');
      updSysGrid([]);
      return;
    }
    if (!all.length) { noFaults(box('ok', 'لا أعطال')); return; }
    showResults(all);
  } catch (e) {
    l.innerHTML = '<p class="text-red-400 text-center py-4">خطأ: ' + e.message + '</p>';
  } finally {
    // إعادة الهيدر الافتراضي دائماً، حتى عند حدوث timeout
    if (headerChanged) { try { await sendCmd('AT SH 7DF', 800, 0); } catch (_) {} }
    opBusy = false;
    resumeLive();
  }
}

// ترجع true فقط إذا أكدت السيارة المسح فعلاً
export async function clearDTCs() {
  var l = document.getElementById('dtcList');

  if (app.isDemo) {
    if (l) l.innerHTML = box('ok', '✅ تم مسح الأعطال (تجريبي)');
    hideRelatedUI();
    updSysGrid([]);
    return true;
  }

  if (!app.isConnected) { alert('غير متصل'); return false; }
  if (!confirm('مسح الأعطال سيحذف freeze frame. متابعة؟')) return false;
  if (opBusy) { alert('العملية قيد التنفيذ — انتظر'); return false; }

  opBusy = true;
  try {
    if (!(await prepareBus())) {
      if (l) l.innerHTML = box('warn', 'الاتصال مشغول — أعد المحاولة');
      return false;
    }
    var r = await sendCmd('04', 5000, 0);
    if (parseMsgs(r).some(function (m) { return m[0] === 0x44; })) {
      if (l) l.innerHTML = box('ok', '✅ تم مسح الأعطال');
      hideRelatedUI();
      updSysGrid([]);
      return true;
    }
    if (l) l.innerHTML = box('warn', 'لم تؤكد السيارة المسح');
    return false;
  } catch (e) {
    if (l) l.innerHTML = '<p class="text-red-400 text-center py-4">' + e.message + '</p>';
    return false;
  } finally {
    opBusy = false;
    resumeLive();
  }
}

/* ═══════════ عرض الأعطال ═══════════ */

function renderFaults(faults) {
  var l = document.getElementById('dtcList');
  if (!l) return;
  if (!faults.length) {
    l.innerHTML = '<p class="text-gray-500 text-center py-4">لا أعطال</p>';
    updSysGrid([]);
    storeLast([]);
    return;
  }
  var sysMap = {
    engine: 'المحرك', exhaust: 'العوادم', electronics: 'الكهرباء',
    fuel: 'الوقود', cooling: 'التبريد', brakes: 'الفرامل',
    airbag: 'الوسائد', transmission: 'الجير', abs: 'ABS'
  };
  var h = '<div class="bg-emerald-700 text-white text-xs font-bold p-2 rounded-lg mb-2 text-center">بيانات مقروءة</div>';
  faults.forEach(function (f) {
    // الأكواد غير الموجودة في القاعدة لا تكسر العرض
    var info = {};
    try { info = getInfo(f.code) || {}; } catch (_) {}
    var title = info.title || 'عطل غير موجود في القاعدة';
    var tl = f.type === 'pending' ? 'مؤقت' : f.type === 'permanent' ? 'دائم' : 'مؤكد';
    var tc = f.type === 'pending' ? 'bg-amber-600' : f.type === 'permanent' ? 'bg-purple-600' : 'bg-red-600';
    h += '<div class="code-card bg-red-900/30 border-r-4 border-red-500 rounded-xl p-3" data-code="' + f.code + '">';
    h += '<div class="flex items-center gap-2 mb-1 flex-wrap">';
    h += '<span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">' + (sysMap[f.system] || f.system) + '</span>';
    h += '<span class="font-mono font-bold text-red-300">' + f.code + '</span>';
    h += '<span class="text-[9px] px-1.5 py-0.5 rounded ' + tc + ' text-white font-bold">' + tl + '</span>';
    h += '</div>';
    h += '<div class="text-xs text-gray-300 mb-2">' + title + '</div>';
    h += '<button type="button" class="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold" data-ff="1">❄️ ظروف العطل</button>';
    h += '</div>';
  });
  l.innerHTML = h;

  l.querySelectorAll('[data-ff]').forEach(function (b) {
    b.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openFreezeFrame();
    };
  });

  updSysGrid(faults);

  // آخر نتيجة (للتحليل المتقدم) — تُحفظ دائماً
  storeLast(faults);

  // السجل لا يحفظ نتائج الوضع التجريبي
  if (!app.isDemo) {
    try {
      var hist = JSON.parse(localStorage.getItem('checkdiga_hist') || '[]');
      hist.unshift({ date: new Date().toISOString(), faults: faults.map(function (f) { return { code: f.code, type: f.type }; }) });
      localStorage.setItem('checkdiga_hist', JSON.stringify(hist.slice(0, 20)));
    } catch (_) {}
  }
}
