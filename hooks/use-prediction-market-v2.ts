"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi"
import { useState, useEffect, useCallback, useMemo } from "react"
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
import { createPublicClient, http, fallback } from "viem"
import { arbitrumSepolia } from "viem/chains"
import type { OpcionApuesta } from "@/lib/types"
import { MarketImageStorage } from "@/lib/market-images"
import { MarketDescriptionStorage } from "@/lib/market-descriptions"
import { MarketCategoryStorage } from "@/lib/market-categories"

// Cliente público con múltiples RPCs para mayor confiabilidad
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: fallback([
    http("https://arbitrum-sepolia.blockpi.network/v1/rpc/public"),
    http("https://sepolia-rollup.arbitrum.io/rpc"),
    http("https://arbitrum-sepolia.infura.io/v3/1234567890123456789012345678901234567890"),
    http("https://arbitrum-sepolia-rpc.publicnode.com"),
    http(), // Fallback por defecto
  ], {
    rank: false,
    retryCount: 2,
    retryDelay: 1000,
  })
})

export function usePredictionMarketV2() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>()

  // Estados existentes
  const [txError, setTxError] = useState<string>("")
  const [marketsData, setMarketsData] = useState<MarketInfo[]>([])
  const [loadingMarkets, setLoadingMarkets] = useState(false)

  // Nuevo estado para owner
  const [contractOwner, setContractOwner] = useState<string | null>(null)
  const [isLoadingOwner, setIsLoadingOwner] = useState(false)

  // Verificar si estamos en la red correcta
  const isCorrectNet = isConnected && chainId ? isCorrectNetwork(chainId) : false

  // Esperar confirmación de transacción
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: transactionError } = useWaitForTransactionReceipt({
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

  // Información del contrato de predicción con mejor manejo de errores
  const { data: marketCount, refetch: refetchMarketCount, error: marketCountError } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET,
    abi: PREDICTION_MARKET_ABI,
    functionName: "marketCount",
    query: {
      enabled: isCorrectNet,
      refetchInterval: 30000,
      retry: 3,
      retryDelay: 2000,
    },
  })

  // Log errores de marketCount
  useEffect(() => {
    if (marketCountError) {
      console.error("❌ Error obteniendo marketCount:", marketCountError)
    }
  }, [marketCountError])

  const { data: bettingToken } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET,
    abi: PREDICTION_MARKET_ABI,
    functionName: "bettingToken",
    query: {
      enabled: isCorrectNet,
    },
  })

  // Obtener owner del contrato
  const { data: ownerData } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET,
    abi: PREDICTION_MARKET_ABI,
    functionName: "owner",
    query: {
      enabled: isCorrectNet,
    },
  })

  // Estado derivado: ¿es el usuario el owner?
  const isOwner = useMemo(() => {
    if (!address || !ownerData) return false
    return address.toLowerCase() === (ownerData as string).toLowerCase()
  }, [address, ownerData])

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

  // Función para obtener información de un mercado con mejor manejo de errores
  const getMarketInfo = useCallback(async (marketId: number): Promise<MarketInfo | null> => {
    if (!isCorrectNet) {
      console.log(`⚠️ Red incorrecta para obtener market ${marketId}`)
      return null
    }
    
    // Verificar que el marketId sea válido
    if (marketId < 0) {
      console.error(`❌ Market ID inválido: ${marketId}`)
      return null
    }
    
    try {
      console.log(`🔍 Obteniendo información del market ${marketId}...`)
      
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

      console.log(`✅ Market ${marketId} obtenido:`, { question, optionA, optionB, resolved })

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
    } catch (error: any) {
      console.error(`❌ Error obteniendo market ${marketId}:`, error)
      
      // Si es un error de RPC, intentar con el siguiente
      if (error.message?.includes("Failed to fetch") || error.message?.includes("HTTP request failed")) {
        console.log(`🔄 Reintentando obtener market ${marketId} en 2 segundos...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Un solo reintento adicional
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

          console.log(`✅ Market ${marketId} obtenido en segundo intento`)

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
        } catch (retryError: any) {
          console.error(`❌ Error en segundo intento para market ${marketId}:`, retryError)
          return null
        }
      }
      
      // Si el error indica que el market no existe, no es un error crítico
      if (error.message?.includes("Market does not exist") || error.message?.includes("invalid market")) {
        console.log(`ℹ️ Market ${marketId} no existe`)
        return null
      }
      
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

  // Función para verificar la conectividad del RPC y salud del contrato
  const verifyRPCConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔍 Verificando conectividad del RPC...")
      
      // Verificar que podemos obtener el block number
      const blockNumber = await publicClient.getBlockNumber()
      console.log("✅ RPC conectado, block number:", blockNumber.toString())
      
      // Verificar que el contrato existe y responde
      const contractCode = await publicClient.getCode({
        address: CONTRACTS.PREDICTION_MARKET
      })
      
      if (!contractCode || contractCode === "0x") {
        console.error("❌ El contrato no existe en esta dirección")
        return false
      }
      
      console.log("✅ Contrato verificado, código encontrado")
      return true
    } catch (error: any) {
      console.error("❌ Error verificando conectividad:", error)
      return false
    }
  }, [])

  // Función para cargar todos los markets con mejor manejo de errores
  const loadAllMarkets = useCallback(async () => {
    if (!isCorrectNet) {
      console.log("⚠️ Red incorrecta, no se pueden cargar markets")
      setMarketsData([])
      return
    }

    // Verificar conectividad primero
    const isRPCConnected = await verifyRPCConnectivity()
    if (!isRPCConnected) {
      console.log("❌ RPC no disponible, no se pueden cargar markets")
      setMarketsData([])
      return
    }

    if (!marketCount || marketCount === BigInt(0)) {
      console.log("ℹ️ No hay markets para cargar (marketCount:", marketCount, ")")
      setMarketsData([])
      return
    }

    setLoadingMarkets(true)
    console.log(`🔄 Cargando ${marketCount} markets...`)
    
    try {
      const validMarkets: MarketInfo[] = []
      const totalCount = Number(marketCount)
      
      // Cargar markets uno por uno para mejor manejo de errores
      for (let i = 0; i < totalCount; i++) {
        try {
          console.log(`📋 Cargando market ${i}/${totalCount - 1}...`)
          const market = await getMarketInfo(i)
          
          if (market) {
            validMarkets.push(market)
            console.log(`✅ Market ${i} cargado: "${market.question}"`)
          } else {
            console.log(`⚠️ Market ${i} no encontrado o error`)
          }
        } catch (error: any) {
          console.error(`❌ Error específico cargando market ${i}:`, error.message || error)
          // Continuar con el siguiente market en lugar de fallar todo
          continue
        }
        
        // Pequeña pausa para evitar sobrecargar el RPC
        if (i < totalCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      console.log(`✅ Carga completa: ${validMarkets.length}/${totalCount} markets válidos`)
      setMarketsData(validMarkets)
    } catch (error: any) {
      console.error("❌ Error general cargando markets:", error)
      setMarketsData([])
    } finally {
      setLoadingMarkets(false)
    }
  }, [isCorrectNet, marketCount, getMarketInfo, verifyRPCConnectivity])

  // Refrescar markets cuando cambie el marketCount
  useEffect(() => {
    if (marketCount !== undefined) {
      loadAllMarkets()
    }
  }, [marketCount, loadAllMarkets])

  // Efecto para limpiar imágenes antiguas al cargar el hook
  useEffect(() => {
    MarketImageStorage.cleanupOldImages()
    MarketDescriptionStorage.cleanupOldDescriptions()
  }, [])

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
      
      console.log("🚀 === DEBUGGING CREATE MARKET ===")
      console.log("Question:", question)
      console.log("Option A:", optionA)
      console.log("Option B:", optionB)
      console.log("Duration Hours:", durationHours, "Type:", typeof durationHours)
      console.log("Duration Seconds:", durationSeconds.toString(), "Type:", typeof durationSeconds)
      console.log("Contract Address:", CONTRACTS.PREDICTION_MARKET)
      console.log("User Address:", address)
      console.log("Is Owner:", isOwner)
      console.log("Contract Limits:")
      console.log("  - Min Duration:", 3600, "seconds (", 3600 / 3600, "hours )")
      console.log("  - Max Duration:", 2592000, "seconds (", 2592000 / 3600, "hours )")
      console.log("  - Calculated:", durationSeconds.toString(), "seconds")
      console.log("=================================")
      
      // Validar antes de enviar al contrato
      if (durationHours < 1) {
        throw new Error("Duración debe ser al menos 1 hora")
      }
      
      if (durationHours > 720) { // 30 días
        throw new Error("Duración no puede exceder 720 horas (30 días)")
      }
      
      await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "createMarket",
        args: [question, optionA, optionB, durationSeconds],
      })

      console.log("✅ CreateMarket enviado correctamente")
      return hash || null
    } catch (error) {
      console.error("❌ Error en createMarket:", error)
      throw new Error(handleContractError(error))
    }
  }, [address, writeContract, isCorrectNet, hash, isOwner])

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

      // Verificar que cumple el mínimo de apuesta del contrato
      const minBetAmountWei = BigInt(MIN_BET_AMOUNT)
      if (amountWei < minBetAmountWei) {
        return `Cantidad mínima de apuesta: ${formatMXNB(minBetAmountWei)} MXNB. Ingresaste: ${amount} MXNB`
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

  // Función para verificar si el usuario puede comprar shares (diagnóstico)
  const canUserBuyShares = useCallback(async (
    marketId: number,
    amount: string,
    userAddress?: string
  ): Promise<{ canBuy: boolean; reason: string }> => {
    if (!isCorrectNet) return { canBuy: false, reason: "Red incorrecta" }
    
    const targetAddress = userAddress || address
    if (!targetAddress) return { canBuy: false, reason: "Sin dirección" }

    try {
      const amountWei = parseMXNB(amount)
      
      const result = await publicClient.readContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "canUserBuyShares",
        args: [targetAddress as `0x${string}`, amountWei]
      }) as [boolean, string]

      const [canBuy, reason] = result
      
      console.log("🔍 canUserBuyShares result:", { canBuy, reason, amount, amountWei: amountWei.toString() })
      
      return { canBuy, reason }
    } catch (error) {
      console.error("Error verificando canUserBuyShares:", error)
      return { canBuy: false, reason: `Error de verificación: ${error}` }
    }
  }, [address, isCorrectNet])

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
      
      // Si es el problema del minimum bet amount, hacer diagnóstico completo
      if (validationError.includes("Cantidad mínima de apuesta")) {
        const diagnosis = await diagnoseContractBetIssue(amount)
        console.log("📊 Diagnóstico completo:", diagnosis)
      }
      
      throw new Error(validationError)
    }

    // NUEVO: Verificar usando canUserBuyShares del contrato
    console.log("🔍 Verificando con canUserBuyShares...")
    const buyCheck = await canUserBuyShares(marketId, amount)
    if (!buyCheck.canBuy) {
      console.log("❌ El contrato dice que no puedes comprar:", buyCheck.reason)
      throw new Error(`El contrato rechaza la compra: ${buyCheck.reason}`)
    }
    console.log("✅ El contrato dice que SÍ puedes comprar:", buyCheck.reason)

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
  }, [address, writeContract, isCorrectNet, hash, validateBuySharesParams, mxnbBalance, allowance, canUserBuyShares])

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

  // Función para cerrar/cancelar mercado (solo owner)
  const closeMarket = useCallback(async (marketId: number): Promise<string | null> => {
    if (!isCorrectNet || !address) {
      throw new Error("Conecta tu wallet a Arbitrum Sepolia")
    }

    if (!isOwner) {
      throw new Error("Solo el propietario del contrato puede cerrar markets")
    }

    try {
      setTxError("")
      
      console.log("🗑️ === DEBUGGING CLOSE MARKET ===")
      console.log("Market ID:", marketId, "Type:", typeof marketId)
      console.log("Contract Address:", CONTRACTS.PREDICTION_MARKET)
      console.log("User Address:", address)
      console.log("Is Owner:", isOwner)
      console.log("===================================")
      
      // IMPORTANTE: Validar que el market haya expirado
      const marketInfo = await getMarketInfo(marketId)
      if (!marketInfo) {
        throw new Error(`Market ${marketId} no encontrado`)
      }
      
      const now = Math.floor(Date.now() / 1000) // Tiempo actual en segundos
      const marketEndTime = Number(marketInfo.endTime)
      
      console.log("🕒 Validación de tiempo:")
      console.log("  - Tiempo actual:", now, "segundos")
      console.log("  - Market endTime:", marketEndTime, "segundos")
      console.log("  - Market expirado?", now >= marketEndTime)
      console.log("  - Diferencia:", (marketEndTime - now), "segundos")
      
      if (now < marketEndTime) {
        const horasRestantes = Math.ceil((marketEndTime - now) / 3600)
        throw new Error(
          `❌ LIMITACIÓN DEL CONTRATO: No se pueden cerrar markets antes de que terminen. ` +
          `Este market termina en ${horasRestantes} horas. ` +
          `Solo puedes cerrar markets DESPUÉS de su fecha de finalización.`
        )
      }
      
      if (marketInfo.resolved) {
        throw new Error(`Market ${marketId} ya está resuelto`)
      }
      
      // Validaciones adicionales
      if (!Number.isInteger(marketId) || marketId < 0) {
        throw new Error(`Market ID inválido: ${marketId}`)
      }
      
      await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "resolveMarket",
        args: [BigInt(marketId), MarketOutcome.CANCELLED],
      })

      console.log("✅ CloseMarket enviado correctamente")
      return hash || null
    } catch (error) {
      console.error("❌ Error cerrando market:", error)
      const errorMessage = handleContractError(error)
      setTxError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [address, writeContract, isCorrectNet, isOwner, hash, getMarketInfo])

  // Función para resolver mercado existente mejorada
  const resolveMarket = useCallback(async (
    marketId: number,
    outcome: MarketOutcome
  ): Promise<string | null> => {
    if (!isCorrectNet || !address) {
      throw new Error("Conecta tu wallet a Arbitrum Sepolia")
    }

    if (!isOwner) {
      throw new Error("Solo el propietario del contrato puede resolver markets")
    }

    try {
      setTxError("")
      
      console.log("🔧 === DEBUGGING RESOLVE MARKET ===")
      console.log("Market ID:", marketId, "Type:", typeof marketId)
      console.log("Outcome:", outcome, "Type:", typeof outcome)
      console.log("Market ID BigInt:", BigInt(marketId).toString())
      console.log("Contract Address:", CONTRACTS.PREDICTION_MARKET)
      console.log("User Address:", address)
      console.log("Is Owner:", isOwner)
      console.log("Valid Outcomes:", Object.values(MarketOutcome))
      console.log("===================================")
      
      // Validaciones adicionales
      if (!Number.isInteger(marketId) || marketId < 0) {
        throw new Error(`Market ID inválido: ${marketId}`)
      }
      
      if (!Object.values(MarketOutcome).includes(outcome)) {
        throw new Error(`Outcome inválido: ${outcome}`)
      }
      
      // IMPORTANTE: Validar que el market haya expirado (igual que en closeMarket)
      const marketInfo = await getMarketInfo(marketId)
      if (!marketInfo) {
        throw new Error(`Market ${marketId} no encontrado`)
      }
      
      const now = Math.floor(Date.now() / 1000) // Tiempo actual en segundos
      const marketEndTime = Number(marketInfo.endTime)
      
      console.log("🕒 Validación de tiempo:")
      console.log("  - Tiempo actual:", now, "segundos")
      console.log("  - Market endTime:", marketEndTime, "segundos")
      console.log("  - Market expirado?", now >= marketEndTime)
      console.log("  - Diferencia:", (marketEndTime - now), "segundos")
      console.log("  - Outcome solicitado:", outcome)
      
      if (now < marketEndTime) {
        const horasRestantes = Math.ceil((marketEndTime - now) / 3600)
        const accionTexto = outcome === MarketOutcome.CANCELLED ? "cerrar/cancelar" : "resolver"
        throw new Error(
          `❌ LIMITACIÓN DEL CONTRATO: No se pueden ${accionTexto} markets antes de que terminen. ` +
          `Este market termina en ${horasRestantes} horas. ` +
          `Solo puedes ${accionTexto} markets DESPUÉS de su fecha de finalización.`
        )
      }
      
      if (marketInfo.resolved) {
        throw new Error(`Market ${marketId} ya está resuelto`)
      }
      
      await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "resolveMarket",
        args: [BigInt(marketId), outcome],
      })

      console.log("✅ ResolveMarket enviado correctamente")
      return hash || null
    } catch (error) {
      console.error("❌ Error resolviendo market:", error)
      const errorMessage = handleContractError(error)
      setTxError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [address, writeContract, isCorrectNet, isOwner, hash, getMarketInfo])

  // Función para resolver mercado en caso de emergencia (antes de que expire)
  const emergencyResolveMarket = useCallback(async (
    marketId: number,
    outcome: MarketOutcome
  ): Promise<string | null> => {
    if (!isCorrectNet || !address) {
      throw new Error("Conecta tu wallet a Arbitrum Sepolia")
    }

    if (!isOwner) {
      throw new Error("Solo el propietario del contrato puede resolver markets en emergencia")
    }

    try {
      setTxError("")
      
      console.log("🚨 === DEBUGGING EMERGENCY RESOLVE MARKET ===")
      console.log("Market ID:", marketId, "Type:", typeof marketId)
      console.log("Outcome:", outcome, "Type:", typeof outcome)
      console.log("Market ID BigInt:", BigInt(marketId).toString())
      console.log("Contract Address:", CONTRACTS.PREDICTION_MARKET)
      console.log("User Address:", address)
      console.log("Is Owner:", isOwner)
      console.log("Valid Outcomes:", Object.values(MarketOutcome))
      console.log("⚠️ EMERGENCY: No time validation will be performed")
      console.log("=============================================")
      
      // Validaciones básicas (sin tiempo)
      if (!Number.isInteger(marketId) || marketId < 0) {
        throw new Error(`Market ID inválido: ${marketId}`)
      }
      
      if (!Object.values(MarketOutcome).includes(outcome)) {
        throw new Error(`Outcome inválido: ${outcome}`)
      }
      
      // Verificar que el market existe y no está resuelto
      const marketInfo = await getMarketInfo(marketId)
      if (!marketInfo) {
        throw new Error(`Market ${marketId} no encontrado`)
      }
      
      if (marketInfo.resolved) {
        throw new Error(`Market ${marketId} ya está resuelto`)
      }
      
      const now = Math.floor(Date.now() / 1000)
      const marketEndTime = Number(marketInfo.endTime)
      const isActive = now < marketEndTime
      
      console.log("🕒 Información de tiempo (sin validación):")
      console.log("  - Tiempo actual:", now, "segundos")
      console.log("  - Market endTime:", marketEndTime, "segundos")
      console.log("  - Market activo?", isActive)
      console.log("  - Outcome solicitado:", outcome)
      
      if (isActive) {
        console.log("⚠️ ADVERTENCIA: Resolviendo market ACTIVO en modo emergencia")
      }
      
      await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "emergencyResolveMarket",
        args: [BigInt(marketId), outcome],
      })

      console.log("✅ EmergencyResolveMarket enviado correctamente")
      return hash || null
    } catch (error) {
      console.error("❌ Error en emergency resolve market:", error)
      const errorMessage = handleContractError(error)
      setTxError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [address, writeContract, isCorrectNet, isOwner, hash, getMarketInfo])

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

  // Función para debuggear problemas de transacciones
  const debugTransactionFailure = useCallback(async (
    marketId: number,
    isOptionA: boolean,
    amount: string
  ) => {
    console.log("🚨 === DEBUG TRANSACTION FAILURE ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("User Address:", address)
    console.log("Network:", chainId, "- Esperado:", 421614)
    console.log("Balance MXNB:", mxnbBalance ? formatMXNB(mxnbBalance) : "NO_BALANCE")
    console.log("Allowance:", allowance ? formatMXNB(allowance) : "NO_ALLOWANCE")
    console.log("Market Count:", marketCount?.toString())
    
    const amountWei = parseMXNB(amount)
    const minBetWei = BigInt(MIN_BET_AMOUNT)
    
    console.log("Amount Details:")
    console.log("  - Input:", amount, "MXNB")
    console.log("  - Wei:", amountWei.toString())
    console.log("  - Min required:", formatMXNB(minBetWei), "MXNB")
    console.log("  - Min wei:", minBetWei.toString())
    console.log("  - Meets minimum?", amountWei >= minBetWei)
    
    try {
      const marketInfo = await getMarketInfo(marketId)
      console.log("Market Info:", marketInfo)
    } catch (error) {
      console.log("❌ Failed to get market info:", error)
    }
    
    console.log("Contract Addresses:")
    console.log("  - MXNB Token:", CONTRACTS.MXNB_TOKEN)
    console.log("  - Prediction Market:", CONTRACTS.PREDICTION_MARKET)
    console.log("🚨 === END DEBUG ===")
  }, [address, chainId, mxnbBalance, allowance, marketCount, getMarketInfo])

  // Función para diagnosticar el problema del minimum bet amount
  const diagnoseContractBetIssue = useCallback(async (amount: string) => {
    const amountWei = parseMXNB(amount)
    const minBetWei = BigInt(MIN_BET_AMOUNT)
    const userBalance = mxnbBalance || BigInt(0)
    
    console.log("🚨 === DIAGNÓSTICO DEL PROBLEMA DEL CONTRATO ===")
    console.log("User Amount (input):", amount, "MXNB")
    console.log("User Amount (wei):", amountWei.toString())
    console.log("Contract Min Bet (wei):", minBetWei.toString())
    console.log("Contract Min Bet (MXNB):", formatMXNB(minBetWei))
    console.log("User Balance (wei):", userBalance.toString())
    console.log("User Balance (MXNB):", formatMXNB(userBalance))
    console.log("Ratio (min/amount):", (Number(minBetWei) / Number(amountWei)).toLocaleString())
    console.log("")
    console.log("❌ PROBLEMA: El contrato espera 1e18 wei como mínimo")
    console.log("❌ PERO: MXNB tiene 6 decimales, no 18")
    console.log("❌ RESULTADO: Se requieren 1,000,000,000,000 MXNB para apostar")
    console.log("❌ SOLUCIÓN: El contrato debe ser actualizado para usar 1e6 en lugar de 1e18")
    console.log("🚨 === FIN DIAGNÓSTICO ===")
    
    return {
      hasIssue: amountWei < minBetWei,
      userAmount: amount,
      userAmountWei: amountWei.toString(),
      contractMinWei: minBetWei.toString(),
      contractMinMXNB: formatMXNB(minBetWei),
      userBalance: formatMXNB(userBalance),
      explanation: "El contrato tiene un error: espera 1e18 wei como mínimo para tokens de 6 decimales"
    }
  }, [mxnbBalance])

  // Efecto para actualizar el hash cuando cambie
  useEffect(() => {
    if (hash) {
      setLastTxHash(hash)
    }
  }, [hash])

  // ========== RETORNO ==========

  // Función para filtrar markets activos (excluir cancelados y finalizados)
  const getActiveMarkets = useCallback(() => {
    return marketsData.filter(market => 
      !market.resolved && 
      Number(market.endTime) * 1000 > Date.now()
    )
  }, [marketsData])

  // Función para filtrar markets disponibles (activos + no cancelados)
  const getAvailableMarkets = useCallback(() => {
    return marketsData.filter(market => 
      market.outcome !== MarketOutcome.CANCELLED
    )
  }, [marketsData])

  // Events con filtro de markets cancelados
  const activeEvents = useMemo(() => {
    return getAvailableMarkets().map(market => {
      // Determinar el estado correcto según el tipo EventoApuesta
      let estado: "activo" | "finalizado" | "cancelado";
      
      if (market.outcome === MarketOutcome.CANCELLED) {
        estado = "cancelado";
      } else if (market.resolved) {
        estado = "finalizado";
      } else if (Number(market.endTime) * 1000 > Date.now()) {
        estado = "activo";
      } else {
        estado = "finalizado";
      }

      // Obtener la imagen del almacenamiento local (síncronamente para compatibilidad)
      const marketImage = MarketImageStorage.getImages().find(
        img => img.marketId === market.id && img.contractAddress.toLowerCase() === CONTRACTS.PREDICTION_MARKET.toLowerCase()
      )?.imageUrl

      // Obtener la descripción del almacenamiento local
      const marketDescription = MarketDescriptionStorage.getDescription(market.id, CONTRACTS.PREDICTION_MARKET)

      // Obtener la categoría del almacenamiento local
      const marketCategory = MarketCategoryStorage.getCategory(market.id, CONTRACTS.PREDICTION_MARKET) || "general"

      return {
        id: market.id.toString(),
        nombre: market.question,
        descripcion: marketDescription || market.question, // Usar descripción real o fallback a la pregunta
        pregunta: market.question,
        categoria: marketCategory,
        fechaFin: new Date(Number(market.endTime) * 1000).toISOString(),
        estado,
        imagen: marketImage || undefined, // Convertir null a undefined
        opciones: [
          {
            id: "si" as const,
            nombre: "Sí" as const,
            cuota: market.totalOptionBShares > 0 ? 
              Number(formatMXNB(market.totalOptionAShares + market.totalOptionBShares)) / Number(formatMXNB(market.totalOptionAShares)) : 
              2.0,
            probabilidad: market.totalOptionAShares + market.totalOptionBShares > 0 ?
              (Number(formatMXNB(market.totalOptionAShares)) / Number(formatMXNB(market.totalOptionAShares + market.totalOptionBShares))) * 100 :
              50
          },
          {
            id: "no" as const,
            nombre: "No" as const,
            cuota: market.totalOptionAShares > 0 ? 
              Number(formatMXNB(market.totalOptionAShares + market.totalOptionBShares)) / Number(formatMXNB(market.totalOptionBShares)) : 
              2.0,
            probabilidad: market.totalOptionAShares + market.totalOptionBShares > 0 ?
              (Number(formatMXNB(market.totalOptionBShares)) / Number(formatMXNB(market.totalOptionAShares + market.totalOptionBShares))) * 100 :
              50
          }
        ] as [OpcionApuesta, OpcionApuesta]
      };
    })
  }, [marketsData, getAvailableMarkets])

  // Función mejorada para obtener market count con verificación previa
  const getMarketCountSafe = useCallback(async (): Promise<bigint> => {
    if (!isCorrectNet) {
      console.log("⚠️ Red incorrecta para obtener market count")
      return BigInt(0)
    }
    
    // Verificar conectividad primero
    const isConnected = await verifyRPCConnectivity()
    if (!isConnected) {
      console.log("❌ RPC no disponible, no se puede obtener market count")
      return BigInt(0)
    }
    
    try {
      console.log("🔢 Obteniendo market count...")
      const count = await publicClient.readContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "marketCount"
      }) as bigint
      
      console.log("✅ Market count obtenido:", count.toString())
      return count
    } catch (error: any) {
      console.error("❌ Error obteniendo market count:", error)
      return BigInt(0)
    }
  }, [isCorrectNet, verifyRPCConnectivity])

  return {
    // Estado de conexión
    isConnected,
    address,
    chainId,
    isCorrectNetwork: isCorrectNet,

    // Estado del owner
    isOwner,
    contractOwner: ownerData as string,
    isLoadingOwner,

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
    markets: marketsData,
    loadingMarkets,
    activeMarkets: getActiveMarkets(),
    availableMarkets: getAvailableMarkets(),
    events: activeEvents,

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
    emergencyResolveMarket, // Nueva función para resolver markets en caso de emergencia
    closeMarket,  // Nueva función para cerrar markets

    // Funciones de filtrado
    getActiveMarkets,
    getAvailableMarkets,

    // Funciones auxiliares
    buySharesWithAllowance,
    canUserBuyShares, // Nueva función de diagnóstico
    debugTransactionFailure, // Nueva función de debug
    diagnoseContractBetIssue, // Nueva función de diagnóstico
    verifyRPCConnectivity, // Nueva función de verificación de conectividad
    getMarketCountSafe, // Nueva función para obtener market count de forma segura
    MarketOutcome,
  }
} 