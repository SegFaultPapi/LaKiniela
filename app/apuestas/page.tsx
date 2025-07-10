"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Clock,
  Trophy,
  TrendingUp,
  Calendar,
  Target,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import type { EventoApuesta } from "@/lib/types"

export default function ApuestasPage() {
  const {
    isConnected,
    balance,
    events,
    allowance,
    isWritePending,
    isConfirming,
    isConfirmed,
    lastTxHash,
    placeBet,
    approveMXNB,
    refetchEvents,
  } = useWallet()

  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoApuesta | null>(null)
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string>("")
  const [cantidadApuesta, setCantidadApuesta] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [txError, setTxError] = useState<string>("")

  // Eventos de ejemplo (en producción vendrían del contrato)
  const eventosEjemplo: EventoApuesta[] = [
    {
      id: "1",
      nombre: "Copa América 2024 - Final",
      descripcion: "¿Quién ganará la final de la Copa América?",
      categoria: "deportes",
      estado: "activo",
      fechaFin: "2024-07-15",
      opciones: [
        { id: "1", nombre: "Argentina", cuota: 2.5, probabilidad: 40 },
        { id: "2", nombre: "Brasil", cuota: 3.2, probabilidad: 31 },
        { id: "3", nombre: "Uruguay", cuota: 4.1, probabilidad: 24 },
        { id: "4", nombre: "Colombia", cuota: 5.0, probabilidad: 20 },
      ],
    },
    {
      id: "2",
      nombre: "Precio Bitcoin Fin de Año",
      descripcion: "¿Bitcoin alcanzará $100,000 antes del 31 de diciembre?",
      categoria: "cripto",
      estado: "activo",
      fechaFin: "2024-12-31",
      opciones: [
        { id: "1", nombre: "Sí, alcanzará $100k", cuota: 1.8, probabilidad: 55 },
        { id: "2", nombre: "No, se mantendrá debajo", cuota: 2.1, probabilidad: 45 },
      ],
    },
    {
      id: "3",
      nombre: "Liga MX - Clásico Nacional",
      descripcion: "América vs Chivas - Resultado del partido",
      categoria: "deportes",
      estado: "activo",
      fechaFin: "2024-03-15",
      opciones: [
        { id: "1", nombre: "Gana América", cuota: 2.1, probabilidad: 47 },
        { id: "2", nombre: "Empate", cuota: 3.4, probabilidad: 29 },
        { id: "3", nombre: "Gana Chivas", cuota: 2.8, probabilidad: 35 },
      ],
    },
  ]

  // Usar eventos del contrato si están disponibles, sino usar ejemplos
  const eventosDisponibles = events.length > 0 ? events : eventosEjemplo

  const categorias = [
    { id: "todos", nombre: "Todos", icon: Target },
    { id: "deportes", nombre: "Deportes", icon: Trophy },
    { id: "cripto", nombre: "Cripto", icon: TrendingUp },
    { id: "politica", nombre: "Política", icon: Calendar },
  ]

  const [categoriaActiva, setCategoriaActiva] = useState("todos")

  const eventosFiltrados =
    categoriaActiva === "todos"
      ? eventosDisponibles
      : eventosDisponibles.filter((evento) => evento.categoria === categoriaActiva)

  // Verificar si necesita aprobación
  useEffect(() => {
    if (cantidadApuesta && Number.parseFloat(cantidadApuesta) > 0) {
      const cantidadFloat = Number.parseFloat(cantidadApuesta)
      const allowanceFloat = Number.parseFloat(allowance)
      setNeedsApproval(cantidadFloat > allowanceFloat)
    }
  }, [cantidadApuesta, allowance])

  // Manejar confirmación de transacción
  useEffect(() => {
    if (isConfirmed) {
      setDialogOpen(false)
      setEventoSeleccionado(null)
      setOpcionSeleccionada("")
      setCantidadApuesta("")
      setTxError("")
      refetchEvents()
    }
  }, [isConfirmed, refetchEvents])

  const manejarApuesta = async () => {
    if (!eventoSeleccionado || !opcionSeleccionada || !cantidadApuesta) return

    setTxError("")

    try {
      if (needsApproval) {
        // Primero aprobar tokens
        await approveMXNB(cantidadApuesta)
      } else {
        // Realizar apuesta directamente
        await placeBet(eventoSeleccionado.id, opcionSeleccionada, cantidadApuesta)
      }
    } catch (error: any) {
      console.error("Error en transacción:", error)
      setTxError(error.message || "Error al procesar la transacción")
    }
  }

  const calcularGananciaPotencial = () => {
    if (!eventoSeleccionado || !opcionSeleccionada || !cantidadApuesta) return 0

    const opcion = eventoSeleccionado.opciones.find((o) => o.id === opcionSeleccionada)
    if (!opcion) return 0

    return Number.parseFloat(cantidadApuesta) * opcion.cuota
  }

  const getArbitrumExplorerUrl = (hash: string) => {
    return `https://arbiscan.io/tx/${hash}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Eventos de Apuestas</h1>
        <p className="text-gray-600">Explora los eventos disponibles y realiza tus apuestas con MXNB</p>

        {/* Estado de la conexión */}
        {isConnected && (
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
            <span className="text-gray-600">Balance: {balance} MXNB</span>
            {events.length > 0 && <span className="text-gray-600">{events.length} eventos desde contrato</span>}
          </div>
        )}
      </div>

      {/* Alerta de transacción en progreso */}
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

      {/* Alerta de éxito */}
      {isConfirmed && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ¡Transacción confirmada exitosamente!
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

      {/* Error de transacción */}
      {txError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{txError}</AlertDescription>
        </Alert>
      )}

      {/* Filtros por Categoría */}
      <Tabs value={categoriaActiva} onValueChange={setCategoriaActiva} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          {categorias.map((categoria) => {
            const Icon = categoria.icon
            return (
              <TabsTrigger key={categoria.id} value={categoria.id} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{categoria.nombre}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={categoriaActiva} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map((evento) => (
              <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{evento.nombre}</CardTitle>
                      <CardDescription>{evento.descripcion}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {evento.categoria}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Clock className="w-4 h-4 mr-1" />
                    Termina: {new Date(evento.fechaFin).toLocaleDateString("es-ES")}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    {evento.opciones.slice(0, 3).map((opcion) => (
                      <div key={opcion.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm">{opcion.nombre}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {opcion.cuota}x
                          </Badge>
                          <span className="text-xs text-gray-500">{opcion.probabilidad}%</span>
                        </div>
                      </div>
                    ))}
                    {evento.opciones.length > 3 && (
                      <div className="text-center text-sm text-gray-500">
                        +{evento.opciones.length - 3} opciones más
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => setEventoSeleccionado(evento)}
                        disabled={!isConnected || isWritePending || isConfirming}
                      >
                        {!isConnected ? "Conecta tu Wallet" : "Apostar Ahora"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{evento.nombre}</DialogTitle>
                        <DialogDescription>Selecciona tu opción y cantidad para apostar</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Selección de Opción */}
                        <div>
                          <Label className="text-sm font-medium">Selecciona tu predicción:</Label>
                          <div className="space-y-2 mt-2">
                            {evento.opciones.map((opcion) => (
                              <div
                                key={opcion.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  opcionSeleccionada === opcion.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => setOpcionSeleccionada(opcion.id)}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{opcion.nombre}</span>
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    {opcion.cuota}x
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cantidad a Apostar */}
                        <div>
                          <Label htmlFor="cantidad" className="text-sm font-medium">
                            Cantidad (MXNB)
                          </Label>
                          <Input
                            id="cantidad"
                            type="number"
                            placeholder="0.00"
                            value={cantidadApuesta}
                            onChange={(e) => setCantidadApuesta(e.target.value)}
                            className="mt-1"
                            min="0"
                            step="0.01"
                            disabled={isWritePending || isConfirming}
                          />
                          <div className="text-xs text-gray-500 mt-1">Balance disponible: {balance} MXNB</div>
                          {needsApproval && cantidadApuesta && (
                            <div className="text-xs text-yellow-600 mt-1">
                              ⚠️ Necesitas aprobar {cantidadApuesta} MXNB primero
                            </div>
                          )}
                        </div>

                        {/* Resumen */}
                        {cantidadApuesta && opcionSeleccionada && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Cantidad apostada:</span>
                                <span className="font-medium">{cantidadApuesta} MXNB</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Ganancia potencial:</span>
                                <span className="font-medium text-green-600">
                                  {calcularGananciaPotencial().toFixed(2)} MXNB
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={manejarApuesta}
                          disabled={!opcionSeleccionada || !cantidadApuesta || isWritePending || isConfirming}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {isWritePending || isConfirming ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {needsApproval ? "Aprobando..." : "Procesando..."}
                            </>
                          ) : needsApproval ? (
                            "Aprobar MXNB"
                          ) : (
                            "Confirmar Apuesta"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Mensaje si no hay wallet conectado */}
      {!isConnected && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="text-center py-8">
            <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conecta tu Wallet para Apostar</h3>
            <p className="text-gray-600 mb-4">
              Necesitas conectar tu wallet para poder realizar apuestas en los eventos.
            </p>
            <ConnectButton label="Conectar Wallet" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
