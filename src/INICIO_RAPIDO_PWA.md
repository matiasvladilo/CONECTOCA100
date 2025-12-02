# ⚡ Inicio Rápido - PWA

## 🎯 En 5 Minutos

### **1. Verifica que Todo Funciona**

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Test 1: Service Worker
navigator.serviceWorker.getRegistration()
  .then(reg => console.log('✓ SW:', reg ? 'Registrado' : 'No registrado'))

// Test 2: Manifest
fetch('/manifest.json')
  .then(r => r.json())
  .then(m => console.log('✓ Manifest:', m.name))

// Test 3: Caché
caches.keys()
  .then(keys => console.log('✓ Cachés:', keys.length))
```

**Resultado esperado:**
```
✓ SW: Registrado
✓ Manifest: CONECTOCA - Gestión de Pedidos y Asistencia
✓ Cachés: 2
```

---

### **2. Genera los Iconos (Opcional Ahora)**

#### Opción A: Usar Placeholders Temporales
```typescript
// Los iconos placeholder ya están listos
// Puedes omitir esto por ahora y generar iconos reales después
```

#### Opción B: Iconos Reales Ahora
1. Ve a https://realfavicongenerator.net/
2. Sube tu logo (512×512 mínimo)
3. Descarga el paquete
4. Extrae a `/public/icons/`

---

### **3. Prueba la Instalación**

#### En Desktop (Chrome)
1. Abre la app
2. Espera 5 segundos
3. Debe aparecer un **banner azul** en la esquina inferior
4. Click "Instalar"

#### En Android
1. Abre la app en Chrome
2. Menú (⋮) → "Instalar app"

#### En iOS
1. Abre en Safari
2. Compartir (□↑) → "Agregar a inicio"

---

### **4. Verifica con Lighthouse**

1. F12 → Tab "Lighthouse"
2. Selecciona "Progressive Web App"
3. Click "Generate report"

**Score esperado:** 85-100

Si score < 85, revisa warnings en el reporte.

---

## 🧪 Página de Testing

Visita: `/pwa-test.html`

Esta página incluye:
- ✅ Tests automáticos
- ✅ Información del sistema
- ✅ Acciones rápidas (limpiar caché, etc.)
- ✅ Verificación de iconos

---

## 🎨 Personalización Rápida

### Cambiar Colores

**Archivo:** `/public/manifest.json`
```json
{
  "theme_color": "#TU_COLOR_AQUI",
  "background_color": "#TU_COLOR_AQUI"
}
```

**Archivo:** `/components/PWAHead.tsx`
```typescript
themeColor.content = '#TU_COLOR_AQUI';
```

### Cambiar Nombre

**Archivo:** `/public/manifest.json`
```json
{
  "name": "Tu Nombre Completo",
  "short_name": "Corto"
}
```

---

## 🐛 Solución Rápida de Problemas

### No Aparece el Banner

```javascript
// En consola:
localStorage.removeItem('pwa-install-dismissed')
location.reload()
```

### Cambios No Se Ven

```javascript
// Hard reload:
// Windows: Ctrl + Shift + R
// Mac: Cmd + Shift + R

// O en consola:
caches.keys()
  .then(keys => Promise.all(keys.map(k => caches.delete(k))))
  .then(() => location.reload())
```

### Service Worker No Funciona

```javascript
// Desregistrar y recargar:
navigator.serviceWorker.getRegistrations()
  .then(regs => Promise.all(regs.map(r => r.unregister())))
  .then(() => location.reload())
```

---

## 📊 Checklist de 2 Minutos

```
□ Service Worker registrado
□ Manifest accesible
□ Al menos 2 cachés activos
□ Banner de instalación aparece (5s después)
□ Lighthouse score > 85
□ Probado en Chrome
```

Si todos ✓ → **¡Listo para usar!** 🎉

---

## 🚀 Deployment Checklist

Antes de subir a producción:

```
□ HTTPS configurado
□ Manifest en /public/manifest.json
□ Service Worker en /public/service-worker.js
□ Iconos (al menos placeholders)
□ Tests pasan en Chrome
```

---

## 📚 Documentación

- **Completa:** `/PWA_IMPLEMENTADO.md`
- **Guía Rápida:** `/PWA_GUIA_RAPIDA.md`
- **Cambios:** `/CAMBIOS_PWA.md`
- **README:** `/README_PWA.md`

---

## 💡 Tips Pro

### Debug Mode
```javascript
// Activar logs de SW:
localStorage.setItem('sw-debug', 'true')
location.reload()
```

### Ver Estado PWA
```javascript
// Mostrar badges de estado:
window.enablePWAStatus()
```

### Forzar Actualización
```javascript
navigator.serviceWorker.getRegistration()
  .then(reg => reg?.update())
```

---

## ✨ Siguiente Paso

**Instala la app en tu móvil y pruébala!** 📱

La mejor forma de verificar que todo funciona es usándola como lo haría un usuario real.

---

**Tiempo total:** ~5 minutos  
**Dificultad:** ⭐☆☆☆☆ (Muy fácil)  
**Resultado:** PWA funcional ✓
