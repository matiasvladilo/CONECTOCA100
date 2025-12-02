# 🐛 Debug de Notificaciones Sonoras

## 🔍 Cambios Realizados

Se ha mejorado el sistema de notificaciones con logs detallados para debugging.

## 📝 Logs Agregados

### 1. En `/App.tsx`:
- `[POLLING]` - Verifica que el polling se ejecute cada 5 segundos
- `[NOTIF]` - Muestra información sobre la detección de pedidos nuevos
- `🔔 NUEVO PEDIDO DETECTADO` - Confirma que se detectó un pedido nuevo

### 2. En `/utils/notificationSound.ts`:
- `[SOUND]` - Estado del audio
- `[BROWSER_NOTIF]` - Estado de notificaciones del navegador
- `[NOTIFY]` - Llamadas a funciones de notificación

## 🧪 Cómo Probar

### Paso 1: Abrir la Consola
1. Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Option+I` (Mac)
2. Ve a la pestaña "Console"

### Paso 2: Iniciar Sesión como Producción
```
Email: produccion@demo.com
Password: demo123
```

### Paso 3: Verificar Logs de Polling
Deberías ver cada 5 segundos:
```
[POLLING] Checking for updates... { role: "production" }
[NOTIF] Checking for new orders... {
  isBackgroundRefresh: true,
  userRole: "production",
  oldOrdersCount: X,
  newOrdersCount: X
}
```

### Paso 4: Crear un Pedido Nuevo
1. Abre otra ventana/pestaña en modo incógnito
2. Inicia sesión como usuario regular: `usuario@demo.com` / `demo123`
3. Crea un pedido nuevo

### Paso 5: Verificar en Producción
En la ventana de producción, deberías ver:
```
🔔 NUEVO PEDIDO DETECTADO: 1 pedido(s) nuevo(s)
[NOTIF] Playing notification sound...
[SOUND] playNotificationSound called { type: "new_order", soundEnabled: true }
[SOUND] Audio context state: running
[NOTIF] ✓ Sound played
[NOTIF] Showing browser notification...
[NOTIFY] notifyNewOrder called { orderNumber: "...", customerName: "..." }
[BROWSER_NOTIF] showBrowserNotification called...
[BROWSER_NOTIF] ✓ Notification shown successfully
```

## 🔧 Troubleshooting

### ❌ No se detecta el pedido nuevo
**Logs esperados:**
```
[NOTIF] Checking for new orders... {
  isBackgroundRefresh: true,
  userRole: "production",
  oldOrdersCount: 2,
  newOrdersCount: 3  ← Debe aumentar!
}
```

**Posibles causas:**
- El polling no está funcionando
- El usuario no está autenticado
- No es usuario de producción/admin

### ❌ No suena la notificación
**Logs esperados:**
```
[SOUND] playNotificationSound called { type: "new_order", soundEnabled: false }
[SOUND] Sound notifications disabled by user
```

**Solución:**
1. Ve a Perfil de Usuario
2. Activa "Notificaciones sonoras"
3. Prueba con el botón "Probar notificaciones"

### ❌ No aparece notificación del navegador
**Logs esperados:**
```
[BROWSER_NOTIF] Permission status: false
```

**Solución:**
1. Ve a Perfil de Usuario
2. Activa "Notificaciones del navegador"
3. Acepta el permiso cuando el navegador lo solicite
4. Recarga la página si es necesario

### ❌ Audio context suspended
**Logs esperados:**
```
[SOUND] Audio context state: suspended
```

**Causa:**
Los navegadores modernos suspenden el audio hasta que haya interacción del usuario.

**Solución:**
1. Haz clic en cualquier parte de la página
2. El audio context se activará automáticamente
3. O prueba con el botón "Probar notificaciones"

## 📊 Verificar Preferencias

### Ver localStorage:
Abre la consola y ejecuta:
```javascript
console.log({
  soundNotifications: localStorage.getItem('soundNotifications'),
  browserNotifications: localStorage.getItem('browserNotifications')
});
```

Deberías ver:
```javascript
{
  soundNotifications: "true",
  browserNotifications: "true"
}
```

### Resetear Preferencias:
Si las notificaciones no funcionan, prueba resetear:
```javascript
localStorage.setItem('soundNotifications', 'true');
localStorage.setItem('browserNotifications', 'true');
location.reload();
```

## ✅ Checklist de Verificación

- [ ] Iniciado sesión como producción/admin
- [ ] Consola abierta con logs visibles
- [ ] Polling ejecutándose cada 5 segundos
- [ ] Notificaciones sonoras activadas en perfil
- [ ] Notificaciones del navegador activadas
- [ ] Permiso de notificaciones concedido
- [ ] Audio context en estado "running"
- [ ] Botón de prueba funciona correctamente

## 🎯 Logs Importantes

### ✅ TODO FUNCIONA:
```
[POLLING] Checking for updates... { role: "production" }
[NOTIF] Checking for new orders...
[NOTIF] New orders check: { newOrdersFound: 1, ... }
🔔 NUEVO PEDIDO DETECTADO: 1 pedido(s) nuevo(s)
[NOTIF] Playing notification sound...
[SOUND] playNotificationSound called { type: "new_order", soundEnabled: true }
[SOUND] Audio context state: running
[NOTIF] ✓ Sound played
[NOTIF] ✓ Browser notification shown
```

### ⚠️ Sonido desactivado:
```
[SOUND] Sound notifications disabled by user
```

### ⚠️ Notificación navegador desactivada:
```
[BROWSER_NOTIF] Browser notifications disabled by user
```

## 🚀 Próximo Paso

Si todo está configurado correctamente pero aún no funciona:

1. **Revisa los logs completos** en la consola
2. **Copia y pega los logs** que aparecen cuando creas un pedido
3. **Verifica** que el rol del usuario sea "production" o "admin"
4. **Confirma** que el pedido se creó en el mismo negocio (businessId)

## 💡 Tip

Para debugging rápido, usa el botón **"Probar notificaciones"** en el perfil. Si ese funciona, el problema está en la detección de pedidos nuevos, no en las notificaciones.
