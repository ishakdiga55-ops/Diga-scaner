import { app, live, session } from './state.js';
import { sendCmd, pauseLiveWait, resumeLive } from './obd.js';
import { runDiag, confLabel, calcHealth } from './analysis.js';
import { getInfo, DTC_DATABASE } from './data/database.js';

export function startDemo() {
  app.isDemo = true;
  app.isConnected = true;
  app.transport = null;
  setStatusDemo();
  updConnUIDemo();
  if (session.demoTimer) clearInterval(session.demoTimer);
  session.demoTimer = setInterval(() => {
    const r = Math.floor(900 + Math.random() * 2500);
    const s = Math.floor(Math.random() * 110);
    const c = 82 + Math.floor(Math.random() * 18);
    const f = 40 + Math.floor(Math.random() * 50);
    live.lastCoolant = c;
    live.lastFuel = f;
    const el = document.getElementById('gauge-rpm');
    if (el) el.textContent = r;
  }, 1500);
}

export function stopDemo() {
  if (session.demoTimer) clearInterval(session.demoTimer);
  session.demoTimer = null;
  app.isDemo = false;
}

function setStatusDemo() {
  const e = document.getElementById('connection-status');
  const d = document.getElementById('statusDot');
  if (e) { e.textContent = 'وضع تجريبي'; e.className = 'text-sm font-bold text-amber-400'; }
  if (d) d.className = 'w-3 h-3 rounded-full bg-amber-500';
}

function updConnUIDemo() {
  const cb = document.getElementById('connect-btn');
  const ub = document.getElementById('usb-btn');
  const db = document.getElementById('demo-btn');
  const x = document.getElementById('disconnect-btn');
  if (cb) cb.classList.add('hidden');
  if (ub) ub.classList.add('hidden');
  if (db) db.classList.add('hidden');
  if (x) x.classList.remove('hidden');
}
