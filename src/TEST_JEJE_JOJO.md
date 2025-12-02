# 🎵 TEST AUDIO PARA JEJE Y JOJO

## IMPORTANTE: Lee TODOS los pasos

---

## ✅ PASO 1: Abre la Consola

**Windows/Linux:** `F12`  
**Mac:** `Cmd + Option + I`

Haz clic en la pestaña **"Console"**

---

## ✅ PASO 2: Limpia la caché (IMPORTANTE)

Copia y pega esto en la consola y presiona Enter:

```javascript
sessionStorage.clear();
localStorage.clear();
console.log('✓ Caché limpiada');
location.reload();
```

Esto recargará la página.

---

## ✅ PASO 3: Inicia sesión

Inicia sesión con **jeje** (producción) o **jojo** (admin)

---

## ✅ PASO 4: Verifica los logs

En la consola deberías ver inmediatamente:

```
[AUDIO_INIT] Componente montado
[AUDIO_INIT] Rol del usuario: production    (o 'admin')
[AUDIO_INIT] ✓ Usuario tiene rol válido para audio
[AUDIO_INIT] ¿Ya inicializado? null
[AUDIO_INIT] Mostrando prompt en 1 segundo...
```

### 🔍 ¿Qué ves?

#### ✅ Ves los mensajes:
- Continúa al PASO 5

#### ❌ NO ves los mensajes:
Copia y pega esto en la consola:

```javascript
const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
console.log('Usuario actual:', user);
console.log('Rol:', user.role);
```

**¿Qué rol muestra?**
- Si NO es `production` o `admin` → **PROBLEMA:** El usuario tiene rol incorrecto
- Si es `production` o `admin` → Cierra sesión y vuelve a entrar

---

## ✅ PASO 5: Espera el botón naranja

**Espera 2 segundos después del login**

Deberías ver en la consola:
```
[AUDIO_INIT] ⭐ MOSTRANDO BOTÓN NARANJA
```

Y en la pantalla aparecerá un **BOTÓN NARANJA GIGANTE** en la parte inferior:

```
🔔 ¡IMPORTANTE!
Activa el audio para escuchar cuando lleguen pedidos nuevos

[🔊 ACTIVAR AUDIO AHORA]
```

### 🔍 ¿Ves el botón?

#### ✅ SÍ, veo el botón:
- Continúa al PASO 6

#### ❌ NO veo el botón:

Verifica en la consola:

**¿Dice "MOSTRANDO BOTÓN NARANJA"?**
- SÍ → El botón debería estar visible. Busca en la parte inferior de la pantalla
- NO → El timer no se ejecutó. Refresca la página (F5)

---

## ✅ PASO 6: HAZ CLIC EN "ACTIVAR AUDIO AHORA"

**ASEGÚRATE DE QUE EL VOLUMEN DE TU DISPOSITIVO ESTÉ ALTO (>50%)**

