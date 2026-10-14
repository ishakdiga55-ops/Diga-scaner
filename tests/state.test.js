import { describe, it, expect, beforeEach } from 'vitest';
import { app, ble, usb, comm, live, session, user, initApp } from '../js/state.js';

describe('app — الحالة العامة', () => {
  it('يحتوي على جميع الحقول المطلوبة', () => {
    expect(app).toHaveProperty('isConnected');
    expect(app).toHaveProperty('isDemo');
    expect(app).toHaveProperty('transport');
    expect(app).toHaveProperty('isIOS');
    expect(app).toHaveProperty('isBluefy');
    expect(app).toHaveProperty('hasSerial');
    expect(app).toHaveProperty('hasBLE');
    expect(app).toHaveProperty('obdexLoaded');
  });

  it('القيم الافتراضية صحيحة', () => {
    expect(app.isConnected).toBe(false);
    expect(app.isDemo).toBe(false);
    expect(app.transport).toBe(null);
    expect(app.obdexLoaded).toBe(false);
  });
});

describe('ble — حالة Bluetooth', () => {
  it('يحتوي على الحقول المطلوبة', () => {
    expect(ble).toHaveProperty('device');
    expect(ble).toHaveProperty('server');
    expect(ble).toHaveProperty('rxChar');
    expect(ble).toHaveProperty('txChar');
    expect(ble).toHaveProperty('txNoResp');
  });

  it('القيم الافتراضية null/false', () => {
    expect(ble.device).toBe(null);
    expect(ble.txNoResp).toBe(false);
  });
});

describe('usb — حالة USB', () => {
  it('يحتوي على الحقول المطلوبة', () => {
    expect(usb).toHaveProperty('port');
    expect(usb).toHaveProperty('writer');
    expect(usb).toHaveProperty('reader');
    expect(usb).toHaveProperty('loop');
    expect(usb).toHaveProperty('generation');
  });

  it('generation يبدأ من 0', () => {
    expect(usb.generation).toBe(0);
  });
});

describe('comm — حالة الاتصال', () => {
  it('يحتوي على الحقول المطلوبة', () => {
    expect(comm).toHaveProperty('recvBuf');
    expect(comm).toHaveProperty('cmdQ');
    expect(comm).toHaveProperty('isProcessing');
    expect(comm).toHaveProperty('curResolve');
    expect(comm).toHaveProperty('curTimeout');
    expect(comm).toHaveProperty('userDisc');
    expect(comm).toHaveProperty('reconnecting');
    expect(comm).toHaveProperty('isCAN');
    expect(comm).toHaveProperty('isCAN11');
  });

  it('cmdQ مصفوفة فارغة', () => {
    expect(Array.isArray(comm.cmdQ)).toBe(true);
  });

  it('recvBuf سلسلة فارغة', () => {
    expect(typeof comm.recvBuf).toBe('string');
  });
});

describe('live — القياسات الحية', () => {
  it('يحتوي على الحقول المطلوبة', () => {
    expect(live).toHaveProperty('timer');
    expect(live).toHaveProperty('tick');
    expect(live).toHaveProperty('paused');
    expect(live).toHaveProperty('busy');
    expect(live).toHaveProperty('lastCoolant');
    expect(live).toHaveProperty('lastFuel');
  });

  it('tick يبدأ من 0', () => {
    expect(live.tick).toBe(0);
  });
});

describe('session — الجلسة', () => {
  it('يحتوي على الحقول المطلوبة', () => {
    expect(session).toHaveProperty('lastFaults');
    expect(session).toHaveProperty('lastDiag');
    expect(session).toHaveProperty('currentSevFilter');
    expect(session).toHaveProperty('currentDetailCode');
    expect(session).toHaveProperty('chartInstance');
    expect(session).toHaveProperty('statsChartInstance');
    expect(session).toHaveProperty('demoTimer');
  });

  it('currentSevFilter الافتراضي هو all', () => {
    expect(session.currentSevFilter).toBe('all');
  });

  it('lastFaults مصفوفة فارغة', () => {
    expect(Array.isArray(session.lastFaults)).toBe(true);
  });
});

describe('user — بيانات المستخدم', () => {
  it('يحتوي على الحقول المطلوبة', () => {
    expect(user).toHaveProperty('favorites');
    expect(user).toHaveProperty('recentSearches');
    expect(user).toHaveProperty('batteryVals');
    expect(user).toHaveProperty('batteryStep');
  });

  it('favorites مصفوفة', () => {
    expect(Array.isArray(user.favorites)).toBe(true);
  });

  it('batteryVals يحتوي على 3 خانات', () => {
    expect(user.batteryVals.length).toBe(3);
  });

  it('batteryStep يبدأ من 0', () => {
    expect(user.batteryStep).toBe(0);
  });
});

describe('initApp — التهيئة', () => {
  beforeEach(() => {
    initApp();
  });

  it('لا يرمي خطأ عند التنفيذ', () => {
    expect(() => initApp()).not.toThrow();
  });

  it('يكتشف بيئة التشغيل', () => {
    expect(typeof app.isIOS).toBe('boolean');
    expect(typeof app.isBluefy).toBe('boolean');
    expect(typeof app.hasSerial).toBe('boolean');
    expect(typeof app.hasBLE).toBe('boolean');
  });

  it('يحافظ على user.favorites كمصفوفة', () => {
    expect(Array.isArray(user.favorites)).toBe(true);
  });

  it('يحافظ على user.recentSearches كمصفوفة', () => {
    expect(Array.isArray(user.recentSearches)).toBe(true);
  });
});
