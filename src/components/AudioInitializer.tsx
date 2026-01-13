import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { initializeAudio, playNotificationSound } from '../utils/notificationSound';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface AudioInitializerProps {
  userRole?: string;
}

export function AudioInitializer({ userRole }: AudioInitializerProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    console.log('%c[AUDIO_INIT] Componente montado', 'background: purple; color: white; font-weight: bold; padding: 5px');
    console.log('[AUDIO_INIT] Rol del usuario:', userRole);

    // Only show for dispatch users
    if (userRole === 'dispatch') {
      console.log('[AUDIO_INIT] ✓ Usuario tiene rol de despacho (encargado de recibir pedidos)');

      // Check if audio is already initialized
      const hasInteracted = sessionStorage.getItem('audio-initialized');
      console.log('[AUDIO_INIT] ¿Ya inicializado?', hasInteracted);

      if (!hasInteracted) {
        console.log('[AUDIO_INIT] Mostrando prompt en 1 segundo...');
        // Show prompt after 1 second
        const timer = setTimeout(() => {
          console.log('[AUDIO_INIT] ⭐ MOSTRANDO BOTÓN NARANJA');
          setShowPrompt(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        console.log('[AUDIO_INIT] Audio ya fue inicializado previamente');
      }
    } else {
      console.log('[AUDIO_INIT] ⚠️ Usuario no tiene rol de despacho:', userRole);
    }
  }, [userRole]);

  const handleEnableAudio = async () => {
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: blue; font-size: 14px; font-weight: bold');
    console.log('%c👆 USUARIO HIZO CLIC EN ACTIVAR AUDIO', 'background: blue; color: white; font-size: 20px; font-weight: bold; padding: 10px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: blue; font-size: 14px; font-weight: bold');

    const success = await initializeAudio();

    if (success) {
      setAudioReady(true);
      sessionStorage.setItem('audio-initialized', 'true');

      // Play a test sound immediately
      console.log('[AUDIO_INIT] Reproduciendo sonido de prueba...');
      await playNotificationSound('new_order');

      toast.success('🔊 ¡Audio activado! Escuchaste el sonido de prueba', {
        duration: 5000
      });
    } else {
      toast.error('No se pudo activar el audio. Revisa la consola.', {
        duration: 5000
      });
    }
  };

  const handleTestSound = async () => {
    console.log('%c[TEST] Usuario solicitó prueba de sonido', 'background: purple; color: white; font-weight: bold; padding: 5px');
    await playNotificationSound('new_order');
    toast.success('Sonido de prueba reproducido');
  };

  // Only show for dispatch users
  if (!showPrompt || userRole !== 'dispatch') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 100 }}
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-full px-4"
      >
        <motion.div
          animate={audioReady ? {} : {
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: audioReady ? 0 : Infinity,
          }}
          className={`
            ${audioReady
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500'
            }
            text-white p-6 rounded-3xl shadow-2xl
            border-4 border-white
          `}
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={audioReady ? {} : {
                scale: [1, 1.3, 1],
                rotate: [0, -15, 15, -15, 0]
              }}
              transition={{
                duration: 0.6,
                repeat: audioReady ? 0 : Infinity,
                repeatDelay: 0.5
              }}
              className="flex-shrink-0"
            >
              {audioReady ? (
                <Volume2 className="w-12 h-12" />
              ) : (
                <VolumeX className="w-12 h-12" />
              )}
            </motion.div>

            <div className="flex-1">
              {audioReady ? (
                <div>
                  <p className="font-black text-2xl mb-2">✅ ¡Audio Activado!</p>
                  <p className="text-base text-white/95 mb-3">
                    Las notificaciones sonarán cuando lleguen pedidos nuevos
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleTestSound}
                      className="bg-white text-green-600 hover:bg-green-50 font-bold"
                      size="sm"
                    >
                      🔊 Probar Sonido
                    </Button>
                    <Button
                      onClick={() => setShowPrompt(false)}
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      size="sm"
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-black text-2xl mb-2">🔔 ¡IMPORTANTE!</p>
                  <p className="text-lg text-white/95 mb-4 font-bold">
                    Activa el audio para escuchar cuando lleguen pedidos nuevos
                  </p>
                  <Button
                    onClick={handleEnableAudio}
                    className="bg-white text-orange-600 hover:bg-orange-50 font-black text-lg py-6 px-8 shadow-xl w-full"
                    size="lg"
                  >
                    🔊 ACTIVAR AUDIO AHORA
                  </Button>
                  <p className="text-xs text-white/80 mt-2 text-center">
                    Haz clic y escucharás un sonido de prueba
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}