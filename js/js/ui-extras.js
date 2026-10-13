import { DTC_DATABASE, getInfo } from './data/database.js';
import { user } from './state.js';

const SYMPTOMS_DB = [
  { label: 'اهتزاز المحرك', icon: '📳', codes: ['P0300','P0301','P0302','P0303','P0304','P0171'] },
  { label: 'دخان أسود', icon: '🖤', codes: ['P0299','P0172','P0175','P0101'] },
  { label: 'دخان أبيض', icon: '⬜', codes: ['P0217','P0118','P0115'] },
  { label: 'لا تشتغل', icon: '🔑', codes: ['P0335','P0340','U0100','P0230'] },
  { label: 'استهلاك مرتفع', icon: '⛽', codes: ['P0171','P0172','P0420','P0101'] },
  { label: 'ضعف التسارع', icon: '🐢', codes: ['P0101','P0299','P0171','P0420'] },
  { label: 'Check Engine', icon: '🚨', codes: ['P0420','P0171','P0300','P0442'] },
  { label: 'حرارة مرتفعة', icon: '🌡️', codes: ['P0217','P0115','P0118','P0128'] },
  { label: 'ضغط الزيت', icon: '🛢️', codes: ['P0524','P0520'] },
  { label: 'مشكلة الجير', icon: '⚙️', codes: ['P0700','P0715','P0720','P0730','P0741'] },
  { label: 'خمول غير مستقر', icon: '📉', codes: ['P0505','P0171','P0300'] },
  { label: 'الفرامل', icon: '🛑', codes: ['C0035','C0040','C0045','C0050','U0121'] }
];

const POPULAR = ['P0300','P0171','P0420','P0128','P0442','P0455','P0301','P0174','U0100','P0299','P2002','C0035'];

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}

function sanitizeCode(s) {
  if (s == null) return '';
  return String(s).toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20);
}

export function isFav(c) {
  return user.favorites.indexOf(sanitizeCode(c)) >= 0;
}

export function toggleFav(c) {
  const x = sanitizeCode(c);
  const i = user.favorites.indexOf(x);
  if (i >= 0) user.favorites.splice(i, 1); else user.favorites.push(x);
  localStorage.setItem('checkdiga_favs', JSON.stringify(user.favorites));
  updFavCount();
  return isFav(x);
}

export function updFavCount() {
  const e = document.getElementById('favCount');
  if (!e) return;
  if (user.favorites.length) {
    e.textContent = user.favorites.length;
    e.classList.remove('hidden');
  } else e.classList.add('hidden');
}
