"use client"

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia } from 'wagmi/chains'

// Re-exportar todas las constantes que pueden usarse en servidor y cliente
export * from './contracts-config'

// ==================== CONFIGURACIÓN DE RAINBOWKIT (SOLO CLIENTE) ====================
// Esta configuración solo puede ejecutarse en el cliente
export const config = getDefaultConfig({
  appName: "La Kiniela - Arbitrum Sepolia",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "a72914e54bf5416051c0e91728138d63",
  chains: [arbitrumSepolia], // Solo Arbitrum Sepolia
  ssr: true,
})
