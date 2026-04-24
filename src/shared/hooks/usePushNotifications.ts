import { useState } from 'react'
import { API_CONFIG } from '@/shared/config/api'

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
  const [loading, setLoading] = useState(false)

  const requestPermission = async () => {
    if (!isSupported) return false

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }

  const subscribe = async () => {
    if (!isSupported || permission !== 'granted') return null
    setLoading(true)

    try {
      // 1️⃣ Obtener clave publica directamente del Backend
      const publicKeyRes = await fetch(`${API_CONFIG.apiUrl}/PushNotifications/public-key`)
      const publicKey = await publicKeyRes.text()

      // 2️⃣ Suscribir al Service Worker
      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey.trim())
      })
      
      // 3️⃣ Enviar suscripcion al Backend para guardar
      await fetch(`${API_CONFIG.apiUrl}/PushNotifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pushSubscription)
      })

      setSubscription(pushSubscription)
      setLoading(false)
      return pushSubscription
    } catch (error) {
      console.error('Error al suscribirse a notificaciones:', error)
      setLoading(false)
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
    loading,
    requestPermission,
    subscribe,
    unsubscribe
  }
}