import { usePushNotifications } from '../hooks/usePushNotifications'

export const PWAButtons = () => {
  const { 
    isSupported, 
    permission, 
    loading, 
    hasLocalSubscription, 
    isSubscribedInBackend, 
    error,
    requestPermission,
    subscribe
  } = usePushNotifications()

  const handleEnableNotifications = async () => {
    // ✅ Solo pedir permiso si aun no lo tenemos
    if (permission !== 'granted') {
      const permissionGranted = await requestPermission()
      if (!permissionGranted) return
    }

    // ✅ Siempre ejecutar subscribe: se encarga solo de arreglar el estado
    await subscribe()
  }

  // 🔧 DEBUG: Ver valores en consola
  console.log('🔔 PWAButtons Debug:', {
    isSupported,
    permission,
    loading,
    hasLocalSubscription,
    isSubscribedInBackend
  })

  // ✅ MOSTRAR BOTON SI:
  // - El navegador soporta notificaciones
  // - El permiso NO esta denegado
  // - NO tiene suscripcion local O NO esta registrado en backend
  // ✅ REGLA DE ORO: El estado local manda para ESTE dispositivo
  const showNotificationsButton = isSupported 
    && permission !== 'denied' 
    && (!hasLocalSubscription || !isSubscribedInBackend)

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      
      {showNotificationsButton && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button 
            onClick={handleEnableNotifications}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '⏳ Procesando...' : '🔔 Activar Notificaciones'}
          </button>

          {error && (
            <span style={{ 
              color: '#d32f2f', 
              fontSize: '12px',
              padding: '0 4px'
            }}>
              ⚠️ {error}
            </span>
          )}
        </div>
      )}

    </div>
  )
}