# ⚡ Comandos de Lanzamiento - CONECTOCA

## 🎯 Copia y Pega - Lista para Usar

Esta es la versión "copy-paste" de los comandos que necesitas ejecutar.

---

## 📋 PASO 1: Desplegar Backend (Servidor)

### Opción A: Si NO tienes Supabase CLI instalado

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login a Supabase (abrirá navegador)
supabase login

# 3. Vincular proyecto (REEMPLAZA con tu PROJECT_ID)
supabase link --project-ref TU_PROJECT_ID_AQUI

# 4. Desplegar servidor
supabase functions deploy server

# 5. Verificar (REEMPLAZA con tu PROJECT_ID)
curl https://TU_PROJECT_ID_AQUI.supabase.co/functions/v1/make-server-6d979413/health
```

### Opción B: Si YA tienes Supabase CLI instalado

```bash
# 1. Login a Supabase
supabase login

# 2. Vincular proyecto (REEMPLAZA con tu PROJECT_ID)
supabase link --project-ref TU_PROJECT_ID_AQUI

# 3. Desplegar servidor
supabase functions deploy server

# 4. Verificar
curl https://TU_PROJECT_ID_AQUI.supabase.co/functions/v1/make-server-6d979413/health
```

**✅ Respuesta esperada del curl:**
```json
{"status":"ok"}
```

---

## 📋 PASO 2: Subir Código a GitHub

```bash
# 1. Inicializar git (si no lo has hecho)
git init

# 2. Agregar todos los archivos
git add .

# 3. Commit inicial
git commit -m "CONECTOCA v1.0 - Aplicación completa lista para producción"

# 4. Crear rama principal
git branch -M main

# 5. Conectar con tu repositorio de GitHub
# (Primero crea el repo en github.com, luego ejecuta esto)
git remote add origin https://github.com/TU_USUARIO/conectoca.git

# 6. Push inicial
git push -u origin main
```

**⚠️ IMPORTANTE:** 
Antes del paso 5, ve a https://github.com/new y crea un repositorio llamado `conectoca`

---

## 📋 PASO 3: Desplegar en Vercel (No requiere comandos)

### Opción 1: Desde la Web (Más Fácil)

1. Ve a: https://vercel.com/new
2. Click en "Import Git Repository"
3. Conecta GitHub
4. Selecciona el repo `conectoca`
5. Click "Deploy"
6. ✅ ¡Listo! Tu URL será: `https://conectoca-xxxx.vercel.app`

### Opción 2: Usando Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy (responde las preguntas con Enter)
vercel

# 4. Deploy a producción
vercel --prod
```

---

## 📋 Verificación Rápida

Una vez desplegado todo, ejecuta esto para verificar que funcione:

```bash
# Verificar servidor backend (REEMPLAZA con tu PROJECT_ID)
curl https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-6d979413/health

# Verificar frontend (REEMPLAZA con tu URL de Vercel)
curl -I https://tu-app.vercel.app
```

---

## 🔍 Encontrar tu PROJECT_ID de Supabase

### Método 1: Desde el Dashboard
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. El ID está en la URL: `https://supabase.com/dashboard/project/[AQUI_ESTA]`

### Método 2: Desde Settings
1. Dashboard > Tu Proyecto
2. Settings > General
3. Copia "Reference ID"

### Método 3: Desde API Settings
1. Dashboard > Tu Proyecto
2. Settings > API
3. Está en "Project URL": `https://[PROJECT_ID].supabase.co`

---

## 📦 Comandos Útiles Post-Lanzamiento

### Ver logs del servidor

```bash
# Logs en tiempo real del servidor
supabase functions logs server

# Logs de las últimas 24 horas
supabase functions logs server --tail
```

### Re-deployar después de cambios

```bash
# Frontend (Vercel)
git add .
git commit -m "Descripción de cambios"
git push

# Backend (Supabase)
supabase functions deploy server
```

### Resetear base de datos (CUIDADO - Borra todo)

```bash
# ⚠️ SOLO para desarrollo/testing
# Esto borrará TODOS los datos
supabase db reset
```

---

## 🛠️ Troubleshooting Commands

### Si el servidor no responde

```bash
# 1. Verificar que está desplegado
supabase functions list

# 2. Ver logs de errores
supabase functions logs server --tail

# 3. Re-desplegar
supabase functions deploy server --no-verify-jwt
```

### Si hay problemas con variables de entorno

```bash
# Listar variables configuradas
supabase secrets list

# Agregar/actualizar variable
supabase secrets set NOMBRE_VARIABLE=valor
```

### Si el deploy de Vercel falla

```bash
# Ver logs del deploy
vercel logs

# Limpiar cache y re-deployar
vercel --force
```

---

## 📊 Comandos de Monitoreo

### Backend (Supabase)

```bash
# Ver uso de base de datos
supabase db inspect

# Ver funciones activas
supabase functions list

# Ver estadísticas
supabase projects list
```

### Frontend (Vercel)

```bash
# Ver deployments
vercel list

# Ver dominio asignado
vercel domains ls

# Ver analytics
vercel logs --follow
```

---

