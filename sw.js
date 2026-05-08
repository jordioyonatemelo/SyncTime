// ═══════════════════════════════════════════════════════
// SERVICE WORKER — Reloj Multihorario
// Estrategia: Cache First — funciona 100% offline
// ═══════════════════════════════════════════════════════
const CACHE_NAME = 'multihorario-v6';

const ASSETS = [
  './',
  './index.html'
];

// INSTALL: pre-cachear los assets esenciales
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE: borrar caches antiguos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// FETCH: Cache First — sirve desde caché, actualiza en segundo plano
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(e.request).then(cached => {
        // Actualizar caché en segundo plano
        const networkFetch = fetch(e.request)
          .then(response => {
            if (response && response.ok) {
              cache.put(e.request, response.clone());
            }
            return response;
          })
          .catch(() => null);

        // Si está en caché, devolver inmediatamente (offline funciona)
        return cached || networkFetch;
      })
    )
  );
});
