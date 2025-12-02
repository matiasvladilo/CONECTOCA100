# 🚀 Instalar PWA en Figma Make - Guía Paso a Paso

## 📱 Tu Situación en Figma Make

Tu aplicación ya está **corriendo automáticamente** en el preview de Figma Make.

---

## ⚡ PASO A PASO (5 minutos)

### PASO 1: Ver tu Aplicación (Ya está corriendo)

**En Figma Make:**

1. Deberías ver tu aplicación **CONECTOCA** en el panel de preview a la derecha
2. Si no la ves, busca el botón **"Preview"** o **"Open"** 
3. La URL será algo como: `https://[auto-generado].supabase.co`

**Cómo obtener la URL completa:**

**Opción A: Botón "Open in New Tab"**
- Busca un botón que diga "Open in new tab" o ícono ↗
- Click → Se abre en pestaña nueva
- Copia la URL de la barra de direcciones

**Opción B: Click derecho en preview**
- Click derecho en el preview
- "Abrir en pestaña nueva"
- Copia la URL

**Opción C: Ver en consola**
- En el preview, presiona F12
- En consola, pega:
  ```javascript
  console.log('URL:', window.location.href);
  ```
- Copia la URL que aparece

---

### PASO 2: Generar los Iconos (2 minutos)

**2.1. En la URL que copiaste, agrega al final:**

```
/icons/generate-icons.html
```

**Ejemplo:**
Si tu URL es: `https://abc123.supabase.co`
Abre: `https://abc123.supabase.co/icons/generate-icons.html`

**2.2. Se abrirá el generador de iconos**

Verás una página azul con el título:
```
🎨 Generador de Iconos CONECTOCA
```

**2.3. Click en el botón azul:**
```
🚀 Generar Todos los Iconos
```

**2.4. Verás 8 iconos generados automáticamente**

Cada uno tiene fondo azul con círculo amarillo y "CO"

**2.5. Guarda CADA icono:**

Para cada uno de los 8 iconos:
1. **Click derecho** en el icono
2. **"Guardar imagen como..."**
3. **Usa el nombre EXACTO** que aparece debajo:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png` ⭐ MUY IMPORTANTE
   - `icon-384x384.png`
   - `icon-512x512.png` ⭐ MUY IMPORTANTE

**2.6. Sube los iconos a Figma Make:**

**En Figma Make:**
1. Busca el panel de archivos (file tree a la izquierda)
2. Navega a `/public/icons/`
3. **Arrastra y suelta** los 8 archivos PNG en esa carpeta
4. O usa botón "Upload" si está disponible

**IMPORTANTE:** Los archivos DEBEN quedar en `/public/icons/` exactamente

---

### PASO 3: Verificar que Funciona (30 segundos)

**3.1. Vuelve a tu aplicación principal**

Abre la URL base (sin `/icons/generate-icons.html`)

**3.2. Abre la consola del navegador:**
```
Windows/Linux: F12
Mac: Cmd + Option + I
```

**3.3. Ve a la pestaña "Console"**

**3.4. Pega este código:**

```javascript
console.clear();
console.log('🔍 Verificando PWA CONECTOCA\n');

// Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('✅ Service Worker: ACTIVO');
  } else {
    console.log('⚠️  Service Worker: Registrando...');
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('✅ Registrado! Recarga la página (F5)'));
  }
});

// Manifest
fetch('/manifest.json')
  .then(r => r.json())
  .then(m => console.log('✅ Manifest:', m.name))
  .catch(() => console.log('❌ Manifest: Error'));

// Iconos principales
fetch('/icons/icon-192x192.png')
  .then(r => console.log(r.ok ? '✅ Iconos: Listos' : '❌ Iconos: Faltan'));

// HTTPS
console.log(location.protocol === 'https:' ? '✅ HTTPS: OK' : '⚠️  HTTP');

setTimeout(() => {
  console.log('\n🎯 Si ves ✅ en todo, puedes instalar!');
}, 1000);
```

**3.5. Presiona Enter**

**Resultado esperado:**
```
🔍 Verificando PWA CONECTOCA

✅ Service Worker: ACTIVO
✅ Manifest: CONECTOCA - Gestión de Pedidos y Asistencia
✅ Iconos: Listos
✅ HTTPS: OK

