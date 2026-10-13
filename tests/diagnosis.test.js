import { describe, it, expect } from 'vitest';

/* نسخة من RULES */
const RULES = [
  {req:['P0171','P0174'],title:'تسرب هواء',conf:90,sev:'high',desc:'خليط فقير',acts:['افحص فاكيوم']},
  {req:['P0300'],anyOf:['P0301','P0302','P0303','P0304'],title:'مشكلة إشعال',conf:75,sev:'medium',desc:'اشتعال متقطع',acts:['بدل البواجي']},
  {req:['P0420'],anyOf:['P0300','P0301'],title:'تلف كتلايزر',conf:90,sev:'high',desc:'اشتعال أتلف الكتلايزر',acts:['أصلح الإشعال']},
  {req:['P0217'],title:'ارتفاع حرارة',conf:100,sev:'critical',desc:'أوقف فورًا',acts:['أوقف السيارة']},
  {req:['U0100'],title:'فقدان ECU',conf:90,sev:'critical',desc:'لا تواصل مع ECU',acts:['افحص فيوز']},
  {req:['P0524'],title:'ضغط زيت منخفض',conf:95,sev:'critical',desc:'خطر تلف المحرك',acts:['أوقف فورًا']}
];

/* نسخة من runDiag */
function runDiag(codes){
  if(!codes||!codes.length)return [];
  const s = new Set(codes.map(c=>String(c).toUpperCase()));
  const r = [];
  RULES.forEach(rule=>{
    for(const rc of rule.req)if(!s.has(rc))return;
    if(rule.anyOf){let any=false;for(const ac of rule.anyOf)if(s.has(ac)){any=true;break}if(!any)return}
    r.push(rule);
  });
  return r.sort((a,b)=>b.conf-a.conf).slice(0,5);
}

/* نسخة من calcHealth */
function calcHealth(f,d){
  if(!f||!f.length)return 100;
  let sc=100;
  f.forEach(x=>{const c=(x.code||'').toUpperCase();let dd=2;if(c.startsWith('U'))dd=5;else if(c.startsWith('B'))dd=4;else if(c.startsWith('C'))dd=3;sc-=dd});
  (d||[]).forEach(x=>{if(x.sev==='critical')sc-=4;else if(x.sev==='high')sc-=3;else if(x.sev==='medium')sc-=2;else sc-=1});
  return Math.round(Math.max(25,Math.min(100,sc)));
}

/* نسخة من sanitizeCode */
function sanitizeCode(s){
  if(s==null)return '';
  return String(s).toUpperCase().replace(/[^A-Z0-9_]/g,'').slice(0,20);
}

/* نسخة من escapeHtml */
function escapeHtml(s){
  if(s==null)return '';
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

/* ============================================ */
/* اختبارات runDiag */
/* ============================================ */

describe('runDiag — التشخيص الذكي', () => {
  it('يرجع [] لقائمة فارغة', () => {
    expect(runDiag([])).toEqual([]);
  });

  it('يرجع [] لـ null', () => {
    expect(runDiag(null)).toEqual([]);
  });

  it('يكتشف تسرب الهواء من P0171 + P0174', () => {
    const r = runDiag(['P0171','P0174']);
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].title).toContain('تسرب');
  });

  it('لا يكتشف تسرب الهواء من P0171 وحده', () => {
    const r = runDiag(['P0171']);
    expect(r.find(x => x.title && x.title.includes('تسرب'))).toBeUndefined();
  });

  it('يكتشف مشكلة الإشعال من P0300 + P0301', () => {
    const r = runDiag(['P0300','P0301']);
    expect(r.find(x => x.title.includes('إشعال'))).toBeDefined();
  });

  it('يكتشف ارتفاع الحرارة من P0217', () => {
    const r = runDiag(['P0217']);
    expect(r[0].sev).toBe('critical');
  });

  it('يرتب حسب الثقة (conf)', () => {
    const r = runDiag(['P0217','P0171','P0174']);
    for (let i = 0; i < r.length - 1; i++) {
      expect(r[i].conf).toBeGreaterThanOrEqual(r[i+1].conf);
    }
  });

  it('يحد الأكواد بـ 5 نتائج كحد أقصى', () => {
    const r = runDiag(['P0171','P0174','P0300','P0301','P0420','P0217','U0100']);
    expect(r.length).toBeLessThanOrEqual(5);
  });

  it('يتعامل مع أحرف صغيرة', () => {
    const r = runDiag(['p0217']);
    expect(r.length).toBeGreaterThan(0);
  });

  it('يكتشف P0420 مع P0300', () => {
    const r = runDiag(['P0420','P0300']);
    expect(r.find(x => x.title.includes('كتلايزر'))).toBeDefined();
  });
});

