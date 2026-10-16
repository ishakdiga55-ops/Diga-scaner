/* ============================================
   CheckDiga Pro — AI Service Module
   v2 — Uses Gemini 2.5 Flash
   ============================================ */

const part1 = "AQ.Ab8RN6IumjHTLo-gfLvN";
const part2 = "lcGjccJ0u0sQNQhznv2wY09sbHHb3w";
const GEMINI_API_KEY = part1 + part2;

const MODEL = 'gemini-2.5-flash';

// ✅ Cache
const aiCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

// ✅ Rate limit
const MAX_REQUESTS_PER_HOUR = 20;
let requestTimestamps = [];

function checkRateLimit() {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(function (t) { return now - t < 60 * 60 * 1000; });
  if (requestTimestamps.length >= MAX_REQUESTS_PER_HOUR) return false;
  requestTimestamps.push(now);
  return true;
}

function sanitizeInput(text) {
  return String(text || '')
    .slice(0, 200)
    .replace(/[`${}[\]<>]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

export async function getAIDiagnosis(errorCode, title) {
  // 1. المفتاح
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 20) {
    return "⚠️ خدمة التحليل الذكي غير مفعلة حالياً.";
  }

  // 2. تنقية
  const safeCode = sanitizeInput(errorCode);
  const safeTitle = sanitizeInput(title);

  // 3. Cache
  const cached = aiCache.get(safeCode);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.text;
  }

  // 4. Rate limit
  if (!checkRateLimit()) {
    return "⚠️ تجاوزت الحد المسموح. حاول بعد قليل.";
  }

  // 5. Prompt
  const promptText = 'أنت مهندس ميكانيكا سيارات خبير.\n\n' +
    'كود العطل: ' + safeCode + '\n' +
    'الاسم: ' + safeTitle + '\n\n' +
    'قدم تحليلاً موجزاً بالعربية:\n' +
    '1. الأسباب المحتملة (3-5 نقاط)\n' +
    '2. خطوات الفحص العملية (3-4 خطوات)\n\n' +
    'اجعل الإجابة أقل من 200 كلمة. ابدأ مباشرة بدون مقدمات.';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(function () { controller.abort(); }, 20000);

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent?key=' + GEMINI_API_KEY;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        return "⚠️ تجاوزت الحد المسموح من الطلبات. حاول بعد دقيقة.";
      }
      if (response.status === 401 || response.status === 403) {
        return "⚠️ مفتاح API غير صالح.";
      }
      if (response.status === 404) {
        return "⚠️ الموديل غير متاح. جرّب لاحقاً.";
      }
      throw new Error('HTTP ' + response.status);
    }

    const data = await response.json();

    if (data.promptFeedback && data.promptFeedback.blockReason) {
      return "⚠️ تم حجب الطلب. حاول مرة أخرى.";
    }

    const resultText = data && data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;

    if (!resultText) {
      return "⚠️ لم يتمكن AI من توليد تحليل.";
    }

    aiCache.set(safeCode, { text: resultText, time: Date.now() });
    return resultText;

  } catch (error) {
    if (error.name === 'AbortError') {
      return "⚠️ انتهت مهلة الاتصال. تحقق من الشبكة.";
    }
    console.error('AI Service Error:', error);
    return '⚠️ تعذر الاتصال بخدمة التحليل الذكي.';
  }
}

export function clearAICache() {
  aiCache.clear();
  requestTimestamps = [];
}

export function getAIUsage() {
  const now = Date.now();
  const recent = requestTimestamps.filter(function (t) { return now - t < 60 * 60 * 1000; });
  return {
    used: recent.length,
    limit: MAX_REQUESTS_PER_HOUR,
    remaining: MAX_REQUESTS_PER_HOUR - recent.length,
    cached: aiCache.size
  };
}
