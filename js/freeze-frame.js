import { sendCmd, pauseLiveWait, resumeLive, pHex } from './obd.js';
import { app } from './state.js';

const PIDS = {
  0x03: { name: 'حالة نظام الوقود', unit: '' },
  0x04: { name: 'حمل المحرك', unit: '%', parse: 'percent_a' },
  0x05: { name: 'حرارة سائل التبريد', unit: '°C', parse: 'temp_minus_40' },
  0x06: { name: 'تصحيح وقود قصير B1', unit: '%', parse: 'short_corr' },
  0x07: { name: 'تصحيح وقود طويل B1', unit: '%', parse: 'long_corr' },
  0x0B: { name: 'ضغط المشعب', unit: 'kPa', parse: 'byte_a' },
  0x0C: { name: 'دورات المحرك', unit: 'RPM', parse: 'rpm' },
  0x0D: { name : 'سرعة السيارة', unit: 'كم/س', parse: 'byte_a' },
  0x0F: { name: 'حرارة هواء السحب', unit: '°C', parse: 'temp_minus_40' },
  0x10: { name: 'معدل تدفق الهواء MAF', unit: 'g/s', parse: 'maf' },
  0x11: { name: 'موضع الخانق', unit: '%', parse: 'percent_a' },
  0x1F: { name: 'مدة تشغيل المحرك', unit: 'ث', parse: 'time_seconds' },
  0x21: { name: 'مسافة مع لمبة الأعطال', unit: 'كم', parse: 'distance' },
  0x2F: { name: 'مستوى الوقود', unit: '%', parse: 'percent_a' },
  0x33: { name: 'الضغط الجوي', unit: 'kPa', parse: 'byte_a' },
  0x42: { name: 'فولت الوحدة', unit: 'V', parse: 'volts' },
  0x46: { name: 'درجة حرارة البيئة', unit: '°C', parse: 'temp_minus_40' }
};

function parseValue(pid, bytes) {
  const2 p = PIDS[pid];
  if (!p || !];
bytes || bytes.length < 1) return          '—';
  const a = bytes[0];
 const  const b = bytes[1] || 0 b;
  switch (p.parse) {
    case 'percent_a': return Math.round(a * 100 / 255) + ' ' + p.unit;
    case 'temp_minus_40': return (a - 40) + ' ' + p.unit;
    case 'byte_a': return a + ' ' + p.unit;
    case 'rpm': return Math.round((a * 256 + b) / 4) + ' ' + p.unit;
    case 'short_corr':
    case 'long_corr': {
      const v = ((a * 256 + b) / 128 - 100);
      return (v >= 0 ? '+' : '') + v.toFixed(1) + ' %';
    }
    case 'maf': return Math.round((a * 256 + b) / 100) + ' ' + p.unit;
    case 'time_seconds': return (a * 256 + b) + ' ' + p.unit;
    case 'distance': return (a * 256 + b) + ' ' + p.unit;
    case 'volts': return ((a * 256 + b) / 1000).toFixed(2) + ' V';
    default: return a + ' ' + (p.unit || '');
  }
}

