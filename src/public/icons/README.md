# 🦆 Íconos CONECTOCA - Instrucciones

## 📋 Cómo Generar los Íconos

### Opción 1: Generador Rápido (RECOMENDADO) ⚡

1. **Abre el archivo**: `quick-generator.html` en tu navegador
2. **Haz clic** en el botón "Generar Íconos"
3. **Descarga cada ícono**:
   - Haz clic en cada imagen para descargarla automáticamente
   - O haz clic derecho → "Guardar imagen como..."
4. **Guarda con los nombres exactos**:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

### Opción 2: Generador Completo 🎨

1. Abre `generate-logo.html` en tu navegador
2. Sigue las instrucciones en pantalla

## 📁 Dónde Colocar los Íconos

Guarda todos los archivos `.png` en esta carpeta:
```
/public/icons/
```

## ✅ Verificación

Una vez guardados los íconos, tu estructura debe verse así:

```
/public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
├── icon-512x512.png
├── generate-logo.html
├── quick-generator.html
└── README.md
```

## 🚀 Resultado

Después de generar y guardar los íconos:

- ✅ Al anclar la app en Android, se verá el logo de La Oca
- ✅ Al agregar a pantalla de inicio en iOS, se verá el logo
- ✅ El favicon del navegador mostrará el logo
- ✅ Las notificaciones mostrarán el logo de la app

## 🎨 Diseño del Logo

El logo incluye:
- **Fondo**: Azul de La Oca (#1e40af)
- **Oca**: Blanca con pico y patas amarillas (#fbbf24)
- **Texto**: "CONECT" en blanco + "OCA" en amarillo

## 🔧 Solución de Problemas

Si los íconos no aparecen:

1. Verifica que los nombres de archivo sean exactos (con guiones, no espacios)
2. Asegúrate de que estén en `/public/icons/`
3. Limpia la caché del navegador (Ctrl+Shift+R)
4. En producción (Netlify), asegúrate de que la carpeta `/public` se despliegue correctamente

## 📱 Cómo Probar

1. Despliega la app en Netlify
2. Abre la app en tu teléfono
3. En **Android**: Chrome → Menú → "Agregar a pantalla de inicio"
4. En **iOS**: Safari → Compartir → "Agregar a pantalla de inicio"
5. ¡Verás el logo de La Oca! 🦆
