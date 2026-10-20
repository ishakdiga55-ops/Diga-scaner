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
import { initLang } from './i18n.js';

// ✅ دوال مساعدة لإظهار وإخفاء شاشة التحميل
function showLoader(text = 'جاري المعالجة...') {
  const loader = document.getElementById('globalLoader');
  const loaderText = document.getElementById('loaderText');
  if (loader && loaderText) {
    loaderText.innerText = text;
    loader.classList.remove('hidden');
  }
}

function hideLoader() {
  const loader = document.getElementById('globalLoader');
  if (loader) loader.classList.add('hidden');
}
// ==========================================

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
        showLoader('جاري الاتصال...');
        connectNativeBluetooth().finally(hideLoader);
      };
    }
  } else {
    const btnWifi = document.getElementById('wifi-btn');
    if (btnWifi) btnWifi.style.display = 'none';
  }

  // ✅ تحسين الاتصال عبر BLE
  bind('connect-btn', async () => {
    if (connectModal) connectModal.classList.add('hidden');
    showLoader('جاري الاتصال بـ Bluetooth LE...');
    try { 
      const success = await connectOBD(false); 
      if (success) {
        try { const m = await import('./vin.js'); await m.readVIN(); } catch (e) { console.warn('VIN error:', e); }
      }
    } catch (err) { 
      console.error(err);
      alert('فشل الاتصال. تأكد من تشغيل السيارة وتفعيل البلوتوث.'); 
    } finally {
      hideLoader();
    }
  });

  // ✅ تحسين الاتصال عبر USB
  bind('usb-btn', async () => {
    if (connectModal) connectModal.classList.add('hidden');
    showLoader('جاري الاتDOMصال عبر USB...');
    try { 
      const success = await connectUSB(); 
      if (success) {
        try { const m = await import('./vin.js'); await m.readVIN(); } catch (e) { console.warn('VIN error:', e); }
      }
    } catch (err) { 
      console.error(err);
      alert('فشل الاتصال عبر USB.'); 
    } finally {
      hideLoader();
    }
  });
  
  // ✅ تحسين الاتصال عبر Wi-Fi
  bind('wifi-btn', async () => {
    if (connectModal) connectModal.classList.add('hidden');
    const ip = prompt('أدخل عنوان IP لجهاز Wi-Fi', '192.168.0.10');
    if (!ip) return;
    showLoader('جاري الاتصال عبر Wi-Fi...');
    try { 
      const success = await connectWiFi(ip); 
      if (success) {
        try { const m = await import('./vin.js'); await m.readVIN(); } catch (e) { console.warn('VIN error:', e); }
      }
    } catch (err) { 
      console.error(err);
      alert('فشل الاتصال عبر Wi-Fi. تأكد من عنوان IP.'); 
    } finally {
      hideLoader();
    }
  });

  // ✅ تحسين وضع التجربة
  bind('demo-btn', async () => {
    if (connectModal) connectModal.classList.add('hidden');
    showLoader('جاري تفعيل الوضع التجريبي...');
    try { 
      startDemo(); 
      await readDTCs(); 
      const m = await import('./vin.js'); await m.readVIN(); 
    } catch (e) {
      console.error('Demo error:', e);
    } finally {
      hideLoader();
    }
  });

  // ✅ تحسين قطع الاتصال
  bind('disconnect-btn', async () => {
    showLoader('جاري قطع الاتصال...');
    try { 
      stopDemo(); 
      await handleDisc(); 
      const m = await import('./vin.js'); m.resetVIN(); 
    } catch (e) {
      console.warn('Disconnect error:', e);
    } finally {
      hideLoader();
    }
  });

  // ✅ تحسين مسح الأعطال
  bind('clear-btn', async () => {
    if (!app.isConnected && !app.isDemo) { alert('اتصل بالسيارة أولاً'); return; }
    showLoader('جاري مسح الأعطال...');
    try {
      await clearDTCs();
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء مسح الأعطال.');
    } finally {
      hideLoader();
    }
  });
  
  // ✅ إضافة مؤشر تحميل لفحص الأعطال
  bind('btnReadDTC', async () => {
    showLoader('جاري قراءة أكواد الأعطال...');
    try { await readDTCs(); } catch(e) { console.error(e); } finally { hideLoader(); }
  });
  
  // ✅ إضافة مؤشر تحميل لفحص الكل
  bind('btnScanAll', async () => {
    showLoader('جاري فحص جميع الأنظمة...');
    try { await scanAll(); } catch(e) { console.error(e); } finally { hideLoader(); }
  });
  
  // ✅ تحسين فحص ABS
  bind('btnScanABS', async () => {
    showLoader('جاري فحص ABS / Airbag / BCM...');
    try { 
      const m = await import('./abs-scan.js'); 
      await m.scanABS(); 
    } catch (err) { 
      console.error(err);
      alert('خطأ في فحص ABS'); 
    } finally {
      hideLoader();
    }
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

if (document.readyState === 'loading')ContentLoaded', init);
} else {
  init();
}
