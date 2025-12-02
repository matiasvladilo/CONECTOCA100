/**
 * Notification Sound Utility - VERSIÓN CON WEB AUDIO API SIMPLIFICADA
 * Genera sonidos programáticamente para máxima compatibilidad
 */

let audioContext: AudioContext | null = null;
let isAudioReady = false;

/**
 * Check if sound notifications are enabled
 */
const isSoundEnabled = (): boolean => {
  try {
    const saved = localStorage.getItem('soundNotifications');
    return saved !== null ? JSON.parse(saved) : true;
  } catch {
    return true;
  }
};

/**
 * Check if browser notifications are enabled
 */
const isBrowserNotificationEnabled = (): boolean => {
  try {
    const saved = localStorage.getItem('browserNotifications');
    return saved !== null ? JSON.parse(saved) : true;
  } catch {
    return true;
  }
};

/**
 * Get or create audio context
 */
const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('[AUDIO] Audio context created, state:', audioContext.state);
  }
  return audioContext;
};

/**
 * Play a single beep tone
 */
const playBeep = async (frequency: number, duration: number, volume: number = 0.3): Promise<void> => {
  const ctx = getAudioContext();
  
  // Resume context if suspended
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
  
  // Wait for the beep to finish
  return new Promise(resolve => {
    setTimeout(resolve, duration * 1000);
  });
};

/**
 * Initialize audio - MUST be called after user interaction
 */
export const initializeAudio = async (): Promise<boolean> => {
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: blue; font-weight: bold');
  console.log('%c[AUDIO] 🎬 INICIALIZANDO AUDIO...', 'background: blue; color: white; font-size: 16px; font-weight: bold; padding: 5px');
  
  try {
    const ctx = getAudioContext();
    console.log('[AUDIO] Estado inicial del contexto:', ctx.state);
    
    // Resume if suspended
    if (ctx.state === 'suspended') {
      console.log('[AUDIO] Resumiendo contexto suspendido...');
      await ctx.resume();
      console.log('[AUDIO] Contexto resumido, nuevo estado:', ctx.state);
    }
    
    // Play a very quiet beep to unlock audio
    console.log('[AUDIO] Reproduciendo beep silencioso para desbloquear...');
    await playBeep(440, 0.05, 0.001);
    
    isAudioReady = true;
    console.log('%c[AUDIO] ✅✅✅ AUDIO LISTO Y FUNCIONANDO ✅✅✅', 'background: green; color: white; font-size: 18px; font-weight: bold; padding: 10px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: green; font-weight: bold');
    return true;
  } catch (error) {
    console.error('%c[AUDIO] ❌ ERROR AL INICIALIZAR:', 'background: red; color: white; font-weight: bold; padding: 5px', error);
    return false;
  }
};

/**
 * Play notification sound - GENERATES BEEPS PROGRAMMATICALLY
 */
export const playNotificationSound = async (type: 'new_order' | 'order_update' | 'success' | 'error' = 'new_order'): Promise<void> => {
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: orange; font-weight: bold');
  console.log('%c[SOUND] 🔊 REPRODUCIENDO SONIDO...', 'background: orange; color: white; font-size: 18px; font-weight: bold; padding: 10px');
  console.log('[SOUND] Tipo:', type);
  
  // Check if sound is enabled
  const soundEnabled = isSoundEnabled();
  console.log('[SOUND] Sonido habilitado:', soundEnabled);
  
  if (!soundEnabled) {
    console.log('%c[SOUND] ⚠️ Sonido deshabilitado por usuario', 'color: orange; font-weight: bold');
    return;
  }

  try {
    const ctx = getAudioContext();
    
    // Resume context if needed
    if (ctx.state === 'suspended') {
      console.log('[SOUND] Contexto suspendido, resumiendo...');
      await ctx.resume();
      console.log('[SOUND] Contexto resumido, estado:', ctx.state);
    }
    
    if (ctx.state !== 'running') {
      console.error('%c[SOUND] ⚠️ Contexto no está corriendo, estado:', 'color: orange; font-weight: bold', ctx.state);
      console.log('[SOUND] Intentando inicializar audio...');
      await initializeAudio();
    }

    console.log('[SOUND] Estado del contexto:', ctx.state);

    // Play different patterns based on type
    switch (type) {
      case 'new_order':
        // Triple beep for new orders (very noticeable)
        console.log('[SOUND] 🎵 Reproduciendo patrón: NUEVO PEDIDO (3 beeps)');
        await playBeep(800, 0.15, 0.4);
        await new Promise(resolve => setTimeout(resolve, 100));
        await playBeep(1000, 0.15, 0.4);
        await new Promise(resolve => setTimeout(resolve, 100));
        await playBeep(800, 0.2, 0.4);
        break;

      case 'order_update':
        // Single beep
        console.log('[SOUND] 🎵 Reproduciendo patrón: ACTUALIZACIÓN (1 beep)');
        await playBeep(600, 0.3, 0.3);
        break;

      case 'success':
        // Ascending tones
        console.log('[SOUND] 🎵 Reproduciendo patrón: ÉXITO (ascendente)');
        await playBeep(500, 0.08, 0.3);
        await playBeep(650, 0.08, 0.3);
        await playBeep(800, 0.15, 0.3);
        break;

      case 'error':
        // Low pitch warning
        console.log('[SOUND] 🎵 Reproduciendo patrón: ERROR (grave)');
        await playBeep(300, 0.4, 0.35);
        break;
    }
    
    console.log('%c[SOUND] ✅✅✅ SONIDO REPRODUCIDO CON ÉXITO ✅✅✅', 'background: green; color: white; font-size: 18px; font-weight: bold; padding: 10px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: green; font-weight: bold');
  } catch (error) {
    console.error('%c[SOUND] ❌ ERROR AL REPRODUCIR:', 'background: red; color: white; font-weight: bold; padding: 5px', error);
    console.log('[SOUND] Detalles del error:', {
      name: (error as Error).name,
      message: (error as Error).message,
      contextState: audioContext?.state
    });
  }
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('[BROWSER_NOTIF] Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Show browser notification
 */
export const showBrowserNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<Notification | null> => {
  console.log('[BROWSER_NOTIF] Mostrando notificación:', title);
  
  // Check if browser notifications are enabled
  const browserNotifEnabled = isBrowserNotificationEnabled();
  
  if (!browserNotifEnabled) {
    console.log('[BROWSER_NOTIF] Notificaciones del navegador deshabilitadas');
    return null;
  }

  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    try {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [200, 100, 200],
        ...options,
      });

      console.log('[BROWSER_NOTIF] ✓ Notificación mostrada');

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (error) {
      console.error('[BROWSER_NOTIF] Error mostrando notificación:', error);
    }
  }
  
  return null;
};

/**
 * Show notification for new order
 */
export const notifyNewOrder = async (orderNumber: string, customerName: string): Promise<void> => {
  console.log('[NOTIFY] Notificando nuevo pedido:', orderNumber, customerName);
  
  await showBrowserNotification('🎉 ¡Nuevo Pedido!', {
    body: `Pedido #${orderNumber} de ${customerName}`,
    tag: `order-${orderNumber}`,
    requireInteraction: false,
  });
};

/**
 * Show notification for order update
 */
export const notifyOrderUpdate = async (orderNumber: string, status: string): Promise<void> => {
  console.log('[NOTIFY] Notificando actualización:', orderNumber, status);
  
  await showBrowserNotification('📦 Pedido Actualizado', {
    body: `Pedido #${orderNumber} - ${status}`,
    tag: `order-update-${orderNumber}`,
    requireInteraction: false,
  });
};
