# 🚀 Guía de Lanzamiento - CONECTOCA

## 📋 Pasos para Lanzar tu Aplicación

Esta guía te llevará desde el código actual hasta una aplicación completamente funcional y accesible.

---

## 🔧 PASO 1: Configuración de Supabase

### 1.1 Verificar que Supabase esté Configurado

Tu aplicación ya está conectada a Supabase. Verifica que tengas:

✅ **Proyecto de Supabase creado** (ya está configurado)
✅ **Variables de entorno disponibles**:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 Verificar Tabla KV Store

La aplicación usa una tabla `kv_store_6d979413` que debería estar creada automáticamente. Esta tabla almacena:
- Pedidos
- Productos/Stock
- Notificaciones
- Configuraciones de usuario

**No necesitas hacer nada**, ya está configurada.

---

## 🖥️ PASO 2: Desplegar el Servidor (Edge Functions)

Tu aplicación tiene un servidor backend en `/supabase/functions/server/index.tsx` que necesita estar desplegado.

### 2.1 Instalar Supabase CLI (si no lo tienes)

```bash
# En tu terminal/consola local
npm install -g supabase
```

### 2.2 Iniciar Sesión en Supabase

```bash
supabase login
```

Esto abrirá tu navegador para autenticarte.

### 2.3 Vincular tu Proyecto

```bash
# Obtén el ID de tu proyecto desde el dashboard de Supabase
# URL: https://supabase.com/dashboard/project/[PROJECT_ID]

supabase link --project-ref [TU_PROJECT_ID]
```

### 2.4 Desplegar las Edge Functions

```bash
# Despliega la función del servidor
supabase functions deploy server
```

### 2.5 Verificar el Despliegue

El servidor estará disponible en:
```
https://[TU_PROJECT_ID].supabase.co/functions/v1/make-server-6d979413/
```

**Prueba que funcione**:
```bash
curl https://[TU_PROJECT_ID].supabase.co/functions/v1/make-server-6d979413/health
```

Deberías recibir: `{"status":"ok"}`

---

## 🌐 PASO 3: Desplegar el Frontend

Tu aplicación React puede desplegarse en varias plataformas. Aquí están las opciones más fáciles:

### OPCIÓN A: Vercel (Recomendado - Más Fácil)

1. **Crear cuenta en Vercel** (si no tienes): https://vercel.com

2. **Subir tu código a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "CONECTOCA - App completa"
   git remote add origin [TU_REPO_GITHUB]
   git push -u origin main
   ```

3. **Importar en Vercel**:
   - Ve a https://vercel.com/new
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto React
   - Click en "Deploy"

4. **Configurar Variables de Entorno en Vercel**:
   - Ve a Project Settings > Environment Variables
   - Agrega las mismas variables de Supabase (ya están disponibles automáticamente en Figma Make)

5. **Tu app estará lista en**: `https://tu-app.vercel.app`

### OPCIÓN B: Netlify

1. **Crear cuenta en Netlify**: https://netlify.com

2. **Subir código a GitHub** (mismo proceso que Vercel)

3. **Importar en Netlify**:
   - Ve a https://app.netlify.com/start
   - Conecta tu repositorio
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

4. **Tu app estará lista en**: `https://tu-app.netlify.app`

### OPCIÓN C: Desplegar Directo en Supabase Hosting

Supabase también puede alojar tu frontend:

```bash
# Build de producción
npm run build

# Deploy en Supabase Storage
supabase storage upload build dist/
```

---

## 👥 PASO 4: Crear Primer Usuario (Administrador)

Una vez desplegada la aplicación:

### 4.1 Acceder a la Aplicación

Abre la URL de tu app desplegada (Vercel, Netlify, etc.)

### 4.2 Crear Cuenta de Producción

1. En la pantalla de login, click en **"Crear cuenta"**
2. Completa los datos:
   - **Nombre**: Tu nombre o "Administrador"
   - **Email**: tu-email@ejemplo.com
   - **Contraseña**: (crea una segura)
   - **Rol**: Selecciona **"Producción"**
3. Click en **"Crear Cuenta"**

### 4.3 Crear Cuenta de Cliente (Opcional)

Para probar el flujo completo:

1. Cierra sesión
2. Crea otra cuenta con rol **"Cliente"**
3. Usa un email diferente

---

## 📦 PASO 5: Configurar Stock Inicial

### 5.1 Acceder al Área de Producción

