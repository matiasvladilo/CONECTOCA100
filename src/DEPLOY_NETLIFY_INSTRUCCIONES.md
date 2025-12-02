# 🚀 Instrucciones para Deploy en Netlify - CONECTOCA

## ✅ Problema Resuelto

Se corrigió el error del archivo `_redirects` que se había convertido en carpeta, y se agregó la configuración completa de Vite para compilar la aplicación TypeScript/React.

## 📋 Pasos para Deploy en Netlify

### Opción 1: Deploy desde Git (Recomendado)

1. **Sube tu código a GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - CONECTOCA PWA"
   git remote add origin [TU_REPO_URL]
   git push -u origin main
   ```

2. **Conecta Netlify con tu repositorio**
   - Ve a [app.netlify.com](https://app.netlify.com)
   - Click en "Add new site" → "Import an existing project"
   - Selecciona tu proveedor Git y repositorio
   - Netlify detectará automáticamente la configuración de `netlify.toml`

3. **Configuración de Build (ya está en netlify.toml)**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20

4. **Variables de Entorno**
   En Netlify dashboard → Site settings → Environment variables, agrega:
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
   ```

5. **Deploy**
   - Click en "Deploy site"
   - Netlify compilará y publicará automáticamente

### Opción 2: Deploy Manual (Drag & Drop)

1. **Compila localmente**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy la carpeta dist**
   - Ve a [app.netlify.com](https://app.netlify.com)
   - Arrastra la carpeta `dist` al área de deploy
   - ¡Listo! Tu app estará en línea

## 🔧 Comandos Disponibles

```bash
# Desarrollo local
npm run dev

# Compilar para producción
npm run build

# Preview de producción local
npm run preview
```

## 📁 Archivos Importantes Creados/Actualizados

✅ `_redirects` - Archivo correcto para routing SPA (ya no es carpeta)
✅ `vite.config.ts` - Configuración de Vite para compilar TypeScript/React
✅ `tsconfig.json` - Configuración TypeScript
✅ `package.json` - Scripts actualizados para build
✅ `netlify.toml` - Configuración de Netlify actualizada
✅ `src/main.tsx` - Punto de entrada de la app
✅ `.gitignore` - Ignora node_modules y dist

## 🎯 Verificación Post-Deploy

Después del deploy, verifica:

1. ✅ La app carga correctamente (no pantalla blanca)
2. ✅ El routing funciona (navega a diferentes secciones)
3. ✅ Las imágenes y iconos cargan
4. ✅ El service worker se registra (verifica en DevTools)
5. ✅ La PWA es instalable
6. ✅ La conexión con Supabase funciona

## 🐛 Solución de Problemas

### Pantalla blanca después del deploy
- ✅ **RESUELTO**: Era por archivo _redirects como carpeta
- Verifica que las variables de entorno estén configuradas
- Revisa los logs de build en Netlify dashboard

### Error en compilación
- Ejecuta `npm run build` localmente para ver errores
- Verifica que todas las dependencias estén en package.json
- Asegúrate que Node version sea 20 en netlify.toml

### Service Worker no funciona
- El service worker solo funciona en HTTPS (Netlify usa HTTPS automáticamente)
- Limpia la caché del navegador
- Verifica en DevTools → Application → Service Workers

## 🌐 Dominios Personalizados

Para usar tu propio dominio:

1. En Netlify: Site settings → Domain management
2. Add custom domain
3. Sigue las instrucciones para configurar DNS

## 📱 PWA Funcionalidades

La app incluye:
- ✅ Manifest.json configurado
- ✅ Service Worker con caché offline
- ✅ Iconos para iOS/Android/Windows
- ✅ Meta tags optimizados
- ✅ Instalable en dispositivos móviles

## 🔐 Seguridad

Netlify automáticamente incluye:
- HTTPS (certificado SSL gratuito)
- Headers de seguridad (configurados en netlify.toml)
- Protección DDoS

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de build en Netlify
2. Verifica la consola del navegador
3. Comprueba que las variables de entorno estén configuradas
4. Consulta la documentación de Netlify: https://docs.netlify.com

---

**¡Tu app CONECTOCA está lista para producción! 🎉**
