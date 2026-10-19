import { app } from './state.js';
import { sendCmd, pauseLiveWait, resumeLive, log, readOdometer, pHex } from './obd.js';
import { getInfo } from './data/database.js';

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
    const vinText = document.getElementById('vin-display').textContent;
    const vin = vinText.replace('VIN: ', '').trim() || 'غير متوفر';

    let odo = 'غير مدعوم';
    if (app.isDemo) {
      odo = '145,300 كم';
    } else {
      // ✅ إصلاح: استخدام دالة قراءة العداد الأصلية بدلاً من تكرارها
      const odoVal = await readOdometer();
      if (odoVal) odo = odoVal + ' كم';
    }

    let faults = [];
    let scanFailed = false;
    
    if (app.isDemo) {
      faults = [{ code: 'P0301', type: 'confirmed' }, { code: 'P0171', type: 'pending' }];
    } else {
      // ✅ إصلاح: قراءة الأعطال الحقيقية من السيارة بدلاً من الذاكرة
      try {
        const res = await sendCmd('03', 5000, 1);
        const b = pHex(res);
        let rawCodes = [];
        
        for (let i = 0; i < b.length; i++) {
          if (b[i] === 0x43) {
            let j = i + 2; // تخطي 0x43 (Mode 03 Response) وبايت عدد الأكواد
            while (j + 1 < b.length) {
              const a = b[j], c = b[j+1];
              if (a === 0 && c === 0) break; // نهاية القائمة
              
              const code = ['P','C','B','U'][a >> 6] + ((a >> 4) & 3).toString(16) + (a & 15).toString(16) + (c >> 4).toString(16) + (c & 15).toString(16);
              rawCodes.push(code.toUpperCase());
              j += 2;
            }
          }
        }
        faults = [...new Set(rawCodes)].map(code => ({ code, type: 'confirmed' }));
      } catch (e) {
        scanFailed = true;
        log('ERR: فشل قراءة الأعطال أثناء التقرير');
      }
    }

    generateReportPDF(vin, odo, faults, scanFailed);

  } catch (e) {
    alert('خطأ أثناء الفحص: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '🕵️‍♂️ فحص ما قبل الشراء'; }
    resumeLive();
  }
}

function generateReportPDF(vin, odo, faults, scanFailed) {
  const date = new Date().toLocaleString('ar');
  
  // ✅ حساب صحة صارم
  let score = 100;
  faults.forEach(f => {
    const c = (f.code || '').toUpperCase();
    if (c.startsWith('U')) score -= 25;
    else if (c.startsWith('B')) score -= 20;
    else if (c.startsWith('C')) score -= 15;
    else if (c.startsWith('P')) score -= 10;
  });
  score = Math.max(0, score);

  // ✅ إصلاح: عرض تحذير حقيقي إذا فشل الفحص
  let warningHtml = '';
  if (scanFailed) {
    warningHtml = '<div class="warning" style="background: #fef3c7; color: #d97706; border-color: #fde68a;">⚠️ لم يتمكن الماسح من قراءة الأعطال. يرجى التأكد من الاتصال بالسيارة وتشغيل المفتاح على ON.</div>';
  } else if (faults.length > 0) {
    warningHtml = '<div class="warning">⚠️ تحذير: تم العثور على أعطال مسجلة في كمبيوتر السيارة!</div>';
  } else {
    warningHtml = '<div style="background: #ecfdf5; color: #047857; padding: 10px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold;">✅ لا توجد أعطال مسجلة في كمبيوتر السيارة.</div>';
  }

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
      .score { text-align: center; padding: 20px; border-radius: 12px; color: white; background: ${scanFailed ? '#64748b' : (score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444')}; margin-bottom: 20px; }
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

    ${warningHtml}

    <div class="score">
      <h2>مؤشر صحة السيارة</h2>
      <h1>${scanFailed ? '--' : score + '/100'}</h1>
      <p>${scanFailed ? 'تعذر الفحص' : (score >= 90 ? 'حالة ممتازة' : score >= 70 ? 'تحتاج صيانة' : 'حالة خطيرة (لا تشترِ)')}</p>
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
      <h3 style="margin-top: 0; color: #0f172a;">الأعطال المكتشفة (${scanFailed ? '؟' : faults.length})</h3>
      ${scanFailed ? '<div style="color: #d97706; font-weight: bold;">لم يتم قراءة الأعطال بنجاح.</div>' : ''}
      ${!scanFailed && faults.length === 0 ? '<div style="color: #10b981; font-weight: bold;">لا توجد أعطال</div>' : ''}
      ${!scanFailed ? faults.map(f => `<div class="fault-item">🚨 ${f.code} - ${getInfo(f.code).title || 'غير معروف'}</div>`).join('') : ''}
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
