// Service Worker para Notificaciones Push Neps Prode
self.addEventListener('push', function(event) {
  const data = event.data?.json() ?? {}
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/neps-logo.png',
    badge: '/neps-logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Neps Prode', options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === url && 'focus' in client) {
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