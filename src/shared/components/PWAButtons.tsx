import { usePushNotifications } from '../hooks/usePushNotifications'

export const PWAButtons = () => {
  const { isSupported, permission, requestPermission, subscribe } = usePushNotifications()

  // 🔧 DEBUG: Ver valores en consola
  console.log('🔔 PWAButtons Debug:', {
    isSupported,
    permission,
    showNotifications: isSupported && permission === 'default'
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

  // ❌ OCULTAR SI: No soportado, o ya tiene permiso concedido/denegado
  const showNotificationsButton = isSupported && permission === 'default'

  // ❌ OCULTAR TODO SI NO HAY NADA QUE MOSTRAR
  if (!showNotificationsButton) return null

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