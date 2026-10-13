/* ============================================
   CheckDiga Pro — Diagnostic Rules Database
   قاعدة قواعد التشخيص
   ============================================
   
   البنية:
   {
     id: معرف فريد
     priority: 'critical' | 'high' | 'medium' | 'low'
     severity: 'critical' | 'high' | 'medium' | 'low'
     systems: الأنظمة المتأثرة
     codes: { required: [...], optional: [...] }
     title: العنوان بالعربية
     titleEn: العنوان بالإنجليزية
     symptoms: الأعراض
     causes: الأسباب المحتملة (مرتبة)
     actions: خطوات الإصلاح
     diyPossible: هل يمكن DIY
     difficulty: 'easy' | 'medium' | 'hard'
     estimatedCost: {min, max}
     estimatedTime: بالساعات
     urgent: هل يحتاج إصلاح فوري
   }
   ============================================ */

export const RULES = [
  /* ============================================
     ENGINE — P0xxx (المحرك)
     ============================================ */

  {
    id: 'MAF_CIRCUIT',
    priority: 'medium',
    severity: 'medium',
    systems: ['engine', 'fuel'],
    codes: { required: ['P0100'], optional: ['P0101', 'P0102', 'P0103'] },
    title: 'دائرة حساس تدفق الهواء MAF',
    titleEn: 'MAF Sensor Circuit',
    symptoms: ['خمول غير مستقر', 'ضعف تسارع', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'حساس MAF متسخ', prob: 0.55 },
      { cause: 'تسرب هواء بعد MAF', prob: 0.25 },
      { cause: 'أسلاك الحساس تالفة', prob: 0.15 },
      { cause: 'الحساس نفسه معطوب', prob: 0.05 }
    ],
    actions: [
      'افحص خرطوم السحب بصريًا',
      'نظّف حساس MAF بمنظف خاص',
      'افحص الفولت على الأسلاك',
      'استبدل الحساس إذا فشل التنظيف'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 0, max: 150 },
    estimatedTime: 1,
    urgent: false
  },

  {
    id: 'MAF_RANGE',
    priority: 'medium',
    severity: 'medium',
    systems: ['engine', 'fuel'],
    codes: { required: ['P0101'] },
    title: 'أداء حساس MAF خارج النطاق',
    titleEn: 'MAF Range/Performance',
    symptoms: ['اهتزاز المحرك', 'فقدان قدرة', 'قراءة MAF غريبة'],
    causes: [
      { cause: 'MAF متسخ', prob: 0.60 },
      { cause: 'تسرب هواء', prob: 0.25 },
      { cause: 'فلتر هواء مسدود', prob: 0.15 }
    ],
    actions: [
      'نظّف MAF',
      'افحص فلتر الهواء',
      'افحص خراطيم السحب'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 0, max: 80 },
    estimatedTime: 1,
    urgent: false
  },

  {
    id: 'ECT_CIRCUIT',
    priority: 'medium',
    severity: 'medium',
    systems: ['cooling'],
    codes: { required: ['P0115'], optional: ['P0117', 'P0118'] },
    title: 'دائرة حساس حرارة المحرك ECT',
    titleEn: 'Engine Coolant Temperature Sensor Circuit',
    symptoms: ['قراءة حرارة غير منطقية', 'مراوح لا تعمل', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'حساس ECT معطوب', prob: 0.50 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'قابس مترهل', prob: 0.20 }
    ],
    actions: [
      'افحص أسلاك الحساس',
      'قِس مقاومة الحساس (بارد/ساخن)',
      'استبدل الحساس إن لزم'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 20, max: 100 },
    estimatedTime: 1,
    urgent: false
  },

  {
    id: 'THERMOSTAT',
    priority: 'medium',
    severity: 'medium',
    systems: ['cooling'],
    codes: { required: ['P0128'] },
    title: 'ترموستات عاطل — المحرك لا يصل للحرارة الطبيعية',
    titleEn: 'Thermostat Below Regulating Temperature',
    symptoms: ['المحرك يبرد بسرعة', 'دفء ضعيف في المدفأة', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'ترموستات مفتوح على الدوام', prob: 0.80 },
      { cause: 'حساس ECT معطوب', prob: 0.20 }
    ],
    actions: [
      'استبدل الترموستات',
      'افحص سائل التبريد',
      'تحقق من حساس ECT'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 30, max: 150 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'LEAN_BANK_1',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'fuel', 'exhaust'],
    codes: { required: ['P0171'], optional: ['P0174', 'P0130'] },
    title: 'خليط فقير — Bank 1',
    titleEn: 'System Too Lean Bank 1',
    symptoms: ['اهتزاز على الخمول', 'ضعف تسارع', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'تسرب هواء في مشعب السحب', prob: 0.45 },
      { cause: 'خرطوم فاكيوم مشقوق', prob: 0.25 },
      { cause: 'MAF متسخ', prob: 0.15 },
      { cause: 'مضخة وقود ضعيفة', prob: 0.10 },
      { cause: 'حاقن مسدود', prob: 0.05 }
    ],
    actions: [
      'افحص خراطيم الفاكيوم',
      'رش ماء على حشوات المشعب أثناء الخمول',
      'افحص PCV valve',
      'نظّف MAF',
      'افحص ضغط مضخة الوقود'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 0, max: 300 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'LEAN_BANK_2',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'fuel', 'exhaust'],
    codes: { required: ['P0174'], optional: ['P0171'] },
    title: 'خليط فقير — Bank 2',
    titleEn: 'System Too Lean Bank 2',
    symptoms: ['اهتزاز على الخمول', 'ضعف تسارع'],
    causes: [
      { cause: 'تسرب هواء في مشعب السحب', prob: 0.55 },
      { cause: 'خرطوم فاكيوم مشقوق', prob: 0.30 },
      { cause: 'MAF متسخ', prob: 0.15 }
    ],
    actions: [
      'افحص خراطيم الفاكيوم',
      'افحص حشوة المشعب'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 0, max: 300 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'LEAN_BOTH_BANKS',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'fuel', 'exhaust'],
    codes: { required: ['P0171', 'P0174'] },
    title: 'تسرب هواء في نظام السحب — كلاهما Bank',
    titleEn: 'System Too Lean — Both Banks',
    symptoms: ['اهتزاز على الخمول', 'ضعف تسارع', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'خرطوم فاكيوم رئيسي مشقوق', prob: 0.55 },
      { cause: 'MAF متسخ أو معطوب', prob: 0.30 },
      { cause: 'حشوة مشعب السحب تالفة', prob: 0.15 }
    ],
    actions: [
      'افحص خراطيم الفاكيوم بصريًا',
      'رش ماء على الحشوات أثناء الخمول',
      'نظّف MAF بمنظف خاص',
      'افحص PCV valve'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 0, max: 400 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'RICH_BANK_1',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'fuel', 'exhaust'],
    codes: { required: ['P0172'], optional: ['P0175'] },
    title: 'خليط غني — Bank 1',
    titleEn: 'System Too Rich Bank 1',
    symptoms: ['دخان أسود', 'رائحة بنزين', 'صرف بنزين مرتفع', 'احتراق غير كامل'],
    causes: [
      { cause: 'حاقن يسيل', prob: 0.40 },
      { cause: 'منظم ضغط الوقود معطوب', prob: 0.30 },
      { cause: 'حساس O2 معطوب', prob: 0.20 },
      { cause: 'فلتر هواء مسدود', prob: 0.10 }
    ],
    actions: [
      'افحص حساسات O2',
      'افحص ضغط الوقود',
      'افحص الحاقنات',
      'افحص فلتر الهواء'
    ],
    diyPossible: false,
    difficulty: 'medium',
    estimatedCost: { min: 100, max: 600 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'RICH_BANK_2',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'fuel', 'exhaust'],
    codes: { required: ['P0175'], optional: ['P0172'] },
    title: 'خليط غني — Bank 2',
    titleEn: 'System Too Rich Bank 2',
    symptoms: ['دخان أسود', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'حاقن يسيل', prob: 0.50 },
      { cause: 'حساس O2 معطوب', prob: 0.30 },
      { cause: 'ضغط وقود مرتفع', prob: 0.20 }
    ],
    actions: [
      'افحص حساس O2 Bank 2',
      'افحص ضغط الوقود'
    ],
    diyPossible: false,
    difficulty: 'medium',
    estimatedCost: { min: 100, max: 600 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'OVERHEATING',
    priority: 'critical',
    severity: 'critical',
    systems: ['cooling', 'engine'],
    codes: { required: ['P0217'] },
    title: '🚨 ارتفاع حرارة المحرك — خطر',
    titleEn: 'Engine Overheating',
    symptoms: ['حرارة مرتفعة', 'بخار من الكبوت', 'رائحة احتراق'],
    causes: [
      { cause: 'نقص سائل التبريد', prob: 0.40 },
      { cause: 'مراوح لا تعمل', prob: 0.25 },
      { cause: 'ترموستات عاطل', prob: 0.20 },
      { cause: 'مضخة ماء تالفة', prob: 0.15 }
    ],
    actions: [
      '🛑 أوقف السيارة فورًا',
      'انتظر 30 دقيقة قبل فتح الرادياتير',
      'افحص مستوى سائل التبريد',
      'افحص المراوح',
      'افحص الترموستات'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 0, max: 2000 },
    estimatedTime: 4,
    urgent: true
  },

  {
    id: 'TURBO_UNDERBOOST',
    priority: 'high',
    severity: 'high',
    systems: ['engine'],
    codes: { required: ['P0299'], optional: ['P0234'] },
    title: 'ضغط التيربو منخفض',
    titleEn: 'Turbocharger Underboost',
    symptoms: ['ضعف تسارع كبير', 'دخان أسود', 'صوت صفير غير طبيعي'],
    causes: [
      { cause: 'تسرب في نظام التيربو', prob: 0.45 },
      { cause: 'Wastegate عالق', prob: 0.25 },
      { cause: 'حساس ضغط التيربو معطوب', prob: 0.20 },
      { cause: 'خرطوم التيربو مشقوق', prob: 0.10 }
    ],
    actions: [
      'افحص خراطيم التيربو',
      'افحص Wastegate',
      'افحص intercooler',
      'افحص حساس ضغط التيربو'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 3000 },
    estimatedTime: 6,
    urgent: false
  },

  {
    id: 'MISFIRE_RANDOM',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'exhaust'],
    codes: { required: ['P0300'], optional: ['P0301', 'P0302', 'P0303', 'P0304'] },
    title: 'اشتعال متقطع متعدد الأسطوانات',
    titleEn: 'Random/Multiple Cylinder Misfire',
    symptoms: ['اهتزاز المحرك', 'فقدان قدرة', 'صرف بنزين مرتفع', 'رائحة بنزين من العادم'],
    causes: [
      { cause: 'بواجي متهالكة', prob: 0.40 },
      { cause: 'كويلات إشعال معطوبة', prob: 0.25 },
      { cause: 'حاقنات مسدودة', prob: 0.15 },
      { cause: 'ضغط أسطوانات منخفض', prob: 0.10 },
      { cause: 'خلل في التوقيت', prob: 0.10 }
    ],
    actions: [
      'استبدل البواجي',
      'افحص الكويلات',
      'افحص الحاقنات',
      'قِس ضغط الأسطوانات',
      'افحص توقيت المحرك'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 50, max: 1500 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'MISFIRE_CYL_1',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'exhaust'],
    codes: { required: ['P0301'] },
    title: 'اشتعال متقطع — أسطوانة 1',
    titleEn: 'Cylinder 1 Misfire',
    symptoms: ['اهتزاز المحرك', 'ضعف تسارع'],
    causes: [
      { cause: 'بوجي 1 متهالك', prob: 0.45 },
      { cause: 'كويل 1 معطوب', prob: 0.35 },
      { cause: 'حاقن 1 مسدود', prob: 0.15 },
      { cause: 'ضغط أسطوانة 1 منخفض', prob: 0.05 }
    ],
    actions: [
      'بدّل البوجي 1 مع 2 لاختبار',
      'بدّل الكويل 1 مع 2 لاختبار',
      'إذا انتقل الخطأ → الجزء المبدّل معطوب',
      'قِس ضغط الأسطوانة 1'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 20, max: 500 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'MISFIRE_CYL_2',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'exhaust'],
    codes: { required: ['P0302'] },
    title: 'اشتعال متقطع — أسطوانة 2',
    titleEn: 'Cylinder 2 Misfire',
    symptoms: ['اهتزاز المحرك', 'ضعف تسارع'],
    causes: [
      { cause: 'بوجي 2 متهالك', prob: 0.45 },
      { cause: 'كويل 2 معطوب', prob: 0.35 },
      { cause: 'حاقن 2 مسدود', prob: 0.15 },
      { cause: 'ضغط أسطوانة 2 منخفض', prob: 0.05 }
    ],
    actions: [
      'بدّل البوجي 2 مع 1 لاختبار',
      'بدّل الكويل 2 مع 1 لاختبار',
      'قِس ضغط الأسطوانة 2'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 20, max: 500 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'MISFIRE_CYL_3',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'exhaust'],
    codes: { required: ['P0303'] },
    title: 'اشتعال متقطع — أسطوانة 3',
    titleEn: 'Cylinder 3 Misfire',
    symptoms: ['اهتزاز المحرك', 'ضعف تسارع'],
    causes: [
      { cause: 'بوجي 3 متهالك', prob: 0.45 },
      { cause: 'كويل 3 معطوب', prob: 0.35 },
      { cause: 'حاقن 3 مسدود', prob: 0.15 },
      { cause: 'ضغط أسطوانة 3 منخفض', prob: 0.05 }
    ],
    actions: [
      'بدّل البوجي 3 مع 4 لاختبار',
      'بدّل الكويل 3 مع 4 لاختبار',
      'قِس ضغط الأسطوانة 3'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 20, max: 500 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'MISFIRE_CYL_4',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'exhaust'],
    codes: { required: ['P0304'] },
    title: 'اشتعال متقطع — أسطوانة 4',
    titleEn: 'Cylinder 4 Misfire',
    symptoms: ['اهتزاز المحرك', 'ضعف تسارع'],
    causes: [
      { cause: 'بوجي 4 متهالك', prob: 0.45 },
      { cause: 'كويل 4 معطوب', prob: 0.35 },
      { cause: 'حاقن 4 مسدود', prob: 0.15 },
      { cause: 'ضغط أسطوانة 4 منخفض', prob: 0.05 }
    ],
    actions: [
      'بدّل البوجي 4 مع 3 لاختبار',
      'بدّل الكويل 4 مع 3 لاختبار',
      'قِس ضغط الأسطوانة 4'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 20, max: 500 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'CRANKSHAFT_SENSOR',
    priority: 'critical',
    severity: 'critical',
    systems: ['engine', 'electronics'],
    codes: { required: ['P0335'] },
    title: '🚨 دائرة حساس الكرنك — قد لا تشتغل السيارة',
    titleEn: 'Crankshaft Position Sensor Circuit',
    symptoms: ['السيارة لا تشتغل', 'تشتغل ثم تتوقف', 'اهتزاز شديد'],
    causes: [
      { cause: 'حساس الكرنك معطوب', prob: 0.65 },
      { cause: 'أسلاك مقطوعة', prob: 0.25 },
      { cause: 'عجلة الأسنان تالفة', prob: 0.10 }
    ],
    actions: [
      'افحص أسلاك الحساس',
      'افحص المقاومة',
      'استبدل الحساس (شائع)',
      'افحص عجلة الأسنان'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 50, max: 400 },
    estimatedTime: 2,
    urgent: true
  },

  {
    id: 'CAMSHAFT_SENSOR',
    priority: 'high',
    severity: 'high',
    systems: ['engine'],
    codes: { required: ['P0340'] },
    title: 'دائرة حساس الكام',
    titleEn: 'Camshaft Position Sensor Circuit',
    symptoms: ['تأخر في التشغيل', 'ضعف تسارع', 'خمول غير مستقر'],
    causes: [
      { cause: 'حساس الكام معطوب', prob: 0.60 },
      { cause: 'أسلاك مقطوعة', prob: 0.25 },
      { cause: 'توقيت متغير معطل', prob: 0.15 }
    ],
    actions: [
      'افحص أسلاك الحساس',
      'استبدل الحساس',
      'افحص VVT solenoid'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 60, max: 500 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'EGR_FLOW',
    priority: 'medium',
    severity: 'medium',
    systems: ['engine', 'exhaust'],
    codes: { required: ['P0401'], optional: ['P0402'] },
    title: 'تدفق EGR غير كافٍ',
    titleEn: 'EGR Flow Insufficient',
    symptoms: ['خمول غير مستقر', 'تقطيع على التسارع', 'طرقعة'],
    causes: [
      { cause: 'صمام EGR متسخ', prob: 0.55 },
      { cause: 'قناة EGR مسدودة', prob: 0.30 },
      { cause: 'حساس ضغط تفاضلي معطوب', prob: 0.15 }
    ],
    actions: [
      'نظّف صمام EGR',
      'افحص القناة',
      'استبدل الصمام إذا لزم'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 0, max: 400 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'CATALYST_B1',
    priority: 'medium',
    severity: 'medium',
    systems: ['exhaust'],
    codes: { required: ['P0420'] },
    title: 'كتلايزر ضعيف — Bank 1',
    titleEn: 'Catalyst System Efficiency Below Threshold Bank 1',
    symptoms: ['فشل فحص الانبعاثات', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'كتلايزر تالف', prob: 0.50 },
      { cause: 'حساس O2 خلفي معطوب', prob: 0.30 },
      { cause: 'تسرب في نظام العادم', prob: 0.15 },
      { cause: 'اشتعال متقطع أتلف الكتلايزر', prob: 0.05 }
    ],
    actions: [
      'افحص حساسات O2 قبل الكتلايزر وبعده',
      'افحص تسرب العادم',
      'إذا كان الفرق ضعيفًا → الكتلايزر تالف',
      'استبدل الكتلايزر'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 2000 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'CATALYST_B2',
    priority: 'medium',
    severity: 'medium',
    systems: ['exhaust'],
    codes: { required: ['P0430'] },
    title: 'كتلايزر ضعيف — Bank 2',
    titleEn: 'Catalyst System Efficiency Below Threshold Bank 2',
    symptoms: ['فشل فحص الانبعاثات'],
    causes: [
      { cause: 'كتلايزر تالف', prob: 0.55 },
      { cause: 'حساس O2 خلفي معطوب', prob: 0.30 },
      { cause: 'تسرب عادم', prob: 0.15 }
    ],
    actions: [
      'افحص حساسات O2',
      'افحص تسرب العادم'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 2000 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'EVAP_SMALL',
    priority: 'low',
    severity: 'low',
    systems: ['exhaust'],
    codes: { required: ['P0442'], optional: ['P0455', 'P0456'] },
    title: 'تسرب صغير في نظام EVAP',
    titleEn: 'EVAP System Small Leak',
    symptoms: ['رائحة بنزين خفيفة', 'لمبة المحرك'],
    causes: [
      { cause: 'غطاء الوقود غير محكم', prob: 0.55 },
      { cause: 'خرطوم EVAP مشقوق', prob: 0.25 },
      { cause: 'purge valve معطوب', prob: 0.15 },
      { cause: 'خزان الوقود به ثقب صغير', prob: 0.05 }
    ],
    actions: [
      'أعد إحكام غطاء الوقود',
      'امسح الأعطال وقُد 100 كم',
      'إذا عاد الخطأ → افحص الخراطيم',
      'افحص purge valve'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 0, max: 200 },
    estimatedTime: 1,
    urgent: false
  },

  {
    id: 'EVAP_LARGE',
    priority: 'medium',
    severity: 'medium',
    systems: ['exhaust'],
    codes: { required: ['P0455'] },
    title: 'تسرب كبير في نظام EVAP',
    titleEn: 'EVAP System Large Leak',
    symptoms: ['رائحة بنزين واضحة', 'لمبة المحرك'],
    causes: [
      { cause: 'غطاء الوقود مفقود أو تالف', prob: 0.50 },
      { cause: 'خرطوم EVAP مقطوع', prob: 0.35 },
      { cause: 'canister تالف', prob: 0.15 }
    ],
    actions: [
      'افحص غطاء الوقود',
      'افحص خراطيم EVAP',
      'افحص canister'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 0, max: 300 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'IDLE_CONTROL',
    priority: 'medium',
    severity: 'medium',
    systems: ['engine'],
    codes: { required: ['P0505'] },
    title: 'نظام التحكم في الخمول',
    titleEn: 'Idle Control System Malfunction',
    symptoms: ['خمول غير مستقر', 'المحرك يطفأ عند التوقف', 'RPM يتأرجح'],
    causes: [
      { cause: 'IAC valve متسخ', prob: 0.55 },
      { cause: 'تسرب هواء', prob: 0.25 },
      { cause: 'حساس TPS معطوب', prob: 0.20 }
    ],
    actions: [
      'نظّف IAC valve',
      'افحص تسرب الهواء',
      'افحص TPS'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 0, max: 300 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'OIL_PRESSURE_LOW',
    priority: 'critical',
    severity: 'critical',
    systems: ['engine'],
    codes: { required: ['P0524'] },
    title: '🚨 ضغط الزيت منخفض — خطر على المحرك',
    titleEn: 'Engine Oil Pressure Too Low',
    symptoms: ['لمبة الزيت مضاءة', 'أصوات من المحرك', 'طرقعة'],
    causes: [
      { cause: 'نقص زيت المحرك', prob: 0.50 },
      { cause: 'مضخة الزيت ضعيفة', prob: 0.25 },
      { cause: 'حساس ضغط الزيت معطوب', prob: 0.15 },
      { cause: 'تسرب زيت داخلي', prob: 0.10 }
    ],
    actions: [
      '🛑 أوقف المحرك فورًا',
      'افحص مستوى الزيت',
      'افحص تسرب الزيت',
      'افحص حساس الضغط',
      'إذا كان المستوى طبيعيًا → افحص المضخة'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 0, max: 3000 },
    estimatedTime: 6,
    urgent: true
  },

  {
    id: 'TRANSMISSION_GENERAL',
    priority: 'high',
    severity: 'high',
    systems: ['transmission'],
    codes: { required: ['P0700'], optional: ['P0701', 'P0705'] },
    title: 'عطل في ناقل الحركة — راجع وحدة TCM',
    titleEn: 'Transmission Control System Malfunction',
    symptoms: ['أضواء تحذير', 'نقل غير سلس', 'Gear لا يبدّل'],
    causes: [
      { cause: 'كود فرعي مخفي في TCM — يحتاج قارئ متقدم', prob: 0.70 },
      { cause: 'مشكلة في TCM', prob: 0.15 },
      { cause: 'أسلاك تالفة', prob: 0.15 }
    ],
    actions: [
      'اقرأ أكواد TCM بقارئ متقدم (Mode 22)',
      'افحص مستوى زيت الجير',
      'افحص الأسلاك',
      'راجع مختص ناقل الحركة'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 5000 },
    estimatedTime: 8,
    urgent: false
  },

  {
    id: 'INPUT_SPEED_SENSOR',
    priority: 'high',
    severity: 'high',
    systems: ['transmission'],
    codes: { required: ['P0715'] },
    title: 'دائرة حساس دخل الجير',
    titleEn: 'Input/Turbine Speed Sensor Circuit',
    symptoms: ['نقل غير سلس', 'تأخر في التبديل', 'Gear محدد'],
    causes: [
      { cause: 'حساس معطوب', prob: 0.65 },
      { cause: 'أسلاك مقطوعة', prob: 0.25 },
      { cause: 'مشكلة في TCM', prob: 0.10 }
    ],
    actions: [
      'افحص أسلاك الحساس',
      'استبدل الحساس'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 800 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'OUTPUT_SPEED_SENSOR',
    priority: 'high',
    severity: 'high',
    systems: ['transmission'],
    codes: { required: ['P0720'] },
    title: 'دائرة حساس خرج الجير',
    titleEn: 'Output Speed Sensor Circuit',
    symptoms: ['سرعة غير دقيقة', 'Gear محدد', 'لمبة ABS'],
    causes: [
      { cause: 'حساس معطوب', prob: 0.65 },
      { cause: 'أسلاك مقطوعة', prob: 0.25 },
      { cause: 'مشكلة في TCM', prob: 0.10 }
    ],
    actions: [
      'افحص الأسلاك',
      'استبدل الحساس'
    ],
    diyPossible: false,
    difficulty: 'medium',
    estimatedCost: { min: 100, max: 800 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'GEAR_RATIO',
    priority: 'critical',
    severity: 'critical',
    systems: ['transmission'],
    codes: { required: ['P0730'] },
    title: '🚨 نسبة التروس غير صحيحة — خطر',
    titleEn: 'Incorrect Gear Ratio',
    symptoms: ['Gear لا يبدّل', 'تسارع سيء', 'ضجيج من الجير'],
    causes: [
      { cause: 'زيت الجير منخفض', prob: 0.35 },
      { cause: 'حساس سرعة معطوب', prob: 0.25 },
      { cause: 'قابض تالف (داخلي)', prob: 0.25 },
      { cause: 'مشكلة هيدروليكية', prob: 0.15 }
    ],
    actions: [
      '🛑 توقف، لا تقس بقوة',
      'افحص مستوى زيت الجير',
      'افحص الحساسات',
      'راجع مختص فوري'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 500, max: 8000 },
    estimatedTime: 12,
    urgent: true
  },

  {
    id: 'TCC_PERFORMANCE',
    priority: 'high',
    severity: 'high',
    systems: ['transmission'],
    codes: { required: ['P0741'] },
    title: 'أداء TCC (قابض تحويل العزم) ضعيف',
    titleEn: 'Torque Converter Clutch Performance',
    symptoms: ['RPM يهتز على السرعات الثابتة', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'solenoid TCC معطوب', prob: 0.55 },
      { cause: 'زيت الجير متسخ', prob: 0.25 },
      { cause: 'قابض تالف', prob: 0.20 }
    ],
    actions: [
      'غيّر زيت الجير والفلتر',
      'افحص TCC solenoid',
      'راجع مختص إذا استمر'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 2500 },
    estimatedTime: 6,
    urgent: false
  },

  {
    id: 'SHIFT_SOLENOID_A',
    priority: 'high',
    severity: 'high',
    systems: ['transmission'],
    codes: { required: ['P0750'] },
    title: 'Solenoid A للتبديل معطوب',
    titleEn: 'Shift Solenoid A Malfunction',
    symptoms: ['Gear لا يبدّل بشكل صحيح', 'اهتزاز'],
    causes: [
      { cause: 'solenoid معطوب', prob: 0.70 },
      { cause: 'أسلاك تالفة', prob: 0.20 },
      { cause: 'مشكلة في TCM', prob: 0.10 }
    ],
    actions: [
      'افحص solenoid',
      'افحص الأسلاك',
      'استبدل solenoid'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 300, max: 1500 },
    estimatedTime: 5,
    urgent: false
  },

  {
    id: 'SHIFT_SOLENOID_B',
    priority: 'high',
    severity: 'high',
    systems: ['transmission'],
    codes: { required: ['P0755'] },
    title: 'Solenoid B للتبديل معطوب',
    titleEn: 'Shift Solenoid B Malfunction',
    symptoms: ['Gear لا يبدّل', 'تأخر التبديل'],
    causes: [
      { cause: 'solenoid معطوب', prob: 0.70 },
      { cause: 'أسلاك تالفة', prob: 0.20 },
      { cause: 'مشكلة في TCM', prob: 0.10 }
    ],
    actions: [
      'افحص solenoid B',
      'استبدل solenoid B'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 300, max: 1500 },
    estimatedTime: 5,
    urgent: false
  }
];

/* الجزء 2: C0xxx (الفرامل/ABS) + B0xxx (الهيكل/الوسائد) + U0xxx (الشبكة) */

export const RULES_PART_2 = [
  /* ============================================
     BRAKES/ABS — C0xxx (الفرامل)
     ============================================ */

  {
    id: 'ABS_FL_WHEEL_SENSOR',
    priority: 'high',
    severity: 'high',
    systems: ['abs', 'brakes'],
    codes: { required: ['C0035'] },
    title: 'دائرة حساس عجلة أمامية يسرى',
    titleEn: 'Left Front Wheel Speed Sensor Circuit',
    symptoms: ['لمبة ABS مضاءة', 'لمبة الفرامل مضاءة', 'ABS لا يعمل'],
    causes: [
      { cause: 'حساس العجلة معطوب', prob: 0.55 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'حلقة ABS متسخة أو تالفة', prob: 0.15 }
    ],
    actions: [
      'افحص الأسلاك',
      'افحص قابس الحساس',
      'نظّف حلقة ABS',
      'استبدل الحساس إن لزم'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 50, max: 400 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'ABS_FR_WHEEL_SENSOR',
    priority: 'high',
    severity: 'high',
    systems: ['abs', 'brakes'],
    codes: { required: ['C0040'] },
    title: 'دائرة حساس عجلة أمامية يمنى',
    titleEn: 'Right Front Wheel Speed Sensor Circuit',
    symptoms: ['لمبة ABS مضاءة', 'ABS لا يعمل'],
    causes: [
      { cause: 'حساس معطوب', prob: 0.55 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'حلقة ABS تالفة', prob: 0.15 }
    ],
    actions: [
      'افحص الأسلاك',
      'افحص الحساس',
      'استبدل إن لزم'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 50, max: 400 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'ABS_RL_WHEEL_SENSOR',
    priority: 'high',
    severity: 'high',
    systems: ['abs', 'brakes'],
    codes: { required: ['C0045'] },
    title: 'دائرة حساس عجلة خلفية يسرى',
    titleEn: 'Left Rear Wheel Speed Sensor Circuit',
    symptoms: ['لمبة ABS مضاءة'],
    causes: [
      { cause: 'حساس معطوب', prob: 0.55 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'حلقة ABS تالفة', prob: 0.15 }
    ],
    actions: [
      'افحص',
 الأسلاك',
      'اف     حص الحساس',
      'استبدل إن ل 'زم'
    ],
    diyPossible:است true,
    difficultyبد: 'medium',
    estimatedلCost: { min: 50, max: 400 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'ABS_RR_WHEEL_SENSOR',
    priority: 'high',
    severity: 'high',
    systems: ['abs', 'brakes'],
    codes: { required: ['C0050'] },
    title: 'دائرة حساس عجلة خلفية يمنى',
    titleEn: 'Right Rear Wheel Speed Sensor Circuit',
    symptoms: ['لمبة ABS مضاءة'],
    causes: [
      { cause: 'حساس معطوب', prob: 0.55 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'حلقة ABS تالفة', prob: 0.15 }
    ],
    actions: [
      'افحص الأسلاك',
      'افحص الحساس إن لزم'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 50, max: 400 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'ABS_PUMP_MOTOR',
    priority: 'critical',
    severity: 'critical',
    systems: ['abs', 'brakes'],
    codes: { required: ['C0110'], optional: ['C0121', 'C0128'] },
    title: '🚨 مضخة ABS لا تعمل — الفرامل قد لا تستجيب',
    titleEn: 'ABS Pump Motor Circuit',
    symptoms: ['لمبة ABS مضاءة', 'لمبة الفرامل مضاءة', 'الفرامل تعمل بشكل غير طبيعي'],
    causes: [
      { cause: 'مضخة ABS معطوبة', prob: 0.50 },
      { cause: 'فيوز محروق', prob: 0.25 },
      { cause: 'ريلاي معطوب', prob: 0.15 },
      { cause: 'أسلاك مقطوعة', prob: 0.10 }
    ],
    actions: [
      '🛑 تجنّب القيادة على سرعات عالية',
      'افحص الفيوز والريلاي',
      'افحص المضخة',
      'راجع مختص ABS'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 2500 },
    estimatedTime: 6,
    urgent: true
  },

  {
    id: 'BRAKE_FLUID_LOW',
    priority: 'critical',
    severity: 'critical',
    systems: ['brakes'],
    codes: { required: ['C0265'], optional: ['C0266'] },
    title: '🚨 مشكلة في نظام الفرامل — تحقق فوري',
    titleEn: 'Brake System Malfunction',
    symptoms: ['لمبة الفرامل مضاءة', 'دواسة الفرامل طرية', 'تسرب سائل'],
    causes: [
      { cause: 'تسرب سائل الفرامل', prob: 0.45 },
      { cause: 'مستوى سائل منخفض', prob: 0.30 },
      { cause: 'حساس مستوى معطوب', prob: 0.15 },
      { cause: 'مشكلة في master cylinder', prob: 0.10 }
    ],
    actions: [
      '🛑 أوقف السيارة فورًا',
      'افحص مستوى سائل الفرامل',
      'افحص تسرب حول العجلات',
      'راجع مختص فوري'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 2000 },
    estimatedTime: 4,
    urgent: true
  },

  {
    id: 'BRAKE_PAD_WEAR',
    priority: 'high',
    severity: 'high',
    systems: ['brakes'],
    codes: { required: ['C1234'], optional: ['C1235'] },
    title: 'تيل الفرامل بحاجة للاستبدال',
    titleEn: 'Brake Pad Wear Sensor',
    symptoms: ['صوت صرير عند الفرملة', 'لمبة الفرامل'],
    causes: [
      { cause: 'تيل الفرامل متهالك', prob: 0.85 },
      { cause: 'حساس التيل معطوب', prob: 0.15 }
    ],
    actions: [
      'استبدل تيل الفرامل',
      'افحص الأقراص',
      'افحص مستوى سائل الفرامل'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 50, max: 500 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'ABS_COMMUNICATION',
    priority: 'high',
    severity: 'high',
    systems: ['abs', 'electronics'],
    codes: { required: ['C0800'], optional: ['C0899'] },
    title: 'فقدان التواصل مع وحدة ABS',
    titleEn: 'ABS Module Communication',
    symptoms: ['لمبة ABS مضاءة', 'لمبة الفرامل'],
    causes: [
      { cause: 'فيوز ABS محروق', prob: 0.35 },
      { cause: 'أسلاك CAN مقطوعة', prob: 0.30 },
      { cause: 'وحدة ABS معطوبة', prob: 0.25 },
      { cause: 'أرضية سيئة', prob: 0.10 }
    ],
    actions: [
      'افحص الفيوزات',
      'افحص أسلاك CAN',
      'افحص الأرضية',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 2000 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'PARKING_BRAKE',
    priority: 'medium',
    severity: 'medium',
    systems: ['brakes'],
    codes: { required: ['C1940'], optional: ['C1941'] },
    title: 'مشكلة في فرامل اليد الإلكترونية',
    titleEn: 'Electronic Parking Brake Malfunction',
    symptoms: ['لمبة فرامل اليد مضاءة', 'فرامل اليد لا تعمل'],
    causes: [
      { cause: 'موتور فرامل اليد معطوب', prob: 0.50 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'مشكلة في الوحدة', prob: 0.20 }
    ],
    actions: [
      'افحص الموتور',
      'افحص الأسلاك',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 1500 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'BRAKE_BOOSTER',
    priority: 'high',
    severity: 'high',
    systems: ['brakes'],
    codes: { required: ['C0250'], optional: ['C0251'] },
    title: 'مشكلة في مساعد الفرامل (Booster)',
    titleEn: 'Brake Booster Vacuum',
    symptoms: ['دواسة الفرامل صلبة', 'قوة فرملة ضعيفة'],
    causes: [
      { cause: 'خرطوم فاكيوم مشقوق', prob: 0.45 },
      { cause: 'صمام check valve معطوب', prob: 0.35 },
      { cause: 'booster نفسه معطوب', prob: 0.20 }
    ],
    actions: [
      'افحص خرطوم الفاكيوم',
      'افحص check valve',
      'استبدل booster إذا لزم'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 800 },
    estimatedTime: 4,
    urgent: false
  },

  /* ============================================
     CHASSIS/BODY — B0xxx (الهيكل + الوسائد)
     ============================================ */

  {
    id: 'AIRBAG_DRIVER',
    priority: 'critical',
    severity: 'critical',
    systems: ['airbag'],
    codes: { required: ['B0001'], optional: ['B0002'] },
    title: '🚨 عطل في وسادة السائق الهوائية',
    titleEn: 'Driver Airbag Circuit',
    symptoms: ['لمبة الوسائد مضاءة', 'الوسادة لن تعمل في الحادث'],
    causes: [
      { cause: 'قابس الوسادة مفصول', prob: 0.40 },
      { cause: 'حلقة السلك (clock spring) تالفة', prob: 0.30 },
      { cause: 'أسلاك مقطوعة', prob: 0.20 },
      { cause: 'الوسادة معطوبة', prob: 0.10 }
    ],
    actions: [
      '🛑 الوسادة لن تعمل في الحادث',
      'افحص قابس الوسادة',
      'افحص clock spring',
      'راجع مختص فوري'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 2000 },
    estimatedTime: 4,
    urgent: true
  },

  {
    id: 'AIRBAG_PASSENGER',
    priority: 'critical',
    severity: 'critical',
    systems: ['airbag'],
    codes: { required: ['B0010'], optional: ['B0011'] },
    title: '🚨 عطل في وسادة الراكب',
    titleEn: 'Passenger Airbag Circuit',
    symptoms: ['لمبة الوسائد مضاءة', 'الوسادة لن تعمل'],
    causes: [
      { cause: 'قابس مفصول', prob: 0.45 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'الوسادة معطوبة', prob: 0.25 }
    ],
    actions: [
      'افحص القابس',
      'افحص الأسلاك',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 2000 },
    estimatedTime: 4,
    urgent: true
  },

  {
    id: 'AIRBAG_SIDE_DRIVER',
    priority: 'high',
    severity: 'high',
    systems: ['airbag'],
    codes: { required: ['B0020'], optional: ['B0021'] },
    title: 'عطل في وسادة السائق الجانبية',
    titleEn: 'Driver Side Airbag Circuit',
    symptoms: ['لمبة الوسائد مضاءة'],
    causes: [
      { cause: 'قابس مفصول', prob: 0.50 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'الوسادة معطوبة', prob: 0.20 }
    ],
    actions: [
      'افحص القابس',
      'افحص الأسلاك'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 1500 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'SEATBELT_PRETENSIONER',
    priority: 'high',
    severity: 'high',
    systems: ['airbag'],
    codes: { required: ['B0051'], optional: ['B0052'] },
    title: 'عطل في شدّاد الحزام',
    titleEn: 'Seatbelt Pretensioner',
    symptoms: ['لمبة الوسائد مضاءة', 'لمبة الحزام'],
    causes: [
      { cause: 'قابس مفصول', prob: 0.55 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'الشدّاد معطوب', prob: 0.15 }
    ],
    actions: [
      'افحص القابس',
      'افحص الأسلاك',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'medium',
    estimatedCost: { min: 100, max: 600 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'OCCUPANT_SENSOR',
    priority: 'medium',
    severity: 'medium',
    systems: ['airbag'],
    codes: { required: ['B0092'], optional: ['B0093'] },
    title: 'حساس وجود الراكب معطوب',
    titleEn: 'Occupant Classification Sensor',
    symptoms: ['لمبة الوسائد مضاءة', 'الوسادة الجانبية لا تعمل'],
    causes: [
      { cause: 'حساس الكرسي معطوب', prob: 0.60 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'مشكلة في الوحدة', prob: 0.10 }
    ],
    actions: [
      'افحص حساس الكرسي',
      'افحص الأسلاك',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 1500 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'AIRBAG_MODULE',
    priority: 'critical',
    severity: 'critical',
    systems: ['airbag', 'electronics'],
    codes: { required: ['B1000'], optional: ['B1001'] },
    title: '🚨 وحدة الوسائد الهوائية معطوبة',
    titleEn: 'Airbag Control Module',
    symptoms: ['لمبة الوسائد مضاءة', 'كل الوسائد لن تعمل'],
    causes: [
      { cause: 'وحدة SRS معطوبة', prob: 0.60 },
      { cause: 'مشكلة في التغذية', prob: 0.25 },
      { cause: 'مشكلة في الأرضية', prob: 0.15 }
    ],
    actions: [
      '🛑 الوسائد غير آمنة',
      'افحص تغذية الوحدة',
      'راجع مختص فوري'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 500, max: 3000 },
    estimatedTime: 6,
    urgent: true
  },

  {
    id: 'BODY_CONTROL_MODULE',
    priority: 'medium',
    severity: 'medium',
    systems: ['electronics'],
    codes: { required: ['B1004'], optional: ['B1005'] },
    title: 'مشكلة في وحدة BCM',
    titleEn: 'Body Control Module',
    symptoms: ['مشاكل كهربائية متعددة', 'أبواب لا تعمل', 'إضاءة غريبة'],
    causes: [
      { cause: 'BCM معطوب', prob: 0.50 },
      { cause: 'تغذية سيئة', prob: 0.30 },
      { cause: 'أسلاك مقطوعة', prob: 0.20 }
    ],
    actions: [
      'افحص الفيوزات',
      'افحص التغذية',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 300, max: 2000 },
    estimatedTime: 5,
    urgent: false
  },

  {
    id: 'POWER_WINDOW',
    priority: 'low',
    severity: 'low',
    systems: ['electronics'],
    codes: { required: ['B1301'], optional: ['B1302'] },
    title: 'مشكلة في نافذة كهربائية',
    titleEn: 'Power Window Malfunction',
    symptoms: ['نافذة لا تفتح أو تغلق'],
    causes: [
      { cause: 'موتور النافذة معطوب', prob: 0.55 },
      { cause: 'مفتاح معطوب', prob: 0.30 },
      { cause: 'أسلاك مقطوعة', prob: 0.15 }
    ],
    actions: [
      'افحص المفتاح',
      'افحص الموتور',
      'افحص الأسلاك'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 50, max: 400 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'CLIMATE_CONTROL',
    priority: 'low',
    severity: 'low',
    systems: ['electronics'],
    codes: { required: ['B1421'], optional: ['B1422'] },
    title: 'مشكلة في نظام التكييف',
    titleEn: 'Climate Control Malfunction',
    symptoms: ['تكييف لا يبرد', 'مدفأة لا تسخن'],
    causes: [
      { cause: 'compressor معطوب', prob: 0.40 },
      { cause: 'نقص فريون', prob: 0.35 },
      { cause: 'حساس حرارة معطوب', prob: 0.25 }
    ],
    actions: [
      'افحص ضغط الفريون',
      'افحص compressor',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 1500 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'IMMOBILIZER',
    priority: 'critical',
    severity: 'critical',
    systems: ['electronics', 'engine'],
    codes: { required: ['B1600'], optional: ['B1601'] },
    title: '🚨 مشكلة في مانع التشغيل — السيارة قد لا تشتغل',
    titleEn: 'Immobilizer Malfunction',
    symptoms: ['السيارة لا تشتغل', 'لمبة المفتاح مضاءة', 'المفتاح لا يُعترف به'],
    causes: [
      { cause: 'بطارية المفتاح فارغة', prob: 0.35 },
      { cause: 'هوائي المفتاح معطوب', prob: 0.30 },
      { cause: 'مشكلة في الوحدة', prob: 0.25 },
      { cause: 'المفتاح يحتاج برمجة', prob: 0.10 }
    ],
    actions: [
      'جرّب مفتاح احتياطي',
      'استبدل بطارية المفتاح',
      'أعد برمجة المفتاح',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 50, max: 1500 },
    estimatedTime: 3,
    urgent: true
  },

  /* ============================================
     NETWORK/ELECTRONICS — U0xxx (الشبكة)
     ============================================ */

  {
    id: 'LOST_ECU',
    priority: 'critical',
    severity: 'critical',
    systems: ['electronics', 'engine'],
    codes: { required: ['U0100'] },
    title: '🚨 فقدان الاتصال بـ ECU — السيارة قد لا تعمل',
    titleEn: 'Lost Communication With ECM/PCM',
    symptoms: ['السيارة لا تشتغل', 'لمبات كثيرة', 'أداء سيء جدًا'],
    causes: [
      { cause: 'أسلاك CAN مقطوعة', prob: 0.40 },
      { cause: 'فيوز ECU محروق', prob: 0.25 },
      { cause: 'ECU نفسه معطوب', prob: 0.20 },
      { cause: 'مشكلة في الأرضية', prob: 0.15 }
    ],
    actions: [
      '🛑 توقف فورًا، لا تقس',
      'افحص فيوز ECU',
      'افحص أسلاك CAN',
      'راجع مختص فوري'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 4000 },
    estimatedTime: 8,
    urgent: true
  },

  {
    id: 'LOST_TCM',
    priority: 'critical',
    severity: 'critical',
    systems: ['transmission', 'electronics'],
    codes: { required: ['U0101'] },
    title: '🚨 فقدان الاتصال بـ TCM (وحدة الجير)',
    titleEn: 'Lost Communication With TCM',
    symptoms: ['لمبة الجير', 'لمبة المحرك', 'نقل غير سلس'],
    causes: [
      { cause: 'أسلاك CAN مقطوعة', prob: 0.45 },
      { cause: 'فيوز TCM محروق', prob: 0.30 },
      { cause: 'TCM معطوب', prob: 0.25 }
    ],
    actions: [
      'افحص فيوز TCM',
      'افحص أسلاك CAN',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 3000 },
    estimatedTime: 6,
    urgent: true
  },

  {
    id: 'LOST_ABS',
    priority: 'high',
    severity: 'high',
    systems: ['abs', 'electronics'],
    codes: { required: ['U0121'] },
    title: 'فقدان الاتصال بوحدة ABS',
    titleEn: 'Lost Communication With ABS',
    symptoms: ['لمبة ABS مضاءة', 'لمبة الفرامل'],
    causes: [
      { cause: 'أسلاك CAN', prob: 0.40 },
      { cause: 'فيوز ABS', prob: 0.35 },
      { cause: 'وحدة ABS معطوبة', prob: 0.25 }
    ],
    actions: [
      'افحص فيوز ABS',
      'افحص أسلاك CAN',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 2000 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'LOST_BCM',
    priority: 'high',
    severity: 'high',
    systems: ['electronics'],
    codes: { required: ['U0140'] },
    title: 'فقدان الاتصال بـ BCM',
    titleEn: 'Lost Communication With BCM',
    symptoms: ['مشاكل كهربائية', 'إضاءة غريبة'],
    causes: [
      { cause: 'أسلاك CAN', prob: 0.40 },
      { cause: 'فيوز BCM', prob: 0.30 },
      { cause: 'BCM معطوب', prob: 0.30 }
    ],
    actions: [
      'افحص الفيوزات',
      'افحص أسلاك CAN',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 2000 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'LOST_INSTRUMENT',
    priority: 'high',
    severity: 'high',
    systems: ['electronics'],
    codes: { required: ['U0155'] },
    title: 'فقدان الاتصال بلوحة العدادات',
    titleEn: 'Lost Communication With Instrument Panel',
    symptoms: ['لوحة العدادات لا تعمل', 'عدادات مطفأة'],
    causes: [
      { cause: 'أسلاك CAN', prob: 0.45 },
      { cause: 'فيوز لوحة', prob: 0.30 },
      { cause: 'لوحة معطوبة', prob: 0.25 }
    ],
    actions: [
      'افحص الفيوز',
      'افحص الأسلاك',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 1500 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'LOST_IMMOBILIZER',
    priority: 'critical',
    severity: 'critical',
    systems: ['electronics', 'engine'],
    codes: { required: ['U0167'] },
    title: '🚨 فقدان الاتصال بمفتاح المنع',
    titleEn: 'Lost Communication With Immobilizer',
    symptoms: ['السيارة لا تشتغل', 'لمبة المفتاح'],
    causes: [
      { cause: 'أسلاك مقطوعة', prob: 0.45 },
      { cause: 'وحدة المانع معطوبة', prob: 0.30 },
      { cause: 'مشكلة في المفتاح', prob: 0.25 }
    ],
    actions: [
      '🛑 السيارة قد لا تشتغل',
      'جرّب مفتاح احتياطي',
      'افحص الأسلاك',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 2000 },
    estimatedTime: 5,
    urgent: true
  },

  {
    id: 'LOST_HVAC',
    priority: 'medium',
    severity: 'medium',
    systems: ['electronics'],
    codes: { required: ['U0164'] },
    title: 'فقدان الاتصال بوحدة التكييف',
    titleEn: 'Lost Communication With HVAC',
    symptoms: ['تكييف لا يعمل'],
    causes: [
      { cause: 'أسلاك CAN', prob: 0.50 },
      { cause: 'وحدة التكييف معطوبة', prob: 0.30 },
      { cause: 'فيوز', prob: 0.20 }
    ],
    actions: [
      'افحص الفيوز',
      'افحص الأسلاك'
    ],
    diyPossible: false,
    difficulty: 'medium',
    estimatedCost: { min: 100, max: 1000 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'CAN_BUS_OFF',
    priority: 'critical',
    severity: 'critical',
    systems: ['electronics', 'engine', 'transmission'],
    codes: { required: ['U0001'], optional: ['U0002'] },
    title: '🚨 CAN Bus معطل — خلل كهربائي شامل',
    titleEn: 'CAN Bus Off',
    symptoms: ['السيارة لا تعمل', 'كل اللمبات', 'الأداء صفر'],
    causes: [
      { cause: 'قصر في CAN', prob: 0.50 },
      { cause: 'مقاومة CAN تالفة', prob: 0.30 },
      { cause: 'وحدة تكسر CAN', prob: 0.20 }
    ],
    actions: [
      '🛑 لا تشغّل السيارة',
      'افحص مقاومة CAN (60 أوم)',
      'افحص الأسلاك',
      'راجع مختص فوري'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 300, max: 3000 },
    estimatedTime: 8,
    urgent: true
  },

  {
    id: 'CAN_LOW_SPEED',
    priority: 'high',
    severity: 'high',
    systems: ['electronics'],
    codes: { required: ['U0010'] },
    title: 'مشكلة في CAN الداخلي',
    titleEn: 'Low Speed CAN Communication',
    symptoms: ['مشاكل كهربائية متفرقة'],
    causes: [
      { cause: 'أسلاك CAN مقطوعة', prob: 0.55 },
      { cause: 'وحدة معطوبة', prob: 0.30 },
      { cause: 'أرضية سيئة', prob: 0.15 }
    ],
    actions: [
      'افحص الأسلاك',
      'افحص الأرضية',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 1500 },
    estimatedTime: 4,
    urgent: false
  }
];

/* دمج جميع القواعد في مصفوفة واحدة */
export const ALL_RULES = RULES.concat(RULES_PART_2);

/* ============================================
   RULES_PART_3: وقود + انبعاثات + قواعد عامة
   ============================================ */

export const RULES_PART_3 = [
  /* ============================================
     FUEL — (الوقود)
     ============================================ */

  {
    id: 'FUEL_PRESSURE_LOW',
    priority: 'high',
    severity: 'high',
    systems: ['fuel', 'engine'],
    codes: { required: ['P0087'] },
    title: 'ضغط الوقود منخفض',
    titleEn: 'Fuel Rail/System Pressure Too Low',
    symptoms: ['فقدان قدرة', 'اهتزاز', 'صعوبة تشغيل'],
    causes: [
      { cause: 'فلتر وقود مسدود', prob: 0.40 },
      { cause: 'مضخة وقود ضعيفة', prob: 0.35 },
      { cause: 'منظم ضغط معطوب', prob: 0.15 },
      { cause: 'تسرب في نظام الوقود', prob: 0.10 }
    ],
    actions: [
      'استبدل فلتر الوقود',
      'افحص ضغط المضخة',
      'افحص المنظم'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 50, max: 800 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'FUEL_PRESSURE_HIGH',
    priority: 'medium',
    severity: 'medium',
    systems: ['fuel', 'engine'],
    codes: { required: ['P0088'] },
    title: 'ضغط الوقود مرتفع',
    titleEn: 'Fuel Rail Pressure Too High',
    symptoms: ['دخان أسود', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'منظم ضغط معطوب', prob: 0.60 },
      { cause: 'خط رجوع مسدود', prob: 0.30 },
      { cause: 'مشكلة في المضخة', prob: 0.10 }
    ],
    actions: [
      'افحص المنظم',
      'افحص خط الرجوع',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'medium',
    estimatedCost: { min: 100, max: 600 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'INJECTOR_CIRCUIT',
    priority: 'high',
    severity: 'high',
    systems: ['fuel', 'engine'],
    codes: { required: ['P0200'], optional: ['P0201', 'P0202', 'P0203', 'P0204'] },
    title: 'دائرة حاقن معطوبة',
    titleEn: 'Injector Circuit Malfunction',
    symptoms: ['اهتزاز المحرك', 'فقدان قدرة', 'اشتعال متقطع'],
    causes: [
      { cause: 'حاقن معطوب', prob: 0.50 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'قابس مترهل', prob: 0.20 }
    ],
    actions: [
      'افحص مقاومة الحاقنات',
      'افحص الأسلاك',
      'استبدل الحاقن المعطوب'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 150, max: 1200 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'FUEL_PUMP_CIRCUIT',
    priority: 'high',
    severity: 'high',
    systems: ['fuel', 'electronics'],
    codes: { required: ['P0230'], optional: ['P0231', 'P0232'] },
    title: 'دائرة مضخة الوقود معطوبة',
    titleEn: 'Fuel Pump Primary Circuit',
    symptoms: ['السيارة لا تشتغل', 'تشتغل ثم تتوقف', 'أداء سيء'],
    causes: [
      { cause: 'ريلاي المضخة معطوب', prob: 0.40 },
      { cause: 'مضخة معطوبة', prob: 0.35 },
      { cause: 'أسلاك مقطوعة', prob: 0.25 }
    ],
    actions: [
      'افحص الريلاي',
      'افحص الفيوز',
      'افحص المضخة'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 50, max: 800 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'FUEL_LEVEL_SENSOR',
    priority: 'low',
    severity: 'low',
    systems: ['fuel'],
    codes: { required: ['P0460'], optional: ['P0461', 'P0462', 'P0463'] },
    title: 'حساس مستوى الوقود معطوب',
    titleEn: 'Fuel Level Sensor Circuit',
    symptoms: ['مؤشر الوقود غير دقيق', 'قراءة ثابتة'],
    causes: [
      { cause: 'حساس العوامة معطوب', prob: 0.65 },
      { cause: 'أسلاك مقطوعة', prob: 0.25 },
      { cause: 'مشكلة في لوحة العدادات', prob: 0.10 }
    ],
    actions: [
      'افحص العوامة',
      'افحص الأسلاك',
      'استبدل الحساس'
    ],
    diyPossible: false,
    difficulty: 'medium',
    estimatedCost: { min: 100, max: 500 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'EVAP_PURGE_VALVE',
    priority: 'medium',
    severity: 'medium',
    systems: ['exhaust', 'fuel'],
    codes: { required: ['P0443'], optional: ['P0444', 'P0445'] },
    title: 'صمام purge في EVAP معطوب',
    titleEn: 'EVAP Purge Control Valve Circuit',
    symptoms: ['لمبة المحرك', 'خمول غير مستقر أحيانًا'],
    causes: [
      { cause: 'صمام معطوب', prob: 0.55 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'قابس مترهل', prob: 0.15 }
    ],
    actions: [
      'افحص مقاومة الصمام',
      'افحص الأسلاك',
      'استبدل الصمام'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 30, max: 200 },
    estimatedTime: 1,
    urgent: false
  },

  {
    id: 'EVAP_VENT_VALVE',
    priority: 'medium',
    severity: 'medium',
    systems: ['exhaust'],
    codes: { required: ['P0446'], optional: ['P0447'] },
    title: 'صمام vent في EVAP معطوب',
    titleEn: 'EVAP Vent Control Valve',
    symptoms: ['لمبة المحرك', 'صعوبة في التزود بالوقود'],
    causes: [
      { cause: 'صمام معطوب', prob: 0.55 },
      { cause: 'أسلاك مقطوعة', prob: 0.25 },
      { cause: 'canister متسخ', prob: 0.20 }
    ],
    actions: [
      'افحص الصمام',
      'افحص canister'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 30, max: 300 },
    estimatedTime: 1,
    urgent: false
  },

  {
    id: 'EVAP_LEAK_DETECTION',
    priority: 'low',
    severity: 'low',
    systems: ['exhaust'],
    codes: { required: ['P0456'] },
    title: 'تسرب صغير جدًا في EVAP',
    titleEn: 'EVAP Very Small Leak',
    symptoms: ['لمبة المحرك', 'رائحة بنزين خفيفة جدًا'],
    causes: [
      { cause: 'غطاء الوقود غير محكم', prob: 0.60 },
      { cause: 'خرطوم مشقوق صغير', prob: 0.25 },
      { cause: 'حلقة غطاء تالفة', prob: 0.15 }
    ],
    actions: [
      'افحص غطاء الوقود',
      'استبدل الحلقة',
      'امسح الأخطاء وقُد 100 كم'
    ],
    diyPossible: true,
    difficulty: 'easy',
    estimatedCost: { min: 0, max: 100 },
    estimatedTime: 1,
    urgent: false
  },

  /* ============================================
     EMISSIONS/O2 — (الانبعاثات + O2)
     ============================================ */

  {
    id: 'O2_SENSOR_B1S1',
    priority: 'medium',
    severity: 'medium',
    systems: ['exhaust', 'fuel', 'engine'],
    codes: { required: ['P0130'], optional: ['P0131', 'P0132', 'P0133'] },
    title: 'حساس O2 أمامي B1S1 معطوب',
    titleEn: 'O2 Sensor Circuit Bank 1 Sensor 1',
    symptoms: ['صرف بنزين مرتفع', 'خمول غير مستقر', 'لمبة المحرك'],
    causes: [
      { cause: 'حساس O2 معطوب', prob: 0.65 },
      { cause: 'أسلاك مقطوعة', prob: 0.25 },
      { cause: 'تسرب هواء قبل الحساس', prob: 0.10 }
    ],
    actions: [
      'افحص الأسلاك',
      'استبدل الحساس',
      'تأكد من عدم وجود تسرب قبل الحساس'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 80, max: 400 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'O2_SENSOR_B1S2',
    priority: 'low',
    severity: 'low',
    systems: ['exhaust'],
    codes: { required: ['P0136'], optional: ['P0137', 'P0138'] },
    title: 'حساس O2 خلفي B1S2 معطوب',
    titleEn: 'O2 Sensor Circuit Bank 1 Sensor 2',
    symptoms: ['لمبة المحرك', 'احتمال فشل فحص الانبعاثات'],
    causes: [
      { cause: 'حساس معطوب', prob: 0.70 },
      { cause: 'أسلاك مقطوعة', prob: 0.25 },
      { cause: 'كتلايزر ضعيف أتلف الحساس', prob: 0.05 }
    ],
    actions: [
      'افحص الأسلاك',
      'استبدل الحساس',
      'افحص الكتلايزر'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 80, max: 400 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'O2_HEATER_B1S1',
    priority: 'medium',
    severity: 'medium',
    systems: ['exhaust'],
    codes: { required: ['P0135'] },
    title: 'سخّان حساس O2 B1S1 معطوب',
    titleEn: 'O2 Sensor Heater Circuit B1S1',
    symptoms: ['تأخر في الدخول لحلقة مغلقة', 'صرف بنزين مرتفع', 'لمبة المحرك'],
    causes: [
      { cause: 'سخّان داخلي معطوب', prob: 0.65 },
      { cause: 'أسلاك السخّان مقطوعة', prob: 0.30 },
      { cause: 'فيوز محروق', prob: 0.05 }
    ],
    actions: [
      'افحص مقاومة السخّان',
      'افحص الفيوز',
      'استبدل الحساس'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 80, max: 400 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'CATALYST_DAMAGE',
    priority: 'medium',
    severity: 'medium',
    systems: ['exhaust'],
    codes: { required: ['P0420'], optional: ['P0430', 'P0300'] },
    title: 'تلف الكتلايزر بسبب اشتعال متقطع',
    titleEn: 'Catalyst Damaged by Misfire',
    symptoms: ['لمبة المحرك', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'اشتعال متقطع أتلف الكتلايزر', prob: 0.55 },
      { cause: 'خليط غني أتلف الكتلايزر', prob: 0.25 },
      { cause: 'زيت يحترق في العادم', prob: 0.20 }
    ],
    actions: [
      'أصلح الاشتعال المتقطع أولًا',
      'افحص حساسات O2',
      'ثم استبدل الكتلايزر إذا لزم'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 300, max: 2500 },
    estimatedTime: 6,
    urgent: false
  },

  {
    id: 'EGR_VALVE_CIRCUIT',
    priority: 'medium',
    severity: 'medium',
    systems: ['exhaust', 'engine'],
    codes: { required: ['P0403'], optional: ['P0404', 'P0405'] },
    title: 'دائرة صمام EGR معطوبة',
    titleEn: 'EGR Valve Circuit',
    symptoms: ['لمبة المحرك', 'خمول غير مستقر', 'تقطيع'],
    causes: [
      { cause: 'صمام EGR معطوب', prob: 0.55 },
      { cause: 'أسلاك مقطوعة', prob: 0.30 },
      { cause: 'صمام متسخ', prob: 0.15 }
    ],
    actions: [
      'نظّف الصمام',
      'افحص الأسلاك',
      'استبدل الصمام إن لزم'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 0, max: 400 },
    estimatedTime: 2,
    urgent: false
  },

  {
    id: 'DPF_LOW',
    priority: 'high',
    severity: 'high',
    systems: ['exhaust', 'engine'],
    codes: { required: ['P2002'], optional: ['P2463', 'P2458'] },
    title: 'فلتر DPF مسدود أو ضعيف (ديزل)',
    titleEn: 'Diesel Particulate Filter Efficiency Below Threshold',
    symptoms: ['فقدان قدرة', 'دخان أسود', 'صرف وقود مرتفع'],
    causes: [
      { cause: 'تراكم سناج في DPF', prob: 0.55 },
      { cause: 'دورة تجديد (regeneration) لم تكتمل', prob: 0.30 },
      { cause: 'حساس ضغط DPF معطوب', prob: 0.15 }
    ],
    actions: [
      'قُد السيارة على طريق سريع 20 دقيقة (regeneration طبيعي)',
      'افحص حساس ضغط DPF',
      'في الحالات الشديدة: تنظيف DPF مخصص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 2500 },
    estimatedTime: 6,
    urgent: false
  },

  {
    id: 'DPF_SOOT',
    priority: 'high',
    severity: 'high',
    systems: ['exhaust', 'engine'],
    codes: { required: ['P2463'] },
    title: 'تراكم سناج في DPF (ديزل)',
    titleEn: 'Diesel Particulate Filter Soot Accumulation',
    symptoms: ['فقدان قدرة', 'دخان أسود', 'لمبة DPF'],
    causes: [
      { cause: 'قيادة قصيرة متكررة (مدينة)', prob: 0.60 },
      { cause: 'حاقن ديزل يسيل', prob: 0.25 },
      { cause: 'EGR معطل أثر على DPF', prob: 0.15 }
    ],
    actions: [
      'قُد 20-30 دقيقة على سرعة 80+ كم/س',
      'افحص الحاقنات',
      'افحص EGR'
    ],
    diyPossible: false,
    difficulty: 'medium',
    estimatedCost: { min: 0, max: 2000 },
    estimatedTime: 4,
    urgent: false
  },

  /* ============================================
     GENERAL — قواعد شاملة
     ============================================ */

  {
    id: 'MULTIPLE_MISFIRE_LEAN',
    priority: 'critical',
    severity: 'critical',
    systems: ['engine', 'fuel', 'exhaust'],
    codes: { required: ['P0300', 'P0171'] },
    title: '🚨 اشتعال متقطع + خليط فقير — مشكلة خطيرة',
    titleEn: 'Multiple Misfire + Lean Condition',
    symptoms: ['اهتزاز شديد', 'فقدان قدرة كبير', 'خطر على الكتلايزر'],
    causes: [
      { cause: 'تسرب هواء شديد + اشتعال متقطع', prob: 0.50 },
      { cause: 'مضخة وقود ضعيفة', prob: 0.30 },
      { cause: 'حاقنات مسدودة', prob: 0.20 }
    ],
    actions: [
      '🛑 لا تقس بقوة',
      'أصلح تسرب الهواء أولًا',
      'افحص ضغط الوقود',
      'افحص الإشعال'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 2000 },
    estimatedTime: 6,
    urgent: true
  },

  {
    id: 'ROUGH_IDLE_MULTIPLE',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'fuel'],
    codes: { required: ['P0300', 'P0505'] },
    title: 'خمول خشن + نظام الخمول',
    titleEn: 'Rough Idle + Idle Control',
    symptoms: ['اهتزاز شديد على الخمول', 'RPM يتأرجح'],
    causes: [
      { cause: 'IAC valve متسخ', prob: 0.45 },
      { cause: 'تسرب هواء', prob: 0.35 },
      { cause: 'بواجي وكويلات', prob: 0.20 }
    ],
    actions: [
      'نظّف IAC valve',
      'افحص تسرب الهواء',
      'افحص الإشعال'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 0, max: 600 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'CATALYST_FROM_MISFIRE',
    priority: 'high',
    severity: 'high',
    systems: ['engine', 'exhaust'],
    codes: { required: ['P0420'], optional: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'] },
    title: 'كتلايزر تالف بسبب اشتعال متقطع',
    titleEn: 'Catalyst Damaged By Misfire',
    symptoms: ['لمبة المحرك', 'رائحة كبريت', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'اشتعال متقطع أتلف الكتلايزر', prob: 0.85 },
      { cause: 'خليط غني طويل', prob: 0.15 }
    ],
    actions: [
      '🛑 أصلح الإشعال أولًا (وإلا سيتلف الكتلايزر الجديد)',
      'استبدل البواجي والكويلات',
      'ثم استبدل الكتلايزر'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 500, max: 3000 },
    estimatedTime: 8,
    urgent: false
  },

  {
    id: 'CHARGING_SYSTEM',
    priority: 'high',
    severity: 'high',
    systems: ['battery', 'electronics'],
    codes: { required: ['P0562'], optional: ['P0563', 'P2500'] },
    title: 'مشكلة في نظام الشحن',
    titleEn: 'System Voltage Low',
    symptoms: ['السيارة تشتغل بصعوبة', 'لمبات تخبو', 'بطارية تفرغ'],
    causes: [
      { cause: 'دينامو ضعيف', prob: 0.50 },
      { cause: 'بطارية متهالكة', prob: 0.30 },
      { cause: 'حزام الدينامو مرتخي', prob: 0.15 },
      { cause: 'أسلاك الشحن مقطوعة', prob: 0.05 }
    ],
    actions: [
      'افحص فولت البطارية',
      'افحص فولت الدينامو (يجب 13.8-14.8 فولت)',
      'افحص الحزام',
      'استبدل المعطوب'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 100, max: 1500 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'SENSOR_REFERENCE_VOLTAGE',
    priority: 'medium',
    severity: 'medium',
    systems: ['electronics', 'engine'],
    codes: { required: ['P0641'], optional: ['P0651'] },
    title: 'فولت مرجعي للحساسات منخفض',
    titleEn: 'Sensor Reference Voltage A Circuit',
    symptoms: ['عدة حساسات معطوبة في نفس الوقت', 'أداء سيء'],
    causes: [
      { cause: 'قصر في دائرة 5V', prob: 0.55 },
      { cause: 'ECU معطوب', prob: 0.30 },
      { cause: 'أسلاك مقطوعة', prob: 0.15 }
    ],
    actions: [
      'افحص فولت 5V على الحساسات',
      'افحص الأسلاك',
      'راجع مختص'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 2000 },
    estimatedTime: 5,
    urgent: false
  },

  {
    id: 'THROTTLE_ACTUATOR',
    priority: 'high',
    severity: 'high',
    systems: ['engine'],
    codes: { required: ['P2100'], optional: ['P2101', 'P2102', 'P2103'] },
    title: 'دائرة موتور الخانق الإلكتروني معطوبة',
    titleEn: 'Throttle Actuator Control Motor Circuit',
    symptoms: ['السيارة في وضع الطوارئ', 'لا تتسارع', 'لمبة EPC'],
    causes: [
      { cause: 'موتور الخانق معطوب', prob: 0.55 },
      { cause: 'أسلاك مقطوعة', prob: 0.25 },
      { cause: 'حساس TPS معطوب', prob: 0.20 }
    ],
    actions: [
      'افحص أسلاك الموتور',
      'نظّف جسم الخانق',
      'استبدل الوحدة إن لزم'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 200, max: 1500 },
    estimatedTime: 4,
    urgent: false
  },

  {
    id: 'VVT_MALFUNCTION',
    priority: 'medium',
    severity: 'medium',
    systems: ['engine'],
    codes: { required: ['P0010'], optional: ['P0011', 'P0012'] },
    title: 'مشكلة في نظام توقيت الصمامات VVT',
    titleEn: 'VVT System Malfunction',
    symptoms: ['خمول غير مستقر', 'ضعف تسارع', 'صرف بنزين مرتفع'],
    causes: [
      { cause: 'زيت متسخ أو مستوى منخفض', prob: 0.45 },
      { cause: 'solenoid VVT معطوب', prob: 0.35 },
      { cause: 'كام ميكانيكي معطوب', prob: 0.20 }
    ],
    actions: [
      'غيّر الزيت والفلتر',
      'افحص solenoid VVT',
      'افحص مستوى الزيت'
    ],
    diyPossible: true,
    difficulty: 'medium',
    estimatedCost: { min: 50, max: 800 },
    estimatedTime: 3,
    urgent: false
  },

  {
    id: 'CRANKSHAFT_CAMSHAFT_MISMATCH',
    priority: 'critical',
    severity: 'critical',
    systems: ['engine'],
    codes: { required: ['P0016'] },
    title: '🚨 عدم توافق بين الكرنك والكام — خطر على المحرك',
    titleEn: 'Crankshaft/Camshaft Position Correlation',
    symptoms: ['السيارة لا تشتغل', 'أو تشتغل بصعوبة', 'اهتزاز شديد'],
    causes: [
      { cause: 'حزام/سلسلة التوقيت متمددة', prob: 0.55 },
      { cause: 'حساس كرنك أو كام معطوب', prob: 0.30 },
      { cause: 'مشكلة في VVT', prob: 0.15 }
    ],
    actions: [
      '🛑 أوقف السيارة فورًا',
      'لا تشتغل حتى يتم الفحص',
      'افحص حزام/سلسلة التوقيت',
      'راجع مختص فوري'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 500, max: 5000 },
    estimatedTime: 12,
    urgent: true
  },

  {
    id: 'ECM_INTERNAL',
    priority: 'critical',
    severity: 'critical',
    systems: ['electronics', 'engine'],
    codes: { required: ['P0600'], optional: ['P0601', 'P0602', 'P0606'] },
    title: '🚨 عطل داخلي في وحدة المحرك',
    titleEn: 'ECM Internal Fault',
    symptoms: ['أداء غريب', 'لمبات كثيرة', 'السيارة قد لا تشتغل'],
    causes: [
      { cause: 'ECM معطوب', prob: 0.60 },
      { cause: 'مشكلة تغذية', prob: 0.25 },
      { cause: 'مشكلة أرضية', prob: 0.15 }
    ],
    actions: [
      'افحص التغذية والأرضية',
      'أعد برمجة ECM',
      'استبدل ECM إن لزم'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 500, max: 3000 },
    estimatedTime: 6,
    urgent: true
  },

  {
    id: 'LOW_FUEL_PRESSURE_DIESEL',
    priority: 'high',
    severity: 'high',
    systems: ['fuel', 'engine'],
    codes: { required: ['P1093'], optional: ['P0087'] },
    title: 'ضغط وقود منخفض (ديزل)',
    titleEn: 'Fuel Rail Pressure Low — Diesel',
    symptoms: ['فقدان قدرة', 'دخان أسود', 'السيارة تدخل وضع الطوارئ'],
    causes: [
      { cause: 'فلتر ديزل مسدود', prob: 0.45 },
      { cause: 'مضخة ديزل ضعيفة', prob: 0.30 },
      { cause: 'حاقن ديزل يسيل', prob: 0.25 }
    ],
    actions: [
      'استبدل فلتر الديزل',
      'افحص المضخة',
      'افحص الحاقنات'
    ],
    diyPossible: false,
    difficulty: 'hard',
    estimatedCost: { min: 100, max: 2000 },
    estimatedTime: 4,
    urgent: false
  }
];

/* ============================================
   دمج نهائي — كل القواعد
   ============================================ */

export const ALL_RULES = [
  ...RULES,
  ...RULES_PART_2,
  ...RULES_PART_3
];

/* فلترة حسب النظام */
export function getRulesBySystem(system){
  return ALL_RULES.filter(r => r.systems.includes(system));
}

/* فلترة حسب الأولوية */
export function getRulesByPriority(priority){
  return ALL_RULES.filter(r => r.priority === priority);
}

/* البحث بكود DTC */
export function findRulesByCode(code){
  code = String(code).toUpperCase().trim();
  return ALL_RULES.filter(r =>
    (r.codes.required && r.codes.required.includes(code)) ||
    (r.codes.optional && r.codes.optional.includes(code))
  );
}
