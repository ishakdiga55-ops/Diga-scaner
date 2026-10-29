import { app } from './state.js';
import { 
  handleIncoming, initELM, startLive, startHeartbeat, 
  setStatus, updConnUI, log, readOdometer, handleDisc 
} from './obd.js';

export const isNativeApp = typeof window.cordova !== 'undefined' || typeof window.Capacitor !== 'undefined';

/**
 * اتصال Bluetooth Classic (SPP) — للمحولات الرخيصة
 * تُرجع Promise عشان الـ await في main.js يشتغل صح
 */
export function connectNativeBluetooth() {
  return new Promise((resolve, reject) => {
    if (!window.bluetoothSerial) {
      alert('إضافة البلوتوث غير متوفرة في هذا الإصدار.');
      return reject(new Error('bluetoothSerial plugin missing'));
    }

    log('INFO: البحث عن أجهزة Bluetooth Classic المقترنة...');

    window.bluetoothSerial.list(
      function (devices) {
        if (!devices || devices.length === 0) {
          alert('لم يتم العثور على أجهزة مقترنة.\nيرجى إقران المحول من إعدادات الهاتف أولاً.');
          return reject(new Error('no paired devices'));
        }

        // عرض قائمة الأجهزة للمستخدم
        let listMsg = 'اختر الجهاز برقمه:\n\n';
        devices.forEach((d, i) => {
          listMsg += `${i + 1}. ${d.name || 'بدون اسم'} (${d.address})\n`;
        });

        const choice = prompt(listMsg, '1');
        if (!choice) {
          return reject(new Error('user cancelled'));
        }

        const idx = parseInt(choice, 10) - 1;
        const device = devices[idx];
        if (!device) {
          alert('اختيار غير صحيح');
          return reject(new Error('invalid device index'));
        }

        log('INFO: محاولة الاتصال بـ ' + (device.name || device.address));

        window.bluetoothSerial.connect(
          device.address,
          async function () {
            try {
              log('OK: متصل بـ Bluetooth Classic');
              app.transport = 'native-bt';
              app.isConnected = true;
              setStatus('connected');
              updConnUI(true);

              // الاشتراك في البيانات (ينتهي عند >)
              window.bluetoothSerial.subscribe(
                '>',
                function (data) {
                  handleIncoming(data);
                },
                function (err) {
                  log('ERR BT Read: ' + err);
                }
              );

              // تهيئة ELM327
              const ok = await initELM();
              if (!ok) {
                log('ERR: فشل تهيئة ELM327');
                await handleNativeDisc();
                await handleDisc();
                return reject(new Error('ELM init failed'));
              }

              log('OK: جاهز (Native)');
              startLive();
              startHeartbeat();   // ← كان ناقص!

              // قراءة العداد الحقيقي
              readOdometer().then(odo => {
                const odoEl = document.getElementById('odometer-display');
                if (odoEl) {
                  odoEl.textContent = odo ? ('العداد: ' + odo + ' كم') : 'العداد: غير مدعوم';
                  odoEl.classList.remove('hidden');
                }
              });

              resolve(true);
            } catch (err) {
              log('ERR: ' + err.message);
              await handleNativeDisc();
              await handleDisc();
              reject(err);
            }
          },
          function (err) {
            log('ERR: فشل الاتصال: ' + err);
            alert('فشل الاتصال. تأكد من تشغيل المحول وأنه مقترن.');
            reject(new Error(err));
          }
        );
      },
      function (err) {
        log('ERR: فشل جلب قائمة الأجهزة: ' + err);
        alert('فشل في قراءة أجهزة البلوتوث.');
        reject(new Error(err));
      }
    );
  });
}

export function sendNativeCmd(cmd) {
  if (app.transport === 'native-bt' && window.bluetoothSerial) {
    window.bluetoothSerial.write(
      cmd + '\r',
      function () {},
      function (e) {
        console.log('BT write err', e);
      }
    );
  }
}

export async function handleNativeDisc() {
  if (app.transport === 'native-bt' && window.bluetoothSerial) {
    try {
      window.bluetoothSerial.unsubscribe(function () {}, function () {});
    } catch (_) {}
    try {
      window.bluetoothSerial.disconnect(function () {}, function () {});
    } catch (_) {}
  }
}