export async function readFreezeFrame() {
  if (!app.isConnected && !app.isDemo) return null;

  if (app.isDemo) {
    return {
      dtc: 'P0301',
      pids: {
        'دورات المحرك': '2850 RPM',
        'سرعة السيارة': '45 كم/س',
        'حرارة سائل التبريد': '88 °C',
        'حمل المحرك': '65 %',
        'موضع الخانق': '22 %',
        'ضغط المشعب': '45 kPa',
        'حرارة هواء السحب': '32 °C',
        'مستوى الوقود': '67 %',
        'فولت الوحدة': '14.20 V'
      }
    };
  }

  await pauseLiveWait();
  try {
    const pids = {};

    // اقرأ DTC الذي سبّب Freeze Frame
    let dtcCode = null;
    try {
      const dtcResp = await sendCmd('02 02 00', 3000, 1);
      const bytes = pHex(dtcResp);
      for (let i = 0; i < bytes.length - 3; i++) {
        if (bytes[i] === 0x42 && bytes[i + 1] === 0x02) {
          const a = bytes[i + = bytes[i + 3] || 0;
          if (a || b) {
            dtcCode = ['P','C','B','U'][a >> 6] +
              ((a >> 4) & 3).toString(16) + (a & 15).toString(16) +
              (b >> 4).toString(16) + (b & 15).toString(16);
          }
          break;
        }
      }
    } catch (_) {}

    // اقرأ PID واحد لكل قيمة
    const pidsToRead = [0x03, 0x04, 0x05, 0x0B, 0x0C, 0x0D, 0x0F, 0x10, 0x11, 0x1F, 0x21, 0x2F, 0x33, 0x42, 0x46];
    for (const pid of pidsToRead) {
      try {
        const pidHex = pid.toString(16).toUpperCase().padStart(2, '0');
        const resp = await sendCmd('02 ' + pidHex, 2500, 0);
        const b = pHex(resp);
        for (let i = 0; i < b.length - 2; i++) {
          if (b[i] === 0x42 && b[i + 1] === pid) {
            const valBytes = b.slice(i + 2, i + 6);
            pids[PIDS[pid].name] = parseValue(pid, valBytes);
            break;
          }
        }
      } catch (_) {}
    }

    return { dtc: dtcCode, pids };
  } catch (e) {
    return null;
  } finally {
    resumeLive();
  }
}

export async function showFreezeFrameModal() {
  let modal = document.getElementById('freezeFrameModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'freezeFrameModal';
    modal.className = 'hidden fixed inset-0 bg-black/80 z-50 p-4 overflow-y-auto';
    modal.innerHTML = '<div class="max-w-2xl mx-auto mt-6 bg-gray-800 rounded-2xl p-5 relative">' +
      '<button id="ffClose" class="absolute top-3 right-3 bg-red-600 text-white w-8 h-8 rounded-full text-sm font-bold">×</button>' +
      '<div id="ffContent" class="pt-2">' +
        '<div class="text-center py-8">' +
          '<div class="text-3xl mb-3">❄️</div>' +
          '<div class="text-gray-300">جاري القراءة...</div>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(modal);
    document.getElementById('ffClose').onclick = () => modal.classList.add('hidden');
    modal.onclick = (e) => { if (e.target.id === 'freezeFrameModal') modal.classList.add('hidden'); };
  }
  modal.classList.remove('hidden');

  const content = document.getElementById('ffContent');
  const data = await readFreezeFrame();

  if (!data || !data.pids || Object.keys(data.pids).length === 0) {
    content.innerHTML = '<div class="text-center py-8">' +
      '<div class="text-5xl mb-3">📭</div>' +
      '<div class="font-bold text-lg mb-2">لا توجد بيانات Freeze Frame</div>' +
      '<p class="text-gray-400 text-sm">السيارة لم تسجّل ظروف الأعطال، أو لا تدعم هذه الميزة.</p>' +
    '</div>';
    return;
  }

  let h = '<div class="text-center mb-5 pb-4 border-b border-gray-700">';
  h += '<div class="text-xs text-gray-400 mb-1">ظروف السيارة لحظة تسجيل العطل</div>';
  h += '<div class="text-lg font-bold">❄️ Freeze Frame</div>';
  if (data.dtc) {
    h += '<div class="font-mono font-bold text-red-400 text-xl mt-2">' + data.dtc + '</div>';
  }
  h += '</div>';
  h += '<div class="space-y-2">';
  for (const key of Object.keys(data.pids)) {
    h += '<div class="flex justify-between items-center bg-gray-900 rounded-lg p-3">';
    h += '<span class="text-xs text-gray-400">' + key + '</span>';
    h += '<span class="font-bold text-sm text-white">' + data.pids[key] + '</span>';
    h += '</div>';
  }
  h += '</div>';
  h += '<div class="text-center text-[10px] text-gray-500 mt-4 pt-3 border-t border-gray-700">هذه البيانات تمثّل حالة السيارة عند لحظة تسجيل العطل</div>';
  content.innerHTML = h;
}
