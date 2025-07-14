"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi"
import { useState, useEffect, useCallback } from "react"
import { 
  CONTRACTS, 
  PREDICTION_MARKET_ABI, 
  MXNB_TOKEN_ABI, 
  formatMXNB, 
  parseMXNB,
  MAX_UINT256,
  MIN_BET_AMOUNT,
  MarketOutcome,
  handleContractError,
  isCorrectNetwork,
  type MarketInfo,
  type UserShares,
  type UserInfoAdvanced
} from "@/lib/contracts-config"
import { createPublicClient, http } from "viem"
import { arbitrumSepolia } from "viem/chains"

// Cliente público para lecturas que no funcionan bien con wagmi
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http()
})

export function usePredictionMarketV2() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>()

  // Estados para markets
  const [markets, setMarkets] = useState<MarketInfo[]>([])
  const [loadingMarkets, setLoadingMarkets] = useState(false)

  // Verificar si estamos en la red correcta
  const isCorrectNet = isConnected && chainId ? isCorrectNetwork(chainId) : false

  // Esperar confirmación de transacción
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  })

  // ========== LECTURAS DE DATOS DEL CONTRATO ==========

  // Información del token MXNB
  const { data: mxnbBalance, refetch: refetchBalance, isLoading: balanceLoading, error: balanceError } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!isConnected && isCorrectNet,
      refetchInterval: 10000,
    },
  })

  const { data: tokenName } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "name",
    query: {
      enabled: isCorrectNet,
    },
  })

  const { data: tokenSymbol } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "symbol",
    query: {
      enabled: isCorrectNet,
    },
  })

  const { data: tokenDecimals } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "decimals",
    query: {
      enabled: isCorrectNet,
    },
  })

  // Allowance del usuario hacia el contrato de predicción
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.PREDICTION_MARKET] : undefined,
    query: {
      enabled: !!address && !!isConnected && isCorrectNet,
      refetchInterval: 15000,
    },
  })

  // Información del contrato de predicción
  const { data: marketCount, refetch: refetchMarketCount } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET,
    abi: PREDICTION_MARKET_ABI,
    functionName: "marketCount",
    query: {
      enabled: isCorrectNet,
      refetchInterval: 30000,
    },
  })

  const { data: bettingToken } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET,
    abi: PREDICTION_MARKET_ABI,
    functionName: "bettingToken",
    query: {
      enabled: isCorrectNet,
    },
  })

  // ========== CÁLCULOS Y ESTADO DERIVADO ==========

  // Verificar si tiene allowance infinito
  const hasInfiniteAllowance = allowance ? allowance >= BigInt("1000000000000000000000000") : false
  const maxAllowance = allowance || BigInt(0)

  // Función para refrescar allowance infinito
  const refetchInfiniteAllowance = useCallback(() => {
    refetchAllowance()
  }, [refetchAllowance])

  // ========== FUNCIONES DE LECTURA ==========

  // Función para obtener información completa del usuario
  const getUserInfoAdvanced = useCallback(async (userAddress: string, amount?: string): Promise<UserInfoAdvanced | null> => {
    if (!isCorrectNet) return null
    
    try {
      // Usar los datos ya cacheados si el usuario es el actual
      if (userAddress.toLowerCase() === address?.toLowerCase()) {
        const currentAllowance = allowance || BigInt(0)
        const currentBalance = mxnbBalance || BigInt(0)
        const needsApprovalForAmount = amount ? 
          (currentAllowance < parseMXNB(amount)) : false
        
        return {
          balance: currentBalance,
          allowance: currentAllowance,
          needsApproval: !hasInfiniteAllowance,
          hasInfinite: hasInfiniteAllowance,
          needsApprovalForAmount
        }
      }
      
      // Para otros usuarios, hacer llamadas directas
      const result = await publicClient.readContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getUserInfoAdvanced",
        args: [userAddress as `0x${string}`, parseMXNB(amount || "1")]
      }) as [bigint, bigint, boolean, boolean]

      const [balance, allowanceOther, hasInfinite, needsApprovalForAmount] = result

      return {
        balance,
        allowance: allowanceOther,
        needsApproval: !hasInfinite,
        hasInfinite,
        needsApprovalForAmount
      }
    } catch (error) {
      console.error("Error obteniendo información del usuario:", error)
      return null
    }
  }, [address, mxnbBalance, allowance, hasInfiniteAllowance, isCorrectNet])

  // Función para obtener información de un mercado
  const getMarketInfo = useCallback(async (marketId: number): Promise<MarketInfo | null> => {
    if (!isCorrectNet) return null
    
    try {
      const result = await publicClient.readContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getMarketInfo",
        args: [BigInt(marketId)]
      }) as [string, string, string, bigint, number, bigint, bigint, boolean]

      const [
        question,
        optionA,
        optionB,
        endTime,
        outcome,
        totalOptionAShares,
        totalOptionBShares,
        resolved
      ] = result

      return {
        id: marketId,
        question,
        optionA,
        optionB,
        endTime: Number(endTime),
        outcome: outcome as MarketOutcome,
        totalOptionAShares,
        totalOptionBShares,
        resolved
      }
    } catch (error) {
      console.error("Error obteniendo información del mercado:", error)
      return null
    }
  }, [isCorrectNet])

  // Función para obtener shares del usuario en un mercado
  const getUserShares = useCallback(async (marketId: number, userAddress?: string): Promise<UserShares | null> => {
    if (!isCorrectNet) return null
    
    const targetAddress = userAddress || address
    if (!targetAddress) return null

    try {
      const result = await publicClient.readContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getUserShares",
        args: [BigInt(marketId), targetAddress as `0x${string}`]
      }) as [bigint, bigint]

      const [optionAShares, optionBShares] = result

      return {
        optionAShares,
        optionBShares
      }
    } catch (error) {
      console.error("Error obteniendo shares del usuario:", error)
      return null
    }
  }, [address, isCorrectNet])

  // Función para cargar todos los markets
  const loadAllMarkets = useCallback(async () => {
    if (!isCorrectNet || !marketCount || marketCount === BigInt(0)) {
      setMarkets([])
      return
    }

    setLoadingMarkets(true)
    
    try {
      const marketPromises = []
      
      // Cargar información de todos los markets (los IDs van de 0 a marketCount-1)
      for (let i = 0; i < marketCount; i++) {
        marketPromises.push(getMarketInfo(i))
      }

      const marketResults = await Promise.all(marketPromises)
      const validMarkets = marketResults.filter((market): market is MarketInfo => market !== null)
      
      setMarkets(validMarkets)
    } catch (error) {
      console.error("Error cargando markets:", error)
      setMarkets([])
    } finally {
      setLoadingMarkets(false)
    }
  }, [isCorrectNet, marketCount, getMarketInfo])

  // Refrescar markets cuando cambie el marketCount
  useEffect(() => {
    if (marketCount !== undefined) {
      loadAllMarkets()
    }
  }, [marketCount, loadAllMarkets])

  // ========== FUNCIONES DE ESCRITURA ==========

  // Función para aprobar allowance infinito
  const approveInfiniteMXNB = useCallback(async (): Promise<string | null> => {
    if (!isCorrectNet || !address) {
      throw new Error("Conecta tu wallet a Arbitrum Sepolia")
    }

    try {
      console.log("🔄 Aprobando allowance infinito...")
      console.log("Token:", CONTRACTS.MXNB_TOKEN)
      console.log("Spender:", CONTRACTS.PREDICTION_MARKET)
      console.log("Amount:", MAX_UINT256)

      await writeContract({
        address: CONTRACTS.MXNB_TOKEN,
        abi: MXNB_TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACTS.PREDICTION_MARKET, BigInt(MAX_UINT256)],
      })

      console.log("✅ Approve enviado correctamente")
      return hash || null
    } catch (error) {
      console.error("Error en approveInfiniteMXNB:", error)
      throw new Error(handleContractError(error))
    }
  }, [address, writeContract, isCorrectNet, hash])

  // Función para crear mercado (solo owner)
  const createMarket = useCallback(async (
    question: string,
    optionA: string,
    optionB: string,
    durationHours: number
  ): Promise<string | null> => {
    if (!isCorrectNet || !address) {
      throw new Error("Conecta tu wallet a Arbitrum Sepolia")
    }

    try {
      const durationSeconds = BigInt(durationHours * 3600)
      
      await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "createMarket",
        args: [question, optionA, optionB, durationSeconds],
      })

      return hash || null
    } catch (error) {
      console.error("Error en createMarket:", error)
      throw new Error(handleContractError(error))
    }
  }, [address, writeContract, isCorrectNet, hash])

  // Función auxiliar para validar parámetros antes de la transacción
  const validateBuySharesParams = useCallback(async (
    marketId: number,
    isOptionA: boolean,
    amount: string
  ): Promise<string | null> => {
    if (!address || !isCorrectNet) {
      return "Wallet no conectado a la red correcta"
    }

    try {
      const amountWei = parseMXNB(amount)
      
      // Verificar que el amount no sea 0
      if (amountWei <= BigInt(0)) {
        return "La cantidad debe ser mayor a 0"
      }

      // Verificar balance
      if (mxnbBalance && amountWei > mxnbBalance) {
        return `Balance insuficiente. Tienes ${formatMXNB(mxnbBalance)} MXNB, necesitas ${amount} MXNB`
      }

      // Verificar allowance
      if (allowance && amountWei > allowance) {
        return "Allowance insuficiente. Debes aprobar más tokens MXNB primero."
      }

      // Verificar que el market existe
      if (marketCount && BigInt(marketId) >= marketCount) {
        return `Market ${marketId} no existe. Solo hay ${marketCount} markets disponibles.`
      }
      
      // Verificar que hay al menos 1 market
      if (!marketCount || marketCount === BigInt(0)) {
        return "No hay markets disponibles en el contrato. Crea un market primero."
      }

      // Verificar que el market específico existe llamando al contrato
      try {
        const marketInfo = await getMarketInfo(marketId)
        if (!marketInfo) {
          return `Market ${marketId} no encontrado en el contrato.`
        }
        
        // Verificar que el market no esté resuelto
        if (marketInfo.resolved) {
          return `Market ${marketId} ya está resuelto.`
        }
        
        // Verificar que el market no haya expirado
        if (marketInfo.endTime * 1000 < Date.now()) {
          return `Market ${marketId} ya expiró.`
        }
        
        console.log("✅ Market validado:", marketInfo)
      } catch (error) {
        return `Error verificando market ${marketId}: ${error}`
      }

      return null // Todo válido
    } catch (error) {
      return `Error de validación: ${error}`
    }
  }, [address, isCorrectNet, mxnbBalance, allowance, marketCount, getMarketInfo])

  // Función para comprar shares
  const buyShares = useCallback(async (
    marketId: number,
    isOptionA: boolean,
    amount: string
  ): Promise<string | null> => {
    console.log("=== DEBUGGING BUYSHARES ===")
    console.log("Market ID:", marketId, "Type:", typeof marketId)
    console.log("Is Option A:", isOptionA, "Type:", typeof isOptionA)
    console.log("Amount:", amount, "Type:", typeof amount)
    
    // Validar parámetros primero
    const validationError = await validateBuySharesParams(marketId, isOptionA, amount)
    if (validationError) {
      console.log("❌ Error de validación:", validationError)
      throw new Error(validationError)
    }

    try {
      const amountWei = parseMXNB(amount)
      const marketIdBigInt = BigInt(marketId)
      
      console.log("=== PARÁMETROS FINALES ===")
      console.log("Amount (wei):", amountWei.toString(), "Type:", typeof amountWei)
      console.log("Market ID (BigInt):", marketIdBigInt.toString(), "Type:", typeof marketIdBigInt)
      console.log("Is Option A:", isOptionA, "Type:", typeof isOptionA)
      console.log("Contract:", CONTRACTS.PREDICTION_MARKET)
      console.log("User Address:", address)
      console.log("Balance:", mxnbBalance?.toString())
      console.log("Allowance:", allowance?.toString())
      
      // Verificar que el amount sea un entero positivo
      if (amountWei <= 0) {
        throw new Error("Amount debe ser mayor a 0")
      }
      
      // Verificar que marketId sea un número válido
      if (marketId < 0 || !Number.isInteger(marketId)) {
        throw new Error(`Market ID inválido: ${marketId}`)
      }

      await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "buyShares",
        args: [marketIdBigInt, isOptionA, amountWei],
      })

      console.log("✅ Transacción enviada correctamente")
      return hash || null
    } catch (error) {
      console.error("❌ Error en buyShares:", error)
      // Log más detallado del error
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }
      throw new Error(handleContractError(error))
    }
  }, [address, writeContract, isCorrectNet, hash, validateBuySharesParams, mxnbBalance, allowance])

  // Función para reclamar ganancias
  const claimWinnings = useCallback(async (marketId: number): Promise<string | null> => {
    if (!isCorrectNet || !address) {
      throw new Error("Conecta tu wallet a Arbitrum Sepolia")
    }

    try {
      await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "claimWinnings",
        args: [BigInt(marketId)],
      })

      return hash || null
    } catch (error) {
      console.error("Error en claimWinnings:", error)
      throw new Error(handleContractError(error))
    }
  }, [address, writeContract, isCorrectNet, hash])

  // Función para resolver mercado (solo owner)
  const resolveMarket = useCallback(async (
    marketId: number,
    outcome: MarketOutcome
  ): Promise<string | null> => {
    if (!isCorrectNet || !address) {
      throw new Error("Conecta tu wallet a Arbitrum Sepolia")
    }

    try {
      await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "resolveMarket",
        args: [BigInt(marketId), outcome],
      })

      return hash || null
    } catch (error) {
      console.error("Error en resolveMarket:", error)
      throw new Error(handleContractError(error))
    }
  }, [address, writeContract, isCorrectNet, hash])

  // Función optimizada para comprar shares con verificación de allowance
  const buySharesWithAllowance = useCallback(async (
    marketId: number,
    isOptionA: boolean,
    amount: string
  ): Promise<{ success: boolean; step: string; hash?: string }> => {
    if (!isCorrectNet || !address) {
      return { success: false, step: "Conecta tu wallet a Arbitrum Sepolia" }
    }

    const balance = mxnbBalance || BigInt(0)
    const amountWei = parseMXNB(amount)

    // Verificar balance suficiente
    if (balance < amountWei) {
      return { 
        success: false, 
        step: `Balance insuficiente. Tienes ${formatMXNB(balance)} MXNB, necesitas ${amount} MXNB` 
      }
    }

    // Verificar allowance
    if (!hasInfiniteAllowance && (!allowance || allowance < amountWei)) {
      return { 
        success: false, 
        step: "Necesitas aprobar tokens MXNB primero. Haz clic en el botón 'Aprobar MXNB' antes de participar." 
      }
    }

    try {
      const hash = await buyShares(marketId, isOptionA, amount)
      return { 
        success: true, 
        step: `Comprando shares en ${isOptionA ? 'Opción A (Sí)' : 'Opción B (No)'}`, 
        hash: hash || undefined 
      }
    } catch (error) {
      console.error("Error en buySharesWithAllowance:", error)
      return { 
        success: false, 
        step: error instanceof Error ? error.message : "Error desconocido en la transacción" 
      }
    }
  }, [address, mxnbBalance, hasInfiniteAllowance, allowance, buyShares, isCorrectNet])

  // Efecto para actualizar el hash cuando cambie
  useEffect(() => {
    if (hash) {
      setLastTxHash(hash)
    }
  }, [hash])

  // ========== RETORNO ==========

  return {
    // Estado de conexión
    isConnected,
    address,
    chainId,
    isCorrectNetwork: isCorrectNet,

    // Información del token
    tokenInfo: {
      name: tokenName as string,
      symbol: tokenSymbol as string,
      decimals: tokenDecimals as number,
      address: CONTRACTS.MXNB_TOKEN,
    },

    // Balances y allowances
    balance: mxnbBalance ? formatMXNB(mxnbBalance) : "0",
    balanceRaw: mxnbBalance || BigInt(0),
    balanceLoading,
    balanceError: balanceError?.message,
    hasInfiniteAllowance: hasInfiniteAllowance || false,
    maxAllowance: maxAllowance?.toString() || MAX_UINT256,

    // Información del contrato
    marketCount: marketCount ? Number(marketCount) : 0,
    bettingToken: bettingToken as string,

    // Markets data
    markets,
    loadingMarkets,
    events: markets.map(market => ({
      id: market.id.toString(),
      nombre: market.question,
      descripcion: `Market de predicción: ${market.question}`, // Agregar descripción requerida
      pregunta: market.question,
      categoria: "general", // Default categoria
      fechaFin: new Date(Number(market.endTime) * 1000).toISOString(),
      estado: market.resolved ? "finalizado" : (Number(market.endTime) * 1000 > Date.now() ? "activo" : "finalizado"),
      imagen: undefined, // El contrato no guarda imágenes
      opciones: [
        {
          id: "si",
          nombre: market.optionA,
          cuota: market.totalOptionBShares > 0 ? 
            Number(formatMXNB(market.totalOptionAShares + market.totalOptionBShares)) / Number(formatMXNB(market.totalOptionAShares)) : 
            2.0,
          probabilidad: market.totalOptionAShares + market.totalOptionBShares > 0 ?
            (Number(formatMXNB(market.totalOptionAShares)) / Number(formatMXNB(market.totalOptionAShares + market.totalOptionBShares))) * 100 :
            50
        },
        {
          id: "no", 
          nombre: market.optionB,
          cuota: market.totalOptionAShares > 0 ? 
            Number(formatMXNB(market.totalOptionAShares + market.totalOptionBShares)) / Number(formatMXNB(market.totalOptionBShares)) : 
            2.0,
          probabilidad: market.totalOptionAShares + market.totalOptionBShares > 0 ?
            (Number(formatMXNB(market.totalOptionBShares)) / Number(formatMXNB(market.totalOptionAShares + market.totalOptionBShares))) * 100 :
            50
        }
      ]
    })),

    // Estados de transacciones
    isWritePending,
    isConfirming,
    isConfirmed,
    lastTxHash,
    txError,

    // Funciones de lectura
    getUserInfoAdvanced,
    getMarketInfo,
    getUserShares,
    refetchBalance,
    refetchMarketCount,
    refetchInfiniteAllowance,
    loadAllMarkets,

    // Funciones de escritura
    approveInfiniteMXNB,
    createMarket,
    buyShares,
    claimWinnings,
    resolveMarket,

    // Función optimizada
    buySharesWithAllowance,

    // Helpers exportados
    formatMXNB,
    handleContractError,
    MIN_BET_AMOUNT,
    MarketOutcome,
  }
} 