🎯 Si ves ✅ en todo, puedes instalar!
```

**Si Service Worker dice "Registrando":**
- Espera 5 segundos
- Presiona F5 (recargar página)
- Verifica de nuevo

---

### PASO 4: Instalar en tu Dispositivo (2 minutos)

Ahora tienes **DOS OPCIONES:**

---

#### OPCIÓN A: Instalar en tu Móvil 📱

**4A.1. Obtén la URL de tu app**

Copia la URL completa (la que usaste antes, sin el `/icons/generate-icons.html`)

**4A.2. Envíate la URL:**

**Métodos:**
- WhatsApp a ti mismo
- Email
- Telegram
- QR code (usa https://www.qr-code-generator.com/)

**4A.3. En tu móvil:**

**Android (Chrome):**
1. Abre el link que te enviaste
2. Espera 5 segundos → Aparecerá banner: "Instalar CONECTOCA"
3. Toca **"Instalar"**
4. ¡Listo!

**Si no aparece banner:**
- Menú **⋮** (3 puntos arriba)
- **"Instalar aplicación"** o **"Agregar a pantalla"**
- Confirmar

**iPhone (Safari - IMPORTANTE):**
1. Abre el link en **Safari** (no Chrome)
2. Toca botón **Compartir** (□↑)
3. Desplázate → **"Agregar a pantalla de inicio"**
4. **"Agregar"**
5. ¡Listo!

---

#### OPCIÓN B: Instalar en tu PC 💻

**4B.1. En la misma pestaña donde tienes la app abierta:**

**4B.2. Busca el ícono de instalación:**

En la **barra de direcciones** (donde está la URL), busca:
- Ícono **⊕** (más en círculo), o
- Ícono **📲** (teléfono con flecha)

Ubicación:
- Chrome: Extremo derecho de la barra de URL
- Edge: Extremo derecho de la barra de URL

**4B.3. Click en el ícono**

**4B.4. Click en "Instalar"**

**Resultado:**
- La app se abre en ventana separada
- Sin barra de navegador
- Aparece en tu barra de tareas
- Como app de escritorio

**Si no ves el ícono:**

**Método alternativo:**
1. Espera 5 segundos
2. Debería aparecer un banner abajo: "Instalar CONECTOCA"
3. Click **"Instalar"**

**O desde el menú:**
1. Menú Chrome **⋮** (3 puntos arriba derecha)
2. **"Guardar y compartir"** o **"More tools"**
3. **"Instalar CONECTOCA"**
4. **"Instalar"**

---

### PASO 5: Verificar Instalación (30 segundos)

**5.1. Abre la app desde el ícono instalado**

**Móvil:**
- Busca el ícono en tu pantalla de inicio
- Toca el ícono de CONECTOCA

**Desktop:**
- Busca CONECTOCA en:
  - Windows: Menú Inicio
  - Mac: Launchpad
  - O en tu barra de tareas/dock

**5.2. Debería abrir:**
- Pantalla completa (sin barra de navegador)
- Como app nativa

**5.3. Verificar modo instalado:**

Abre DevTools (F12) en la app instalada y pega:

```javascript
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ ¡Corriendo como PWA instalada!');
} else {
  console.log('⚠️  Aún en navegador');
}
```

Debería decir: `✅ ¡Corriendo como PWA instalada!`

**5.4. Prueba funcionalidad:**

```
✅ Login funciona
✅ Puedes crear pedidos
✅ Notificaciones aparecen
✅ Navegación fluida
```

---

## 🎉 ¡INSTALADO!

### ✅ Ahora tienes:

```
✅ App instalada en tu dispositivo
✅ Ícono en pantalla de inicio
✅ Funciona offline
✅ Notificaciones
✅ Como app nativa
✅ Updates automáticos
```

---

## 🐛 Solución de Problemas

### ❌ "No puedo subir los iconos a Figma Make"

**Solución:**

Figma Make maneja los archivos de forma especial. Si no puedes subir:

**Opción 1: Los iconos son opcionales inicialmente**
- La PWA funcionará sin iconos
- Usará un ícono genérico por defecto
- Puedes agregarlos después cuando hagas deploy

**Opción 2: Crear los archivos directamente en Figma Make**
- No es práctico para archivos binarios (PNG)
- Mejor esperar al deploy en producción

**Recomendación:**
- Continúa con la instalación
- Los iconos personalizados los agregas al hacer deploy

---

### ❌ "Service Worker no se registra"

**Pega en consola:**

```javascript
navigator.serviceWorker.register('/service-worker.js')
  .then(reg => {
    console.log('✅ Service Worker registrado!');
    console.log('Recarga la página (F5)');
  })
  .catch(err => console.log('❌ Error:', err));
