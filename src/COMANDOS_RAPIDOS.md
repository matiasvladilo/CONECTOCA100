# ⚡ Comandos Rápidos - CONECTOCA

## 🚀 Despliegue Rápido (Copy & Paste)

### 1. Desplegar Servidor en Supabase

```bash
# Instalar CLI (solo una vez)
npm install -g supabase

# Login
supabase login

# Link proyecto (reemplaza PROJECT_ID)
supabase link --project-ref YOUR_PROJECT_ID

# Deploy servidor
supabase functions deploy server

# Verificar
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6d979413/health
```

### 2. Desplegar en Vercel (Opción Recomendada)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (en el directorio del proyecto)
vercel

# Production deploy
vercel --prod
```

### 3. Build Local para Pruebas

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build producción
npm run build

# Preview build
npm run preview
```

---

## 🔧 Variables de Entorno

### Archivo `.env.local` (para desarrollo local)

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### En Vercel/Netlify

Agregar en Settings > Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🗄️ Gestión de Base de Datos

### Ver datos en la tabla KV

```sql
-- En Supabase SQL Editor
SELECT * FROM kv_store_6d979413 WHERE key LIKE 'order:%';
SELECT * FROM kv_store_6d979413 WHERE key LIKE 'stock:%';
SELECT * FROM kv_store_6d979413 WHERE key LIKE 'notification:%';
SELECT * FROM kv_store_6d979413 WHERE key LIKE 'user:%';
```

### Limpiar datos de prueba

```sql
-- CUIDADO: Esto elimina todos los datos
DELETE FROM kv_store_6d979413 WHERE key LIKE 'order:%';
DELETE FROM kv_store_6d979413 WHERE key LIKE 'notification:%';
```

### Ver usuarios registrados

```sql
-- En Supabase SQL Editor
SELECT * FROM auth.users;
```

---

## 🧪 Pruebas API (cURL)

### Health Check

```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6d979413/health
```

### Crear Usuario (Test)

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6d979413/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "test123",
    "name": "Usuario Test",
    "role": "customer"
  }'
```

### Obtener Pedidos

```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6d979413/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Obtener Stock

```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6d979413/stock \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 🐛 Debug y Logs

### Ver logs del servidor (Supabase)

```bash
# En tiempo real
supabase functions logs server --follow

# Ver últimos logs
supabase functions logs server --tail 50
```

### Ver logs en Vercel

```bash
# Instalar CLI
vercel logs

# Ver logs en tiempo real
vercel logs --follow
```

### Console del navegador

```javascript
// En DevTools Console (F12)
// Ver todos los pedidos en memoria
localStorage.getItem('conectoca_orders')

// Ver notificaciones
localStorage.getItem('conectoca_notifications')

// Limpiar cache
localStorage.clear()
```

---

## 🔄 Actualización Rápida

### Después de hacer cambios en el código

```bash
# 1. Commit cambios
git add .
git commit -m "Descripción del cambio"
git push

# 2. Vercel/Netlify deployará automáticamente
# O forzar deploy:
vercel --prod

# 3. Si cambiaste el servidor:
supabase functions deploy server
```

---

## 👥 Gestión de Usuarios

### Crear usuario manualmente (Supabase Dashboard)

1. Authentication > Users
2. Click "Add user"
3. Completar email y password
4. Auto confirm: ON
5. Crear usuario

### Cambiar contraseña de usuario

```sql
-- En SQL Editor (reemplaza el email)
UPDATE auth.users 
SET encrypted_password = crypt('nueva_contraseña', gen_salt('bf'))
WHERE email = 'usuario@ejemplo.com';
```

### Eliminar usuario

```sql
-- Eliminar de auth
DELETE FROM auth.users WHERE email = 'usuario@ejemplo.com';

-- Eliminar datos asociados
DELETE FROM kv_store_6d979413 WHERE key LIKE 'user:%usuario@ejemplo.com%';
```

---

## 📦 Stock Rápido

### Reiniciar stock a valores iniciales

```bash
# Desde el área de producción en la app:
# 1. Ir a Reabastecimiento
# 2. Click en "Reiniciar Stock"
# 3. Confirmar
```

### O por SQL:

```sql
-- Limpiar stock actual
DELETE FROM kv_store_6d979413 WHERE key LIKE 'stock:%';

