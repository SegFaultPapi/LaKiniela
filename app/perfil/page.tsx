"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  MessageCircle,
  Calendar,
  DollarSign,
  ImageIcon,
} from "lucide-react"
import { usePredictionMarketV2 } from "@/hooks/use-prediction-market-v2"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { MarketImageStorage } from "@/lib/market-images"
import { formatMXNB, MarketOutcome } from "@/lib/contracts-config"
import type { ApuestaUsuario } from "@/lib/types"
import Image from "next/image"

interface UserPosition {
  id: string
  marketId: number
  marketName: string
  marketQuestion: string
  marketImage?: string
  optionAShares: bigint
  optionBShares: bigint
  optionAName: string
  optionBName: string
  marketResolved: boolean
  marketOutcome: MarketOutcome
  endTime: number
  estado: "activo" | "finalizado" | "cancelado"
  fechaParticipacion: string
  totalInvested: number
  potentialWinnings: number
}

export default function PerfilPage() {
  const { 
    isConnected, 
    address, 
    balance, 
    markets, 
    loadingMarkets,
    getUserShares,
    getMarketInfo,
    refetchBalance,
    loadAllMarkets 
  } = usePredictionMarketV2()
  
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [userPositions, setUserPositions] = useState<UserPosition[]>([])
  const [loadingPositions, setLoadingPositions] = useState(false)

  // Función para cargar todas las posiciones del usuario
  const loadUserPositions = useCallback(async () => {
    if (!address || !isConnected || markets.length === 0) {
      setUserPositions([])
      return
    }

    setLoadingPositions(true)
    
    try {
      const positions: UserPosition[] = []
      
      // Obtener shares del usuario para cada market
      for (const market of markets) {
        const userShares = await getUserShares(market.id, address)
        
        if (userShares && (userShares.optionAShares > 0 || userShares.optionBShares > 0)) {
          // Obtener imagen del market
          const marketImage = MarketImageStorage.getImage(market.id, "0xB00614e08530E092121EF0633f9226B2466FFb02")
          
          // Determinar estado del market
          let estado: "activo" | "finalizado" | "cancelado";
          if (market.outcome === MarketOutcome.CANCELLED) {
            estado = "cancelado";
          } else if (market.resolved) {
            estado = "finalizado";
          } else if (Number(market.endTime) * 1000 > Date.now()) {
            estado = "activo";
          } else {
            estado = "finalizado";
          }
          
          // Calcular inversión total estimada (usando shares como proxy)
          const totalShares = Number(formatMXNB(userShares.optionAShares + userShares.optionBShares))
          
          // Calcular ganancias potenciales
          let potentialWinnings = 0
          if (market.resolved) {
            if (market.outcome === MarketOutcome.OPTION_A && userShares.optionAShares > 0) {
              potentialWinnings = Number(formatMXNB(userShares.optionAShares))
            } else if (market.outcome === MarketOutcome.OPTION_B && userShares.optionBShares > 0) {
              potentialWinnings = Number(formatMXNB(userShares.optionBShares))
            }
          } else {
            // Si no está resuelto, estimar basado en shares
            potentialWinnings = totalShares * 1.5 // Estimación conservadora
          }
          
          const position: UserPosition = {
            id: `${market.id}-${address}`,
            marketId: market.id,
            marketName: market.question,
            marketQuestion: market.question,
            marketImage: marketImage || undefined,
            optionAShares: userShares.optionAShares,
            optionBShares: userShares.optionBShares,
            optionAName: market.optionA,
            optionBName: market.optionB,
            marketResolved: market.resolved,
            marketOutcome: market.outcome,
            endTime: market.endTime,
            estado,
            fechaParticipacion: new Date().toISOString(), // Aproximación
            totalInvested: totalShares,
            potentialWinnings
          }
          
          positions.push(position)
        }
      }
      
      setUserPositions(positions)
    } catch (error) {
      console.error("Error cargando posiciones del usuario:", error)
      setUserPositions([])
    } finally {
      setLoadingPositions(false)
    }
  }, [address, isConnected, markets, getUserShares])

  // Cargar posiciones cuando cambie la data de markets
  useEffect(() => {
    if (markets.length > 0) {
      loadUserPositions()
    }
  }, [markets, loadUserPositions])

  const handleRefreshBalance = () => {
    refetchBalance()
  }

  const handleRefreshData = () => {
    loadAllMarkets()
    loadUserPositions()
  }

  const posicionesAbiertas = userPositions.filter((pos) => pos.estado === "activo")
  const posicionesCerradas = userPositions.filter((pos) => pos.estado !== "activo")

  const totalInvertido = userPositions.reduce((sum, pos) => sum + pos.totalInvested, 0)
  const totalGanado = userPositions
    .filter((pos) => pos.estado === "finalizado" && pos.marketResolved)
    .reduce((sum, pos) => {
      if (pos.marketOutcome === MarketOutcome.OPTION_A && pos.optionAShares > 0) {
        return sum + Number(formatMXNB(pos.optionAShares))
      } else if (pos.marketOutcome === MarketOutcome.OPTION_B && pos.optionBShares > 0) {
        return sum + Number(formatMXNB(pos.optionBShares))
      }
      return sum
    }, 0)

  const copiarDireccion = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const openChatbaseChat = () => {
    const chatbaseWidget = (window as any).chatbaseConfig
    if (chatbaseWidget) {
      chatbaseWidget.openChat?.()
    }
  }

  const getOpcionBadge = (opcion: "si" | "no" | string) => {
    if (opcion === "si" || opcion === "option_a") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Sí
        </Badge>
      )
    }
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        No
      </Badge>
    )
  }

  const getEstadoBadge = (estado: string) => {
    const badgeConfig = {
      pendiente: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, text: "Pendiente" },
      activo: { className: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock, text: "Activo" },
      ganada: { className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, text: "Ganada" },
      perdida: { className: "bg-red-100 text-red-800 border-red-200", icon: XCircle, text: "Perdida" },
      finalizado: { className: "bg-gray-100 text-gray-800 border-gray-200", icon: CheckCircle, text: "Finalizado" },
      cancelado: { className: "bg-red-100 text-red-800 border-red-200", icon: XCircle, text: "Cancelado" },
    }

    const config = badgeConfig[estado as keyof typeof badgeConfig] || badgeConfig.pendiente
    const Icon = config.icon

    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card className="border border-primary/20 bg-white shadow-lg">
              <CardContent className="py-12">
                <Wallet className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-card-foreground mb-4">Conecta tu Wallet</h2>
                <p className="text-card-foreground/70 mb-6">
                  Para ver tu perfil y historial de posiciones, necesitas conectar tu wallet.
                </p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header del Perfil */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-4 rounded-full border border-primary/20">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
                <p className="text-muted-foreground">Gestiona tu cuenta y revisa tu historial de posiciones</p>
              </div>
            </div>
            <Button 
              onClick={handleRefreshData}
              variant="outline"
              disabled={loadingMarkets || loadingPositions}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(loadingMarkets || loadingPositions) ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Información de la Wallet */}
          <Card className="border border-primary/20 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <Wallet className="w-5 h-5" />
                <span>Información de Wallet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-card-foreground/70 mb-1">Dirección</div>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-card-foreground">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'No conectado'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copiarDireccion}
                      className="p-1 h-auto"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {copiedAddress && (
                      <span className="text-xs text-green-600">¡Copiado!</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-card-foreground/70 mb-1">Balance MXNB</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-card-foreground">{balance} MXNB</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshBalance}
                      className="p-1 h-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas del Usuario */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-primary/20 bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-card-foreground">{totalInvertido.toFixed(2)} MXNB</div>
              <div className="text-sm text-card-foreground/70">Total Invertido</div>
            </CardContent>
          </Card>

          <Card className="border border-primary/20 bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{totalGanado.toFixed(2)} MXNB</div>
              <div className="text-sm text-card-foreground/70">Total Ganado</div>
            </CardContent>
          </Card>

          <Card className="border border-primary/20 bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-card-foreground">{posicionesAbiertas.length}</div>
              <div className="text-sm text-card-foreground/70">Posiciones Activas</div>
            </CardContent>
          </Card>

          <Card className="border border-primary/20 bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <TrendingDown className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-card-foreground">{userPositions.length}</div>
              <div className="text-sm text-card-foreground/70">Total Posiciones</div>
            </CardContent>
          </Card>
        </div>

        {/* Historial de Posiciones */}
        <Card className="border border-primary/20 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-card-foreground">Historial de Posiciones</CardTitle>
            <CardDescription className="text-card-foreground/70">
              Revisa todas tus posiciones abiertas y cerradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="abiertas" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-background border border-primary/20">
                <TabsTrigger value="abiertas" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Posiciones Abiertas ({posicionesAbiertas.length})
                </TabsTrigger>
                <TabsTrigger value="cerradas" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Posiciones Cerradas ({posicionesCerradas.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="abiertas" className="mt-6">
                {loadingPositions ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Cargando posiciones...</p>
                  </div>
                ) : posicionesAbiertas.length === 0 ? (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>No tienes posiciones abiertas actualmente.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {posicionesAbiertas.map((posicion) => (
                      <Card key={posicion.id} className="border border-primary/10 bg-gradient-to-br from-white to-primary/5 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          {/* Header con imagen */}
                          <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/20 rounded-t-lg overflow-hidden">
                            {posicion.marketImage ? (
                              <Image
                                src={posicion.marketImage}
                                alt={posicion.marketName}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-primary/40" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              {getEstadoBadge(posicion.estado)}
                            </div>
                          </div>
                          
                          {/* Contenido */}
                          <div className="p-4">
                            <h4 className="font-semibold text-foreground mb-2 line-clamp-2">{posicion.marketQuestion}</h4>
                            
                            {/* Posiciones del usuario */}
                            <div className="space-y-2 mb-4">
                              {Number(formatMXNB(posicion.optionAShares)) > 0 && (
                                <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      {posicion.optionAName}
                                    </Badge>
                                  </div>
                                  <span className="font-medium text-green-700">
                                    {formatMXNB(posicion.optionAShares)} MXNB
                                  </span>
                                </div>
                              )}
                              {Number(formatMXNB(posicion.optionBShares)) > 0 && (
                                <div className="flex items-center justify-between bg-red-50 p-2 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Badge className="bg-red-100 text-red-800 border-red-200">
                                      {posicion.optionBName}
                                    </Badge>
                                  </div>
                                  <span className="font-medium text-red-700">
                                    {formatMXNB(posicion.optionBShares)} MXNB
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Información adicional */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-foreground/70 flex items-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Total Invertido:
                                </span>
                                <div className="font-medium text-foreground">{posicion.totalInvested.toFixed(2)} MXNB</div>
                              </div>
                              <div>
                                <span className="text-foreground/70 flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Fin:
                                </span>
                                <div className="font-medium text-foreground">
                                  {new Date(posicion.endTime * 1000).toLocaleDateString("es-ES")}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cerradas" className="mt-6">
                {loadingPositions ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Cargando posiciones...</p>
                  </div>
                ) : posicionesCerradas.length === 0 ? (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>No tienes posiciones cerradas aún.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {posicionesCerradas.map((posicion) => (
                      <Card key={posicion.id} className="border border-primary/10 bg-gradient-to-br from-white to-gray-50 shadow-md">
                        <CardContent className="p-0">
                          {/* Header con imagen */}
                          <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                            {posicion.marketImage ? (
                              <Image
                                src={posicion.marketImage}
                                alt={posicion.marketName}
                                fill
                                className="object-cover opacity-75"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              {getEstadoBadge(posicion.estado)}
                            </div>
                          </div>
                          
                          {/* Contenido */}
                          <div className="p-4">
                            <h4 className="font-semibold text-foreground mb-2 line-clamp-2">{posicion.marketQuestion}</h4>
                            
                            {/* Resultado */}
                            {posicion.marketResolved && (
                              <div className="mb-4">
                                {posicion.marketOutcome === MarketOutcome.OPTION_A ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    Ganó: {posicion.optionAName}
                                  </Badge>
                                ) : posicion.marketOutcome === MarketOutcome.OPTION_B ? (
                                  <Badge className="bg-red-100 text-red-800 border-red-200">
                                    Ganó: {posicion.optionBName}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                    Cancelado
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Posiciones del usuario */}
                            <div className="space-y-2 mb-4">
                              {Number(formatMXNB(posicion.optionAShares)) > 0 && (
                                <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      {posicion.optionAName}
                                    </Badge>
                                    {posicion.marketResolved && posicion.marketOutcome === MarketOutcome.OPTION_A && (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                  <span className="font-medium text-green-700">
                                    {formatMXNB(posicion.optionAShares)} MXNB
                                  </span>
                                </div>
                              )}
                              {Number(formatMXNB(posicion.optionBShares)) > 0 && (
                                <div className="flex items-center justify-between bg-red-50 p-2 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Badge className="bg-red-100 text-red-800 border-red-200">
                                      {posicion.optionBName}
                                    </Badge>
                                    {posicion.marketResolved && posicion.marketOutcome === MarketOutcome.OPTION_B && (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                  <span className="font-medium text-red-700">
                                    {formatMXNB(posicion.optionBShares)} MXNB
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Información adicional */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-foreground/70 flex items-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Invertido:
                                </span>
                                <div className="font-medium text-foreground">{posicion.totalInvested.toFixed(2)} MXNB</div>
                              </div>
                              <div>
                                <span className="text-foreground/70 flex items-center">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Resultado:
                                </span>
                                <div className={`font-medium ${posicion.potentialWinnings > posicion.totalInvested ? 'text-green-600' : 'text-red-600'}`}>
                                  {posicion.potentialWinnings > 0 ? `+${posicion.potentialWinnings.toFixed(2)}` : '0.00'} MXNB
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="mt-8">
          <Card className="bg-primary/10 border-primary/20 shadow-lg">
            <CardContent className="text-center py-6">
              <h3 className="text-lg font-semibold text-primary mb-2">¿Necesitas ayuda?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Si tienes preguntas sobre tus posiciones o necesitas soporte, nuestro asistente AI está aquí para ayudarte.
              </p>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                onClick={openChatbaseChat}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat con Asistente AI
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
