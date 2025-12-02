# 🚀 Instrucciones de Deploy a Netlify - CONECTOCA

## ✅ PROYECTO LISTO PARA NETLIFY

Tu proyecto ya está configurado para deploy en Netlify.

---

## 📂 Archivos Creados

**Nuevos archivos para Netlify:**

1. **`/package.json`** - Dependencias del proyecto
2. **`/netlify.toml`** - Configuración de Netlify
3. **`/index.html`** - Entrypoint HTML
4. **`/.gitignore`** - Archivos a ignorar

**Qué hace cada archivo:**

### `package.json`
- Define las dependencias npm correctas
- Usa `@supabase/supabase-js` de npm (no JSR)
- Scripts simples de build

### `netlify.toml`
- Configura el build (no build necesario)
- Redirects para SPA routing
- Headers de caché optimizados
- Headers de seguridad
- Ignora carpeta `/supabase/` (las Edge Functions corren en Supabase)

### `index.html`
- Punto de entrada de la aplicación
- Meta tags PWA
- Carga React y componentes
- Registra Service Worker

---

## 🎯 3 MÉTODOS DE DEPLOY

### **MÉTODO 1: Drag & Drop** ⭐ MÁS FÁCIL

**Paso 1: Genera los iconos**

Antes de hacer deploy, genera los 8 iconos:

1. Abre localmente en navegador: `public/icons/generate-icons.html`
2. Click "Generar Todos los Iconos"
3. Guarda los 8 PNG en `public/icons/`:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

**Paso 2: Deploy a Netlify**

1. Ve a: https://app.netlify.com/
2. Regístrate con GitHub (gratis)
3. Verás: "Want to deploy a new site without connecting to Git?"
4. **Arrastra la carpeta completa del proyecto** ahí
5. Espera 30-60 segundos
6. ¡Listo! URL: `https://random-name.netlify.app`

**Paso 3: Personalizar URL**

1. En dashboard → "Site settings"
2. "Change site name"
3. Escribe: `conectoca` (o el que quieras)
4. Nueva URL: `https://conectoca.netlify.app`

---

### **MÉTODO 2: Netlify CLI**

**Instalar CLI:**

```bash
npm install -g netlify-cli
```

**Login:**

```bash
netlify login
```

**Deploy:**

```bash
cd /ruta/al/proyecto

# Primera vez
netlify init

# Deploy
netlify deploy --prod
```

---

### **MÉTODO 3: GitHub + Auto Deploy**

**Paso 1: Subir a GitHub**

```bash
cd /ruta/al/proyecto

git init
git add .
git commit -m "Initial commit - CONECTOCA PWA"
git remote add origin https://github.com/TU_USUARIO/conectoca.git
git branch -M main
git push -u origin main
```

**Paso 2: Conectar Netlify**

1. Netlify Dashboard → "Add new site"
2. "Import an existing project"
3. "GitHub"
4. Selecciona tu repo `conectoca`
5. Configuración:
   - Build command: (dejar vacío)
   - Publish directory: `.`
6. "Deploy site"

**Resultado:**
- Cada `git push` hace deploy automático
- CI/CD configurado

---

## 🔧 Configuración de Variables de Entorno

**IMPORTANTE:** Después del deploy, configura tus variables de Supabase.

**En Netlify Dashboard:**

1. "Site settings"
2. "Environment variables"
3. "Add a variable"

**Variables necesarias:**

```
VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY = tu-anon-key-aqui
```

**Obtener las credenciales:**

1. Ve a: https://supabase.com/dashboard
2. Tu proyecto
3. Settings → API
4. Copia:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

**Después de agregar:**

- Re-deploy (Netlify lo hace automáticamente)
- O: Triggering deploy → "Deploy site"

---

## ✅ Verificar Deploy

**Una vez deployado:**

**1. Abre tu URL:** `https://tu-sitio.netlify.app`

**2. Abre consola (F12) y verifica:**

```javascript
console.clear();
console.log('🔍 Verificando CONECTOCA en Netlify\n');

// Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log(reg ? '✅ Service Worker: Activo' : '⚠️ Activando...');
});

// Manifest
fetch('/manifest.json')
  .then(r => r.json())
  .then(m => console.log('✅ Manifest:', m.name))
  .catch(() => console.log('❌ Manifest: Error'));

// Iconos
fetch('/icons/icon-192x192.png')
  .then(r => console.log(r.ok ? '✅ Iconos: OK' : '❌ Iconos: Faltan'));

// HTTPS
console.log('✅ HTTPS:', location.protocol);
console.log('✅ URL:', location.href);

setTimeout(() => console.log('\n🎉 Todo listo!'), 1000);
```

**Deberías ver:**

```
✅ Service Worker: Activo
✅ Manifest: CONECTOCA - Gestión de Pedidos y Asistencia
✅ Iconos: OK
✅ HTTPS: https:
✅ URL: https://conectoca.netlify.app

🎉 Todo listo!
```

---

## 📱 Instalar la PWA

**Comparte tu URL:**

```
https://conectoca.netlify.app
```

**Usuarios pueden instalar:**

- **Android:** Menú ⋮ → "Instalar aplicación"
- **iOS:** Safari → Compartir □↑ → "Agregar a pantalla de inicio"
- **Desktop:** Ícono ⊕ en barra de URL → "Instalar"

---

## 🔄 Actualizar la App

**Después de cambios en el código:**

### Con Drag & Drop:
- Arrastra la carpeta actualizada de nuevo
- Netlify reemplaza el deploy anterior

