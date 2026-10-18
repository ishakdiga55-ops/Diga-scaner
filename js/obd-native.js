import { app } from './state.js';
import { handleIncoming, initELM, startLive, setStatus, updConnUI, log } from './obd.js';

export const isNativeApp = typeof window.cordova !== 'undefined' || typeof window.Capacitor !== 'undefined';

export function connectNativeBluetooth() {
  if (!window.bluetoothSerial) {
    alert('إضافة البلوتوث غير متوفرة في هذا الإصدار.');
    return;
  }

  log('INFO: البحث عن أجهزة Bluetooth Classic...');
  window.bluetoothSerial.discoverUnpaired(function(devices) {
    if (!devices || devices.length === 0) {
      alert('لم يتم العثور على أجهزة. يرجى إقران المحول من إعدادات الهاتف أولاً.');
      return;
    }
    
    var device = devices[0];
    alert('محاولة الاتصال بـ: ' + device.name);

    window.bluetoothSerial.connect(device.address, async function() {
      log('OK: متصل بـ Bluetooth Classic');
      app.transport = 'native-bt';
      app.isConnected = true;
      setStatus('connected');
      updConnUI(true);

      window.bluetoothSerial.subscribe('\n', function(data) {
        handleIncoming(data);
      }, function(err) { log('ERR BT Read: ' + err); });

      if (!await initELM()) {
        handleNativeDisc();
      } else {
        startLive();
      }
    }, function(err) {
      log('ERR: فشل الاتصال: ' + err);
      alert('فشل الاتصال. تأكد من تشغيل المحول.');
    });
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
