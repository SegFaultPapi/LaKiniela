import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { arbitrum, arbitrumSepolia } from "wagmi/chains"
import { http } from "viem"

// Configuración de RainbowKit y wagmi
export const config = getDefaultConfig({
  appName: "La Kiniela",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "your-project-id",
  chains: [arbitrum, arbitrumSepolia],
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
  ssr: true,
})

// Direcciones de contratos (reemplazar con direcciones reales)
export const CONTRACTS = {
  PREDICTION_MARKET: "0x1234567890123456789012345678901234567890" as `0x${string}`,
  MXNB_TOKEN: "0x0987654321098765432109876543210987654321" as `0x${string}`,
} as const

// ABI del contrato de predicciones (simplificado)
export const PREDICTION_MARKET_ABI = [
  {
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "optionId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "betId", type: "uint256" }],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserBets",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "eventId", type: "uint256" },
          { name: "optionId", type: "uint256" },
          { name: "amount", type: "uint256" },
          { name: "odds", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "timestamp", type: "uint256" },
        ],
        name: "bets",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getActiveEvents",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "endTime", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
        name: "events",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

// ABI del token MXNB (ERC20 estándar)
export const MXNB_TOKEN_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

// Utilidades para formatear
export const formatMXNB = (amount: bigint): string => {
  return (Number(amount) / 1e18).toFixed(2)
}

export const parseMXNB = (amount: string): bigint => {
  return BigInt(Math.floor(Number.parseFloat(amount) * 1e18))
}
