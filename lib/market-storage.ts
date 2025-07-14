import type { EventoApuesta, OpcionApuesta } from "@/lib/types"

// Estructura para almacenar markets en localStorage
export interface MarketData {
  id: string
  nombre: string
  descripcion: string
  pregunta: string
  categoria: string
  imagen?: string // URL de la imagen del market
  estado: "activo" | "finalizado" | "cancelado"
  fechaCreacion: string
  fechaFin: string
  creador: string
  poolInicial: number
  poolSi: number
  poolNo: number
  constanteK: number
  totalSharesSi: number
  totalSharesNo: number
  opciones: [OpcionApuesta, OpcionApuesta]
}

// Estructura para almacenar participaciones de usuarios
export interface UserParticipation {
  userId: string
  marketId: string
  opcionId: "si" | "no"
  shares: number
  mxnbInvertido: number
  fechaParticipacion: string
  precioCompra: number
}

// Clase para manejar la lógica AMM
export class MarketAMM {
  static calcularSharesCompradas(
    mxnbInvertido: number,
    poolActual: number,
    poolOponente: number,
    constanteK: number
  ): number {
    // Fórmula AMM: (poolActual + mxnbInvertido) * poolOponente = K
    const nuevoPoolActual = poolActual + mxnbInvertido
    const nuevoPoolOponente = constanteK / nuevoPoolActual
    
    // Las shares compradas son la diferencia en el pool oponente
    const sharesCompradas = poolOponente - nuevoPoolOponente
    
    return Math.max(0, sharesCompradas)
  }

  static calcularPrecioActual(poolSi: number, poolNo: number, constanteK: number) {
    const precioSi = constanteK / (poolNo * poolNo)
    const precioNo = constanteK / (poolSi * poolSi)
    
    return {
      precioSi: Math.max(0.01, precioSi),
      precioNo: Math.max(0.01, precioNo),
      probabilidadSi: (poolNo / (poolSi + poolNo)) * 100,
      probabilidadNo: (poolSi / (poolSi + poolNo)) * 100
    }
  }

  static actualizarPools(
    mxnbInvertido: number,
    opcionId: "si" | "no",
    poolSi: number,
    poolNo: number,
    constanteK: number
  ) {
    if (opcionId === "si") {
      const nuevoPoolSi = poolSi + mxnbInvertido
      const nuevoPoolNo = constanteK / nuevoPoolSi
      return { poolSi: nuevoPoolSi, poolNo: nuevoPoolNo }
    } else {
      const nuevoPoolNo = poolNo + mxnbInvertido
      const nuevoPoolSi = constanteK / nuevoPoolNo
      return { poolSi: nuevoPoolSi, poolNo: nuevoPoolNo }
    }
  }
}

// Clase para manejar el almacenamiento
export class MarketStorage {
  private static MARKETS_KEY = "la-kiniela-markets"
  private static PARTICIPATIONS_KEY = "la-kiniela-participations"

