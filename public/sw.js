try {
  importScripts('/sp-push-worker-fb.js');
} catch (e) {

}

const CACHE_NAME = 'dondepeter-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css',
  '/favicon.ico',

];

// Install: cache assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => null))
  );
});

// Activate: limpiar caches antiguos
self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
        return null;
      })
    ))
  );
});

// Fetch: responder desde cache, fallback a network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        // Opcional: cache responses de algunos tipos
        // clone response
        try {
          const resClone = res.clone();
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone)).catch(() => {});
          }
        } catch (e) {}
        return res;
      }).catch(() => {
        // fallback a index.html para navegación SPA
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});


self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : { title: 'Nuevo mensaje', body: 'Tienes una nueva notificación' };
  } catch (e) {
    payload = { title: 'Notificación', body: event.data ? event.data.text() : 'Tienes una nueva notificación' };
  }

  const title = payload.title || 'Comida Rápida';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/img/favicon.png',
    badge: payload.badge || '/img/favicon.png',
    data: payload.data || {}
  };

  event.waitUntil(self.registration.showNotification(title, options));
});