import { app, initApp, user } from './state.js';
import { log, connectOBD, connectUSB, handleDisc, updAllG } from './obd.js';
import { readDTCs, scanAll, clearDTCs } from './obd-commands.js';
import { initTheme } from './ui/theme.js';
import { initSearch } from './ui/search.js';
import { initSymp, initPop, initFamily, initSevFilters, initTabs,
         renderFav, updFavCount, renderHist, clearHist, renderStats,
         toggleFav, isFav } from './ui-extras.js';
import { startDemo, stopDemo, batUI, runBatteryTest,
         runReadiness, exportPDF, shareWA } from './extras.js';
import { loadFullDatabase } from './data/loader.js';
import { DTC_DATABASE } from './data/database.js';

function init() {
  initApp();

  // ربط الأزرار
  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  };

  bind('connect-btn', () => connectOBD(false));
  bind('btShowAll', () => connectOBD(true));
  bind('usb-btn', connectUSB);
  bind('demo-btn', startDemo);
  bind('disconnect-btn', async () => { stopDemo(); await handleDisc(); });
  bind('clear-btn', () => {
    if (!app.isConnected && !app.isDemo) { alert('اتصل بالسيارة أولاً'); return; }
    clearDTCs();
  });
  bind('btnReadDTC', readDTCs);
  bind('btnScanAll', scanAll);
  bind('btnFavorites', () => {
    const t = document.querySelector('[data-tab="favorites"]');
    if (t) t.click();
  });
  bind('btnCloseDetail', () => {
    const m = document.getElementById('dtcDetailModal');
    if (m) m.classList.add('hidden');
  });
  bind('btnReadReadiness', runReadiness);
  bind('btnBatteryTest', runBatteryTest);
  bind('btnClearHistory', clearHist);
  bind('btnExportPDF', exportPDF);
  bind('btnShareWA', shareWA);

  // إغلاق نافذة التفاصيل عند الضغط خارجها
  const dd = document.getElementById('dtcDetailModal');
  if (dd) dd.onclick = e => { if (e.target.id === 'dtcDetailModal') dd.classList.add('hidden'); };

  // تهيئة الوحدات
  initTheme();
  initTabs();
  initSearch();
  initSymp();
  initPop();
  initFamily();
  initSevFilters();
  renderRecent();
  updFavCount();
  batUI();

  // شارات التنبيه
  if (app.isIOS && !app.isBluefy) {
    const b = document.getElementById('bluefyBanner');
    if (b) b.classList.remove('hidden');
  }
  if (!app.hasSerial && !app.isIOS) {
    const b = document.getElementById('serialBanner');
    if (b) b.classList.remove('hidden');
  }

  // تحديث العدادات مبدئياً
  setTimeout(() => updAllG({ rpm: null, speed: null, coolant: null, fuelLevel: null }), 300);

  // تسجيل البداية
  log('OK: ' + Object.keys(DTC_DATABASE).length + ' عطل أساسي');
  log('INFO: تحميل قاعدة البيانات...');

  // تحميل قاعدة البيانات الكاملة
  loadFullDatabase().catch(e => log('WARN: ' + e.message));
}

function renderRecent() {
  // دالة بسيطة — يمكن تحسينها لاحقاً
  const e = document.getElementById('recentSearches');
  if (!e) return;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
