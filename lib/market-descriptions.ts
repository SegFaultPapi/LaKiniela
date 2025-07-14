// Sistema de almacenamiento para descripciones de markets
export interface MarketDescription {
  marketId: number
  description: string
  createdAt: string
  contractAddress: string
}

export class MarketDescriptionStorage {
  private static DESCRIPTIONS_KEY = "la-kiniela-market-descriptions"

  // Obtener todas las descripciones almacenadas
  static getDescriptions(): MarketDescription[] {
    try {
      const stored = localStorage.getItem(this.DESCRIPTIONS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error cargando descripciones de markets:", error)
      return []
    }
  }

  // Obtener descripción de un market específico
  static getDescription(marketId: number, contractAddress: string): string | null {
    const descriptions = this.getDescriptions()
    const marketDescription = descriptions.find(
      desc => desc.marketId === marketId && desc.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    )
    return marketDescription?.description || null
  }

  // Guardar descripción de un market
  static saveDescription(marketId: number, description: string, contractAddress: string): void {
    if (!description || description.trim() === "") {
      console.log("⚠️ Descripción vacía, no se guardará para market", marketId)
      return
    }

    try {
      const descriptions = this.getDescriptions()
      
      // Remover descripción existente si hay una
      const filteredDescriptions = descriptions.filter(
        desc => !(desc.marketId === marketId && desc.contractAddress.toLowerCase() === contractAddress.toLowerCase())
      )

      // Agregar nueva descripción
      const newDescription: MarketDescription = {
        marketId,
        description: description.trim(),
        createdAt: new Date().toISOString(),
        contractAddress: contractAddress.toLowerCase()
      }

      filteredDescriptions.push(newDescription)
      localStorage.setItem(this.DESCRIPTIONS_KEY, JSON.stringify(filteredDescriptions))
      
      console.log("✅ Descripción guardada para market", marketId, ":", description.substring(0, 50) + "...")
    } catch (error) {
      console.error("Error guardando descripción del market:", error)
    }
  }

  // Remover descripción de un market
  static removeDescription(marketId: number, contractAddress: string): void {
    try {
      const descriptions = this.getDescriptions()
      const filteredDescriptions = descriptions.filter(
        desc => !(desc.marketId === marketId && desc.contractAddress.toLowerCase() === contractAddress.toLowerCase())
      )
      localStorage.setItem(this.DESCRIPTIONS_KEY, JSON.stringify(filteredDescriptions))
      console.log("🗑️ Descripción removida para market", marketId)
    } catch (error) {
      console.error("Error removiendo descripción del market:", error)
    }
  }

  // Limpiar descripciones antiguas (más de 30 días)
  static cleanupOldDescriptions(): void {
    try {
      const descriptions = this.getDescriptions()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const validDescriptions = descriptions.filter(desc => {
        const createdDate = new Date(desc.createdAt)
        return createdDate > thirtyDaysAgo
      })

      if (validDescriptions.length < descriptions.length) {
        localStorage.setItem(this.DESCRIPTIONS_KEY, JSON.stringify(validDescriptions))
        console.log(`🧹 Limpieza completada: ${descriptions.length - validDescriptions.length} descripciones antiguas removidas`)
      }
    } catch (error) {
      console.error("Error limpiando descripciones antiguas:", error)
    }
  }

  // Obtener estadísticas
  static getStats(): { total: number; withDescriptions: number } {
    const descriptions = this.getDescriptions()
    return {
      total: descriptions.length,
      withDescriptions: descriptions.filter(desc => desc.description && desc.description.trim() !== "").length
    }
  }
} 