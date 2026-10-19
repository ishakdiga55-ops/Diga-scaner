import { app } from './state.js';
import { sendCmd, pauseLiveWait, resumeLive, log } from './obd.js';
import { getInfo } from './data/database.js';
import { runDiag, calcHealth } from './analysis.js';

export async function runPrePurchaseScan() {
  if (!app.isConnected && !app.isDemo) {
    alert('يرجى الاتصال بالسيارة أولاً (أو استخدام الوضع التجريبي).');
    return;
  }

  const btn = document.getElementById('btnPrePurchase');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> جاري الفحص...'; }
  
  log('INFO: بدء فحص ما قبل الشراء...');
  await pauseLiveWait();

  try {
    // 1. جلب رقم الهيكل من الواجهة
    const vinText = document.getElementById('vin-display').textContent;
    const vin = vinText.replace('VIN: ', '').trim() || 'غير متوفر';

    // 2. جلب عداد المسافة
    let odo = 'غير مدعوم';
    if (app.isDemo) {
      odo = '145,300 كم';
    } else {
      try {
        const res = await sendCmd('01 A6', 2000, 0);
        const hex = res.replace(/[^0-9A-Fa-f]/g, ' ').trim().split(/\s+/).map(x => parseInt(x, 16));
        for (let i = 0; i < hex.length - 4; i++) {
          if (hex[i] === 0x41 && hex[i + 1] === 0xA6) {
            const km = (hex[i+2] * 16777216) + (hex[i+3] * 65536) + (hex[i+4] * 256) + hex[i+5];
            if (km > 0 && km < 2000000) odo = km.toLocaleString('en-US') + ' كم';
            break;
          }
        }
      } catch (_) {}
    }

    // 3. جلب الأعطال
    let faults = [];
    if (app.isDemo) {
      faults = [{ code: 'P0301', type: 'confirmed' }, { code: 'P0171', type: 'pending' }];
    } else {
      faults = JSON.parse(localStorage.getItem('checkdiga_last') || '[]');
    }

    // 4. توليد التقرير
    generateReportPDF(vin, odo, faults);

  } catch (e) {
    alert('خطأ أثناء الفحص: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '🕵️‍♂️ فحص ما قبل الشراء'; }
    resumeLive();
  }
}

function generateReportPDF(vin, odo, faults) {
  const date = new Date().toLocaleString('ar');
  const diag = runDiag(faults.map(f => f.code));
  const score = calcHealth(faults, diag);

  let h = `
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8">
    <title>تقرير فحص سيارة - CheckDiga</title>
    <style>
      body { font-family: 'Cairo', sans-serif; padding: 30px; background: #fff; color: #1e293b; }
      .header { text-align: center; border-bottom: 4px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px; }
      .logo { font-size: 28px; font-weight: bold; color: #0f172a; }
      .report-title { font-size: 18px; color: #64748b; margin-top: 5px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
      .box { background: #f8fafc; padding: 15px; border-radius: 8px; border-right: 4px solid #3b82f6; }
      .label { font-size: 12px; color: #64748b; margin-bottom: 5px; }
      .value { font-size: 20px; font-weight: bold; color: #0f172a; }
      .score { text-align: center; padding: 20px; border-radius: 12px; color: white; background: ${score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'}; margin-bottom: 20px; }
      .score h1 { margin: 0; font-size: 48px; }
      .score p { margin: 5px 0 0 0; font-size: 14px; }
      .fault-list { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
      .fault-item { padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 16px; color: #b91c1c; }
      .fault-item:last-child { border-bottom: none; }
      .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      .warning { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 10px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">🕵️‍♂️ CheckDiga Scanner</div>
      <div class="report-title">تقرير فحص سيارة مستعملة (ما قبل الشراء)</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 10px;">التاريخ: ${date}</div>
    </div>

    ${faults.length > 0 ? '<div class="warning">⚠️ تحذير: تم العثور على أعطال مسجلة في كمبيوتر السيارة!</div>' : '<div style="background: #ecfdf5; color: #047857; padding: 10px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold;">✅ لا توجد أعطال مسجلة في كمبيوتر السيارة.</div>'}

    <div class="score">
      <h2>مؤشر صحة السيارة</h2>
      <h1>${score}/100</h1>
      <p>${score >= 75 ? 'حالة ممتازة' : score >= 50 ? 'تحتاج صيانة' : 'حالة خطيرة'}</p>
    </div>

    <div class="grid">
      <div class="box">
        <div class="label">رقم الهيكل (VIN)</div>
        <div class="value" style="direction: ltr; text-align: right;">${vin}</div>
      </div>
      <div class="box">
        <div class="label">عداد المسافة (Odometer)</div>
        <div class="value">${odo}</div>
      </div>
    </div>

    <div class="fault-list">
      <h3 style="margin-top: 0; color: #0f172a;">الأعطال المكتشفة (${faults.length})</h3>
      ${faults.length === 0 ? '<div style="color: #10b981; font-weight: bold;">لا توجد أعطال</div>' : ''}
      ${faults.map(f => `<div class="fault-item">🚨 ${f.code} - ${getInfo(f.code).title || 'غير معروف'}</div>`).join('')}
    </div>

    <div class="footer">
      تم إنشاء هذا التقرير بواسطة تطبيق CheckDiga Pro.<br>
      الأداة مساعدة ولا تغني عن الفحص الميكانيكي البصري.
    </div>
  </body>
  </html>
  `;

  const blob = new Blob([h], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) { setTimeout(() => { w.focus(); w.print(); }, 1000); }
}
