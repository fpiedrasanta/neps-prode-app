// Service Worker para Notificaciones Push Neps Prode

self.addEventListener('push', function(event) {
  let data = {}

  try {
    data = event.data?.json() ?? {}
  } catch {
    data = {}
  }

  // 🔥 Soporte para payload con "notification" (como el tuyo)
  const notification = data.notification || data

  const options = {
    body: notification.body || 'Tienes una nueva notificación',
    icon: notification.icon || '/icons/icon-192x192.png',
    badge: notification.badge || '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: notification.data?.url || '/',
      ...notification.data
    },
    actions: notification.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(
      notification.title || 'Neps Prode',
      options
    )
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', () => {
  self.clients.claim()
})