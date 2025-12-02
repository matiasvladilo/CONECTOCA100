import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show install banner after 5 seconds if not dismissed before
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = dismissed ? parseInt(dismissed) : 0;
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
        
        if (!dismissed || dismissedTime < threeDaysAgo) {
          setShowInstallBanner(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no prompt, show iOS instructions
      if (isIOS) {
        setShowIOSInstructions(true);
        return;
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallBanner(false);
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleDismissIOSInstructions = () => {
    setShowIOSInstructions(false);
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleDismissIOSInstructions}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-6 max-w-md bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold text-foreground">Instalar en iOS</h3>
                  </div>
                  <button
                    onClick={handleDismissIOSInstructions}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4 text-sm text-foreground">
                  <p>Para instalar CONECTOCA en tu iPhone o iPad:</p>
                  
                  <ol className="space-y-3 list-decimal list-inside">
                    <li>
                      Toca el botón <strong>Compartir</strong> 
                      <span className="inline-block mx-1 px-2 py-1 bg-blue-100 text-blue-600 rounded">
                        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                        </svg>
                      </span>
                      en la barra inferior
                    </li>
                    <li>
                      Desplázate y selecciona <strong>"Agregar a inicio"</strong>
                    </li>
                    <li>
                      Toca <strong>"Agregar"</strong> en la esquina superior derecha
                    </li>
                  </ol>

                  <p className="text-muted-foreground">
                    La app aparecerá en tu pantalla de inicio como cualquier otra aplicación.
                  </p>
                </div>

                <Button
                  onClick={handleDismissIOSInstructions}
                  className="w-full mt-6"
                >
                  Entendido
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-md"
          >
            <Card className="p-4 shadow-lg bg-gradient-to-r from-primary to-blue-700 text-white">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">
                    Instala CONECTOCA
                  </h3>
                  <p className="text-sm text-blue-100 mb-3">
                    {isIOS 
                      ? 'Accede más rápido desde tu pantalla de inicio'
                      : 'Instala la app para usarla sin conexión y con acceso rápido'
                    }
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleInstallClick}
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                    >
                      {isIOS ? 'Ver cómo' : 'Instalar'}
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      Ahora no
                    </Button>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