```

Luego presiona **F5** para recargar.

---

### ❌ "No aparece el botón de instalar"

**Verifica:**

1. **Estás en HTTPS:**
   ```javascript
   console.log('Protocol:', location.protocol);
   // Debe decir: "Protocol: https:"
   ```

2. **Service Worker activo:**
   ```javascript
   navigator.serviceWorker.getRegistration()
     .then(r => console.log(r ? '✅ Activo' : '❌ No activo'));
   ```

3. **Manifest accesible:**
   ```javascript
   fetch('/manifest.json')
     .then(r => console.log(r.ok ? '✅ OK' : '❌ Error'));
   ```

Si todo es ✅ pero no aparece:
- Espera 10-15 segundos (a veces tarda)
- Usa método manual del menú

---

### ❌ "En iOS no funciona"

**Causas comunes:**

1. **No estás en Safari:**
   - Chrome iOS NO soporta PWA installation
   - DEBES usar Safari
   
2. **Solución:**
   - Copia la URL
   - Abre Safari
   - Pega la URL
   - Compartir → "Agregar a pantalla de inicio"

---

### ❌ "No encuentro la carpeta /public/icons/ en Figma Make"

**Pasos:**

1. En el panel de archivos (izquierda)
2. Expande `/public/`
3. Expande `/icons/`
4. Deberías ver solo `generate-icons.html`
5. Arrastra los PNG ahí

**Si no puedes subir archivos:**
- Es una limitación de Figma Make
- Continúa sin iconos por ahora
- Los agregas al hacer deploy real

---

## 📤 Compartir con tu Equipo

### Mensaje para WhatsApp/Email:

```
🎉 ¡CONECTOCA ya está como app!

📲 Instala en 30 segundos:

1. Abre: [PEGA_TU_URL_AQUI]

2. Espera el mensaje "Instalar CONECTOCA"

3. Toca "Instalar"

4. ¡Listo!

✨ Funciona offline y como app nativa

🆘 ¿No funciona?

• Android: Menú ⋮ → "Instalar app"
• iPhone: Safari → Compartir → "Agregar a inicio"
  (IMPORTANTE: Safari, no Chrome)

Cualquier duda, escríbeme!
```

---

## 🚀 Deploy en Producción (Después)

Cuando estés listo para lanzar en producción:

**Opciones de hosting:**

### 1. Vercel (Recomendado - Gratis)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Te dará una URL:
# https://conectoca.vercel.app
```

### 2. Netlify (Gratis)

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### 3. Dominio Propio

Después del deploy, conecta tu dominio:
- `conectoca.com`
- `app.conectoca.com`

**En ese momento:**
- Sube los 8 iconos PNG a `/public/icons/`
- La PWA tendrá iconos personalizados
- Todo funcionará perfecto

---

## 📊 Checklist Final

```
□ App corriendo en Figma Make preview
□ URL copiada
□ Iconos generados (8 archivos PNG)
□ Service Worker verificado (✅)
□ Instalada en al menos 1 dispositivo
□ Funcionalidad probada
□ URL compartida con equipo
```

---

## 💡 Tips para Figma Make

1. **Preview URL es temporal**
   - Cambia cada vez que reinicias
   - Para URL permanente → Deploy en producción

2. **Testing:**
   - Usa la URL de preview para probar
   - Comparte con equipo cercano
   - Deploy a producción cuando esté listo

3. **Iconos:**
   - No te preocupes si no puedes subirlos ahora
   - Ícono genérico funciona para testing
   - Agrega iconos personalizados al hacer deploy

4. **Performance:**
   - Preview puede ser más lento
   - En producción será mucho más rápido

---

## 🎯 Próximos Pasos

**Ahora (Testing):**
1. ✅ Instala y prueba la PWA
2. ✅ Comparte con equipo para feedback
3. ✅ Itera basado en uso

**Después (Producción):**
1. Deploy a Vercel/Netlify
2. Conecta dominio propio
3. Sube iconos personalizados
4. Comparte URL permanente

**Mucho después (Opcional):**
1. Considera Google Play si necesitas
2. Lee `/DECISION_APP_STORES.md`

---

## ✅ Resumen Visual

```
┌─────────────────────────────────────────┐
│  PASO 1: Ver app en Figma Make          │
│  └─ Ya está corriendo automáticamente   │
│                                         │
│  PASO 2: Generar iconos                 │
│  └─ [TU_URL]/icons/generate-icons.html  │
│  └─ Guardar 8 iconos PNG                │
│  └─ Subir a /public/icons/ (opcional)   │
│                                         │
│  PASO 3: Verificar                      │
│  └─ Pegar comando en consola            │
│  └─ Todo debe ser ✅                    │
│                                         │
│  PASO 4: Instalar                       │
│  └─ Móvil: Menú → "Instalar app"        │
│  └─ Desktop: Ícono ⊕ → "Instalar"       │
│                                         │
│  PASO 5: Disfrutar                      │
│  └─ App funcionando como nativa!        │
└─────────────────────────────────────────┘
```

---

**¿Listo? Busca el preview de Figma Make y sigue los pasos!** 🚀
