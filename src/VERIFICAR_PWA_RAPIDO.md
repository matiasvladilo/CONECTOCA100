# ⚡ Verificar PWA - Comandos Rápidos

## 🎯 Copia y Pega Estos Comandos

### 1️⃣ Verificación Completa (Pega en Consola)

```javascript
console.clear();
console.log('%c🔍 VERIFICANDO PWA CONECTOCA', 'font-size: 20px; font-weight: bold; color: #1e40af');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #93c5fd');

// 1. Service Worker
console.log('\n%c1. SERVICE WORKER', 'font-weight: bold; color: #1e40af');
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('✅ Registrado:', reg.active?.state || 'activating');
    console.log('   Scope:', reg.scope);
  } else {
    console.log('❌ NO REGISTRADO - Registrando ahora...');
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('✅ Registrado exitosamente! Recarga la página.'));
  }
});

// 2. Manifest
console.log('\n%c2. MANIFEST', 'font-weight: bold; color: #1e40af');
fetch('/manifest.json')
  .then(r => r.json())
  .then(m => {
    console.log('✅ Nombre:', m.name);
    console.log('✅ Nombre corto:', m.short_name);
    console.log('✅ Iconos:', m.icons.length, 'disponibles');
    console.log('✅ Start URL:', m.start_url);
    console.log('✅ Display:', m.display);
    
    // Verificar iconos
    m.icons.forEach(icon => {
      fetch(icon.src)
        .then(r => r.ok ? console.log(`   ✅ ${icon.src}`) : console.log(`   ❌ ${icon.src} - NO ENCONTRADO`))
        .catch(() => console.log(`   ❌ ${icon.src} - ERROR`));
    });
  })
  .catch(e => console.log('❌ Manifest no encontrado:', e));

// 3. HTTPS
console.log('\n%c3. HTTPS', 'font-weight: bold; color: #1e40af');
if (location.protocol === 'https:' || location.hostname === 'localhost') {
  console.log('✅ Protocolo:', location.protocol);
} else {
  console.log('❌ HTTP detectado - PWA requiere HTTPS');
}

// 4. Modo PWA
console.log('\n%c4. MODO INSTALACIÓN', 'font-weight: bold; color: #1e40af');
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ Corriendo como PWA instalada');
} else {
  console.log('📱 Corriendo en navegador (no instalada)');
  console.log('   Esto es normal si es la primera vez');
}

// 5. Capacidades
console.log('\n%c5. CAPACIDADES DEL NAVEGADOR', 'font-weight: bold; color: #1e40af');
console.log('Service Worker:', 'serviceWorker' in navigator ? '✅' : '❌');
console.log('Notifications:', 'Notification' in window ? '✅' : '❌');
console.log('Push API:', 'PushManager' in window ? '✅' : '❌');
console.log('Cache API:', 'caches' in window ? '✅' : '❌');

// 6. Resumen
setTimeout(() => {
  console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #93c5fd');
  console.log('%c🎯 RESUMEN', 'font-weight: bold; color: #1e40af');
  console.log('Si todos los checks importantes son ✅, tu PWA está lista!');
  console.log('\n%c📱 CÓMO INSTALAR:', 'font-weight: bold; color: #16a34a');
  console.log('• Android: Menú ⋮ → "Instalar aplicación"');
  console.log('• iOS: Safari → Compartir → "Agregar a inicio"');
  console.log('• Desktop: Ícono ⊕ en barra de direcciones');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #93c5fd');
}, 1000);
```

---

## 2️⃣ Test Rápido de Iconos (Pega en Consola)

```javascript
console.clear();
console.log('🎨 Verificando iconos...\n');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
let found = 0;
let missing = 0;

sizes.forEach(size => {
  const url = `/icons/icon-${size}x${size}.png`;
  fetch(url)
    .then(r => {
      if (r.ok) {
        console.log(`✅ icon-${size}x${size}.png`);
        found++;
      } else {
        console.log(`❌ icon-${size}x${size}.png - NO ENCONTRADO`);
        missing++;
      }
      
      if (found + missing === sizes.length) {
        console.log(`\n📊 Resumen: ${found}/${sizes.length} iconos encontrados`);
        if (missing > 0) {
          console.log(`\n⚠️  Faltan ${missing} iconos`);
          console.log('👉 Abre: /icons/generate-icons.html para generarlos');
        } else {
          console.log('\n✅ ¡Todos los iconos están listos!');
        }
      }
    })
    .catch(() => {
      console.log(`❌ icon-${size}x${size}.png - ERROR`);
      missing++;
    });
});
```

