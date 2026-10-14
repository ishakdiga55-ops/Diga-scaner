import { app, ble, usb, comm, live } from './state.js';

const KNOWN_SVC = [
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '0000fff0-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000ffe5-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '000018f0-0000-1000-8000-00805f9b34fb'
];

const sleepMs = ms => new Promise(r => setTimeout(r, ms));
let decoder = null;

export function log(msg) {
  const c = document.getElementById('console');
  if (!c) return;
  const t = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  c.textContent += '\n[' + t + '] ' + msg;
  c.scrollTop = c.scrollHeight;
}

function isBad(r) {
  if (!r) return true;
  const t = String(r).trim();
  if (t === '' || t === '>') return true;
  if (/NO DATA|UNABLE TO CONNECT|ERROR|BUS INIT/i.test(r)) return true;
  return false;
}

export function handleIncoming(text) {
  comm.recvBuf += text;
  if (comm.recvBuf.length > 4096) comm.recvBuf = comm.recvBuf.slice(-2048);
  if (comm.recvBuf.indexOf('>') >= 0 && comm.curResolve) {
    clearTimeout(comm.curTimeout);
    comm.curTimeout = null;
    const r = comm.recvBuf;
    comm.recvBuf = '';
    const res = comm.curResolve;
    comm.curResolve = null;
    res(r);
  }
}

export async function sendCmd(cmd, timeout, retries) {
  timeout = timeout || 3000;
  retries = (retries == null) ? 1 : retries;
  return new Promise((resolve, reject) => {
    let att = 0, done = false;
    const sR = v => { if (done) return; done = true; resolve(v); };
    const sJ = e => { if (done) return; done = true; reject(e); };
    function tOnce() {
      att++;
      comm.cmdQ.push({
        cmd,
        timeout,
        resolve: r => {
          if (isBad(r) && att <= retries) {
            comm.isProcessing = false;
            setTimeout(tOnce, 300);
            return;
          }
          sR(r);
          comm.isProcessing = false;
          procQ();
        },
        reject: e => {
          comm.isProcessing = false;
          if (att <= retries) setTimeout(tOnce, 300);
          else { sJ(e); procQ(); }
        }
      });
      procQ();
    }
    tOnce();
  });
}

async function procQ() {
  if (comm.isProcessing || !comm.cmdQ.length) return;
  const ch = (app.transport === 'usb' && usb.writer) ||
             (app.transport === 'ble' && ble.txChar);
  if (!ch) { comm.isProcessing = false; return; }
  comm.isProcessing = true;
  const it = comm.cmdQ.shift();
  comm.curResolve = it.resolve;
  comm.recvBuf = '';
  try {
    const d = new TextEncoder().encode(it.cmd + '\r');
    if (app.transport === 'usb') await usb.writer.write(d);
    else await bleWrite(d);
    comm.curTimeout = setTimeout(() => {
      if (comm.curResolve) {
        const r = comm.recvBuf;
        comm.recvBuf = '';
        const res = comm.curResolve;
        comm.curResolve = null;
        comm.curTimeout = null;
        comm.isProcessing = false;
        if (!r || !r.includes('>')) it.reject(new Error('timeout'));
        else res(r);
        procQ();
      }
    }, it.timeout);
  } catch (e) {
    comm.isProcessing = false;
    comm.curResolve = null;
    if (comm.curTimeout) { clearTimeout(comm.curTimeout); comm.curTimeout = null; }
    it.reject(e);
    procQ();
  }
}

async function bleWrite(d) {
  if (ble.txNoResp && ble.txChar.writeValueWithoutResponse)
    await ble.txChar.writeValueWithoutResponse(d);
  else
    await ble.txChar.writeValue(d);
}

export async function initELM() {
  log('INFO: تهيئة ELM327...');
  await sendCmd('AT Z', 6000);
  await sleepMs(300);
  await sendCmd('AT E0', 1500);
  await sendCmd('AT L0', 1000);
  await sendCmd('AT S0', 1000);
  await sendCmd('AT H0', 1000);
  await sendCmd('AT SP 0', 1500);
  await sleepMs(300);
  let t = await sendCmd('0100', 4500);
  if (String(t).replace(/[^0-9A-F]/gi, '').toUpperCase().indexOf('4100') >= 0) {
    log('OK: بروتوكول Auto (SP 0)');
    await detectCAN();
    return true;
  }
  const protocols = ['AT SP 6','AT SP 7','AT SP 8','AT SP 9','AT SP 5','AT SP 4','AT SP 3','AT SP 2','AT SP 1'];
  for (const p of protocols) {
    await sendCmd(p, 1500);
    await sleepMs(150);
    t = await sendCmd('0100', 3500);
    if (String(t).replace(/[^0-9A-F]/gi, '').toUpperCase().indexOf('4100') >= 0) {
      log('OK: بروتوكول ' + p);
      await detectCAN();
      return true;
    }
  }
  log('ERR: لم يتم التعرف على بروتوكول');
  return false;
}

