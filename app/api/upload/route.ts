import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ninguna imagen' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'La imagen debe ser menor a 5MB' },
        { status: 400 }
      )
    }

    // Convertir imagen a base64 (compatible con Vercel)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    
    // Crear data URL
    const dataURL = `data:${file.type};base64,${base64}`

    console.log('✅ Imagen convertida a base64:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      base64Length: base64.length,
      dataURLLength: dataURL.length
    })

    return NextResponse.json({ 
      success: true, 
      imageUrl: dataURL,
      message: 'Imagen procesada exitosamente',
      fileName: file.name,
      fileSize: file.size
    })

  } catch (error) {
    console.error('❌ Error al procesar imagen:', error)
    return NextResponse.json(
      { error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    )
  }
} 