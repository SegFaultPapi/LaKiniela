// Sistema de almacenamiento para imágenes de markets - Version Cloud
export interface MarketImage {
  marketId: number
  imageUrl: string
  uploadedAt: string
  contractAddress: string
}

export class MarketImageCloudStorage {
  private static SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  private static SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Obtener imagen de un market específico
  static async getImage(marketId: number, contractAddress: string): Promise<string | null> {
    try {
      const response = await fetch('/api/images/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId,
          contractAddress: contractAddress.toLowerCase()
        })
      })

      if (!response.ok) {
        console.error('Error obteniendo imagen:', response.status)
        return null
      }

      const data = await response.json()
      return data.imageUrl || null
    } catch (error) {
      console.error('Error obteniendo imagen:', error)
      return null
    }
  }

  // Guardar imagen de un market
  static async saveImage(marketId: number, imageUrl: string, contractAddress: string): Promise<boolean> {
    try {
      const response = await fetch('/api/images/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId,
          imageUrl,
          contractAddress: contractAddress.toLowerCase()
        })
      })

      if (!response.ok) {
        console.error('Error guardando imagen:', response.status)
        return false
      }

      console.log("✅ Imagen guardada en la nube para market", marketId)
      return true
    } catch (error) {
      console.error('Error guardando imagen:', error)
      return false
    }
  }

  // Obtener todas las imágenes
  static async getAllImages(): Promise<MarketImage[]> {
    try {
      const response = await fetch('/api/images/all')
      
      if (!response.ok) {
        console.error('Error obteniendo todas las imágenes:', response.status)
        return []
      }

      const data = await response.json()
      return data.images || []
    } catch (error) {
      console.error('Error obteniendo todas las imágenes:', error)
      return []
    }
  }

  // Eliminar imagen de un market
  static async removeImage(marketId: number, contractAddress: string): Promise<boolean> {
    try {
      const response = await fetch('/api/images/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId,
          contractAddress: contractAddress.toLowerCase()
        })
      })

      if (!response.ok) {
        console.error('Error eliminando imagen:', response.status)
        return false
      }

      console.log("🗑️ Imagen eliminada de la nube para market", marketId)
      return true
    } catch (error) {
      console.error('Error eliminando imagen:', error)
      return false
    }
  }
} 