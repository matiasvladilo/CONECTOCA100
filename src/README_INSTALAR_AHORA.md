# 🚀 INSTALAR PWA AHORA - 3 Pasos

## ⚡ TL;DR

Tu PWA ya está **99% lista**. Solo faltan los iconos.

---

## 📱 3 PASOS (5 minutos)

### 1️⃣ Generar Iconos (2 min)

```
Abre en tu navegador:
[TU_URL]/icons/generate-icons.html

Ejemplo:
https://abc123.supabase.co/icons/generate-icons.html
```

**Qué hacer:**
1. La página generará 8 iconos automáticamente
2. Haz clic derecho en cada icono
3. "Guardar imagen como..."
4. Guarda con el nombre exacto mostrado
5. Guárdalos en `/public/icons/`

**Iconos necesarios:**
- icon-72x72.png
- icon-96x96.png  
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png ⭐ Importante
- icon-384x384.png
- icon-512x512.png ⭐ Importante

---

### 2️⃣ Verificar (1 min)

**Abre tu app y pega en consola (F12):**

```javascript
navigator.serviceWorker.getRegistration().then(reg => 
  console.log(reg ? '✅ PWA lista!' : '❌ Problema')
);
```

**Debería mostrar:** `✅ PWA lista!`

---

### 3️⃣ Instalar (2 min)

**En tu móvil/desktop:**

📱 **Android:**
- Menú (⋮) → "Instalar aplicación"

🍎 **iPhone:**
- Safari → Compartir (□↑) → "Agregar a inicio"

💻 **Desktop:**
- Busca ícono ⊕ en barra de direcciones → Click

---

## ✅ ¡Listo!

Tu PWA está instalada. Ahora tienes:

✅ Icono en pantalla de inicio  
✅ Funciona offline  
✅ Notificaciones  
✅ Como app nativa  

---

## 🆘 ¿Problemas?

**No aparece botón de instalar:**
```javascript
// Pega en consola:
navigator.serviceWorker.register('/service-worker.js')
  .then(() => location.reload());
```

**Iconos no se ven:**
- Verifica que guardaste los 8 iconos en `/public/icons/`
- Nombres exactos: `icon-72x72.png`, etc.

**Más ayuda:**
- `/INSTALAR_PWA_AHORA.md` - Guía detallada
- `/VERIFICAR_PWA_RAPIDO.md` - Comandos de debugging

---

## 📊 Verificación Rápida

**Pega esto en consola para checklist completo:**

```javascript
console.log('Verificando...\n');
navigator.serviceWorker.getRegistration().then(r => console.log(r ? '✅ SW' : '❌ SW'));
fetch('/manifest.json').then(r => console.log(r.ok ? '✅ Manifest' : '❌ Manifest'));
fetch('/icons/icon-192x192.png').then(r => console.log(r.ok ? '✅ Iconos' : '❌ Iconos'));
console.log(location.protocol === 'https:' ? '✅ HTTPS' : '❌ HTTP');
```

**Todo ✅ = Listo para instalar!**

---

## 🎯 Próximo Paso

**Después de instalar, comparte con tu equipo:**

```
🎉 CONECTOCA ya es una app!

Instálala:
1. Ve a: [TU_URL]
2. Menú → "Instalar aplicación"
3. ¡Listo!

Funciona offline y como app nativa 🚀
```

---

**Documentación completa:**
- `/INSTALAR_PWA_AHORA.md` - Paso a paso detallado
- `/PWA_IMPLEMENTADO.md` - Info técnica completa
- `/VERIFICAR_PWA_RAPIDO.md` - Tests y debugging
