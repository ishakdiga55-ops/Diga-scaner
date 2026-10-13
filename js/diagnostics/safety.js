/* ============================================
   CheckDiga Pro — Safety Warnings System
   نظام تحذيرات السلامة
   ============================================
   
   يكشف الحالات الخطيرة التي تتطلب
   إيقاف السيارة فورًا.
   ============================================ */

/* ============================================
   قواعد السلامة الحرجة
   ============================================ */

export const SAFETY_RULES = [
  /* --- حرارة المحرك --- */
  {
    id: 'SAFETY_OVERHEAT',
    level: 'STOP',
    severity: 'critical',
    icon: '🌡️',
    title: 'حرارة المحرك حرجة',
    titleEn: 'Engine Overheating',
    trigger: (ctx) => ctx.coolant != null && ctx.coolant > 110,
    message: (ctx) => `🌡️ حرارة المحرك ${ctx.coolant}°C — خطر تلف المحرك`,
    action: 'أوقف السيارة فورًا وانتظر 30 دقيقة قبل الفحص',
    reason: 'الحرارة العالية تُسبب تمدد المعادن وتلف حشوة الرأس'
  },

  {
    id: 'SAFETY_OVERHEAT_WARN',
    level: 'WARN',
    severity: 'high',
    icon: '🔥',
    title: 'حرارة المحرك مرتفعة',
    titleEn: 'Engine Temperature High',
    trigger: (ctx) => ctx.coolant != null && ctx.coolant > 100 && ctx.coolant <= 110,
    message: (ctx) => `🔥 حرارة المحرك ${ctx.coolant}°C — أعلى من الطبيعي`,
    action: 'توقف عند أول فرصة، افحص سائل التبريد',
    reason: 'قد ترتفع الحرارة أكثر مع الاستمرار'
  },

  /* --- ضغط الزيت --- */
  {
    id: 'SAFETY_OIL_PRESSURE',
    level: 'STOP',
    severity: 'critical',
    icon: '🛢️',
    title: 'ضغط الزيت منخفض',
    titleEn: 'Low Oil Pressure',
    trigger: (ctx) => ctx.codes && ctx.codes.includes('P0524'),
    message: () => '🛢️ ضغط زيت المحرك منخفض — خطر تلف فوري',
    action: 'أوقف المحرك فورًا، افحص مستوى الزيت',
    reason: 'بدون تزييت كافٍ، المحرك يتلف خلال دقائق'
  },

  /* --- RPM عالي جدًا --- */
  {
    id: 'SAFETY_HIGH_RPM',
    level: 'STOP',
    severity: 'critical',
    icon: '⚡',
    title: 'RPM حرج',
    titleEn: 'Critical RPM',
    trigger: (ctx) => ctx.rpm != null && ctx.rpm > 7000,
    message: (ctx) => `⚡ RPM مرتفع جدًا (${ctx.rpm}) — خطر تلف المحرك`,
    action: 'خفّف الضغط فورًا',
    reason: 'RPM عالي جدًا يُسبب تلف الصمامات'
  },

  {
    id: 'SAFETY_REDLINE',
    level: 'WARN',
    severity: 'high',
    icon: '⚠️',
    title: 'RPM مرتفع',
    titleEn: 'High RPM',
    trigger: (ctx) => ctx.rpm != null && ctx.rpm > 5500 && ctx.rpm <= 7000,
    message: (ctx) => `⚠️ RPM مرتفع (${ctx.rpm})`,
    action: 'غيّر الترس لتقليل RPM',
    reason: 'الاستمرار يستهلك الوقود ويُتعب المحرك'
  },

  /* --- الفرامل --- */
  {
    id: 'SAFETY_BRAKE_FAILURE',
    level: 'STOP',
    severity: 'critical',
    icon: '🛑',
    title: 'خلل في الفرامل',
    titleEn: 'Brake System Failure',
    trigger: (ctx) => ctx.codes && (
      ctx.codes.includes('C0265') ||
      ctx.codes.includes('C0110') ||
      ctx.codes.includes('C0800')
    ),
    message: () => '🛑 مشكلة في نظام الفرامل — قد لا تستجيب',
    action: 'أوقف السيارة، استخدم فرامل اليد بحذر',
    reason: 'الفرامل المعطوبة خطر على الحياة'
  },

  /* --- الوسائد الهوائية --- */
  {
    id: 'SAFETY_AIRBAG',
    level: 'WARN',
    severity: 'high',
    icon: '💥',
    title: 'عطل في الوسائد الهوائية',
    titleEn: 'Airbag Malfunction',
    trigger: (ctx) => ctx.codes && (
      ctx.codes.includes('B0001') ||
      ctx.codes.includes('B0010') ||
      ctx.codes.includes('B1000')
    ),
    message: () => '💥 الوسائد الهوائية لن تعمل في حالة الحادث',
    action: 'اقصد مختص بأسرع وقت',
    reason: 'السلامة الشخصية في خطر'
  },

  /* --- البطارية --- */
  {
    id: 'SAFETY_BATTERY_LOW',
    level: 'WARN',
    severity: 'medium',
    icon: '🔋',
    title: 'جهد البطارية منخفض',
    titleEn: 'Low Battery Voltage',
    trigger: (ctx) => ctx.voltage != null && ctx.voltage < 11.5,
    message: (ctx) => `🔋 جهد البطارية ${ctx.voltage}V — منخفض`,
    action: 'شحن البطارية أو استبدالها',
    reason: 'قد لا تشتغل السيارة في المرة القادمة'
  },

  {
    id: 'SAFETY_CHARGING_FAIL',
    level: 'WARN',
    severity: 'high',
    icon: '⚡',
    title: 'الدينامو لا يشحن',
    titleEn: 'Alternator Not Charging',
    trigger: (ctx) => ctx.voltage != null && ctx.voltage < 13.0 && ctx.engineRunning === true,
    message: (ctx) => `⚡ الدينامو لا يشحن (${ctx.voltage}V)`,
    action: 'افحص الدينامو والحزام',
    reason: 'البطارية ستفرغ قريبًا'
  },

  /* --- RPM صفر مع سرعة --- */
  {
    id: 'SAFETY_RPM_ZERO',
    level: 'STOP',
    severity: 'critical',
    icon: '🔴',
    title: 'المحرك متوقف أثناء الحركة',
    titleEn: 'Engine Stalled While Moving',
    trigger: (ctx) => ctx.rpm === 0 && ctx.speed != null && ctx.speed > 5,
    message: () => '🔴 المحرك متوقف بينما السيارة تتحرك',
    action: 'أوقف السيارة بأمان على الجانب',
    reason: 'فقدان القدرة على التوجيه والفرامل المُعززة'
  },

  /* --- كود U0100 (فقدان ECU) --- */
  {
    id: 'SAFETY_ECU_LOST',
    level: 'STOP',
    severity: 'critical',
    icon: '🚨',
    title: 'فقدان الاتصال بـ ECU',
    titleEn: 'ECU Communication Lost',
    trigger: (ctx) => ctx.codes && ctx.codes.includes('U0100'),
    message: () => '🚨 فقدان الاتصال بوحدة المحرك',
    action: 'أوقف السيارة فورًا، افحص الفيوزات',
    reason: 'ECU يتحكم في كل شيء — سيارة لا يمكن الاعتماد عليها'
  },

  /* --- CAN Bus --- */
  {
    id: 'SAFETY_CAN_BUS',
    level: 'STOP',
    severity: 'critical',
    icon: '🔌',
    title: 'CAN Bus معطل',
    titleEn: 'CAN Bus Off',
    trigger: (ctx) => ctx.codes && (
      ctx.codes.includes('U0001') ||
      ctx.codes.includes('U0002')
    ),
    message: () => '🔌 شبكة CAN معطلة — خلل شامل',
    action: 'أوقف السيارة، استدعِ مساعدة',
    reason: 'جميع الوحدات الإلكترونية قد لا تتواصل'
  },

  /* --- اشتعال متقطع + خليط فقير --- */
  {
    id: 'SAFETY_MISFIRE_LEAN',
    level: 'WARN',
    severity: 'high',
    icon: '⚠️',
    title: 'اشتعال متقطع + خليط فقير',
    titleEn: 'Misfire + Lean Condition',
    trigger: (ctx) => ctx.codes &&
      ctx.codes.includes('P0300') &&
      ctx.codes.includes('P0171'),
    message: () => '⚠️ اشتعال متقطع مع خليط فقير — قد يتلف الكتلايزر',
    action: 'توقف عن القيادة، افحص فورًا',
    reason: 'الوقود غير المحترق يُتلف الكتلايزر (تكلفة عالية)'
  },

  /* --- حزام التوقيت --- */
  {
    id: 'SAFETY_TIMING',
    level: 'STOP',
    severity: 'critical',
    icon: '⏱️',
    title: 'خلل في توقيت المحرك',
    titleEn: 'Timing Mismatch',
    trigger: (ctx) => ctx.codes && ctx.codes.includes('P0016'),
    message: () => '⏱️ عدم توافق بين الكرنك والكام — خطر تلف المحرك',
    action: 'أوقف السيارة، لا تشتغل حتى الفحص',
    reason: 'قد تنكسر الصمامات أو يتلف المحرك'
  },

  /* --- نسبة التروس --- */
  {
    id: 'SAFETY_GEAR_RATIO',
    level: 'WARN',
    severity: 'high',
    icon: '⚙️',
    title: 'خلل في ناقل الحركة',
    titleEn: 'Transmission Gear Ratio',
    trigger: (ctx) => ctx.codes && ctx.codes.includes('P0730'),
    message: () => '⚙️ نسبة التروس غير صحيحة — خطر تلف الجير',
    action: 'خفّف الضغط على الجير، راجع مختص',
    reason: 'الاستمرار يُسبب تلف داخلي مكلف'
  }
];

