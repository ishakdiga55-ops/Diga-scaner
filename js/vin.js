import { sendCmd } from './obd.js';
import { app } from './state.js';

function parseVIN(raw) {
  const cleaned = String(raw || '').replace(/[^0-9A-Fa-f]/g, ' ');
  const bytes = [];
  cleaned.trim().split(/\s+/).forEach(x => {
    if (x.length === 2) bytes.push(parseInt(x, 16));
  });
  const chars = [];
  for (const b of bytes) {
    if (b >= 0x30 && b <= 0x39) chars.push(String.fromCharCode(b));
    else if (b >= 0x41 && b <= 0x5A && b !== 0x49 && b !== 0x4F && b !== 0x51) {
      chars.push(String.fromCharCode(b));
    }
  }
  if (chars.length > 17) return chars.slice(-17).join('');
  return chars.join('');
}

function showVIN(text) {
  const el = document.getElementById('vin-display');
  if (el) el.textContent = 'VIN: ' + text;
}

export async function readVIN() {
  if (app.isDemo) {
    showVIN('1HGCG5655WA123456 (تجريبي)');
    return;
  }
  if (!app.isConnected) return;

  showVIN('جاري القراءة...');

  try {
    try { await sendCmd('AT CFC 1', 1000, 0); } catch (_) {}
    const resp = await sendCmd('09 02', 5000, 1);
    const vin = parseVIN(resp);
    if (vin && vin.length === 17) {
      showVIN(vin);
    } else if (vin && vin.length >= 10) {
      showVIN(vin + ' (غير كامل)');
    } else {
      showVIN('غير مدعوم');
    }
  } catch (_) {
    showVIN('غير مدعوم');
  }
}

export function resetVIN() {
  const el = document.getElementById('vin-display');
  if (el) el.textContent = 'VIN: --';
}
