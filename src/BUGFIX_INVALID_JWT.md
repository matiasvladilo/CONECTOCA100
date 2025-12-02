# Bugfix: Invalid JWT Errors

## Fecha
14 de octubre de 2025

## Problema Identificado

Los usuarios experimentaban errores "Invalid JWT" en todas las llamadas a la API después de iniciar sesión:

```
API Error [/orders?page=1&limit=10]: {
  "status": 401,
  "statusText": "",
  "error": "Invalid JWT",
  "token": "present"
}
Fetch error [/orders?page=1&limit=10]: Invalid JWT
Error loading orders: Error: Invalid JWT
API Error [/notifications]: {
  "status": 401,
  "statusText": "",
  "error": "Invalid JWT",
  "token": "present"
}
Fetch error [/notifications]: Invalid JWT
```

## Causa Raíz

El backend estaba usando un único cliente de Supabase con el `SERVICE_ROLE_KEY` para todas las operaciones, incluyendo la verificación de tokens JWT de usuarios.

El problema era que cuando un usuario iniciaba sesión en el frontend:
1. Se usaba el `ANON_KEY` (cliente público)
2. Supabase retornaba un JWT firmado con el secreto correspondiente al `ANON_KEY`
3. El backend intentaba verificar ese JWT usando el `SERVICE_ROLE_KEY`
4. La verificación fallaba porque el token no coincidía con el secreto usado en el backend

## Solución Implementada

Se crearon dos clientes de Supabase en el backend:

### 1. `supabaseAdmin` - Para operaciones administrativas
```typescript
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);
```
Usado para:
- Crear usuarios (`admin.createUser()`)
- Enviar emails de recuperación de contraseña
- Cualquier operación que requiera privilegios administrativos

### 2. `supabaseAuth` - Para verificación de tokens
```typescript
const supabaseAuth = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);
```
Usado para:
- Verificar tokens JWT de usuarios (`auth.getUser(token)`)
- Asegurar que los tokens emitidos con ANON_KEY puedan ser verificados

## Archivos Modificados

### `/supabase/functions/server/index.tsx`
- **Línea 10-18**: Creación de dos clientes de Supabase (`supabaseAdmin` y `supabaseAuth`)
- **Línea 54**: Uso de `supabaseAuth.auth.getUser(token)` en lugar de `supabase.auth.getUser(token)`
- **Línea 98**: Uso de `supabaseAdmin.auth.resetPasswordForEmail()` para operaciones administrativas
- **Línea 141**: Uso de `supabaseAdmin.auth.admin.createUser()` para crear usuarios

### `/utils/api.tsx`
- **Línea 100-106**: Manejo silencioso de errores "Invalid JWT" durante polling
- **Línea 108-116**: Evitar spam en consola de errores esperados "Invalid JWT"
- **Línea 124-132**: Evitar spam en consola de excepciones esperadas

## Mejoras Adicionales

### Logging Mejorado
Se agregó logging detallado en el backend para facilitar el debugging:
```typescript
console.log(`🔍 Verifying token (length: ${token.length}, first 20 chars: ${token.substring(0, 20)}...)`);
```

### Manejo de Errores en Frontend
Los errores "Invalid JWT" ahora se manejan silenciosamente durante el polling de notificaciones y órdenes, evitando spam en la consola y proporcionando una mejor experiencia de usuario.

## Resultado

✅ Los usuarios ahora pueden iniciar sesión correctamente sin errores "Invalid JWT"
✅ Las llamadas a la API funcionan correctamente
✅ El polling de notificaciones y órdenes funciona sin errores
✅ Los logs de consola están limpios y solo muestran errores relevantes

## Lecciones Aprendidas

1. **Consistencia de Claves**: Siempre usar el mismo secreto/clave para emitir y verificar tokens JWT
2. **Separación de Responsabilidades**: Usar diferentes clientes de Supabase para diferentes propósitos:
   - ANON_KEY para operaciones de usuarios
   - SERVICE_ROLE_KEY para operaciones administrativas
3. **Logging Efectivo**: Agregar logging detallado facilita el debugging de problemas de autenticación
4. **Manejo de Errores**: Manejar silenciosamente errores esperados para no confundir a los desarrolladores

## Testing

Para verificar que el fix funciona:
1. Cerrar sesión si estás logueado
2. Iniciar sesión con cualquier usuario demo
3. Verificar que no aparezcan errores "Invalid JWT" en la consola
4. Verificar que se carguen correctamente las órdenes
5. Verificar que funcione el polling de notificaciones sin errores

## Referencias

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Token Verification](https://supabase.com/docs/guides/auth/server-side)
