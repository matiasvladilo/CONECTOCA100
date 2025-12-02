# 🚀 EMPIEZA AQUÍ - Figma Make

## 📱 Tu PWA está LISTA en Figma Make

```
╔═══════════════════════════════════════════╗
║  ✅ Tu app está corriendo AHORA           ║
║  ✅ Service Worker activo                 ║
║  ✅ Lista para instalar                   ║
╚═══════════════════════════════════════════╝
```

---

## ⚡ 3 PASOS (5 minutos)

### 1️⃣ VER TU APP

**En Figma Make:**
- Tu app ya está en el **preview** (panel derecho)
- Busca botón **"Open in new tab"** ↗
- Click → Se abre en pestaña nueva
- **Copia la URL** (será algo como `https://abc123.supabase.co`)

---

### 2️⃣ GENERAR ICONOS

**Abre:**
```
[TU_URL]/icons/generate-icons.html
```

**Ejemplo:**
```
https://abc123.supabase.co/icons/generate-icons.html
```

**Luego:**
1. Click "Generar Todos los Iconos"
2. Clic derecho en cada icono → "Guardar imagen"
3. Guarda los 8 archivos PNG
4. **Opcional:** Sube a `/public/icons/` en Figma Make

**Nota:** Si no puedes subir archivos en Figma Make, no pasa nada. La PWA funciona igual, solo usará un ícono genérico temporalmente.

---

### 3️⃣ INSTALAR

**En tu MÓVIL:**
1. Envíate la URL por WhatsApp/Email
2. Abre el link
3. **Android:** Menú ⋮ → "Instalar aplicación"
4. **iPhone:** Safari → Compartir □↑ → "Agregar a inicio"

**En tu PC:**
1. En la barra de URL, busca ícono **⊕**
2. Click → "Instalar"

---

## ✅ ¡LISTO!

Ya tienes:
- ✅ App en pantalla de inicio
- ✅ Funciona offline
- ✅ Notificaciones
- ✅ Como app nativa

---

## 🧪 VERIFICAR (opcional)

**Abre consola (F12) y pega:**

```javascript
navigator.serviceWorker.getRegistration()
  .then(r => console.log(r ? '✅ PWA lista!' : '❌ Hay problema'));
```

Debería decir: `✅ PWA lista!`

---

## 📚 MÁS INFO

- `/INSTALAR_EN_FIGMA_MAKE.md` - Guía completa para Figma Make
- `/README_INSTALAR_AHORA.md` - Guía rápida general
- `/VERIFICAR_PWA_RAPIDO.md` - Comandos debugging

---

## 🆘 PROBLEMAS

**No veo el botón instalar:**
```javascript
// Pega en consola:
navigator.serviceWorker.register('/service-worker.js')
  .then(() => location.reload());
```

**iOS no funciona:**
- Usa Safari (no Chrome)
- Compartir → "Agregar a pantalla de inicio"

**Más ayuda:**
- `/INSTALAR_EN_FIGMA_MAKE.md` - Troubleshooting completo

---

## 🎯 SIGUIENTE PASO

**Lee la guía completa:**
```
/INSTALAR_EN_FIGMA_MAKE.md
```

**O simplemente:**
1. Abre tu app en el preview de Figma Make
2. Click "Open in new tab"
3. Copia la URL
4. Sigue los 3 pasos arriba

---

**¡Tu PWA está funcionando AHORA en Figma Make!** 🚀
