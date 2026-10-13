/* ============================================
   CheckDiga Pro — Diagnostic Engine
   محرك التحليل والتشخيص
   ============================================
   
   يستورد قاعدة القواعد، يطابق الأكواد،
   ويرتب النتائج حسب الأولوية.
   ============================================ */

import { ALL_RULES } from './rules.js';

/* ============================================
   الأنظمة المدعومة
   ============================================ */

export const SYSTEM_NAMES = {
  engine: 'المحرك',
  transmission: 'ناقل الحركة',
  abs: 'ABS',
  brakes: 'الفرامل',
  airbag: 'الوسائد الهوائية',
  fuel: 'نظام الوقود',
  cooling: 'نظام التبريد',
  exhaust: 'العادم والانبعاثات',
  battery: 'البطارية والشحن',
  electronics: 'الكهرباء'
};

/* ============================================
   محرك التشخيص
   ============================================ */

export class DiagnosticEngine {

  /* --- تطابق قاعدة مع كود --- */
  static matchesRule(rule, codesSet) {
    const required = rule.codes?.required || [];
    for (const req of required) {
      if (!codesSet.has(req)) return false;
    }
    return true;
  }

  /* --- حساب درجة المطابقة --- */
  static scoreMatch(rule, codesSet) {
    const required = rule.codes?.required || [];
    const optional = rule.codes?.optional || [];
    
    let score = 0;
    required.forEach(c => { if (codesSet.has(c)) score += 10; });
    optional.forEach(c => { if (codesSet.has(c)) score += 3; });
    
    return score;
  }

  /* --- مطابقة قائمة أكواد مع القواعد --- */
  static matchRules(codes, options = {}) {
    if (!codes || !codes.length) return [];
    
    const codesSet = new Set(
      codes.map(c => String(c).toUpperCase().trim()).filter(Boolean)
    );
    
    const matches = [];
    
    for (const rule of ALL_RULES) {
      if (this.matchesRule(rule, codesSet)) {
        matches.push({
          rule,
          score: this.scoreMatch(rule, codesSet),
          matchedCodes: [
            ...(rule.codes?.required || []).filter(c => codesSet.has(c)),
            ...(rule.codes?.optional || []).filter(c => codesSet.has(c))
          ]
        });
      }
    }
    
    return matches;
  }

  /* --- حذف القواعد المتداخلة --- */
  static deduplicate(matches) {
    const sorted = [...matches].sort((a, b) => b.score - a.score);
    const result = [];
    const coveredCodes = new Set();
    
    for (const match of sorted) {
      const ruleCodes = new Set([
        ...(match.rule.codes?.required || []),
        ...(match.rule.codes?.optional || [])
      ]);
      
      const allCovered = [...ruleCodes].every(c => coveredCodes.has(c));
      
      if (!allCovered || result.length === 0) {
        result.push(match);
        ruleCodes.forEach(c => coveredCodes.add(c));
      }
    }
    
    return result;
  }

  /* --- ترتيب حسب الأولوية --- */
  static rank(matches) {
    const priorityOrder = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3
    };
    