async function detectCAN() {
  try {
    const d = String(await sendCmd('AT DPN', 1500)).replace(/[^0-9A-F]/gi, '').toUpperCase();
    const n = d.replace(/^A/, '').slice(0, 1);
    comm.isCAN = /[6-9A-C]/.test(n);
    comm.isCAN11 = /[68B]/.test(n);
  } catch (_) {
    comm.isCAN = null;
    comm.isCAN11 = null;
  }
}

export async function connectOBD(showAll) {
  if (!app.hasBLE) {
    alert(window.isSecureContext === false ? 'Web Bluetooth يحتاج HTTPS.' : 'المتصفح لا يدعم Web Bluetooth.');
    return;
  }
  const btn = document.getElementById('connect-btn');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';
  comm.userDisc = false;

  try {
    log('INFO: البحث عن أجهزة BLE...');
    const names = ['OBD', 'OBDII', 'ELM', 'Vgate', 'Viecar', 'V-Link', 'KONNWEI', 'iCar'];
    const opts = showAll
      ? { acceptAllDevices: true, optionalServices: KNOWN_SVC }
      : {
          filters: [
            ...KNOWN_SVC.map(s => ({ services: [s] })),
            ...names.map(n => ({ namePrefix: n }))
          ],
          optionalServices: KNOWN_SVC
        };
    try {
      ble.device = await navigator.bluetooth.requestDevice(opts);
    } catch (e) {
      if (e.name === 'NotFoundError') { log('INFO: لم يتم اختيار جهاز'); return; }
      throw e;
    }
    log('INFO: جهاز: ' + (ble.device.name || 'بدون اسم'));
    ble.device.removeEventListener('gattserverdisconnected', onGattDisc);
    ble.device.addEventListener('gattserverdisconnected', onGattDisc);
    await setupBle();
    app.transport = 'ble';
    app.isConnected = true;
    setStatus('connected');
    updConnUI(true);
    log('OK: متصل Bluetooth');
    if (!await initELM()) throw new Error('فشل تهيئة ELM327');
    log('OK: جاهز');
    startLive();
  } catch (e) {
    log('ERR: ' + e.message);
    await handleDisc();
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

async function setupBle() {
  ble.server = await ble.device.gatt.connect();
  let rx = null, tx = null;
  const isN = c => c.properties.notify || c.properties.indicate;
  const isW = c => c.properties.write || c.properties.writeWithoutResponse;
  const scan = async svcs => {
    for (const s of svcs) {
      let chs = [];
      try { chs = await s.getCharacteristics(); } catch (_) { continue; }
      const both = chs.find(c => isN(c) && isW(c));
      if (both) { rx = both; tx = both; return true; }
      const n = chs.find(isN), w = chs.find(isW);
      if (n && w) { rx = n; tx = w; return true; }
    }
    return false;
  };
  const known = [];
  for (const u of KNOWN_SVC) {
    try { known.push(await ble.server.getPrimaryService(u)); } catch (_) {}
  }
  if (!(await scan(known))) await scan(await ble.server.getPrimaryServices());
  if (!rx || !tx) throw new Error('لم يتم العثور على قناة إرسال/استقبال');
  ble.rxChar = rx;
  ble.txChar = tx;
  ble.txNoResp = !tx.properties.write && !!tx.properties.writeWithoutResponse;
  await rx.startNotifications();
  rx.removeEventListener('characteristicvaluechanged', onNotif);
  rx.addEventListener('characteristicvaluechanged', onNotif);
  log('OK: قناة ' + (rx === tx ? 'واحدة' : 'RX/TX منفصلة'));
}

function onNotif(e) {
  if (!decoder) decoder = new TextDecoder();
  handleIncoming(decoder.decode(e.target.value));
}

export async function connectUSB() {
  if (!navigator.serial) { alert('Web Serial غير مدعوم'); return; }
  const btn = document.getElementById('usb-btn');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';
  comm.userDisc = false;

  try {
    const port = await navigator.serial.requestPort();
    let ok = false;
    for (const b of [38400, 115200, 9600, 57600, 230400]) {
      usb.port = port;
      try {
        await port.open({ baudRate: b, dataBits: 8, stopBits: 1, parity: 'none' });
        usb.writer = port.writable.getWriter();
        app.transport = 'usb';
        startUSBLoop();
        const r = await sendCmd('AT Z', 3000, 0);
        if (/ELM|OBD|STN|v\d\.\d/i.test(String(r))) {
          ok = true;
          log('OK: USB @' + b);
          break;
        }
      } catch (e) {
        log('INFO: ' + b + ' — ' + e.message);
      }
      await cleanupUSB();
    }
    if (!ok) throw new Error('لم يردّ على أي سرعة');
    app.isConnected = true;
    setStatus('connected');
    updConnUI(true);
    if (!await initELM()) throw new Error('فشل تهيئة ELM327');
    log('OK: جاهز');
    startLive();
  } catch (e) {
    log('ERR: ' + e.message);
    await handleDisc();
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

async function startUSBLoop() {
  if (!usb.port || !usb.port.readable) return;
  const gen = ++usb.generation;
  const port = usb.port;
  const dec = new TextDecoder();
  usb.loop = true;
  while (gen === usb.generation && port.readable) {
    const rd = port.readable.getReader();
    usb.reader = rd;
    try {
      while (gen === usb.generation) {
        const v = await rd.read();
        if (v.done) break;
        if (v.value) handleIncoming(dec.decode(v.value, { stream: true }));
      }
    } catch (_) {}
    finally { try { rd.releaseLock(); } catch (_) {} }
  }
  if (gen === usb.generation && app.transport === 'usb' && app.isConnected) {
    log('WARN: انقطع USB');
    handleDisc();
  }
}

async function cleanupUSB() {
  usb.generation++;
  usb.loop = false;
  try { if (usb.reader) { await usb.reader.cancel(); usb.reader.releaseLock(); } } catch (_) {}
  try { if (usb.writer) usb.writer.releaseLock(); } catch (_) {}
  try { if (usb.port) await usb.port.close(); } catch (_) {}
  usb.reader = null;
  usb.writer = null;
  usb.port = null;
  comm.cmdQ = [];
  comm.isProcessing = false;
  comm.curResolve = null;
  if (comm.curTimeout) { clearTimeout(comm.curTimeout); comm.curTimeout = null; }
}

async function onGattDisc() {
  if (comm.userDisc || comm.reconnecting || app.transport !== 'ble' || !app.isConnected) return;
  comm.reconnecting = true;
  pauseLive();
  comm.cmdQ = [];
  comm.isProcessing = false;
  comm.curResolve = null;
  if (comm.curTimeout) { clearTimeout(comm.curTimeout); comm.curTimeout = null; }
  setStatus('disconnected');
  log('WARN: انقطع Bluetooth — إعادة المحاولة...');
  for (let i = 1; i <= 3 && !comm.userDisc; i++) {
    await sleepMs(1500 * i);
    try {
      await setupBle();
      if (await initELM()) {
        log('OK: أُعيد الاتصال');
        setStatus('connected');
        comm.reconnecting = false;
        startLive();
        return;
      }
    } catch (_) {}
  }
  comm.reconnecting = false;
  await handleDisc();
}

export async function handleDisc() {
  comm.userDisc = true;
  app.isConnected = false;
  app.isDemo = false;
  live.paused = false;
  if (live.timer) { clearTimeout(live.timer); live.timer = null; }
  if (app.transport === 'usb' || usb.port) await cleanupUSB();
  if (ble.rxChar) {
    try { ble.rxChar.removeEventListener('characteristicvaluechanged', onNotif); } catch (_) {}
    try { await ble.rxChar.stopNotifications(); } catch (_) {}
    ble.rxChar = null;
  }
  ble.txChar = null;
  if (ble.device && ble.device.gatt && ble.device.gatt.connected) {
    try { ble.device.gatt.disconnect(); } catch (_) {}
  }
  app.transport = null;
  comm.isCAN = null;
  comm.isCAN11 = null;
  comm.cmdQ = [];
  comm.isProcessing = false;
  comm.curResolve = null;
  if (comm.curTimeout) { clearTimeout(comm.curTimeout); comm.curTimeout = null; }
  setStatus('disconnected');
  updConnUI(false);
  log('INFO: تم قطع الاتصال');
}

export function setStatus(s) {
  const e = document.getElementById('connection-status');
  const d = document.getElementById('statusDot');
  if (!e || !d) return;
  if (s === 'connected') {
    e.textContent = 'متصل';
    e.className = 'text-sm font-bold text-green-400';
    d.className = 'w-3 h-3 rounded-full bg-green-500';
  } else if (s === 'demo') {
    e.textContent = 'وضع تجريبي';
    e.className = 'text-sm font-bold text-amber-400';
    d.className = 'w-3 h-3 rounded-full bg-amber-500';
  } else {
    e.textContent = 'غير متصل';
    e.className = 'text-sm font-bold text-red-400';
    d.className = 'w-3 h-3 rounded-full bg-red-500';
  }
}

export function updConnUI(c) {
  const cb = document.getElementById('connect-btn');
  const ub = document.getElementById('usb-btn');
  const db = document.getElementById('demo-btn');
  const x = document.getElementById('disconnect-btn');
  if (!cb || !ub || !db || !x) return;
  if (c) {
    cb.classList.add('hidden');
    ub.classList.add('hidden');
    db.classList.add('hidden');
    x.classList.remove('hidden');
  } else {
    cb.classList.remove('hidden');
    if (!app.hasSerial || app.isIOS) ub.classList.add('hidden');
    else ub.classList.remove('hidden');
    db.classList.remove('hidden');
    x.classList.add('hidden');
  }
}

export function startLive() {
  if (live.timer || live.busy) return;
  live.paused = false;
  live.tick = 0;
  const loop = async () => {
    live.timer = null;
    if (!app.isConnected || app.isDemo || live.paused) return;
    if (!comm.isProcessing && comm.cmdQ.length === 0) {
      live.busy = true;
      try {
        const rpm = pRPM(await sendCmd('01 0C', 800, 1));
        const spd = pSpeed(await sendCmd('01 0D', 800, 1));
        if (live.tick % 4 === 0) {
          live.lastCoolant = pCool(await sendCmd('01 05', 800, 1));
          live.lastFuel = pFuel(await sendCmd('01 2F', 800, 1));
        }
        updAllG({ rpm, speed: spd, coolant: live.lastCoolant, fuelLevel: live.lastFuel });
        live.tick++;
      } catch (_) {}
      finally { live.busy = false; }
    }
    if (app.isConnected && !app.isDemo && !live.paused && !live.timer)
      live.timer = setTimeout(loop, 1200);
  };
  loop();
}

export function pauseLive() {
  live.paused = true;
  if (live.timer) { clearTimeout(live.timer); live.timer = null; }
}

export function resumeLive() {
  live.paused = false;
  if (app.isConnected && !app.isDemo && !live.timer && !live.busy) startLive();
}

export async function pauseLiveWait() {
  pauseLive();
  for (let i = 0; i < 60 && live.busy; i++) await sleepMs(100);
}

export function pHex(txt) {
  if (!txt) return [];
  const cleaned = txt.replace(/[^0-9A-Fa-f]/g, ' ');
  const parts = cleaned.trim().split(/\s+/);
  const bytes = [];
  for (const x of parts) {
    if (x.length === 2) bytes.push(parseInt(x, 16));
    else if (x.length > 2 && x.length % 2 === 0)
      for (let j = 0; j < x.length; j += 2) bytes.push(parseInt(x.substr(j, 2), 16));
  }
  return bytes;
}

export function pRPM(r) {
  const b = pHex(r);
  for (let i = 0; i < b.length - 3; i++)
    if (b[i] === 0x41 && b[i + 1] === 0x0C)
      return Math.round(((b[i + 2] * 256) + b[i + 3]) / 4);
  return null;
}

export function pSpeed(r) {
  const b = pHex(r);
  for (let i = 0; i < b.length - 2; i++)
    if (b[i] === 0x41 && b[i + 1] === 0x0D) return b[i + 2];
  return null;
}

export function pCool(r) {
  const b = pHex(r);
  for (let i = 0; i < b.length - 2; i++)
    if (b[i] === 0x41 && b[i + 1] === 0x05) return b[i + 2] - 40;
  return null;
}

export function pFuel(r) {
  const b = pHex(r);
  for (let i = 0; i < b.length - 2; i++)
    if (b[i] === 0x41 && b[i + 1] === 0x2F)
      return Math.round(b[i + 2] * 100 / 255);
  return null;
}

export function updAllG(v) {
  updGauge('rpmArc', 'rpmNeedle', 'gauge-rpm', v.rpm, 8000);
  updGauge('spdArc', 'spdNeedle', 'gauge-speed', v.speed, 220);
  updGauge('colArc', 'colNeedle', 'gauge-coolant', v.coolant, 130);
  updGauge('fuelArc', 'fuelNeedle', 'gauge-fuel', v.fuelLevel, 100);
}

function updGauge(arcId, needleId, valId, val, max) {
  const arc = document.getElementById(arcId);
  const ndl = document.getElementById(needleId);
  const ve = document.getElementById(valId);
  if (!arc || !ndl || !ve) return;
  if (val == null || isNaN(val)) {
    arc.setAttribute('stroke-dashoffset', '220');
    ndl.style.transform = 'rotate(-90deg)';
    ve.textContent = '--';
    return;
  }
  const cv = Math.max(0, Math.min(max, val));
  const p = cv / max;
  arc.setAttribute('stroke-dashoffset', String(220 * (1 - p)));
  ndl.style.transform = 'rotate(' + (-90 + p * 180) + 'deg)';
  ve.textContent = Math.round(cv);
}
