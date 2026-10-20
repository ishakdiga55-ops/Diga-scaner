import { app, live, session } from './state.js';
import { sendCmd, pauseLiveWait, resumeLive, updAllG } from './obd.js';
import { runDiag, confLabel, calcHealth } from './analysis.js';
import { getInfo } from './data/database.js';

export function startDemo() {
  app.isDemo = true;
  app.isConnected = true;
  app.transport = null;
  setStatusDemo();
  updConnUIDemo();

  const heroCard = document.getElementById('hero-car-card');
  if (heroCard) {
    heroCard.classList.remove('hidden');
    const hv = document.getElementById('hero-vin');
    if (hv) hv.textContent = 'VIN: 1HGCG5655WA123456';
    const ho = document.getElementById('hero-odo');
    if (ho) ho.textContent = '145,300';
  }

  if (session.demoTimer) clearInterval(session.demoTimer);
  session.demoTimer = setInterval(function () {
    var r = Math.floor(900 + Math.random() * 2500);
    var s = Math.floor(Math.random() * 110);
    var c = 82 + Math.floor(Math.random() * 18);
    var f = 40 + Math.floor(Math.random() * 50);
    live.lastCoolant = c;
    live.lastFuel = f;
    try { updAllG({ rpm: r, speed: s, coolant: c, fuelLevel: f }); } catch (_) {}
    try { updChart(r, s); } catch (_) {}
    try { autoAnalyze(r, s, c); } catch (_) {}
  }, 1500);
}

export function stopDemo() {
  if (session.demoTimer) clearInterval(session.demoTimer);
  session.demoTimer = null;
  app.isDemo = false;
  const heroCard = document.getElementById('hero-car-card');
  if (heroCard) heroCard.classList.add('hidden');
}

function setStatusDemo() {
  var e = document.getElementById('connection-status');
  var d = document.getElementById('statusDot');
  if (e) { e.textContent = 'وضع تجريبي'; e.className = 'text-sm font-bold text-amber-400'; }
  if (d) d.className = 'w-3 h-3 rounded-full bg-amber-500';
}

function updConnUIDemo() {
  var cb = document.getElementById('open-connect-modal');
  var x = document.getElementById('disconnect-btn');
  var clearBtn = document.getElementById('clear-btn');
  if (cb) cb.classList.add('hidden');
  if (x) x.classList.remove('hidden');
  if (clearBtn) clearBtn.classList.remove('mb-2');
}

var BAT_HINTS = [
  '① المفتاح على ON والمحرك مطفأ ثم اضغط «قراءة»',
  '② شغّل المحرك على الخمول ثم اضغط «قراءة»',
  '③ شغّل الأحمال وارفع الدوران ~2000 ثم اضغط «قراءة»'
];

export function batUI() {
  var b = document.getElementById('btnBatteryTest');
  var h = document.getElementById('batHint');
  var step = session.batteryStep || 0;
  if (h) h.textContent = BAT_HINTS[step] + (app.isDemo ? ' (تجريبي)' : '');
  if (b) {
    if (step === 0) b.innerHTML = '<i class="fa-solid fa-bolt"></i> بدء الاختبار';
    else b.innerHTML = '<i class="fa-solid fa-bolt"></i> قراءة المرحلة ' + (step + 1);
  }
}

function batSet(n, val) {
  var rg = [[12.4, 12.8], [13.8, 14.8], [13.5, 14.8]][n - 1];
  var b = document.getElementById('bat' + n);
  var e = document.getElementById('batVal' + n);
  if (!b || !e) return;
  if (val == null) { e.textContent = 'غير مدعوم'; e.style.color = '#94a3b8'; return; }
  e.textContent = val.toFixed(2) + 'V';
  var ok = val >= rg[0] && val <= rg[1];
  var w = val >= rg[0] - 0.5 && val <= rg[1] + 0.5;
  var c = ok ? '#10b981' : w ? '#f59e0b' : '#ef4444';
  b.style.borderColor = c;
  e.style.color = c;
}

function batFinish() {
  var vals = session.batteryVals || [null, null, null];
  var a = vals[0], b = vals[1], c = vals[2];
  var cl = 'bg-green-600';
  var t = [];
  var bad = function () { cl = 'bg-red-600'; };
  var warn = function () { if (cl !== 'bg-red-600') cl = 'bg-yellow-600'; };
  if (a == null && b == null && c == null) {
    batVerdictShow('bg-gray-600', '⚠️ لم نتمكن من قراءة الجهد');
    return;
  }
  if (a != null) {
    if (a < 12.0) { bad(); t.push('البطارية فارغة'); }
    else if (a < 12.4) { warn(); t.push('تحتاج شحن'); }
    else t.push('البطارية جيدة');
  }
  if (b != null) {
    if (b < 13.0) { bad(); t.push('الدينامو لا يشحن'); }
    else if (b < 13.8) { warn(); t.push('الشحن ضعيف'); }
    else if (b > 15.0) { bad(); t.push('شحن زائد'); }
    else t.push('الشحن جيد');
  }
  if (c != null) {
    if (c < 13.0) { bad(); t.push('لا يتحمل الأحمال'); }
    else if (c < 13.5) { warn(); t.push('الشحن تحت الحمل ضعيف'); }
  }
  batVerdictShow(cl, t.join(' • ') + ' (نتيجة مبدئية)');
}

