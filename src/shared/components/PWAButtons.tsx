import { usePWAInstall } from '../hooks/usePWAInstall'
import { usePushNotifications } from '../hooks/usePushNotifications'

export const PWAButtons = () => {
  const { isInstallable, install } = usePWAInstall()
  const { isSupported, permission, requestPermission, subscribe } = usePushNotifications()

  // 🔧 DEBUG: Ver valores en consola
  console.log('🔔 PWAButtons Debug:', {
    isInstallable,
    isSupported,
    permission,
    showNotifications: isSupported && permission === 'default'
  })

  const handleNotifications = async () => {
    const granted = await requestPermission()
    if (granted) {
      const subscription = await subscribe()
      if (subscription) {
        // ✅ Enviar este objeto a tu backend para guardarlo en DB
        console.log('✅ Usuario suscripto a notificaciones:', subscription)
      }
    }
  }

  // ❌ OCULTAR SI: No soportado, o ya tiene permiso concedido/denegado
  const showNotificationsButton = isSupported && permission === 'default'

  // ❌ OCULTAR TODO SI NO HAY NADA QUE MOSTRAR
  if (!isInstallable && !showNotificationsButton) return null

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      
      {isInstallable && (
        <button 
          onClick={install}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          📲 Instalar App
        </button>
      )}

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