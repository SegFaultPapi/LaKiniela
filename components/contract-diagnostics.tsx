"use client"

import { useState } from 'react'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  AlertCircle, 
  CheckCircle, 
  ExternalLink, 
  RefreshCw,
  Network,
  Wallet,
  Settings
} from 'lucide-react'
import { 
  CONTRACTS, 
  PREDICTION_MARKET_ABI, 
  MXNB_TOKEN_ABI, 
  formatMXNB,
  getExplorerLink,
  isCorrectNetwork,
  NETWORK_INFO
} from '@/lib/contracts-config'

export function ContractDiagnostics() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Test básico de conectividad
  const isCorrectNet = isConnected && chainId ? isCorrectNetwork(chainId) : false

  // Leer balance MXNB
  const { data: mxnbBalance, error: balanceError, isLoading: balanceLoading, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!isConnected && isCorrectNet,
    },
  })

  // Leer información del token MXNB
  const { data: tokenName, error: nameError } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "name",
    query: {
      enabled: isCorrectNet,
    },
  })

  const { data: tokenSymbol, error: symbolError } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: "symbol",
    query: {
      enabled: isCorrectNet,
    },
  })

  // Leer información del contrato principal
  const { data: marketCount, error: marketCountError } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET,
    abi: PREDICTION_MARKET_ABI,
    functionName: "marketCount",
    query: {
      enabled: isCorrectNet,
    },
  })

  const { data: bettingToken, error: bettingTokenError } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET,
    abi: PREDICTION_MARKET_ABI,
    functionName: "bettingToken",
    query: {
      enabled: isCorrectNet,
    },
  })

  // Función de diagnóstico completo
  const runDiagnostics = async () => {
    setLoading(true)
    
    // Refrescar datos primero
    await refetchBalance()
    
    const results = {
      timestamp: new Date().toISOString(),
      network: {
        connected: isConnected,
        correctNetwork: isCorrectNet,
        chainId: chainId,
        expectedChainId: NETWORK_INFO.chainId,
      },
      wallet: {
        address: address,
        connected: isConnected,
      },
      mxnbToken: {
        address: CONTRACTS.MXNB_TOKEN,
        name: tokenName,
        symbol: tokenSymbol,
        balance: mxnbBalance ? formatMXNB(mxnbBalance) : 'Error',
        balanceRaw: mxnbBalance?.toString(),
        errors: {
          balance: balanceError?.message,
          name: nameError?.message,
          symbol: symbolError?.message,
        }
      },
      predictionMarket: {
        address: CONTRACTS.PREDICTION_MARKET,
        marketCount: marketCount?.toString(),
        bettingToken: bettingToken,
        bettingTokenMatches: bettingToken?.toLowerCase() === CONTRACTS.MXNB_TOKEN.toLowerCase(),
        errors: {
          marketCount: marketCountError?.message,
          bettingToken: bettingTokenError?.message,
        }
      }
    }
    
    setDiagnosticResults(results)
    setLoading(false)
  }

  const getStatus = (condition: boolean) => {
    return condition ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        OK
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertCircle className="h-3 w-3 mr-1" />
        Error
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Diagnóstico de Contratos
          </CardTitle>
          <CardDescription>
            Herramienta para diagnosticar problemas de conectividad con los smart contracts de LaKiniela.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Ejecutar Diagnóstico
          </Button>

          {!isConnected && (
            <Alert variant="destructive">
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                Conecta tu wallet primero para ejecutar el diagnóstico
              </AlertDescription>
            </Alert>
          )}

          {isConnected && !isCorrectNet && (
            <Alert variant="destructive">
              <Network className="h-4 w-4" />
              <AlertDescription>
                Cambia a Arbitrum Sepolia (Chain ID: {NETWORK_INFO.chainId}). Actualmente estás en Chain ID: {chainId}
              </AlertDescription>
            </Alert>
          )}

          {/* Vista en tiempo real del balance */}
          {isConnected && isCorrectNet && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div><strong>Balance MXNB en tiempo real:</strong></div>
                  <div>
                    {balanceLoading ? "Cargando..." : mxnbBalance ? formatMXNB(mxnbBalance) + " MXNB" : "Error leyendo balance"}
                  </div>
                  {balanceError && (
                    <div className="text-red-600 text-sm">Error: {balanceError.message}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    Wallet: {address?.slice(0, 10)}...{address?.slice(-8)}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultados del diagnóstico */}
      {diagnosticResults && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados del Diagnóstico</CardTitle>
            <CardDescription>
              Ejecutado el: {new Date(diagnosticResults.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Estado de la Red */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Network className="h-4 w-4" />
                Estado de la Red
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Wallet Conectado:</span>
                  {getStatus(diagnosticResults.network.connected)}
                </div>
                <div className="flex justify-between">
                  <span>Red Correcta:</span>
                  {getStatus(diagnosticResults.network.correctNetwork)}
                </div>
                <div className="flex justify-between">
                  <span>Chain ID Actual:</span>
                  <span className="font-mono">{diagnosticResults.network.chainId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chain ID Esperado:</span>
                  <span className="font-mono">{diagnosticResults.network.expectedChainId}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Token MXNB */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                Token MXNB
                <a 
                  href={getExplorerLink(CONTRACTS.MXNB_TOKEN, 'address')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dirección:</span>
                  <span className="font-mono text-xs">{diagnosticResults.mxnbToken.address}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nombre:</span>
                  <span>{diagnosticResults.mxnbToken.name || 'Error'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Símbolo:</span>
                  <span>{diagnosticResults.mxnbToken.symbol || 'Error'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <span className="font-bold">{diagnosticResults.mxnbToken.balance} MXNB</span>
                </div>
                {diagnosticResults.mxnbToken.balanceRaw && (
                  <div className="flex justify-between">
                    <span>Balance Raw:</span>
                    <span className="font-mono text-xs">{diagnosticResults.mxnbToken.balanceRaw}</span>
                  </div>
                )}
                
                {/* Errores del token MXNB */}
                {(diagnosticResults.mxnbToken.errors.balance || 
                  diagnosticResults.mxnbToken.errors.name || 
                  diagnosticResults.mxnbToken.errors.symbol) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {diagnosticResults.mxnbToken.errors.balance && (
                          <div>Balance Error: {diagnosticResults.mxnbToken.errors.balance}</div>
                        )}
                        {diagnosticResults.mxnbToken.errors.name && (
                          <div>Name Error: {diagnosticResults.mxnbToken.errors.name}</div>
                        )}
                        {diagnosticResults.mxnbToken.errors.symbol && (
                          <div>Symbol Error: {diagnosticResults.mxnbToken.errors.symbol}</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <Separator />

            {/* Contrato Principal */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                Contrato Principal
                <a 
                  href={getExplorerLink(CONTRACTS.PREDICTION_MARKET, 'address')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dirección:</span>
                  <span className="font-mono text-xs">{diagnosticResults.predictionMarket.address}</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Count:</span>
                  <span>{diagnosticResults.predictionMarket.marketCount || 'Error'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Betting Token:</span>
                  <span className="font-mono text-xs">{diagnosticResults.predictionMarket.bettingToken || 'Error'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Token Configurado Correctamente:</span>
                  {getStatus(diagnosticResults.predictionMarket.bettingTokenMatches)}
                </div>
                
                {/* Errores del contrato principal */}
                {(diagnosticResults.predictionMarket.errors.marketCount || 
                  diagnosticResults.predictionMarket.errors.bettingToken) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {diagnosticResults.predictionMarket.errors.marketCount && (
                          <div>Market Count Error: {diagnosticResults.predictionMarket.errors.marketCount}</div>
                        )}
                        {diagnosticResults.predictionMarket.errors.bettingToken && (
                          <div>Betting Token Error: {diagnosticResults.predictionMarket.errors.bettingToken}</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Estado actual */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">Estado Actual:</div>
                  <div>• Balance MXNB: {mxnbBalance ? formatMXNB(mxnbBalance) : 'No disponible'}</div>
                  <div>• Mercados: {marketCount?.toString() || 'No disponible'}</div>
                  <div>• Red: {isCorrectNet ? 'Correcta' : 'Incorrecta'}</div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 