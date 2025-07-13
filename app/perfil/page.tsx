"use client"

import type React from "react"

import { useState } from "react"
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
} from "lucide-react"
import { usePredictionMarket } from "@/hooks/use-prediction-market"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import type { ApuestaUsuario } from "@/lib/types"

export default function PerfilPage() {
  const { isConnected, address, balance, userBets, refetchBalance, refetchUserBets } = usePredictionMarket()
  const [copiedAddress, setCopiedAddress] = useState(false)

  const handleRefreshBalance = () => {
    refetchBalance()
  }

  // Datos de ejemplo para el perfil (en producción vendrían del contrato)
  const posicionesEjemplo: ApuestaUsuario[] = [
    {
      id: "1",
      eventoId: "1",
      eventoNombre: "Bitcoin $120K Septiembre 2024",
      opcionId: "si",
      opcionNombre: "Sí",
      cantidad: 100,
      cuota: 2.3,
      estado: "pendiente",
      fechaApuesta: "2024-01-15",
      gananciasPotenciales: 230,
    },
    {
      id: "2",
      eventoId: "2",
      eventoNombre: "Copa América 2024 - Argentina Campeón",
      opcionId: "si",
      opcionNombre: "Sí",
      cantidad: 50,
      cuota: 1.8,
      estado: "ganada",
      fechaApuesta: "2024-01-10",
      gananciasPotenciales: 90,
    },
    {
      id: "3",
      eventoId: "3",
      eventoNombre: "Elecciones México 2024",
      opcionId: "no",
      opcionNombre: "No",
      cantidad: 75,
      cuota: 2.8,
      estado: "perdida",
      fechaApuesta: "2024-01-05",
      gananciasPotenciales: 210,
    },
  ]

  // Usar posiciones del contrato si están disponibles, sino usar ejemplos
  const posicionesDisponibles = userBets.length > 0 ? userBets : posicionesEjemplo

  const posicionesAbiertas = posicionesDisponibles.filter((pos) => pos.estado === "pendiente")
  const posicionesCerradas = posicionesDisponibles.filter((pos) => pos.estado !== "pendiente")

  const totalInvertido = posicionesDisponibles.reduce((sum, pos) => sum + pos.cantidad, 0)
  const totalGanado = posicionesDisponibles
    .filter((pos) => pos.estado === "ganada")
    .reduce((sum, pos) => sum + pos.gananciasPotenciales, 0)
  const totalPerdido = posicionesDisponibles
    .filter((pos) => pos.estado === "perdida")
    .reduce((sum, pos) => sum + pos.cantidad, 0)

  const copiarDireccion = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const formatearDireccion = (direccion: string) => {
    return `${direccion.slice(0, 6)}...${direccion.slice(-4)}`
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600 bg-yellow-50">
            Pendiente
          </Badge>
        )
      case "ganada":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
            Ganada
          </Badge>
        )
      case "perdida":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50">
            Perdida
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getOpcionBadge = (opcionId: string) => {
    return opcionId === "si" ? (
      <Badge variant="outline" className="text-green-700 border-green-600 bg-green-100">
        Sí
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-700 border-red-600 bg-red-100">
        No
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
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-primary/10 p-4 rounded-full border border-primary/20">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
              <p className="text-muted-foreground">Gestiona tu cuenta y revisa tu historial de posiciones</p>
            </div>
          </div>

          {/* Información de la Wallet */}
          <Card className="border border-primary/20 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <Wallet className="w-5 h-5" />
                <span>Información de Wallet</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-card-foreground/70">Dirección</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm bg-background px-2 py-1 rounded border text-foreground">
                      {address ? formatearDireccion(address) : "No conectado"}
                    </code>
                    {address && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copiarDireccion}
                        className="h-8 w-8 p-0 text-card-foreground hover:text-primary"
                      >
                        {copiedAddress ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-card-foreground/70">Balance MXNB</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-bold text-card-foreground">{balance}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshBalance}
                      className="h-8 w-8 p-0 text-card-foreground hover:text-primary"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-card-foreground/70">Red</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
                      Arbitrum
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-primary/20 bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-card-foreground">{totalInvertido.toFixed(2)}</div>
              <div className="text-sm text-card-foreground/70">Total Invertido</div>
            </CardContent>
          </Card>
          <Card className="border border-primary/20 bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-card-foreground">{totalGanado.toFixed(2)}</div>
              <div className="text-sm text-card-foreground/70">Total Ganado</div>
            </CardContent>
          </Card>
          <Card className="border border-primary/20 bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-card-foreground">{totalPerdido.toFixed(2)}</div>
              <div className="text-sm text-card-foreground/70">Total Perdido</div>
            </CardContent>
          </Card>
          <Card className="border border-primary/20 bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <TrendingDown className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-card-foreground">{posicionesDisponibles.length}</div>
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
                {posicionesAbiertas.length === 0 ? (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>No tienes posiciones abiertas actualmente.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {posicionesAbiertas.map((posicion) => (
                      <Card key={posicion.id} className="border border-primary/10 bg-background">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">{posicion.eventoNombre}</h4>
                              <div className="flex items-center space-x-2 mb-2">
                                {getOpcionBadge(posicion.opcionId)}
                                {getEstadoBadge(posicion.estado)}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-foreground/70">Cantidad:</span>
                              <div className="font-medium text-foreground">{posicion.cantidad} MXNB</div>
                            </div>
                            <div>
                              <span className="text-foreground/70">Cuota:</span>
                              <div className="font-medium text-foreground">{posicion.cuota}x</div>
                            </div>
                            <div>
                              <span className="text-foreground/70">Ganancia Potencial:</span>
                              <div className="font-medium text-green-600">{posicion.gananciasPotenciales} MXNB</div>
                            </div>
                            <div>
                              <span className="text-foreground/70">Fecha:</span>
                              <div className="font-medium text-foreground">
                                {new Date(posicion.fechaApuesta).toLocaleDateString("es-ES")}
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
                {posicionesCerradas.length === 0 ? (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>No tienes posiciones cerradas aún.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {posicionesCerradas.map((posicion) => (
                      <Card key={posicion.id} className="border border-primary/10 bg-background">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">{posicion.eventoNombre}</h4>
                              <div className="flex items-center space-x-2 mb-2">
                                {getOpcionBadge(posicion.opcionId)}
                                {getEstadoBadge(posicion.estado)}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-foreground/70">Cantidad:</span>
                              <div className="font-medium text-foreground">{posicion.cantidad} MXNB</div>
                            </div>
                            <div>
                              <span className="text-foreground/70">Cuota:</span>
                              <div className="font-medium text-foreground">{posicion.cuota}x</div>
                            </div>
                            <div>
                              <span className="text-foreground/70">
                                {posicion.estado === "ganada" ? "Ganancia:" : "Pérdida:"}
                              </span>
                              <div
                                className={`font-medium ${posicion.estado === "ganada" ? "text-green-600" : "text-red-600"
                                  }`}
                              >
                                {posicion.estado === "ganada"
                                  ? `+${posicion.gananciasPotenciales}`
                                  : `-${posicion.cantidad}`}{" "}
                                MXNB
                              </div>
                            </div>
                            <div>
                              <span className="text-foreground/70">Fecha:</span>
                              <div className="font-medium text-foreground">
                                {new Date(posicion.fechaApuesta).toLocaleDateString("es-ES")}
                              </div>
                            </div>
                            <div>
                              <span className="text-foreground/70">ROI:</span>
                              <div
                                className={`font-medium ${posicion.estado === "ganada" ? "text-green-600" : "text-red-600"
                                  }`}
                              >
                                {posicion.estado === "ganada"
                                  ? `+${(((posicion.gananciasPotenciales - posicion.cantidad) / posicion.cantidad) * 100).toFixed(1)}%`
                                  : "-100%"}
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

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
