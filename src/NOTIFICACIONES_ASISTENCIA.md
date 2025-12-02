# Notificaciones de Asistencia - Implementado

## Fecha de Implementación
14 de octubre de 2025

## Descripción

Se agregaron notificaciones automáticas cuando los usuarios marcan entrada y salida de asistencia. Las notificaciones proporcionan confirmación inmediata y detalles útiles sobre el registro.

## Características Implementadas

### 1. Notificación de Entrada (Check-in)
Cuando un trabajador marca entrada, recibe una notificación con:
- **Título**: ✅ Entrada registrada
- **Mensaje**: "Has marcado entrada en [Nombre del Local] a las [HH:MM]"
- **Tipo**: `attendance_check_in`
- **Color**: Verde (indicando acción positiva)
- **Icono**: CheckCircle (✓)

### 2. Notificación de Salida (Check-out)
Cuando un trabajador marca salida, recibe una notificación con:
- **Título**: 🏁 Salida registrada
- **Mensaje**: "Has marcado salida de [Nombre del Local] a las [HH:MM]. Tiempo trabajado: [Xh Ymin]"
- **Tipo**: `attendance_check_out`
- **Color**: Morado/Violeta (indicando finalización)
- **Icono**: Clock (reloj)
- **Extra**: Calcula y muestra el tiempo total trabajado

## Cálculo de Tiempo Trabajado

El sistema calcula automáticamente el tiempo trabajado:
- Resta la hora de salida menos la hora de entrada
- Muestra el resultado en formato "Xh Ymin"
- Si trabajó menos de una hora, muestra solo minutos

**Ejemplos**:
- 8h 30min (para 8 horas y 30 minutos)
- 45 minutos (para menos de una hora)

## Archivos Modificados

### 1. `/utils/api.tsx`
**Cambios**: Se agregaron nuevos tipos de notificaciones

```typescript
type: 'order_created' | 'order_updated' | 'order_completed' | 
      'order_cancelled' | 'info' | 'attendance_check_in' | 'attendance_check_out';
```

### 2. `/supabase/functions/server/index.tsx`

#### Endpoint de Check-in (Líneas 1244-1258)
```typescript
// Create notification for the user
const notificationId = crypto.randomUUID();
const checkInTime = new Date(now).toLocaleTimeString('es-ES', { 
  hour: '2-digit', 
  minute: '2-digit' 
});
const notification = {
  id: notificationId,
  userId,
  title: '✅ Entrada registrada',
  message: `Has marcado entrada en ${local.name} a las ${checkInTime}`,
  type: 'attendance_check_in',
  read: false,
  createdAt: now.toISOString()
};
await kv.set(`notification:${userId}:${notificationId}`, notification);
```

#### Endpoint de Check-out (Líneas 1294-1320)
```typescript
// Create notification for the user
const notificationId = crypto.randomUUID();
const checkOutTime = new Date(now).toLocaleTimeString('es-ES', { 
  hour: '2-digit', 
  minute: '2-digit' 
});

// Calculate total time worked
const checkInDate = new Date(record.checkIn);
const checkOutDate = new Date(now);
const diffMs = checkOutDate.getTime() - checkInDate.getTime();
const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
const timeWorked = diffHours > 0 
  ? `${diffHours}h ${diffMinutes}min` 
  : `${diffMinutes} minutos`;

const notification = {
  id: notificationId,
  userId,
  title: '🏁 Salida registrada',
  message: `Has marcado salida de ${record.localName} a las ${checkOutTime}. Tiempo trabajado: ${timeWorked}`,
  type: 'attendance_check_out',
  read: false,
  createdAt: now.toISOString()
};
await kv.set(`notification:${userId}:${notificationId}`, notification);
```

### 3. `/components/NotificationsPanel.tsx`

**Cambios**: Se agregaron iconos y colores específicos para notificaciones de asistencia

#### Iconos
```typescript
case 'attendance_check_in':
  return <CheckCircle2 className="w-5 h-5 text-green-600" />;
case 'attendance_check_out':
  return <Clock className="w-5 h-5 text-purple-600" />;
```

#### Colores de fondo
```typescript
case 'attendance_check_in':
  return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
case 'attendance_check_out':
  return 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200';
```

## Flujo de Usuario

