# 🔊 INSTRUCCIONES SIMPLES - AUDIO NOTIFICACIONES

## Para usuarios: jeje (producción) y jojo (admin)

---

## 🚀 INICIO RÁPIDO (3 pasos)

### 1️⃣ Limpia la caché
Abre consola (F12) y ejecuta:
```javascript
sessionStorage.clear();
location.reload();
```

### 2️⃣ Inicia sesión y activa audio
- Login con jeje o jojo
- Espera 2 segundos
- **Haz clic en el botón naranja gigante** que aparece
- **Debes escuchar 3 beeps inmediatamente**

### 3️⃣ Prueba con un pedido
- Abre modo incógnito
- Login con otro usuario
- Crea un pedido
- **Deberías escuchar 3 beeps en la ventana original**

---

## ✅ SI FUNCIONA

Verás esto en consola cuando llega un pedido:
```
🔔 ¡NUEVO PEDIDO DETECTADO!
[NOTIF] Audio ya inicializado, reproduciendo...
[SOUND] ✅✅✅ SONIDO REPRODUCIDO CON ÉXITO ✅✅✅
```

---

## ❌ SI NO FUNCIONA

Lee el archivo **`TEST_JEJE_JOJO.md`** para troubleshooting detallado.

**Causas comunes:**
- No hiciste clic en "ACTIVAR AUDIO"
- El volumen está en 0
- El usuario no tiene rol de producción/admin
- No esperaste los 5 segundos del polling

---

## 📞 ¿NECESITAS AYUDA?

Ejecuta esto en consola y envía el resultado:

```javascript
console.log('=== DEBUG INFO ===');
console.log('Usuario:', JSON.parse(sessionStorage.getItem('currentUser')));
console.log('Audio inicializado:', sessionStorage.getItem('audio-initialized'));
console.log('Contexto de audio:', new AudioContext().state);
```

---

**Lee `TEST_JEJE_JOJO.md` para guía completa paso a paso** 📖
