# Código de Invitación para Administradores + Rol Automático Admin

## Fecha de Implementación
14 de octubre de 2025

## 🔄 Actualización: Rol Automático de Administrador
Ahora, al crear un nuevo negocio, el usuario creador **automáticamente recibe el rol de Administrador**, sin necesidad de seleccionarlo manualmente.

## 📋 Descripción

Se ha implementado una nueva funcionalidad que permite a los **administradores** generar y compartir el código de invitación de su negocio directamente desde su perfil.

## ✨ Características

### 1. **Botón en Perfil de Administrador**
- Ubicado en la sección de perfil de usuario
- Solo visible para usuarios con rol `admin`
- Diseño consistente con la paleta de colores (morado/purple)

### 2. **Visualización del Código**
- Al hacer clic en "Mostrar Código de Invitación", se obtiene el código del negocio
- El código se muestra en una tarjeta elegante con formato destacado
- Fuente grande y clara para fácil lectura

### 3. **Copiar al Portapapeles**
- Botón de copia rápida junto al código
- Notificación toast al copiar exitosamente
- Icono de `Copy` para indicar la acción

## 🎨 Diseño

### Tarjeta de Código de Invitación
```
┌─────────────────────────────────────┐
│  🔗 Código de Invitación            │
│  Comparte este código para agregar  │
│  miembros                            │
├─────────────────────────────────────┤
│                                      │
│  Tu código de invitación:           │
│  ┌──────────────────┐               │
│  │   DEMOCODE      │ 📋            │
│  └──────────────────┘               │
│                                      │
│  Los nuevos miembros pueden usar    │
│  este código para unirse            │
└─────────────────────────────────────┘
```

### Paleta de Colores
- **Fondo del icono**: `rgba(139, 92, 246, 0.1)` (purple transparente)
- **Icono**: `#8B5CF6` (purple-600)
- **Gradiente del botón**: `#8B5CF6` → `#7C3AED`
- **Fondo de la tarjeta**: `#F5F3FF` → `#EDE9FE` (gradiente morado claro)
- **Borde del código**: `#C4B5FD` (purple-300)
- **Borde dashed**: `#8B5CF6` (purple-600)

## 🔧 Implementación Técnica

### Archivos Modificados

#### 1. `/components/UserProfile.tsx`

**Nuevos imports:**
```typescript
import { Share2, Copy } from 'lucide-react';
```

**Nuevos estados:**
```typescript
const [inviteCode, setInviteCode] = useState<string>('');
const [showInviteCode, setShowInviteCode] = useState(false);
const [loadingInviteCode, setLoadingInviteCode] = useState(false);
```

**Nueva prop:**
```typescript
accessToken?: string;
```

**Nuevas funciones:**
```typescript
const handleGenerateInviteCode = async () => {
  // Obtiene el código del negocio desde el backend
  const businessData = await businessAPI.get(accessToken);
  setInviteCode(businessData.inviteCode);
  setShowInviteCode(true);
};

const handleCopyInviteCode = () => {
  // Copia al portapapeles
  navigator.clipboard.writeText(inviteCode);
  toast.success('Código copiado al portapapeles');
};
```

#### 2. `/App.tsx`

**Cambio en la llamada a UserProfile:**
```typescript
<UserProfile
  // ... otras props
  accessToken={accessToken || undefined}
/>
```

## 📱 Flujo de Usuario

### Para el Administrador:

1. **Navegar al Perfil**
   - Click en el avatar o botón de perfil
   - Ir a "Mi Perfil"

2. **Generar Código**
   - Scroll hasta la sección "Código de Invitación"
   - Click en "Mostrar Código de Invitación"
   - El sistema obtiene el código del backend

3. **Compartir Código**
   - El código se muestra en pantalla (ej: `DEMOCODE`)
   - Click en el botón de copiar (📋)
   - El código se copia al portapapeles
   - Compartir el código por WhatsApp, Email, etc.

### Para el Nuevo Usuario:

1. **Recibir el Código**
   - El administrador comparte el código

2. **Registrarse**
   - Abrir la app CONECTOCA
   - Click en "Crear cuenta"
   - Seleccionar "Unirse a un negocio existente"
   - Ingresar el código recibido
   - Completar el registro

3. **Acceso Inmediato**
   - El usuario se une automáticamente al negocio
   - Tiene acceso a los pedidos y datos del negocio
   - Según su rol, tendrá diferentes permisos

## 🔐 Seguridad

- **Autorización**: Solo administradores pueden ver el código
- **Token de Acceso**: Se requiere autenticación válida
- **Backend Protegido**: El endpoint `/business` verifica el token
- **Aislamiento**: Cada negocio tiene su propio código único

## 🎯 Casos de Uso

