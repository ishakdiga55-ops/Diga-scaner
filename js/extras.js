import { app, live, session } from './state.js';
import { sendCmd, pauseLiveWait, resumeLive, updAllG } from './obd.js';
import { runDiag, confLabel, calcHealth } from './analysis.js';
import { getInfo, DTC_DATABASE } from './data/database.js';

export function startDemo() {
  app.isDemo = true;
  app.isConnected = true;
  app.transport = null;
  setStatusDemo();
  updConnUIDemo();
  if (session.demoTimer) clearInterval(session.demoTimer);
  session.demoTimer = setInterval(() => {
    const r = Math.floor(900 + Math.random() * 2500);
    const s = Math.floor(Math.random() * 110);
    const c = 82 + Math.floor(Math.random() * 18);
    const f = 40 + Math.floor(Math.random() * 50);
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
}

function setStatusDemo() {
  const e = document.getElementById('connection-status');
  const d = document.getElementById('statusDot');
  if (e) { e.textContent = 'وضع تجريبي'; e.className = 'text-sm font-bold text-amber-400'; }
  if (d) d.className = 'w-3 h-3 rounded-full bg-amber-500';
}

function updConnUIDemo() {
  const cb = document.getElementById('connect-btn');
  const ub = document.getElementById('usb-btn');
  const db = document.getElementById('demo-btn');
  const x = document.getElementById('disconnect-btn');
  if (cb) cb.classList.add('hidden');
  if (ub) ub.classList.add('hidden');
  if (db) db.classList.add('hidden');
  if (x) x.classList.remove('hidden');
}

// ═══════════ Battery Test ═══════════
const BAT_HINTS = [
  '① المفتاح على ON والمحرك مطفأ ثم اضغط «قراءة»',
  '② شغّل المحرك على الخمول ثم اضغط «قراءة»',
  '③ شغّل الأحمال وارفع الدوران ~2000 ثم اضغط «قراءة»'
];

export function batUI() {
  const b = document.getElementById('btnBatteryTest');
  const h = document.getElementById('batHint');
  const step = session.batteryStep || 0;
  if (h) h.textContent = BAT_HINTS[step] + (app.isDemo ? ' (تجريبي)' : '');
  if (b) {
    if (step === 0) b.innerHTML = '<i class="fa-solid fa-bolt"></i> بدء الاختبار';
    else b.innerHTML = '<i class="fa-solid fa-bolt"></i> قراءة المرحلة ' + (step + 1);
  }
}

function batSet(n, val) {
  const rg = [[12.4, 12.8], [13.8, 14.8], [13.5, 14.8]][n - 1];
  const b = document.getElementById('bat' + n);
  const e = document.getElementById('batVal' + n);
  if (!b || !e) return;
  if (val == null) { e.textContent = 'غير مدعوم'; e.style.color = '#94a3b8'; return; }
  e.textContent = val.toFixed(2) + 'V';
  const ok = val >= rg[0] && val <= rg[1];
  const w = val >= rg[0] - 0.5 && val <= rg[1] + 0.5;
  const c = ok ? '#10b981' : w ? '#f59e0b' : '#ef4444';
  b.style.borderColor = c;
  e.style.color = c;
}

function batFinish() {
  const vals = session.batteryVals || [null, null, null];
  const [a, b, c] = vals;
  let cl = 'bg-green-600';
  const t = [];
  const bad = () => { cl = 'bg-red-600'; };
  const warn = () => { if (cl !== 'bg-red-600') cl = 'bg-yellow-600'; };
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
  const v = document.getElementById('batteryVerdict');
  if (!v) return;
  v.className = 'p-3 rounded-xl text-white font-bold text-center ' + cl;
  v.textContent = t;
  v.classList.remove('hidden');
}

async function readVolt() {
  const m = String(await sendCmd('AT RV', 2000, 0)).match(/(\d{1,2}\.\d+)/);
  if (m) {
    const v = parseFloat(m[1]);
    if (v > 0 && v < 20) return v;
  }
  const resp = await sendCmd('01 42', 2500, 1);
  const b = resp.replace(/[^0-9A-Fa-f]/g, ' ').trim().split(/\s+/).map(x => parseInt(x, 16)).filter(n => !isNaN(n));
  for (let i = 0; i < b.length - 3; i++) {
    if (b[i] === 0x41 && b[i + 1] === 0x42) {
      const volts = ((b[i + 2] * 256) + b[i + 3]) / 1000;
      if (volts > 0 && volts < 20) return volts;
    }
  }
  return null;
}

export async function runBatteryTest() {
  const btn = document.getElementById('btnBatteryTest');
  const v = document.getElementById('batteryVerdict');
  if (!btn) return;
  if (!app.isConnected && !app.isDemo) {
    batVerdictShow('bg-red-600', '⚠️ غير متصل');
    return;
  }
  if (!session.batteryStep) session.batteryStep = 0;
  if (!session.batteryVals) session.batteryVals = [null, null, null];

  if (session.batteryStep === 0) {
    session.batteryVals = [null, null, null];
    for (let i = 1; i <= 3; i++) {
      const b = document.getElementById('bat' + i);
      const e = document.getElementById('batVal' + i);
      if (b) b.style.borderColor = '';
      if (e) { e.textContent = '--'; e.style.color = ''; }
    }
    if (v) v.classList.add('hidden');
  }
  btn.disabled = true;
  try {
    let val;
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

// ═══════════ Readiness ═══════════
function pMon(b, bit) {
  if (!(b & (1 << bit))) return 'na';
  return (b & (1 << (bit + 4))) ? 'no' : 'yes';
}

export function runReadiness() {
  const c = document.getElementById('readinessContent');
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
  sendCmd('01 01', 3500).then(res => {
    const hex = res.replace(/[^0-9A-Fa-f]/g, ' ').trim().split(/\s+/).map(x => parseInt(x, 16)).filter(n => !isNaN(n));
    let idx = -1;
    for (let i = 0; i < hex.length - 5; i++) {
      if (hex[i] === 0x41 && hex[i + 1] === 0x01) { idx = i; break; }
    }
    if (idx === -1) { c.innerHTML = '<p class="text-red-400 text-center py-4">لا يوجد رد</p>'; return; }
    const A = hex[idx + 2], B = hex[idx + 3], C = hex[idx + 4];
    renderReadiness({
      mil: (A & 0x80) !== 0, dtc: A & 0x7F,
      c1: pMon(B, 0), c2: pMon(B, 1), c3: pMon(B, 2),
      n1: pMon(C, 0), n3: pMon(C, 2), n4: pMon(C, 5), n6: pMon(C, 7)
    });
  }).catch(() => { c.innerHTML = '<p class="text-red-400 text-center py-4">خطأ</p>'; });
}

function renderReadiness(d) {
  const c = document.getElementById('readinessContent');
  if (!c) return;
  const ri = (n, s) => {
    const cl = s === 'yes' ? 'bg-green-600' : s === 'no' ? 'bg-red-600' : 'bg-gray-600';
    const l = s === 'yes' ? 'جاهز' : s === 'no' ? 'غير جاهز' : 'غير مدعوم';
    return '<div class="flex justify-between items-center p-2 bg-gray-900 rounded-lg mb-1"><span class="text-xs">' + n + '</span><span class="text-[10px] px-2 py-1 rounded ' + cl + ' text-white font-bold">' + l + '</span></div>';
  };
  let h = '<div class="' + (d.mil ? 'bg-red-600' : 'bg-green-600') + ' text-white p-3 rounded-xl mb-3 flex justify-between"><span class="font-bold text-sm">' + (d.mil ? '🚨 لمبة المحرك مضاءة' : '✅ لمبة المحرك مطفأة') + '</span><span>أعطال: ' + d.dtc + '</span></div>';
  h += '<div class="text-xs font-bold text-blue-300 mb-2">مراقبات مستمرة:</div>';
  h += ri('الاشتعال', d.c1) + ri('الوقود', d.c2) + ri('المكونات الشاملة', d.c3);
  h += '<div class="text-xs font-bold text-purple-300 mb-2 mt-3">مراقبات غير مستمرة:</div>';
  h += ri('الكتلايزر', d.n1) + ri('EVAP', d.n3) + ri('حساس O2', d.n4) + ri('EGR / VVT', d.n6);
  c.innerHTML = h;
}

// ═══════════ Export PDF ═══════════
export function exportPDF() {
  const faults = session.lastFaults || [];
  if (!faults.length) { alert('لا توجد أعطال لتصديرها'); return; }
  const date = new Date().toLocaleString('ar');
  const diag = runDiag(faults.map(f => f.code));
  const score = calcHealth(faults, diag);
  let h = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>تقرير CheckDiga</title><style>body{font-family:"Cairo",system-ui,sans-serif;padding:30px;color:#1e293b;background:#fff}h1{color:#2563eb;border-bottom:3px solid #2563eb;padding-bottom:10px}.sc{background:' + (score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444') + ';color:white;padding:20px;border-radius:14px;text-align:center;font-size:36px;font-weight:bold;margin:20px 0}.f{background:#fef2f2;padding:12px;margin:8px 0;border-radius:8px;border-right:4px solid #ef4444}.d{background:#f5f3ff;padding:10px;border-radius:8px;margin:8px 0}footer{text-align:center;color:#94a3b8;font-size:11px;margin-top:30px}</style></head><body>';
  h += '<h1>🔧 تقرير فحص CheckDiga Pro</h1>';
  h += '<p><b>التاريخ:</b> ' + date + '</p>';
  h += '<div class="sc">صحة السيارة: ' + score + '/100</div>';
  h += '<h2>الأعطال (' + faults.length + ')</h2>';
  faults.forEach((f, i) => {
    const info = getInfo(f.code);
    const b = info.brand ? ' [' + info.brand + ']' : '';
    h += '<div class="f"><b style="font-family:monospace;color:#b91c1c">#' + (i + 1) + ' ' + f.code + b + '</b><br>' + info.title + '</div>';
  });
  if (diag.length) {
    h += '<h2>تحليل مبدئي</h2>';
    diag.forEach(d => {
      h += '<div class="d"><b>' + d.title + ' (' + confLabel(d.conf) + ')</b><br>' + d.desc + '</div>';
    });
  }
  h += '<footer>CheckDiga Pro 2026 — صُنع في الجزائر 🇩🇿</footer></body></html>';
  const blob = new Blob([h], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (!w) { alert('من فضلك اسمح بالنوافذ المنبثقة'); URL.revokeObjectURL(url); return; }
  setTimeout(() => {
    try { w.focus(); w.print(); } catch (e) {}
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, 600);
}

// ═══════════ WhatsApp Share ═══════════
export function shareWA() {
  const faults = session.lastFaults || [];
  if (!faults.length) { alert('لا توجد أعطال'); return; }
  const diag = runDiag(faults.map(f => f.code));
  const score = calcHealth(faults, diag);
  let m = '*تقرير CheckDiga Pro*\n----------------\n\nصحة السيارة: ' + score + '/100\n\n*الأعطال (' + faults.length + '):*\n';
  faults.forEach((f, i) => {
    const info = getInfo(f.code);
    const b = info.brand ? ' [' + info.brand + ']' : '';
    m += (i + 1) + '. *' + f.code + '*' + b + ' — ' + info.title + '\n';
  });
  if (diag.length) {
    m += '\n*التشخيص:*\n';
    diag.forEach(d => { m += '• ' + d.title + ' (' + d.conf + '%)\n'; });
  }
  m += '\n----------------\n' + location.origin;
  window.open('https://wa.me/?text=' + encodeURIComponent(m), '_blank');
}

// ═══════════ Charts ═══════════
export function initChart() {
  if (session.chartInstance) {
    try { session.chartInstance.resize(); } catch (_) {}
    return;
  }
  const cv = document.getElementById('liveChart');
  if (!cv || !window.Chart) return;
  try {
    session.chartInstance = new Chart(cv.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'RPM', data: [], borderColor: '#3b82f6', tension: 0.3, yAxisID: 'y' },
          { label: 'Speed', data: [], borderColor: '#22c55e', tension: 0.3, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          y: { type: 'linear', position: 'left', grid: { color: '#374151' }, ticks: { color: '#94a3b8' } },
          y1: { type: 'linear', position: 'right', grid: { display: false }, ticks: { color: '#94a3b8' } },
          x: { grid: { color: '#374151' }, ticks: { color: '#94a3b8', font: { size: 9 } } }
        }
      }
    });
  } catch (_) {}
}

export function updChart(r, s) {
  if (!session.chartInstance) initChart();
  if (!session.chartInstance) return;
  if (!session.chartData) session.chartData = { labels: [], rpm: [], speed: [] };
  const cd = session.chartData;
  const t = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

// ═══════════ Auto Analysis ═══════════
export function autoAnalyze(rpm, spd, coolant) {
  const e = document.getElementById('autoAnalysis');
  if (!e) return;
  const f = x => x == null ? '--' : x;
  let msg;
  if (coolant != null && coolant >= 105) msg = '🔥 تحذير: حرارة المحرك مرتفعة جداً!';
  else if (coolant != null && coolant >= 95) msg = '⚠️ الحرارة أعلى من الطبيعي';
  else if (rpm != null && rpm > 6500) msg = '⚠️ RPM مرتفع جداً';
  else if (rpm != null && rpm > 0 && rpm < 600 && spd === 0) msg = '⚠️ خمول غير مستقر';
  else if (rpm == null && spd == null && coolant == null) msg = '⚠️ لا قراءات';
  else msg = '✅ القراءات طبيعية';
  e.textContent = msg + ' (RPM: ' + f(rpm) + ' | Speed: ' + f(spd) + ' | Coolant: ' + f(coolant) + (coolant != null ? '°C' : '') + ')';
}
