const CACHE = 'photo-frame-v2';
const STATIC = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg'
];

const NETWORK_ONLY = [
  'api.telegram.org',
  'api.open-meteo.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (e) => {
  if (e.data === 'skip-waiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  if (NETWORK_ONLY.some((host) => url.hostname.includes(host))) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        }
        return res;
      });
      return cached || fetched;
    })
  );
});
