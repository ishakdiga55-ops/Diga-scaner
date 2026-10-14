import { describe, it, expect, beforeEach } from 'vitest';
import { DTC_DATABASE, BRAND_INDEX, SEARCH_INDEX, BY_PREFIX,
         buildDTCIndex, buildSearchIndex, getInfo } from '../js/data/database.js';

describe('DTC_DATABASE — القاعدة الأساسية', () => {
  it('تحتوي على أكواد معروفة', () => {
    expect(DTC_DATABASE['P0300']).toBeDefined();
    expect(DTC_DATABASE['P0171']).toBeDefined();
    expect(DTC_DATABASE['U0100']).toBeDefined();
  });

  it('كل كود لديه title و severity', () => {
    const keys = Object.keys(DTC_DATABASE);
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys.slice(0, 10)) {
      expect(DTC_DATABASE[k].title).toBeDefined();
      expect(DTC_DATABASE[k].severity).toBeDefined();
    }
  });

  it('P0300 يحتوي على عنوان صحيح', () => {
    expect(DTC_DATABASE['P0300'].title).toBeDefined();
  });
});

describe('buildDTCIndex — فهرس المصنّعين', () => {
  beforeEach(() => buildDTCIndex());

  it('يُعيد ملء BRAND_INDEX', () => {
    expect(BRAND_INDEX.size).toBeGreaterThan(0);
  });

  it('المفاتيح تبدأ بـ P أو C أو B أو U', () => {
    for (const k of BRAND_INDEX.keys()) {
      expect(k).toMatch(/^[PCBU]/);
    }
  });
});

describe('buildSearchIndex — فهرس البحث', () => {
  beforeEach(() => buildSearchIndex());

  it('يُعيد ملء SEARCH_INDEX', () => {
    expect(SEARCH_INDEX.length).toBeGreaterThan(0);
  });

  it('يُعيد ملء BY_PREFIX', () => {
    expect(BY_PREFIX.size).toBeGreaterThan(0);
  });

  it('كل عنصر لديه code و info', () => {
    const item = SEARCH_INDEX[0];
    expect(item.code).toBeDefined();
    expect(item.info).toBeDefined();
  });

  it('البادئة P0 موجودة', () => {
    expect(BY_PREFIX.get('P0')).toBeDefined();
  });
});

describe('getInfo — جلب معلومات الكود', () => {
  beforeEach(() => {
    buildDTCIndex();
    buildSearchIndex();
  });

  it('يُرجع معلومات صحيحة لكود موجود', () => {
    const info = getInfo('P0300');
    expect(info.title).toBeDefined();
    expect(info.severity).toBeDefined();
  });

  it('يُرجع "غير معروف" لكود غير موجود', () => {
    const info = getInfo('P9999');
    expect(info.title).toBe('عطل غير معروف');
  });

  it('يتعامل مع الأحرف الصغيرة', () => {
    const info = getInfo('p0300');
    expect(info.title).toBeDefined();
  });

  it('يتعامل مع null/undefined بدون خطأ', () => {
    expect(() => getInfo(null)).not.toThrow();
    expect(() => getInfo(undefined)).not.toThrow();
  });
});
