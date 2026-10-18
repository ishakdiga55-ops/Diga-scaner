export async function getAIDIagnosis(errorCode, title) {
  const AI_PROXY_URL = "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/analyze";

  if (AI_PROXY_URL.includes("YOUR-WORKER")) {
    return "عذراً، خدمة التحليل الذكي غير مفعلة حالياً (جاري التحديث الأمني).";
  }

  const promptText = `أنت مهندس ميكانيكا سيارات خبير. لدي كود عطل برقم ${errorCode} وعنوانه: "${title}". أرجو تقديم الأسباب المحتملة وخطوات الفحص العملي باللغة العربية بأسلوب احترافي.`;

  try {
    const response = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText })
    });
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    return data.text || "لم يتم توليد تحليل.";
  } catch (error) {
    return "تعذر الاتصال بخدمة الذكاء الاصطناعي حالياً.";
  }
}
