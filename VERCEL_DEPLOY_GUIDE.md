# 🚀 Guía de Deploy en Vercel - Solución de Problemas de Imágenes

## 🔧 Problema Original

El deploy en Vercel fallaba al intentar subir imágenes con el error **"Error interno del servidor"** porque la API original usaba el sistema de archivos local (`fs/promises`) para guardar imágenes, lo cual **NO funciona en Vercel** al ser una plataforma serverless.

## ✅ Solución Implementada

### 1. **Nueva API de Upload Compatible con Vercel**

```typescript
// app/api/upload/route.ts
// ❌ ANTES (No funciona en Vercel)
await writeFile(filePath, buffer)

// ✅ AHORA (Compatible con Vercel)
const base64 = buffer.toString('base64')
const dataURL = `data:${file.type};base64,${base64}`
```

### 2. **Configuración de Vercel Optimizada**

```json
// vercel.json
{
  "functions": {
    "app/api/upload/route.ts": {
      "maxDuration": 30
    }
  },
  "api": {
    "bodyParser": {
      "sizeLimit": "10mb"
    }
  }
}
```

### 3. **Configuración de Next.js Mejorada**

```javascript
// next.config.mjs
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // ... resto de configuración
}
```

## 🧪 Herramientas de Debugging

### Botones de Prueba en el Modal de Crear Market

1. **Test API**: Verifica que las APIs básicas funcionen
2. **Test Upload**: Prueba específicamente la subida de imágenes

### Endpoints de Prueba

- `GET /api/test` - Verifica el estado del servidor
- `POST /api/upload` - Procesa imágenes como base64

## 🔍 Cómo Depurar Problemas

### 1. Verificar Logs de Vercel

```bash
# Comando para ver logs en tiempo real
vercel logs --follow
```

### 2. Probar APIs Localmente

```bash
# Correr en desarrollo
npm run dev

# Probar endpoint
curl -X GET http://localhost:3000/api/test
```

### 3. Verificar en la Consola del Navegador

El código ahora incluye logs detallados:

```javascript
console.log("📸 Iniciando upload de imagen:", {
  fileName: imagenFile.name,
  fileSize: imagenFile.size,
  fileType: imagenFile.type
})
```

## 📝 Ventajas de la Nueva Implementación

### ✅ **Compatibilidad Total con Vercel**
- No requiere sistema de archivos
- Funciona en todos los entornos serverless
- Sin dependencias externas

### ✅ **Mejor Rendimiento**
- Imágenes procesadas inmediatamente
- No requiere almacenamiento temporal
- Menos puntos de fallo

### ✅ **Debugging Mejorado**
- Logs detallados en cada paso
- Mensajes de error específicos
- Herramientas de prueba integradas

## 🚨 Limitaciones Conocidas

### 1. **Tamaño de Imagen**
- Máximo 5MB por imagen
- Las imágenes muy grandes pueden causar timeouts

### 2. **Formato Base64**
- Las imágenes se almacenan como data URLs
- Aumenta ligeramente el tamaño de almacenamiento

### 3. **Límites de Vercel**
- Timeout máximo de 30 segundos para funciones
- Límite de payload de 10MB

## 🔄 Pasos para Resolver el Problema

### 1. **Deploy la Nueva Versión**

```bash
git add .
git commit -m "fix: Implementar upload de imágenes compatible con Vercel"
git push origin main
```

### 2. **Verificar en Vercel**

1. Ve a tu dashboard de Vercel
2. Verifica que el deploy se complete sin errores
3. Prueba el endpoint: `https://tu-app.vercel.app/api/test`

### 3. **Probar la Funcionalidad**

1. Abre la app en Vercel
2. Crea un nuevo market
3. Selecciona una imagen
4. Usa los botones de prueba para verificar
5. Intenta crear el market

### 4. **Monitorear Logs**

```bash
# Ver logs en tiempo real
vercel logs --follow your-app-name
```

## 📞 Qué Hacer si Aún Falla

### 1. **Verifica los Logs**
```javascript
// En la consola del navegador, busca estos logs:
console.log("📸 Iniciando upload de imagen:")
console.log("🌐 Enviando request a /api/upload...")
console.log("📡 Response recibida:")
```

### 2. **Prueba los Endpoints de Debug**
- Botón "Test API" en el modal
- Botón "Test Upload" después de seleccionar imagen

### 3. **Verifica la Configuración**
- Confirma que `vercel.json` está en el root
- Verifica que `next.config.mjs` tiene la configuración correcta

## 🎉 Resultado Esperado

Después de implementar estos cambios:

1. ✅ Las imágenes se procesan correctamente como base64
2. ✅ No más errores de "Error interno del servidor"
3. ✅ Funciona tanto en desarrollo como en producción
4. ✅ Logs detallados para debugging

## 📊 Monitoreo Post-Deploy

### Métricas a Verificar:
- ✅ Tiempo de respuesta de `/api/upload`
- ✅ Tasa de éxito de creación de markets
- ✅ Ausencia de errores 500 en los logs
- ✅ Funcionamiento correcto de imágenes en markets

---

**Nota**: Esta solución está optimizada para Vercel y es completamente compatible con las limitaciones de las funciones serverless. 