1. Inicia sesión con la cuenta de **Producción**
2. En el menú principal, selecciona **"Área de Producción"**
3. Verás el KDS (Kitchen Display System)

### 5.2 Reabastecer Stock

1. En el área de producción, busca el botón de **"Reabastecimiento"** o el ícono de paquete
2. Verás la lista de productos disponibles
3. **Productos predefinidos**:
   - Pan de Molde Integral (Stock inicial: 100)
   - Pan de Molde Blanco (Stock inicial: 100)
   - Pan Hallulla (Stock inicial: 150)
   - Pan Marraqueta (Stock inicial: 150)
   - Torta de Chocolate (Stock inicial: 50)
   - Torta de Vainilla (Stock inicial: 50)
   - Galletas Surtidas (Stock inicial: 200)
   - Empanadas de Queso (Stock inicial: 80)
   - Empanadas de Carne (Stock inicial: 80)
   - Donas Glaseadas (Stock inicial: 100)

4. **Agregar stock**:
   - Ingresa la cantidad a agregar para cada producto
   - Click en **"Guardar Cambios"**

---

## 📱 PASO 6: Flujo de Uso Completo

### Como CLIENTE:

1. **Iniciar sesión** con cuenta de cliente
2. **Ir a "Nuevo Pedido"**
3. **Seleccionar productos**:
   - Elige el producto del dropdown
   - Especifica cantidad
   - Verás el precio unitario y subtotal
4. **Agregar más productos** (click en "+ Agregar otro producto")
5. **Ver resumen del pedido**:
   - Lista de productos
   - Total calculado automáticamente
6. **Completar información**:
   - Fecha límite de entrega
   - La dirección se toma automáticamente de tu perfil
7. **Enviar pedido**
8. **Ver estado** en pantalla principal
9. **Recibir notificaciones** cuando el estado cambie

### Como PRODUCCIÓN:

1. **Iniciar sesión** con cuenta de producción
2. **Ir a "Área de Producción"** (KDS)
3. **Ver pedidos nuevos**:
   - Filtrar por "Pendiente"
   - Los pedidos aparecen con animación
4. **Buscar y filtrar**:
   - Usar barra de búsqueda para encontrar pedidos
   - Aplicar filtros avanzados (fecha, monto, cliente)
   - Ordenar por criterio deseado
5. **Marcar prioritarios**:
   - Click en la estrella de pedidos urgentes
6. **Gestionar pedido**:
   - Click en la tarjeta del pedido
   - Ver detalles completos
   - Cambiar estado:
     - Pendiente → En Preparación
     - En Preparación → Completado
   - Imprimir guía de despacho
7. **Stock se descuenta automáticamente** al crear el pedido

---

## 🔔 PASO 7: Configurar Notificaciones

### 7.1 Como Cliente

1. Ve a **"Perfil"**
2. Sección **"Preferencias de Notificaciones"**
3. Activa las notificaciones que desees:
   - ✅ Pedido confirmado
   - ✅ Pedido en preparación
   - ✅ Pedido completado
   - ✅ Actualizaciones de estado
4. Click en **"Guardar Preferencias"**

### 7.2 Recibir Notificaciones

- Las notificaciones aparecen en el **ícono de campana** (header)
- Badge rojo indica notificaciones sin leer
- Click en la campana para ver todas
- Animación de balanceo al recibir nuevas notificaciones

---

## 📊 PASO 8: Monitoreo y Análisis (Producción)

### 8.1 Ver Estadísticas

1. Inicia sesión con cuenta de Producción
2. Ve a **"Análisis"** en el menú
3. Verás:
   - Resumen de pedidos (totales, pendientes, completados, cancelados)
   - Gráficos de tendencias
   - Productos más vendidos
   - Estadísticas de clientes

### 8.2 Filtrar Datos

- Selecciona rango de fechas
- Ve métricas específicas del período
- Exporta reportes (si está implementado)

---

## 🎨 PASO 9: Personalización (Opcional)

### 9.1 Actualizar Logo

Los logos de La Oca ya están integrados en:
- Login
- Headers
- Guías de despacho

Si quieres cambiarlos, busca las referencias a:
```typescript
import logo from 'figma:asset/...'
import logoFull from 'figma:asset/...'
```

### 9.2 Cambiar Colores del Tema

Edita `/styles/globals.css` para ajustar:
- Colores azules primarios
- Amarillo secundario de La Oca
- Tonos oscuros del tema