  // Obtener todos los markets
  static getMarkets(): MarketData[] {
    if (typeof window === "undefined") return []
    
    try {
      const data = localStorage.getItem(this.MARKETS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error al leer markets:", error)
      return []
    }
  }

  // Obtener market por ID
  static getMarket(id: string): MarketData | null {
    const markets = this.getMarkets()
    return markets.find(market => market.id === id) || null
  }

  // Eliminar todos los markets
  static clearAllMarkets(): void {
    if (typeof window === "undefined") return
    
    try {
      localStorage.removeItem(this.MARKETS_KEY)
      localStorage.removeItem(this.PARTICIPATIONS_KEY)
      console.log("Todos los markets han sido eliminados")
    } catch (error) {
      console.error("Error al eliminar markets:", error)
    }
  }

  // Crear nuevo market
  static createMarket(marketData: Omit<MarketData, "id" | "fechaCreacion" | "poolSi" | "poolNo" | "constanteK" | "totalSharesSi" | "totalSharesNo" | "opciones">): MarketData {
    const markets = this.getMarkets()
    
    const nuevoMarket: MarketData = {
      ...marketData,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
      poolSi: marketData.poolInicial / 2,
      poolNo: marketData.poolInicial / 2,
      constanteK: (marketData.poolInicial / 2) * (marketData.poolInicial / 2),
      totalSharesSi: 0,
      totalSharesNo: 0,
      opciones: [
        { id: "si", nombre: "Sí", cuota: 2.0, probabilidad: 50 },
        { id: "no", nombre: "No", cuota: 2.0, probabilidad: 50 }
      ]
    }

    // Actualizar precios iniciales
    const precios = MarketAMM.calcularPrecioActual(
      nuevoMarket.poolSi,
      nuevoMarket.poolNo,
      nuevoMarket.constanteK
    )
    
    nuevoMarket.opciones[0].cuota = precios.precioSi
    nuevoMarket.opciones[0].probabilidad = precios.probabilidadSi
    nuevoMarket.opciones[1].cuota = precios.precioNo
    nuevoMarket.opciones[1].probabilidad = precios.probabilidadNo

    markets.push(nuevoMarket)
    localStorage.setItem(this.MARKETS_KEY, JSON.stringify(markets))
    
    return nuevoMarket
  }

  // Actualizar market
  static updateMarket(marketId: string, updates: Partial<MarketData>): boolean {
    const markets = this.getMarkets()
    const index = markets.findIndex(market => market.id === marketId)
    
    if (index === -1) return false
    
    markets[index] = { ...markets[index], ...updates }
    localStorage.setItem(this.MARKETS_KEY, JSON.stringify(markets))
    return true
  }

  // Participar en un market
  static participateInMarket(
    userId: string,
    marketId: string,
    opcionId: "si" | "no",
    mxnbInvertido: number
  ): { success: boolean; sharesCompradas?: number; error?: string } {
    const market = this.getMarket(marketId)
    if (!market) {
      return { success: false, error: "Market no encontrado" }
    }

    if (market.estado !== "activo") {
      return { success: false, error: "Market no está activo" }
    }

    // Calcular shares compradas
    const poolActual = opcionId === "si" ? market.poolSi : market.poolNo
    const poolOponente = opcionId === "si" ? market.poolNo : market.poolSi
    
    const sharesCompradas = MarketAMM.calcularSharesCompradas(
      mxnbInvertido,
      poolActual,
      poolOponente,
      market.constanteK
    )

    if (sharesCompradas <= 0) {
      return { success: false, error: "No se pudieron calcular shares válidas" }
    }

    // Actualizar pools
    const nuevosPools = MarketAMM.actualizarPools(
      mxnbInvertido,
      opcionId,
      market.poolSi,
      market.poolNo,
      market.constanteK
    )

    // Calcular nuevos precios
    const nuevosPrecios = MarketAMM.calcularPrecioActual(
      nuevosPools.poolSi,
      nuevosPools.poolNo,
      market.constanteK
    )

    // Actualizar market
    const marketActualizado: MarketData = {
      ...market,
      poolSi: nuevosPools.poolSi,
      poolNo: nuevosPools.poolNo,
      totalSharesSi: market.totalSharesSi + (opcionId === "si" ? sharesCompradas : 0),
      totalSharesNo: market.totalSharesNo + (opcionId === "no" ? sharesCompradas : 0),
      opciones: [
        { id: "si", nombre: "Sí", cuota: nuevosPrecios.precioSi, probabilidad: nuevosPrecios.probabilidadSi },
        { id: "no", nombre: "No", cuota: nuevosPrecios.precioNo, probabilidad: nuevosPrecios.probabilidadNo }
      ]
    }

    this.updateMarket(marketId, marketActualizado)

    // Guardar participación del usuario
    const participations = this.getParticipations()
    const participation: UserParticipation = {
      userId,
      marketId,
      opcionId,
      shares: sharesCompradas,
      mxnbInvertido,
      fechaParticipacion: new Date().toISOString(),
      precioCompra: opcionId === "si" ? market.opciones[0].cuota : market.opciones[1].cuota
    }

    participations.push(participation)
    localStorage.setItem(this.PARTICIPATIONS_KEY, JSON.stringify(participations))

    return { success: true, sharesCompradas }
  }

  // Obtener participaciones de un usuario
  static getParticipations(userId?: string): UserParticipation[] {
    if (typeof window === "undefined") return []
    
    try {
      const data = localStorage.getItem(this.PARTICIPATIONS_KEY)
      const participations: UserParticipation[] = data ? JSON.parse(data) : []
      
      if (userId) {
        return participations.filter(p => p.userId === userId)
      }
      
      return participations
    } catch (error) {
      console.error("Error al leer participaciones:", error)
      return []
    }
  }

  // Obtener participaciones de un usuario en un market específico
  static getUserMarketParticipation(userId: string, marketId: string): UserParticipation | null {
    const participations = this.getParticipations(userId)
    return participations.find(p => p.marketId === marketId) || null
  }

  // Finalizar market
  static finalizeMarket(marketId: string, opcionGanadora: "si" | "no"): boolean {
    const market = this.getMarket(marketId)
    if (!market) return false

    const marketFinalizado: MarketData = {
      ...market,
      estado: "finalizado"
    }

    return this.updateMarket(marketId, marketFinalizado)
  }

  // Calcular ganancias potenciales
  static calcularGananciasPotenciales(userId: string, marketId: string): number {
    const participation = this.getUserMarketParticipation(userId, marketId)
    const market = this.getMarket(marketId)
    
    if (!participation || !market) return 0

    const poolTotal = market.poolSi + market.poolNo
    const sharesTotales = participation.opcionId === "si" ? market.totalSharesSi : market.totalSharesNo
    
    if (sharesTotales === 0) return 0
    
    return (participation.shares / sharesTotales) * poolTotal
  }
} 