Cuando hagas clic, deberías ver en la consola:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👆 USUARIO HIZO CLIC EN ACTIVAR AUDIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AUDIO] 🎬 INICIALIZANDO AUDIO...
[AUDIO] Audio context created, state: running
[AUDIO] Reproduciendo beep silencioso para desbloquear...
[AUDIO] ✅✅✅ AUDIO LISTO Y FUNCIONANDO ✅✅✅
[AUDIO_INIT] Reproduciendo sonido de prueba...
[SOUND] 🔊 REPRODUCIENDO SONIDO...
[SOUND] Estado del contexto: running
[SOUND] 🎵 Reproduciendo patrón: NUEVO PEDIDO (3 beeps)
[SOUND] ✅✅✅ SONIDO REPRODUCIDO CON ÉXITO ✅✅✅
```

### 🎧 ¿ESCUCHASTE 3 BEEPS?

#### ✅ SÍ, escuché los beeps:
**¡PERFECTO! EL AUDIO FUNCIONA ✅**

El botón debería cambiar a verde y decir:
```
✅ ¡Audio Activado!
Las notificaciones sonarán cuando lleguen pedidos nuevos
```

Continúa al PASO 7 para probar con un pedido real.

#### ❌ NO escuché nada:

**Verifica:**

1. **¿El volumen del sistema está alto?**
   - Windows: Verifica el ícono de volumen en la barra de tareas
   - Mac: Verifica el ícono de volumen en la barra de menú
   - Sube el volumen al menos al 50%

2. **¿Funciona el audio en general?**
   - Abre YouTube y reproduce un video
   - Si YouTube NO suena → Problema de hardware/drivers
   - Si YouTube SÍ suena → Continúa al punto 3

3. **¿Hay errores en la consola?**
   - Busca mensajes en ROJO
   - Si dice "Audio context state: suspended":
     ```javascript
     sessionStorage.removeItem('audio-initialized');
     location.reload();
     // Vuelve a hacer clic en "ACTIVAR AUDIO"
     ```

4. **¿Ves estos mensajes de éxito en la consola?**
   ```
   [AUDIO] ✅✅✅ AUDIO LISTO Y FUNCIONANDO ✅✅✅
   [SOUND] ✅✅✅ SONIDO REPRODUCIDO CON ÉXITO ✅✅✅
   ```
   - Si SÍ → El sonido se reprodujo, pero no lo escuchaste (problema de volumen/hardware)
   - Si NO → Hay un error. Copia TODOS los mensajes de [AUDIO] y [SOUND]

---

## ✅ PASO 7: Probar con un pedido real

Ahora vamos a probar que el audio suene automáticamente cuando llega un pedido.

### A) Mantén abierta la ventana actual (jeje/jojo)

**No cierres esta ventana**

### B) Abre una nueva ventana en modo incógnito

**Chrome:** `Ctrl + Shift + N` (Windows) o `Cmd + Shift + N` (Mac)  
**Firefox:** `Ctrl + Shift + P` (Windows) o `Cmd + Shift + P` (Mac)

### C) En la ventana incógnita:

1. Ve a tu aplicación
2. Inicia sesión con un usuario normal (NO jeje ni jojo)
3. Haz clic en **"Nuevo Pedido"**
4. Llena el formulario:
   - Selecciona un producto
   - Pon cantidad 1
   - Completa los demás campos
5. Haz clic en **"Crear Pedido"**

### D) Vuelve a la ventana de jeje/jojo

**En máximo 5 segundos deberías:**

#### 🎧 ESCUCHAR:
3 beeps automáticamente

#### 👀 VER en consola:
```
[POLLING] Checking for updates... { role: 'production' }
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 ¡NUEVO PEDIDO DETECTADO!
Cantidad de pedidos nuevos: 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[NOTIF] 🔊 Intentando reproducir sonido automáticamente...
[NOTIF] ¿Audio inicializado por usuario? true
[NOTIF] Audio ya inicializado, reproduciendo...
[SOUND] 🔊 REPRODUCIENDO SONIDO...
[SOUND] 🎵 Reproduciendo patrón: NUEVO PEDIDO (3 beeps)
[SOUND] ✅✅✅ SONIDO REPRODUCIDO CON ÉXITO ✅✅✅
```

#### 👀 VER en pantalla:
- Toast verde: **"🎉 1 nuevo pedido recibido"**
- El pedido aparece en la lista

---

## 🆘 SI EL PEDIDO NO SUENA

### Verifica en la consola:

#### ¿Dice "[NOTIF] ¿Audio inicializado por usuario? false"?

**SOLUCIÓN:**
```javascript
sessionStorage.setItem('audio-initialized', 'true');
console.log('✓ Audio marcado como inicializado');
```

Luego crea otro pedido de prueba.

#### ¿Dice "⚠️ Audio no inicializado - El usuario debe hacer clic en ACTIVAR AUDIO"?

**SOLUCIÓN:**
1. Cierra sesión
2. Ejecuta:
   ```javascript
   sessionStorage.clear();
   location.reload();
   ```
3. Vuelve a iniciar sesión
4. Haz clic en "ACTIVAR AUDIO AHORA"
5. Espera a escuchar los 3 beeps
6. Prueba de nuevo con un pedido

#### ¿NO aparece NADA de [NOTIF] o [POLLING]?

**El polling no está funcionando**

Verifica:
```javascript
const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
console.log('Usuario:', user);
console.log('Rol:', user.role);
```

Si el rol NO es `production` o `admin`, el polling podría no estar activo.

---

## 📋 CHECKLIST FINAL

- [ ] Limpié la caché (sessionStorage.clear())
- [ ] Consola abierta (F12)
- [ ] Login con jeje o jojo
- [ ] Vi mensajes de [AUDIO_INIT]
- [ ] Vi el botón naranja
- [ ] Hice clic en "ACTIVAR AUDIO AHORA"
- [ ] Escuché 3 beeps al activar
- [ ] Vi "✅ Audio Activado"
- [ ] Creé pedido desde otra ventana
- [ ] Escuché 3 beeps automáticos
- [ ] Vi el toast "🎉 1 nuevo pedido recibido"

---

## ✅ SI COMPLETASTE TODO EL CHECKLIST

**¡EL SISTEMA FUNCIONA PERFECTAMENTE! 🎉**

---

## ❌ SI NO FUNCIONA

**Copia y envía esta información:**

1. **Usuario:** jeje o jojo
2. **Navegador:** (Chrome 120, Firefox 115, etc.)
3. **Sistema:** (Windows 11, Mac OS 14, etc.)
4. **Volumen del sistema:** (50%, 100%, etc.)
5. **¿YouTube suena?** SÍ/NO
6. **¿Ves el botón naranja?** SÍ/NO
7. **¿Escuchaste los beeps al activar?** SÍ/NO
8. **¿Escuchaste los beeps con el pedido?** SÍ/NO
9. **Rol del usuario:**
   ```javascript
   // Ejecuta esto y copia el resultado
   JSON.parse(sessionStorage.getItem('currentUser')).role
   ```
10. **Logs completos:** Copia TODO lo que diga [AUDIO_INIT], [AUDIO], [SOUND], [NOTIF], [POLLING]

---

**¡COMIENZA LA PRUEBA AHORA!** 🎵
