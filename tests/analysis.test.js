import { describe, it, expect } from 'vitest';
import { runDiag, calcHealth, confLabel } from '../js/analysis.js';

describe('runDiag — قواعد التشخيص', () => {
  it('يُرجع [] عند قائمة فارغة', () => {
    expect(runDiag([])).toEqual([]);
    expect(runDiag(null)).toEqual([]);
  });

  it('يكتشف خليط فقير (P0171 + P0174)', () => {
    const r = runDiag(['P0171', 'P0174']);
    expect(r.length).toBeGreaterThan(0);
    const titles = r.map(x => x.title);
    expect(titles).toContain('تسرب هواء في نظام السحب');
  });

  it('يكتشف اشتعال متقطع (P0300 + P0301)', () => {
    const r = runDiag(['P0300', 'P0301']);
    const titles = r.map(x => x.title);
    expect(titles).toContain('مشكلة في نظام الإشعال');
  });

  it('يكتشف ارتفاع حرارة المحرك (P0217)', () => {
    const r = runDiag(['P0217']);
    const titles = r.map(x => x.title);
    expect(titles).toContain('ارتفاع حرارة المحرك');
  });

  it('يكتشف فقدان ECU (U0100)', () => {
    const r = runDiag(['U0100']);
    const titles = r.map(x => x.title);
    expect(titles).toContain('فقدان الاتصال بـ ECU');
  });

  it('يُرتب النتائج حسب الثقة (الأعلى أولاً)', () => {
    const r = runDiag(['P0217', 'P0171']);
    if (r.length > 1) {
      expect(r[0].conf).toBeGreaterThanOrEqual(r[1].conf);
    }
  });

  it('يُحدّد 5 نتائج كحد أقصى', () => {
    const r = runDiag(['P0171','P0174','P0300','P0301','P0217','U0100','P0524','P0420']);
    expect(r.length).toBeLessThanOrEqual(5);
  });

  it('لا يتأثر بحالة الأحرف', () => {
    const r1 = runDiag(['p0171']);
    const r2 = runDiag(['P0171']);
    expect(r1.length).toBe(r2.length);
  });
});

describe('calcHealth — مؤشر الصحة', () => {
  it('يُرجع 100 عند قائمة فارغة', () => {
    expect(calcHealth([])).toBe(100);
    expect(calcHealth(null)).toBe(100);
  });

  it('ينخفض مع أكواد U', () => {
    const score = calcHealth([{ code: 'U0100' }], []);
    expect(score).toBeLessThan(100);
  });

  it('ينخفض أكثر مع أكواد U من P', () => {
    const uScore = calcHealth([{ code: 'U0100' }], []);
    const pScore = calcHealth([{ code: 'P0100' }], []);
    expect(uScore).toBeLessThan(pScore);
  });

  it('ينخفض مع تشخيصات حرجة', () => {
    const withoutDiag = calcHealth([{ code: 'P0171' }], []);
    const withDiag = calcHealth([{ code: 'P0171' }], [{ sev: 'critical' }]);
    expect(withDiag).toBeLessThan(withoutDiag);
  });

  it('لا ينزل تحت 25', () => {
    const score = calcHealth(
      [{code:'U0100'},{code:'U0101'},{code:'U0121'},{code:'P0300'},{code:'P0301'},{code:'P0217'},{code:'P0524'}],
      [{sev:'critical'},{sev:'critical'},{sev:'critical'}]
    );
    expect(score).toBeGreaterThanOrEqual(25);
  });

  it('لا يتجاوز 100', () => {
    const score = calcHealth([{ code: 'P0100' }], []);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('confLabel — تسمية الثقة', () => {
  it('يُرجع "احتمال مرتفع" عند 90+', () => {
    expect(confLabel(90)).toBe('احتمال مرتفع');
    expect(confLabel(95)).toBe('احتمال مرتفع');
    expect(confLabel(100)).toBe('احتمال مرتفع');
  });

  it('يُرجع "احتمال متوسط" بين 70-89', () => {
    expect(confLabel(70)).toBe('احتمال متوسط');
    expect(confLabel(80)).toBe('احتمال متوسط');
    expect(confLabel(89)).toBe('احتمال متوسط');
  });

  it('يُرجع "احتمال وارد" أقل من 70', () => {
    expect(confLabel(69)).toBe('احتمال وارد');
    expect(confLabel(50)).toBe('احتمال وارد');
    expect(confLabel(0)).toBe('احتمال وارد');
  });
});
