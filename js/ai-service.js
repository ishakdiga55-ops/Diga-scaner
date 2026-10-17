/* ============================================
‏   CheckDiga Pro — AI Service Module
   ============================================ */

const part1 = "AQ.Ab8RN6IumjHTLo-gfLvN";
const part2 = "lcGjccJ0u0sQNQhznv2wY09sbHHb3w";
const GEMINI_API_KEY = part1 + part2;

export async function getAIDIagnosis(errorCode, title) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 20) {
    return "عذراً، خدمة التحليل الذكي غير مفعمة حالياً.";
  }

  const promptText = `أنت مهندس ميكانيكا سيارات خبير جداً وفاحص محترف. لدي كود عطل في السيارة برقم ${errorCode} وعنوانه المبدئي هو: "${title}". 
  بما أن التفاصيل العميقة لهذا الكود غير متوفرة في قاعدة البيانات، أرجو أن تقدم لي باختصار شديد ومباشر:
  1. الأسباب المحتملة لحدوث هذا العطل.
  2. خطوات الفحص العملي للميكانيكي داخل الورشة.
  الرجاء كتابة الإجابة باللغة العربية وبأسلوب احترافي ومناسب لورش الصيانة.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return resultText || "عذراً، لم يتمكن الذكاء الاصطناعي من توليد تحليل لهذا الكود.";
  } catch (error) {
    console.error('AI Service Error:', error);
    return 'تعذر الاتصال بخدمة الذكاء الاصطناعي لتحليل العطل حالياً.';
  }
}
