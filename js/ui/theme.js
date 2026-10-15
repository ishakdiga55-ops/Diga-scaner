export function initTheme() {
  const btn = document.getElementById('btnTheme');
  if (btn) btn.onclick = toggleTheme;
  applyTheme();
}

function applyTheme() {
  const t = localStorage.getItem('checkdiga_theme') || 'dark';
  const ic = document.getElementById('themeIcon');
  if (t === 'light') {
    document.body.classList.add('light-mode');
    if (ic) ic.className = 'fa-solid fa-moon text-lg';
  } else {
    document.body.classList.remove('light-mode');
    if (ic) ic.className = 'fa-solid fa-sun text-lg';
  }
}

export function toggleTheme() {
  const cur = localStorage.getItem('checkdiga_theme') || 'dark';
  localStorage.setItem('checkdiga_theme', cur === 'dark' ? 'light' : 'dark');
  applyTheme();
}