### Con CLI:
```bash
netlify deploy --prod
```

### Con GitHub:
```bash
git add .
git commit -m "Descripción de cambios"
git push
```
(Deploy automático)

---

## 🐛 Troubleshooting

### ❌ "Page Not Found"

**Causa:** Netlify no redirige correctamente para SPA

**Solución:** Ya configurado en `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Si el problema persiste:
- Verifica que `netlify.toml` esté en la raíz
- Re-deploy

---

### ❌ "Service Worker no funciona"

**Solución:**

1. Verifica que `/public/service-worker.js` existe
2. Hard reload: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
3. En consola:
   ```javascript
   navigator.serviceWorker.register('/service-worker.js')
     .then(() => location.reload());
   ```

---

### ❌ "Iconos no se ven"

**Causa:** No se subieron los PNG

**Solución:**

1. Genera los 8 iconos localmente
2. Guárdalos en `/public/icons/`
3. Re-deploy
4. Verifica en navegador: `https://tu-sitio.netlify.app/icons/icon-192x192.png`

---

### ❌ "Cannot connect to Supabase"

**Causa:** Variables de entorno no configuradas

**Solución:**

1. Netlify Dashboard → Site settings → Environment variables
2. Agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Trigger new deploy

---

### ❌ "Build failed" o "Deploy failed"

**Causas comunes:**

1. **Falta package.json:** Ya creado ✅
2. **Build command incorrecto:** Ya configurado en netlify.toml ✅
3. **Publish directory incorrecto:** Ya configurado (`.`) ✅

**Si aún falla:**
- Site settings → Build & deploy
- Build command: (dejar vacío)
- Publish directory: `.`

---

## 🎯 Checklist de Deploy

```
□ Iconos generados (8 PNG en /public/icons/)
□ Cuenta Netlify creada
□ Proyecto subido/conectado
□ Deploy completado sin errores
□ URL accesible
□ Service Worker verificado
□ Manifest.json carga
□ Iconos visibles
□ Variables de entorno configuradas (si necesitas Supabase)
□ PWA instalable
□ Funcionalidad probada
```

---

## 📊 Después del Deploy

### Monitoreo:

**Netlify Dashboard muestra:**
- Deploy history
- Build logs
- Analytics básicos
- Bandwidth usage
- Form submissions (si usas)

### Performance:

**Lighthouse Audit:**
1. Abre tu sitio
2. DevTools (F12)
3. Lighthouse tab
4. "Generate report"

**Targets:**
- Performance: 90+
- PWA: 100
- Best Practices: 90+
- Accessibility: 90+

### Analytics:

**Opciones gratis:**
- Netlify Analytics (básico)
- Google Analytics (agregar script)
- Plausible Analytics (privacy-first)

---

## 🌐 Dominio Personalizado (Opcional)

**Si tienes un dominio:**

**Paso 1:** Netlify Dashboard → "Domain settings"

**Paso 2:** "Add custom domain"

**Paso 3:** Escribe tu dominio: `conectoca.com`

**Paso 4:** En tu proveedor de dominio (GoDaddy, etc.):

**Para subdomain (app.conectoca.com):**
```
Type: CNAME
Name: app
Value: tu-sitio.netlify.app
```

**Para root domain (conectoca.com):**
```
Type: A
Name: @
Value: 75.2.60.5
```

**Paso 5:** Espera propagación DNS (5-60 min)

**Paso 6:** Netlify configura HTTPS automático ✅

---

## 🎉 ¡Deploy Completado!

### Ahora tienes:

```
✅ App en producción
✅ URL permanente y profesional
✅ HTTPS automático
✅ PWA completamente funcional
✅ Iconos personalizados
✅ Deploy en minutos
✅ Gratis completamente
```

---

## 🚀 Compartir con Usuarios

**Mensaje de WhatsApp:**

```
🎉 ¡CONECTOCA ya está disponible!

📱 Instala la app en 30 segundos:
https://conectoca.netlify.app

Pasos:
1. Abre el link
2. Toca "Instalar CONECTOCA"
3. ¡Listo!

✨ Funciona offline como app nativa

🆘 Ayuda:
• Android: Menú ⋮ → "Instalar app"
• iPhone: Safari → Compartir → "Agregar a inicio"
  (IMPORTANTE: Debe ser Safari)

Cualquier duda, escríbeme!
```

---

## 📚 Recursos Adicionales

**Documentación:**
- [Netlify Docs](https://docs.netlify.com/)
- [Deploy settings](https://docs.netlify.com/configure-builds/get-started/)
- [Custom domains](https://docs.netlify.com/domains-https/custom-domains/)

**PWA:**
- `/PWA_IMPLEMENTADO.md` - Documentación completa PWA
- `/VERIFICAR_PWA_RAPIDO.md` - Comandos de testing
- `/README_INSTALAR_AHORA.md` - Guía de instalación

**Soporte:**
- [Netlify Community](https://answers.netlify.com/)
- [Netlify Status](https://www.netlifystatus.com/)

---

## ✅ Próximos Pasos

**Después del deploy:**

1. ✅ Comparte URL con equipo
2. ✅ Prueba instalación en múltiples dispositivos
3. ✅ Configura dominio personalizado (opcional)
4. ✅ Monitorea analytics
5. ✅ Recoge feedback de usuarios
6. ✅ Itera y mejora

---

**¡Tu app está lista para producción!** 🚀

**Última actualización:** Octubre 2025
