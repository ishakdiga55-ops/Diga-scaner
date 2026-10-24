/* ============================================
   Advanced Diagnostics — External Module
   ============================================ */
(function(){
  if (window.__advLoaded) return;
  window.__advLoaded = true;

  var RULES = [
    {id:'LEAN1',pr:'high',sys:['engine','fuel'],req:['P0171'],opt:['P0174'],t:'خليط فقير Bank 1',cs:[{c:'تسرب هواء مشعب',p:0.45},{c:'خرطوم فاكيوم',p:0.25},{c:'MAF متسخ',p:0.15},{c:'مضخة وقود',p:0.10},{c:'حاقن مسدود',p:0.05}],ac:['افحص خراطيم الفاكيوم','رش ماء على حشوات المشعب','نظّف MAF','افحص PCV'],cost:{min:0,max:300},time:2,diy:true,urg:false},
    {id:'MISFIRE',pr:'high',sys:['engine','exhaust'],req:['P0300'],opt:['P0301','P0302','P0303','P0304'],t:'اشتعال متقطع متعدد',cs:[{c:'بواجي',p:0.40},{c:'كويلات',p:0.25},{c:'حاقنات',p:0.15},{c:'ضغط',p:0.10},{c:'توقيت',p:0.10}],ac:['استبدل البواجي','افحص الكويلات','افحص الحاقنات'],cost:{min:50,max:1500},time:4,diy:true,urg:false},
    {id:'MISFIRE1',pr:'high',sys:['engine'],req:['P0301'],opt:[],t:'اشتعال أسطوانة 1',cs:[{c:'بوجي 1',p:0.45},{c:'كويل 1',p:0.35},{c:'حاقن 1',p:0.15}],ac:['بدّل البوجي 1↔2','بدّل الكويل 1↔2','قِس الضغط'],cost:{min:20,max:500},time:2,diy:true,urg:false},
    {id:'MISFIRE2',pr:'high',sys:['engine'],req:['P0302'],opt:[],t:'اشتعال أسطوانة 2',cs:[{c:'بوجي 2',p:0.45},{c:'كويل 2',p:0.35},{c:'حاقن 2',p:0.15}],ac:['بدّل البوجي 2↔1','بدّل الكويل 2↔1'],cost:{min:20,max:500},time:2,diy:true,urg:false},
    {id:'MISFIRE3',pr:'high',sys:['engine'],req:['P0303'],opt:[],t:'اشتعال أسطوانة 3',cs:[{c:'بوجي 3',p:0.45},{c:'كويل 3',p:0.35}],ac:['بدّل البوجي 3↔4','بدّل الكويل 3↔4'],cost:{min:20,max:500},time:2,diy:true,urg:false},
    {id:'MISFIRE4',pr:'high',sys:['engine'],req:['P0304'],opt:[],t:'اشتعال أسطوانة 4',cs:[{c:'بوجي 4',p:0.45},{c:'كويل 4',p:0.35}],ac:['بدّل البوجي 4↔3','بدّل الكويل 4↔3'],cost:{min:20,max:500},time:2,diy:true,urg:false},
    {id:'OVERHEAT',pr:'critical',sys:['cooling','engine'],req:['P0217'],opt:[],t:'ارتفاع حرارة المحرك',cs:[{c:'نقص سائل',p:0.40},{c:'مراوح لا تعمل',p:0.25},{c:'ترموستات',p:0.20},{c:'مضخة ماء',p:0.15}],ac:['أوقف فورًا','انتظر 30 دقيقة','افحص سائل التبريد','افحص المراوح'],cost:{min:0,max:2000},time:4,diy:false,urg:true},
    {id:'OIL_PRESS',pr:'critical',sys:['engine'],req:['P0524'],opt:[],t:'ضغط الزيت منخفض',cs:[{c:'نقص زيت',p:0.50},{c:'مضخة زيت',p:0.25},{c:'حساس',p:0.15},{c:'تسرب داخلي',p:0.10}],ac:['أوقف المحرك فورًا','افحص مستوى الزيت','افحص التسرب'],cost:{min:0,max:3000},time:6,diy:false,urg:true},
    {id:'CRANK',pr:'critical',sys:['engine'],req:['P0335'],opt:[],t:'حساس الكرنك',cs:[{c:'الحساس',p:0.65},{c:'أسلاك',p:0.25},{c:'عجلة أسنان',p:0.10}],ac:['افحص الأسلاك','افحص المقاومة','استبدل الحساس'],cost:{min:50,max:400},time:2,diy:true,urg:true},
    {id:'CAM',pr:'high',sys:['engine'],req:['P0340'],opt:[],t:'حساس الكام',cs:[{c:'الحساس',p:0.60},{c:'أسلاك',p:0.25},{c:'VVT',p:0.15}],ac:['افحص الأسلاك','استبدل الحساس'],cost:{min:60,max:500},time:2,diy:true,urg:false},
    {id:'EGR',pr:'medium',sys:['engine','exhaust'],req:['P0401'],opt:[],t:'تدفق EGR غير كافٍ',cs:[{c:'EGR متسخ',p:0.55},{c:'قناة مسدودة',p:0.30},{c:'حساس',p:0.15}],ac:['نظّف EGR','افحص القناة'],cost:{min:0,max:400},time:2,diy:true,urg:false},
    {id:'CAT1',pr:'medium',sys:['exhaust'],req:['P0420'],opt:[],t:'كتلايزر ضعيف B1',cs:[{c:'كتلايزر تالف',p:0.50},{c:'حساس O2',p:0.30},{c:'تسرب عادم',p:0.15}],ac:['افحص حساسات O2','افحص التسرب','استبدل الكتلايزر'],cost:{min:200,max:2000},time:4,diy:false,urg:false},
    {id:'CAT2',pr:'medium',sys:['exhaust'],req:['P0430'],opt:[],t:'كتلايزر ضعيف B2',cs:[{c:'كتلايزر',p:0.55},{c:'حساس O2',p:0.30}],ac:['افحص O2','افحص التسرب'],cost:{min:200,max:2000},time:4,diy:false,urg:false},
    {id:'EVAP',pr:'low',sys:['exhaust'],req:['P0442'],opt:['P0455'],t:'تسرب EVAP',cs:[{c:'غطاء وقود',p:0.55},{c:'خرطوم',p:0.25},{c:'purge',p:0.15}],ac:['أحكم غطاء الوقود','امسح وقُد 100 كم'],cost:{min:0,max:200},time:1,diy:true,urg:false},
    {id:'IDLE',pr:'medium',sys:['engine'],req:['P0505'],opt:[],t:'نظام الخمول',cs:[{c:'IAC متسخ',p:0.55},{c:'تسرب هواء',p:0.25},{c:'TPS',p:0.20}],ac:['نظّف IAC','افحص التسرب','افحص TPS'],cost:{min:0,max:300},time:2,diy:true,urg:false},
    {id:'MAF',pr:'medium',sys:['engine','fuel'],req:['P0100'],opt:['P0101','P0102','P0103'],t:'دائرة MAF',cs:[{c:'MAF متسخ',p:0.55},{c:'تسرب',p:0.25},{c:'أسلاك',p:0.15}],ac:['نظّف MAF','افحص الأسلاك'],cost:{min:0,max:150},time:1,diy:true,urg:false},
    {id:'ECT',pr:'medium',sys:['cooling'],req:['P0115'],opt:['P0117','P0118'],t:'حساس حرارة المحرك',cs:[{c:'الحساس',p:0.50},{c:'أسلاك',p:0.30},{c:'قابس',p:0.20}],ac:['افحص الأسلاك','قِس المقاومة','استبدل'],cost:{min:20,max:100},time:1,diy:true,urg:false},
    {id:'THERMO',pr:'medium',sys:['cooling'],req:['P0128'],opt:[],t:'ترموستات عاطل',cs:[{c:'ترموستات',p:0.80},{c:'حساس ECT',p:0.20}],ac:['استبدل الترموستات','افحص السائل'],cost:{min:30,max:150},time:2,diy:true,urg:false},
    {id:'TIMING',pr:'critical',sys:['engine'],req:['P0016'],opt:[],t:'عدم توافق التوقيت',cs:[{c:'حزام/سلسلة',p:0.55},{c:'حساسات',p:0.30},{c:'VVT',p:0.15}],ac:['أوقف السيارة','افحص التوقيت'],cost:{min:500,max:5000},time:12,diy:false,urg:true},
    {id:'LOST_ECU',pr:'critical',sys:['electronics','engine'],req:['U0100'],opt:[],t:'فقدان الاتصال بـ ECU',cs:[{c:'أسلاك CAN',p:0.40},{c:'فيوز ECU',p:0.25},{c:'ECU',p:0.20},{c:'أرضية',p:0.15}],ac:['توقف فورًا','افحص فيوز ECU','افحص CAN'],cost:{min:200,max:4000},time:8,diy:false,urg:true},
    {id:'LOST_TCM',pr:'critical',sys:['transmission','electronics'],req:['U0101'],opt:[],t:'فقدان الاتصال بـ TCM',cs:[{c:'أسلاك CAN',p:0.45},{c:'فيوز',p:0.30},{c:'TCM',p:0.25}],ac:['افحص الفيوز','افحص CAN'],cost:{min:200,max:3000},time:6,diy:false,urg:true},
    {id:'LOST_ABS',pr:'high',sys:['abs','electronics'],req:['U0121'],opt:[],t:'فقدان الاتصال بـ ABS',cs:[{c:'CAN',p:0.40},{c:'فيوز',p:0.35},{c:'وحدة ABS',p:0.25}],ac:['افحص الفيوز','افحص CAN'],cost:{min:100,max:2000},time:4,diy:false,urg:false},
    {id:'CAN_BUS',pr:'critical',sys:['electronics'],req:['U0001'],opt:['U0002'],t:'CAN Bus معطل',cs:[{c:'قصر CAN',p:0.50},{c:'مقاومة CAN',p:0.30},{c:'وحدة',p:0.20}],ac:['لا تشغّل السيارة','افحص CAN'],cost:{min:300,max:3000},time:8,diy:false,urg:true},
    {id:'ABS_FL',pr:'high',sys:['abs','brakes'],req:['C0035'],opt:['C0040','C0045','C0050'],t:'حساس عجلة ABS',cs:[{c:'الحساس',p:0.55},{c:'أسلاك',p:0.30},{c:'حلقة ABS',p:0.15}],ac:['افحص الأسلاك','افحص الحساس'],cost:{min:50,max:400},time:2,diy:true,urg:false},
    {id:'ABS_PUMP',pr:'critical',sys:['abs','brakes'],req:['C0110'],opt:[],t:'مضخة ABS',cs:[{c:'المضخة',p:0.50},{c:'فيوز',p:0.25},{c:'ريلاي',p:0.15},{c:'أسلاك',p:0.10}],ac:['توقف','افحص الفيوز','راجع مختص'],cost:{min:200,max:2500},time:6,diy:false,urg:true},
    {id:'ABS_RELAY',pr:'high',sys:['abs','brakes'],req:['C0265'],opt:[],t:'دائرة ريلاي موتور ABS',cs:[{c:'فيوز أو ريلاي ABS',p:0.40},{c:'أسلاك وقوابس',p:0.30},{c:'موتور المضخة',p:0.20},{c:'وحدة ABS',p:0.10}],ac:['افحص فيوز وريلاي ABS','افحص الأسلاك والقوابس','راجع مختص'],cost:{min:50,max:1500},time:3,diy:false,urg:false},
    {id:'AIRBAG',pr:'critical',sys:['airbag'],req:['B0001'],opt:['B0010','B1000'],t:'عطل الوسائد الهوائية',cs:[{c:'قابس مفصول',p:0.40},{c:'clock spring',p:0.30},{c:'أسلاك',p:0.20},{c:'الوسادة',p:0.10}],ac:['افحص القابس','افحص clock spring','راجع مختص'],cost:{min:200,max:2000},time:4,diy:false,urg:true},
    {id:'CHARGING',pr:'high',sys:['battery'],req:['P0562'],opt:[],t:'مشكلة في الشحن',cs:[{c:'دينامو',p:0.50},{c:'بطارية',p:0.30},{c:'حزام',p:0.15},{c:'أسلاك',p:0.05}],ac:['افحص فولت البطارية','افحص الدينامو','افحص الحزام'],cost:{min:100,max:1500},time:3,diy:true,urg:false},
    {id:'TRANSM',pr:'high',sys:['transmission'],req:['P0700'],opt:[],t:'عطل ناقل الحركة',cs:[{c:'كود فرعي TCM',p:0.70},{c:'TCM',p:0.15},{c:'أسلاك',p:0.15}],ac:['اقرأ أكواد TCM','افحص زيت الجير','راجع مختص'],cost:{min:100,max:5000},time:8,diy:false,urg:false},
    {id:'GEAR_R',pr:'critical',sys:['transmission'],req:['P0730'],opt:[],t:'نسبة التروس غير صحيحة',cs:[{c:'زيت منخفض',p:0.35},{c:'حساس سرعة',p:0.25},{c:'قابض تالف',p:0.25},{c:'هيدروليكي',p:0.15}],ac:['توقف','افحص زيت الجير','راجع مختص'],cost:{min:500,max:8000},time:12,diy:false,urg:true}
  ];

  var SYS_NAME = {engine:'المحرك',transmission:'الجير',abs:'ABS',brakes:'الفرامل',airbag:'الوسائد',fuel:'الوقود',cooling:'التبريد',exhaust:'العادم',battery:'البطارية',electronics:'الكهرباء'};

  function getCodes(){
    try {
      var last = JSON.parse(localStorage.getItem('checkdiga_last') || '[]');
      return last.map(function(f){ return f.code; }).filter(Boolean);
    } catch(e) { return []; }
  }

  function analyze(codes){
    var set = {};
    codes.forEach(function(c){ set[String(c).toUpperCase()] = true; });
    var matches = [];
    RULES.forEach(function(r){
      var ok = r.req.every(function(c){ return set[c]; });
      if (!ok) return;
      var score = r.req.filter(function(c){return set[c];}).length * 10 + r.opt.filter(function(c){return set[c];}).length * 3;
      matches.push({r:r, score:score});
    });
    var prOrd = {critical:0, high:1, medium:2, low:3};
    matches.sort(function(a,b){ return (prOrd[a.r.pr]||9) - (prOrd[b.r.pr]||9) || b.score - a.score; });
    var seen = {}, result = [];
    matches.forEach(function(m){ if(!seen[m.r.id]){ seen[m.r.id]=true; result.push(m); }});
    var penalty = 0;
    result.forEach(function(m){ penalty += {critical:25,high:15,medium:8,low:3}[m.r.pr]||5; });
    var score = Math.max(5, Math.min(100, 100 - penalty));
    var level = score<30?'critical':score<50?'poor':score<70?'fair':score<85?'good':'excellent';
    var warns = result.filter(function(m){return m.r.urg;}).map(function(m){return {t:m.r.t, ac:m.r.ac[0]||'راجع مختص'};});
    var cMin=0, cMax=0, hrs=0;
    result.forEach(function(m){ if(m.r.cost){cMin+=m.r.cost.min;cMax+=m.r.cost.max;} hrs+=m.r.time||0; });
    var sysCnt = {};
    result.forEach(function(m){ m.r.sys.forEach(function(s){ sysCnt[s]=(sysCnt[s]||0)+1; }); });
    var rootSys=null, maxC=0;
    for(var k in sysCnt){ if(sysCnt[k]>maxC){ maxC=sysCnt[k]; rootSys=k; }}
    return {
      codes:codes, n:result.length,
      health:{score:score, level:level},
      warnings:warns,
      cost:{min:cMin, max:cMax},
      time:hrs,
      root: rootSys ? {name:SYS_NAME[rootSys]||rootSys, count:maxC} : null,
      diagnoses: result.map(function(m){
        return {
          t:m.r.t, pr:m.r.pr,
          mc:m.r.req.concat(m.r.opt.filter(function(c){return set[c];})),
          cs:m.r.cs, ac:m.r.ac, diy:m.r.diy,
          time:m.r.time, cost:m.r.cost
        };
      })
    };
  }

  function showReport(rep){
    var prColor = {critical:'#dc2626', high:'#ef4444', medium:'#f59e0b', low:'#10b981'};
    var hlColor = {excellent:'from-green-500 to-emerald-600', good:'from-emerald-500 to-green-600', fair:'from-amber-500 to-orange-600', poor:'from-red-500 to-rose-600', critical:'from-red-600 to-rose-700'};
    var h = '<div class="text-center mb-5 pb-4 border-b border-gray-700"><div class="text-xs text-gray-400 mb-1">تقرير التحليل المتقدم</div><div class="text-lg font-bold">CheckDiga Pro 🔬</div></div>';
    if (rep.warnings.length) {
      h += '<div class="bg-red-600 text-white p-4 rounded-2xl mb-4"><div class="font-bold text-sm mb-2">🛑 تحذيرات حرجة ('+rep.warnings.length+')</div>';
      rep.warnings.slice(0,3).forEach(function(w){ h += '<div class="bg-black/20 rounded-lg p-2 mt-2"><div class="text-xs font-bold">'+w.t+'</div><div class="text-[11px] mt-1">→ '+w.ac+'</div></div>'; });
      h += '</div>';
    }
    h += '<div class="bg-gradient-to-l '+(hlColor[rep.health.level]||'from-gray-500 to-gray-600')+' rounded-2xl p-4 text-white mb-4"><div class="flex justify-between items-center"><div><div class="text-xs opacity-90">مؤشر صحة السيارة</div><div class="text-2xl font-bold mt-1">'+rep.health.score+'<span class="text-sm opacity-80">/100</span></div></div><div class="text-4xl font-bold">'+(rep.health.level==='excellent'?'✓':rep.health.level==='good'?'👍':'⚠️')+'</div></div></div>';
    if (rep.root) { h += '<div class="bg-purple-900/30 border border-purple-700/50 rounded-2xl p-4 mb-4"><div class="font-bold text-purple-300 text-sm mb-2">🎯 السبب الجذري المحتمل</div><div class="text-sm mb-1">النظام: <b>'+rep.root.name+'</b></div><div class="text-xs text-gray-400">'+rep.root.count+' قاعدة مرتبطة</div></div>'; }
    if (rep.cost.max > 0 || rep.time > 0) { h += '<div class="grid grid-cols-2 gap-2 mb-4"><div class="bg-gray-900 rounded-xl p-3 text-center"><div class="text-xs text-gray-400 mb-1">💰 التكلفة التقديرية</div><div class="font-bold text-sm">$'+rep.cost.min+' - $'+rep.cost.max+'</div></div><div class="bg-gray-900 rounded-xl p-3 text-center"><div class="text-xs text-gray-400 mb-1">⏱️ الوقت المتوقع</div><div class="font-bold text-sm">'+rep.time+' ساعات</div></div></div>'; }
    if (rep.diagnoses.length) {
      h += '<div class="mb-3"><div class="font-bold text-sm mb-3">🔍 التشخيصات ('+rep.diagnoses.length+')</div>';
      rep.diagnoses.forEach(function(d,i){
        var pc = prColor[d.pr] || '#64748b';
        h += '<div class="bg-gray-900 rounded-xl p-4 mb-3" style="border-right:4px solid '+pc+'">';
        h += '<div class="flex justify-between items-start mb-2 gap-2"><div class="font-bold text-sm">#'+(i+1)+' '+d.t+'</div><span class="text-[10px] px-2 py-1 rounded-full text-white font-bold" style="background:'+pc+'">'+d.pr+'</span></div>';
        if (d.mc && d.mc.length) { h += '<div class="flex flex-wrap gap-1 mb-2">'; d.mc.forEach(function(c){ h += '<span class="text-[10px] font-mono bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded">'+c+'</span>'; }); h += '</div>'; }
        if (d.cs && d.cs.length) { h += '<div class="text-xs text-gray-300 mb-2"><div class="font-bold text-[11px] mb-1">الأسباب المحتملة:</div><ul class="space-y-0.5">'; d.cs.slice(0,3).forEach(function(c){ h += '<li>• '+c.c+' <span class="text-gray-500">('+Math.round(c.p*100)+'%)</span></li>'; }); h += '</ul></div>'; }
        if (d.ac && d.ac.length) { h += '<div class="text-xs text-blue-300 bg-blue-900/20 rounded p-2"><div class="font-bold text-[11px] mb-1">خطوات الفحص:</div><ul class="space-y-0.5">'; d.ac.slice(0,3).forEach(function(a){ h += '<li>• '+a+'</li>'; }); h += '</ul></div>'; }
        h += '<div class="flex justify-between text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-800"><span>'+(d.diy?'✅ يمكن DIY':'👨‍🔧 يحتاج مختص')+'</span><span>'+(d.time||'?')+' ساعات</span></div>';
        h += '</div>';
      });
      h += '</div>';
    }
    h += '<div class="text-center text-[10px] text-gray-500 mt-4 pt-3 border-t border-gray-700">تم تحليل '+rep.codes.length+' كود بناءً على '+rep.n+' قاعدة</div>';
    openModal(h);
  }

  function openModal(html){
    var m = document.getElementById('advReportModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'advReportModal';
      m.className = 'hidden fixed inset-0 bg-black/80 z-50 p-4 overflow-y-auto';
      m.innerHTML = '<div class="max-w-3xl mx-auto mt-6 bg-gray-800 rounded-2xl p-5 relative"><button id="advClose" class="absolute top-3 right-3 bg-red-600 text-white w-8 h-8 rounded-full text-sm font-bold z-10">×</button><div id="advContent" class="pt-2"></div></div>';
      document.body.appendChild(m);
      document.getElementById('advClose').onclick = function(){ m.classList.add('hidden'); };
      m.onclick = function(e){ if (e.target.id === 'advReportModal') m.classList.add('hidden'); };
    }
    document.getElementById('advContent').innerHTML = html;
    m.classList.remove('hidden');
    m.scrollTop = 0;
  }

  function injectBtn(){
    if (document.getElementById('btnAdvDiag')) return;
    var anchor = document.getElementById('btnScanABS');
    if (!anchor) { setTimeout(injectBtn, 400); return; }
    var parent = anchor.closest('.bg-gray-800');
    if (!parent) { setTimeout(injectBtn, 400); return; }
    var b = document.createElement('button');
    b.id = 'btnAdvDiag';
    b.type = 'button';
    b.className = 'w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl text-sm font-bold mt-3 flex items-center justify-center gap-2 col-span-2';
    b.innerHTML = '🔬 تحليل متقدم <span class="text-[10px] opacity-80">(' + RULES.length + ' قاعدة)</span>';
    b.onclick = function(){
      var codes = getCodes();
      if (!codes.length) {
        openModal('<div class="text-center py-8"><div class="text-5xl mb-3">📋</div><div class="font-bold text-lg mb-2">لا توجد نتائج بعد</div><p class="text-gray-400 text-sm">اضغط "تجريبي" أو "فحص المحرك" أولاً</p></div>');
        return;
      }
      try { showReport(analyze(codes)); }
      catch(e) { openModal('<div class="text-center py-8"><div class="text-5xl mb-3">❌</div><div class="font-bold text-lg mb-2">خطأ في التحليل</div><p class="text-red-400 text-sm">'+e.message+'</p></div>'); }
    };
    parent.appendChild(b);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(injectBtn, 400); });
  else setTimeout(injectBtn, 400);
  setTimeout(injectBtn, 1500);
  setTimeout(injectBtn, 3000);
  setTimeout(injectBtn, 6000);
})();