function batVerdictShow(cl, t) {
  var v = document.getElementById('batteryVerdict');
  if (!v) return;
  v.className = 'p-3 rounded-xl text-white font-bold text-center ' + cl;
  v.textContent = t;
  v.classList.remove('hidden');
}

async function readVolt() {
  var m = String(await sendCmd('AT RV', 2000, 0)).match(/(\d{1,2}\.\d+)/);
  if (m) {
    var v = parseFloat(m[1]);
    if (v > 0 && v < 20) return v;
  }
  var resp = await sendCmd('01 42', 2500, 1);
  var b = resp.replace(/[^0-9A-Fa-f]/g, ' ').trim().split(/\s+/).map(function (x) { return parseInt(x, 16); }).filter(function (n) { return !isNaN(n); });
  for (var i = 0; i < b.length - 3; i++) {
    if (b[i] === 0x41 && b[i + 1] === 0x42) {
      var volts = ((b[i + 2] * 256) + b[i + 3]) / 1000;
      if (volts > 0 && volts < 20) return volts;
    }
  }
  return null;
}

export async function runBatteryTest() {
  var btn = document.getElementById('btnBatteryTest');
  var v = document.getElementById('batteryVerdict');
  if (!btn) return;
  if (!app.isConnected && !app.isDemo) {
    batVerdictShow('bg-red-600', '⚠️ غير متصل');
    return;
  }
  if (!session.batteryStep) session.batteryStep = 0;
  if (!session.batteryVals) session.batteryVals = [null, null, null];

  if (session.batteryStep === 0) {
    session.batteryVals = [null, null, null];
    for (var i = 1; i <= 3; i++) {
      var b = document.getElementById('bat' + i);
      var e = document.getElementById('batVal' + i);
      if (b) b.style.borderColor = '';
      if (e) { e.textContent = '--'; e.style.color = ''; }
    }
    if (v) v.classList.add('hidden');
  }
  btn.disabled = true;
  try {
    var val;
    if (app.isDemo) val = [12.6, 14.2, 13.9][session.batteryStep] + (Math.random() * 0.3 - 0.1);
    else { await pauseLiveWait(); val = await readVolt(); }
    session.batteryVals[session.batteryStep] = val;
    batSet(session.batteryStep + 1, val);
    session.batteryStep++;
    if (session.batteryStep >= 3) {
      session.batteryStep = 0;
      batFinish();
    }
  } catch (e) {
    console.log('ERR battery: ' + e.message);
  } finally {
    btn.disabled = false;
    if (!app.isDemo) resumeLive();
    batUI();
  }
}

function pMon(b, bit) {
  if (!(b & (1 << bit))) return 'na';
  return (b & (1 << (bit + 4))) ? 'no' : 'yes';
}

export function runReadiness() {
  var c = document.getElementById('readinessContent');
  if (!c) return;
  if (app.isDemo) {
    renderReadiness({ mil: true, dtc: 3, c1: 'no', c2: 'yes', c3: 'yes', n1: 'yes', n3: 'no', n4: 'yes', n6: 'na' });
    return;
  }
  if (!app.isConnected) {
    c.innerHTML = '<p class="text-amber-400 text-center py-4">⚠️ غير متصل</p>';
    return;
  }
  c.innerHTML = '<p class="text-blue-400 text-center py-4">جاري الفحص...</p>';
  sendCmd('01 01', 3500).then(function (res) {
    var hex = res.replace(/[^0-9A-Fa-f]/g, ' ').trim().split(/\s+/).map(function (x) { return parseInt(x, 16); }).filter(function (n) { return !isNaN(n); });
    var idx = -1;
    for (var i = 0; i < hex.length - 5; i++) {
      if (hex[i] === 0x41 && hex[i + 1] === 0x01) { idx = i; break; }
    }
    if (idx === -1) { c.innerHTML = '<p class="text-red-400 text-center py-4">لا يوجد رد</p>'; return; }
    var A = hex[idx + 2], B = hex[idx + 3], C = hex[idx + 4];
    renderReadiness({
      mil: (A & 0x80) !== 0, dtc: A & 0x7F,
      c1: pMon(B, 0), c2: pMon(B, 1), c3: pMon(B, 2),
      n1: pMon(C, 0), n3: pMon(C, 2), n4: pMon(C, 5), n6: pMon(C, 7)
    });
  }).catch(function () { c.innerHTML = '<p class="text-red-400 text-center py-4">خطأ</p>'; });
}

