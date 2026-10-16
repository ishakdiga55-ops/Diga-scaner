import { getAIDIagnosis } from '../ai-service.js'; // تأكد من ضبط مسار الاستيراد حسب مكان الملف

export const RULES = [
  { req: ['P0171', 'P0174'], title: 'تسرب هواء في نظام السحب', conf: 90, sev: 'high', desc: 'خليط فقير في البنكين', acts: ['افحص خراطيم الفاكيوم', 'افحص حشوة مشعب السحب'] },
  { req: ['P0300'], anyOf: ['P0301', 'P0302', 'P0303', 'P0304'], title: 'مشكلة في نظام الإشعال', conf: 75, sev: 'medium', desc: 'اشتعال متقطع', acts: ['بدل البواجي', 'افحص الكويلات'] },
  { req: ['P0420'], anyOf: ['P0300', 'P0301'], title: 'تلف الكتلايزر بسبب الاشتعال', conf: 90, sev: 'high', desc: 'الاشتعال المتقطع أتلف الكتلايزر', acts: ['أصلح الإشعال أولاً', 'افحص حساس O2'] },
  { req: ['P0217'], title: 'ارتفاع حرارة المحرك', conf: 100, sev: 'critical', desc: 'أوقف السيارة فوراً!', acts: ['أوقف فوراً', 'افحص سائل التبريد'] },
  { req: ['U0100'], title: 'فقدان الاتصال بـ ECU', conf: 90, sev: 'critical', desc: 'لا يوجد تواصل مع كمبيوتر المحرك', acts: ['افحص فيوز ECU', 'افحص كابل OBD'] },
  { req: ['P0524'], title: 'ضغط زيت منخفض', conf: 95, sev: 'critical', desc: 'خطر تلف المحرك', acts: ['أوقف فوراً', 'افحص مستوى الزيت'] }
];

export function runDiag(codes) {
  if (!codes || !codes.length) return [];
  const s = new Set(codes.map(c => String(c).toUpperCase()));
  const r = [];
  RULES.forEach(rule => {
    for (const rc of rule.req) if (!s.has(rc)) return;
    if (rule.anyOf) {
      let any = false;
      for (const ac of rule.anyOf) if (s.has(ac)) { any = true; break; }
      if (!any) return;
    }
    r.push(rule);
  });
  return r.sort((a, b) => b.conf - a.conf).slice(0, 5);
}

export function confLabel(c) {
  return c >= 90 ? 'احتمال مرتفع' : c >= 70 ? 'احتمال متوسط' : 'احتمال وارد';
}

export function calcHealth(f, d) {
  if (!f || !f.length) return 100;
  let sc = 100;
  f.forEach(x => {
    const c = (x.code || '').toUpperCase();
    let dd = 2;
    if (c.startsWith('U')) dd = 5;
    else if (c.startsWith('B')) dd = 4;
    else if (c.startsWith('C')) dd = 3;
    sc -= dd;
  });
  (d || []).forEach(x => {
    if (x.sev === 'critical') sc -= 4;
    else if (x.sev === 'high') sc -= 3;
    else if (x.sev === 'medium') sc -= 2;
    else sc -= 1;
  });
  return Math.round(Math.max(25, Math.min(100, sc)));
}

// 🧠 التحليل الذكي المدمج (محلي + ذكاء اصطناعي عند الحاجة)
export async function dispSmart(codes) {
  const lastDiag = runDiag(codes);
  const c = document.getElementById('smartDiagnosis');
  if (!c) return;
  if (!codes || !codes.length) { 
    c.classList.add('hidden'); 
    c.innerHTML = ''; 
    return; 
  }
  
  c.classList.remove('hidden');
  let h = '<div class="bg-purple-900/30 border-r-4 border-purple-500 rounded-2xl p-4"><h3 class="font-bold text-purple-200 mb-3"><i class="fa-solid fa-brain"></i> تحليل ذكي</h3>';
  
  if (lastDiag.length > 0) {
    lastDiag.forEach(d => {
      const cl = d.sev === 'critical' ? '#dc2626' : d.sev === 'high' ? '#ef4444' : '#f59e0b';
      h += '<div class="bg-gray-900/60 rounded-xl p-3 mb-2" style="border-right:4px solid ' + cl + '"><div class="flex justify-between mb-2 gap-2"><div class="font-bold text-sm">' + d.title + '</div><span class="text-xs px-2 py-1 rounded-full text-white font-bold whitespace-nowrap" style="background:' + cl + '">' + confLabel(d.conf) + '</span></div><p class="text-xs text-gray-300 mb-2">' + d.desc + '</p><ul class="text-xs space-y-1">';
      (d.acts || []).forEach(a => { h += '<li class="bg-gray-800/60 rounded p-1.5">• ' + a + '</li>'; });
      h += '</ul></div>';
    });
  } else {
    h += '<p class="text-xs text-amber-400 mb-2 animate-pulse"><i class="fa-solid fa-robot"></i> لا توجد قواعد محلية مطابقة. جاري استنتاج التحليل بالذكاء الاصطناعي...</p>';
  }

  // حاوية خاصة لنتائج الذكاء الاصطناعي إن لم توجد قواعد محلية
  h += '<div id="ai-smart-fallback"></div>';
  h += '</div>';
  c.innerHTML = h;

  // إذا لم تطابق أي قاعدة محلية، نستدعي الذكاء الاصطناعي لتحليل الأكواد المكتشفة مباشرة
  if (lastDiag.length === 0) {
    const codeListStr = codes.map(f => f.code || f).join(', ');
    const aiText = await getAIDIagnosis(codeListStr, "فحص شامل لأكواد أعطال متعددة");
    const fallbackBox = document.getElementById('ai-smart-fallback');
    if (fallbackBox) {
      fallbackBox.innerHTML = `
        <div class="bg-gray-900/90 rounded-xl p-3 border border-purple-500/50 mt-2">
          <strong class="text-blue-400 text-xs block mb-1">💡 تحليل الخبير الذكي (AI):</strong>
          <p class="text-xs text-gray-200 leading-relaxed whitespace-pre-line">${aiText}</p>
        </div>
      `;
    }
  }
}

export function dispHealth(f, d) {
  const b = document.getElementById('healthBadge');
  if (!b) return;
  if (!f || !f.length) { b.classList.add('hidden'); return; }
  const sc = calcHealth(f, d);
  let g, s, ds;
  if (sc >= 90) { g = 'from-green-500 to-emerald-600'; s = 'ممتازة'; ds = 'لا توجد مشاكل تُذكر'; }
  else if (sc >= 75) { g = 'from-emerald-500 to-green-600'; s = 'جيدة'; ds = 'أعطال بسيطة'; }
  else if (sc >= 50) { g = 'from-amber-500 to-orange-600'; s = 'تحتاج صيانة'; ds = 'أعطال مهمة'; }
  else { g = 'from-red-500 to-rose-600'; s = 'خطيرة'; ds = 'إصلاح فوري مطلوب'; }
  b.classList.remove('hidden');
  b.innerHTML = '<div class="bg-gradient-to-l ' + g + ' rounded-2xl p-4 text-white"><div class="flex justify-between items-center"><div><div class="text-sm font-bold">' + s + '</div><div class="text-xs opacity-90">' + ds + '</div></div><div class="text-4xl font-bold">' + sc + '<span class="text-base opacity-80">/100</span></div></div></div>';
}