/* ============================================
   محرك التحذيرات
   ============================================ */

export class SafetyChecker {

  /* --- التحقق من جميع قواعد السلامة --- */
  static check(context = {}) {
    const warnings = [];
    
    for (const rule of SAFETY_RULES) {
      try {
        if (rule.trigger(context)) {
          warnings.push({
            id: rule.id,
            level: rule.level,
            severity: rule.severity,
            icon: rule.icon,
            title: rule.title,
            titleEn: rule.titleEn,
            message: typeof rule.message === 'function' 
              ? rule.message(context) 
              : rule.message,
            action: rule.action,
            reason: rule.reason
          });
        }
      } catch (e) {
        // تجاهل قواعد معطوبة
      }
    }
    
    // ترتيب حسب الخطورة
    return this.sortBySeverity(warnings);
  }

  /* --- ترتيب حسب الخطورة --- */
  static sortBySeverity(warnings) {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...warnings].sort((a, b) => {
      return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
    });
  }

  /* --- هل توجد تحذيرات STOP؟ --- */
  static hasStopWarnings(context = {}) {
    const warnings = this.check(context);
    return warnings.some(w => w.level === 'STOP');
  }

  /* --- استخراج تحذيرات STOP فقط --- */
  static getStopWarnings(context = {}) {
    return this.check(context).filter(w => w.level === 'STOP');
  }

  /* --- استخراج تحذيرات WARN فقط --- */
  static getWarnWarnings(context = {}) {
    return this.check(context).filter(w => w.level === 'WARN');
  }

  /* --- ملخص التحذيرات --- */
  static summarize(warnings) {
    if (!warnings || !warnings.length) {
      return {
        status: 'safe',
        message: '✅ لا توجد تحذيرات حرجة',
        count: 0
      };
    }
    
    const stopCount = warnings.filter(w => w.level === 'STOP').length;
    const warnCount = warnings.filter(w => w.level === 'WARN').length;
    
    if (stopCount > 0) {
      return {
        status: 'stop',
        message: `🛑 ${stopCount} تحذير حرج — توقف فورًا`,
        count: warnings.length,
        stopCount,
        warnCount
      };
    }
    
    return {
      status: 'warn',
      message: `⚠️ ${warnCount} تحذير — انتبه`,
      count: warnings.length,
      stopCount,
      warnCount
    };
  }
}

/* ============================================
   دوال مساعدة
   ============================================ */

export function checkSafety(context) {
  return SafetyChecker.check(context);
}

export function hasStopWarnings(context) {
  return SafetyChecker.hasStopWarnings(context);
}

export function getSafetySummary(context) {
  const warnings = SafetyChecker.check(context);
  return {
    warnings,
    summary: SafetyChecker.summarize(warnings)
  };
}
