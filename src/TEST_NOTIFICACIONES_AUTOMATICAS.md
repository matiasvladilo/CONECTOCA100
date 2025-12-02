# 🔔 TEST DE NOTIFICACIONES AUTOMÁTICAS

## ⚠️ IMPORTANTE: Debes activar el audio primero

Las notificaciones automáticas **SOLO funcionarán** si primero haces clic en el botón "ACTIVAR AUDIO".

---

## ✅ PASO A PASO COMPLETO

### PASO 1: Consola
Presiona **F12** y ve a la pestaña **Console**

---

### PASO 2: Login en Producción

Abre tu aplicación e inicia sesión como producción:

```
Email: produccion@demo.com
Password: demo123
```

---

### PASO 3: **ACTIVAR AUDIO (MUY IMPORTANTE)**

Verás un **botón naranja gigante** en la parte inferior:

```
🔔 ¡IMPORTANTE!
Activa el audio para escuchar cuando lleguen pedidos nuevos

[🔊 ACTIVAR AUDIO AHORA]
```

**HAZ CLIC EN ESE BOTÓN**

Deberías:
- **ESCUCHAR:** 3 beeps inmediatamente
- **VER:** El botón se vuelve verde y dice "✅ ¡Audio Activado!"

Si NO escuchaste los 3 beeps, revisa el volumen de tu dispositivo.

---

### PASO 4: Crear un Pedido Nuevo

**Opción A: Desde otra ventana**

1. **Abre una nueva ventana en modo incógnito** (Ctrl+Shift+N en Chrome)
2. Ve a tu aplicación
3. Inicia sesión como usuario normal:
   ```
   Email: usuario@demo.com
   Password: demo123
   ```
4. Haz clic en **"Nuevo Pedido"**
5. Llena el formulario y **crea el pedido**

**Opción B: Desde otra cuenta**

1. Abre en tu celular o en otro navegador
2. Inicia sesión como `usuario@demo.com` / `demo123`
3. Crea un pedido

---

### PASO 5: Verificar que Funciona

**En la ventana de producción deberías:**

#### 1️⃣ ESCUCHAR:
- **3 beeps** automáticamente (800Hz → 1000Hz → 800Hz)

#### 2️⃣ VER en consola:
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
[NOTIF] ✅ Sonido reproducido exitosamente
```

#### 3️⃣ VER en pantalla:
- Toast verde: **"🎉 1 nuevo pedido recibido"**
- El pedido aparece en la lista de producción

---

## 🆘 TROUBLESHOOTING

### ❌ NO ESCUCHO EL SONIDO AUTOMÁTICO

#### Pregunta 1: ¿Hiciste clic en "ACTIVAR AUDIO"?
- **SÍ** → Continúa a la siguiente pregunta
- **NO** → ¡Debes hacer clic primero! El audio no funcionará sin interacción del usuario

#### Pregunta 2: ¿Escuchaste los 3 beeps al hacer clic en "ACTIVAR AUDIO"?
- **SÍ** → El audio funciona. Continúa a la siguiente pregunta
- **NO** → Revisa el volumen de tu dispositivo. Prueba reproducir un video de YouTube

#### Pregunta 3: ¿Ves este mensaje en la consola cuando llega el pedido?
```
[NOTIF] ⚠️ Audio no inicializado - El usuario debe hacer clic en "ACTIVAR AUDIO"
```
- **SÍ** → El sistema no detectó que activaste el audio. Cierra sesión y vuelve a intentar
- **NO** → Continúa a la siguiente pregunta

#### Pregunta 4: ¿Ves algún error rojo en la consola cuando llega el pedido?
- **SÍ** → Copia TODO el error y compártelo
- **NO** → Verifica que la ventana de producción esté activa (no en segundo plano)

---

## 🧪 CHECKLIST COMPLETO

Antes de reportar que no funciona, verifica:

- [ ] Volumen del dispositivo alto (>50%)
- [ ] Consola abierta (F12) en la ventana de producción
- [ ] Login como `produccion@demo.com`
- [ ] **Hice clic en "ACTIVAR AUDIO AHORA"**
- [ ] **Escuché los 3 beeps al activar el audio**
- [ ] Vi "✅ Audio Activado" en verde
- [ ] Creé un pedido desde otra ventana/usuario
- [ ] Esperé al menos 5 segundos (el polling se ejecuta cada 5 segundos)
- [ ] La ventana de producción está visible (no minimizada)
- [ ] No hay errores rojos en consola

---

## 📊 COMPORTAMIENTO ESPERADO

### Polling cada 5 segundos:
```
[POLLING] Checking for updates... { role: 'production' }
[NOTIF] Checking for new orders... { ... }
```

### Cuando detecta un nuevo pedido:
```
🔔 ¡NUEVO PEDIDO DETECTADO!
→ Intenta reproducir sonido
→ Verifica si audio fue inicializado
→ Si SÍ: reproduce 3 beeps
→ Si NO: muestra advertencia
```

---

## 🎯 RESUMEN

### ✅ Para que funcione necesitas:

1. **Iniciar sesión como producción o admin**
2. **HACER CLIC en "ACTIVAR AUDIO AHORA"** (botón naranja)
3. **ESCUCHAR los 3 beeps** cuando activas el audio
4. Crear un pedido desde otra cuenta/ventana
5. Esperar máximo 5 segundos

### ❌ NO funcionará si:

- No hiciste clic en "ACTIVAR AUDIO"
- El volumen está en 0 o silenciado
- El navegador está bloqueando el audio
- La ventana está en segundo plano (en algunos navegadores)

---

## 💡 NOTA TÉCNICA

Los navegadores **NO permiten** reproducir audio automáticamente sin que el usuario haya interactuado primero con la página. Por eso:

1. **Debes hacer clic en "ACTIVAR AUDIO"** → Esto da permiso al navegador
2. Solo entonces el sistema podrá reproducir sonidos automáticamente

Esta es una restricción de seguridad de los navegadores modernos, no un bug.

---

## 📞 SI NECESITAS AYUDA

Proporciona esta información:

1. **¿Hiciste clic en "ACTIVAR AUDIO"?** (SÍ/NO)
2. **¿Escuchaste los 3 beeps al activar?** (SÍ/NO)
3. **Navegador:** (Chrome, Firefox, Safari, etc.)
4. **Sistema operativo:** (Windows, Mac, Linux, etc.)
5. **Logs de consola:** Copia TODO lo que dice `[NOTIF]` y `[SOUND]` cuando llega el pedido
6. **¿Hay errores rojos?** Si sí, cópialos todos

---

**¡PRUEBA AHORA!** 🎵