/* ============================================ */
/* اختبارات calcHealth */
/* ============================================ */

describe('calcHealth — صحة السيارة', () => {
  it('يرجع 100 لقائمة فارغة', () => {
    expect(calcHealth([], [])).toBe(100);
  });

  it('يرجع 100 لـ null', () => {
    expect(calcHealth(null, null)).toBe(100);
  });

  it('يخصم 2 لكل كود عادي', () => {
    const r = calcHealth([{code:'P0300'}], []);
    expect(r).toBe(98);
  });

  it('يخصم 5 لكل كود شبكة (U)', () => {
    const r = calcHealth([{code:'U0100'}], []);
    expect(r).toBe(95);
  });

  it('يخصم 4 لكل كود هيكل (B)', () => {
    const r = calcHealth([{code:'B0001'}], []);
    expect(r).toBe(96);
  });

  it('يخصم 3 لكل كود شاسيه (C)', () => {
    const r = calcHealth([{code:'C0035'}], []);
    expect(r).toBe(97);
  });

  it('يخصم 4 إضافية لكل تشخيص حرج', () => {
    const r = calcHealth([{code:'P0300'}], [{sev:'critical'}]);
    expect(r).toBe(94);
  });

  it('يخصم 3 إضافية لكل تشخيص خطير', () => {
    const r = calcHealth([{code:'P0300'}], [{sev:'high'}]);
    expect(r).toBe(95);
  });

  it('لا يقل عن 25', () => {
    const codes = [];
    for (let i = 0; i < 100; i++) codes.push({code:'U0100'});
    const r = calcHealth(codes, []);
    expect(r).toBeGreaterThanOrEqual(25);
  });

  it('لا يزيد عن 100', () => {
    expect(calcHealth([], [])).toBeLessThanOrEqual(100);
  });
});

/* ============================================ */
/* اختبارات sanitizeCode */
/* ============================================ */

describe('sanitizeCode — تنظيف الأكواد', () => {
  it('يرجع "" لـ null', () => {
    expect(sanitizeCode(null)).toBe('');
  });

  it('يحوّل لأحرف كبيرة', () => {
    expect(sanitizeCode('p0300')).toBe('P0300');
  });

  it('يحذف الرموز الخاصة', () => {
    expect(sanitizeCode('P0300!@#')).toBe('P0300');
  });

  it('يحتفظ بالشرطة السفلية', () => {
    expect(sanitizeCode('P0300_XYZ')).toBe('P0300_XYZ');
  });

  it('يحد بـ 20 حرفًا', () => {
    const long = 'A'.repeat(50);
    expect(sanitizeCode(long).length).toBe(20);
  });
});

/* ============================================ */
/* اختبارات escapeHtml */
/* ============================================ */

describe('escapeHtml — حماية HTML', () => {
  it('يحوّل & إلى &amp;', () => {
    expect(escapeHtml('A&B')).toBe('A&amp;B');
  });

  it('يحوّل < إلى &lt;', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('يحوّل " إلى &quot;', () => {
    expect(escapeHtml('say "hi"')).toBe('say &quot;hi&quot;');
  });

  it("يحوّل ' إلى &#039;", () => {
    expect(escapeHtml("it's")).toBe('it&#039;s');
  });

  it('يرجع "" لـ null', () => {
    expect(escapeHtml(null)).toBe('');
  });

  it('يحافظ على النص العربي', () => {
    expect(escapeHtml('مرحبا')).toBe('مرحبا');
  });
});
