# CONECTOCA - Integración con Supabase

## ✅ Integración Completa

La aplicación CONECTOCA ahora está completamente integrada con Supabase para proporcionar:

### Funcionalidades Implementadas

1. **Autenticación Real**
   - Registro de nuevos usuarios
   - Inicio de sesión con email y contraseña
   - Gestión de sesiones persistentes
   - Cierre de sesión seguro

2. **Base de Datos (KV Store)**
   - Almacenamiento de perfiles de usuario
   - Catálogo de productos persistente
   - Gestión de pedidos
   - Actualización en tiempo real

3. **Roles de Usuario**
   - `user`: Usuarios regulares que pueden crear pedidos
   - `production`: Equipo de producción que puede gestionar estados

## 🏗️ Arquitectura

### Backend (Supabase Edge Functions)

**Archivo**: `/supabase/functions/server/index.tsx`

#### Rutas de Autenticación:
- `POST /make-server-6d979413/signup` - Registrar nuevo usuario

#### Rutas de Perfil:
- `GET /make-server-6d979413/profile` - Obtener perfil del usuario
- `PUT /make-server-6d979413/profile` - Actualizar perfil

#### Rutas de Productos:
- `GET /make-server-6d979413/products` - Listar todos los productos
- `POST /make-server-6d979413/products` - Crear producto
- `PUT /make-server-6d979413/products/:id` - Actualizar producto
- `DELETE /make-server-6d979413/products/:id` - Eliminar producto

#### Rutas de Pedidos:
- `GET /make-server-6d979413/orders` - Listar pedidos del usuario
- `POST /make-server-6d979413/orders` - Crear nuevo pedido
- `GET /make-server-6d979413/orders/:id` - Obtener detalle de pedido
- `PUT /make-server-6d979413/orders/:id/status` - Actualizar estado (solo producción)

### Frontend

**Archivos Principales**:
- `/App.tsx` - Componente principal con lógica de autenticación y estado
- `/utils/api.tsx` - Cliente HTTP para comunicación con el backend
- `/utils/supabase/client.tsx` - Cliente de Supabase
- `/components/LoginScreen.tsx` - Pantalla de login/registro
- `/components/NewOrderForm.tsx` - Formulario de pedidos con catálogo
- `/components/UserProfile.tsx` - Gestión de perfil de usuario

## 🔐 Autenticación

### Flujo de Login

1. Usuario ingresa email y contraseña
2. Se llama a `supabase.auth.signInWithPassword()`
3. Se obtiene el `access_token`
4. Se carga el perfil del usuario desde `/profile`
5. Se establece la sesión y se carga la pantalla correspondiente

### Flujo de Registro

1. Usuario completa formulario (nombre, email, contraseña)
2. Se llama a `/signup` que usa `supabase.auth.admin.createUser()`
3. Se crea el perfil en KV Store
4. Usuario puede iniciar sesión inmediatamente

## 📦 Estructura de Datos

### Usuario (KV: `user:{userId}`)
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'user' | 'production';
  notificationPrefs: {
    orderStatus: boolean;
    production: boolean;
  };
  createdAt: string;
}
```

### Producto (KV: `product:{productId}`)
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  createdBy: string;
  createdAt: string;
}
```

### Pedido (KV: `order:{orderId}`)
```typescript
{
  id: string;
  userId: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  createdAt: string;
  updatedAt: string;
}
```

## 🚀 Cómo Usar

### 1. Crear una Cuenta

1. Abre la aplicación
2. Haz clic en "Crear cuenta"
3. Ingresa tu nombre, email y contraseña (mínimo 6 caracteres)
4. Haz clic en "Crear cuenta"
5. Inicia sesión con tus credenciales

### 2. Catálogo de Productos

Al crear el primer pedido, se inicializarán productos por defecto:
- Cajas de Cartón Premium
- Etiquetas Adhesivas
- Bolsas Biodegradables
- Envases de Papel
- Contenedores Industriales

Puedes:
- ✏️ Editar productos (nombre, descripción, precio, imagen)
- 🗑️ Eliminar productos del catálogo
- 📸 Cambiar imágenes (URL o subir desde dispositivo)

### 3. Crear Pedidos

1. Selecciona productos del catálogo
2. Define cantidades
3. Agrega al carrito
4. Selecciona fecha límite de entrega
5. Confirma el pedido

### 4. Gestión de Producción

Los usuarios con rol `production` pueden:
- Ver todos los pedidos
- Actualizar estados
- Modificar progreso

## 🔧 Configuración Técnica

### Variables de Entorno (Ya configuradas)

El servidor utiliza automáticamente:
- `SUPABASE_URL` - URL del proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio
- `SUPABASE_ANON_KEY` - Clave pública anónima

### Inicialización Automática

La aplicación:
1. Verifica sesiones existentes al cargar
2. Restaura el estado del usuario si hay sesión activa
3. Carga pedidos y productos automáticamente
4. Inicializa productos por defecto si el catálogo está vacío

## 📝 Notas Importantes

1. **Seguridad**: Los emails se confirman automáticamente (`email_confirm: true`) porque no hay servidor de correo configurado

2. **Persistencia**: Todos los datos se almacenan en Supabase KV Store, son persistentes entre sesiones

3. **Autorización**: Las rutas protegidas verifican el token de acceso antes de permitir operaciones

4. **Roles**: El rol por defecto es `user`. Para tener acceso de producción, el rol debe cambiarse manualmente en la base de datos

5. **Imágenes**: Soporta URLs externas y carga de archivos locales (convertidos a base64)

## 🐛 Debugging

Si encuentras problemas:

1. Revisa la consola del navegador para errores
2. Verifica que el servidor esté funcionando: `GET /health`
3. Confirma que el token de acceso se está enviando en las peticiones
4. Revisa los logs del servidor en la consola

## 🎯 Próximos Pasos Sugeridos

- [ ] Implementar actualización en tiempo real con Supabase Realtime
- [ ] Agregar notificaciones push
- [ ] Implementar búsqueda y filtros de productos
- [ ] Agregar categorías de productos
- [ ] Sistema de notificaciones por email (configurar servidor SMTP)
- [ ] Panel de administración para gestionar usuarios y roles