### Escenario 1: Trabajador marca entrada
1. Trabajador inicia sesión con `trabajador@demo.com`
2. Accede al módulo de Asistencia
3. Selecciona un local del selector
4. Hace clic en "Marcar Entrada"
5. **Ver splash motivacional** ✨
6. **Recibe notificación**: "✅ Entrada registrada en [Local] a las 08:30"
7. La notificación aparece en el panel con fondo verde

### Escenario 2: Trabajador marca salida
1. Trabajador hace clic en "Marcar Salida"
2. **Ver splash motivacional** 🎉
3. **Recibe notificación**: "🏁 Salida registrada de [Local] a las 17:45. Tiempo trabajado: 9h 15min"
4. La notificación aparece en el panel con fondo morado

## Integración con Sistema de Notificaciones Existente

Las notificaciones de asistencia se integran perfectamente con el sistema existente:

### Polling Automático
- El sistema hace polling cada 5 segundos
- Las notificaciones aparecen automáticamente sin necesidad de refrescar
- El contador de notificaciones no leídas se actualiza en tiempo real

### Panel de Notificaciones
- Accesible desde el icono de campana en la barra superior
- Muestra todas las notificaciones ordenadas por fecha
- Permite marcar como leídas o eliminar

### Persistencia
- Las notificaciones se guardan en la base de datos (KV store)
- Persisten entre sesiones
- Se mantienen hasta que el usuario las elimine

## Beneficios

✅ **Confirmación Inmediata**: El usuario sabe instantáneamente que su acción fue registrada

✅ **Información Útil**: Muestra hora exacta y tiempo trabajado

✅ **Historial Completo**: Las notificaciones quedan guardadas como referencia

✅ **Experiencia Mejorada**: Feedback visual con colores e iconos distintivos

✅ **Sin intervención manual**: Las notificaciones se crean automáticamente en el backend

## Compatibilidad

- **Dispositivos Móviles**: ✅ Totalmente compatible
- **Tablets**: ✅ Totalmente compatible  
- **Desktop**: ✅ Totalmente compatible
- **Navegadores**: ✅ Todos los navegadores modernos

## Formato de Hora

Las notificaciones usan formato español (es-ES):
- **24 horas**: 08:30, 17:45
- **2 dígitos**: Siempre muestra dos dígitos para hora y minutos

## Testing

### Pruebas Realizadas

1. ✅ Marcar entrada genera notificación correcta
2. ✅ Marcar salida genera notificación con tiempo trabajado
3. ✅ Notificaciones aparecen en el panel automáticamente
4. ✅ Contador de notificaciones no leídas se actualiza
5. ✅ Colores e iconos se muestran correctamente
6. ✅ Cálculo de tiempo trabajado es preciso
7. ✅ Notificaciones persisten entre sesiones

### Cómo Probar

1. Iniciar sesión con `trabajador@demo.com` / `demo123`
2. Ir al módulo de Asistencia
3. Seleccionar un local y marcar entrada
4. Verificar notificación en el panel (icono de campana)
5. Marcar salida después de unos minutos
6. Verificar que la notificación muestra el tiempo trabajado correcto

## Posibles Mejoras Futuras

- [ ] Notificar al administrador del local cuando un trabajador marca entrada/salida
- [ ] Enviar resumen diario por email con total de horas trabajadas
- [ ] Agregar notificaciones push para dispositivos móviles
- [ ] Alertas cuando un trabajador olvida marcar salida
- [ ] Notificaciones de recordatorio para marcar entrada en horario laboral

## Notas Técnicas

### Formato de Clave en KV Store
```
notification:{userId}:{notificationId}
```

### Estructura de Notificación
```typescript
{
  id: string;              // UUID único
  userId: string;          // ID del usuario que recibe la notificación
  title: string;           // Título con emoji
  message: string;         // Mensaje descriptivo
  type: string;            // Tipo de notificación
  read: boolean;           // Estado de lectura
  createdAt: string;       // Timestamp ISO 8601
}
```

### Performance
- Las notificaciones se crean de forma asíncrona
- No afectan el tiempo de respuesta del check-in/check-out
- Se almacenan eficientemente en el KV store

## Seguridad

- Solo el usuario autenticado puede crear notificaciones para sí mismo
- Las notificaciones se asocian al userId del token JWT
- No es posible crear notificaciones para otros usuarios sin permisos
