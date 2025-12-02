# 🐛 BUGFIX: Productos no visibles en sistema multi-tenant

## ❌ Problema Identificado

Al enlazar un administrador con su local, los productos no se agregaban correctamente, no eran visibles y salía error al cargarlos.

### Causa Raíz

1. **Desincronización de campos**: El backend esperaba el campo `image` pero el frontend enviaba `imageUrl`
2. **Falta de campos category**: El backend no aceptaba los campos `category` y `categoryId` que el frontend enviaba
3. **Respuesta inconsistente**: El backend retornaba el producto directamente, pero el frontend esperaba `{ data: product }`
4. **Categorías sin businessId**: Las categorías no estaban filtradas por negocio, causando conflictos entre diferentes negocios
5. **Falta de validación de permisos**: No se verificaba que los usuarios solo pudieran modificar productos/categorías de su propio negocio

## ✅ Soluciones Implementadas

### 1. Backend - Productos (`/supabase/functions/server/index.tsx`)

#### POST `/products` - Crear producto
```typescript
// ANTES: Solo aceptaba name, description, price, image, stock
// AHORA: Acepta todos los campos del frontend
const { name, description, price, image, imageUrl, stock, category, categoryId } = await c.req.json();

const product = {
  id: productId,
  name,
  description: description || '',
  price: parseFloat(price),
  image: image || imageUrl || '', // Soporta ambos campos
  imageUrl: imageUrl || image || '', // Consistencia
  stock: stock !== undefined ? parseInt(stock) : 100,
  category: category || 'General', // ✅ NUEVO
  categoryId: categoryId || null,   // ✅ NUEVO
  businessId: userProfile.businessId,
  createdBy: userId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

return c.json({ data: product }); // ✅ Envuelto en { data }
```

#### PUT `/products/:id` - Actualizar producto
```typescript
// ✅ NUEVO: Verificación de businessId
if (currentProduct.businessId !== userProfile.businessId) {
  return c.json({ error: 'No tienes permiso para actualizar este producto' }, 403);
}

// ✅ NUEVO: Mapeo de imageUrl a image
if (updates.imageUrl && !updates.image) {
  updates.image = updates.imageUrl;
}

// ✅ Protección de campos críticos
const updatedProduct = {
  ...currentProduct,
  ...updates,
  id: productId,
  businessId: currentProduct.businessId, // No puede cambiar
  createdBy: currentProduct.createdBy,   // No puede cambiar
  createdAt: currentProduct.createdAt,   // No puede cambiar
  updatedAt: new Date().toISOString()
};

return c.json({ data: updatedProduct }); // ✅ Envuelto en { data }
```

#### DELETE `/products/:id` - Eliminar producto
```typescript
// ✅ NUEVO: Verificación de businessId antes de eliminar
if (currentProduct.businessId !== userProfile.businessId) {
  return c.json({ error: 'No tienes permiso para eliminar este producto' }, 403);
}

return c.json({ data: { deleted: true } }); // ✅ Envuelto en { data }
```

### 2. Backend - Categorías

#### GET `/categories` - Listar categorías
```typescript
// ANTES: Retornaba todas las categorías sin filtrar
// AHORA: Filtra por businessId
const allCategories = await kv.getByPrefix('category:');
const businessCategories = (allCategories || []).filter(
  (cat: any) => cat.businessId === userProfile.businessId
);

return c.json({ data: businessCategories });
```

#### POST `/categories` - Crear categoría
```typescript
const category = {
  id: categoryId,
  name,
  description: description || '',
  color: color || '#0047BA',
  businessId: userProfile.businessId, // ✅ NUEVO
  createdBy: userId,                   // ✅ NUEVO
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

#### PUT `/categories/:id` - Actualizar categoría
```typescript
// ✅ NUEVO: Verificación de businessId
if (existingCategory.businessId !== userProfile.businessId) {
  return c.json({ error: 'No tienes permiso para actualizar esta categoría' }, 403);
}

// ✅ Protección de campos críticos
const updatedCategory = {
  ...existingCategory,
  ...body,
  id: categoryId,
  businessId: existingCategory.businessId,
  createdBy: existingCategory.createdBy,
  createdAt: existingCategory.createdAt,
  updatedAt: new Date().toISOString()
};
```

#### DELETE `/categories/:id` - Eliminar categoría
```typescript
// ✅ NUEVO: Verificación de businessId
if (category.businessId !== userProfile.businessId) {
  return c.json({ error: 'No tienes permiso para eliminar esta categoría' }, 403);
}

// ✅ NUEVO: Solo cuenta productos del mismo negocio
const productsInCategory = allProducts.filter((p: any) => 
  p.categoryId === categoryId && p.businessId === userProfile.businessId
);
```

### 3. Corrección de archivo `_redirects`

El archivo `_redirects` se había convertido nuevamente en carpeta con archivos `.tsx`. Se eliminó la carpeta y se recreó como archivo simple (ya se hizo en commits anteriores).

## 🎯 Beneficios

1. ✅ **Aislamiento total entre negocios**: Cada negocio solo ve y puede modificar sus propios productos y categorías
2. ✅ **Sincronización frontend-backend**: Los campos enviados por el frontend ahora son aceptados correctamente por el backend
3. ✅ **Seguridad mejorada**: Validación de permisos en todas las operaciones CRUD
4. ✅ **Respuestas consistentes**: Todas las respuestas siguen el formato `{ data: ... }`
5. ✅ **Compatibilidad de campos**: Soporte tanto para `image` como `imageUrl`
6. ✅ **Categorías multi-tenant**: Las categorías ahora están correctamente aisladas por negocio

## 🧪 Para Probar

1. **Crear un producto**:
   - Inicia sesión como admin en tu negocio
   - Ve a Gestión de Productos
   - Crea un nuevo producto con todos los campos (nombre, precio, stock, categoría, imagen)
   - Verifica que aparece en la lista

2. **Verificar aislamiento**:
   - Crea otro negocio con otra cuenta
   - Crea productos en el segundo negocio
   - Verifica que los productos del primer negocio NO aparecen en el segundo

3. **Editar producto**:
   - Edita un producto existente
   - Verifica que los cambios se guardan correctamente
   - Verifica que todos los campos (incluido imageUrl) se mantienen

4. **Categorías**:
   - Crea categorías desde el admin
   - Verifica que solo aparecen las categorías de tu negocio
   - Asigna productos a categorías
   - Intenta eliminar una categoría con productos (debe dar error)

## 📝 Archivos Modificados

- ✅ `/supabase/functions/server/index.tsx` - Backend completo de productos y categorías
- ✅ `/_redirects` - Corregido (eliminada carpeta, recreado como archivo)

## 🔄 Deploy

Para aplicar estos cambios en producción:

```bash
# Desde Supabase CLI
cd supabase/functions
supabase functions deploy server

# O desde Supabase Dashboard
# Functions → server → Deploy nueva versión
```

---

**Estado**: ✅ **RESUELTO** - Los productos ahora se crean, editan y muestran correctamente respetando el aislamiento multi-tenant
**Fecha**: 16 de noviembre 2025
**Prioridad**: 🔴 CRÍTICA (bloqueaba funcionalidad core)
