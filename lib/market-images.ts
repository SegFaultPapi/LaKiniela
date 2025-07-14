// Sistema de almacenamiento para imágenes de markets
export interface MarketImage {
  marketId: number
  imageUrl: string
  uploadedAt: string
  contractAddress: string
}

export class MarketImageStorage {
  private static IMAGES_KEY = "la-kiniela-market-images"

  // Obtener todas las imágenes almacenadas
  static getImages(): MarketImage[] {
    try {
      const stored = localStorage.getItem(this.IMAGES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error cargando imágenes de markets:", error)
      return []
    }
  }

  // Obtener imagen de un market específico
  static getImage(marketId: number, contractAddress: string): string | null {
    const images = this.getImages()
    const marketImage = images.find(
      img => img.marketId === marketId && img.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    )
    return marketImage?.imageUrl || null
  }

  // Guardar imagen de un market
  static saveImage(marketId: number, imageUrl: string, contractAddress: string): void {
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
      
      console.log("✅ Imagen guardada para market", marketId, ":", imageUrl)
    } catch (error) {
      console.error("Error guardando imagen del market:", error)
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
} 