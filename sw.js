// ============================================================
// 🔧 CheckDiga - Service Worker (PWA)
// ============================================================

const CACHE_VERSION = 'checkdiga-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const DTC_CACHE = `${CACHE_VERSION}-dtc`;

// 📦 الملفات الأساسية التي يجب تخزينها دائماً
const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 🌐 الموارد الخارجية (CDN) - تُخزّن مؤقتاً
const CDN_RESOURCES = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap'
];

// ============================================================
// 🚀 التثبيت: تخزين الملفات الأساسية
// ============================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_FILES).catch((err) => {
        console.warn('[SW] Some static files failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ============================================================
// 🔄 التفعيل: حذف النسخ القديمة
// ============================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.startsWith(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================================
// 📡 اعتراض الطلبات
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات غير GET
  if (request.method !== 'GET') return;

  // تجاهل طلبات Firebase (تحتاج إنترنت مباشر)
  if (url.hostname.includes('gstatic.com') || url.hostname.includes('firebase')) {
    return;
  }

  // 1️⃣ طلبات HTML → Network First (لتحديث التطبيق)
  if (request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // 2️⃣ ملف قاعدة البيانات dtc_full.json → Network First (لتحديث الأكواد)
  if (url.pathname.endsWith('.json') && url.pathname.includes('dtc')) {
    event.respondWith(networkFirstStrategy(request, DTC_CACHE));
    return;
  }

  // 3️⃣ ملفات manifest → Cache First
  if (url.pathname.endsWith('.manifest.json')) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // 4️⃣ أيقونات → Cache First
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // 5️⃣ ملفات CDN → Stale While Revalidate
  if (CDN_RESOURCES.some(cdn => request.url.startsWith(cdn) || url.hostname.includes('cdn'))) {
    event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // 6️⃣ Fonts من Google → Cache First
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // 7️⃣ أي شيء آخر → Network First مع الرجوع للكاش
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

// ============================================================
// 🎯 الاستراتيجيات
// ============================================================

// Network First: يحاول الشبكة أولاً، وإذا فشلت يرجع للكاش
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // صفحة احتياطية
    if (request.destination === 'document') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    throw err;
  }
}

// Cache First: يستخدم الكاش أولاً، وإن لم يوجد يجلب من الشبكة
async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    throw err;
  }
}

// Stale While Revalidate: يعرض الكاش فوراً ثم يحدّثه بالخلفية
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      const cache = caches.open(cacheName).then((c) => {
        c.put(request, response.clone());
      });
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// ============================================================
// 📨 رسائل من التطبيق
// ============================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

// ============================================================
// 🔔 الإشعارات (جاهز للمستقبل)
// ============================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'تحديث جديد',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    data: { url: data.url || './' }
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'CheckDiga', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

console.log('[SW] Service Worker loaded');
