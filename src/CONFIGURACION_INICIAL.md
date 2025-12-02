# ⚙️ Configuración Inicial - CONECTOCA

## 🎯 Información del Proyecto

**Nombre**: CONECTOCA  
**Descripción**: Aplicación móvil para conectar usuarios con centro de fabricación La Oca  
**Versión**: 1.0.0  
**Última actualización**: Octubre 2025

---

## 📱 Características Principales

### Para Clientes:
✅ Crear y gestionar pedidos  
✅ Ver estado en tiempo real  
✅ Recibir notificaciones  
✅ Gestionar perfil y dirección  
✅ Historial de pedidos  

### Para Producción:
✅ KDS (Kitchen Display System)  
✅ Búsqueda y filtros avanzados  
✅ Sistema de prioridades  
✅ Guías de despacho imprimibles  
✅ Gestión de stock automática  
✅ Analytics y reportes  

---

## 🔑 Variables de Entorno Requeridas

### Frontend (.env.local)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - Para desarrollo
VITE_API_URL=http://localhost:54321/functions/v1/make-server-6d979413
```

### Backend (Supabase Secrets)

Estas ya están configuradas automáticamente en Supabase:

```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
```

---

## 👥 Usuarios de Prueba Recomendados

### Usuario 1: Producción (Staff)

```
Email: produccion@laoca.cl
Password: LaOca2025!
Nombre: Equipo de Producción
Rol: production
```

**Permisos**:
- ✅ Acceso al KDS
- ✅ Ver todos los pedidos
- ✅ Cambiar estados
- ✅ Gestionar stock
- ✅ Ver analytics
- ✅ Imprimir guías

### Usuario 2: Cliente Demo

```
Email: cliente@demo.cl
Password: Demo2025!
Nombre: Cliente Demo
Rol: customer
Dirección: Av. La Oca 123, Santiago
```

**Permisos**:
- ✅ Crear pedidos
- ✅ Ver sus pedidos
- ✅ Recibir notificaciones
- ✅ Gestionar perfil
- ❌ No acceso a KDS
- ❌ No acceso a analytics

### Usuario 3: Admin (Opcional)

```
Email: admin@laoca.cl
Password: AdminLaOca2025!
Nombre: Administrador
Rol: production
```

---

## 📦 Stock Inicial Recomendado

### Categoría: Panes

| Producto | Precio | Stock Inicial |
|----------|--------|---------------|
| Pan de Molde Integral | $2,500 | 100 |
| Pan de Molde Blanco | $2,300 | 100 |
| Pan Hallulla | $150 | 150 |
| Pan Marraqueta | $150 | 150 |

### Categoría: Tortas

| Producto | Precio | Stock Inicial |
|----------|--------|---------------|
| Torta de Chocolate | $12,000 | 50 |
| Torta de Vainilla | $11,000 | 50 |

### Categoría: Repostería

| Producto | Precio | Stock Inicial |
|----------|--------|---------------|
| Galletas Surtidas | $4,500 | 200 |
| Donas Glaseadas | $1,500 | 100 |

### Categoría: Empanadas

| Producto | Precio | Stock Inicial |
|----------|--------|---------------|
| Empanadas de Queso | $800 | 80 |
| Empanadas de Carne | $900 | 80 |

**Total de productos**: 10  
**Stock total**: 1,080 unidades

---

## 🎨 Configuración de Marca

### Colores Principales

```css
/* Azul La Oca - Primario */
--blue-900: #1e3a8a;
--blue-800: #1e40af;
--blue-700: #1d4ed8;
--blue-600: #2563eb;
--blue-500: #3b82f6;

/* Amarillo La Oca - Secundario */
--yellow-500: #fbbf24;
--yellow-400: #fcd34d;

/* Grises - Tema Oscuro KDS */
--gray-900: #111827;
--gray-800: #1f2937;
--gray-700: #374151;
```

### Tipografía

```css
/* Sistema por defecto - Optimizado para legibilidad */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Logo

```
Ubicación: figma:asset/...
Formatos disponibles:
- Logo completo (con texto)
- Logo icono (solo oca)
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: kv_store_6d979413

**Esquema**:
```sql
CREATE TABLE kv_store_6d979413 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Prefijos de keys**:
- `order:` - Pedidos
- `stock:` - Inventario de productos
- `notification:` - Notificaciones
- `user:` - Datos de usuario (perfil, preferencias)
- `analytics:` - Datos de análisis

**Ejemplo de datos**:

```json
// order:abc123
{
  "id": "abc123",
  "customerName": "Cliente Demo",
  "customerEmail": "cliente@demo.cl",
  "products": [
    {
      "name": "Pan de Molde Integral",
      "quantity": 2,
      "price": 2500
    }
  ],
  "total": 5000,
  "status": "pending",
  "createdAt": "2025-10-11T10:30:00Z",
  "deadline": "2025-10-12T14:00:00Z",
  "deliveryAddress": "Av. La Oca 123, Santiago"
}
```

---

## 🛠️ Endpoints del Servidor

### Base URL
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6d979413
```

### Endpoints Disponibles

#### 🔐 Autenticación

**POST** `/signup`
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "name": "Nombre Usuario",
  "role": "customer" // o "production"
}
```

**POST** `/login` (manejado por Supabase Auth)

**POST** `/logout` (manejado por Supabase Auth)

#### 📦 Pedidos

**GET** `/orders`
- Headers: `Authorization: Bearer {access_token}`
- Query params: `?page=1&limit=10&status=pending`

**POST** `/orders`
```json
{
  "products": [
    {
      "name": "Pan de Molde Integral",
      "quantity": 2,
      "price": 2500
    }
  ],
  "deadline": "2025-10-12T14:00:00Z",
  "deliveryAddress": "Dirección de entrega"
}
```

