import { app, initApp } from './state.js';
import { connectOBD, connectUSB, handleDisc } from './obd.js';
import { readDTCs, scanAll, clearDTCs } from './obd-commands.js';
import { startDemo, stopDemo } from './extras.js';

function init() {
  if (typeof initApp === 'function') initApp();

  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  };

  // ═══ الاتصال ═══
  bind('connect-btn', async () => { try { await connectOBD(false); } catch (_) {} });
  bind('usb-btn', async () => { try { await connectUSB(); } catch (_) {} });
  bind('demo-btn', async () => {
    try { startDemo(); } catch (_) {}
    try { readDTCs(); } catch (_) {}
  });
  bind('disconnect-btn', async () => {
    try { stopDemo(); } catch (_) {}
    try { await handleDisc(); } catch (_) {}
  });
  bind('clear-btn', clearDTCs);
  bind('btnReadDTC', readDTCs);
  bind('btnScanAll', scanAll);
  bind('btnScanABS', async () => { alert('سيتم برمجة هذا القسم لاحقاً'); });
  bind('btnCloseDetail', () => { document.getElementById('dtcDetailModal').classList.add('hidden'); });

  // ═══ كود التبويبات (لضمان عملها 100%) ═══
  document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('bg-blue-600', 'text-white');
        t.classList.add('bg-gray-800', 'text-gray-400');
      });
      tab.classList.remove('bg-gray-800', 'text-gray-400');
      tab.classList.add('bg-blue-600', 'text-white');

      document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
      const targetPanel = document.getElementById('panel-' + tab.dataset.tab);
      if (targetPanel) targetPanel.classList.remove('hidden');
    };
  });

  // إغلاق النافذة المنبثقة عند الضغط خارجها
  const dd = document.getElementById('dtcDetailModal');
  if (dd) dd.onclick = e => { if (e.target.id === 'dtcDetailModal') dd.classList.add('hidden'); };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