    return [...matches].sort((a, b) => {
      const pa = priorityOrder[a.rule.priority] ?? 9;
      const pb = priorityOrder[b.rule.priority] ?? 9;
      if (pa !== pb) return pa - pb;
      return b.score - a.score;
    });
  }

  /* --- حساب صحة السيارة المتقدم --- */
  static calculateHealth(matches) {
    if (!matches || !matches.length) {
      return { score: 100, level: 'excellent' };
    }
    
    let penalty = 0;
    const seenRules = new Set();
    
    for (const m of matches) {
      if (seenRules.has(m.rule.id)) continue;
      seenRules.add(m.rule.id);
      
      const weights = {
        critical: 25,
        high: 15,
        medium: 8,
        low: 3
      };
      
      penalty += weights[m.rule.severity] || 5;
    }
    
    const score = Math.max(5, Math.min(100, 100 - penalty));
    
    let level = 'excellent';
    if (score < 30) level = 'critical';
    else if (score < 50) level = 'poor';
    else if (score < 70) level = 'fair';
    else if (score < 85) level = 'good';
    
    return { score, level };
  }

  /* --- توليد السبب الجذري --- */
  static findRootCause(matches) {
    if (!matches || !matches.length) return null;
    
    const bySystem = {};
    for (const m of matches) {
      for (const sys of (m.rule.systems || [])) {
        if (!bySystem[sys]) bySystem[sys] = [];
        bySystem[sys].push(m);
      }
    }
    
    let mainSystem = null;
    let mainCount = 0;
    
    for (const [sys, list] of Object.entries(bySystem)) {
      if (list.length > mainCount) {
        mainCount = list.length;
        mainSystem = sys;
      }
    }
    
    if (!mainSystem) return null;
    
    return {
      system: mainSystem,
      systemName: SYSTEM_NAMES[mainSystem] || mainSystem,
      relatedCount: mainCount,
      relatedRules: bySystem[mainSystem].map(m => m.rule.title)
    };
  }

  /* --- استخراج التحذيرات الحرجة --- */
  static findCriticalWarnings(matches) {
    return matches
      .filter(m => m.rule.urgent === true)
      .map(m => ({
        id: m.rule.id,
        title: m.rule.title,
        severity: m.rule.severity,
        message: m.rule.symptoms?.[0] || 'يتطلب فحصًا فوريًا',
        action: m.rule.actions?.[0] || 'راجع مختص'
      }));
  }

  /* --- حساب التكلفة الإجمالية --- */
  static estimateTotalCost(matches) {
    let min = 0;
    let max = 0;
    const seen = new Set();
    
    for (const m of matches) {
      if (seen.has(m.rule.id)) continue;
      seen.add(m.rule.id);
      
      const cost = m.rule.estimatedCost;
      if (cost) {
        min += cost.min || 0;
        max += cost.max || 0;
      }
    }
    
    return { min, max, currency: 'USD' };
  }

  /* --- حساب الوقت الإجمالي --- */
  static estimateTotalTime(matches) {
    let total = 0;
    const seen = new Set();
    
    for (const m of matches) {
      if (seen.has(m.rule.id)) continue;
      seen.add(m.rule.id);
      total += m.rule.estimatedTime || 0;
    }
    
    return total;
  }

  /* --- التجميع حسب النظام --- */
  static groupBySystem(matches) {
    const groups = {};
    
    for (const m of matches) {
      for (const sys of (m.rule.systems || [])) {
        if (!groups[sys]) {
          groups[sys] = {
            name: SYSTEM_NAMES[sys] || sys,
            matches: []
          };
        }
        groups[sys].matches.push(m);
      }
    }
    
    return groups;
  }

  /* --- التحليل الرئيسي --- */
  static analyze(codes, options = {}) {
    const rawMatches = this.matchRules(codes);
    const deduped = this.deduplicate(rawMatches);
    const ranked = this.rank(deduped);
    
    const health = this.calculateHealth(ranked);
    const rootCause = this.findRootCause(ranked);
    const warnings = this.findCriticalWarnings(ranked);
    const cost = this.estimateTotalCost(ranked);
    const time = this.estimateTotalTime(ranked);
    const groups = this.groupBySystem(ranked);
    
    return {
      codes: codes.length,
      matchesCount: ranked.length,
      health,
      rootCause,
      warnings,
      cost,
      time,
      bySystem: groups,
      diagnoses: ranked.map(m => ({
        id: m.rule.id,
        title: m.rule.title,
        titleEn: m.rule.titleEn,
        priority: m.rule.priority,
        severity: m.rule.severity,
        systems: m.rule.systems,
        symptoms: m.rule.symptoms,
        causes: m.rule.causes,
        actions: m.rule.actions,
        diyPossible: m.rule.diyPossible,
        difficulty: m.rule.difficulty,
        estimatedCost: m.rule.estimatedCost,
        estimatedTime: m.rule.estimatedTime,
        urgent: m.rule.urgent,
        matchedCodes: m.matchedCodes,
        score: m.score
      }))
    };
  }

  /* --- تحليل مع بيانات حية --- */
  static analyzeWithLive(codes, live = {}, options = {}) {
    const base = this.analyze(codes, options);
    
    const liveWarnings = [];
    
    if (live.coolant != null && live.coolant > 105) {
      liveWarnings.push({
        id: 'LIVE_OVERHEAT',
        severity: 'critical',
        message: `🌡️ حرارة المحرك ${live.coolant}°C — خطر!`,
        action: 'أوقف السيارة فورًا'
      });
    }
    
    if (live.rpm != null && live.rpm > 7000) {
      liveWarnings.push({
        id: 'LIVE_HIGH_RPM',
        severity: 'high',
        message: `⚠️ RPM مرتفع جدًا (${live.rpm})`,
        action: 'خفّف الضغط على المحرك'
      });
    }
    
    if (live.fuelLevel != null && live.fuelLevel < 10) {
      liveWarnings.push({
        id: 'LIVE_LOW_FUEL',
        severity: 'medium',
        message: `⛽ مستوى الوقود منخفض (${live.fuelLevel}%)`,
        action: 'تزوّد بالوقود قريبًا'
      });
    }
    
    base.liveWarnings = liveWarnings;
    base.warnings = [...base.warnings, ...liveWarnings];
    
    return base;
  }
}

/* ============================================
   دوال مساعدة
   ============================================ */

export function analyzeCodes(codes) {
  return DiagnosticEngine.analyze(codes);
}

export function analyzeWithLive(codes, live) {
  return DiagnosticEngine.analyzeWithLive(codes, live);
}

export function getSystemName(systemId) {
  return SYSTEM_NAMES[systemId] || systemId;
}
