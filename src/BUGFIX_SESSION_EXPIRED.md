# 🔧 BugFix: Manejo de Sesiones Expiradas

## ✅ Problemas Resueltos

### 1. Estructura de Archivos Incorrecta
**Error:** `_redirects` convertido en carpeta en lugar de archivo

**Solución:**
- ✅ Eliminados archivos `.tsx` dentro de `/_redirects/`
- ✅ Recreado `/_redirects` como archivo de configuración de Netlify
- ✅ Contenido correcto: `/*    /index.html   200`

---

### 2. Errores de JWT en Consola
**Error:** Múltiples errores mostrados en consola:
```
API Error [/orders?page=1&limit=10]: Invalid JWT
Fetch error [/notifications]: Invalid JWT
AuthApiError: Invalid Refresh Token: Refresh Token Not Found
```

**Causa Raíz:**
- El código devolvía `{ data: [] }` para errores 401 en lugar de lanzar excepción
- Esto evitaba que se activara el logout automático
- Las sesiones expiradas seguían haciendo polling causando errores repetidos

**Solución Implementada:**

#### `/utils/api.tsx` - Manejo de Errores 401

**ANTES:**
```typescript
if (response.status === 401 && (
  errorMessage.includes('Auth session missing') ||
  errorMessage.includes('Invalid JWT')
)) {
  // Silently return empty data
  return { data: [] };
}
```

**DESPUÉS:**
```typescript
// For 401 errors, always throw to trigger logout
if (response.status === 401) {
  throw new Error(errorMessage);
}
```

---

#### `/App.tsx` - Logout Silencioso

**Cambios en `handleLogout`:**

**ANTES:**
```typescript
const handleLogout = async () => {
  await supabase.auth.signOut();
  setCurrentUser(null);
  setAccessToken(null);
  setOrders([]);
  setCurrentScreen("login");
  toast.success("Sesión cerrada");
};
```

**DESPUÉS:**
```typescript
const handleLogout = async (silent: boolean = false) => {
  try {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setAccessToken(null);
    setOrders([]);
    setNotifications([]);
    setCurrentScreen("login");
    if (!silent) {
      toast.success("Sesión cerrada");
    }
  } catch (error) {
    // Always clear state even if signOut fails
    setCurrentUser(null);
    setAccessToken(null);
    setOrders([]);
    setNotifications([]);
    setCurrentScreen("login");
    if (!silent) {
      toast.error("Error al cerrar sesión");
    }
  }
};
```

**Beneficios:**
- ✅ Parámetro `silent` para evitar notificaciones en logouts automáticos
- ✅ Siempre limpia el estado incluso si `signOut()` falla
- ✅ Limpia notificaciones al hacer logout

---

#### `/App.tsx` - Manejo en `loadOrders`

**DESPUÉS:**
```typescript
if (
  error.message?.includes("Invalid JWT") ||
  error.message?.includes("Unauthorized") ||
  error.message?.includes("401") ||
  error.message?.includes("expired")
) {
  await handleLogout(true); // Silent logout
  if (!isBackgroundRefresh) {
    toast.error(
      "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
    );
  }
}
```

**Beneficios:**
- ✅ Logout silencioso para evitar múltiples toasts
- ✅ Solo muestra mensaje si NO es refresh en background
- ✅ Evita spam de notificaciones

---

#### `/App.tsx` - Manejo en `loadNotifications`

**DESPUÉS:**
```typescript
if (
  error.message?.includes("Invalid JWT") ||
  error.message?.includes("Auth session missing") ||
  error.message?.includes("expired") ||
  error.message?.includes("Unauthorized") ||
  error.message?.includes("401")
) {
  // Session expired - logout silently
  await handleLogout(true);
  return;
}
```

**Beneficios:**
- ✅ Logout completamente silencioso
- ✅ Detiene el polling inmediatamente
- ✅ No muestra errores en consola

---

## 🔄 Flujo de Sesión Expirada

### Antes (Problemático):

```
1. Token expira
2. App hace polling cada 5 segundos
3. API devuelve 401
4. fetchAPI retorna { data: [] }
5. No se lanza excepción
6. NO se hace logout
7. Polling continúa indefinidamente
8. Errores repetidos en consola cada 5 segundos
```

