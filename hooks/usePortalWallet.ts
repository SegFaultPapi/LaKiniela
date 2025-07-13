"use client"

import { useState, useEffect, useCallback } from 'react'
import { formatEther, parseEther } from 'viem'

// Tipos para el Portal SDK
export interface PortalWalletConfig {
  apiKey: string
  chainId: number
  isTestnet: boolean
}

export interface WalletBalance {
  address: string
  balance: string
  formatted: string
  symbol: string
  decimals: number
}

export interface TransactionRequest {
  to: string
  value: string
  data?: string
  gasLimit?: string
  gasPrice?: string
}

export interface TransactionResult {
  hash: string
  status: 'pending' | 'success' | 'failed'
  blockNumber?: number
  gasUsed?: string
}

// Simulamos la clase Portal SDK
class PortalSDK {
  private config: PortalWalletConfig
  private walletAddress: string | null = null
  private isInitialized = false

  constructor(config: PortalWalletConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    // Simular inicialización del Portal SDK
    await new Promise(resolve => setTimeout(resolve, 1000))
    this.isInitialized = true
  }

  async createWallet(): Promise<string> {
    if (!this.isInitialized) throw new Error('Portal SDK not initialized')
    
    // Simular creación de wallet
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generar una dirección simulada
    const randomHex = () => Math.floor(Math.random() * 16).toString(16)
    const address = '0x' + Array.from({length: 40}, () => randomHex()).join('')
    
    this.walletAddress = address
    return address
  }

  async getBalance(address: string): Promise<WalletBalance> {
    if (!this.isInitialized) throw new Error('Portal SDK not initialized')
    
    // Simular obtención de balance
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const balance = (Math.random() * 10).toFixed(6)
    return {
      address,
      balance: parseEther(balance).toString(),
      formatted: balance,
      symbol: 'ETH',
      decimals: 18
    }
  }

  async sendTransaction(tx: TransactionRequest): Promise<TransactionResult> {
    if (!this.isInitialized) throw new Error('Portal SDK not initialized')
    if (!this.walletAddress) throw new Error('No wallet connected')
    
    // Simular envío de transacción
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const hash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
    
    return {
      hash,
      status: 'success',
      blockNumber: Math.floor(Math.random() * 1000000),
      gasUsed: '21000'
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.isInitialized) throw new Error('Portal SDK not initialized')
    if (!this.walletAddress) throw new Error('No wallet connected')
    
    // Simular firma de mensaje
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return '0x' + Array.from({length: 130}, () => Math.floor(Math.random() * 16).toString(16)).join('')
  }

  getWalletAddress(): string | null {
    return this.walletAddress
  }

  isWalletConnected(): boolean {
    return !!this.walletAddress
  }

  disconnect(): void {
    this.walletAddress = null
  }
}

export function usePortalWallet() {
  const [portalSDK, setPortalSDK] = useState<PortalSDK | null>(null)
  const [apiKey, setApiKey] = useState<string>('')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Configuración para Arbitrum Sepolia
  const config: PortalWalletConfig = {
    apiKey: apiKey,
    chainId: 421614, // Arbitrum Sepolia
    isTestnet: true
  }

  // Inicializar Portal SDK
  const initializePortal = useCallback(async (key: string) => {
    if (!key) {
      setError('Se requiere una API Key para usar Portal SDK')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const sdk = new PortalSDK({ ...config, apiKey: key })
      await sdk.initialize()
      
      setPortalSDK(sdk)
      setApiKey(key)
      setIsInitialized(true)
      
      // Guardar API Key en localStorage para persistencia
      localStorage.setItem('portal_api_key', key)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al inicializar Portal SDK')
    } finally {
      setIsLoading(false)
    }
  }, [config])

  // Crear wallet
  const createWallet = useCallback(async () => {
    if (!portalSDK) {
      setError('Portal SDK no está inicializado')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const address = await portalSDK.createWallet()
      setWalletAddress(address)
      setIsConnected(true)
      
      // Obtener balance inicial
      const walletBalance = await portalSDK.getBalance(address)
      setBalance(walletBalance)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear wallet')
    } finally {
      setIsLoading(false)
    }
  }, [portalSDK])

  // Obtener balance
  const refreshBalance = useCallback(async () => {
    if (!portalSDK || !walletAddress) return

    try {
      const walletBalance = await portalSDK.getBalance(walletAddress)
      setBalance(walletBalance)
    } catch (err) {
      console.error('Error al obtener balance:', err)
    }
  }, [portalSDK, walletAddress])

  // Enviar transacción
  const sendTransaction = useCallback(async (tx: TransactionRequest): Promise<TransactionResult | null> => {
    if (!portalSDK || !walletAddress) {
      setError('Wallet no conectado')
      return null
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const result = await portalSDK.sendTransaction(tx)
      
      // Actualizar balance después de la transacción
      await refreshBalance()
      
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar transacción')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [portalSDK, walletAddress, refreshBalance])

  // Firmar mensaje
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!portalSDK || !walletAddress) {
      setError('Wallet no conectado')
      return null
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const signature = await portalSDK.signMessage(message)
      return signature
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al firmar mensaje')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [portalSDK, walletAddress])

  // Desconectar wallet
  const disconnect = useCallback(() => {
    if (portalSDK) {
      portalSDK.disconnect()
    }
    setWalletAddress(null)
    setBalance(null)
    setIsConnected(false)
  }, [portalSDK])

  // Verificar API Key persistida al cargar
  useEffect(() => {
    const savedApiKey = localStorage.getItem('portal_api_key')
    if (savedApiKey) {
      initializePortal(savedApiKey)
    }
  }, [initializePortal])

  // Auto-refresh balance cada 30 segundos
  useEffect(() => {
    if (!isConnected || !walletAddress) return

    const interval = setInterval(refreshBalance, 30000)
    return () => clearInterval(interval)
  }, [isConnected, walletAddress, refreshBalance])

  return {
    // Estado
    apiKey,
    walletAddress,
    balance,
    isConnected,
    isLoading,
    error,
    isInitialized,
    
    // Métodos
    initializePortal,
    createWallet,
    refreshBalance,
    sendTransaction,
    signMessage,
    disconnect,
    
    // Helpers
    formatBalance: (balance: WalletBalance) => `${balance.formatted} ${balance.symbol}`,
    getExplorerUrl: (hash: string) => `https://sepolia.arbiscan.io/tx/${hash}`,
    getAddressUrl: (address: string) => `https://sepolia.arbiscan.io/address/${address}`,
    
    // Configuración
    config
  }
}

export default usePortalWallet 