---

## 🔒 PASO 10: Seguridad y Backup

### 10.1 Backup de Datos

Supabase hace backups automáticos, pero puedes exportar manualmente:

1. Ve al **Dashboard de Supabase**
2. Database > Backups
3. Descarga backup manual si lo necesitas

### 10.2 Gestión de Usuarios

Para ver todos los usuarios:
1. Dashboard de Supabase
2. Authentication > Users
3. Puedes ver, editar o eliminar usuarios

### 10.3 Seguridad de API Keys

⚠️ **IMPORTANTE**:
- Nunca compartas tu `SUPABASE_SERVICE_ROLE_KEY`
- Solo usa `SUPABASE_ANON_KEY` en el frontend
- El service role key solo debe estar en el servidor

---

## 📱 PASO 11: Acceso Móvil

La aplicación es **completamente responsive** y funciona en móviles:

### iOS/Safari:
1. Abre la app en Safari
2. Toca el botón "Compartir"
3. Selecciona "Agregar a pantalla de inicio"
4. Ahora tendrás un ícono como app nativa

### Android/Chrome:
1. Abre la app en Chrome
2. Toca los tres puntos (menú)
3. Selecciona "Agregar a pantalla de inicio"
4. Acepta el prompt

---

## 🐛 PASO 12: Solución de Problemas

### Problema: "No se pueden cargar los pedidos"

**Solución**:
1. Verifica que el servidor esté desplegado
2. Revisa la consola del navegador (F12)
3. Confirma que las variables de entorno estén correctas

### Problema: "Stock no se descuenta"

**Solución**:
1. Verifica que el producto exista en el stock
2. Revisa que la cantidad solicitada sea menor al stock disponible
3. Chequea logs del servidor

### Problema: "No recibo notificaciones"

**Solución**:
1. Verifica preferencias en el perfil
2. Asegúrate de tener cuenta activa
3. Refresca la página

### Problema: "Error al crear usuario"

**Solución**:
1. Verifica que el email no esté ya registrado
2. Usa una contraseña de al menos 6 caracteres
3. Revisa configuración de auth en Supabase

---

## ✅ CHECKLIST FINAL DE LANZAMIENTO

Antes de compartir la app con usuarios, verifica:

- [ ] Servidor desplegado y funcionando
- [ ] Frontend desplegado (Vercel/Netlify)
- [ ] Cuentas de prueba creadas (Cliente y Producción)
- [ ] Stock inicial configurado
- [ ] Pedido de prueba creado exitosamente
- [ ] Cambio de estado funciona correctamente
- [ ] Notificaciones se reciben
- [ ] Guía de despacho se imprime correctamente
- [ ] Búsqueda y filtros funcionan
- [ ] Prioridades se marcan correctamente
- [ ] Analytics muestra datos
- [ ] Responsive funciona en móvil
- [ ] Variables de entorno seguras

---

## 🎯 URLs Importantes

Una vez desplegado, tendrás estas URLs:

**Frontend (Aplicación)**:
- Vercel: `https://conectoca.vercel.app` (ejemplo)
- Netlify: `https://conectoca.netlify.app` (ejemplo)
- O tu dominio personalizado

**Backend (Servidor)**:
- `https://[PROJECT_ID].supabase.co/functions/v1/make-server-6d979413/`

**Dashboard de Supabase**:
- `https://supabase.com/dashboard/project/[PROJECT_ID]`

---

## 📞 Próximos Pasos Después del Lanzamiento

1. **Compartir con equipo de La Oca**
2. **Capacitar al personal de producción**
3. **Onboarding de primeros clientes**
4. **Recopilar feedback**
5. **Monitorear uso y errores**
6. **Ajustar stock según demanda**
7. **Optimizar flujos según necesidad**

---

## 🎉 ¡Felicidades!

Tu aplicación CONECTOCA está lista para usarse en producción. Si necesitas ayuda adicional, revisa los archivos de documentación:

- `SUPABASE_README.md` - Detalles técnicos de Supabase
- `PRODUCCION_AVANZADA_IMPLEMENTADO.md` - Sistema KDS
- `NOTIFICACIONES_IMPLEMENTADO.md` - Sistema de notificaciones
- `ANALYTICS_IMPLEMENTADO.md` - Dashboard de análisis

---

**Última actualización**: Octubre 2025
**Versión de la app**: 1.0.0
**Estado**: ✅ Lista para Producción
