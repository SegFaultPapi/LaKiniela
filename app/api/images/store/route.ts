import { NextRequest, NextResponse } from 'next/server'

// Simulación de base de datos en memoria (en producción usarías una DB real)
const images = new Map<string, any>()

interface MarketImage {
  marketId: number
  imageUrl: string
  uploadedAt: string
  contractAddress: string
}

export async function POST(request: NextRequest) {
  try {
    const { marketId, imageUrl, contractAddress } = await request.json()
    
    if (!marketId || !imageUrl || !contractAddress) {
      return NextResponse.json(
        { error: 'marketId, imageUrl y contractAddress son requeridos' },
        { status: 400 }
      )
    }

    const key = `${contractAddress.toLowerCase()}_${marketId}`
    const imageData: MarketImage = {
      marketId,
      imageUrl,
      uploadedAt: new Date().toISOString(),
      contractAddress: contractAddress.toLowerCase()
    }

    images.set(key, imageData)
    
    console.log(`✅ Imagen guardada para market ${marketId} en contrato ${contractAddress}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Imagen guardada exitosamente',
      key
    })
  } catch (error) {
    console.error('Error guardando imagen:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const marketId = url.searchParams.get('marketId')
    const contractAddress = url.searchParams.get('contractAddress')
    
    if (!marketId || !contractAddress) {
      return NextResponse.json(
        { error: 'marketId y contractAddress son requeridos' },
        { status: 400 }
      )
    }

    const key = `${contractAddress.toLowerCase()}_${marketId}`
    const imageData = images.get(key)
    
    if (!imageData) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageData.imageUrl,
      uploadedAt: imageData.uploadedAt
    })
  } catch (error) {
    console.error('Error obteniendo imagen:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { marketId, contractAddress } = await request.json()
    
    if (!marketId || !contractAddress) {
      return NextResponse.json(
        { error: 'marketId y contractAddress son requeridos' },
        { status: 400 }
      )
    }

    const key = `${contractAddress.toLowerCase()}_${marketId}`
    const deleted = images.delete(key)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    console.log(`🗑️ Imagen eliminada para market ${marketId} en contrato ${contractAddress}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Imagen eliminada exitosamente' 
    })
  } catch (error) {
    console.error('Error eliminando imagen:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 