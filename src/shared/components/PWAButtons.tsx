import { usePushNotifications } from '../hooks/usePushNotifications'

export const PWAButtons = () => {
  const { isSupported, permission, subscription, loading, requestPermissionAndSubscribe } = usePushNotifications()

  // 🔧 DEBUG: Ver valores en consola
  console.log('🔔 PWAButtons Debug:', {
    isSupported,
    permission,
    subscription,
    loading,
    showNotifications: isSupported && !subscription
  })

  // ✅ MOSTRAR BOTON SI: Aun no intentamos suscribirnos, aun sin permiso
  const showNotificationsButton = isSupported && !subscription

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      
      {showNotificationsButton && (
        <button 
          onClick={requestPermissionAndSubscribe}
          disabled={loading}
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