# 🔍 DEBUG PARA USUARIOS JEJE Y JOJO

## PASO 1: Abre la Consola

Presiona **F12** y ve a la pestaña **Console**

---

## PASO 2: Inicia sesión con jeje o jojo

Inicia sesión con:
- **jeje** (rol: production)
- **jojo** (rol: admin)

---

## PASO 3: Busca estos mensajes en la consola

Deberías ver:

```
[AUDIO_INIT] Componente montado
[AUDIO_INIT] Rol del usuario: production    (o 'admin')
[AUDIO_INIT] ✓ Usuario tiene rol válido para audio
[AUDIO_INIT] ¿Ya inicializado? null    (o 'true')
```

### 🔍 DIAGNÓSTICO:

#### Caso A: Ves los mensajes de [AUDIO_INIT]

**¿Qué dice "Rol del usuario"?**

- Si dice `production` o `admin` → ✅ Correcto
- Si dice `user` o `undefined` → ❌ El usuario no tiene el rol correcto

**¿Qué dice "¿Ya inicializado?"?**

- Si dice `null` → Deberías ver el botón naranja en 1 segundo
- Si dice `'true'` → El audio ya fue activado antes (limpia sessionStorage)

**¿Dice "MOSTRANDO BOTÓN NARANJA"?**

- Si SÍ → El botón debería aparecer
- Si NO → Hay un problema con el timer

#### Caso B: NO ves ningún mensaje de [AUDIO_INIT]

El componente AudioInitializer no se está montando. Verifica:
- ¿Estás en la pantalla correcta? (Home, Producción, etc.)
- ¿El usuario está realmente logueado?

---

## PASO 4: Verificar el rol del usuario

Ejecuta esto en la consola:

```javascript
sessionStorage.getItem('currentUser')
```

Deberías ver algo como:
```json
{
  "id": "xxx",
  "name": "jeje",
  "email": "jeje@...",
  "role": "production"
}
```

**Verifica que `role` sea `"production"` o `"admin"`**

---

## PASO 5: Si el rol NO es correcto

El usuario fue creado con un rol incorrecto. Necesitas actualizar el rol en la base de datos.

### Opción A: Desde Supabase Dashboard

1. Ve a Supabase Dashboard
2. Abre la tabla `kv_store_6d979413`
3. Busca el usuario por email
4. Actualiza el campo `value` → `role` a `"production"` o `"admin"`

### Opción B: Crear un nuevo usuario con el rol correcto

Cierra sesión y crea un nuevo usuario asegurándote de seleccionar el rol correcto.

---

## PASO 6: Limpiar sessionStorage

Si el audio ya fue "inicializado" pero no funciona, limpia la caché:

Ejecuta en la consola:

```javascript
sessionStorage.removeItem('audio-initialized');
location.reload();
```

Esto hará que el botón naranja aparezca nuevamente.

---

## PASO 7: Verificar que el botón aparece

Después de iniciar sesión, espera **2 segundos**.

**¿Ves un botón naranja gigante en la parte inferior?**

- **SÍ** → Haz clic en él y continúa con PASO 8
- **NO** → Revisa la consola:
  - ¿Dice "MOSTRANDO BOTÓN NARANJA"?
  - ¿Hay algún error en rojo?

---

## PASO 8: Hacer clic en "ACTIVAR AUDIO"

Cuando hagas clic, deberías ver en la consola:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👆 USUARIO HIZO CLIC EN ACTIVAR AUDIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AUDIO] 🎬 INICIALIZANDO AUDIO...
[AUDIO] Audio context created, state: running
[AUDIO] ✅✅✅ AUDIO LISTO Y FUNCIONANDO ✅✅✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SOUND] 🔊 REPRODUCIENDO SONIDO...
[SOUND] 🎵 Reproduciendo patrón: NUEVO PEDIDO (3 beeps)
[SOUND] ✅✅✅ SONIDO REPRODUCIDO CON ÉXITO ✅✅✅
```

**Y DEBERÍAS ESCUCHAR 3 BEEPS**

---

## 🆘 TROUBLESHOOTING POR SÍNTOMA

### ❌ No veo el botón naranja

**Verifica:**
1. ¿El rol es `production` o `admin`?
2. ¿Esperaste al menos 2 segundos después del login?
3. ¿Hay mensajes de [AUDIO_INIT] en la consola?
4. ¿Dice "MOSTRANDO BOTÓN NARANJA" en la consola?

**Si no dice nada de [AUDIO_INIT]:**
- El componente no se está montando
- Verifica que `currentUser` existe en sessionStorage

### ❌ Veo el botón pero no escucho el sonido

**Verifica:**
1. ¿El volumen del sistema está alto?
2. ¿Otros sonidos funcionan? (YouTube, etc.)
3. ¿Hay errores rojos en la consola al hacer clic?
4. ¿Dice "Audio context state: suspended"?

**Si dice "suspended":**
```javascript
// Ejecuta esto en la consola después de hacer clic
sessionStorage.removeItem('audio-initialized');
// Luego recarga y vuelve a hacer clic en el botón
```

### ❌ El audio funciona en el botón pero no cuando llegan pedidos

**Verifica en la consola cuando llega un pedido:**

```
[NOTIF] ¿Audio inicializado por usuario? true
```

**Si dice `false` o `null`:**
- El sistema no detectó que activaste el audio
- Limpia sessionStorage y vuelve a activar

```javascript
sessionStorage.removeItem('audio-initialized');
location.reload();
```

---

## 📋 CHECKLIST COMPLETO

- [ ] Consola abierta (F12)
- [ ] Login con jeje o jojo
- [ ] Veo mensajes de [AUDIO_INIT] en consola
- [ ] El rol es "production" o "admin"
- [ ] Esperé 2 segundos
- [ ] Vi el botón naranja
- [ ] Hice clic en "ACTIVAR AUDIO"
- [ ] Escuché los 3 beeps
- [ ] Vi "✅ Audio Activado"
- [ ] No hay errores rojos
- [ ] Probé crear un pedido
- [ ] Escuché el sonido automático

---

## 🎯 SOLUCIONES RÁPIDAS

### Si el rol está mal:

```sql
-- Ejecuta esto en Supabase SQL Editor
UPDATE kv_store_6d979413
SET value = jsonb_set(value, '{role}', '"production"')
WHERE value->>'email' = 'jeje@tudominio.com';
```

### Si el botón no aparece:

```javascript
// En consola del navegador
sessionStorage.clear();
localStorage.clear();
location.reload();
```

### Si el audio no suena:

```javascript
// En consola del navegador
const ctx = new AudioContext();
console.log('Audio context state:', ctx.state);
// Si dice "suspended", haz clic en la página y ejecuta:
ctx.resume().then(() => console.log('State:', ctx.state));
```

---

## 📞 INFORMACIÓN PARA REPORTAR

Si nada funciona, copia y pega TODA esta información:

1. **Usuario:** jeje o jojo
2. **Rol del usuario:** (copia el resultado de `sessionStorage.getItem('currentUser')`)
3. **Audio inicializado:** (copia el resultado de `sessionStorage.getItem('audio-initialized')`)
4. **Navegador:** Chrome/Firefox/Safari y versión
5. **Sistema operativo:** Windows/Mac/Linux
6. **¿Ves el botón?** SÍ/NO
7. **¿Escuchas el sonido de prueba?** SÍ/NO
8. **Logs de consola:** Copia TODO lo que diga [AUDIO_INIT], [AUDIO], [SOUND], [NOTIF]
9. **Errores:** Copia cualquier mensaje en rojo

---

**¡COMIENZA EL DEBUG!** 🔍
