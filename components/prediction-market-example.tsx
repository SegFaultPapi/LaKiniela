"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Wallet, 
  Clock, 
  TrendingUp, 
  Trophy, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  RefreshCw,
  Zap,
  Target,
  ExternalLink,
  Network,
  Settings,
  Plus,
  Gavel,
  Eye,
  DollarSign,
  Wrench
} from 'lucide-react'
import { usePredictionMarketV2 } from "@/hooks/use-prediction-market-v2"
import { 
  isCorrectNetwork, 
  getNetworkSwitchMessage, 
  getExplorerLink,
  formatMXNB,
  handleContractError,
  MIN_BET_AMOUNT,
  MarketOutcome,
  CONTRACTS
} from "@/lib/contracts-config"
import { useToast } from '@/hooks/use-toast'
import { 
  formatEndTime, 
  NETWORK_INFO,
  UI_CONSTANTS,
} from '@/lib/contracts-config'
import { ContractDiagnostics } from '@/components/contract-diagnostics'

export function PredictionMarketExample() {
  const { toast } = useToast()
  
  // Estados del componente
  const [selectedMarketId, setSelectedMarketId] = useState<number>(0)
  const [betAmount, setBetAmount] = useState<string>('1.0')
  const [marketInfo, setMarketInfo] = useState<any>(null)
  const [userShares, setUserShares] = useState<any>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  
  // Estados para crear mercados (admin)
  const [newMarket, setNewMarket] = useState({
    question: '',
    optionA: '',
    optionB: '',
    duration: 24 // horas
  })
  
  // Estados para resolver mercados (admin)
  const [resolveMarketId, setResolveMarketId] = useState<number>(0)
  const [resolveOutcome, setResolveOutcome] = useState<MarketOutcome>(MarketOutcome.OPTION_A)

  // Hook del contrato
  const {
    isConnected,
    address,
    chainId,
    balance,
    balanceLoading,
    hasInfiniteAllowance,
    marketCount,
    isWritePending,
    isConfirming,
    isConfirmed,
    lastTxHash,
    txError,
    // Funciones de lectura
    getUserInfoAdvanced,
    getMarketInfo,
    getUserShares,
    refetchBalance,
    refetchMarketCount,
    refetchInfiniteAllowance,
    // Funciones de escritura
    approveInfiniteMXNB,
    createMarket,
    buyShares,
    claimWinnings,
    resolveMarket,
    // Función optimizada
    buySharesWithAllowance,
    // Ya importadas directamente: formatMXNB, handleContractError, MIN_BET_AMOUNT, MarketOutcome
  } = usePredictionMarketV2()

  // Verificar red correcta
  const isCorrectNet = isConnected && chainId ? isCorrectNetwork(chainId) : false

  // Función para cargar información del mercado
  const loadMarketInfo = async (marketId: number) => {
    setLoading(prev => ({ ...prev, market: true }))
    try {
      const info = await getMarketInfo(marketId)
      setMarketInfo(info)
      
      if (isConnected && address) {
        const shares = await getUserShares(marketId)
        setUserShares(shares)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del mercado",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, market: false }))
    }
  }

  // Función para aprobar allowance infinito
  const handleApproveInfinite = async () => {
    if (!isCorrectNet) {
      toast({
        title: "Red Incorrecta",
        description: getNetworkSwitchMessage(),
        variant: "destructive"
      })
      return
    }

    setLoading(prev => ({ ...prev, approve: true }))
    try {
      const hash = await approveInfiniteMXNB()
      if (hash) {
        toast({
          title: "⏳ Aprobación Enviada",
          description: `La aprobación está siendo procesada. TX: ${hash.slice(0, 10)}... - Ver en: https://sepolia.arbiscan.io/tx/${hash}`,
          duration: 6000,
        })
        
        // Refrescar allowance después de unos segundos
        setTimeout(() => {
          refetchInfiniteAllowance()
        }, 5000)
      }
    } catch (error) {
      toast({
        title: "❌ Error en Aprobación",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, approve: false }))
    }
  }

  // Función para crear mercado (solo admin)
  const handleCreateMarket = async () => {
    if (!isCorrectNet) {
      toast({
        title: "Red Incorrecta",
        description: getNetworkSwitchMessage(),
        variant: "destructive"
      })
      return
    }

    if (!newMarket.question || !newMarket.optionA || !newMarket.optionB) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive"
      })
      return
    }

    setLoading(prev => ({ ...prev, create: true }))
    try {
      const hash = await createMarket(
        newMarket.question,
        newMarket.optionA,
        newMarket.optionB,
        newMarket.duration
      )
      
      if (hash) {
        toast({
          title: "🚀 Market Creado",
          description: `El market ha sido enviado a la blockchain. TX: ${hash.slice(0, 10)}... - Ver en: https://sepolia.arbiscan.io/tx/${hash}`,
          duration: 6000,
        })
        
        // Limpiar formulario y refrescar
        setNewMarket({
          question: '',
          optionA: '',
          optionB: '',
          duration: 24
        })
        
        setTimeout(() => {
          refetchMarketCount()
        }, 5000)
      }
    } catch (error) {
      toast({
        title: "❌ Error Creando Market",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, create: false }))
    }
  }

  // Función para resolver mercado (solo admin)
  const handleResolveMarket = async () => {
    if (!isCorrectNet) {
      toast({
        title: "Red Incorrecta",
        description: getNetworkSwitchMessage(),
        variant: "destructive"
      })
      return
    }

    setLoading(prev => ({ ...prev, resolve: true }))
    try {
      const hash = await resolveMarket(resolveMarketId, resolveOutcome)
      
      if (hash) {
        toast({
          title: "Mercado Resuelto",
          description: (
            <div className="flex items-center gap-2">
              <span>TX: {hash.slice(0, 10)}...</span>
              <a 
                href={getExplorerLink(hash)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ),
        })
        
        // Refrescar información del mercado
        setTimeout(() => {
          loadMarketInfo(resolveMarketId)
        }, 5000)
      }
    } catch (error) {
      toast({
        title: "Error Resolviendo Mercado",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, resolve: false }))
    }
  }

  // Función para comprar shares con flujo optimizado
  const handleBuyShares = async (isOptionA: boolean) => {
    if (!isCorrectNet) {
      toast({
        title: "Red Incorrecta",
        description: getNetworkSwitchMessage(),
        variant: "destructive"
      })
      return
    }

    setLoading(prev => ({ ...prev, buy: true }))
    try {
      const result = await buySharesWithAllowance(selectedMarketId, isOptionA, betAmount)
      
      if (result.success) {
        toast({
          title: "💰 Participación Enviada",
          description: `Tu apuesta en ${isOptionA ? 'Opción A (Sí)' : 'Opción B (No)'} está siendo procesada.${result.hash ? ` TX: ${result.hash.slice(0, 10)}... - Ver en: https://sepolia.arbiscan.io/tx/${result.hash}` : ''}`,
          duration: 6000,
        })
        
        if (result.hash) {
          // Refrescar datos después de la transacción
          setTimeout(() => {
            loadMarketInfo(selectedMarketId)
            refetchBalance()
          }, 5000)
        }
      } else {
        toast({
          title: "❌ Error en Participación",
          description: result.step,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "❌ Error en Compra",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, buy: false }))
    }
  }

  // Función para reclamar ganancias
  const handleClaimWinnings = async () => {
    if (!isCorrectNet) {
      toast({
        title: "Red Incorrecta",
        description: getNetworkSwitchMessage(),
        variant: "destructive"
      })
      return
    }

    setLoading(prev => ({ ...prev, claim: true }))
    try {
      const hash = await claimWinnings(selectedMarketId)
      if (hash) {
        toast({
          title: "Reclamo Enviado",
          description: (
            <div className="flex items-center gap-2">
              <span>TX: {hash.slice(0, 10)}...</span>
              <a 
                href={getExplorerLink(hash)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ),
        })
        
        // Refrescar datos
        setTimeout(() => {
          loadMarketInfo(selectedMarketId)
          refetchBalance()
        }, 5000)
      }
    } catch (error) {
      toast({
        title: "Error en Reclamo",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      })
    } finally {
      setLoading(prev => ({ ...prev, claim: false }))
    }
  }

  // Cargar información al cambiar el mercado seleccionado
  useEffect(() => {
    if (selectedMarketId >= 0 && marketCount > 0) {
      loadMarketInfo(selectedMarketId)
    }
  }, [selectedMarketId, marketCount, isConnected])

  // Función para determinar el color del outcome
  const getOutcomeColor = (outcome: MarketOutcome) => {
    switch (outcome) {
      case MarketOutcome.OPTION_A:
        return 'bg-green-500'
      case MarketOutcome.OPTION_B:
        return 'bg-blue-500'
      case MarketOutcome.CANCELLED:
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getOutcomeText = (outcome: MarketOutcome) => {
    switch (outcome) {
      case MarketOutcome.OPTION_A:
        return 'Opción A Ganó'
      case MarketOutcome.OPTION_B:
        return 'Opción B Ganó'
      case MarketOutcome.CANCELLED:
        return 'Cancelado'
      default:
        return 'Sin Resolver'
    }
  }

  // Verificar si el usuario es admin (simplificado - en producción usar mejor verificación)
  const isAdmin = address && address.toLowerCase() === CONTRACTS.PREDICTION_MARKET.slice(0, 42).toLowerCase()

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Conecta tu Wallet</h3>
            <p className="text-gray-600">
              Necesitas conectar tu wallet para interactuar con los mercados de predicción
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isCorrectNet) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Network className="mx-auto h-12 w-12 text-orange-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Red Incorrecta</h3>
            <p className="text-gray-600 mb-4">
              {getNetworkSwitchMessage()}
            </p>
            <Badge variant="outline" className="mb-4">
              Red Actual: {chainId}
            </Badge>
            <div className="text-sm text-gray-500">
              <p>Red Requerida: {NETWORK_INFO.name}</p>
              <p>Chain ID: {NETWORK_INFO.chainId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header con información del usuario y red */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Mercados de Predicción - LaKiniela
            <Badge variant="secondary" className="ml-auto">
              {NETWORK_INFO.name}
            </Badge>
          </CardTitle>
          <CardDescription>
            Apuesta en mercados de predicción con MXNB en {NETWORK_INFO.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Label className="text-sm text-gray-600">Balance MXNB</Label>
              <div className="text-2xl font-bold">
                {balanceLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  `${balance} MXNB`
                )}
              </div>
            </div>
            <div className="text-center">
              <Label className="text-sm text-gray-600">Allowance</Label>
              <div className="flex items-center justify-center gap-2">
                {hasInfiniteAllowance ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Infinito
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Limitado
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-center">
              <Label className="text-sm text-gray-600">Mercados</Label>
              <div className="text-2xl font-bold">{marketCount}</div>
            </div>
            <div className="text-center">
              <Label className="text-sm text-gray-600">Red</Label>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Conectado</span>
              </div>
            </div>
          </div>

          {!hasInfiniteAllowance && (
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Aprueba allowance infinito para mejor UX</span>
                  <Button 
                    size="sm" 
                    onClick={handleApproveInfinite}
                    disabled={loading.approve || isWritePending}
                  >
                    {loading.approve ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Aprobar'
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs principales */}
      <Tabs defaultValue="markets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="markets">Mercados</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnóstico</TabsTrigger>
        </TabsList>

        {/* Tab de Mercados */}
        <TabsContent value="markets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de selección */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Seleccionar Mercado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="marketId">ID del Mercado</Label>
                  <div className="flex gap-2">
                    <Input
                      id="marketId"
                      type="number"
                      min="0"
                      max={marketCount - 1}
                      value={selectedMarketId}
                      onChange={(e) => setSelectedMarketId(parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => loadMarketInfo(selectedMarketId)}
                      disabled={loading.market}
                    >
                      {loading.market ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="betAmount">Cantidad a Apostar (MXNB)</Label>
                  <Input
                    id="betAmount"
                    type="number"
                    min="1"
                    step="0.1"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="1.0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información del mercado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Información del Mercado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {marketInfo ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">Pregunta</Label>
                      <p className="font-medium">{marketInfo.question}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Opción A</Label>
                        <p className="font-medium">{marketInfo.optionA}</p>
                        <p className="text-sm text-gray-500">
                          {formatMXNB(marketInfo.totalOptionAShares)} MXNB
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Opción B</Label>
                        <p className="font-medium">{marketInfo.optionB}</p>
                        <p className="text-sm text-gray-500">
                          {formatMXNB(marketInfo.totalOptionBShares)} MXNB
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Estado</Label>
                      <div className="flex items-center gap-2">
                        {marketInfo.resolved ? (
                          <Badge className={getOutcomeColor(marketInfo.outcome)}>
                            <Trophy className="h-3 w-3 mr-1" />
                            {getOutcomeText(marketInfo.outcome)}
                          </Badge>
                        ) : Date.now() / 1000 < marketInfo.endTime ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Esperando Resolución
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Fin de Apuestas</Label>
                      <p className="text-sm">{formatEndTime(marketInfo.endTime)}</p>
                    </div>

                    {userShares && (
                      <div>
                        <Label className="text-sm text-gray-600">Tus Shares</Label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Opción A: {formatMXNB(userShares.optionAShares)} MXNB</div>
                          <div>Opción B: {formatMXNB(userShares.optionBShares)} MXNB</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    Selecciona un mercado para ver su información
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel de acciones */}
          {marketInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Acciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="bet">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bet">Apostar</TabsTrigger>
                    <TabsTrigger value="claim">Reclamar</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="bet" className="space-y-4">
                    {!marketInfo.resolved && Date.now() / 1000 < marketInfo.endTime ? (
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          onClick={() => handleBuyShares(true)}
                          disabled={loading.buy || isWritePending}
                          className="h-16"
                        >
                          {loading.buy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <div className="text-center">
                              <div className="font-bold">Apostar Opción A</div>
                              <div className="text-sm opacity-80">{marketInfo.optionA}</div>
                            </div>
                          )}
                        </Button>
                        <Button 
                          onClick={() => handleBuyShares(false)}
                          disabled={loading.buy || isWritePending}
                          variant="outline"
                          className="h-16"
                        >
                          {loading.buy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <div className="text-center">
                              <div className="font-bold">Apostar Opción B</div>
                              <div className="text-sm opacity-80">{marketInfo.optionB}</div>
                            </div>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {marketInfo.resolved 
                            ? 'Este mercado ya está resuelto' 
                            : 'El tiempo de apuestas ha terminado'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="claim" className="space-y-4">
                    {marketInfo.resolved ? (
                      userShares && (userShares.optionAShares > 0 || userShares.optionBShares > 0) ? (
                        <Button 
                          onClick={handleClaimWinnings}
                          disabled={loading.claim || isWritePending}
                          className="w-full"
                        >
                          {loading.claim ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trophy className="h-4 w-4 mr-2" />
                          )}
                          Reclamar Ganancias
                        </Button>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No tienes shares en este mercado para reclamar
                          </AlertDescription>
                        </Alert>
                      )
                    ) : (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          El mercado debe estar resuelto para reclamar ganancias
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Admin */}
        <TabsContent value="admin" className="space-y-6">
          {isAdmin ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crear Mercado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="question">Pregunta</Label>
                    <Input
                      id="question"
                      value={newMarket.question}
                      onChange={(e) => setNewMarket({...newMarket, question: e.target.value})}
                      placeholder="¿Cuál será el resultado?"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="optionA">Opción A</Label>
                    <Input
                      id="optionA"
                      value={newMarket.optionA}
                      onChange={(e) => setNewMarket({...newMarket, optionA: e.target.value})}
                      placeholder="Primera opción"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="optionB">Opción B</Label>
                    <Input
                      id="optionB"
                      value={newMarket.optionB}
                      onChange={(e) => setNewMarket({...newMarket, optionB: e.target.value})}
                      placeholder="Segunda opción"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duración (horas)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="720"
                      value={newMarket.duration}
                      onChange={(e) => setNewMarket({...newMarket, duration: parseInt(e.target.value) || 24})}
                      placeholder="24"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreateMarket}
                    disabled={loading.create || isWritePending}
                    className="w-full"
                  >
                    {loading.create ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Crear Mercado
                  </Button>
                </CardContent>
              </Card>

              {/* Resolver Mercado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-4 w-4" />
                    Resolver Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="resolveMarketId">ID del Mercado</Label>
                    <Input
                      id="resolveMarketId"
                      type="number"
                      min="0"
                      value={resolveMarketId}
                      onChange={(e) => setResolveMarketId(parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="outcome">Resultado</Label>
                    <select 
                      id="outcome"
                      value={resolveOutcome}
                      onChange={(e) => setResolveOutcome(parseInt(e.target.value) as MarketOutcome)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value={MarketOutcome.OPTION_A}>Opción A Gana</option>
                      <option value={MarketOutcome.OPTION_B}>Opción B Gana</option>
                      <option value={MarketOutcome.CANCELLED}>Cancelar</option>
                    </select>
                  </div>
                  
                  <Button 
                    onClick={handleResolveMarket}
                    disabled={loading.resolve || isWritePending}
                    className="w-full"
                  >
                    {loading.resolve ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Gavel className="h-4 w-4 mr-2" />
                    )}
                    Resolver Mercado
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Solo el propietario del contrato puede acceder a las funciones de administración.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Tab de Información */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Red</Label>
                  <p className="font-medium">{NETWORK_INFO.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Chain ID</Label>
                  <p className="font-medium">{NETWORK_INFO.chainId}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Contrato Principal</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{CONTRACTS.PREDICTION_MARKET.slice(0, 10)}...</p>
                    <a 
                      href={getExplorerLink(CONTRACTS.PREDICTION_MARKET, 'address')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Token MXNB</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{CONTRACTS.MXNB_TOKEN.slice(0, 10)}...</p>
                    <a 
                      href={getExplorerLink(CONTRACTS.MXNB_TOKEN, 'address')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Explorador</Label>
                  <a 
                    href={NETWORK_INFO.blockExplorer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    Arbiscan
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Apuesta Mínima</Label>
                  <p className="font-medium">1 MXNB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Diagnóstico */}
        <TabsContent value="diagnostics" className="space-y-6">
          <ContractDiagnostics />
        </TabsContent>
      </Tabs>

      {/* Estado de transacciones */}
      {(isWritePending || isConfirming || lastTxHash) && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <div className="space-y-2">
              {isWritePending && <p>Enviando transacción...</p>}
              {isConfirming && <p>Esperando confirmación...</p>}
              {lastTxHash && (
                <p className="text-sm flex items-center gap-2">
                  TX: <code className="bg-gray-100 px-1 rounded">{lastTxHash.slice(0, 10)}...</code>
                  <a 
                    href={getExplorerLink(lastTxHash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {txError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error en transacción: {handleContractError(txError)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 