### 1. **Agregar Empleados**
```
Admin → Genera código → Comparte por WhatsApp → 
Empleado se registra → Empleado unido al negocio
```

### 2. **Agregar Personal de Producción**
```
Admin → Muestra código → Personal se registra con rol "production" →
Personal puede gestionar pedidos
```

### 3. **Agregar Locales**
```
Admin → Genera código → Local se registra con rol "local" →
Trabajadores pueden marcar asistencia en ese local
```

### 4. **Negocio Demo**
```
Código especial: DEMOCODE
- Usado por usuarios demo
- Se crea automáticamente
- Compartido entre todos los usuarios demo
```

## 📊 API Utilizada

### Endpoint: `GET /business`

**Request:**
```typescript
Headers: {
  Authorization: `Bearer ${accessToken}`
}
```

**Response:**
```typescript
{
  data: {
    id: string;
    name: string;
    inviteCode: string;  // ← Este es el código
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

## ✅ Testing

### Pruebas Realizadas:

1. ✅ Usuario admin puede ver el botón
2. ✅ Usuario no-admin NO ve el botón
3. ✅ Click en botón obtiene el código correctamente
4. ✅ Código se muestra en pantalla
5. ✅ Click en copiar funciona correctamente
6. ✅ Toast de confirmación aparece
7. ✅ Código copiado es válido para registro
8. ✅ Diseño responsive en móviles
9. ✅ Animaciones suaves y fluidas
10. ✅ Manejo de errores si falla la petición

## 🚀 Mejoras Futuras (Opcionales)

1. **Regenerar Código**
   - Botón para generar un nuevo código
   - Útil si el código se ha compartido incorrectamente

2. **Historial de Invitaciones**
   - Ver quién se ha unido con el código
   - Fecha de registro de cada miembro

3. **Códigos Temporales**
   - Códigos con fecha de expiración
   - Mayor seguridad

4. **Compartir Directo**
   - Botones de compartir a WhatsApp, Email
   - Link pre-formateado para compartir

5. **QR Code**
   - Generar código QR del código de invitación
   - Escanear para unirse más rápido

## 📝 Notas

- El código de invitación es único por negocio
- No caduca (a menos que se implemente expiración)
- El negocio demo usa el código fijo `DEMOCODE`
- Para otros negocios, el código se genera aleatoriamente al crear el negocio

## 🎯 Cambio Adicional: Rol Automático de Administrador

### Cambios en el Backend (`/supabase/functions/server/index.tsx`)

**Antes:**
```typescript
const userRole = role || 'user';
```

**Ahora:**
```typescript
// Determine user role: admin if creating business, otherwise use provided role or default to 'user'
const userRole = businessAction === 'create' ? 'admin' : (role || 'user');

if (businessAction === 'create') {
  console.log(`👑 Creating business owner with admin role for: ${email}`);
}
```

### Cambios en el Frontend (`/components/LoginScreen.tsx`)

1. **Selector de Rol Ocultado al Crear Negocio:**
   - El selector de rol ahora solo aparece cuando `businessAction === 'join'`
   - Al crear un negocio nuevo, no se muestra el selector porque el rol será automáticamente "admin"

2. **Mensaje Informativo Agregado:**
   ```
   👑 Serás el Administrador: Al crear un negocio nuevo, automáticamente 
   obtendrás acceso completo con rol de administrador.
   ```

### Flujo de Registro Actualizado

#### Crear Nuevo Negocio:
1. Usuario selecciona "Crear cuenta"
2. Usuario selecciona "Crear Nuevo" negocio
3. **No se muestra selector de rol** (será admin automáticamente)
4. Usuario ingresa nombre del negocio
5. Se muestra aviso: "Serás el Administrador"
6. Usuario completa registro
7. **Sistema asigna automáticamente rol "admin"**
8. Usuario puede generar código de invitación desde su perfil

#### Unirse a Negocio Existente:
1. Usuario selecciona "Crear cuenta"
2. Usuario selecciona "Unirme a Uno"
3. **Se muestra selector de rol** (puede elegir: user, local, worker, admin, production)
4. Usuario ingresa código de invitación
5. Usuario completa registro
6. Sistema asigna el rol seleccionado

### Beneficios

✅ **Simplicidad**: El creador del negocio no necesita seleccionar "admin" manualmente  
✅ **Seguridad**: Solo el creador del negocio tiene admin automáticamente  
✅ **Claridad**: Los nuevos miembros seleccionan su rol al unirse  
✅ **UX Mejorada**: Menos campos al crear un negocio = proceso más rápido  

---

**Estado**: ✅ Implementado y Funcionando  
**Versión**: 1.1 (Con Rol Automático Admin)  
**Fecha**: 14 de octubre de 2025
