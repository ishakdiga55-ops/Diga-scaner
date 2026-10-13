/* ============================================
   CheckDiga Pro — Live Data Fusion
   دمج البيانات الحية مع الأكواد
   ============================================
   
   يدمج:
   - أكواد الأعطال (DTC)
   - المؤشرات الحية (RPM, Speed, Coolant, Fuel)
   - بيانات إضافية (VIN, Mileage)
   
   لتشخيص أدق وأذكى.
   ============================================ */

/* ============================================
   أنماط التشخيص الذكية
   ============================================ */

export const FUSION_PATTERNS = [
  /* --- تسرب الهواء --- */
  {
    id: 'FUSION_AIR_LEAK_IDLE',
    codes: ['P0171'],
    liveConditions: (live) => live.rpm != null && live.rpm < 800 && live.speed === 0,
    title: 'تسرب هواء على الخمول',
    titleEn: 'Vacuum Leak at Idle',
    analysis: 'الخليط فقير فقط على الخمول — يشير إلى تسرب هواء',
    confidence: 0.85,
    action: 'افحص خراطيم الفاكيوم على الخمول'
  },

  {
    id: 'FUSION_AIR_LEAK_LOAD',
    codes: ['P0171'],
    liveConditions: (live) => live.rpm != null && live.rpm > 2000,
    title: 'تسرب هواء تحت الحمل',
    titleEn: 'Vacuum Leak Under Load',
    analysis: 'الخليط فقير تحت الحمل — قد يكون مضخة وقود ضعيفة',
    confidence: 0.75,
    action: 'افحص ضغط مضخة الوقود'
  },

  /* --- حرارة المحرك --- */
  {
    id: 'FUSION_OVERHEAT_DRIVING',
    codes: ['P0217'],
    liveConditions: (live) => live.coolant != null && live.coolant > 105 && live.speed > 20,
    title: 'حرارة مرتفعة أثناء القيادة',
    titleEn: 'Overheating While Driving',
    analysis: 'الحرارة مرتفعة مع حركة — مشكلة في نظام التبريد',
    confidence: 0.95,
    action: '🛑 أوقف فورًا، افحص المراوح والرادياتير'
  },

  {
    id: 'FUSION_OVERHEAT_IDLE',
    codes: ['P0217'],
    liveConditions: (live) => live.coolant != null && live.coolant > 105 && live.speed < 5,
    title: 'حرارة مرتفعة على الخمول',
    titleEn: 'Overheating at Idle',
    analysis: 'الحرارة ترتفع فقط على الخمول — المراوح لا تعمل',
    confidence: 0.90,
    action: 'افحص المراوح الكهربائية'
  },

  /* --- اشتعال متقطع --- */
  {
    id: 'FUSION_MISFIRE_IDLE',
    codes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
    liveConditions: (live) => live.rpm != null && live.rpm < 900 && live.speed === 0,
    title: 'اشتعال متقطع على الخمول',
    titleEn: 'Misfire at Idle Only',
    analysis: 'الاشتعال يظهر فقط على الخمول — مشكلة في البواجي أو الحاقنات',
    confidence: 0.75,
    action: 'افحص البواجي والحاقنات'
  },

  {
    id: 'FUSION_MISFIRE_LOAD',
    codes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
    liveConditions: (live) => live.rpm != null && live.rpm > 2500,
    title: 'اشتعال متقطع تحت الحمل',
    titleEn: 'Misfire Under Load',
    analysis: 'الاشتعال يظهر تحت الحمل — مشكلة في الكويلات أو ضغط الوقود',
    confidence: 0.80,
    action: 'افحص الكويلات وضغط الوقود'
  },

  /* --- RPM شاذ --- */
  {
    id: 'FUSION_RPM_HIGH_IDLE',
    codes: [],
    liveConditions: (live) => live.rpm != null && live.rpm > 1500 && live.speed < 5,
    title: 'RPM مرتفع على الخمول',
    titleEn: 'High Idle RPM',
    analysis: 'RPM مرتفع دون ضغط على الدواسة',
    confidence: 0.85,
    action: 'افحص IAC valve أو تسرب هواء'
  },

  {
    id: 'FUSION_RPM_LOW',
    codes: [],
    liveConditions: (live) => live.rpm != null && live.rpm > 0 && live.rpm < 500,
    title: 'RPM منخفض جدًا',
    titleEn: 'Very Low RPM',
    analysis: 'السيارة على وشك التوقف',
    confidence: 0.90,
    action: 'افحص نظام الخمول والحاقنات'
  },

  /* --- مستوى الوقود --- */
  {
    id: 'FUSION_LOW_FUEL_LEAN',
    codes: ['P0171'],
    liveConditions: (live) => live.fuelLevel != null && live.fuelLevel < 15,
    title: 'خليط فقير + وقود منخفض',
    titleEn: 'Lean + Low Fuel',
    analysis: 'قد تكون مضخة الوقود تسحب هواء',
    confidence: 0.70,
    action: 'تزوّد بالوقود وأعد الفحص'
  },

  /* --- حرارة منخفضة --- */
  {
    id: 'FUSION_COLD_ENGINE',
    codes: ['P0171', 'P0128'],
    liveConditions: (live) => live.coolant != null && live.coolant < 60 && live.rpm > 1000,
    title: 'المحرك لا يسخن بشكل طبيعي',
    titleEn: 'Engine Not Warming Up',
    analysis: 'المحرك يبقى باردًا — ترموستات عاطل',
    confidence: 0.75,
    action: 'افحص الترموستات'
  },

  /* --- خمول غير مستقر --- */
  {
    id: 'FUSION_UNSTABLE_IDLE',
    codes: [],
    liveConditions: (live) => live.rpm != null && live.rpm > 0 && live.speed < 2,
    title: 'خمول غير مستقر',
    titleEn: 'Unstable Idle',
    analysis: 'تأرجح RPM على الخمول',
    confidence: 0.60,
    action: 'افحص IAC valve، تسرب الهواء، والبواجي'
  },

  /* --- بطارية ضعيفة --- */
  {
    id: 'FUSION_BATTERY_WEAK',
    codes: [],
    liveConditions: (live) => live.voltage != null && live.voltage < 12.0 && !live.engineRunning,
    title: 'البطارية ضعيفة',
    titleEn: 'Weak Battery',
    analysis: 'جهد البطارية منخفض قبل التشغيل',
    confidence: 0.85,
    action: 'اشحن البطارية أو استبدلها'
  },

  /* --- شحن غير كافٍ --- */
  {
    id: 'FUSION_CHARGING_LOW',
    codes: [],
    liveConditions: (live) => live.voltage != null && live.voltage > 12.0 && live.voltage < 13.0 && live.engineRunning,
    title: 'الشحن ضعيف',
    titleEn: 'Weak Charging',
    analysis: 'الدينامو يشحن لكن أقل من المطلوب',
    confidence: 0.80,
    action: 'افحص الدينامو والحزام'
  },

  /* --- شحن زائد --- */
  {
    id: 'FUSION_CHARGING_HIGH',
    codes: [],
    liveConditions: (live) => live.voltage != null && live.voltage > 15.0 && live.engineRunning,
    title: 'شحن زائد',
    titleEn: 'Overcharging',
    analysis: 'الدينامو يشحن أكثر من اللازم — خطر على البطارية',
    confidence: 0.85,
    action: 'افحص منظم الدينامو'
  }
];

