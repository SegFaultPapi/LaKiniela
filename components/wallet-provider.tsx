"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"
import { config } from "@/lib/web3-config"
import { type ReactNode } from "react"

const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme({
              accentColor: "#df3925", // Color rojo de La Kiniela
              accentColorForeground: "white",
              borderRadius: "medium",
              fontStack: "system",
              overlayBlur: "small",
            }),
            darkMode: darkTheme({
              accentColor: "#df3925", // Color rojo de La Kiniela
              accentColorForeground: "white",
              borderRadius: "medium",
              fontStack: "system",
              overlayBlur: "small",
            }),
          }}
          locale="es"
          modalSize="compact" // Cambiar a 'wide' para mejor visualización del QR
          initialChain={421614} // Arbitrum Sepolia como red inicial
          showRecentTransactions={true}
          coolMode={true}
          appInfo={{
            appName: "La Kiniela",
            learnMoreUrl: "https://la-kiniela.com",
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