**PUT** `/orders/:id/status`
```json
{
  "status": "in_progress", // pending, in_progress, completed, cancelled
  "progress": 50
}
```

#### 📊 Stock

**GET** `/stock`
- Devuelve todos los productos con stock disponible

**POST** `/stock/restock`
```json
{
  "products": {
    "Pan de Molde Integral": 50,
    "Torta de Chocolate": 10
  }
}
```

**POST** `/stock/reset`
- Reinicia todo el stock a valores iniciales

#### 🔔 Notificaciones

**GET** `/notifications`
- Headers: `Authorization: Bearer {access_token}`
- Devuelve notificaciones del usuario

**PUT** `/notifications/:id/read`
- Marca notificación como leída

**DELETE** `/notifications/:id`
- Elimina una notificación

**DELETE** `/notifications/all`
- Limpia todas las notificaciones del usuario

#### 📈 Analytics

**GET** `/analytics`
- Headers: `Authorization: Bearer {access_token}`
- Query params: `?from=2025-10-01&to=2025-10-31`
- Solo para usuarios con rol "production"

---

## 🔔 Configuración de Notificaciones

### Tipos de Notificaciones

1. **PEDIDO_CREADO** (para producción)
   - Se envía cuando un cliente crea un pedido
   - Prioridad: Alta

2. **PEDIDO_CONFIRMADO** (para cliente)
   - Se envía cuando producción recibe el pedido
   - Prioridad: Media

3. **ESTADO_CAMBIADO** (para cliente)
   - Se envía al cambiar estado (en preparación, completado)
   - Prioridad: Alta

4. **STOCK_BAJO** (para producción)
   - Se envía cuando un producto tiene stock < 10
   - Prioridad: Media

### Preferencias por Usuario

Cada usuario puede configurar:
```json
{
  "notifications": {
    "orderConfirmed": true,
    "orderInProgress": true,
    "orderCompleted": true,
    "statusUpdates": true
  }
}
```

---

## 📱 Configuración PWA (Progressive Web App)

### manifest.json

```json
{
  "name": "CONECTOCA - La Oca",
  "short_name": "CONECTOCA",
  "description": "Gestión de Pedidos La Oca",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1e40af",
  "theme_color": "#1e40af",
  "icons": [
    {
      "src": "/logo-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logo-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🔒 Configuración de Seguridad

### Row Level Security (RLS)

**Recomendación**: Habilitar RLS en el futuro para mayor seguridad

```sql
-- Habilitar RLS
ALTER TABLE kv_store_6d979413 ENABLE ROW LEVEL SECURITY;

-- Política de ejemplo: Los clientes solo ven sus pedidos
CREATE POLICY "Users see their own orders"
ON kv_store_6d979413
FOR SELECT
USING (
  key LIKE 'order:%' AND 
  value->>'customerEmail' = auth.jwt()->>'email'
);
```

### CORS

Configurar en Supabase Dashboard > Settings > API:

```
Allowed origins:
- https://tu-dominio.com
- https://tu-dominio.vercel.app
- http://localhost:5173 (para desarrollo)
```

---

## 📊 Métricas de Performance

### Objetivos de Performance

- ⚡ **First Contentful Paint**: < 1.5s
- ⚡ **Time to Interactive**: < 3.5s
- ⚡ **Largest Contentful Paint**: < 2.5s
- ⚡ **Cumulative Layout Shift**: < 0.1
- ⚡ **First Input Delay**: < 100ms

### Tamaños de Bundle

- 📦 **Main bundle**: ~300KB (gzipped)
- 📦 **Vendor bundle**: ~150KB (gzipped)
- 📦 **CSS**: ~20KB (gzipped)

---

## 🚀 Scripts de Package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "vercel --prod",
    "deploy:functions": "supabase functions deploy server",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx"
  }
}
```

---

## 📞 Información de Contacto

### Soporte Técnico
- Email: soporte@laoca.cl
- Teléfono: +56 9 XXXX XXXX
- Horario: Lunes a Viernes, 9:00 - 18:00

### Reportar Bugs
- GitHub Issues: (si aplica)
- Email directo: bugs@laoca.cl

---

## 📅 Roadmap Futuro

### Próximas Funcionalidades

**Corto Plazo (1-3 meses)**:
- [ ] Sistema de pagos integrado
- [ ] Notificaciones por email
- [ ] Exportación de reportes a PDF/Excel
- [ ] Códigos de descuento

**Mediano Plazo (3-6 meses)**:
- [ ] App móvil nativa (React Native)
- [ ] Sistema de puntos de fidelidad
- [ ] Chat en tiempo real cliente-producción
- [ ] Múltiples ubicaciones de despacho

**Largo Plazo (6-12 meses)**:
- [ ] API pública para integraciones
- [ ] Sistema de suscripciones
- [ ] Programa de afiliados
- [ ] Dashboard avanzado de BI

---

## 🎓 Recursos de Aprendizaje

### Para el Equipo

- **React**: https://react.dev/learn
- **TypeScript**: https://www.typescriptlang.org/docs
- **Supabase**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Motion**: https://motion.dev/docs

### Tutoriales Útiles

- Crear pedidos: Ver flujo en la app
- Gestionar KDS: Guía en PRODUCCION_AVANZADA_IMPLEMENTADO.md
- Configurar notificaciones: Ver NOTIFICACIONES_IMPLEMENTADO.md

---

**✅ Esta configuración está lista para ser usada en producción**

**Fecha de creación**: Octubre 2025  
**Última actualización**: Octubre 2025  
**Versión**: 1.0.0
