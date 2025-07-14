# 🔍 Guía de Troubleshooting - Error de Upload de Imágenes

## 🚨 Problema Reportado

Al intentar subir imágenes en Vercel, aparece "Error interno del servidor" a pesar de haber implementado la API compatible con serverless.

## 🛠️ Herramientas de Debug Implementadas

### 1. **API de Upload Mejorada** (`/api/upload`)
- ✅ Logging detallado paso a paso
- ✅ Información completa de errores
- ✅ Datos de debug en la respuesta

### 2. **API de Debug Específica** (`/api/upload-debug`)
- ✅ Tests individuales para cada step
- ✅ Identificación exacta del punto de fallo
- ✅ Información del entorno de Vercel

### 3. **Botones de Prueba en la UI**
- **Test API**: Verifica conectividad básica
- **Test Upload**: Prueba el proceso completo
- **Debug Upload**: Ejecuta tests paso a paso

## 🔍 Proceso de Diagnóstico

### Paso 1: Verificar Configuración
```bash
npm run deploy-check
```

### Paso 2: Hacer Deploy con Debug
```bash
git add .
git commit -m "fix: Agregar debug detallado para upload de imágenes"
git push origin main
```

### Paso 3: Ejecutar Tests en Vercel

1. **Abre la app en Vercel**
2. **Ve al modal de crear market**
3. **Selecciona una imagen**
4. **Ejecuta los tests en este orden:**

#### Test 1: API Básica
```javascript
// Botón "Test API"
// Verifica: ✅ Conectividad básica del servidor
```

#### Test 2: Upload Debug
```javascript
// Botón "Debug Upload"
// Verifica paso a paso:
// ✅ Request recibido
// ✅ Headers disponibles
// ✅ FormData parsing
// ✅ File extraction
// ✅ File properties
// ✅ ArrayBuffer conversion
// ✅ Buffer creation
// ✅ Base64 conversion (sample)
```

#### Test 3: Upload Completo
```javascript
// Botón "Test Upload"
// Verifica: ✅ Proceso completo de upload
```

### Paso 4: Analizar Logs

```bash
# Ver logs en tiempo real
vercel logs --follow your-app-name

# Buscar estos patrones:
# 🚀 === INICIO UPLOAD API ===
# 📝 Step X: ...
# ❌ === ERROR EN UPLOAD API ===
```

## 📊 Análisis de Errores Comunes

### Error 1: FormData Parsing
```javascript
// Síntoma en logs:
// ❌ Error parseando FormData

// Posibles causas:
// - Content-Type incorrecto
// - Límites de tamaño de Vercel
// - Problema con Next.js App Router
```

### Error 2: File Extraction
```javascript
// Síntoma en logs:
// ❌ No se encontró archivo en FormData

// Posibles causas:
// - Nombre del field incorrecto
// - Archivo no enviado correctamente
// - Problema con FormData.get()
```

### Error 3: ArrayBuffer Conversion
```javascript
// Síntoma en logs:
// ❌ Error convirtiendo a ArrayBuffer

// Posibles causas:
// - Archivo corrupto
// - Problema con File API
// - Límites de memoria en Vercel
```

### Error 4: Buffer Creation
```javascript
// Síntoma en logs:
// ❌ Error creando Buffer

// Posibles causas:
// - Límites de memoria
// - Buffer API no disponible
// - Problema con Node.js en Vercel
```

### Error 5: Base64 Conversion
```javascript
// Síntoma en logs:
// ❌ Error en conversión base64

// Posibles causas:
// - Archivo demasiado grande
// - Límites de string en JavaScript
// - Timeout de función en Vercel
```

## 💡 Soluciones por Tipo de Error

### Si falla FormData Parsing:
```javascript
// Verificar headers
Content-Type: multipart/form-data
```

### Si falla File Extraction:
```javascript
// Verificar nombre del field
formData.append('image', file) // ← Debe ser 'image'
```

### Si falla por tamaño:
```javascript
// Reducir tamaño máximo
if (file.size > 1 * 1024 * 1024) { // 1MB en lugar de 5MB
  return error('Archivo demasiado grande')
}
```

### Si falla por timeout:
```javascript
// Procesar en chunks o usar streaming
const chunks = []
const reader = file.stream().getReader()
```

## 🔧 Configuración de Vercel para Debug

### En `vercel.json`:
```json
{
  "functions": {
    "app/api/upload/route.ts": {
      "maxDuration": 30
    },
    "app/api/upload-debug/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Variables de entorno útiles:
```bash
VERCEL_REGION=us-east-1
VERCEL_ENV=production
NODE_VERSION=18.x
```

## 📋 Checklist de Verificación

### Pre-Deploy:
- [ ] `npm run deploy-check` pasa todas las verificaciones
- [ ] No hay errores de TypeScript
- [ ] Archivos de configuración son correctos

### Post-Deploy:
- [ ] `/api/test` responde correctamente
- [ ] `/api/upload-debug` funciona con archivo de prueba
- [ ] Logs de Vercel son accesibles
- [ ] No hay errores 500 en el dashboard

### Durante Debug:
- [ ] Imagen de prueba es válida (PNG/JPG, <1MB)
- [ ] Botones de debug responden
- [ ] Logs se muestran en tiempo real
- [ ] Errores son específicos y claros

## 🎯 Pasos Siguientes

### Si el Debug Upload falla:
1. Verificar en qué step específico falla
2. Buscar ese step en los logs de Vercel
3. Aplicar la solución correspondiente

### Si el Debug Upload pasa pero el Upload falla:
1. Comparar las diferencias entre ambos procesos
2. Verificar si es un problema de tamaño de respuesta
3. Revisar limits de Vercel para base64

### Si todo pasa pero sigue el error en producción:
1. Verificar la integración con el frontend
2. Revisar el manejo de errores en el cliente
3. Comprobar la persistencia de las imágenes

## 📞 Información de Contacto

### Logs importantes a compartir:
- Salida completa de `/api/upload-debug`
- Logs de Vercel con timestamps
- Información del archivo que falla
- Región y configuración de Vercel

### Comando para exportar logs:
```bash
vercel logs --follow your-app-name > debug-logs.txt
```

---

**Nota**: Esta guía debe usarse junto con `VERCEL_DEPLOY_GUIDE.md` para una solución completa del problema de upload. 