export function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.onclick = function () {
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('bg-blue-600', 'text-white');
        t.classList.add('bg-gray-800', 'text-gray-400');
      });
      tab.classList.remove('bg-gray-800', 'text-gray-400');
      tab.classList.add('bg-blue-600', 'text-white');

      document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
      const target = document.getElementById('panel-' + tab.dataset.tab);
      if (target) target.classList.remove('hidden');

      if (tab.dataset.tab === 'live' && window.__cd_initChart) {
        setTimeout(() => {
          try { window.__cd_initChart(); } catch (_) {}
        }, 200);
      }
    };
  });
}