/* ============================================
   محرك الدمج
   ============================================ */

export class FusionEngine {

  /* --- تطبيق الأنماط --- */
  static applyPatterns(codes, live) {
    const codesUpper = (codes || []).map(c => String(c).toUpperCase().trim());
    const matched = [];
    
    for (const pattern of FUSION_PATTERNS) {
      // تحقق من تطابق الأكواد
      const codeMatch = pattern.codes.length === 0 ||
        pattern.codes.some(c => codesUpper.includes(c));
      
      if (!codeMatch) continue;
      
      // تحقق من الشروط الحية
      try {
        if (pattern.liveConditions(live)) {
          matched.push({
            id: pattern.id,
            title: pattern.title,
            titleEn: pattern.titleEn,
            analysis: pattern.analysis,
            confidence: pattern.confidence,
            action: pattern.action,
            matchedCodes: pattern.codes.filter(c => codesUpper.includes(c)),
            source: 'fusion'
          });
        }
      } catch (e) {
        // تجاهل الأنماط المعطوبة
      }
    }
    
    // ترتيب حسب الثقة
    return matched.sort((a, b) => b.confidence - a.confidence);
  }

  /* --- استخراج الرؤى الحية --- */
  static extractLiveInsights(live) {
    const insights = [];
    
    // RPM
    if (live.rpm != null) {
      if (live.rpm === 0) {
        insights.push({
          metric: 'RPM',
          value: live.rpm,
          status: 'off',
          message: 'المحرك مطفأ'
        });
      } else if (live.rpm < 500) {
        insights.push({
          metric: 'RPM',
          value: live.rpm,
          status: 'warning',
          message: 'RPM منخفض جدًا — المحرك على وشك التوقف'
        });
      } else if (live.rpm > 7000) {
        insights.push({
          metric: 'RPM',
          value: live.rpm,
          status: 'danger',
          message: 'RPM في المنطقة الحمراء'
        });
      } else if (live.rpm >= 600 && live.rpm <= 1200 && live.speed < 2) {
        insights.push({
          metric: 'RPM',
          value: live.rpm,
          status: 'normal',
          message: 'خمول طبيعي'
        });
      }
    }
    
    // الحرارة
    if (live.coolant != null) {
      if (live.coolant < 60) {
        insights.push({
          metric: 'Coolant',
          value: live.coolant,
          status: 'cold',
          message: 'المحرك بارد — لا تقس بقوة'
        });
      } else if (live.coolant >= 60 && live.coolant <= 100) {
        insights.push({
          metric: 'Coolant',
          value: live.coolant,
          status: 'normal',
          message: 'حرارة المحرك طبيعية'
        });
      } else if (live.coolant > 100 && live.coolant <= 110) {
        insights.push({
          metric: 'Coolant',
          value: live.coolant,
          status: 'warning',
          message: 'الحرارة مرتفعة قليلًا'
        });
      } else if (live.coolant > 110) {
        insights.push({
          metric: 'Coolant',
          value: live.coolant,
          status: 'danger',
          message: '🚨 الحرارة حرجة!'
        });
      }
    }
    
    // السرعة
    if (live.speed != null) {
      if (live.speed === 0) {
        insights.push({
          metric: 'Speed',
          value: live.speed,
          status: 'stopped',
          message: 'السيارة متوقفة'
        });
      } else if (live.speed > 120) {
        insights.push({
          metric: 'Speed',
          value: live.speed,
          status: 'warning',
          message: 'سرعة عالية'
        });
      }
    }
    
    // الوقود
    if (live.fuelLevel != null) {
      if (live.fuelLevel < 10) {
        insights.push({
          metric: 'Fuel',
          value: live.fuelLevel,
          status: 'danger',
          message: '⛽ الوقود على وشك النفاد'
        });
      } else if (live.fuelLevel < 20) {
        insights.push({
          metric: 'Fuel',
          value: live.fuelLevel,
          status: 'warning',
          message: 'الوقود منخفض'
        });
      }
    }
    
    // الجهد
    if (live.voltage != null) {
      if (live.voltage < 12.0 && !live.engineRunning) {
        insights.push({
          metric: 'Voltage',
          value: live.voltage,
          status: 'warning',
          message: 'البطارية ضعيفة'
        });
      } else if (live.voltage > 15.0) {
        insights.push({
          metric: 'Voltage',
          value: live.voltage,
          status: 'danger',
          message: 'شحن زائد — قد يتلف البطارية'
        });
      }
    }
    
    return insights;
  }

  /* --- التحليل المدمج --- */
  static fuse(codes, live) {
    const patterns = this.applyPatterns(codes, live);
    const insights = this.extractLiveInsights(live);
    
    return {
      patterns,
      insights,
      liveData: {
        rpm: live.rpm,
        speed: live.speed,
        coolant: live.coolant,
        fuel: live.fuelLevel,
        voltage: live.voltage
      }
    };
  }
}

/* ============================================
   دوال مساعدة
   ============================================ */

export function fuseLiveData(codes, live) {
  return FusionEngine.fuse(codes, live);
}

export function getLiveInsights(live) {
  return FusionEngine.extractLiveInsights(live);
}
