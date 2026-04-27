import { useState, useEffect, useCallback } from 'react'
import { api } from '@/core/api/axios'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

interface PushState {
  permission: NotificationPermission
  hasLocalSubscription: boolean
  isSubscribedInBackend: boolean
  loading: boolean
  initializing: boolean
  error: string | null
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>({
    permission: 'default',
    hasLocalSubscription: false,
    isSubscribedInBackend: false,
    loading: false,
    initializing: true,
    error: null
  })

  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window

  /**
   * Inicializa el estado completo de las notificaciones push
   * Sigue la regla de oro:
   * "El estado local determina este dispositivo.
   * El backend solo valida si ese endpoint ya está registrado."
   */
  const init = useCallback(async () => {
    if (!isSupported) {
      setState(prev => ({ ...prev, initializing: false }))
      return
    }

    try {
      const permission = Notification.permission
      
      const registration = await navigator.serviceWorker.ready
      const localSubscription = await registration.pushManager.getSubscription()

      if (!localSubscription) {
        setState({
          permission,
          hasLocalSubscription: false,
          isSubscribedInBackend: false,
          loading: false,
          initializing: false,
          error: null
        })
        return
      }

      // Consultar estado en backend
      const encodedEndpoint = encodeURIComponent(localSubscription.endpoint)
      const statusRes = await api.get(`/PushNotifications/status-by-endpoint?endpoint=${encodedEndpoint}`)
      
      console.log('📡 Status backend response:', statusRes.data)

      setState({
        permission,
        hasLocalSubscription: true,
        isSubscribedInBackend: statusRes.data.isSubscribed,
        loading: false,
        initializing: false,
        error: null
      })

    } catch (error) {
      console.error('❌ Error inicializando estado push:', error)
      setState(prev => ({
        ...prev,
        initializing: false,
        isSubscribedInBackend: false,
        error: null
      }))
    }
  }, [isSupported])

  /**
   * Solicita permiso al usuario para enviar notificaciones
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await Notification.requestPermission()
      setState(prev => ({ ...prev, permission: result, loading: false }))

      return result === 'granted'
    } catch (error) {
      console.error('❌ Error solicitando permiso:', error)
      setState(prev => ({ ...prev, loading: false, error: 'No se pudo obtener permiso para notificaciones' }))
      return false
    }
  }, [isSupported])

  /**
   * Realiza el flujo completo de suscripción
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      console.log('🔔 1. Obteniendo clave publica del backend...')
      const publicKeyRes = await api.get('/PushNotifications/public-key')
      
      console.log('📡 Response status:', publicKeyRes.status)
      console.log('📡 Response body:', publicKeyRes.data)
      
      const publicKey = publicKeyRes.data.publicKey
      console.log('✅ Clave publica obtenida')
      
      console.log('🔑 Public key raw:', publicKey)
      console.log('🔑 Uint8Array:', urlBase64ToUint8Array(publicKey))

      console.log('🔔 2. Obteniendo Service Worker activo...')
      const registration = await navigator.serviceWorker.ready

      console.log('🔔 3. Verificando suscripcion existente...')
      let pushSubscription = await registration.pushManager.getSubscription()

      if (!pushSubscription) {
        console.log('🔔 Creando nueva suscripcion Push...')
        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey.trim())
        })
        console.log('✅ Nueva suscripcion generada')
      } else {
        console.log('♻️ Reutilizando suscripcion existente')
      }
      
      console.log('🔔 4. Enviando suscripcion al backend...')
      const subscribeRes = await api.post('/PushNotifications/subscribe', pushSubscription.toJSON())
      
      console.log('📡 Response status:', subscribeRes.status)
      console.log('📡 Response body:', subscribeRes.data)
      
      if (subscribeRes.status < 200 || subscribeRes.status >= 300) {
        throw new Error(`Backend respondió con código ${subscribeRes.status}`)
      }

      console.log('✅ Suscripcion enviada correctamente al backend')

      setState(prev => ({
        ...prev,
        hasLocalSubscription: true,
        isSubscribedInBackend: true,
        loading: false,
        error: null
      }))

      return true
    } catch (error) {
      console.error('❌ Error al suscribirse a notificaciones:', error)
      setState(prev => ({ ...prev, loading: false, error: 'No se pudo activar notificaciones. Revisá permisos del navegador.' }))
      return false
    }
  }, [isSupported])

  /**
   * Desuscribe completamente las notificaciones
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        const unsubscribeRes = await api.post('/PushNotifications/unsubscribe', subscription.toJSON())
        
        console.log('📡 Response status:', unsubscribeRes.status)
        console.log('📡 Response body:', unsubscribeRes.data)

        await subscription.unsubscribe()
        console.log('✅ Desuscrito correctamente')

        setState(prev => ({
          ...prev,
          hasLocalSubscription: false,
          isSubscribedInBackend: false,
          loading: false,
          error: null
        }))

        return true
      }

      setState(prev => ({ ...prev, loading: false }))
      return false
    } catch (error) {
      console.error('Error al desuscribirse:', error)
      setState(prev => ({ ...prev, loading: false, error: 'No se pudo desactivar notificaciones' }))
      return false
    }
  }, [isSupported])

  // Inicializar automáticamente al montar el hook
  useEffect(() => {
    if (isSupported) {
      // Ejecutar asincrónicamente fuera del ciclo de renderizado de React
      void (async () => {
        await init()
      })()
    }
  }, [init, isSupported])

  return {
    isSupported,
    ...state,
    init,
    requestPermission,
    subscribe,
    unsubscribe
  }
}