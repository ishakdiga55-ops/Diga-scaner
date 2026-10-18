export const app = {
  isConnected: false,
  isDemo: false,
  transport: null,
  isIOS: false,
  isBluefy: false,
  hasSerial: false,
  hasBLE: false,
  hasWiFi: 'WebSocket' in window,
  obdexLoaded: false
};

export const ble = {
  device: null,
  server: null,
  rxChar: null,
  txChar: null,
  txNoResp: false,
  uartTx: null
};

export const usb = {
  port: null,
  writer: null,
  reader: null,
  loop: false,
  generation: 0
};

export const wifi = {
  socket: null,
  isConnecting: false
};

export const comm = {
  recvBuf: '',
  cmdQ: [],
  isProcessing: false,
  curResolve: null,
  curTimeout: null,
  userDisc: false,
  reconnecting: false,
  isCAN: null,
  isCAN11: null,
  heartbeatTimer: null,
  heartbeatFails: 0
};

export const live = {
  timer: null,
  tick: 0,
  paused: false,
  busy: false,
  lastCoolant: null,
  lastFuel: null
};

export const session = {
  lastFaults: [],
  lastDiag: [],
  currentSevFilter: 'all',
  currentDetailCode: '',
  chartInstance: null,
  statsChartInstance: null,
  demoTimer: null
};

export const user = {
  favorites: [],
  recentSearches: [],
  batteryVals: [null, null, null],
  batteryStep: 0
};

export function initApp() {
  const ua = navigator.userAgent;
  app.isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  app.isBluefy = /Bluefy/i.test(ua);
  app.hasSerial = 'serial' in navigator;
  app.hasBLE = 'bluetooth' in navigator;

  try {
    user.favorites = JSON.parse(localStorage.getItem('checkdiga_favs') || '[]');
    user.recentSearches = JSON.parse(localStorage.getItem('checkdiga_recent') || '[]');
  } catch (_) {
    user.favorites = [];
    user.recentSearches = [];
  }
}
