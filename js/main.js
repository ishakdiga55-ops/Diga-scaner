import { app, initApp } from './state.js';
import { log, connectOBD, connectUSB, connectWiFi, handleDisc, updAllG } from './obd.js';
import { readDTCs, scanAll, clearDTCs } from './obd-commands.js';
import { initTheme } from './ui/theme.js';
import { initSearch } from './ui/search.js';
import { initSymp, initPop, initFamily, initSevFilters, initTabs,
         updFavCount, renderHist, clearHist, renderStats } from './ui-extras.js';
import { startDemo, stopDemo, batUI, runBatteryTest,
         runReadiness, exportPDF, shareWA } from './extras.js';
import { loadFullDatabase } from './data/loader.js';
import { DTC_DATABASE } from './data/database.js';
import { isNativeApp, connectNativeBluetooth } from './obd-native.js';
import { runPrePurchaseScan } from './inspector.js';
import { initLang } from './i18n.js'; // ✅ استيراد اللغة

function init() {
  initApp();

  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  };

  const connectModal = document.getElementById('connectModal');
  
  bind('open-connect-modal', () => {
    if (connectModal) connectModal.classList.remove('hidden');
  });
  
  bind('close-connect-modal', () => {
    if (connectModal) connectModal.classList.add('hidden');
  });
  
  if (connectModal) {
    connectModal.onclick = (e) => {
      if (e.target.id === 'connectModal') connectModal.classList.add('hidden');
    };
  }

  if (isNativeApp) {
    const btnWebBle = document.getElementById('connect-btn');
    if (btnWebBle) btnWebBle.style.display = 'none';
    
    const btnNativeClassic = document.getElementById('connect-native-classic');
    if (btnNativeClassic) {
      btnNativeClassic.classList.remove('hidden');
      btnNativeClassic.onclick = () => {
        connectModal.classList.add('hidden');
        connectNativeBluetooth();
      };
    }
  } else {
    // ✅ إخفاء زر Wi-Fi في المتصفح
    const btnWifi = document.getElementById('wifi-btn');
    if (btnWifi) btnWifi.style.display = 'none';
  }

  bind('connect-btn', async () => {
    if (connectModal) connectModal.classList.add('hidden');
    let success = false;
    try { success = await connectOBD(false); } catch (_) {}
    if (success) {
      try { const m = await import m.readVIN(); } catch (_) {}
    }
  });

  bind('usb-btn', async () => {
    if (connectModal) connectModal.classList.add('hidden');
    let success = false;
    try { success = await connectUSB(); } catch (_) {}
    if (success) {
      try { const m = await import('./vin.js'); await m.readVIN(); } catch (_) {}
    }
  });
  
  bind('wifi-btn', async () => {
    if (connectModal) connectModal.classList.add('hidden');
    const ip = prompt('أدخل عنوان IP لجهاز Wi-Fi', '192.168.0.10');
    if (!ip) return;
    let success = false;
    try { success = await connectWiFi(ip); } catch (_) {}
    if (success) {
      try { const m = await import('./vin.js'); await m.readVIN(); } catch (_) {}
    }
  });

  bind('demo-btn', async () => {
    if (connectModal) connectModal.classList.add('hidden');
    try { startDemo(); } catch (_) {}
    try { readDTCs(); } catch (_) {}
    try { const m = await import('./vin.js'); await m.readVIN(); } catch (_) {}
  });

  bind('disconnect-btn', async () => {
    try { stopDemo(); } catch (_) {}
    try { await handleDisc(); } catch (_) {}
    try { const m = await import('./vin.js'); m.resetVIN(); } catch (_) {}
  });

  bind('clear-btn', async () => {
    if (!app.isConnected && !app.isDemo) { alert('اتصل بالسيارة أولاً'); return; }
    await clearDTCs();
  });
  
  bind('btnReadDTC', readDTCs);
  bind('btnScanAll', scanAll);
  bind('btnScanABS', async () => {
    try { const m = await import('./abs-scan.js'); await m.scanABS(); } catch (err) { alert('خطأ في فحص ABS'); }
  });

  bind('btnPrePurchase', runPrePurchaseScan);

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

  const dd = document.getElementById('dtcDetailModal');
  if (dd) dd.onclick = e => { if (e.target.id === 'dtcDetailModal') dd.classList.add('hidden'); };

  // ✅ تفعيل اللغة
  initLang();

  initTheme();
  initTabs();
  initSearch();
  initSymp();
  initPop();
  initFamily();
  initSevFilters();
  updFavCount();
  batUI();

  if (app.isIOS && !app.isBluefy) {
    const b = document.getElementById('bluefyBanner');
    if (b) b.classList.remove('hidden');
  }
  if (!app.hasSerial && !app.isIOS) {
    const b = document.getElementById('serialBanner');
    if (b) b.classList.remove('hidden');
  }

  setTimeout(() => updAllG({ rpm: null, speed: null, coolant: null, fuelLevel: null }), 300);

  log('OK: ' + Object.keys(DTC_DATABASE).length + ' عطل أساسي');
  log('INFO: تحميل قاعدة البيانات...');

  loadFullDatabase().catch(e => log('WARN: ' + e.message));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
