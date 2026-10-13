import { toggleTheme } from './theme.js';
import { searchDTC } from './search.js';

export function bindControls() {
  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  };

  // زر الثيم
  bind('btnTheme', toggleTheme);

  // زر المفضلة → انتقل للتبويب
  bind('btnFavorites', () => {
    const t = document.querySelector('[data-tab="favorites"]');
    if (t) t.click();
  });

  // زر إغلاق النافذة المنبثقة
  bind('btnCloseDetail', () => {
    const m = document.getElementById('dtcDetailModal');
    if (m) m.classList.add('hidden');
  });

  // إغلاق النافذة عند الضغط خارجها
  const modal = document.getElementById('dtcDetailModal');
  if (modal) {
    modal.onclick = e => {
      if (e.target.id === 'dtcDetailModal') modal.classList.add('hidden');
    };
  }

  // شارات التنبيه (banners)
  // سنضيفها لاحقاً في initApp
}
