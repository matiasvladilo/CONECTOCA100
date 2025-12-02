# 🔍 DEBUG: SONIDO NO SUENA CON PEDIDOS NUEVOS

## ✅ LO QUE FUNCIONA
- ✓ Botón "ACTIVAR AUDIO" funciona
- ✓ Sonido de prueba funciona
- ✓ El sistema de audio está correctamente inicializado

## ❌ EL PROBLEMA
- ✗ Cuando llega un pedido nuevo NO suena

---

## 🧪 DIAGNÓSTICO EN TIEMPO REAL

### PASO 1: Verifica que estés en producción/admin

Ejecuta en consola:
```javascript
const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
console.log('👤 Usuario:', user.name);
console.log('🎭 Rol:', user.role);
console.log('✅ ¿Es producción o admin?', user.role === 'production' || user.role === 'admin');
```

**¿Es producción o admin?**
- SÍ → Continúa al PASO 2
- NO → El polling no detectará pedidos para este rol

---

### PASO 2: Verifica que el polling esté activo

**Espera 5 segundos** y busca en la consola:

```
[POLLING] Checking for updates... { role: 'production' }
```

**¿Ves ese mensaje cada 5 segundos?**
- SÍ → El polling funciona, continúa al PASO 3
- NO → El polling no está corriendo. Cierra sesión y vuelve a entrar

---

### PASO 3: Verifica el estado del audio

Ejecuta en consola:
```javascript
console.log('🔊 Audio inicializado:', sessionStorage.getItem('audio-initialized'));
console.log('🎵 Sonido habilitado:', localStorage.getItem('soundNotifications'));
```

Deberías ver:
```
🔊 Audio inicializado: true
🎵 Sonido habilitado: true (o null, que significa true)
```

**¿Ambos son true (o null)?**
- SÍ → Continúa al PASO 4
- NO → Ejecuta:
  ```javascript
  sessionStorage.setItem('audio-initialized', 'true');
  localStorage.setItem('soundNotifications', 'true');
  console.log('✓ Configuración corregida');
  ```

---

### PASO 4: Fuerza un pedido nuevo

Ahora vamos a crear un pedido y observar los logs.

**ANTES de crear el pedido:**

Ejecuta esto para monitorear:
```javascript
console.clear();
console.log('%c════════════════════════════════════════', 'color: blue; font-size: 16px; font-weight: bold');
console.log('%c🎯 MONITOREO ACTIVADO - Crea un pedido AHORA', 'background: blue; color: white; font-size: 18px; font-weight: bold; padding: 10px');
console.log('%c════════════════════════════════════════', 'color: blue; font-size: 16px; font-weight: bold');
```

**AHORA crea un pedido desde otra ventana/usuario**

---

### PASO 5: Analiza los logs

Después de crear el pedido, busca en la consola (en máximo 10 segundos):

#### ✅ ESCENARIO 1: Ves esto
```
[POLLING] Checking for updates... { role: 'production' }
[NOTIF] Checking for new orders...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 ¡NUEVO PEDIDO DETECTADO!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[NOTIF] 🔊 Intentando reproducir sonido automáticamente...
[NOTIF] ¿Audio inicializado por usuario? true
[NOTIF] ✅ Audio inicializado detectado, reproduciendo...
[NOTIF] Llamando a playNotificationSound...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SOUND] 🔊 REPRODUCIENDO SONIDO...
[SOUND] 🎵 Reproduciendo patrón: NUEVO PEDIDO (3 beeps)
[SOUND] ✅✅✅ SONIDO REPRODUCIDO CON ÉXITO ✅✅✅
```

**✓ PERFECTO - El sistema está funcionando correctamente**

Si ves TODOS estos mensajes pero NO escuchas el sonido:
→ Problema de hardware/volumen
→ Verifica altavoces/auriculares
→ Sube el volumen al 100%
→ Prueba reproducir un video de YouTube

---

#### ⚠️ ESCENARIO 2: Ves el mensaje de "NUEVO PEDIDO" pero NO los de [SOUND]

