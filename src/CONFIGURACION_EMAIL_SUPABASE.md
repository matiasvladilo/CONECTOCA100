# 📧 Configuración de Email en Supabase para Recuperación de Contraseña

## ✅ Implementación Completada

Se ha implementado el sistema completo de recuperación de contraseña en CONECTOCA. La funcionalidad está lista para usar una vez que configures el servidor de email en Supabase.

---

## 🎯 Características Implementadas

### 1. **Botón "¿Olvidaste tu contraseña?"**
- ✅ Ubicado debajo del campo de contraseña (solo en modo login)
- ✅ Diseño minimalista con ícono de llave (`KeyRound`)
- ✅ Animaciones suaves (hover, tap, underline)
- ✅ Color azul coherente con la marca

### 2. **Pantalla de Recuperación**
- ✅ Diseño limpio con animación de entrada
- ✅ Formulario de email con validación
- ✅ Mensaje informativo sobre el proceso
- ✅ Botón de "Volver" con animación

### 3. **Backend API**
- ✅ Endpoint `/auth/reset-password` implementado
- ✅ Integración con Supabase Auth
- ✅ Mensajes genéricos por seguridad (no revelar si el email existe)
- ✅ Logs detallados para debugging

### 4. **Frontend API**
- ✅ Función `authAPI.resetPassword()` agregada
- ✅ Validación de formato de email
- ✅ Manejo de errores robusto
- ✅ Feedback visual con toast notifications

---

## ⚙️ Configuración Necesaria en Supabase

Para que el sistema de recuperación de contraseña funcione completamente, debes configurar un servidor de email en Supabase:

### **Opción 1: Usar el Email Server de Supabase (Recomendado para Desarrollo)**

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Authentication** → **Email Templates**
3. Verifica que el template "Reset Password" está habilitado
4. Por defecto, Supabase usa su propio servidor SMTP para desarrollo

### **Opción 2: Configurar tu Propio Servidor SMTP (Recomendado para Producción)**

1. Ve a **Project Settings** → **Auth** → **SMTP Settings**
2. Habilita **Enable Custom SMTP**
3. Configura los siguientes campos:

```
Host: smtp.tuservidor.com
Port: 587 (o 465 para SSL)
Username: tu-email@dominio.com
Password: tu-contraseña-smtp
Sender Email: noreply@tudominio.com
Sender Name: CONECTOCA
```

### **Proveedores Recomendados:**

| Proveedor | Gratis/Mes | Configuración | Precio |
|-----------|------------|---------------|--------|
| **SendGrid** | 100 emails/día | Fácil | Gratis → $15/mes |
| **Mailgun** | 5,000 emails | Fácil | Gratis → $35/mes |
| **AWS SES** | 62,000 emails | Media | $0.10/1000 emails |
| **Resend** | 3,000 emails | Muy fácil | Gratis → $20/mes |

### **Configuración de Resend (Recomendado - Más Fácil):**

1. Crea cuenta en [resend.com](https://resend.com)
2. Verifica tu dominio o usa el dominio de testing
3. Obtén tu API Key
4. En Supabase SMTP Settings:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: re_TuAPIKey123456
   ```

---

## 🔧 Personalizar el Email Template

1. Ve a **Authentication** → **Email Templates** → **Reset Password**
2. Personaliza el mensaje con tu marca:

```html
<h2>Recupera tu acceso a CONECTOCA</h2>

<p>Hola,</p>

<p>Recibimos una solicitud para restablecer tu contraseña en CONECTOCA.</p>

<p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>

<p><a href="{{ .ConfirmationURL }}" 
   style="background-color: #1e40af; color: white; padding: 12px 24px; 
          text-decoration: none; border-radius: 6px; display: inline-block;">
   Restablecer Contraseña
</a></p>

<p>Este enlace expirará en 1 hora.</p>

<p>Si no solicitaste este cambio, puedes ignorar este email.</p>

<p>Saludos,<br>El equipo de CONECTOCA 🦆</p>
```

---

## 🧪 Cómo Probar (Sin Configurar Email)

Mientras configuras el email, puedes verificar que todo funciona:

1. **Prueba el flujo visual:**
   - Haz clic en "¿Olvidaste tu contraseña?"
   - Verifica que la pantalla de recuperación aparece correctamente
   - Ingresa un email y envía el formulario
   - Verifica que aparece el mensaje de éxito

2. **Revisa los logs del servidor:**
   - Abre la consola del navegador
   - Busca logs que digan: `🔑 Password reset requested for: email@example.com`
   - Verifica que no hay errores de red

3. **Flujo de seguridad:**
   - Ingresa un email que NO existe
   - Debe mostrar mensaje genérico de éxito (por seguridad)
   - No debe revelar si el email existe o no

---

## 📱 Flujo Completo del Usuario

1. Usuario hace clic en "¿Olvidaste tu contraseña?"
2. Sistema muestra pantalla de recuperación con animación
3. Usuario ingresa su email y hace clic en "Enviar"
4. Sistema valida el formato del email
5. Backend envía email de recuperación vía Supabase Auth
6. Usuario recibe email con enlace (válido por 1 hora)
7. Usuario hace clic en el enlace
8. Supabase redirige a página de reset (en su dominio)
9. Usuario crea nueva contraseña
10. Sistema lo redirige al login

---

## 🔒 Seguridad Implementada

✅ **No revela si el email existe** - Previene enumeración de usuarios
✅ **Validación de formato** - Solo permite emails válidos
✅ **Tokens temporales** - Enlaces expiran en 1 hora
✅ **Logs detallados** - Para debugging y auditoría
✅ **Rate limiting de Supabase** - Previene spam de emails
✅ **Mensajes genéricos** - No expone información sensible

---

## 🐛 Troubleshooting

### **No llegan los emails:**
1. Verifica SMTP settings en Supabase
2. Revisa la carpeta de spam
3. Checa los logs en Supabase → Logs → Auth Logs
4. Verifica que el email remitente está verificado

### **Error "Email rate limit exceeded":**
- Supabase limita envíos para prevenir spam
- Espera unos minutos antes de reintentar
- En producción, configura rate limits personalizados

### **El enlace no funciona:**
- Verifica la configuración de `Site URL` en Supabase
- Asegúrate de que la URL de redirección es correcta
- Checa que el token no ha expirado (1 hora)

---

## 📚 Recursos Adicionales

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Password Recovery Flow](https://supabase.com/docs/guides/auth/passwords)

---

## ✨ Próximos Pasos Opcionales

Si deseas mejorar aún más el flujo:

1. **Página de Reset Personalizada:**
   - Crear una página propia en CONECTOCA para reset
   - Configurar la `redirectTo` URL en el backend
   - Diseñar UI consistente con tu marca

2. **Verificación de Email en Signup:**
   - Requerir verificación de email al crear cuenta
   - Enviar email de bienvenida
   - Activar cuenta solo después de verificar

3. **Notificación de Cambio de Contraseña:**
   - Enviar email cuando la contraseña se cambia exitosamente
   - Alerta de seguridad si no fue el usuario

4. **Historial de Intentos:**
   - Registrar intentos de recuperación
   - Bloquear después de X intentos
   - Alertas de seguridad

---

## 🎉 ¡Listo!

El sistema de recuperación de contraseña está completamente implementado y listo para usar. Solo necesitas configurar el servidor de email en Supabase para que los correos se envíen correctamente.

**Estado actual:**
- ✅ Frontend: 100% completo
- ✅ Backend: 100% completo  
- ✅ API: 100% completa
- ⏳ Email Server: Pendiente de configuración

Una vez configures el SMTP, ¡todo funcionará automáticamente! 🚀
