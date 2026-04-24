import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Valor inicial calculado una única vez al montar el hook
const getInitialInstalledState = () => window.matchMedia('(display-mode: standalone)').matches;

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(!getInitialInstalledState());
  const [isInstalled, setIsInstalled] = useState(getInitialInstalledState());

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    try {
      // Fix para Brave Browser: verificar que el método prompt existe
      if (typeof deferredPrompt.prompt !== 'function') return;
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } catch (error) {
      // Fallback silencioso para navegadores que no soportan correctamente el evento
      console.debug('PWA install prompt error:', error);
    }
  };

  return {
    isInstallable,
    isInstalled,
    install
  };
}