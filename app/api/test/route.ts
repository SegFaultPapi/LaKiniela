import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const environment = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
      timestamp: new Date().toISOString(),
      canWriteFiles: false, // Siempre falso en Vercel
    }

    // Probar algunas funciones básicas
    const testResults = {
      bufferCreation: true,
      base64Encoding: true,
      jsonParsing: true,
    }

    try {
      // Test buffer creation
      const testBuffer = Buffer.from('test data')
      testResults.bufferCreation = testBuffer.length > 0
      
      // Test base64 encoding
      const testBase64 = testBuffer.toString('base64')
      testResults.base64Encoding = testBase64.length > 0
      
      // Test JSON parsing
      const testJson = JSON.stringify({ test: 'data' })
      const parsedJson = JSON.parse(testJson)
      testResults.jsonParsing = parsedJson.test === 'data'
      
    } catch (error) {
      console.error('Error en tests:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'API funcionando correctamente',
      environment,
      testResults,
      serverlessFunction: true,
    })

  } catch (error) {
    console.error('Error en API test:', error)
    return NextResponse.json(
      { 
        error: 'Error en el servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'POST request procesado correctamente',
      receivedData: body,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error en POST test:', error)
    return NextResponse.json(
      { 
        error: 'Error procesando POST request',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 