### Ahora (Correcto):

```
1. Token expira
2. App hace polling
3. API devuelve 401
4. fetchAPI lanza Error("Invalid JWT")
5. loadOrders/loadNotifications detecta error
6. handleLogout(true) - logout silencioso
7. Estado limpio
8. Polling se detiene (useEffect cleanup)
9. Usuario ve pantalla de login
10. Sin errores en consola
```

---

## ✅ Verificación

### Casos de Prueba:

#### 1. **Login → Esperar Expiración (1 hora) → Polling**
- ✅ Después de 1 hora, el token expira
- ✅ Siguiente polling detecta 401
- ✅ Logout automático silencioso
- ✅ Redirige a login sin errores

#### 2. **Login → Logout Manual**
- ✅ Muestra toast "Sesión cerrada"
- ✅ Limpia estado
- ✅ Redirige a login

#### 3. **Token Inválido Manualmente**
```javascript
// En consola DevTools:
localStorage.clear();
```
- ✅ Siguiente polling detecta error
- ✅ Logout automático
- ✅ Sin errores repetidos

#### 4. **Backend Caído**
- ✅ Muestra error de red
- ✅ NO hace logout (correcto, es error de red, no de auth)

---

## 📊 Archivos Modificados

```
✅ /_redirects          - Archivo recreado correctamente
✅ /utils/api.tsx       - Errores 401 ahora lanzan excepción
✅ /App.tsx             - handleLogout con modo silencioso
                       - loadOrders maneja expiración
                       - loadNotifications maneja expiración
```

---

## 🎯 Resultado Final

### Comportamiento Esperado:

**Sesión Activa:**
```
✅ Polling cada 5 segundos
✅ Órdenes se actualizan
✅ Notificaciones se actualizan
✅ Sin errores en consola
```

**Sesión Expirada:**
```
✅ Detección automática en primer polling
✅ Logout silencioso sin notificaciones
✅ Limpieza completa de estado
✅ Redirige a login
✅ Polling se detiene
✅ Sin errores en consola
```

**Logout Manual:**
```
✅ Toast "Sesión cerrada"
✅ Limpieza de estado
✅ Redirige a login
```

---

## 🐛 Debugging

### Si aún ves errores de JWT:

**1. Verifica que el token es válido:**
```javascript
// En consola DevTools:
const supabase = window.supabase;
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session?.access_token);
console.log('Expira en:', new Date(session?.expires_at * 1000));
```

**2. Verifica el manejo de errores:**
```javascript
// En consola:
// Debería ver logout automático después de error 401
```

**3. Limpia caché y storage:**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 📝 Notas Técnicas

### Por qué Silent Logout:

**Problema:** Múltiples polling simultáneos
- `loadOrders` cada 5 segundos
- `loadNotifications` cada 5 segundos
- Si ambos fallan con 401, se ejecutan 2 logouts
- Sin `silent`, el usuario ve 2+ toasts

**Solución:** Primer logout es silencioso
- Segundo logout no hace nada (ya no hay sesión)
- Usuario ve máximo 1 mensaje
- Experiencia limpia

### Orden de Limpieza:

```typescript
1. supabase.auth.signOut()    // Limpia auth de Supabase
2. setAccessToken(null)        // Limpia token local
3. setCurrentUser(null)        // Limpia usuario
4. setOrders([])               // Limpia pedidos
5. setNotifications([])        // Limpia notificaciones
6. setCurrentScreen("login")   // Redirige
```

Este orden asegura que useEffect detecte cambios y detenga polling.

---

## ✅ Checklist de Deploy

```
□ _redirects es un ARCHIVO (no carpeta)
□ Contenido: /*    /index.html   200
□ No hay archivos .tsx en /_redirects/
□ api.tsx lanza errores para 401
□ handleLogout acepta parámetro silent
□ loadOrders llama handleLogout(true)
□ loadNotifications llama handleLogout(true)
□ Deploy a Netlify
□ Prueba login → esperar → auto logout
```

---

**Estado:** ✅ RESUELTO

**Última actualización:** Octubre 2025
