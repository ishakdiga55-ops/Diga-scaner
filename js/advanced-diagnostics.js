/* ============================================
   CheckDiga Pro — Advanced Diagnostics (Standalone)
   ملف مستقل — لا يستورد أي شيء
   ============================================ */

(function(){
  'use strict';

  /* --- القواعد المدمجة (~20 قاعدة) --- */
  var R = [
    {id:'LEAN_B1',pr:'high',sv:'high',sys:['engine','fuel'],req:['P0171'],opt:['P0174'],t:'خليط فقير Bank 1',tEn:'Too Lean Bank 1',
     sym:['اهتزاز','ضعف تسارع'],cs:[{c:'تسرب هواء مشعب',p:0.45},{c:'خرطوم فاكيوم',p:0.25},{c:'MAF متسخ',p:0.15},{c:'مضخة وقود',p:0.10},{c:'حاقن مسدود',p:0.05}],
     ac:['افحص خراطيم الفاكيوم','رش ماء على حشوات المشعب','نظّف MAF'],
     cost:{min:0,max:300},time:2,diy:true,urg:false},

    {id:'MISFIRE',pr:'high',sv:'high',sys:['engine','exhaust'],req:['P0300'],opt:['P0301','P0302','P0303','P0304'],t:'اشتعال متقطع متعدد',tEn:'Random Misfire',
     sym:['اهتزاز','فقدان قدرة'],cs:[{c:'بواجي متهالكة',p:0.40},{c:'كويلات',p:0.25},{c:'حاقنات مسدودة',p:0.15},{c:'ضغط أسطوانات',p:0.10},{c:'توقيت',p:0.10}],
     ac:['استبدل البواجي','افحص الكويلات','افحص الحاقنات'],
     cost:{min:50,max:1500},time:4,diy:true,urg:false},

    {id:'MISFIRE1',pr:'high',sv:'high',sys:['engine'],req:['P0301'],opt:[],t:'اشتعال أسطوانة 1',tEn:'Cyl 1 Misfire',
     sym:['اهتزاز'],cs:[{c:'بوجي 1',p:0.45},{c:'كويل 1',p:0.35},{c:'حاقن 1',p:0.15}],
     ac:['بدّل البوجي 1↔2','بدّل الكويل 1↔2','قِس الضغط'],
     cost:{min:20,max:500},time:2,diy:true,urg:false},

    {id:'OVERHEAT',pr:'critical',sv:'critical',sys:['cooling','engine'],req:['P0217'],opt:[],t:'ارتفاع حرارة المحرك',tEn:'Overheating',
     sym:['حرارة مرتفعة','بخار'],cs:[{c:'نقص سائل',p:0.40},{c:'مراوح لا تعمل',p:0.25},{c:'ترموستات',p:0.20},{c:'مضخة ماء',p:0.15}],
     ac:['🛑 أوقف فورًا','انتظر 30 دقيقة','افحص سائل التبريد'],
     cost:{min:0,max:2000},time:4,diy:false,urg:true},

    {id:'OIL_LOW',pr:'critical',sv:'critical',sys:['engine'],req:['P0524'],opt:[],t:'ضغط الزيت منخفض',tEn:'Oil Pressure Low',
     sym:['لمبة الزيت','أصوات محرك'],cs:[{c:'نقص زيت',p:0.50},{c:'مضخة زيت',p:0.25},{c:'حساس',p:0.15}],
     ac:['🛑 أوقف المحرك فورًا','افحص مستوى الزيت','افحص التسرب'],
     cost:{min:0,max:3000},time:6,diy:false,urg:true},

    {id:'CRANK',pr:'critical',sv:'critical',sys:['engine'],req:['P0335'],opt:[],t:'حساس الكرنك',tEn:'Crank Sensor',
     sym:['لا تشتغل'],cs:[{c:'حساس الكرنك',p:0.65},{c:'أسلاك',p:0.25},{c:'عجلة أسنان',p:0.10}],
     ac:['افحص الأسلاك','افحص المقاومة','استبدل الحساس'],
     cost:{min:50,max:400},time:2,diy:true,urg:true},

    {id:'CATALYST',pr:'medium',sv:'medium',sys:['exhaust'],req:['P0420'],opt:[],t:'كتلايزر ضعيف B1',tEn:'Catalyst B1',
     sym:['فشل انبعاثات'],cs:[{c:'كتلايزر تالف',p:0.50},{c:'حساس O2 خلفي',p:0.30},{c:'تسرب عادم',p:0.15},{c:'اشتعال متقطع',p:0.05}],
     ac:['افحص حساسات O2','افحص التسرب'],
     cost:{min:200,max:2000},time:4,diy:false,urg:false},

    {id:'EVAP_S',pr:'low',sv:'low',sys:['exhaust'],req:['P0442'],opt:['P0455'],t:'تسرب EVAP',tEn:'EVAP Leak',
     sym:['رائحة بنزين'],cs:[{c:'غطاء الوقود',p:0.55},{c:'خرطوم مشقوق',p:0.25},{c:'purge valve',p:0.15}],
     ac:['أعد إحكام غطاء الوقود','امسح وقُد 100 كم'],
     cost:{min:0,max:200},time:1,diy:true,urg:false},

    {id:'MAF',pr:'medium',sv:'medium',sys:['engine','fuel'],req:['P0100'],opt:['P0101','P0102','P0103'],t:'دائرة MAF',tEn:'MAF Sensor',
     sym:['خمول غير مستقر','صرف بنزين'],cs:[{c:'MAF متسخ',p:0.55},{c:'تسرب هواء',p:0.25},{c:'أسلاك',p:0.15}],
     ac:['نظّف MAF','افحص الأسلاك'],
     cost:{min:0,max:150},time:1,diy:true,urg:false},

    {id:'ECT',pr:'medium',sv:'medium',sys:['cooling'],req:['P0115'],opt:['P0117','P0118'],t:'حساس حرارة المحرك',tEn:'ECT Sensor',
     sym:['قراءة غير منطقية'],cs:[{c:'حساس تالف',p:0.50},{c:'أسلاك',p:0.30},{c:'قابس',p:0.20}],
     ac:['افحص الأسلاك','قِس المقاومة','استبدل'],
     cost:{min:20,max:100},time:1,diy:true,urg:false},

    {id:'THERMO',pr:'medium',sv:'medium',sys:['cooling'],req:['P0128'],opt:[],t:'ترموستات عاطل',tEn:'Thermostat',
     sym:['المحرك يبرد سريعًا'],cs:[{c:'ترموستات مفتوح',p:0.80},{c:'حساس ECT',p:0.20}],
     ac:['استبدل الترموستات','افحص سائل التبريد'],
     cost:{min:30,max:150},time:2,diy:true,urg:false},

    {id:'LOST_ECU',pr:'critical',sv:'critical',sys:['electronics','engine'],req:['U0100'],opt:[],t:'فقدان الاتصال بـ ECU',tEn:'Lost ECU',
     sym:['لا تشتغل','لمبات كثيرة'],cs:[{c:'أسلاك CAN',p:0.40},{c:'فيوز ECU',p:0.25},{c:'ECU',p:0.20},{c:'أرضية',p:0.15}],
     ac:['🛑 توقف','افحص فيوز ECU','افحص CAN'],
     cost:{min:200,max:4000},time:8,diy:false,urg:true},

    {id:'LOST_TCM',pr:'critical',sv:'critical',sys:['transmission'],req:['U0101'],opt:[],t:'فقدان الاتصال بـ TCM',tEn:'Lost TCM',
     sym:['لمبة الجير'],cs:[{c:'أسلاك CAN',p:0.45},{c:'فيوز',p:0.30},{c:'TCM',p:0.25}],
     ac:['افحص الفيوز','افحص CAN'],
     cost:{min:200,max:3000},time:6,diy:false,urg:true},

    {id:'ABS_FL',pr:'high',sv:'high',sys:['abs'],req:['C0035'],opt:['C0040','C0045','C0050'],t:'حساس عجلة ABS',tEn:'Wheel Sensor',
     sym:['لمبة ABS'],cs:[{c:'حساس معطوب',p:0.55},{c:'أسلاك',p:0.30},{c:'حلقة ABS',p:0.15}],
     ac:['افحص الأسلاك','افحص الحساس'],
     cost:{min:50,max:400},time:2,diy:true,urg:false},

    {id:'AIRBAG',pr:'critical',sv:'critical',sys:['airbag'],req:['B0001'],opt:['B0010','B1000'],t:'عطل الوسائد الهوائية',tEn:'Airbag Fault',
     sym:['لمبة الوسائد'],cs:[{c:'قابس مفصول',p:0.40},{c:'clock spring',p:0.30},{c:'أسلاك',p:0.20},{c:'الوسادة',p:0.10}],
     ac:['افحص القابس','افحص clock spring','راجع مختص'],
     cost:{min:200,max:2000},time:4,diy:false,urg:true},

    {id:'TRANSM',pr:'high',sv:'high',sys:['transmission'],req:['P0700'],opt:[],t:'عطل ناقل الحركة',tEn:'Transmission',
     sym:['نقل غير سلس'],cs:[{c:'كود فرعي TCM',p:0.70},{c:'TCM',p:0.15},{c:'أسلاك',p:0.15}],
     ac:['اقرأ أكواد TCM','افحص زيت الجير'],
     cost:{min:100,max:5000},time:8,diy:false,urg:false},

    {id:'GEAR_R',pr:'critical',sv:'critical',sys:['transmission'],req:['P0730'],opt:[],t:'نسبة التروس غير صحيحة',tEn:'Gear Ratio',
     sym:['Gear لا يبدّل'],cs:[{c:'زيت منخفض',p:0.35},{c:'حساس سرعة',p:0.25},{c:'قابض',p:0.25}],
     ac:['توقف، لا تقس بقوة','افحص زيت الجير','راجع مختص'],
     cost:{min:500,max:8000},time:12,diy:false,urg:true},

    {id:'CHARGING',pr:'high',sv:'high',sys:['battery'],req:['P0562'],opt:[],t:'مشكلة في الشحن',tEn:'Charging',
     sym:['لمبات تخبو'],cs:[{c:'دينامو',p:0.50},{c:'بطارية',p:0.30},{c:'حزام',p:0.15}],
     ac:['افحص فولت البطارية','افحص الدينامو'],
     cost:{min:100,max:1500},time:3,diy:true,urg:false},

    {id:'TIMING',pr:'critical',sv:'critical',sys:['engine'],req:['P0016'],opt:[],t:'عدم توافق التوقيت',tEn:'Timing',
     sym:['لا تشتغل','اهتزاز'],cs:[{c:'حزام/سلسلة',p:0.55},{c:'حساسات',p:0.30},{c:'VVT',p:0.15}],
     ac:['🛑 أوقف السيارة','افحص التوقيت'],
     cost:{min:500,max:5000},time:12,diy:false,urg:true}
  ];

  var SYS_NAMES = {engine:'المحرك',transmission:'الجير',abs:'ABS',brakes:'الفرامل',airbag:'الوسائد',fuel:'الوقود',cooling:'التبريد',exhaust:'العادم',battery:'البطارية',electronics:'الكهرباء'};

  /* --- قراءة الأكواد --- */
  function readCodes(){
    try {
      var h = JSON.parse(localStorage.getItem('checkdiga_hist') || '[]');
      return h[0] ? (h[0].faults || []).map(function(f){ return f.code; }).filter(Boolean) : [];
    } catch(e) { return []; }
  }

  /* --- التشخيص --- */
  function diagnose(codes){
    var set = {};
    codes.forEach(function(c){ set[String(c).toUpperCase()] = true; });

    var matches = [];
    R.forEach(function(rule){
      var ok = rule.req.every(function(c){ return set[c]; });
      if (!ok) return;
      var score = rule.req.filter(function(c){ return set[c]; }).length * 10
                + rule.opt.filter(function(c){ return set[c]; }).length * 3;
      matches.push({rule:rule, score:score});
    });

    // ترتيب
    var prio = {critical:0, high:1, medium:2, low:3};
    matches.sort(function(a,b){
      var pa = prio[a.rule.pr] || 9, pb = prio[b.rule.pr] || 9;
      return pa - pb || b.score - a.score;
    });

    // إزالة التكرار حسب الأولوية
    var seen = {}, result = [];
    matches.forEach(function(m){
      if (seen[m.rule.id]) return;
      seen[m.rule.id] = true;
      result.push(m);
    });

    // إحصائيات
    var penalty = 0, seenSv = {};
    result.forEach(function(m){
      if (seenSv[m.rule.id]) return;
      seenSv[m.rule.id] = true;
      penalty += {critical:25, high:15, medium:8, low:3}[m.rule.sv] || 5;
    });
    var healthScore = Math.max(5, Math.min(100, 100 - penalty));
    var level = healthScore < 30 ? 'critical' : healthScore < 50 ? 'poor' : healthScore < 70 ? 'fair' : healthScore < 85 ? 'good' : 'excellent';

    // تحذيرات
    var warnings = result.filter(function(m){ return m.rule.urg; }).map(function(m){
      return {t:m.rule.t, sv:m.rule.sv, ac:m.rule.ac[0] || 'راجع مختص'};
    });

    // تكلفة ووقت
    var cMin = 0, cMax = 0, tHrs = 0;
    result.forEach(function(m){
      if (m.rule.cost) { cMin += m.rule.cost.min || 0; cMax += m.rule.cost.max || 0; }
      tHrs += m.rule.time || 0;
    });

    // السبب الجذري
    var sysCount = {};
    result.forEach(function(m){
      m.rule.sys.forEach(function(s){ sysCount[s] = (sysCount[s] || 0) + 1; });
    });
    var mainSys = null, mainCnt = 0;
    for (var s in sysCount) { if (sysCount[s] > mainCnt) { mainCnt = sysCount[s]; mainSys = s; } }

    return {
      codes: codes,
      matchesCount: result.length,
      health: {score:healthScore, level:level},
      warnings: warnings,
      cost: {min:cMin, max:cMax},
      time: tHrs,
      rootCause: mainSys ? {system:mainSys, name:SYS_NAMES[mainSys] || mainSys, count:mainCnt} : null,
      diagnoses: result.map(function(m){
        return {
          t:m.rule.t, tEn:m.rule.tEn, pr:m.rule.pr, sv:m.rule.sv,
          matchedCodes: m.rule.req.concat(m.rule.opt.filter(function(c){ return set[c]; })),
          cs:m.rule.cs, ac:m.rule.ac, diy:m.rule.diy,
          cost:m.rule.cost, time:m.rule.time, urg:m.rule.urg
        };
      })
    };
  }

  /* --- عرض التقرير --- */
  function showReport(rep){
    var sColor = {critical:'#dc2626', high:'#ef4444', medium:'#f59e0b', low:'#10b981'};
    var hColor = {excellent:'from-green-500 to-emerald-600', good:'from-emerald-500 to-green-600', fair:'from-amber-500 to-orange-600', poor:'from-red-500 to-rose-600', critical:'from-red-600 to-rose-700'};

    var html = '<div class="text-center mb-5 pb-4 border-b border-gray-700"><div class="text-xs text-gray-400 mb-1">تقرير التحليل المتقدم</div><div class="text-lg font-bold">CheckDiga Pro 🔬</div></div>';

    if (rep.warnings.length > 0) {
      html += '<div class="bg-red-600 text-white p-4 rounded-2xl mb-4"><div class="font-bold text-sm mb-2">🛑 تحذيرات حرجة (' + rep.warnings.length + ')</div>';
      rep.warnings.slice(0, 3).forEach(function(w){
        html += '<div class="bg-black/20 rounded-lg p-2 mt-2"><div class="text-xs font-bold">' + w.t + '</div><div class="text-[11px] mt-1">→ ' + w.ac + '</div></div>';
      });
      html += '</div>';
    }

    html += '<div class="bg-gradient-to-l ' + (hColor[rep.health.level] || 'from-gray-500 to-gray-600') + ' rounded-2xl p-4 text-white mb-4"><div class="flex justify-between items-center"><div><div class="text-xs opacity-90">مؤشر صحة السيارة</div><div class="text-2xl font-bold mt-1">' + rep.health.score + '<span class="text-sm opacity-80">/100</span></div></div><div class="text-4xl font-bold">' + (rep.health.level === 'excellent' ? '✓' : rep.health.level === 'good' ? '👍' : '⚠️') + '</div></div></div>';

    if (rep.rootCause) {
      html += '<div class="bg-purple-900/30 border border-purple-700/50 rounded-2xl p-4 mb-4"><div class="font-bold text-purple-300 text-sm mb-2">🎯 السبب الجذري المحتمل</div><div class="text-sm mb-1">النظام: <b>' + rep.rootCause.name + '</b></div><div class="text-xs text-gray-400">' + rep.rootCause.count + ' قاعدة مرتبطة</div></div>';
    }

    if (rep.cost.max > 0 || rep.time > 0) {
      html += '<div class="grid grid-cols-2 gap-2 mb-4"><div class="bg-gray-900 rounded-xl p-3 text-center"><div class="text-xs text-gray-400 mb-1">💰 التكلفة التقديرية</div><div class="font-bold text-sm">$' + rep.cost.min + ' - $' + rep.cost.max + '</div></div><div class="bg-gray-900 rounded-xl p-3 text-center"><div class="text-xs text-gray-400 mb-1">⏱️ الوقت المتوقع</div><div class="font-bold text-sm">' + rep.time + ' ساعات</div></div></div>';
    }

    if (rep.diagnoses.length > 0) {
      html += '<div class="mb-3"><div class="font-bold text-sm mb-3">🔍 التشخيصات (' + rep.diagnoses.length + ')</div>';
      rep.diagnoses.forEach(function(d, i){
        var pc = sColor[d.pr] || '#64748b';
        html += '<div class="bg-gray-900 rounded-xl p-4 mb-3" style="border-right:4px solid ' + pc + '">';
        html += '<div class="flex justify-between items-start mb-2 gap-2"><div class="font-bold text-sm">#' + (i + 1) + ' ' + d.t + '</div><span class="text-[10px] px-2 py-1 rounded-full text-white font-bold" style="background:' + pc + '">' + d.pr + '</span></div>';
        if (d.matchedCodes && d.matchedCodes.length) {
          html += '<div class="flex flex-wrap gap-1 mb-2">';
          d.matchedCodes.forEach(function(c){ html += '<span class="text-[10px] font-mono bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded">' + c + '</span>'; });
          html += '</div>';
        }
        if (d.cs && d.cs.length) {
          html += '<div class="text-xs text-gray-300 mb-2"><div class="font-bold text-[11px] mb-1">الأسباب المحتملة:</div><ul class="space-y-0.5">';
          d.cs.slice(0, 3).forEach(function(c){ html += '<li>• ' + c.c + ' <span class="text-gray-500">(' + Math.round(c.p * 100) + '%)</')span></li>'; });
          html + += '</ul></div>';
 '</        }
        if (d.acspan && d.ac.length) {
          html += '<div class="text-xs text-blue-300 bg-blue-900/20 rounded p-2"><div class="font-bold text-[11px] mb-1">خطوات الفحص:</div><ul class="space-y-0.5">';
          d.ac.slice(0, 3).forEach(function(a){ html += '<li>• ' + a + '</li>'; });
          html += '</ul></div>';
        }
        html += '<div class="flex justify-between text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-800"><span>' + (d.diy ? '✅ يمكن DIY' : '👨‍🔧 يحتاج مختص><span>' + (d.time || '?') + ' ساعات</span></div>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '<div class="text-center text-[10px] text-gray-500 mt-4 pt-3 border-t border-gray-700">تم تحليل ' + rep.codes.length + ' كود بناءً على ' + rep.matchesCount + ' قاعدة</div>';

    showModal(html);
  }

  function showModal(html){
    var m = document.getElementById('advRepModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'advRepModal';
      m.className = 'hidden fixed inset-0 bg-black/80 z-50 p-4 overflow-y-auto';
      m.innerHTML = '<div class="max-w-3xl mx-auto mt-6 bg-gray-800 rounded-2xl p-5 relative"><button id="closeAdvRep" class="absolute top-3 right-3 bg-red-600 text-white w-8 h-8 rounded-full text-sm font-bold z-10">×</button><div id="advRepContent" class="pt-2"></div></div>';
      document.body.appendChild(m);
      document.getElementById('closeAdvRep').onclick = function(){ m.classList.add('hidden'); };
      m.onclick = function(e){ if (e.target.id === 'advRepModal') m.classList.add('hidden'); };
    }
    document.getElementById('advRepContent').innerHTML = html;
    m.classList.remove('hidden');
    m.scrollTop = 0;
  }

  /* --- إضافة الزر --- */
  function inject(){
    if (document.getElementById('btnAdvDiag')) return;
    var btn = document.getElementById('btnScanAll');
    if (!btn) { setTimeout(inject, 500); return; }
    var section = btn.closest('.bg-gray-800');
    if (!section) { setTimeout(inject, 500); return; }

    var b = document.createElement('button');
    b.id = 'btnAdvDiag';
    b.className = 'w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl text-sm font-bold mt-3 flex items-center justify-center gap-2';
    b.innerHTML = '🔬 تحليل متقدم <span class="text-[10px] opacity-80">(20 قاعدة)</span>';
    b.onclick = function(){
      var codes = readCodes();
      if (!codes.length) {
        showModal('<div class="text-center py-8"><div class="text-5xl mb-3">📋</div><div class="font-bold text-lg mb-2">لا توجد نتائج</div><p class="text-gray-400 text-sm">اضغط "تجريبي" أو "فحص المحرك" أولاً</p></div>');
        return;
      }
      showReport(diagnose(codes));
    };
    section.appendChild(b);
    console.log('[Advanced] Button injected ✅');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(inject, 500); });
  } else {
    setTimeout(inject, 500);
  }
  setTimeout(inject, 2000);
  setTimeout(inject, 4000);
  setTimeout(inject, 7000);

  console.log('[Advanced Diagnostics] Standalone module loaded ✅');
})();