-- Stock se recreará automáticamente al primer pedido
```

---

## 🔔 Notificaciones

### Ver todas las notificaciones

```sql
SELECT * FROM kv_store_6d979413 
WHERE key LIKE 'notification:%'
ORDER BY value->>'timestamp' DESC;
```

### Limpiar notificaciones antiguas

```sql
DELETE FROM kv_store_6d979413 
WHERE key LIKE 'notification:%' 
AND (value->>'timestamp')::timestamp < NOW() - INTERVAL '30 days';
```

---

## 🎯 Atajos de Desarrollo

### Hot reload en desarrollo

```bash
# Terminal 1: Backend local (opcional)
supabase functions serve server

# Terminal 2: Frontend
npm run dev
```

### TypeScript check

```bash
# Verificar errores de TypeScript
npx tsc --noEmit
```

### Linting

```bash
# Si tienes ESLint configurado
npm run lint
```

---

## 📊 Monitoreo

### Ver estadísticas de uso (Supabase)

1. Dashboard > Settings > Usage
2. Ver:
   - Database size
   - API requests
   - Function invocations
   - Active users

### Supabase Realtime

```javascript
// Suscribirse a cambios en tiempo real (en el navegador)
const { data } = supabase
  .from('kv_store_6d979413')
  .on('INSERT', payload => {
    console.log('Nuevo dato:', payload)
  })
  .subscribe()
```

---

## 🚨 Troubleshooting Rápido

### Error: "Failed to fetch"

```bash
# Verificar que el servidor esté corriendo
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6d979413/health

# Si falla, redesplegar:
supabase functions deploy server
```

### Error: "Unauthorized"

```javascript
// Verificar token en localStorage
console.log(localStorage.getItem('conectoca_access_token'))

// Si es null, hacer login nuevamente
```

### Error: "Network request failed"

1. Verificar internet
2. Verificar CORS en Supabase:
   - Dashboard > Settings > API
   - CORS allowed origins debe incluir tu dominio

### App no actualiza después de cambios

```bash
# Limpiar cache de build
rm -rf dist node_modules/.vite

# Reinstalar y rebuild
npm install
npm run build
```

---

## 🎨 Personalización Rápida

### Cambiar colores principales

```css
/* En /styles/globals.css */
/* Buscar y reemplazar: */
--color-primary: #1e40af;  /* Azul */
--color-secondary: #fbbf24; /* Amarillo */
```

### Cambiar nombre de la app

```typescript
// Buscar "CONECTOCA" en todos los archivos
// Reemplazar con tu nuevo nombre
```

---

## 📱 PWA (Progressive Web App)

### Habilitar instalación como app

1. Agregar `manifest.json`:

```json
{
  "name": "CONECTOCA",
  "short_name": "CONECTOCA",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1e40af",
  "theme_color": "#1e40af"
}
```

2. Link en HTML head:
```html
<link rel="manifest" href="/manifest.json">
```

---

## 🔐 Seguridad

### Rotar API Keys

1. Supabase Dashboard > Settings > API
2. Generate new anon key
3. Actualizar en variables de entorno
4. Redesplegar app

### Habilitar RLS (Row Level Security)

```sql
-- En Supabase SQL Editor
ALTER TABLE kv_store_6d979413 ENABLE ROW LEVEL SECURITY;

-- Crear políticas según necesidad
```

---

## 💾 Backup Manual

### Exportar toda la base de datos

```bash
# Usar pg_dump (desde Supabase CLI)
supabase db dump > backup_$(date +%Y%m%d).sql
```

### Restaurar backup

```bash
psql -h [HOST] -U postgres -d postgres < backup_20251011.sql
```

---

## ⚙️ Configuración Avanzada

### Límites de rate limiting

```typescript
// En /supabase/functions/server/index.tsx
// Ajustar según necesidad:
const RATE_LIMIT = 100; // requests por minuto
```

### Timeout de sesión

```typescript
// Configurar en Supabase Dashboard
// Authentication > Settings
// JWT expiry: 3600 (1 hora en segundos)
```

---

## 📖 Recursos Útiles

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Shadcn/ui**: https://ui.shadcn.com

---

**💡 Tip**: Guarda este archivo en favoritos para acceso rápido a comandos comunes.
