/* ============================================
   CheckDiga Pro — Service Worker
   ============================================ */

const CACHE_VERSION = 'v3';
const CACHE_NAME = 'checkdiga-' + CACHE_VERSION;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './logo.png',
  './css/main.css',
  './css/themes/light.css',
  './js/app.js',
  './js/advanced-diagnostics.js'
];

const CDN_HOSTS = [
  'cdn.jsdelivr.net',
  'cdn.tailwindcss.com',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

/* --- Install --- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW v3] Installing...');
      return cache.addAll(APP_SHELL).catch(err => {
        console.warn('[SW v3] Some files failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

/* --- Activate: حذف كل النسخ القديمة --- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k.startsWith('checkdiga-') && k !== CACHE_NAME)
          .map(k => {
            console.log('[SW v3] Deleting old cache:', k);
            return caches.delete(k);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/* --- Fetch --- */
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  /* CDN */
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

  /* JSON / DB */
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

  /* App shell */
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

/* --- Message --- */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
