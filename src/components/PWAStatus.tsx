import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Smartphone, Wifi, WifiOff, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * PWAStatus Component
 * Shows PWA status indicators (for development/testing)
 * Remove this component in production or keep it for admin users only
 */
export function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistered, setSwRegistered] = useState(false);
  const [cacheSize, setCacheSize] = useState<number | null>(null);

  useEffect(() => {
    // Check if installed (standalone mode)
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const ios = (window.navigator as any).standalone === true;
      setIsInstalled(standalone || ios);
    };

    // Check service worker
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        setSwRegistered(!!registration);
      }
    };

    // Check cache size
    const checkCacheSize = async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          totalSize += keys.length;
        }
        
        setCacheSize(totalSize);
      }
    };

    checkInstalled();
    checkServiceWorker();
    checkCacheSize();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show in production unless explicitly enabled
  const showStatus = localStorage.getItem('show-pwa-status') === 'true' || 
                     process.env.NODE_ENV === 'development';

  if (!showStatus) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
    >
      {/* Installed Status */}
      <AnimatePresence>
        {isInstalled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Badge 
              variant="secondary" 
              className="bg-green-100 text-green-700 border-green-300 gap-1.5 pr-3"
            >
              <Smartphone className="w-3 h-3" />
              Instalada
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Worker Status */}
      {swRegistered && (
        <Badge 
          variant="secondary" 
          className="bg-blue-100 text-blue-700 border-blue-300 gap-1.5 pr-3"
        >
          <Download className="w-3 h-3" />
          SW Active
        </Badge>
      )}

      {/* Online/Offline Status */}
      <Badge 
        variant="secondary" 
        className={`gap-1.5 pr-3 ${
          isOnline 
            ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
            : 'bg-amber-100 text-amber-700 border-amber-300'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            Offline
          </>
        )}
      </Badge>

      {/* Cache Size */}
      {cacheSize !== null && (
        <Badge 
          variant="secondary" 
          className="bg-purple-100 text-purple-700 border-purple-300 pr-3"
        >
          Cache: {cacheSize} items
        </Badge>
      )}
    </motion.div>
  );
}

/**
 * Enable PWA Status Display
 * Call this in console to enable the status badges:
 * window.enablePWAStatus()
 */
if (typeof window !== 'undefined') {
  (window as any).enablePWAStatus = () => {
    localStorage.setItem('show-pwa-status', 'true');
    window.location.reload();
  };

  (window as any).disablePWAStatus = () => {
    localStorage.removeItem('show-pwa-status');
    window.location.reload();
  };
}
