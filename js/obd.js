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
