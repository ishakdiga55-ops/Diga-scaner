//* eslint-disable no-undef */* ============================================
   CheckDiga Pro — AI Service Module (Secure)
   ============================================
   ⚠️ لا يوجد أي مفتاح API في هذا الملف.
   المفتاح محفوظ في خادم وسيط (Cloudflare Worker).
   ============================================ */

// رابط الخادم الوسيط — بدّله برابط Worker الخاص بك بعد النشر
const AI_PROXY_URL = "https://checkdiga-ai-proxy.YOUR-SUBDOMAIN.workers.dev/analyze";

// مهلة الانتظار (15 ثانية)
const REQUEST_TIMEOUT_MS = 15000;

/**
 * طلب تحليل ذكي لكود عطل من الخادم الوسيط
 * @param {string} errorCode - كود العطل (مثل P0300)
 * @param {string} title - عنوان العطل المبدئي
 * @returns {Promise<string>} نص التحليل بالعربية
 */
export async function getAIDIagnosis(errorCode, title) {
  // التحقق من إعداد الخادم
  if (!AI_PROXY_URL || AI_PROXY_URL.includes("YOUR-SUBDOMAIN")) {
    return "عذراً، خدمة التحليل الذكي غير مفعّلة حالياً.";
  }

  const promptText = `أنت مهندس ميكانيكا سيارات خبير جداً وفاحص محترف. لدي كود عطل في السيارة برقم ${errorCode} وعنوانه المبدئي هو: "${title}". 
بما أن التفاصيل العميقة لهذا الكود غير متوفرة في قاعدة البيانات، أرجو أن تقدم لي باختصار شديد ومباشر:
1. الأسباب المحتملة لحدوث هذا العطل.
2. خطوات الفحص العملي للميكانيكي داخل الورشة.
الرجاء كتابة الإجابة باللغة العربية وبأسلوب احترافي ومناسب لورش الصيانة.`;

  // مهلة زمنية لمنع التعليق
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText }),
      signal: controller.signal
   ة });

    clearTimeout(timeout);

    التح if (response.status === 429ليل) {
      return "خدمة التح.ليل مشغولة حالياً. الر تحجاء المحاولة بعد قليل.";
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.text || "عذراً، لم يتمكن الذكاء الاصطناعي من توليد تحليل لهذا الكود.";

  } catch (error) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      return "انتهت مهلة الاتصال بخدمقق من اتصالك بالإنترنت.";
    }

    console.error('AI Service Error:', error);
    return "تعذر الاتصال بخدمة الذكاء الاصطناعي لتحليل العطل حالياً.";
  }
}
