import { describe, it, expect } from 'vitest';
import { pHex, pRPM, pSpeed, pCool, pFuel } from '../js/obd.js';

describe('pHex — محلّل Hex', () => {
  it('يُرجع [] عند إدخال فارغ', () => {
    expect(pHex('')).toEqual([]);
    expect(pHex(null)).toEqual([]);
    expect(pHex(undefined)).toEqual([]);
  });

  it('يحلل بايتات مفصولة بمسافات', () => {
    expect(pHex('41 0C 1A F8')).toEqual([0x41, 0x0C, 0x1A, 0xF8]);
  });

  it('يتجاهل الأحرف غير الست عشرية', () => {
    expect(pHex('>41 0C\r')).toEqual([0x41, 0x0C]);
  });

  it('يحلل سلسلة متصلة', () => {
    expect(pHex('410C1AF8')).toEqual([0x41, 0x0C, 0x1A, 0xF8]);
  });

  it('يتعامل مع أحرف صغيرة', () => {
    expect(pHex('41 0c 1a f8')).toEqual([0x41, 0x0C, 0x1A, 0xF8]);
  });
});

describe('pRPM — محلّل دورات المحرك', () => {
  it('يحلل RPM من استجابة صحيحة', () => {
    // 41 0C 1A F8 → ((0x1A * 256) + 0xF8) / 4 = (6656 + 248) / 4 = 1726
    expect(pRPM('41 0C 1A F8')).toBe(1726);
  });

  it('يُرجع null عند استجابة فارغة', () => {
    expect(pRPM('')).toBe(null);
    expect(pRPM(null)).toBe(null);
  });

  it('يُرجع null إذا لم يوجد PID صحيح', () => {
    expect(pRPM('41 0D 1A F8')).toBe(null);
  });

  it('يحلل قيمة صفرية', () => {
    expect(pRPM('41 0C 00 00')).toBe(0);
  });
});

describe('pSpeed — محلّل السرعة', () => {
  it('يحلل السرعة من استجابة صحيحة', () => {
    expect(pSpeed('41 0D 64')).toBe(100);
  });

  it('يُرجع null عند استجابة فارغة', () => {
    expect(pSpeed('')).toBe(null);
  });

  it('يحلل سرعة صفرية', () => {
    expect(pSpeed('41 0D 00')).toBe(0);
  });

  it('يحلل سرعة 220 كم/س', () => {
    expect(pSpeed('41 0D DC')).toBe(220);
  });
});

describe('pCool — محلّل حرارة المحرك', () => {
  it('يحلل حرارة 90°C', () => {
    // 90 + 40 = 130 = 0x82
    expect(pCool('41 05 82')).toBe(90);
  });

  it('يحلل حرارة 20°C', () => {
    // 20 + 40 = 60 = 0x3C
    expect(pCool('41 05 3C')).toBe(20);
  });

  it('يحلل حرارة سالبة', () => {
    // -40 + 40 = 0 = 0x00
    expect(pCool('41 05 00')).toBe(-40);
  });

  it('يُرجع null عند استجابة فارغة', () => {
    expect(pCool('')).toBe(null);
  });
});

describe('pFuel — محلّل مستوى الوقود', () => {
  it('يحلل خزان ممتلئ 100%', () => {
    expect(pFuel('41 2F FF')).toBe(100);
  });

  it('يحلل خزان فارغ 0%', () => {
    expect(pFuel('41 2F 00')).toBe(0);
  });

  it('يحلل خزان نصف ممتلئ', () => {
    // 128 / 255 * 100 ≈ 50
    expect(pFuel('41 2F 80')).toBe(50);
  });

  it('يُرجع null عند استجابة فارغة', () => {
    expect(pFuel('')).toBe(null);
  });
});
