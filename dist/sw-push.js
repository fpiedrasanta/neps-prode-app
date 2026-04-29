// Service Worker para Notificaciones Push Neps Prode
const CACHE_VERSION = 'v2'; // 🔥 cambiar esto en cada deploy importante
const CACHE_NAME = `neps-prode-${CACHE_VERSION}`;

// 🔔 PUSH
self.addEventListener('push', function(event) {
  const payload = event.data?.json() ?? {};
  const notification = payload.notification || payload; // 🔥 FIX

  const options = {
    body: notification.body || 'Tienes una nueva notificación',
    icon: notification.icon || '/icons/icon-192x192.png',
    badge: notification.badge || '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: notification.data || {},
    actions: notification.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(
      notification.title || 'Neps Prode',
      options
    )
  );
});

// 🖱 CLICK
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (let client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
});

// ⚙️ INSTALL
self.addEventListener('install', (event) => {
  self.skipWaiting()
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // 🔥 BORRA TODO LO VIEJO
          }
        })
      )
    )
  );

  self.clients.claim();
});