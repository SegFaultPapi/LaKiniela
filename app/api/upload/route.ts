import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🚀 === INICIO UPLOAD API ===')
  
  try {
    console.log('📝 Step 1: Iniciando procesamiento de request')
    console.log('📝 Headers:', Object.fromEntries(request.headers.entries()))
    console.log('📝 Method:', request.method)
    console.log('📝 URL:', request.url)
    
    console.log('📝 Step 2: Obteniendo FormData')
    const formData = await request.formData()
    console.log('📝 FormData entries:', [...formData.entries()].map(([key, value]) => [key, typeof value]))
    
    console.log('📝 Step 3: Extrayendo archivo')
    const file = formData.get('image') as File
    
    if (!file) {
      console.log('❌ No se encontró archivo en FormData')
      return NextResponse.json(
        { error: 'No se proporcionó ninguna imagen' },
        { status: 400 }
      )
    }

    console.log('📝 Step 4: Validando archivo')
    console.log('📝 File info:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    })

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      console.log('❌ Tipo de archivo inválido:', file.type)
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Archivo demasiado grande:', file.size)
      return NextResponse.json(
        { error: 'La imagen debe ser menor a 5MB' },
        { status: 400 }
      )
    }

    console.log('📝 Step 5: Convirtiendo a ArrayBuffer')
    const bytes = await file.arrayBuffer()
    console.log('📝 ArrayBuffer size:', bytes.byteLength)
    
    console.log('📝 Step 6: Creando Buffer')
    const buffer = Buffer.from(bytes)
    console.log('📝 Buffer size:', buffer.length)
    
    console.log('📝 Step 7: Convirtiendo a base64')
    const base64 = buffer.toString('base64')
    console.log('📝 Base64 length:', base64.length)
    
    console.log('📝 Step 8: Creando data URL')
    const dataURL = `data:${file.type};base64,${base64}`
    console.log('📝 Data URL length:', dataURL.length)
    
    // Verificar si la data URL es muy grande
    if (dataURL.length > 1024 * 1024) { // 1MB
      console.log('⚠️ Data URL muy grande, podría causar problemas:', dataURL.length)
    }

    console.log('📝 Step 9: Preparando respuesta')
    const response = {
      success: true, 
      imageUrl: dataURL,
      message: 'Imagen procesada exitosamente',
      fileName: file.name,
      fileSize: file.size,
      debug: {
        originalSize: file.size,
        base64Length: base64.length,
        dataURLLength: dataURL.length,
        compressionRatio: (file.size / base64.length * 100).toFixed(2) + '%'
      }
    }
    
    console.log('📝 Step 10: Enviando respuesta')
    console.log('✅ === UPLOAD EXITOSO ===')
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ === ERROR EN UPLOAD API ===')
    console.error('❌ Error type:', typeof error)
    console.error('❌ Error constructor:', error?.constructor?.name)
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available')
    
    // Intentar obtener más información del error
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        cause: error.cause,
      })
    }
    
    // Error más detallado
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorResponse = {
      error: `Error interno del servidor: ${errorMessage}`,
      debug: {
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        timestamp: new Date().toISOString(),
        vercelRegion: process.env.VERCEL_REGION,
        nodeVersion: process.version,
      }
    }
    
    console.error('❌ Sending error response:', errorResponse)
    console.error('❌ === FIN ERROR ===')
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
} 