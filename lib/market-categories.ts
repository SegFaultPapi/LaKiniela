// Sistema de almacenamiento para categorías de markets
export interface MarketCategory {
  marketId: number
  category: string
  createdAt: string
  contractAddress: string
}

export class MarketCategoryStorage {
  private static CATEGORIES_KEY = "la-kiniela-market-categories"

  // Obtener todas las categorías almacenadas
  static getCategories(): MarketCategory[] {
    if (typeof window === "undefined") return []
    
    try {
      const data = localStorage.getItem(this.CATEGORIES_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error al leer categorías de markets:", error)
      return []
    }
  }

  // Obtener categoría de un market específico
  static getCategory(marketId: number, contractAddress: string): string | null {
    try {
      const categories = this.getCategories()
      const category = categories.find(
        cat => cat.marketId === marketId && cat.contractAddress.toLowerCase() === contractAddress.toLowerCase()
      )
      return category?.category || null
    } catch (error) {
      console.error("Error obteniendo categoría del market:", error)
      return null
    }
  }

  // Guardar categoría de un market
  static saveCategory(marketId: number, category: string, contractAddress: string): void {
    if (!category || category.trim() === "") {
      console.log("⚠️ Categoría vacía, no se guardará para market", marketId)
      return
    }

    try {
      const categories = this.getCategories()
      
      // Remover categoría existente si hay una
      const filteredCategories = categories.filter(
        cat => !(cat.marketId === marketId && cat.contractAddress.toLowerCase() === contractAddress.toLowerCase())
      )

      // Agregar nueva categoría
      const newCategory: MarketCategory = {
        marketId,
        category: category.trim(),
        createdAt: new Date().toISOString(),
        contractAddress: contractAddress.toLowerCase()
      }

      filteredCategories.push(newCategory)
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(filteredCategories))
      
      console.log("✅ Categoría guardada para market", marketId, ":", category)
    } catch (error) {
      console.error("Error guardando categoría del market:", error)
    }
  }

  // Limpiar categorías de markets que ya no existen
  static cleanupOldCategories(validMarketIds: number[], contractAddress: string): void {
    try {
      const categories = this.getCategories()
      const filteredCategories = categories.filter(cat => {
        const isFromContract = cat.contractAddress.toLowerCase() === contractAddress.toLowerCase()
        return !isFromContract || validMarketIds.includes(cat.marketId)
      })
      
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(filteredCategories))
      console.log("🧹 Categorías limpiadas para contrato", contractAddress)
    } catch (error) {
      console.error("Error limpiando categorías:", error)
    }
  }

  // Debugging: mostrar todas las categorías
  static debugCategories(): void {
    console.log("📋 === CATEGORÍAS ALMACENADAS ===")
    const categories = this.getCategories()
    categories.forEach(cat => {
      console.log(`Market ${cat.marketId}: ${cat.category} (${cat.contractAddress})`)
    })
    console.log("================================")
  }
} 