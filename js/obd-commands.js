import { sendCmd, pauseLiveWait, resumeLive, pHex } from './obd.js';
import { comm, app, session } from './state.js';
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
  rows.forEach(function(r) {
    h += '<div style="display:flex;justify-content:space-between;background:#111827;padding:11px 13px;border-radius:8px;">';
    h += '<span style="font-size:13px;color:#9ca3af;">' + r[0] + '</span>';
    h += '<span style="font-weight:bold;font-size:14px;color:#fff;">' + r[1] + '</span>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

window.openFreezeFrame = async function() {
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

  body.innerHTML = '<div style="text-align:center;padding:30px;color:#9ca3af;">جاري القراءة...</div>';

  var rows = [];
  var pidList = Object.keys(FF_PIDS).map(Number);
  for (var i = 0; i < pidList.length; i++) {
    var pid = pidList[i];
    try {
      var hex = pid.toString(16).toUpperCase().padStart(2, '0');
      var resp = await sendCmd('02 ' + hex, 2500, 0);
      var bytes = pHex(resp);
      for (var j = 0; j < bytes.length - 2; j++) {
        if (bytes[j] === 0x42 && bytes[j + 1] === pid) {
          var a = bytes[j + 2] || 0;
          var b = bytes[j + 3] || 0;
          rows.push([FF_PIDS[pid], ffValue(pid, a, b)]);
          break;
        }
      }
    } catch (_) {}
  }
  body.innerHTML = ffHtml(null, rows);
};

function updSysGrid(faults) {
  var items = document.querySelectorAll('.sys-item');
  items.forEach(function(e) { e.classList.remove('good', 'bad', 'unknown'); });

  if (!faults || !faults.length) {
    items.forEach(function(e) { e.classList.add('good'); });
    return;
  }

  var affected = new Set();
  faults.forEach(function(f) {
    try {
      var info = getInfo(f.code);
      if (info && info.zone) affected.add(info.zone);
    } catch (_) {}
    if (f.system) affected.add(f.system);
  });

  items.forEach(function(e) {
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
}

export async function readDTCs() {
  var l = document.getElementById('dtcList');
  if (!l) return;

  if (app.isDemo) {
    var demoFaults = [
      { code: 'P0301', system: 'engine', type: 'confirmed' },
      { code: 'P0171', system: 'fuel', type: 'confirmed' },
      { code: 'P0420', system: 'exhaust', type: 'pending' },
      { code: 'U0100', system: 'electronics', type: 'confirmed' }
    ];
    renderFaults(demoFaults);
    dispSmart(demoFaults.map(function(f) { return f.code; }));
    dispHealth(demoFaults, runDiag(demoFaults.map(function(f) { return f.code; })));
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
    var p3 = parseDTC(await sendCmd('03', 8000), 0x43);
    var p7 = parseDTC(await sendCmd('07', 8000), 0x47);
    var pa = parseDTC(await sendCmd('0A', 8000), 0x4A);
    
    if (!p3.ok) {
      l.innerHTML = '<div class="bg-amber-900/30 text-amber-300 p-4 rounded-xl text-center font-bold">لم ترد السيارة — تأكد أن المفتاح على ON</div>';
      updSysGrid([]);
      return;
    }

    var all = [];
    
    // سحب النظام تلقائياً من قاعدة البيانات لضمان دقة الأضواء
    p3.codes.forEach(function(c) { 
      var info = getInfo(c);
      all.push({ code: c, system: info.zone || 'engine', type: 'confirmed' }); 
    });
    p7.codes.forEach(function(c) { 
      if (!all.some(function(f) { return f.code === c; })) {
        var info = getInfo(c);
        all.push({ code: c, system: info.zone || 'engine', type: 'pending' }); 
      }
    });
    pa.codes.forEach(function(c) { 
      if (!all.some(function(f) { return f.code === c; })) {
        var info = getInfo(c);
        all.push({ code: c, system: info.zone || 'engine', type: 'permanent' }); 
      }
    });

    if (!all.length) {
      l.innerHTML = '<div class="bg-green-900/30 text-green-400 p-4 rounded-xl text-center font-bold">لا أعطال مسجلة</div>';
      updSysGrid([]);
      return;
    }
    renderFaults(all);
    dispSmart(all.map(function(f) { return f.code; }));
    dispHealth(all, runDiag(all.map(function(f) { return f.code; })));
  } catch (e) {
    l.innerHTML = '<p class="text-red-400 text-center py-4">خطأ: ' + e.message + '</p>';
  } finally {
    resumeLive();
  }
}

export async function scanAll() {
  var l = document.getElementById('dtcList');
  if (!l) return;

  if (app.isDemo) {
    var demoFaults = [
      { code: 'P0300', system: 'engine', type: 'confirmed' },
      { code: 'P0171', system: 'fuel', type: 'confirmed' },
      { code: 'P0420', system: 'exhaust', type: 'pending' },
      { code: 'U0100', system: 'electronics', type: 'confirmed' }
    ];
    renderFaults(demoFaults);
    dispSmart(demoFaults.map(function(f) { return f.code; }));
    dispHealth(demoFaults, runDiag(demoFaults.map(function(f) { return f.code; })));
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
    var all = [];
    var answered = 0;
    for (var n = 0; n < 8; n++) {
      var addr = '7E' + n;
      await sendCmd('AT SH ' + addr, 800, 0);
      var p = parseUDS(await sendCmd('19 02 FF', 2500, 0));
      if (!p.ok) continue;
      answered++;
      
      p.codes.forEach(function(c) {
        if (!all.some(function(f) { return f.code === c; })) {
          var info = getInfo(c);
          // استخدام النظام من قاعدة البيانات، وإلا استخدام رقم الوحدة
          var sysName = info.zone !== 'engine' ? info.zone : (n === 0 ? 'engine' : n === 1 ? 'transmission' : ('ECU ' + addr));
          all.push({ code: c, system: sysName, type: 'confirmed' });
        }
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
    dispSmart(all.map(function(f) { return f.code; }));
    dispHealth(all, runDiag(all.map(function(f) { return f.code; })));
  } catch (e) {
    l.innerHTML = '<p class="text-red-400 text-center py-4">خطأ: ' + e.message + '</p>';
  } finally {
    resumeLive();
  }
}

export async function clearDTCs() {
  var l = document.getElementById('dtcList');

  if (app.isDemo) {
    if (l) l.innerHTML = '<div class="bg-green-900/30 text-green-400 p-4 rounded-xl text-center font-bold">✅ تم مسح الأعطال (تجريبي)</div>';
    hideRelatedUI();
    updSysGrid([]);
    return;
  }

  if (!app.isConnected) { alert('غير متصل'); return; }
  if (!confirm('مسح الأعطال سيحذف freeze frame. متابعة؟')) return;

  await pauseLiveWait();
  try {
    var r = await sendCmd('04', 5000, 0);
    if (parseMsgs(r).some(function(m) { return m[0] === 0x44; })) {
      if (l) l.innerHTML = '<div class="bg-green-900/30 text-green-400 p-4 rounded-xl text-center font-bold">✅ تم مسح الأعطال</div>';
      hideRelatedUI();
      updSysGrid([]);
    } else {
      if (l) l.innerHTML = '<div class="bg-amber-900/30 text-amber-300 p-4 rounded-xl text-center font-bold">لم تؤكد السيارة المسح</div>';
    }
  } catch (e) {
    if (l) l.innerHTML = '<p class="text-red-400 text-center py-4">' + e.message + '</p>';
  } finally {
    resumeLive();
  }
}

// ═══════════════════════════════════════════════
// التصميم الجديد لعرض الأعطال (DTC Cards)
// ═══════════════════════════════════════════════
function renderFaults(faults) {
  var l = document.getElementById('dtcList');
  if (!l) return;
  
  if (!faults.length) {
    l.innerHTML = `
      <div class="text-center py-6 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
        <i class="fa-solid fa-check-circle text-4xl text-emerald-500 mb-2"></i>
        <p class="text-emerald-400 font-bold">لا توجد أعطال مسجلة</p>
        <p class="text-xs text-gray-400 mt-1">النظام سليم تماماً</p>
      </div>`;
    updSysGrid([]);
    return;
  }

  var h = '';
  faults.forEach(function(f) {
    var info = getInfo(f.code);
    var severity = info.severity || 'medium'; 
    
    let icon = 'fa-triangle-exclamation';
    if (severity === 'critical') icon = 'fa-radiation';
    if (severity === 'high') icon = 'fa-engine';

    h += `
      <div class="dtc-card sev-${severity}" data-code="${f.code}" onclick="openDtcDetail('${f.code}')">
        <div class="flex items-center gap-3">
          <div class="dtc-icon">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div>
            <span class="dtc-code">${f.code}</span>
            <span class="dtc-desc">${info.title || 'عطل غير معروف'}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
            <button type="button" class="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2 py-1 rounded font-bold" data-ff="1" onclick="event.stopPropagation(); if(window.openFreezeFrame) window.openFreezeFrame();">❄️</button>
            <i class="fa-solid fa-chevron-left text-gray-500"></i>
        </div>
      </div>
    `;
  });
  
  l.innerHTML = h;
  
  var exportBar = document.getElementById('proExportBar');
  if (exportBar) exportBar.classList.remove('hidden');

  updSysGrid(faults);

  try {
    var hist = JSON.parse(localStorage.getItem('checkdiga_hist') || '[]');
    hist.unshift({ date: new Date().toISOString(), faults: faults.map(function(f) { return { code: f.code, type: f.type }; }) });
    localStorage.setItem('checkdiga_hist', JSON.stringify(hist.slice(0, 20)));
  } catch (_) {}
}

// دالة فتح التفاصيل (Modal)
window.openDtcDetail = function(code) {
  const modal = document.getElementById('dtcDetailModal');
  const content = document.getElementById('dtcDetailContent');
  if (!modal || !content) return;

  const info = getInfo(code);
  
  let html = `
    <div class="text-center mb-4 border-b border-gray-700 pb-3">
      <div class="text-3xl font-black font-mono text-blue-400 mb-1">${code}</div>
      <div class="text-sm font-bold text-gray-300">${info.title || 'عطل غير معروف'}</div>
      <div class="text-[10px] text-gray-500 mt-1">${info.title_en || ''}</div>
    </div>
  `;

  if (info.causes && info.causes.length > 0) {
    html += `<div class="bg-gray-900 rounded-xl p-3 mb-3 border border-gray-700">
      <h4 class="text-xs font-bold text-amber-400 mb-2"><i class="fa-solid fa-magnifying-glass"></i> الأسباب المحتملة:</h4>
      <ul class="text-sm text-gray-300 space-y-1">`;
    info.causes.forEach(c => {
      if (typeof c === 'string') html += `<li>• ${c}</li>`;
      else if (c.c) html += `<li>• ${c.c} <span class="text-gray-500 text-xs">(${Math.round((c.p || 0)*100)}%)</span></li>`;
    });
    html += `</ul></div>`;
  }

  if (info.steps && info.steps.length > 0) {
    html += `<div class="bg-blue-900/20 rounded-xl p-3 mb-3 border border-blue-800">
      <h4 class="text-xs font-bold text-blue-400 mb-2"><i class="fa-solid fa-wrench"></i> خطوات الفحص:</h4>
      <ul class="text-sm text-blue-200 space-y-1">`;
    info.steps.forEach(s => { html += `<li>• ${s}</li>`; });
    html += `</ul></div>`;
  }
  
  if (info.symptoms && info.symptoms.length > 0) {
    html += `<div class="bg-rose-900/20 rounded-xl p-3 mb-3 border border-rose-800">
      <h4 class="text-xs font-bold text-rose-400 mb-2"><i class="fa-solid fa-car-burst"></i> الأعراض:</h4>
      <ul class="text-sm text-rose-200 space-y-1">`;
    info.symptoms.forEach(s => { html += `<li>• ${s}</li>`; });
    html += `</ul></div>`;
  }

  content.innerHTML = html;
  modal.classList.remove('hidden');
};
