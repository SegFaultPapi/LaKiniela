"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"
import { config } from "@/lib/web3-config"
import { createContext, useContext, type ReactNode } from "react"
import { usePredictionMarket } from "@/hooks/use-prediction-market"

const queryClient = new QueryClient()

interface WalletContextType {
  // Estados de conexión
  isConnected: boolean
  address: string | undefined
  balance: string
  chainId: number

  // Datos
  events: any[]
  userBets: any[]
  allowance: string

  // Información del token
  tokenInfo: {
    name: string | undefined
    symbol: string | undefined
    decimals: number | undefined
    address: `0x${string}`
  }

  // Estados de transacciones
  isWritePending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  lastTxHash: `0x${string}` | undefined

  // Funciones
  placeBet: (eventId: string, optionId: string, amount: string) => Promise<number | undefined>
  claimReward: (betId: string) => Promise<`0x${string}` | undefined>
  approveMXNB: (amount: string) => Promise<`0x${string}` | undefined>
  createMarket: (marketData: any) => any
  participateInMarket: (marketId: string, opcionId: "si" | "no", mxnbAmount: string) => Promise<number | undefined>

  // Funciones de refetch
  refetchBalance: () => void
  refetchEvents: () => void
  refetchUserBets: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

function WalletContextProvider({ children }: { children: ReactNode }) {
  const predictionMarket = usePredictionMarket()

  return <WalletContext.Provider value={predictionMarket}>{children}</WalletContext.Provider>
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme({
              accentColor: "#3B82F6",
              accentColorForeground: "white",
              borderRadius: "medium",
            }),
            darkMode: darkTheme({
              accentColor: "#3B82F6",
              accentColorForeground: "white",
              borderRadius: "medium",
            }),
          }}
          locale="es"
        >
          <WalletContextProvider>{children}</WalletContextProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet debe usarse dentro de WalletProvider")
  }
  return context
}