function renderReadiness(d) {
  var c = document.getElementById('readinessContent');
  if (!c) return;
  var ri = function (n, s) {
    var cl = s === 'yes' ? 'bg-green-600' : s === 'no' ? 'bg-red-600' : 'bg-gray-600';
    var l = s === 'yes' ? 'جاهز' : s === 'no' ? 'غير جاهز' : 'غير مدعوم';
    return '<div class="flex justify-between items-center p-2 bg-gray-900 rounded-lg mb-1"><span class="text-xs">' + n + '</span><span class="text-[10px] px-2 py-1 rounded ' + cl + ' text-white font-bold">' + l + '</span></div>';
  };
  var h = '<div class="' + (d.mil ? 'bg-red-600' : 'bg-green-600') + ' text-white p-3 rounded-xl mb-3 flex justify-between"><span class="font-bold text-sm">' + (d.mil ? '🚨 لمبة المحرك مضاءة' : '✅ لمبة المحرك مطفأة') + '</span><span>أعطال: ' + d.dtc + '</span></div>';
  h += '<div class="text-xs font-bold text-blue-300 mb-2">مراقبات مستمرة:</div>';
  h += ri('الاشتعال', d.c1) + ri('الوقود', d.c2) + ri('المكونات الشاملة', d.c3);
  h += '<div class="text-xs font-bold text-purple-300 mb-2 mt-3">مراقبات غير مستمرة:</div>';
  h += ri('الكتلايزر', d.n1) + ri('EVAP', d.n3) + ri('حساس O2', d.n4) + ri('EGR / VVT', d.n6);
  c.innerHTML = h;
}

