// Constantes de contratos y configuración que pueden usarse en servidor y cliente
import { arbitrumSepolia } from 'viem/chains'
import { PREDICTION_MARKET_SIMPLE_ABI } from './prediction-market-abi'

// ==================== DIRECCIONES DE CONTRATOS ====================
export const CONTRACTS = {
  PREDICTION_MARKET: "0x9Dc4ef29d511A2C37E6F001af9c9868DbCA923F7" as `0x${string}`,
  MXNB_TOKEN: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" as `0x${string}`,
}

// ==================== INFORMACIÓN DE RED ====================
export const NETWORK_INFO = {
  name: "Arbitrum Sepolia",
  chainId: 421614,
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  blockExplorer: "https://sepolia.arbiscan.io",
}

// ==================== ABIs ====================
export const MXNB_TOKEN_ABI = [
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "symbol", 
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function", 
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view", 
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function", 
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const

export const PREDICTION_MARKET_ABI = PREDICTION_MARKET_SIMPLE_ABI

// ==================== ENUM MARKET OUTCOME ====================
export enum MarketOutcome {
  UNRESOLVED = 0,
  OPTION_A = 1,
  OPTION_B = 2,
  CANCELLED = 3,
}

// ==================== CONSTANTES ====================
export const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
export const MIN_BET_AMOUNT = "1000000000000000000" // 1 MXNB en wei
export const MIN_MARKET_DURATION = 3600 // 1 hora en segundos
export const MAX_MARKET_DURATION = 2592000 // 30 días en segundos

// ==================== HELPERS DE FORMATO ====================
export const formatMXNB = (value: bigint | string | number): string => {
  try {
    const num = typeof value === 'bigint' ? value : BigInt(value.toString())
    const formatted = (Number(num) / 1e6).toFixed(4)
    return parseFloat(formatted).toString()
  } catch {
    return "0"
  }
}

export const parseMXNB = (value: string): bigint => {
  try {
    const valueInEther = parseFloat(value)
    const valueInWei = BigInt(Math.floor(valueInEther * 1e6))
    return valueInWei
  } catch {
    return BigInt(0)
  }
}

export const formatEndTime = (timestamp: number): string => {
  try {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return "Fecha inválida"
  }
}

// ==================== HELPERS DE RED ====================
export const isCorrectNetwork = (chainId: number): boolean => {
  return chainId === NETWORK_INFO.chainId
}

export const getNetworkSwitchMessage = (): string => {
  return `Cambia a ${NETWORK_INFO.name} (Chain ID: ${NETWORK_INFO.chainId})`
}

// ==================== HELPERS DE EXPLORER ====================
export const getExplorerLink = (hashOrAddress: string, type: 'tx' | 'address' = 'tx'): string => {
  const baseUrl = NETWORK_INFO.blockExplorer
  return `${baseUrl}/${type}/${hashOrAddress}`
}

// ==================== MANEJO DE ERRORES ====================
export const handleContractError = (error: any): string => {
  if (error?.cause?.reason) {
    return error.cause.reason
  }
  
  if (error?.reason) {
    return error.reason
  }

  // Mapeo de errores personalizados del contrato
  const errorMap: Record<string, string> = {
    'InsufficientBalance': 'Saldo insuficiente de MXNB',
    'InsufficientAllowance': 'Debes aprobar más tokens MXNB',
    'MarketTradingEnded': 'El tiempo de apuestas ha terminado',
    'MarketAlreadyResolved': 'Este mercado ya está resuelto',
    'MinimumBetRequired': 'Apuesta mínima es 1 MXNB',
    'MarketNotResolved': 'El mercado aún no está resuelto',
    'AlreadyClaimed': 'Ya reclamaste tus ganancias',
    'NoWinningsToClaim': 'No tienes ganancias para reclamar',
    'TokenTransferFailed': 'Error en la transferencia de tokens',
    'InvalidDuration': 'Duración inválida (1 hora - 30 días)',
    'MarketNotEnded': 'El mercado aún no ha terminado',
    'InvalidOutcome': 'Resultado inválido',
    'InvalidTokenAddress': 'Dirección de token inválida',
    // Errores específicos de red
    'user rejected transaction': 'Usuario rechazó la transacción',
    'insufficient funds': 'Fondos insuficientes para gas',
    'nonce too low': 'Nonce demasiado bajo',
    'replacement transaction underpriced': 'Transacción de reemplazo con precio bajo',
    'already known': 'Transacción ya conocida',
  }

  for (const [errorName, message] of Object.entries(errorMap)) {
    if (error?.message?.includes(errorName) || error?.toString()?.includes(errorName)) {
      return message
    }
  }

  return error?.message || 'Error desconocido en la transacción'
}

// ==================== CONSTANTES DE UI ====================
export const UI_CONSTANTS = {
  MIN_BET_AMOUNT: "1000000000000000000", // 1 MXNB en wei
  INFINITE_ALLOWANCE: "1000000000000000000000000000", // 1B tokens
  LOADING_DEBOUNCE: 500,
  REFRESH_INTERVAL: 30000,
}

// ==================== TIPOS TYPESCRIPT ====================
export interface MarketInfo {
  id: number
  question: string
  optionA: string
  optionB: string
  endTime: number
  outcome: MarketOutcome
  totalOptionAShares: bigint
  totalOptionBShares: bigint
  resolved: boolean
}

export interface UserShares {
  optionAShares: bigint
  optionBShares: bigint
}

export interface UserInfo {
  balance: bigint
  allowance: bigint
  needsApproval: boolean
}

export interface UserInfoAdvanced extends UserInfo {
  hasInfinite: boolean
  needsApprovalForAmount: boolean
} 