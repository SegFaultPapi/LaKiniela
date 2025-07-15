// Sistema de almacenamiento para imágenes de markets - Version Híbrida
export interface MarketImage {
  marketId: number
  imageUrl: string
  uploadedAt: string
  contractAddress: string
}

export class MarketImageStorage {
  private static IMAGES_KEY = "la-kiniela-market-images"

  // Obtener todas las imágenes almacenadas (localStorage)
  static getImages(): MarketImage[] {
    try {
      const stored = localStorage.getItem(this.IMAGES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error cargando imágenes de markets:", error)
      return []
    }
  }

  // Obtener imagen desde la API del servidor (persistente)
  static async getImageFromServer(marketId: number, contractAddress: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/images/store?marketId=${marketId}&contractAddress=${contractAddress}`)
      
      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.imageUrl || null
    } catch (error) {
      console.error("Error obteniendo imagen del servidor:", error)
      return null
    }
  }

  // Obtener imagen de un market específico (híbrido: localStorage + servidor)
  static async getImage(marketId: number, contractAddress: string): Promise<string | null> {
    // Primero intentar desde localStorage (rápido)
    const images = this.getImages()
    const localImage = images.find(
      img => img.marketId === marketId && img.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    )

    if (localImage) {
      return localImage.imageUrl
    }

    // Si no está en localStorage, buscar en el servidor
    const serverImage = await this.getImageFromServer(marketId, contractAddress)
    
    if (serverImage) {
      // Guardar en localStorage para acceso rápido futuro
      this.saveImageLocally(marketId, serverImage, contractAddress)
      return serverImage
    }

    return null
  }

  // Guardar imagen solo en localStorage
  private static saveImageLocally(marketId: number, imageUrl: string, contractAddress: string): void {
    try {
      const images = this.getImages()
      
      // Remover imagen existente si hay una
      const filteredImages = images.filter(
        img => !(img.marketId === marketId && img.contractAddress.toLowerCase() === contractAddress.toLowerCase())
      )

      // Agregar nueva imagen
      const newImage: MarketImage = {
        marketId,
        imageUrl,
        uploadedAt: new Date().toISOString(),
        contractAddress: contractAddress.toLowerCase()
      }

      filteredImages.push(newImage)
      localStorage.setItem(this.IMAGES_KEY, JSON.stringify(filteredImages))
    } catch (error) {
      console.error("Error guardando imagen localmente:", error)
    }
  }

  // Guardar imagen en el servidor (persistente)
  static async saveImageToServer(marketId: number, imageUrl: string, contractAddress: string): Promise<boolean> {
    try {
      const response = await fetch('/api/images/store', {
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
        console.error('Error guardando imagen en servidor:', response.status)
        return false
      }

      console.log("✅ Imagen guardada en servidor para market", marketId)
      return true
    } catch (error) {
      console.error('Error guardando imagen en servidor:', error)
      return false
    }
  }

  // Guardar imagen de un market (híbrido: localStorage + servidor)
  static async saveImage(marketId: number, imageUrl: string, contractAddress: string): Promise<void> {
    // Guardar en localStorage inmediatamente (para UX rápida)
    this.saveImageLocally(marketId, imageUrl, contractAddress)
    
    // Intentar guardar en servidor para persistencia global
    try {
      const serverSaved = await this.saveImageToServer(marketId, imageUrl, contractAddress)
      
      if (serverSaved) {
        console.log("✅ Imagen guardada tanto local como en servidor para market", marketId)
      } else {
        console.log("⚠️ Imagen guardada solo localmente para market", marketId)
      }
    } catch (error) {
      console.error("Error guardando en servidor, solo guardado localmente:", error)
    }
  }

  // Eliminar imagen de un market
  static removeImage(marketId: number, contractAddress: string): void {
    try {
      const images = this.getImages()
      const filteredImages = images.filter(
        img => !(img.marketId === marketId && img.contractAddress.toLowerCase() === contractAddress.toLowerCase())
      )
      localStorage.setItem(this.IMAGES_KEY, JSON.stringify(filteredImages))
    } catch (error) {
      console.error("Error eliminando imagen del market:", error)
    }
  }

  // Limpiar imágenes antiguas (más de 30 días)
  static cleanupOldImages(): void {
    try {
      const images = this.getImages()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const filteredImages = images.filter(img => {
        const uploadDate = new Date(img.uploadedAt)
        return uploadDate > thirtyDaysAgo
      })

      if (filteredImages.length < images.length) {
        localStorage.setItem(this.IMAGES_KEY, JSON.stringify(filteredImages))
        console.log(`🧹 Limpieza: eliminadas ${images.length - filteredImages.length} imágenes antiguas`)
      }
    } catch (error) {
      console.error("Error en limpieza de imágenes:", error)
    }
  }

  // Obtener todas las imágenes para debugging
  static getAllImages(): MarketImage[] {
    return this.getImages()
  }

  // Sincronizar imágenes con el servidor
  static async syncWithServer(): Promise<void> {
    try {
      const localImages = this.getImages()
      
      for (const image of localImages) {
        await this.saveImageToServer(image.marketId, image.imageUrl, image.contractAddress)
      }
      
      console.log("🔄 Sincronización con servidor completada")
    } catch (error) {
      console.error("Error sincronizando con servidor:", error)
    }
  }
} 