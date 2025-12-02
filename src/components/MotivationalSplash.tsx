import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MotivationalSplashProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'checkIn' | 'checkOut';
}

const checkInPhrases = [
  { text: '¡Buen comienzo de jornada!', color: 'from-amber-400 to-orange-500' },
  { text: '¡Éxito en tu día!', color: 'from-yellow-400 to-amber-500' },
  { text: '¡A dar lo mejor hoy!', color: 'from-blue-400 to-indigo-500' },
  { text: '¡Energía positiva para ti!', color: 'from-purple-400 to-pink-500' },
  { text: '¡Tu día será increíble!', color: 'from-green-400 to-emerald-500' },
  { text: '¡Listo para brillar!', color: 'from-yellow-300 to-orange-400' },
  { text: '¡Cada día es una oportunidad!', color: 'from-amber-500 to-yellow-600' },
  { text: '¡Vamos con todo!', color: 'from-cyan-400 to-blue-500' }
];

const checkOutPhrases = [
  { text: '¡Buen trabajo hoy!', color: 'from-pink-400 to-rose-500' },
  { text: '¡Descansa bien!', color: 'from-indigo-400 to-purple-500' },
  { text: '¡Misión cumplida!', color: 'from-green-400 to-teal-500' },
  { text: '¡Excelente esfuerzo!', color: 'from-blue-400 to-cyan-500' },
  { text: '¡Merecido descanso!', color: 'from-violet-400 to-purple-500' },
  { text: '¡Gracias por tu dedicación!', color: 'from-red-400 to-pink-500' },
  { text: '¡Un día productivo!', color: 'from-emerald-400 to-green-500' },
  { text: '¡Hasta mañana!', color: 'from-slate-400 to-indigo-500' }
];

export function MotivationalSplash({ isOpen, onClose, type }: MotivationalSplashProps) {
  const phrases = type === 'checkIn' ? checkInPhrases : checkOutPhrases;
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500); // 2.5 segundos

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4 
            }}
            className="relative max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card principal */}
            <div 
              className="relative overflow-hidden rounded-2xl shadow-2xl py-12 px-8 text-center"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '2px solid rgba(255, 255, 255, 0.8)'
              }}
            >
              {/* Mensaje motivacional - Solo texto */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                className="relative z-10 text-center px-8"
              >
                <motion.div
                  className="text-3xl"
                  style={{ fontWeight: 700 }}
                >
                  <span 
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${randomPhrase.color.includes('amber') ? '#f59e0b' : randomPhrase.color.includes('blue') ? '#3b82f6' : randomPhrase.color.includes('green') ? '#10b981' : randomPhrase.color.includes('purple') ? '#a855f7' : randomPhrase.color.includes('pink') ? '#ec4899' : randomPhrase.color.includes('indigo') ? '#6366f1' : '#f59e0b'}, ${randomPhrase.color.includes('amber') ? '#d97706' : randomPhrase.color.includes('blue') ? '#2563eb' : randomPhrase.color.includes('green') ? '#059669' : randomPhrase.color.includes('purple') ? '#9333ea' : randomPhrase.color.includes('pink') ? '#db2777' : randomPhrase.color.includes('indigo') ? '#4f46e5' : '#d97706'})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {randomPhrase.text}
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
