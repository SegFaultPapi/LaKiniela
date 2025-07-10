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
    [arbitrumSepolia.id]: http("https://sepolia-rollup.arbitrum.io/rpc"),
  },
  ssr: true,
})

// Direcciones de contratos
export const CONTRACTS = {
  PREDICTION_MARKET: "0x1234567890123456789012345678901234567890" as `0x${string}`, // Placeholder - reemplazar con dirección real
  MXNB_TOKEN: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" as `0x${string}`, // Contrato MXNB en Arbitrum Sepolia
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
    constant: true,
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
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

// Utilidades para formatear MXNB (usando 6 decimales como especificado en el contrato)
export const formatMXNB = (amount: bigint): string => {
  console.log("🔧 formatMXNB input:", amount.toString())
  const result = (Number(amount) / 1e6).toFixed(2) // Cambiar de 1e18 a 1e6
  console.log("🔧 formatMXNB output:", result)
  return result
}

export const parseMXNB = (amount: string): bigint => {
  console.log("🔧 parseMXNB input:", amount)
  const result = BigInt(Math.floor(Number.parseFloat(amount) * 1e6)) // Cambiar de 1e18 a 1e6
  console.log("🔧 parseMXNB output:", result.toString())
  return result
}

// Función para obtener la URL del explorador de Arbitrum Sepolia
export const getArbitrumSepoliaExplorerUrl = (hash: string) => {
  return `https://sepolia.arbiscan.io/tx/${hash}`
}

export const getArbitrumSepoliaAddressUrl = (address: string) => {
  return `https://sepolia.arbiscan.io/address/${address}`
}

// Función para obtener la URL del explorador según la red
export const getExplorerUrl = (hash: string, chainId?: number) => {
  if (chainId === arbitrumSepolia.id) {
    return `https://sepolia.arbiscan.io/tx/${hash}`
  }
  return `https://arbiscan.io/tx/${hash}` // Arbitrum mainnet por defecto
}

export const getAddressExplorerUrl = (address: string, chainId?: number) => {
  if (chainId === arbitrumSepolia.id) {
    return `https://sepolia.arbiscan.io/address/${address}`
  }
  return `https://arbiscan.io/address/${address}` // Arbitrum mainnet por defecto
}
