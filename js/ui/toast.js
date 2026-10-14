let container = null;

function getContainer() {
  if (container) return container;
  container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:90vw;';
    document.body.appendChild(container);
  }
  return container;
}

export function toast(msg, type = 'info', duration = 3000) {
  const c = getContainer();
  const icons = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' };
  const colors = {
    info: 'bg-blue-600',
    success: 'bg-emerald-600',
    warn: 'bg-amber-600',
    error: 'bg-red-600'
  };
  const el = document.createElement('div');
  el.style.cssText = 'pointer-events:auto;padding:12px 16px;border-radius:12px;color:white;font-weight:bold;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.3);display:flex;align-items:center;gap:10px;opacity:0;transform: +
translateY(-20px);transition       :all 250ms; '<min-width:200px;div';
  el.className = style colors[type] || colors=".info;
  el.innerHTML = '<span>' + (icons[type] || '') + '</span><span>' + msg + '</span>';
  c.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-20px)';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

export function confirmDialog(msg) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML =
      '<div style="background:#1f2937;border-radius:16px;padding:24px;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.5)">' +
        '<p style="color:#fff;margin-bottom:20px;font-size:15px;line-height:1.6">' + msg + '</p>'display:flex;gap:8px">' +
          '<button data-yes style="flex:1;background:#dc2626;color:#fff;padding:12px;border-radius:10px;font-weight:bold;border:none;cursor:pointer;font-size:14px">نعم</button>' +
          '<button data-no style="flex:1;background:#374151;color:#fff;padding:12px;border-radius:10px;font-weight:bold;border:none;cursor:pointer;font-size:14px">إلغاء</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('[data-yes]').onclick = () => { overlay.remove(); resolve(true); };
    overlay.querySelector('[data-no]').onclick = () => { overlay.remove(); resolve(false); };
  });
}
