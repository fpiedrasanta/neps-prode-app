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

  const requestPermissionAndSubscribe = async () => {
    if (!isSupported) return false

    const result = await Notification.requestPermission()
    setPermission(result)
    
    if (result !== 'granted') return false

    setLoading(true)

    try {
      console.log('🔔 1. Obteniendo clave publica del backend...')
      const publicKeyRes = await fetch(`${API_CONFIG.apiUrl}/PushNotifications/public-key`)
      const data = await publicKeyRes.json()
      const publicKey = data.publicKey
      console.log('✅ Clave publica obtenida:', publicKey.substring(0, 30) + '...')

      console.log('🔔 2. Obteniendo Service Worker...')
      const registration = await navigator.serviceWorker.ready
      console.log('✅ Service Worker listo')

      console.log('🔔 3. Generando suscripcion Push...')
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey.trim())
      })
      console.log('✅ Suscripcion generada')
      
      console.log('🔔 4. Enviando suscripcion al backend...')
      await fetch(`${API_CONFIG.apiUrl}/PushNotifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pushSubscription)
      })
      console.log('✅ Suscripcion enviada correctamente al backend')

      setSubscription(pushSubscription)
      setLoading(false)
      return true
    } catch (error) {
      console.error('❌ Error al suscribirse a notificaciones:', error)
      setLoading(false)
      return false
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
    requestPermissionAndSubscribe,
    unsubscribe
  }
}