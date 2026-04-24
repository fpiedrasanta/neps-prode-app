import { usePushNotifications } from '../hooks/usePushNotifications'

export const PWAButtons = () => {
  const { isSupported, permission, subscription, requestPermission, subscribe } = usePushNotifications()

  // 🔧 DEBUG: Ver valores en consola
  console.log('🔔 PWAButtons Debug:', {
    isSupported,
    permission,
    subscription,
    showNotifications: isSupported && !subscription
  })

  const handleNotifications = async () => {
    const granted = await requestPermission()
    if (granted) {
      // ✅ ESPERAMOS 150ms para que el Service Worker se actualice luego del permiso
      setTimeout(async () => {
        const subscription = await subscribe()
        if (subscription) {
          console.log('✅ Usuario suscripto a notificaciones y enviado al backend:', subscription)
        }
      }, 150)
    }
  }

  // ✅ MOSTRAR BOTON SI: Aun no intentamos suscribirnos, aun sin permiso
  const showNotificationsButton = isSupported && !subscription

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      
      {showNotificationsButton && (
        <button 
          onClick={handleNotifications}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          🔔 Activar Notificaciones
        </button>
      )}

    </div>
  )
}