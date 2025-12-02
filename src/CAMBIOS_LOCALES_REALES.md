# Cambios: Eliminación de Locales Demo

## Fecha
14 de octubre de 2025

## Cambios Realizados

### Problema Anterior
La aplicación creaba automáticamente usuarios demo para los locales físicos:
- `local-centro@demo.com` → Local Centro
- `local-norte@demo.com` → Local Norte

Esto causaba que se mostraran locales duplicados en el selector, ya que había tanto usuarios demo como usuarios reales con el mismo propósito.

### Solución Implementada

Se eliminaron los usuarios demo de locales para usar únicamente usuarios reales creados por los administradores.

## Archivos Modificados

### 1. `/App.tsx`
**Cambios**: Se eliminaron los usuarios demo de locales del array `demoUsers`

**Antes**:
```typescript
const demoUsers = [
  { email: 'usuario@demo.com', password: 'demo123', name: 'Usuario Demo', role: 'user' as const },
  { email: 'produccion@demo.com', password: 'demo123', name: 'Equipo de Producción', role: 'production' as const },
  { email: 'local-centro@demo.com', password: 'demo123', name: 'Local Centro', role: 'local' as const },
  { email: 'local-norte@demo.com', password: 'demo123', name: 'Local Norte', role: 'local' as const },
  { email: 'trabajador@demo.com', password: 'demo123', name: 'Trabajador Demo', role: 'worker' as const }
];
```

**Después**:
```typescript
const demoUsers = [
  { email: 'usuario@demo.com', password: 'demo123', name: 'Usuario Demo', role: 'user' as const },
  { email: 'produccion@demo.com', password: 'demo123', name: 'Equipo de Producción', role: 'production' as const },
  { email: 'trabajador@demo.com', password: 'demo123', name: 'Trabajador Demo', role: 'worker' as const }
];
```

### 2. `/supabase/functions/server/index.tsx`
**Cambios**: Se agregó filtro para excluir cuentas demo de locales en el endpoint `/attendance/locals`

**Código actualizado**:
```typescript
// Filter users with role 'local' and exclude demo accounts
const locals = allUsers
  .filter((u: any) => 
    u.role === 'local' && 
    !u.email?.includes('@demo.com') // Exclude demo local accounts
  )
  .map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role
  }));

console.log(`✓ Retrieved ${locals.length} local users (excluding demos)`);
```

## Usuarios Demo Actuales

Ahora la aplicación solo incluye los siguientes usuarios demo:

### 1. Usuario Demo
- **Email**: `usuario@demo.com`
- **Contraseña**: `demo123`
- **Rol**: `user`
- **Descripción**: Usuario estándar que puede crear pedidos

### 2. Equipo de Producción
- **Email**: `produccion@demo.com`
- **Contraseña**: `demo123`
- **Rol**: `production`
- **Descripción**: Puede gestionar estados de productos en el área de producción

### 3. Trabajador Demo
- **Email**: `trabajador@demo.com`
- **Contraseña**: `demo123`
- **Rol**: `worker`
- **Descripción**: Trabajador que marca asistencia en los locales

## Usuarios de Locales (Reales)

Los locales ahora deben ser creados por usuarios reales con rol 'local'. Para crear un nuevo local:

1. Ir a la pantalla de login
2. Hacer clic en "Crear cuenta"
3. Ingresar:
   - Email del local (ej: `local.norte@laoca.com`)
   - Contraseña segura
   - Nombre del local (ej: "Local Norte")
   - Seleccionar rol: **Local**
4. El nuevo local aparecerá automáticamente en el selector de locales

## Beneficios

✅ **Sin duplicados**: Ya no habrá locales duplicados en el selector
✅ **Usuarios reales**: Solo se muestran locales creados por usuarios reales
✅ **Mejor control**: Los administradores tienen control total sobre qué locales existen
✅ **Datos de prueba limpios**: Los usuarios demo se limitan a roles básicos

## Flujo Actualizado

### Como Trabajador
1. Iniciar sesión con `trabajador@demo.com`
2. Acceder al módulo de Asistencia
3. Seleccionar un local físico de la lista de locales reales
4. Marcar entrada/salida

### Como Local (Administrador de Local)
1. Crear cuenta con rol 'local' (usuarios reales únicamente)
2. Iniciar sesión con las credenciales creadas
3. Ver historial de asistencias del local
4. Exportar reportes del personal
5. Filtrar por fechas y trabajadores

### Como Administrador de Producción
1. Iniciar sesión con `produccion@demo.com`
2. Ver asistencias de todos los locales reales
3. Filtrar por local específico
4. Exportar reportes globales

## Impacto en Usuarios Existentes

- **Usuarios con locales demo ya creados**: Los locales demo existentes (`local-centro@demo.com` y `local-norte@demo.com`) seguirán funcionando si ya están en la base de datos, pero no se crearán nuevamente
- **Nuevas instalaciones**: No se crearán locales demo automáticamente
- **Selector de locales**: Solo mostrará locales reales (excluyendo @demo.com)

## Testing

Para verificar los cambios:
1. ✅ Verificar que no se crean usuarios `local-centro@demo.com` ni `local-norte@demo.com`
2. ✅ Crear un usuario real con rol 'local'
3. ✅ Verificar que el nuevo local aparece en el selector de asistencia
4. ✅ Verificar que no hay duplicados en el selector
5. ✅ Marcar asistencia seleccionando el local real
6. ✅ Verificar que los filtros por local funcionan correctamente