## 🚀 Secuencia Completa (Todo en uno)

Si quieres ejecutar todo de una vez, aquí está la secuencia completa:

```bash
# ============================================
# CONECTOCA - DEPLOY COMPLETO
# ============================================

# 1. BACKEND
echo "🔧 Instalando Supabase CLI..."
npm install -g supabase

echo "🔑 Iniciando sesión en Supabase..."
supabase login

echo "🔗 Vinculando proyecto..."
read -p "Ingresa tu PROJECT_ID: " project_id
supabase link --project-ref $project_id

echo "📤 Desplegando servidor..."
supabase functions deploy server

echo "✅ Verificando servidor..."
curl https://$project_id.supabase.co/functions/v1/make-server-6d979413/health

# 2. FRONTEND
echo ""
echo "📦 Preparando código para GitHub..."
git init
git add .
git commit -m "CONECTOCA v1.0 - Deploy inicial"
git branch -M main

echo "📝 Ahora debes:"
echo "1. Crear repo en GitHub: https://github.com/new"
echo "2. Copiar la URL del repo"
read -p "Pega la URL de tu repo GitHub: " github_url
git remote add origin $github_url
git push -u origin main

echo ""
echo "🌐 Ahora ve a Vercel:"
echo "   https://vercel.com/new"
echo "   e importa tu repositorio de GitHub"

echo ""
echo "✅ ¡Listo! Revisa los pasos en tu navegador"
```

---

## 🔐 Variables de Entorno (Si las necesitas manualmente)

Si despligas fuera de Figma Make, necesitas estas variables:

```bash
# En Vercel (Settings > Environment Variables)
SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**¿Dónde encontrarlas?**
1. Dashboard Supabase
2. Settings > API
3. Copia "Project URL" y "anon public"

---

## 🎯 Checklist de Comandos Ejecutados

Marca los que ya completaste:

- [ ] `npm install -g supabase`
- [ ] `supabase login`
- [ ] `supabase link --project-ref [ID]`
- [ ] `supabase functions deploy server`
- [ ] `curl [health check]` → Responde OK
- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit -m "..."`
- [ ] `git remote add origin [URL]`
- [ ] `git push -u origin main`
- [ ] Deploy en Vercel (web o CLI)
- [ ] Verificar app funcionando en navegador

---

## 💡 Tips Finales

### ⚡ Atajos útiles

```bash
# Alias para re-deploy rápido
alias deploy-backend="supabase functions deploy server"
alias deploy-frontend="git add . && git commit -m 'update' && git push"

# Usar así:
deploy-backend
deploy-frontend
```

### 🔄 Workflow de actualización

```bash
# Cada vez que hagas cambios:
# 1. Probar localmente
# 2. Commit
git add .
git commit -m "Descripción del cambio"

# 3. Push (Vercel auto-deploya)
git push

# 4. Si cambiaste backend:
supabase functions deploy server
```

---

## 📞 Ayuda Rápida

**¿Comandos no funcionan?**
- Verifica que Node.js esté instalado: `node --version`
- Verifica que npm funcione: `npm --version`
- Instala la última versión de Node: https://nodejs.org

**¿Git no está instalado?**
- Windows: https://git-scm.com/download/win
- Mac: `brew install git` (con Homebrew)
- Linux: `sudo apt install git`

**¿GitHub solicita autenticación?**
- Usa GitHub CLI: https://cli.github.com
- O genera un Personal Access Token: https://github.com/settings/tokens

---

## ✅ Comando de Verificación Final

Ejecuta esto al final para verificar que todo esté funcionando:

```bash
#!/bin/bash

echo "🔍 Verificación Final de CONECTOCA"
echo "=================================="
echo ""

# Solicitar PROJECT_ID
read -p "Ingresa tu PROJECT_ID de Supabase: " project_id

# Verificar backend
echo "🔧 Verificando backend..."
backend_status=$(curl -s https://$project_id.supabase.co/functions/v1/make-server-6d979413/health)

if [[ $backend_status == *"ok"* ]]; then
    echo "✅ Backend funcionando correctamente"
else
    echo "❌ Backend no responde"
fi

# Solicitar URL de Vercel
read -p "Ingresa tu URL de Vercel (sin https://): " vercel_url

# Verificar frontend
echo "🌐 Verificando frontend..."
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" https://$vercel_url)

if [[ $frontend_status == "200" ]]; then
    echo "✅ Frontend funcionando correctamente"
else
    echo "❌ Frontend no responde (código: $frontend_status)"
fi

echo ""
echo "=================================="
echo "🎉 Verificación completada"
echo ""
echo "URLs de tu aplicación:"
echo "🌐 Frontend: https://$vercel_url"
echo "🔧 Backend: https://$project_id.supabase.co/functions/v1/make-server-6d979413/"
echo "⚙️  Dashboard: https://supabase.com/dashboard/project/$project_id"
```

Guarda esto como `verify.sh`, dale permisos y ejecútalo:

```bash
chmod +x verify.sh
./verify.sh
```

---

**🎉 ¡Con estos comandos tu app estará funcionando en minutos!**

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025
