# Actualización de Usuarios Demo - Locales Físicos

## Problema Identificado
Los correos electrónicos de los usuarios demo para locales físicos no coincidían con los nombres de los locales, causando confusión:
- ❌ `local-a@demo.com` → Local Centro
- ❌ `local-b@demo.com` → Local Norte

## Solución Implementada
Se actualizaron los correos electrónicos para que sean más intuitivos y coincidan con los nombres de los locales:
- ✅ `local-centro@demo.com` → Local Centro
- ✅ `local-norte@demo.com` → Local Norte

## Usuarios Demo Actualizados

### 1. Usuario Regular
- **Email**: `usuario@demo.com`
- **Contraseña**: `demo123`
- **Nombre**: Usuario Demo
- **Rol**: `user`
- **Descripción**: Usuario estándar que puede crear pedidos

### 2. Equipo de Producción
- **Email**: `produccion@demo.com`
- **Contraseña**: `demo123`
- **Nombre**: Equipo de Producción
- **Rol**: `production`
- **Descripción**: Puede gestionar estados de productos en el área de producción

### 3. Local Centro
- **Email**: `local-centro@demo.com` ✨ **ACTUALIZADO**
- **Contraseña**: `demo123`
- **Nombre**: Local Centro
- **Rol**: `local`
- **Descripción**: Representante del local físico Centro

### 4. Local Norte
- **Email**: `local-norte@demo.com` ✨ **ACTUALIZADO**
- **Contraseña**: `demo123`
- **Nombre**: Local Norte
- **Rol**: `local`
- **Descripción**: Representante del local físico Norte

### 5. Trabajador Demo
- **Email**: `trabajador@demo.com`
- **Contraseña**: `demo123`
- **Nombre**: Trabajador Demo
- **Rol**: `worker`
- **Descripción**: Trabajador que marca asistencia en los locales

## Flujo de Uso - Asistencia con Locales

### Como Trabajador
1. Iniciar sesión con `trabajador@demo.com`
2. Acceder al módulo de Asistencia
3. Seleccionar un local físico (Local Centro o Local Norte)
4. Marcar entrada/salida

### Como Local (Administrador de Local)
1. Iniciar sesión con `local-centro@demo.com` o `local-norte@demo.com`
2. Ver historial de asistencias del local
3. Exportar reportes del personal
4. Filtrar por fechas y trabajadores

### Como Administrador de Producción
1. Iniciar sesión con `produccion@demo.com`
2. Ver asistencias de todos los locales
3. Filtrar por local específico
4. Exportar reportes globales

## Cambios Realizados

### Archivo Modificado
- `/App.tsx`
  - Línea 113: Cambió `local-a@demo.com` → `local-centro@demo.com`
  - Línea 114: Cambió `local-b@demo.com` → `local-norte@demo.com`

## Notas Importantes

- **Migración automática**: Los nuevos usuarios se crearán automáticamente al recargar la aplicación
- **Usuarios existentes**: Los usuarios con los correos antiguos (`local-a@demo.com` y `local-b@demo.com`) seguirán funcionando si ya fueron creados
- **Sin impacto en datos**: Los datos existentes no se ven afectados
- **Validaciones**: El sistema sigue validando que un trabajador no pueda marcar entrada en múltiples locales simultáneamente

## Fecha de Actualización
13 de octubre de 2025
