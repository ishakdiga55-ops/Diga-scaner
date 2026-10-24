/* ============================================
   CheckDiga Pro — Service Worker
   v39 — Added APK Download Link
   ============================================ */

const CACHE_VERSION = 'v39'; // ✅ تم تحديث الإصدار إلى v39
const CACHE_NAME = 'checkdiga-' + CACHE_VERSION;

const APP_SHELL = [
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './manifest.json',
  './icon.svg',
  './logo.png',
  
  './css/main.css',
  './css/themes/light.css',
  
  './js/main.js',
  './js/state.js',
  './js/obd.js',
  './js/obd-native.js',
  './js/inspector.js',
  './js/i18n.js',
  './js/ai-service.js',
  './js/analysis.js',
  './js/obd-commands.js',
  './js/ui-extras.js',
  './js/extras.js',
  './js/vin.js',
  './js/abs-scan.js',
  './js/data/database.js',
  './js/data/loader.js',
  './js/ui/theme.js',
  './js/ui/search.js',
  './js/ui/tabs.js',
  './js/ui/events.js',
  './js/debugger.js',
  './js/video.js',
  './js/diagnostics.js',
  './js/sw-register.js'
];

const CDN_HOSTS = [
  'cdn.jsdelivr.net',
  'cdn.tailwindcss.com',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'raw.githack.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW v39] Installing...');
      return cache.addAll(APP_SHELL).catch(err => {
        console.warn('[SW v39] Some files failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k.startsWith('checkdiga-') && k !== CACHE_NAME)
          .map(k => {
            console.log('[SW v39] Deleting old cache:', k);
            return caches.delete(k);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  if (CDN_HOSTS.some(host => url.hostname.includes(host))) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  if (url.pathname.endsWith('.json') || url.pathname.endsWith('.db')) {
    event.respondWith(
      caches.match(req).then(cached => {
        const networkFetch = fetch(req).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  event.respondWith(
    fetch(req).then(res => {
      if (res && res.status === 200 && url.origin === location.origin) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
      }
      return res;
    }).catch(() => {
      return caches.match(req).then(cached => {
        if (cached) return cached;
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
