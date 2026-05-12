// Service Worker para Notificaciones Push Neps Prode
const CACHE_VERSION = 'v2.5'; // 🔥 cambiar esto en cada deploy importante
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

/**
 * Convierte un tipo de notificación en una URL de navegación.
 * Soporta tanto 'url' como 'click_action' (legacy) enviados desde el backend.
 */
function getNotificationUrl(data) {
  // Si ya viene una URL explícita, la usamos directamente
  if (data.url) return data.url
  if (data.click_action) return data.click_action

  // Fallback: data.type define la ruta según el tipo de notificación
  switch (data.type) {
    case 'comment':
    case 'new_post':
      return '/feed'
    case 'match_about_to_start':
      return '/?tab=0'   // Próximos
    case 'match_started':
      return '/?tab=1'   // En juego
    case 'match_finished':
      return '/?tab=2'   // Finalizados
    case 'friend_request':
      return '/?openRequests=true'
    default:
      return '/'
  }
}

// 🖱 CLICK
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  const url = getNotificationUrl(event.notification.data || {})
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (let client of clientList) {
        if ('focus' in client) {
          return client.navigate(url).then(() => client.focus()).catch(() => client.focus())
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

// This is used by Vite PWA plugin to inject the precache manifest
self.__WB_MANIFEST;
