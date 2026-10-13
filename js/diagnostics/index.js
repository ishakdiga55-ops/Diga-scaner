/* ============================================
   CheckDiga Pro — Diagnostics Module
   نقطة الدخول الموحدة لمنظومة التشخيص
   ============================================
   
   يستورد كل الوحدات ويعيد تصديرها،
   ويوفر API بسيطة للاستخدام.
   ============================================ */

/* --- التصديرات الأساسية --- */
export {
  ALL_RULES,
  getRulesBySystem,
  getRulesByPriority,
  findRulesByCode
} from './rules.js';

export {
  DiagnosticEngine,
  SYSTEM_NAMES,
  analyzeCodes,
  analyzeWithLive,
  getSystemName
} from './engine.js';

export {
  SAFETY_RULES,
  SafetyChecker,
  checkSafety,
  hasStopWarnings,
  getSafetySummary
} from './safety.js';

export {
  FUSION_PATTERNS,
  FusionEngine,
  fuseLiveData,
  getLiveInsights
} from './fusion.js';

/* ============================================
   API موحدة — الاستخدام الرئيسي
   ============================================ */

import { DiagnosticEngine, SYSTEM_NAMES } from './engine.js';
import { SafetyChecker } from './safety.js';
import { FusionEngine } from './fusion.js';

/**
 * تحليل شامل لسيارة
 * @param {Object} input - المدخلات
 * @param {Array} input.codes - أكواد الأعطال
 * @param {Object} input.live - بيانات حية (اختياري)
 * @param {Object} input.vehicle - بيانات السيارة (اختياري)
 * @returns {Object} تقرير شامل
 */
export function diagnose(input = {}) {
  const codes = input.codes || [];
  const live = input.live || {};
  const vehicle = input.vehicle || {};

  // 1. التحليل الأساسي
  const analysis = DiagnosticEngine.analyze(codes);

  // 2. تحذيرات السلامة
  const safetyContext = {
    codes: codes.map(c => String(c).toUpperCase()),
    ...live
  };
  const safetyWarnings = SafetyChecker.check(safetyContext);
  const safetySummary = SafetyChecker.summarize(safetyWarnings);

  // 3. دمج البيانات الحية
  const fusion = (Object.keys(live).length > 0)
    ? FusionEngine.fuse(codes, live)
    : { patterns: [], insights: [], liveData: null };

  // 4. تجميع التقرير النهائي
  return {
    /* المدخلات */
    input: {
      codes,
      live,
      vehicle,
      timestamp: Date.now()
    },

    /* التحليل الأساسي */
    health: analysis.health,
    rootCause: analysis.rootCause,
    diagnoses: analysis.diagnoses,
    bySystem: analysis.bySystem,
    matchesCount: analysis.matchesCount,

    /* التكاليف والوقت */
    cost: analysis.cost,
    time: analysis.time,

    /* السلامة */
    safety: {
      warnings: safetyWarnings,
      summary: safetySummary,
      hasStop: safetySummary.status === 'stop',
      hasWarn: safetySummary.status === 'warn' || safetySummary.status === 'stop'
    },

    /* دمج البيانات الحية */
    fusion: {
      patterns: fusion.patterns,
      insights: fusion.insights,
      liveData: fusion.liveData
    },

    /* ملخص سريع */
    summary: {
      status: safetySummary.status,
      message: safetySummary.message,
      diagnosesCount: analysis.matchesCount,
      healthScore: analysis.health.score,
      healthLevel: analysis.health.level,
      totalCostMin: analysis.cost.min,
      totalCostMax: analysis.cost.max,
      totalTimeHours: analysis.time
    }
  };
}

/**
 * تشخيص سريع (بدون بيانات حية)
 */
export function quickDiagnose(codes) {
  return diagnose({ codes });
}

/**
 * تشخيص مع بيانات حية
 */
export function liveDiagnose(codes, live) {
  return diagnose({ codes, live });
}

/* ============================================
   معلومات النسخة
   ============================================ */

export const DIAGNOSTICS_VERSION = '1.0.0';

export const DIAGNOSTICS_INFO = {
  version: DIAGNOSTICS_VERSION,
  rulesCount: 90,
  safetyRulesCount: 15,
  fusionPatternsCount: 15,
  systemsSupported: Object.keys(SYSTEM_NAMES).length
};

/* ============================================
   تصدير افتراضي
   ============================================ */

export default {
  diagnose,
  quickDiagnose,
  liveDiagnose,
  DiagnosticEngine,
  SafetyChecker,
  FusionEngine,
  SYSTEM_NAMES,
  DIAGNOSTICS_VERSION,
  DIAGNOSTICS_INFO
};
