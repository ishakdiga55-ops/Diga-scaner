import { app } from './state.js';
import { handleIncoming, initELM, startLive, setStatus, updConnUI, log, readOdometer } from './obd.js';

export const isNativeApp = typeof window.cordova !== 'undefined' || typeof window.Capacitor !== 'undefined';

export function connectNativeBluetooth() {
  if (!window.bluetoothSerial) {
    alert('إضافة البلوتوث غير متوفرة في هذا الإصدار.');
    return;
  }

  log('INFO: البحث عن أجهزة Bluetooth Classic المقترنة...');
  
  // ✅ إصلاح 1: استخدام list() بدلاً من discoverUnpaired()
  window.bluetoothSerial.list(function(devices) {
    if (!devices || devices.length === 0) {
      alert('لم يتم العثور على أجهزة مقترنة. يرجى إقران المحول من إعدادات الهاتف أولاً.');
      return;
    }
    
    // ✅ إصلاح 2: عرض الأجهزة للمستخدم للاختيار بدلاً من devices[0]
    let listMsg = "اختر الجهاز برقمه:\n\n";
    devices.forEach((d, i) => {
      listMsg += `${i + 1}. ${d.name || 'بدون اسم'} (${d.address})\n`;
    });
    
    let choice = prompt(listMsg, "1");
    if (!choice) return;
    
    let idx = parseInt(choice) - 1;
    let device = devices[idx];
    if (!device) { alert('اختيار غير صحيح'); return; }

    alert('محاولة الاتصال بـ: ' + device.name);

    window.bluetoothSerial.connect(device.address, async function() {
      log('OK: متصل بـ Bluetooth Classic');
      app.transport = 'native-bt';
      app.isConnected = true;
      setStatus('connected');
      updConnUI(true);

      // ✅ إصلاح 3: استخدام '>' كفاصل بدلاً من '\n'
      window.bluetoothSerial.subscribe('>', function(data) {
        handleIncoming(data);
      }, function(err) { log('ERR BT Read: ' + err); });

      if (!await initELM()) {
        handleNativeDisc();
      } else {
        startLive();
        
        // ✅ إصلاح 4: قراءة العداد الحقيقي وإظهاره
        readOdometer().then(odo => {
          const odoEl = document.getElementById('odometer-display');
          if (odoEl) {
            odoEl.textContent = odo ? ('العداد: ' + odo + ' كم') : 'العداد: غير مدعوم';
            odoEl.classList.remove('hidden');
          }
        });
      }
    }, function(err) {
      log('ERR: فشل الاتصال: ' + err);
      alert('فشل الاتصال. تأكد من تشغيل المحول.');
    });
  }, function(err) {
    log('ERR: فشل جلب قائمة الأجهزة: ' + err);
    alert('فشل في قراءة أجهزة البلوتوث.');
  });
}

export function sendNativeCmd(cmd) {
  if (app.transport === 'native-bt' && window.bluetoothSerial) {
    window.bluetoothSerial.write(cmd + '\r', function() {}, function(e) { console.log('BT write err', e); });
  }
}

export function handleNativeDisc() {
  if (app.transport === 'native-bt' && window.bluetoothSerial) {
    window.bluetoothSerial.disconnect(function() {}, function() {});
  }
}
