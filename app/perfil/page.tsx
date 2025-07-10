"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wallet,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useState } from "react"

export default function PerfilPage() {
  const {
    isConnected,
    address,
    balance,
    userBets,
    isWritePending,
    isConfirming,
    isConfirmed,
    lastTxHash,
    claimReward,
    refetchBalance,
    refetchUserBets,
  } = useWallet()

  const [claimingBetId, setClaimingBetId] = useState<string>("")
  const [txError, setTxError] = useState<string>("")

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="py-12">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Wallet no conectado</h2>
            <p className="text-gray-600 mb-6">Conecta tu wallet para ver tu perfil y historial de apuestas.</p>
            <ConnectButton label="Conectar Wallet" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const apuestasGanadas = userBets.filter((a) => a.estado === "ganada")
  const apuestasPerdidas = userBets.filter((a) => a.estado === "perdida")
  const apuestasPendientes = userBets.filter((a) => a.estado === "pendiente")

  const totalApostado = userBets.reduce((sum, apuesta) => sum + apuesta.cantidad, 0)
  const gananciasReclamables = apuestasGanadas.reduce((sum, apuesta) => sum + apuesta.gananciasPotenciales, 0)

  const copiarDireccion = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  const manejarReclamarGanancias = async (betId: string) => {
    setClaimingBetId(betId)
    setTxError("")

    try {
      await claimReward(betId)
    } catch (error: any) {
      console.error("Error al reclamar ganancias:", error)
      setTxError(error.message || "Error al reclamar ganancias")
    } finally {
      setClaimingBetId("")
    }
  }

  const refrescarDatos = () => {
    refetchBalance()
    refetchUserBets()
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "ganada":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "perdida":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "pendiente":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "ganada":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ganada</Badge>
      case "perdida":
        return <Badge variant="destructive">Perdida</Badge>
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      default:
        return null
    }
  }

  const getArbitrumExplorerUrl = (hash: string) => {
    return `https://arbiscan.io/tx/${hash}`
  }

  const getAddressExplorerUrl = (address: string) => {
    return `https://arbiscan.io/address/${address}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header del Perfil */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu wallet y revisa tu historial de apuestas</p>
        </div>
        <Button variant="outline" onClick={refrescarDatos} className="flex items-center space-x-2 bg-transparent">
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar</span>
        </Button>
      </div>

      {/* Alertas de transacciones */}
      {(isWritePending || isConfirming) && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            {isWritePending && "Confirmando transacción en tu wallet..."}
            {isConfirming && "Esperando confirmación en la blockchain..."}
            {lastTxHash && (
              <div className="mt-2">
                <a
                  href={getArbitrumExplorerUrl(lastTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                  Ver transacción <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isConfirmed && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ¡Ganancias reclamadas exitosamente!
            {lastTxHash && (
              <div className="mt-2">
                <a
                  href={getArbitrumExplorerUrl(lastTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 inline-flex items-center"
                >
                  Ver en Arbiscan <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {txError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{txError}</AlertDescription>
        </Alert>
      )}

      {/* Información del Wallet */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Información del Wallet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-500">Dirección</Label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
                </code>
                <Button variant="ghost" size="sm" onClick={copiarDireccion}>
                  <Copy className="w-4 h-4" />
                </Button>
                {address && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={getAddressExplorerUrl(address)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Balance MXNB</Label>
              <div className="text-2xl font-bold text-blue-600 mt-1">{balance} MXNB</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{userBets.length}</div>
            <div className="text-sm text-gray-600">Total Apuestas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{apuestasGanadas.length}</div>
            <div className="text-sm text-gray-600">Ganadas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalApostado.toFixed(2)}</div>
            <div className="text-sm text-gray-600">MXNB Apostados</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{gananciasReclamables.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Por Reclamar</div>
          </CardContent>
        </Card>
      </div>

      {/* Botón de Reclamar Ganancias */}
      {gananciasReclamables > 0 && (
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">¡Tienes ganancias por reclamar!</h3>
                <p className="text-green-600">
                  Puedes reclamar {gananciasReclamables.toFixed(2)} MXNB de tus apuestas ganadas.
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700" disabled={isWritePending || isConfirming}>
                    <Trophy className="w-4 h-4 mr-2" />
                    Reclamar Ganancias
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reclamar Ganancias</DialogTitle>
                    <DialogDescription>
                      Vas a reclamar {gananciasReclamables.toFixed(2)} MXNB de tus apuestas ganadas.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total a reclamar:</span>
                        <span className="text-xl font-bold text-green-600">{gananciasReclamables.toFixed(2)} MXNB</span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        apuestasGanadas.forEach((apuesta) => {
                          manejarReclamarGanancias(apuesta.id)
                        })
                      }}
                      disabled={isWritePending || isConfirming}
                    >
                      {isWritePending || isConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "Confirmar Reclamo"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de Apuestas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Apuestas</CardTitle>
          <CardDescription>
            Revisa todas tus apuestas y su estado actual
            {userBets.length === 0 && " (Los datos se cargan desde el contrato inteligente)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userBets.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes apuestas aún</h3>
              <p className="text-gray-600 mb-4">Cuando realices tu primera apuesta, aparecerá aquí tu historial.</p>
              <Button asChild>
                <a href="/apuestas">Explorar Eventos</a>
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="todas" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="todas">Todas ({userBets.length})</TabsTrigger>
                <TabsTrigger value="pendientes">Pendientes ({apuestasPendientes.length})</TabsTrigger>
                <TabsTrigger value="ganadas">Ganadas ({apuestasGanadas.length})</TabsTrigger>
                <TabsTrigger value="perdidas">Perdidas ({apuestasPerdidas.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="todas" className="space-y-4 mt-6">
                {userBets.map((apuesta) => (
                  <Card key={apuesta.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{apuesta.eventoNombre}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Apostaste por: <span className="font-medium">{apuesta.opcionNombre}</span>
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Cantidad: {apuesta.cantidad} MXNB</span>
                            <span>Cuota: {apuesta.cuota}x</span>
                            <span>Fecha: {apuesta.fechaApuesta}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            {getEstadoIcon(apuesta.estado)}
                            {getEstadoBadge(apuesta.estado)}
                          </div>
                          <div className="text-sm">
                            {apuesta.estado === "ganada" && (
                              <div className="space-y-1">
                                <span className="text-green-600 font-medium">+{apuesta.gananciasPotenciales} MXNB</span>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 w-full"
                                  onClick={() => manejarReclamarGanancias(apuesta.id)}
                                  disabled={isWritePending || isConfirming || claimingBetId === apuesta.id}
                                >
                                  {claimingBetId === apuesta.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Reclamando...
                                    </>
                                  ) : (
                                    "Reclamar"
                                  )}
                                </Button>
                              </div>
                            )}
                            {apuesta.estado === "perdida" && (
                              <span className="text-red-600 font-medium">-{apuesta.cantidad} MXNB</span>
                            )}
                            {apuesta.estado === "pendiente" && (
                              <span className="text-yellow-600 font-medium">
                                Potencial: {apuesta.gananciasPotenciales} MXNB
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="pendientes" className="space-y-4 mt-6">
                {apuestasPendientes.map((apuesta) => (
                  <Card key={apuesta.id} className="border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{apuesta.eventoNombre}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Apostaste por: <span className="font-medium">{apuesta.opcionNombre}</span>
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Cantidad: {apuesta.cantidad} MXNB</span>
                            <span>Cuota: {apuesta.cuota}x</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-2">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendiente
                          </Badge>
                          <div className="text-sm text-yellow-600 font-medium">
                            Potencial: {apuesta.gananciasPotenciales} MXNB
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="ganadas" className="space-y-4 mt-6">
                {apuestasGanadas.map((apuesta) => (
                  <Card key={apuesta.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{apuesta.eventoNombre}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Apostaste por: <span className="font-medium">{apuesta.opcionNombre}</span>
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Cantidad: {apuesta.cantidad} MXNB</span>
                            <span>Cuota: {apuesta.cuota}x</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 border-green-200 mb-2">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ganada
                          </Badge>
                          <div className="text-sm space-y-1">
                            <div className="text-green-600 font-medium">
                              <TrendingUp className="w-4 h-4 inline mr-1" />+{apuesta.gananciasPotenciales} MXNB
                            </div>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 w-full"
                              onClick={() => manejarReclamarGanancias(apuesta.id)}
                              disabled={isWritePending || isConfirming || claimingBetId === apuesta.id}
                            >
                              {claimingBetId === apuesta.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Reclamando...
                                </>
                              ) : (
                                "Reclamar Ganancias"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="perdidas" className="space-y-4 mt-6">
                {apuestasPerdidas.map((apuesta) => (
                  <Card key={apuesta.id} className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{apuesta.eventoNombre}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Apostaste por: <span className="font-medium">{apuesta.opcionNombre}</span>
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Cantidad: {apuesta.cantidad} MXNB</span>
                            <span>Cuota: {apuesta.cuota}x</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="mb-2">
                            <XCircle className="w-3 h-3 mr-1" />
                            Perdida
                          </Badge>
                          <div className="text-sm text-red-600 font-medium">
                            <TrendingDown className="w-4 h-4 inline mr-1" />-{apuesta.cantidad} MXNB
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Label({
  children,
  className,
  ...props
}: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ""}`}
      {...props}
    >
      {children}
    </label>
  )
}
