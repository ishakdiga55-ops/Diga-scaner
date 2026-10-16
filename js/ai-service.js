/* ============================================
   CheckDiga Pro — AI Enrichment Service
   ============================================ */

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 

export async function getAIDIagnosis(errorCode, title) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_")) {
    return "مساعد الذكاء الاصطناعي غير مفعل حالياً (يرجى إدخال مفتاح الـ API). التفاصيل غير متوفرة لهذا الكود في القاعدة المحلية.";
  }

  const prompt = `أنت مهندس ميكانيكا سيارات خبير جداً وفاحص محترف. لدي كود عطل في السيارة برقم ${errorCode} وعنوانه المبدئي هو: "${title}". 
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
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return resultText || "عذراً، لم يتمكن الذكاء الاصطناعي من توليد تحليل لهذا الكود.";
  } catch (error) {
    console.error('AI Enrichment Error:', error);
    return 'تعذر الاتصال بخدمة الذكاء الاصطناعي لتحليل العطل حالياً.';
  }
}