export function exportPDF() {
  var faults = session.lastFaults || [];
  if (!faults.length) { alert('لا توجد أعطال لتصديرها'); return; }
  var date = new Date().toLocaleString('ar');
  var diag = runDiag(faults.map(function (f) { return f.code; }));
  var score = calcHealth(faults, diag);
  var h = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>تقرير CheckDiga</title><style>body{font-family:"Cairo",system-ui,sans-serif;padding:30px;color:#1e293b;background:#fff}h1{color:#2563eb;border-bottom:3px solid #2563eb;padding-bottom:10px}.sc{background:' + (score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444') + ';color:white;padding:20px;border-radius:14px;text-align:center;font-size:36px;font-weight:bold;margin:20px 0}.f{background:#fef2f2;padding:12px;margin:8px 0;border-radius:8px;border-right:4px solid #ef4444}.d{background:#f5f3ff;padding:10px;border-radius:8px;margin:8px 0}footer{text-align:center;color:#94a3b8;font-size:11px;margin-top:30px}</style></head><body>';
  h += '<h1>🔧 تقرير فحص CheckDiga Pro</h1>';
  h += '<p><b>التاريخ:</b> ' + date + '</p>';
  h += '<div class="sc">صحة السيارة: ' + score + '/100</div>';
  h += '<h2>الأعطال (' + faults.length + ')</h2>';
  faults.forEach(function (f, i) {
    var info = getInfo(f.code);
    var b = info.brand ? ' [' + info.brand + ']' : '';
    h += '<div class="f"><b style="font-family:monospace;color:#b91c1c">#' + (i + 1) + ' ' + f.code + b + '</b><br>' + info.title + '</div>';
  });
  if (diag.length) {
    h += '<h2>تحليل مبدئي</h2>';
    diag.forEach(function (d) {
      h += '<div class="d"><b>' + d.title + ' (' + confLabel(d.conf) + ')</b><br>' + d.desc + '</div>';
    });
  }
  h += '<footer>CheckDiga Pro 2026 — صُنع في الجزائر 🇩🇿</footer></body></html>';
  var blob = new Blob([h], { type: 'text/html;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var w = window.open(url, '_blank');
  if (!w) { alert('من فضلك اسمح بالنوافذ المنبثقة'); URL.revokeObjectURL(url); return; }
  setTimeout(function () {
    try { w.focus(); w.print(); } catch (e) {}
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }, 600);
}

export function shareWA() {
  var faults = session.lastFaults || [];
  if (!faults.length) { alert('لا توجد أعطال'); return; }
  var diag = runDiag(faults.map(function (f) { return f.code; }));
  var score = calcHealth(faults, diag);
  var m = '*تقرير CheckDiga Pro*\n----------------\n\nصحة السيارة: ' + score + '/100\n\n*الأعطال (' + faults.length + '):*\n';
  faults.forEach(function (f, i) {
    var info = getInfo(f.code);
    var b = info.brand ? ' [' + info.brand + ']' : '';
    m += (i + 1) + '. *' + f.code + '*' + b + ' — ' + info.title + '\n';
  });
  if (diag.length) {
    m += '\n*التشخيص:*\n';
    diag.forEach(function (d) { m += '• ' + d.title + ' (' + d.conf + '%)\n'; });
  }
  m += '\n----------------\n' + location.origin;
  window.open('https://wa.me/?text=' + encodeURIComponent(m), '_blank');
}

export function initChart() {
  var cv = document.getElementById('liveChart');
  if (!cv) return;
  if (!window.Chart) return;
  if (session.chartInstance) {
    try { session.chartInstance.resize(); } catch (_) {}
    return;
  }
  try {
    var ctx = cv.getContext('2d');
    var gradRPM = ctx.createLinearGradient(0, 0, 0, 280);
    gradRPM.addColorStop(0, 'rgba(59, 130, 246, 0.55)');
    gradRPM.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
    gradRPM.addColorStop(1, 'rgba(59, 130, 246, 0)');
    var gradSpeed = ctx.createLinearGradient(0, 0, 0, 280);
    gradSpeed.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
    gradSpeed.addColorStop(0.5, 'rgba(16, 185, 129, 0.12)');
    gradSpeed.addColorStop(1, 'rgba(16, 185, 129, 0)');

    session.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'RPM', data: [], borderColor: '#60a5fa', backgroundColor: gradRPM, borderWidth: 3, fill: true, tension: 0.4, pointRadius: 0, yAxisID: 'y' },
          { label: 'Speed', data: [], borderColor: '#34d399', backgroundColor: gradSpeed, borderWidth: 3, fill: true, tension: 0.4, pointRadius: 0, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#cbd5e1', font: { family: 'Cairo', size: 12, weight: '600' }, usePointStyle: true, padding: 14 } },
          tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#f1f5f9', bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 10 }
        },
        scales: {
          y: { type: 'linear', position: 'left', min: 0, max: 8000, grid: { color: 'rgba(55, 65, 81, 0.4)' }, ticks: { color: '#60a5fa' } },
          y1: { type: 'linear', position: 'right', min: 0, max: 220, grid: { display: false }, ticks: { color: '#34d399' } },
          x: { grid: { color: 'rgba(55, 65, 81, 0.3)' }, ticks: { color: '#94a3b8', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } }
        }
      }
    });
  } catch (e) { console.warn('Chart init failed:', e); }
}

export function updChart(r, s) {
  if (!session.chartInstance) {
    var panel = document.getElementById('panel-live');
    if (panel && !panel.classList.contains('hidden')) {
      try { initChart(); } catch (_) {}
    }
  }
  if (!session.chartInstance) return;
  if (!session.chartData) session.chartData = { labels: [], rpm: [], speed: [] };
  var cd = session.chartData;
  var t = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (cd.labels.length > 20) {
    cd.labels.shift();
    cd.rpm.shift();
    cd.speed.shift();
  }
  cd.labels.push(t);
  cd.rpm.push(r);
  cd.speed.push(s);
  session.chartInstance.data.labels = cd.labels.slice();
  session.chartInstance.data.datasets[0].data = cd.rpm.slice();
  session.chartInstance.data.datasets[1].data = cd.speed.slice();
  session.chartInstance.update('none');
}

export function autoAnalyze(rpm, spd, coolant) {
  var e = document.getElementById('autoAnalysis');
  if (!e) return;
  var f = function (x) { return x == null ? '--' : x; };
  var msg;
  if (coolant != null && coolant >= 105) msg = '🔥 تحذير: حرارة المحرك مرتفعة جداً!';
  else if (coolant != null && coolant >= 95) msg = '⚠️ الحرارة أعلى من الطبيعي';
  else if (rpm != null && rpm > 6500) msg = '⚠️ RPM مرتفع جداً';
  else if (rpm != null && rpm > 0 && rpm < 600 && spd === 0) msg = '⚠️ خمول غير مستقر';
  else if (rpm == null && spd == null && coolant == null) msg = '⚠️ لا قراءات';
  else msg = '✅ القراءات طبيعية';
  e.textContent = msg + ' (RPM: ' + f(rpm) + ' | Speed: ' + f(spd) + ' | Coolant: ' + f(coolant) + (coolant != null ? '°C' : '') + ')';
}

window.__cd_initChart = initChart;
