import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔍 === UPLOAD DEBUG API ===')
  
  try {
    // Test 1: Básico - solo confirmar que llegó el request
    console.log('✅ Test 1: Request recibido')
    
    // Test 2: Headers
    console.log('✅ Test 2: Headers disponibles')
    const headers = Object.fromEntries(request.headers.entries())
    console.log('Headers:', headers)
    
    // Test 3: FormData parsing
    console.log('✅ Test 3: Intentando parsear FormData')
    let formData
    try {
      formData = await request.formData()
      console.log('✅ FormData parseado exitosamente')
    } catch (error) {
      console.error('❌ Error parseando FormData:', error)
      return NextResponse.json({
        error: 'Error parseando FormData',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
    
    // Test 4: Entries in FormData
    console.log('✅ Test 4: Analizando entries en FormData')
    const entries = [...formData.entries()]
    console.log('Entries count:', entries.length)
    console.log('Entries:', entries.map(([key, value]) => [key, typeof value, value instanceof File ? 'File' : 'Not File']))
    
    // Test 5: File extraction
    console.log('✅ Test 5: Extrayendo archivo')
    const file = formData.get('image')
    console.log('File type:', typeof file)
    console.log('Is File?', file instanceof File)
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file found',
        formDataEntries: entries.map(([key, value]) => [key, typeof value])
      }, { status: 400 })
    }
    
    if (!(file instanceof File)) {
      return NextResponse.json({
        success: false,
        error: 'Not a File instance',
        fileType: typeof file,
        fileValue: String(file)
      }, { status: 400 })
    }
    
    // Test 6: File properties
    console.log('✅ Test 6: Propiedades del archivo')
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }
    console.log('File info:', fileInfo)
    
    // Test 7: ArrayBuffer conversion (without processing)
    console.log('✅ Test 7: Conversión a ArrayBuffer')
    let arrayBuffer
    try {
      arrayBuffer = await file.arrayBuffer()
      console.log('ArrayBuffer size:', arrayBuffer.byteLength)
    } catch (error) {
      console.error('❌ Error convirtiendo a ArrayBuffer:', error)
      return NextResponse.json({
        error: 'Error converting to ArrayBuffer',
        details: error instanceof Error ? error.message : 'Unknown error',
        fileInfo
      }, { status: 500 })
    }
    
    // Test 8: Buffer creation (small test)
    console.log('✅ Test 8: Creación de Buffer')
    let buffer
    try {
      buffer = Buffer.from(arrayBuffer)
      console.log('Buffer size:', buffer.length)
    } catch (error) {
      console.error('❌ Error creando Buffer:', error)
      return NextResponse.json({
        error: 'Error creating Buffer',
        details: error instanceof Error ? error.message : 'Unknown error',
        fileInfo
      }, { status: 500 })
    }
    
    // Test 9: Base64 conversion (small sample)
    console.log('✅ Test 9: Conversión a base64 (sample)')
    let base64Sample
    try {
      // Solo convertir los primeros 1000 bytes para evitar problemas de tamaño
      const sampleBuffer = buffer.slice(0, 1000)
      base64Sample = sampleBuffer.toString('base64')
      console.log('Base64 sample length:', base64Sample.length)
    } catch (error) {
      console.error('❌ Error en conversión base64:', error)
      return NextResponse.json({
        error: 'Error converting to base64',
        details: error instanceof Error ? error.message : 'Unknown error',
        fileInfo
      }, { status: 500 })
    }
    
    // Success response
    return NextResponse.json({
      success: true,
      message: 'All debug tests passed',
      fileInfo,
      tests: {
        formDataParsing: 'OK',
        fileExtraction: 'OK',
        arrayBufferConversion: 'OK',
        bufferCreation: 'OK',
        base64Conversion: 'OK (sample)'
      },
      debug: {
        arrayBufferSize: arrayBuffer.byteLength,
        bufferSize: buffer.length,
        base64SampleLength: base64Sample.length,
        timestamp: new Date().toISOString(),
        vercelRegion: process.env.VERCEL_REGION,
        nodeVersion: process.version,
      }
    })
    
  } catch (error) {
    console.error('❌ === ERROR GENERAL EN DEBUG API ===')
    console.error('❌ Error:', error)
    
    return NextResponse.json({
      error: 'General error in debug API',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack available',
      timestamp: new Date().toISOString(),
      vercelRegion: process.env.VERCEL_REGION,
      nodeVersion: process.version,
    }, { status: 500 })
  }
} 