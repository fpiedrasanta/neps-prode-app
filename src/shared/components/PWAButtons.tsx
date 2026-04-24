import { usePushNotifications } from '../hooks/usePushNotifications'

export const PWAButtons = () => {
  const { isSupported, permission, loading, requestPermissionAndSubscribe } = usePushNotifications()

  // 🔧 DEBUG: Ver valores en consola
  console.log('🔔 PWAButtons Debug:', {
    isSupported,
    permission,
    loading,
    showNotifications: isSupported && permission === 'default'
  })

  // ✅ MOSTRAR BOTON SOLAMENTE SI EL USUARIO AUN NO TOMO NINGUNA DECISION
  const showNotificationsButton = isSupported && permission === 'default'

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