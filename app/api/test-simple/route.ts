import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'API funcionando correctamente en Vercel',
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      vercelRegion: process.env.VERCEL_REGION || 'unknown',
      vercelEnv: process.env.VERCEL_ENV || 'unknown'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test Simple POST - Iniciando')
    
    // Test básico de FormData
    const formData = await request.formData()
    console.log('🧪 FormData recibido correctamente')
    
    const entries = [...formData.entries()]
    console.log('🧪 Entries:', entries.length)
    
    return NextResponse.json({
      success: true,
      message: 'POST test exitoso',
      formDataEntries: entries.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error en test simple:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 