---

## 3️⃣ Forzar Registro de Service Worker

```javascript
console.log('🔄 Registrando Service Worker...');

navigator.serviceWorker.register('/service-worker.js')
  .then(registration => {
    console.log('✅ Service Worker registrado!');
    console.log('   Scope:', registration.scope);
    console.log('   Estado:', registration.active?.state || 'activating');
    console.log('\n🔄 Recarga la página para aplicar cambios');
  })
  .catch(error => {
    console.log('❌ Error registrando Service Worker:', error);
  });
```

---

## 4️⃣ Test de Instalación

```javascript
console.log('📱 Verificando si puede instalarse...\n');

// Check beforeinstallprompt event
let installable = false;
window.addEventListener('beforeinstallprompt', (e) => {
  installable = true;
  console.log('✅ Evento beforeinstallprompt detectado');
  console.log('   La PWA PUEDE instalarse');
});

// Check current state
setTimeout(() => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ Ya está instalada como PWA');
  } else if (installable) {
    console.log('✅ Lista para instalar (espera el banner)');
  } else {
    console.log('⏳ Esperando evento de instalación...');
    console.log('   Puede tomar unos segundos');
    console.log('   O instalar manualmente desde el menú');
  }
}, 2000);
```

---

## 5️⃣ Test de Cache/Offline

```javascript
console.log('💾 Verificando caché offline...\n');

caches.keys().then(cacheNames => {
  console.log(`✅ Cachés activos: ${cacheNames.length}`);
  cacheNames.forEach(name => console.log(`   • ${name}`));
  
  if (cacheNames.length > 0) {
    caches.open(cacheNames[0]).then(cache => {
      cache.keys().then(requests => {
        console.log(`\n✅ Archivos en caché: ${requests.length}`);
        console.log('   La app funcionará offline!');
      });
    });
  } else {
    console.log('\n⚠️  No hay cachés aún');
    console.log('   Navega por la app para crear caché');
  }
});
```

---

## 6️⃣ Limpiar Todo y Empezar de Nuevo

```javascript
console.log('🧹 Limpiando todo...\n');

// 1. Unregister Service Worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
    console.log('✅ Service Worker desregistrado');
  });
});

// 2. Clear all caches
caches.keys().then(cacheNames => {
  return Promise.all(
    cacheNames.map(cacheName => {
      return caches.delete(cacheName).then(() => {
        console.log('✅ Cache eliminado:', cacheName);
      });
    })
  );
}).then(() => {
  console.log('\n✅ Todo limpio!');
  console.log('🔄 Recarga la página (Ctrl+Shift+R) para empezar de nuevo');
});
```

---

## 7️⃣ Verificar Modo Instalado

```javascript
// Pega esto en la app DESPUÉS de instalarla
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ Corriendo como PWA INSTALADA');
  console.log('   Display mode: standalone');
} else if (window.matchMedia('(display-mode: fullscreen)').matches) {
  console.log('✅ Corriendo en FULLSCREEN');
} else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
  console.log('✅ Corriendo con MINIMAL UI');
} else {
  console.log('📱 Corriendo en NAVEGADOR');
  console.log('   (no instalada como PWA)');
}
```

---

## 8️⃣ Lighthouse Test (En DevTools)

```
1. Abre DevTools (F12)
2. Ve a la pestaña "Lighthouse"
3. Selecciona:
   ✅ Progressive Web App
   ✅ Performance
   ✅ Best Practices
4. Click "Analyze page load"
5. Espera resultados

Target scores:
• PWA: 100/100
• Performance: 90+/100
• Best Practices: 90+/100
```

---

## 9️⃣ Test Manual de Instalación

