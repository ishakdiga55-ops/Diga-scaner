import { sendCmd, pHex } from './obd.js';
import { app } from './state.js';

function parseV(pid, bytes) {
  const a = bytes[0] || 0;
  const b = bytes[1] || 0;
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

const PID_NAMES = {
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

const PID_LIST = [0x04, 0x05, 0x0B, 0x0C, 0x0D, 0x0F, 0x10, 0x11, 0x2F, 0x42, 0x46];

export async function showFreezeFrameModal() {
  let modal = document.getElementById('ffModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ffModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:50;overflow-y:auto;padding:16px;';
    modal.innerHTML =
      '<div style="max-width:600px;margin:24px auto;background:#1f2937;border-radius:16px;padding:20px;position:relative;">' +
        '<button id="ffClose" style="position:absolute;top:12px;right:12px;background:#dc2626;color:#fff;width:32px;height:32px;border-radius:50%;border:none;font-size:18px;font-weight:bold;cursor:pointer;">×</button>' +
        '<div id="ffBody" style="padding-top:8px;color:#e5e7eb;"></div>' +
      '</div>';
    document.body.appendChild(modal);
    document.getElementById('ffClose').onclick = function () { modal.style.display = 'none'; };
    modal.onclick = function (e) { if (e.target.id === 'ffModal') modal.style.display = 'none'; };
  }

  const body = document.getElementById('ffBody');

  // Demo mode
  if (app.isDemo) {
    body.innerHTML = buildReport('P0301', [
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
    modal.style.display = 'block';
    return;
  }

  if (!app.isConnected) {
    body.innerHTML = '<div style="text-align:center;padding:40px 20px;">' +
      '<div style="font-size:40px;margin-bottom:12px;">⚠️</div>' +
      '<div style="font-weight:bold;">غير متصل بالسيارة</div>' +
    '</div>';
    modal.style.display = 'block';
    return;
  }

  body.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#9ca3af;">جاري القراءة...</div>';
  modal.style.display = 'block';

  const results = [];
  for (const pid of PID_LIST) {
    try {
      const hex = pid.toString(16).toUpperCase().padStart(2, '0');
      const resp = await sendCmd('02 ' + hex, 2500, 0);
      const bytes = pHex(resp);
      for (let i = 0; i < bytes.length - 2; i++) {
        if (bytes[i] === 0x42 && bytes[i + 1] === pid) {
          results.push([PID_NAMES[pid], parseV(pid, bytes.slice(i + 2, i + 6))]);
          break;
        }
      }
    } catch (_) {}
  }

  if (results.length === 0) {
    body.innerHTML = '<div style="text-align:center;padding:40px 20px;">' +
      '<div style="font-size:40px;margin-bottom:12px;">📭</div>' +
      '<div style="font-weight:bold;margin-bottom:8px;">لا توجد بيانات Freeze Frame</div>' +
      '<div style="color:#9ca3af;font-size:13px;">السيارة لم تسجّل ظروف الأعطال.</div>' +
    '</div>';
    return;
  }

  body.innerHTML = buildReport(null, results);
}

function buildReport(dtc, rows) {
  let h = '<div style="text-align:center;padding-bottom:16px;border-bottom:1px solid #374151;margin-bottom:16px;">';
  h += '<div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">ظروف السيارة لحظة تسجيل العطل</div>';
  h += '<div style="font-size:18px;font-weight:bold;">❄️ Freeze Frame</div>';
  if (dtc) h += '<div style="font-family:monospace;color:#f87171;font-size:20px;font-weight:bold;margin-top:8px;">' + dtc + '</div>';
  h += '</div>';
  h += '<div style="display:flex;flex-direction:column;gap:8px```;">';
  rows.forEach(function (r)javascript {
    h += '<
div style="display:flex;justify   -content:space-between;background:#111827;padding:12px;border-radius:8px;">';
    h += '<span style="font-size:13px;color:#9ca3af;">' + r[0] + '</span>';
    h += '<span style="font-weight:bold;font-size:14px;color:#fff;">' + r[1] + '</span>';
    h += '</div>';
  });
  h += '</div>';
  h += '<div style="text-align:center;font-size:11px;color:#6b7280;margin-top:16px;padding-top:12px;border-top:1px solid #374151;">هذه البيانات تمثّل حالة السيارة عند لحظة تسجيل العطل</div>';
  return h;
}
