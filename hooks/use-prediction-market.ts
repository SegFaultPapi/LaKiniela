"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { useState, useEffect } from "react"
import { CONTRACTS, PREDICTION_MARKET_ABI, MXNB_TOKEN_ABI, formatMXNB, parseMXNB } from "@/lib/web3-config"
import type { EventoApuesta, ApuestaUsuario } from "@/lib/types"

export function usePredictionMarket() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract()
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>()

  // Esperar confirmación de transacción
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  })

  // Leer balance de MXNB
  const { data: mxnbBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Leer eventos activos
  const { data: activeEventsData, refetch: refetchEvents } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getActiveEvents",
    query: {
      enabled: isConnected,
    },
  })

  // Leer apuestas del usuario
  const { data: userBetsData, refetch: refetchUserBets } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getUserBets",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Leer allowance para el contrato de predicciones
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.PREDICTION_MARKET] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Función para aprobar tokens MXNB
  const approveMXNB = async (amount: string) => {
    if (!address) throw new Error("Wallet no conectado")

    const amountBigInt = parseMXNB(amount)

    try {
      const txHash = await writeContract({
        address: CONTRACTS.MXNB_TOKEN,
        abi: MXNB_TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACTS.PREDICTION_MARKET, amountBigInt],
      })

      setLastTxHash(txHash)
      return txHash
    } catch (error) {
      console.error("Error al aprobar MXNB:", error)
      throw error
    }
  }

  // Función para realizar apuesta
  const placeBet = async (eventId: string, optionId: string, amount: string) => {
    if (!address) throw new Error("Wallet no conectado")

    const amountBigInt = parseMXNB(amount)
    const eventIdBigInt = BigInt(eventId)
    const optionIdBigInt = BigInt(optionId)

    // Verificar si necesitamos aprobar tokens
    const currentAllowance = allowance || 0n
    if (currentAllowance < amountBigInt) {
      await approveMXNB(amount)
      // Esperar a que se confirme la aprobación antes de continuar
      return
    }

    try {
      const txHash = await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "placeBet",
        args: [eventIdBigInt, optionIdBigInt, amountBigInt],
      })

      setLastTxHash(txHash)
      return txHash
    } catch (error) {
      console.error("Error al realizar apuesta:", error)
      throw error
    }
  }

  // Función para reclamar recompensas
  const claimReward = async (betId: string) => {
    if (!address) throw new Error("Wallet no conectado")

    const betIdBigInt = BigInt(betId)

    try {
      const txHash = await writeContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: "claimReward",
        args: [betIdBigInt],
      })

      setLastTxHash(txHash)
      return txHash
    } catch (error) {
      console.error("Error al reclamar recompensa:", error)
      throw error
    }
  }

  // Refrescar datos después de transacciones exitosas
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance()
      refetchUserBets()
      refetchEvents()
      refetchAllowance()
    }
  }, [isConfirmed, refetchBalance, refetchUserBets, refetchEvents, refetchAllowance])

  // Formatear datos para la UI
  const formattedBalance = mxnbBalance ? formatMXNB(mxnbBalance) : "0.00"

  const formattedEvents: EventoApuesta[] = activeEventsData
    ? activeEventsData.map((event: any, index: number) => ({
        id: event.id.toString(),
        nombre: event.name || `Evento ${index + 1}`,
        descripcion: event.description || "Descripción del evento",
        categoria: "general",
        estado: event.isActive ? "activo" : "finalizado",
        fechaFin: new Date(Number(event.endTime) * 1000).toISOString().split("T")[0],
        opciones: [
          { id: "1", nombre: "Opción A", cuota: 2.5, probabilidad: 40 },
          { id: "2", nombre: "Opción B", cuota: 1.8, probabilidad: 60 },
        ],
      }))
    : []

  const formattedUserBets: ApuestaUsuario[] = userBetsData
    ? userBetsData.map((bet: any) => ({
        id: bet.id.toString(),
        eventoId: bet.eventId.toString(),
        eventoNombre: `Evento ${bet.eventId}`,
        opcionId: bet.optionId.toString(),
        opcionNombre: `Opción ${bet.optionId}`,
        cantidad: Number(formatMXNB(bet.amount)),
        cuota: Number(bet.odds) / 100,
        estado: bet.status === 0 ? "pendiente" : bet.status === 1 ? "ganada" : "perdida",
        fechaApuesta: new Date(Number(bet.timestamp) * 1000).toISOString().split("T")[0],
        gananciasPotenciales: Number(formatMXNB(bet.amount)) * (Number(bet.odds) / 100),
      }))
    : []

  return {
    // Estados
    isConnected,
    address,
    balance: formattedBalance,
    events: formattedEvents,
    userBets: formattedUserBets,
    allowance: allowance ? formatMXNB(allowance) : "0",

    // Estados de transacciones
    isWritePending,
    isConfirming,
    isConfirmed,
    lastTxHash,

    // Funciones
    placeBet,
    claimReward,
    approveMXNB,

    // Funciones de refetch
    refetchBalance,
    refetchEvents,
    refetchUserBets,
  }
}
