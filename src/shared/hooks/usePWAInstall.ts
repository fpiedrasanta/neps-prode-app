import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Valor inicial calculado una única vez al montar el hook
const getInitialInstalledState = () => window.matchMedia('(display-mode: standalone)').matches;

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(getInitialInstalledState());

  useEffect(() => {
    const handler = (e: Event) => {
      console.log('✅ Evento beforeinstallprompt RECIBIDO correctamente');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    console.log('🔍 Registrando listener para beforeinstallprompt');
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async (event?: React.MouseEvent | Event) => {
    // Prevenir comportamiento por defecto y propagacion
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('🔧 PWA Install button clicked');
    console.log('📌 Deferred prompt exists:', !!deferredPrompt);

    if (!deferredPrompt) {
      console.warn('❌ No hay evento de instalacion guardado. El navegador no lo disparó.');
      console.log('💡 Posible causa: La app ya esta instalada, o el navegador no cumple los requisitos PWA.');
      return;
    }

    try {
      console.log('🚀 Abriendo prompt de instalacion...');

      // ✅ IMPORTANTE: En Chrome / Brave NO puede haber ningun await ANTES de llamar a .prompt()
      // El evento expira inmediatamente luego del gesto de usuario
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;
      console.log('✅ Usuario eligio:', outcome);

      if (outcome === 'accepted') {
        console.log('✅ App instalada correctamente');
        setDeferredPrompt(null);
        setIsInstallable(false);
      } else {
        console.log('⚠️ Usuario canceló la instalacion');
      }
    } catch (error) {
      console.error('❌ Error al mostrar prompt de instalacion:', error);
      console.log('ℹ️ Este error es normal en navegadores que no soportan completamente la API');
    }
  };

  return {
    isInstallable,
    isInstalled,
    install
  };
}