import { getAIDIagnosis } from '../ai-service.js';

export async function showDTCDetails(errorCode, info) {
  const modal = document.getElementById('dtcDetailModal');
  const container = document.getElementById('dtcDetailContent'); // أو الحقل المخصص للعرض
  if (!modal || !container) return;

  // 1. تجهيز العرض الأساسي
  let causesHtml = '';
  const hasCauses = info.causes && info.causes.length > 0;

  if (hasCauses) {
    causesHtml = `<p class="text-xs text-gray-300 mt-2"><strong>الأسباب المحتملة:</strong> ${info.causes.join('، ')}</p>`;
  } else {
    // إذا كانت الأسباب غير متوفرة، نضع مكانها الحاوية التي سيملؤها الذكاء الاصطناعي تلقائياً
    causesHtml = `
      <div id="ai-dynamic-content" class="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <div class="flex items-center gap-2 text-yellow-400 text-xs animate-pulse">
          <i class="fa-solid fa-robot"></i>
          <span>الأسباب التفصيلية غير متوفرة محلياً. جارٍ استنتاجها بالذكاء الاصطناعي...</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <h3 class="text-lg font-mono text-red-400 font-bold">${errorCode}</h3>
    <p class="text-sm text-white mt-1">${info.title || 'بدون عنوان'}</p>
    ${causesHtml}
  `;

  modal.classList.remove('hidden');

  // 2. إذا كانت البيانات ناقصة، نستدعي الذكاء الاصطناعي في الخلفية لتعبئتها فوراً
  if (!hasCauses) {
    const aiText = await getAIDIagnosis(errorCode, info.title);
    const aiBox = document.getElementById('ai-dynamic-content');
    if (aiBox) {
      aiBox.innerHTML = `
        <strong class="text-blue-400 text-xs block mb-1">💡 تحليل خبير الورشة (AI):</strong>
        <p class="text-xs text-gray-200 leading-relaxed whitespace-pre-line">${aiText}</p>
      `;
    }
  }
}
