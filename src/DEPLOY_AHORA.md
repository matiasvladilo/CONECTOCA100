# 🚀 CONECTOCA - Deploy a Netlify AHORA

## ⚡ 3 Pasos Rápidos

### 1️⃣ Genera los Iconos PWA (2 minutos)

Abre este archivo en tu navegador:
```
public/icons/icon-generator.html
```

O navega directamente:
```bash
# En tu navegador, ve a:
file:///ruta-completa-de-tu-proyecto/public/icons/icon-generator.html
```

**Los iconos se generarán automáticamente. Descárgalos todos y guárdalos en `public/icons/`**

---

### 2️⃣ Prueba el Build Local (1 minuto)

```bash
# Instala dependencias (si no lo has hecho)
npm install

# Construye el proyecto
npm run build

# Verifica que se creó la carpeta dist/
ls -la dist/
```

**Deberías ver:**
- ✅ `index.html`
- ✅ Carpeta `assets/`
- ✅ Carpeta `icons/`
- ✅ `manifest.json`
- ✅ `service-worker.js`

---

### 3️⃣ Deploy a Netlify

#### Opción A: GitHub (Recomendado - Deploy Automático)

```bash
# 1. Crea repo en GitHub
git init
git add .
git commit -m "Deploy CONECTOCA a producción"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/conectoca.git
git push -u origin main

# 2. Ve a netlify.com
# 3. Click "New site from Git"
# 4. Conecta GitHub
# 5. Selecciona el repositorio
# 6. Deploy! (automático)
```

#### Opción B: Drag & Drop (Más Rápido - 30 segundos)

```bash
# 1. Build
npm run build

# 2. Ve a: https://app.netlify.com/drop

# 3. Arrastra la carpeta "dist" a la ventana

# ¡Listo!
```

#### Opción C: CLI

```bash
# Instala CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
npm run build
netlify deploy --prod
```

---

## 🔐 Configurar Variables de Entorno

**IMPORTANTE:** Después del deploy, configura las variables en Netlify:

1. Ve a tu sitio en Netlify
2. **Site settings → Environment variables**
3. Agrega estas variables:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
```

4. Haz un redeploy para que tomen efecto

---

## ✅ Verificación Post-Deploy

Después del deploy, verifica que todo funcione:

1. ✅ La página carga sin errores
2. ✅ Puedes hacer login
3. ✅ Crear un pedido funciona
4. ✅ Las notificaciones aparecen
5. ✅ Analytics → Exportar Excel funciona
6. ✅ PWA se puede instalar (menú móvil → "Instalar app")

---

## 🐛 Problemas Comunes

### "Cannot find module 'xlsx'"
❌ **Causa:** No se instalaron las dependencias
✅ **Solución:** `npm install` antes de `npm run build`

### "Module not found: '../assets/logo.png'"
✅ **Ya está solucionado** - Usamos ícono Factory en su lugar

### Build funciona local pero falla en Netlify
1. Verifica que `netlify.toml` esté en la raíz
2. Asegúrate de que las variables de entorno estén configuradas
3. Revisa los logs de Netlify para ver el error específico

### PWA no funciona
1. Verifica que `manifest.json` esté en dist/
2. Asegúrate de que los iconos estén en dist/icons/
3. Usa HTTPS (Netlify lo proporciona automáticamente)

---

## 📱 Instalar PWA en Móvil

1. Abre la app en Chrome/Safari móvil
2. Ve al menú (⋮ o compartir)
3. Selecciona "Agregar a pantalla de inicio"
4. ¡La app se instalará como app nativa!

---

## 🎯 URLs Importantes

- **Netlify**: https://app.netlify.com
- **Supabase Dashboard**: https://app.supabase.com
- **Tu sitio**: https://tu-sitio.netlify.app

---

## 🆘 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| Build falla | `npm install && npm run build` |
| Iconos faltan | Genera con icon-generator.html |
| Variables no funcionan | Configúralas en Netlify y redeploy |
| Login falla | Verifica SUPABASE_URL y ANON_KEY |

---

## 🎉 ¡Listo para Deploy!

**Tu app está lista para producción. Solo necesitas:**
1. ✅ Generar los iconos
2. ✅ Hacer build
3. ✅ Deploy a Netlify

**Tiempo estimado: 5 minutos**

---

## 📞 Soporte

Si algo no funciona:
1. Revisa `PROBLEMAS_SOLUCIONADOS.md`
2. Lee `NETLIFY_DEPLOY.md` para instrucciones detalladas
3. Verifica los logs de Netlify

**¡Buena suerte con tu deploy! 🚀**
