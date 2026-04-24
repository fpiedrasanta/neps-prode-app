import { useState } from 'react'

const VAPID_PUBLIC_KEY = 'BKU5mQRu7ALt1SXg2OcNOvdJVsV7WY5AvvK5Fdas1UXhJmzYWUbbAPprMP-HYm-w2UEh8wVZC-u1CXuPA7K6Ht8'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

export function usePushNotifications() {
  const [isSupported] = useState(() => 'serviceWorker' in navigator && 'PushManager' in window)
  const [permission, setPermission] = useState<NotificationPermission>(() => 
    'Notification' in window ? Notification.permission : 'default'
  )
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  const requestPermission = async () => {
    if (!isSupported) return false

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }

  const subscribe = async () => {
    if (!isSupported || permission !== 'granted') return null

    try {
      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
      
      setSubscription(pushSubscription)
      return pushSubscription
    } catch (error) {
      console.error('Error al suscribirse a notificaciones:', error)
      return null
    }
  }

  const unsubscribe = async () => {
    if (!subscription) return false
    try {
      const success = await subscription.unsubscribe()
      setSubscription(null)
      return success
    } catch (error) {
      console.error('Error al desuscribirse:', error)
      return false
    }
  }

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe
  }
}