import { useState } from 'react'
import { api } from '@/core/api/axios'

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
  const [loading, setLoading] = useState(false)

  const requestPermissionAndSubscribe = async () => {
    if (!isSupported) return false

    const result = await Notification.requestPermission()
    setPermission(result)
    
    if (result !== 'granted') return false

    setLoading(true)

    try {
      console.log('🔔 1. Obteniendo clave publica del backend...')
      const publicKeyRes = await api.get('/PushNotifications/public-key')
      
      console.log('📡 Response status:', publicKeyRes.status)
      console.log('📡 Response body:', publicKeyRes.data)
      
      const data = publicKeyRes.data
      const publicKey = data.publicKey
      console.log('✅ Clave publica obtenida')
      
      console.log('🔑 Public key raw:', publicKey)
      console.log('🔑 Uint8Array:', urlBase64ToUint8Array(publicKey))

      console.log('🔔 2. Obteniendo Service Worker activo...')

      let registration = await navigator.serviceWorker.getRegistration()

      if (!registration) {
        console.log('⚠️ No hay SW registrado, esperando...')
        registration = await navigator.serviceWorker.ready
      }

      console.log('✅ Service Worker listo:', registration)
      console.log('✅ Service Worker listo y activo:', registration.scope)

      console.log('🔔 3. Verificando suscripcion existente...')
      let pushSubscription = await registration.pushManager.getSubscription()
      console.log('📌 Suscripcion existente:', !!pushSubscription)

      if (!pushSubscription) {
        console.log('🔔 Generando nueva suscripcion Push...')
        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey.trim())
        })
        console.log('✅ Nueva suscripcion generada')
      } else {
        console.log('⚠️ Suscripcion ya existe, reutilizando')
      }
      
      console.log('🔔 4. Enviando suscripcion al backend...')
      const subscribeRes = await api.post('/PushNotifications/subscribe', pushSubscription.toJSON())
      
      console.log('📡 Response status:', subscribeRes.status)
      console.log('📡 Response body:', subscribeRes.data)
      
      console.log('✅ Suscripcion enviada correctamente al backend')

      setLoading(false)
      return true
    } catch (error) {
      console.error('❌ Error al suscribirse a notificaciones:', error)
      setLoading(false)
      return false
    }
  }

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        const unsubscribeRes = await api.post('/PushNotifications/unsubscribe', subscription.toJSON())
        
        console.log('📡 Response status:', unsubscribeRes.status)
        console.log('📡 Response body:', unsubscribeRes.data)

        await subscription.unsubscribe()
        console.log('✅ Desuscrito correctamente')
        return true
      }

      return false
    } catch (error) {
      console.error('Error al desuscribirse:', error)
      return false
    }
  }

  return {
    isSupported,
    permission,
    loading,
    requestPermissionAndSubscribe,
    unsubscribe
  }
}