### Android Chrome:
```
1. Abre la app
2. Menú (⋮) arriba derecha
3. Busca "Instalar aplicación" o "Agregar a pantalla de inicio"
4. Si no aparece:
   • Verifica HTTPS
   • Verifica Service Worker (comando 1)
   • Verifica Manifest (comando 2)
```

### iOS Safari:
```
1. Abre la app en Safari
2. Compartir (□↑)
3. Desplázate hacia abajo
4. "Agregar a pantalla de inicio"
5. "Agregar"
```

### Desktop Chrome:
```
1. Busca ícono ⊕ en barra de direcciones
2. Click en el ícono
3. "Instalar"
```

---

## 🔟 Verificación Final Completa

```javascript
console.clear();
console.log('%c✅ CHECKLIST FINAL PWA', 'font-size: 18px; font-weight: bold; color: #16a34a');

const checks = [];

// Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  checks.push({ name: 'Service Worker', ok: !!reg });
  printChecklist();
});

// Manifest
fetch('/manifest.json').then(r => r.ok).then(ok => {
  checks.push({ name: 'Manifest.json', ok });
  printChecklist();
});

// HTTPS
checks.push({ 
  name: 'HTTPS/Localhost', 
  ok: location.protocol === 'https:' || location.hostname === 'localhost' 
});

// Icons (al menos 192 y 512)
Promise.all([
  fetch('/icons/icon-192x192.png').then(r => r.ok),
  fetch('/icons/icon-512x512.png').then(r => r.ok)
]).then(([icon192, icon512]) => {
  checks.push({ name: 'Iconos principales', ok: icon192 && icon512 });
  printChecklist();
});

// Cache API
checks.push({ name: 'Cache API', ok: 'caches' in window });

// Notifications
checks.push({ name: 'Notifications', ok: 'Notification' in window });

function printChecklist() {
  if (checks.length >= 6) {
    console.log('\n');
    checks.forEach(check => {
      const icon = check.ok ? '✅' : '❌';
      const status = check.ok ? 'OK' : 'FALTA';
      console.log(`${icon} ${check.name}: ${status}`);
    });
    
    const allOk = checks.every(c => c.ok);
    console.log('\n' + '━'.repeat(40));
    if (allOk) {
      console.log('%c🎉 ¡TODO LISTO! Tu PWA está perfecta', 'color: #16a34a; font-weight: bold');
      console.log('Puedes instalarla ahora mismo');
    } else {
      console.log('%c⚠️  Hay problemas que resolver', 'color: #f59e0b; font-weight: bold');
      console.log('Revisa los items marcados con ❌');
    }
  }
}

// Initial print
printChecklist();
```

---

## 📋 Resumen de Comandos

| Comando | Uso |
|---------|-----|
| **1** | Verificación completa de todo |
| **2** | Verificar solo iconos |
| **3** | Registrar Service Worker |
| **4** | Test de instalación |
| **5** | Test de caché offline |
| **6** | Limpiar y empezar de nuevo |
| **7** | Verificar si está instalado |
| **8** | Lighthouse audit |
| **9** | Test manual instalación |
| **10** | Checklist final |

---

## 🚀 Orden Recomendado

**Primera vez instalando:**
```
1. Comando 1 (verificación completa)
2. Comando 2 (verificar iconos)
3. Si faltan iconos → Generar en /icons/generate-icons.html
4. Comando 10 (checklist final)
5. Instalar manualmente (comando 9)
6. Comando 7 (verificar instalación exitosa)
```

**Si algo no funciona:**
```
1. Comando 6 (limpiar todo)
2. Ctrl+Shift+R (hard reload)
3. Comando 1 (verificar de nuevo)
4. Comando 3 (re-registrar SW si es necesario)
```

---

## 💡 Tips

- **Siempre usa HTTPS** (o localhost para testing)
- **Ctrl+Shift+R** para hard reload (ignora caché)
- **F12 → Application tab** para ver Service Workers y Manifest visualmente
- **Modo incógnito** para probar como usuario nuevo
- **Diferentes dispositivos** para asegurar compatibilidad

---

**¿Tienes dudas? Revisa `/INSTALAR_PWA_AHORA.md` para guía paso a paso completa.**