```
🔔 ¡NUEVO PEDIDO DETECTADO!
[NOTIF] 🔊 Intentando reproducir sonido automáticamente...
[NOTIF] ¿Audio inicializado por usuario? true
[NOTIF] ✅ Audio inicializado detectado, reproduciendo...
[NOTIF] Llamando a playNotificationSound...
```

Pero NO aparece:
```
[SOUND] 🔊 REPRODUCIENDO SONIDO...
```

**→ La función playNotificationSound NO se está ejecutando**

**SOLUCIÓN:** Ejecuta en consola:
```javascript
// Importar manualmente la función
import('./utils/notificationSound.js').then(module => {
  console.log('Módulo cargado:', module);
  module.playNotificationSound('new_order').then(() => {
    console.log('✓ Sonido manual funcionó');
  });
});
```

---

#### ⚠️ ESCENARIO 3: Ves un ERROR rojo

```
[NOTIF] ❌❌❌ ERROR AL REPRODUCIR SONIDO:
```

**→ Hay una excepción**

Copia TODO el error y:
1. ¿Qué dice el mensaje de error?
2. ¿Dice "suspended"?
3. ¿Dice "not allowed"?

---

#### ❌ ESCENARIO 4: NO ves el mensaje de "NUEVO PEDIDO DETECTADO"

**El polling NO está detectando el pedido nuevo**

Verifica:
```javascript
// Cuenta los pedidos actuales
console.log('📦 Pedidos actuales:', window.location.href.includes('production') ? 'N/A' : 'Verifica en la lista');
```

**Posibles causas:**
1. El pedido se creó en otro business (multi-tenant)
2. El filtro de órdenes lo está ocultando
3. El backend no devolvió el pedido

**SOLUCIÓN:** Ejecuta:
```javascript
// Fuerza una recarga de pedidos
location.reload();
```

---

#### ❌ ESCENARIO 5: NO ves NADA de [POLLING]

**El polling no está corriendo**

```javascript
// Verifica el usuario
const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
console.log('Usuario:', user);
console.log('Token:', sessionStorage.getItem('accessToken') ? 'Existe' : 'NO EXISTE');
```

Si no hay token:
→ Cierra sesión y vuelve a iniciar

---

## 🎯 PRUEBA MANUAL DIRECTA

Si ninguno de los pasos anteriores funciona, ejecuta esto en consola para probar directamente:

```javascript
// 1. Verificar módulo
console.log('═══ PRUEBA MANUAL DIRECTA ═══');

// 2. Importar y ejecutar
import('./utils/notificationSound.js').then(async (module) => {
  console.log('1. Módulo cargado:', module);
  
  console.log('2. Verificando audio context...');
  const ctx = new AudioContext();
  console.log('   Estado:', ctx.state);
  
  if (ctx.state === 'suspended') {
    console.log('3. Resumiendo...');
    await ctx.resume();
    console.log('   Nuevo estado:', ctx.state);
  }
  
  console.log('4. Reproduciendo sonido...');
  await module.playNotificationSound('new_order');
  
  console.log('5. ✓ Completado');
}).catch(err => {
  console.error('❌ Error:', err);
});
```

**¿Escuchaste el sonido?**
- SÍ → El problema está en la detección automática, no en el audio
- NO → El problema está en el sistema de audio

---

## 📋 REPORTE FINAL

Copia y pega los resultados de cada paso:

```
PASO 1 - Rol: _______
PASO 2 - Polling activo: SÍ / NO
PASO 3 - Audio inicializado: _______
PASO 4 - Pedido creado: SÍ / NO
PASO 5 - Escenario: 1 / 2 / 3 / 4 / 5
PRUEBA MANUAL - Funcionó: SÍ / NO
```

Y copia TODOS los logs que aparezcan con:
- [POLLING]
- [NOTIF]
- [SOUND]
- Cualquier error en rojo

---

**¡EJECUTA ESTOS PASOS AHORA!** 🔍
