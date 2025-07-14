"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi"
import { useState, useEffect } from "react"
import { CONTRACTS, PREDICTION_MARKET_ABI, MXNB_TOKEN_ABI, formatMXNB, parseMXNB } from "@/lib/web3-config"
import { MarketStorage, type MarketData, type UserParticipation } from "@/lib/market-storage"
import type { EventoApuesta, ApuestaUsuario } from "@/lib/types"

export function usePredictionMarket() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>()

  // Estados locales para markets
  const [localMarkets, setLocalMarkets] = useState<MarketData[]>([])
  const [localParticipations, setLocalParticipations] = useState<UserParticipation[]>([])
  const [localBalance, setLocalBalance] = useState<string>("0.00")

  // Esperar confirmación de transacción
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  })

  // Leer balance de MXNB
  const { data: mxnbBalance, refetch: refetchBalance, error: balanceError, isLoading: balanceLoading } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refrescar cada 10 segundos
    },
  })

  // Leer información del token MXNB
  const { data: tokenName, error: tokenNameError } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "name",
  })

  const { data: tokenSymbol, error: tokenSymbolError } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "symbol",
  })

  const { data: tokenDecimals, error: tokenDecimalsError } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "decimals",
  })

  // Leer allowance para el contrato de predicciones
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.PREDICTION_MARKET] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refrescar cada 10 segundos
    },
  })

  // Cargar markets locales
  const loadLocalMarkets = () => {
    const markets = MarketStorage.getMarkets()
    setLocalMarkets(markets)
  }

  // Cargar participaciones locales
  const loadLocalParticipations = () => {
    const participations = MarketStorage.getParticipations(address)
    setLocalParticipations(participations)
  }

  // Función para crear market
  const createMarket = (marketData: {
    nombre: string
    descripcion: string
    pregunta: string
    categoria: string
    fechaFin: string
    poolInicial: number
    imagen?: string
  }) => {
    if (!address) throw new Error("Wallet no conectado")

    const nuevoMarket = MarketStorage.createMarket({
      ...marketData,
      creador: address,
      estado: "activo"
    })

    loadLocalMarkets()
    return nuevoMarket
  }

  // Función para participar en market
  const participateInMarket = async (marketId: string, opcionId: "si" | "no", mxnbAmount: string) => {
    if (!address) throw new Error("Wallet no conectado")

    const amount = Number.parseFloat(mxnbAmount)
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Cantidad inválida")
    }

    // Verificar balance usando el balance local
    const currentBalance = Number.parseFloat(localBalance)
    console.log("💰 Verificando balance para participación:")
    console.log("  - Balance local:", currentBalance, "MXNB")
    console.log("  - Cantidad solicitada:", amount, "MXNB")
    
    if (currentBalance < amount) {
      throw new Error(`Balance insuficiente. Tienes ${currentBalance} MXNB, necesitas ${amount} MXNB`)
    }

    // Participar en el market local
    const result = MarketStorage.participateInMarket(address, marketId, opcionId, amount)

    if (!result.success) {
      throw new Error(result.error || "Error al participar en el market")
    }

    // Recargar datos
    loadLocalMarkets()
    loadLocalParticipations()

    return result.sharesCompradas
  }

  // Función para aprobar tokens MXNB (mantener para futuras integraciones)
  const approveMXNB = async (amount: string): Promise<`0x${string}` | undefined> => {
    if (!address) throw new Error("Wallet no conectado")

    const amountBigInt = parseMXNB(amount)

    try {
      await writeContract({
        address: CONTRACTS.MXNB_TOKEN,
        abi: MXNB_TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACTS.PREDICTION_MARKET, amountBigInt],
      })

      // El hash se obtiene del hook useWriteContract
      if (hash) {
        setLastTxHash(hash)
        return hash
      }
      return undefined
    } catch (error) {
      console.error("Error al aprobar MXNB:", error)
      throw error
    }
  }

  // Función para realizar apuesta (mantener compatibilidad)
  const placeBet = async (eventId: string, optionId: string, amount: string) => {
    return participateInMarket(eventId, optionId as "si" | "no", amount)
  }

  // Función para reclamar recompensas
  const claimReward = async (betId: string): Promise<`0x${string}` | undefined> => {
    if (!address) throw new Error("Wallet no conectado")

    const betIdBigInt = BigInt(betId)

    try {
      await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "claimReward",
        args: [betIdBigInt],
      })

      // El hash se obtiene del hook useWriteContract
      if (hash) {
        setLastTxHash(hash)
        return hash
      }
      return undefined
    } catch (error) {
      console.error("Error al reclamar recompensa:", error)
      throw error
    }
  }

  // Refrescar datos después de transacciones exitosas
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance()
      refetchAllowance()
      loadLocalMarkets()
      loadLocalParticipations()
    }
  }, [isConfirmed, refetchBalance, refetchAllowance])

  // Cargar datos locales al conectar wallet
  useEffect(() => {
    if (isConnected && address) {
      loadLocalMarkets()
      loadLocalParticipations()
    }
  }, [isConnected, address])

  // Formatear datos para la UI
  const formattedBalance = mxnbBalance ? formatMXNB(mxnbBalance) : "0.00"

  // Forzar actualización del balance cuando cambie
  useEffect(() => {
    if (mxnbBalance !== undefined) {
      const newBalance = formatMXNB(mxnbBalance)
      setLocalBalance(newBalance)
      console.log("🔄 Balance actualizado en hook:", newBalance)
    }
  }, [mxnbBalance])

  // Función para forzar actualización del balance
  const forceRefreshBalance = async () => {
    console.log("🔄 Forzando actualización del balance...")
    try {
      await refetchBalance()
      // También hacer una llamada directa para verificar
      if (address) {
        const response = await fetch("https://sepolia-rollup.arbitrum.io/rpc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{
              to: CONTRACTS.MXNB_TOKEN,
              data: "0x70a08231000000000000000000000000" + address.slice(2),
            }, "latest"],
            id: 1,
          }),
        })
        
        const result = await response.json()
        if (result.result) {
          const balanceWei = BigInt(result.result)
          const balanceEth = Number(balanceWei) / 1e6 // Cambiar de 1e18 a 1e6
          setLocalBalance(balanceEth.toFixed(2))
          console.log("✅ Balance actualizado directamente:", balanceEth.toFixed(2))
        }
      }
    } catch (error) {
      console.error("❌ Error al forzar actualización:", error)
    }
  }

  // Convertir markets locales a formato EventoApuesta
  const formattedEvents: EventoApuesta[] = localMarkets.map(market => ({
    id: market.id,
    nombre: market.nombre,
    descripcion: market.descripcion,
    pregunta: market.pregunta,
    categoria: market.categoria,
    imagen: market.imagen,
    estado: market.estado,
    fechaFin: market.fechaFin,
    opciones: market.opciones
  }))

  // Convertir participaciones locales a formato ApuestaUsuario
  const formattedUserBets: ApuestaUsuario[] = localParticipations.map(participation => {
    const market = localMarkets.find(m => m.id === participation.marketId)
    const gananciasPotenciales = MarketStorage.calcularGananciasPotenciales(address || "", participation.marketId)

    return {
      id: `${participation.marketId}-${participation.opcionId}`,
      eventoId: participation.marketId,
      eventoNombre: market?.nombre || "Market desconocido",
      opcionId: participation.opcionId,
      opcionNombre: participation.opcionId === "si" ? "Sí" : "No",
      cantidad: participation.mxnbInvertido,
      cuota: participation.precioCompra,
      estado: market?.estado === "finalizado" ? "pendiente" : "pendiente", // Simplificado por ahora
      fechaApuesta: participation.fechaParticipacion.split("T")[0],
      gananciasPotenciales
    }
  })

  // Log para debugging
  useEffect(() => {
    if (isConnected && address) {
      console.log("=== DEBUG INFO ===")
      console.log("Wallet conectado:", address)
      console.log("Chain ID:", chainId)
      console.log("Contrato MXNB:", CONTRACTS.MXNB_TOKEN)
      console.log("Balance MXNB (raw):", mxnbBalance)
      console.log("Balance MXNB (formatted):", formattedBalance)
      console.log("Balance loading:", balanceLoading)
      console.log("Balance error:", balanceError)
      console.log("Token name:", tokenName)
      console.log("Token symbol:", tokenSymbol)
      console.log("Token decimals:", tokenDecimals)
      console.log("Token name error:", tokenNameError)
      console.log("Token symbol error:", tokenSymbolError)
      console.log("Token decimals error:", tokenDecimalsError)
      console.log("Markets locales:", localMarkets.length)
      console.log("Participaciones locales:", localParticipations.length)
      console.log("==================")
    }
  }, [isConnected, address, chainId, formattedBalance, tokenName, tokenSymbol, tokenDecimals, localMarkets.length, localParticipations.length, mxnbBalance, balanceLoading, balanceError, tokenNameError, tokenSymbolError, tokenDecimalsError])

  return {
    // Estados
    isConnected,
    address,
    balance: localBalance, // Usar balance local
    balanceLoading,
    balanceError,
    events: formattedEvents,
    userBets: formattedUserBets,
    allowance: allowance ? formatMXNB(allowance) : "0",
    chainId,

    // Información del token
    tokenInfo: {
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      address: CONTRACTS.MXNB_TOKEN,
    },

    // Estados de transacciones
    isWritePending,
    isConfirming,
    isConfirmed,
    lastTxHash,

    // Funciones
    placeBet,
    claimReward,
    approveMXNB,
    createMarket,
    participateInMarket,

    // Funciones de refetch
    refetchBalance,
    refetchEvents: loadLocalMarkets,
    refetchUserBets: loadLocalParticipations,
    forceRefreshBalance,
  }
}
