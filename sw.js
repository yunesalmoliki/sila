// Service Worker: يخزّن التطبيق كاملًا عند أول زيارة، فيفتح فورًا وبكامل وظائفه
// حتى بلا إنترنت من الزيارة الثانية فصاعدًا. لا علاقة له ببيانات المستخدم
// (تلك تبقى في localStorage/Firestore دائمًا)، فقط ملفات التطبيق نفسه.

const CACHE_VERSION = 'sila-v2';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/content.js',
  './js/db.js',
  './js/firebaseConfig.js',
  './js/icons.js',
  './js/reminders.js',
  './js/router.js',
  './js/settings.js',
  './js/ui.js',
  './js/utils.js',
  './js/data/cloudAdapter.js',
  './js/data/localAdapter.js',
  './js/screens/account.js',
  './js/screens/home.js',
  './js/screens/logContact.js',
  './js/screens/message.js',
  './js/screens/people.js',
  './js/screens/personDetail.js',
  './js/screens/personForm.js',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // اترك خطوط جوجل وطلبات Firestore لآلية المتصفح الطبيعية

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
