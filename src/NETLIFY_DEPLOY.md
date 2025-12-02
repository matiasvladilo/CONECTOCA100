# 🚀 Guía de Despliegue en Netlify - CONECTOCA

## ✅ Problemas Resueltos

### 1. **Librería xlsx agregada al package.json**
   - Se añadió `"xlsx": "^0.18.5"` a las dependencias
   - Esto soluciona el error de importación dinámica en Analytics

### 2. **Eliminada dependencia del logo.png**
   - Se removió `import logo from '../assets/logo.png'`
   - Se reemplazó por un ícono de `Factory` de lucide-react
   - Ya no hay referencias a archivos que no existen

### 3. **Node version especificada**
   - `netlify.toml` configurado con Node 20
   - `package.json` incluye `"engines": { "node": ">=18.0.0" }`

## 📋 Pasos para Desplegar en Netlify

### Opción 1: Deploy desde GitHub (Recomendado)

1. **Crea un repositorio en GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - CONECTOCA ready for deploy"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/conectoca.git
   git push -u origin main
   ```

2. **Conecta con Netlify**
   - Ve a [netlify.com](https://netlify.com) e inicia sesión
   - Click en "Add new site" → "Import an existing project"
   - Selecciona "GitHub"
   - Autoriza Netlify a acceder a tus repositorios
   - Selecciona el repositorio `conectoca`

3. **Configuración del Build**
   Netlify debería detectar automáticamente:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20 (desde netlify.toml)

4. **Variables de Entorno**
   En Netlify, ve a: **Site settings → Environment variables** y agrega:
   ```
   VITE_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
   ```

5. **Deploy**
   - Click en "Deploy site"
   - Espera a que el build termine (2-3 minutos)
   - ¡Listo! Tu app estará en `https://tu-sitio.netlify.app`

### Opción 2: Deploy Manual (Drag & Drop)

1. **Build local**
   ```bash
   npm install
   npm run build
   ```

2. **Sube a Netlify**
   - Ve a [netlify.com/drop](https://app.netlify.com/drop)
   - Arrastra la carpeta `dist` a la ventana
   - Netlify desplegará automáticamente

3. **Configura variables de entorno**
   - Ve a tu sitio en Netlify
   - Site settings → Environment variables
   - Agrega las variables de Supabase
   - Haz un nuevo deploy para que tomen efecto

### Opción 3: Netlify CLI

1. **Instala Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login y deploy**
   ```bash
   netlify login
   npm run build
   netlify deploy --prod
   ```

## 🔧 Archivos Clave de Configuración

### `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"
  ignore = "supabase/**"

[build.environment]
  NODE_VERSION = "20"
```

### `package.json`
```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "vite build"
  }
}
```

## ⚠️ Checklist Pre-Deploy

- [ ] Todas las dependencias están en `package.json`
- [ ] `netlify.toml` está en la raíz del proyecto
- [ ] No hay referencias a archivos inexistentes (logo.png eliminado)
- [ ] Variables de entorno de Supabase configuradas
- [ ] Build local exitoso (`npm run build`)
- [ ] `.gitignore` incluye `node_modules/` y `dist/`

## 🐛 Solución de Problemas Comunes

### Error: "Module not found: xlsx"
✅ **Resuelto**: Agregada `xlsx@0.18.5` a las dependencias

### Error: "Cannot find module '../assets/logo.png'"
✅ **Resuelto**: Reemplazado por ícono Factory de lucide-react

### Error: "Node version mismatch"
✅ **Resuelto**: Especificada versión Node 20 en netlify.toml

### Build falla en Netlify pero funciona local
1. Verifica que todas las dependencias estén en `package.json` (no en devDependencies)
2. Revisa los logs de build en Netlify
3. Asegúrate de que las variables de entorno estén configuradas

### PWA no funciona después del deploy
1. Verifica que `public/manifest.json` y `public/service-worker.js` estén en dist
2. Asegúrate de que los iconos estén en `dist/icons/`
3. Revisa que la URL en manifest.json sea la correcta

## 🎯 Post-Deploy

### Verifica que todo funcione:
1. ✅ Página carga correctamente
2. ✅ Login funciona
3. ✅ PWA se puede instalar
4. ✅ Notificaciones funcionan
5. ✅ Analíticas (botón exportar Excel) funciona

### Dominio Personalizado (Opcional)
1. En Netlify: Site settings → Domain management
2. Click "Add custom domain"
3. Sigue las instrucciones para configurar DNS

### HTTPS
- Netlify proporciona SSL/HTTPS automáticamente ✅
- No requiere configuración adicional

## 📱 Prueba la PWA

Después del deploy:
1. Abre la app en Chrome/Edge móvil
2. Toca el menú (⋮) → "Instalar aplicación"
3. La app se instalará en tu pantalla de inicio

## 🔄 Actualizaciones Futuras

Para actualizaciones:
```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Netlify desplegará automáticamente los cambios.

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs de build en Netlify
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de que las variables de entorno estén configuradas
4. Prueba el build local primero: `npm run build`

**¡Tu aplicación CONECTOCA está lista para producción! 🎉**
