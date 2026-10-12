/* ============================================
   CheckDiga Pro — Service Worker
   PWA offline support
   ============================================ */

const CACHE_VERSION = 'v1';
const CACHE_NAME = 'checkdiga-' + CACHE_VERSION;

/* App shell — cached on install */
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/main.css',
  './css/themes/light.css',
  './js/app.js'
];

/* External CDNs — cached on first use */
const CDN_HOSTS = [
  'cdn.jsdelivr.net',
  'cdn.tailwindcss.com',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

/* --- Install: cache app shell --- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Installing...');
      return cache.addAll(APP_SHELL).catch(err => {
        console.warn('[SW] Some files failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

/* --- Activate: cleanup old caches --- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k.startsWith('checkdiga-') && k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/* --- Fetch: smart caching strategy --- */
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  /* Skip non-GET */
  if (req.method !== 'GET') return;

  /* Strategy 1: CDN assets — Cache First, then Network */
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

  /* Strategy 2: Local data files (JSON, DB) — Stale While Revalidate */
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

  /* Strategy 3: App shell — Network First, then Cache */
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
        /* Fallback to index.html for navigation */
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});

/* --- Message handler: skipWaiting on demand --- */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});