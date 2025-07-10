"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
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
  TrendingUp,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
  Wallet,
  Clock,
  Calendar,
  Target,
  Loader2,
  AlertCircle,
  ExternalLink,
  BarChart3,
  Plus,
  HelpCircle,
} from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Image from "next/image"
import type { EventoApuesta } from "@/lib/types"

export default function InicioPage() {
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
  const [cantidadPosicion, setCantidadPosicion] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createMarketOpen, setCreateMarketOpen] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [txError, setTxError] = useState<string>("")

  // Estados para crear market
  const [nuevoMarket, setNuevoMarket] = useState({
    nombre: "",
    descripcion: "",
    pregunta: "",
    fechaFin: "",
    categoria: "general",
    cuotaSi: 2.0,
    cuotaNo: 2.0,
  })

  // Eventos de ejemplo con formato Sí/No
  const eventosEjemplo: EventoApuesta[] = [
    {
      id: "1",
      nombre: "Bitcoin $120K Septiembre 2024",
      descripcion: "Predicción sobre el precio de Bitcoin",
      pregunta: "¿Bitcoin alcanzará $120,000 antes de septiembre 2024?",
      categoria: "cripto",
      estado: "activo",
      fechaFin: "2024-09-01",
      opciones: [
        { id: "si", nombre: "Sí", cuota: 2.3, probabilidad: 43 },
        { id: "no", nombre: "No", cuota: 1.7, probabilidad: 57 },
      ],
    },
    {
      id: "2",
      nombre: "Copa América 2024 - Argentina Campeón",
      descripcion: "Predicción sobre el ganador de la Copa América",
      pregunta: "¿Argentina ganará la Copa América 2024?",
      categoria: "deportes",
      estado: "activo",
      fechaFin: "2024-07-15",
      opciones: [
        { id: "si", nombre: "Sí", cuota: 1.8, probabilidad: 55 },
        { id: "no", nombre: "No", cuota: 2.1, probabilidad: 45 },
      ],
    },
    {
      id: "3",
      nombre: "Elecciones México 2024",
      descripcion: "Predicción sobre las elecciones presidenciales",
      pregunta: "¿MORENA ganará las elecciones presidenciales de México 2024?",
      categoria: "politica",
      estado: "activo",
      fechaFin: "2024-06-02",
      opciones: [
        { id: "si", nombre: "Sí", cuota: 1.4, probabilidad: 70 },
        { id: "no", nombre: "No", cuota: 2.8, probabilidad: 30 },
      ],
    },
    {
      id: "4",
      nombre: "Liga MX Clausura 2024",
      descripcion: "Predicción sobre el campeón del torneo",
      pregunta: "¿América será campeón del Clausura 2024?",
      categoria: "deportes",
      estado: "activo",
      fechaFin: "2024-05-30",
      opciones: [
        { id: "si", nombre: "Sí", cuota: 3.2, probabilidad: 31 },
        { id: "no", nombre: "No", cuota: 1.4, probabilidad: 69 },
      ],
    },
    {
      id: "5",
      nombre: "Ethereum $5K 2024",
      descripcion: "Predicción sobre el precio de Ethereum",
      pregunta: "¿Ethereum alcanzará $5,000 en 2024?",
      categoria: "cripto",
      estado: "activo",
      fechaFin: "2024-12-31",
      opciones: [
        { id: "si", nombre: "Sí", cuota: 2.5, probabilidad: 40 },
        { id: "no", nombre: "No", cuota: 1.6, probabilidad: 60 },
      ],
    },
  ]

  // Usar eventos del contrato si están disponibles, sino usar ejemplos
  const eventosDisponibles = events.length > 0 ? events : eventosEjemplo

  const categorias = [
    { id: "todos", nombre: "Todos", icon: Target },
    { id: "deportes", nombre: "Deportes", icon: BarChart3 },
    { id: "cripto", nombre: "Cripto", icon: TrendingUp },
    { id: "politica", nombre: "Política", icon: Calendar },
    { id: "general", nombre: "General", icon: HelpCircle },
  ]

  const [categoriaActiva, setCategoriaActiva] = useState("todos")

  const eventosFiltrados =
    categoriaActiva === "todos"
      ? eventosDisponibles
      : eventosDisponibles.filter((evento) => evento.categoria === categoriaActiva)

  const caracteristicas = [
    {
      icon: Shield,
      titulo: "Seguro y Descentralizado",
      descripcion: "Tus fondos están protegidos por contratos inteligentes en Arbitrum",
    },
    {
      icon: Zap,
      titulo: "Transacciones Rápidas",
      descripcion: "Abre posiciones y recibe ganancias al instante con bajas comisiones",
    },
    {
      icon: Globe,
      titulo: "Para Latinoamérica",
      descripcion: "Diseñado específicamente para la comunidad latina con MXNB",
    },
  ]

  const pasos = [
    "Conecta tu wallet compatible con Arbitrum",
    "Deposita MXNB en tu cuenta",
    "Elige un market y abre tu posición",
    "¡Gana y reclama tus recompensas!",
  ]

  // Verificar si necesita aprobación
  useEffect(() => {
    if (cantidadPosicion && Number.parseFloat(cantidadPosicion) > 0) {
      const cantidadFloat = Number.parseFloat(cantidadPosicion)
      const allowanceFloat = Number.parseFloat(allowance)
      setNeedsApproval(cantidadFloat > allowanceFloat)
    }
  }, [cantidadPosicion, allowance])

  // Manejar confirmación de transacción
  useEffect(() => {
    if (isConfirmed) {
      setDialogOpen(false)
      setEventoSeleccionado(null)
      setOpcionSeleccionada("")
      setCantidadPosicion("")
      setTxError("")
      refetchEvents()
    }
  }, [isConfirmed, refetchEvents])

  const manejarPosicion = async () => {
    if (!eventoSeleccionado || !opcionSeleccionada || !cantidadPosicion) return

    setTxError("")

    try {
      if (needsApproval) {
        // Primero aprobar tokens
        await approveMXNB(cantidadPosicion)
      } else {
        // Realizar posición directamente
        await placeBet(eventoSeleccionado.id, opcionSeleccionada, cantidadPosicion)
      }
    } catch (error: any) {
      console.error("Error en transacción:", error)
      setTxError(error.message || "Error al procesar la transacción")
    }
  }

  const calcularGananciaPotencial = () => {
    if (!eventoSeleccionado || !opcionSeleccionada || !cantidadPosicion) return 0

    const opcion = eventoSeleccionado.opciones.find((o) => o.id === opcionSeleccionada)
    if (!opcion) return 0

    return Number.parseFloat(cantidadPosicion) * opcion.cuota
  }

  const getArbitrumExplorerUrl = (hash: string) => {
    return `https://arbiscan.io/tx/${hash}`
  }

  const manejarCrearMarket = () => {
    // Aquí se implementaría la lógica para crear un nuevo market
    console.log("Crear market:", nuevoMarket)
    setCreateMarketOpen(false)
    // Reset form
    setNuevoMarket({
      nombre: "",
      descripcion: "",
      pregunta: "",
      fechaFin: "",
      categoria: "general",
      cuotaSi: 2.0,
      cuotaNo: 2.0,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center bg-primary/20 text-foreground px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/30">
                <div className="relative w-5 h-5 mr-2">
                  <Image src="/la-kiniela-logo.png" alt="La Kiniela" fill className="object-contain" />
                </div>
                Plataforma Web3 de Markets
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Bienvenido a <span className="text-primary">La Kiniela</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                La primera plataforma de markets descentralizados para Latinoamérica. Participa en deportes, política,
                cripto y más usando MXNB en la red Arbitrum.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isConnected ? (
                <div className="flex flex-col items-center space-y-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg shadow-lg">
                    Explorar Markets
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <ConnectButton label="Conectar Wallet" />
                  <p className="text-sm text-muted-foreground">Conecta tu wallet para comenzar a participar</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Estado de conexión */}
        {isConnected && (
          <section className="py-8">
            <Card className="bg-green-50 border-green-200 max-w-2xl mx-auto shadow-lg">
              <CardContent className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">¡Wallet Conectado!</h3>
                <p className="text-green-600 mb-4">
                  Tu wallet está conectado y listo para participar. Hay {eventosDisponibles.length} markets activos
                  disponibles.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Markets Section - Solo visible cuando está conectado */}
        {isConnected && (
          <section className="py-16">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Markets Activos</h2>
                <p className="text-muted-foreground">Explora los markets disponibles y abre tus posiciones con MXNB</p>

                {/* Estado de la conexión */}
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                  <span className="text-muted-foreground">Balance: {balance} MXNB</span>
                  {events.length > 0 && (
                    <span className="text-muted-foreground">{events.length} markets desde contrato</span>
                  )}
                </div>
              </div>

              {/* Botón para crear market */}
              <Dialog open={createMarketOpen} onOpenChange={setCreateMarketOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Market
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-white border border-primary/20">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">Crear Nuevo Market</DialogTitle>
                    <DialogDescription className="text-card-foreground/70">
                      Crea un market de predicción con opciones Sí/No
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre" className="text-sm font-medium text-card-foreground">
                        Nombre del Market
                      </Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Bitcoin $120K Septiembre 2024"
                        value={nuevoMarket.nombre}
                        onChange={(e) => setNuevoMarket({ ...nuevoMarket, nombre: e.target.value })}
                        className="mt-1 border-primary/20 focus:border-primary bg-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pregunta" className="text-sm font-medium text-card-foreground">
                        Pregunta (Sí/No)
                      </Label>
                      <Input
                        id="pregunta"
                        placeholder="¿Bitcoin alcanzará $120,000 antes de septiembre 2024?"
                        value={nuevoMarket.pregunta}
                        onChange={(e) => setNuevoMarket({ ...nuevoMarket, pregunta: e.target.value })}
                        className="mt-1 border-primary/20 focus:border-primary bg-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="descripcion" className="text-sm font-medium text-card-foreground">
                        Descripción
                      </Label>
                      <Textarea
                        id="descripcion"
                        placeholder="Descripción detallada del market..."
                        value={nuevoMarket.descripcion}
                        onChange={(e) => setNuevoMarket({ ...nuevoMarket, descripcion: e.target.value })}
                        className="mt-1 border-primary/20 focus:border-primary bg-white"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="categoria" className="text-sm font-medium text-card-foreground">
                          Categoría
                        </Label>
                        <select
                          id="categoria"
                          value={nuevoMarket.categoria}
                          onChange={(e) => setNuevoMarket({ ...nuevoMarket, categoria: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border border-primary/20 rounded-md focus:border-primary bg-white text-card-foreground"
                        >
                          <option value="general">General</option>
                          <option value="deportes">Deportes</option>
                          <option value="cripto">Cripto</option>
                          <option value="politica">Política</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="fechaFin" className="text-sm font-medium text-card-foreground">
                          Fecha Límite
                        </Label>
                        <Input
                          id="fechaFin"
                          type="date"
                          value={nuevoMarket.fechaFin}
                          onChange={(e) => setNuevoMarket({ ...nuevoMarket, fechaFin: e.target.value })}
                          className="mt-1 border-primary/20 focus:border-primary bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cuotaSi" className="text-sm font-medium text-card-foreground">
                          Cuota "Sí"
                        </Label>
                        <Input
                          id="cuotaSi"
                          type="number"
                          step="0.1"
                          min="1.1"
                          value={nuevoMarket.cuotaSi}
                          onChange={(e) =>
                            setNuevoMarket({ ...nuevoMarket, cuotaSi: Number.parseFloat(e.target.value) })
                          }
                          className="mt-1 border-primary/20 focus:border-primary bg-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cuotaNo" className="text-sm font-medium text-card-foreground">
                          Cuota "No"
                        </Label>
                        <Input
                          id="cuotaNo"
                          type="number"
                          step="0.1"
                          min="1.1"
                          value={nuevoMarket.cuotaNo}
                          onChange={(e) =>
                            setNuevoMarket({ ...nuevoMarket, cuotaNo: Number.parseFloat(e.target.value) })
                          }
                          className="mt-1 border-primary/20 focus:border-primary bg-white"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Nota:</strong> Una vez creado, el market estará disponible para que otros usuarios
                        participen. Las cuotas pueden ajustarse automáticamente según la demanda.
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={manejarCrearMarket}
                      disabled={!nuevoMarket.nombre || !nuevoMarket.pregunta || !nuevoMarket.fechaFin}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Crear Market
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 bg-white border border-primary/20">
                {categorias.map((categoria) => {
                  const Icon = categoria.icon
                  return (
                    <TabsTrigger
                      key={categoria.id}
                      value={categoria.id}
                      className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{categoria.nombre}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value={categoriaActiva} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventosFiltrados.map((evento) => (
                    <Card
                      key={evento.id}
                      className="hover:shadow-lg transition-shadow border border-primary/20 bg-white"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 text-card-foreground">{evento.nombre}</CardTitle>
                            <CardDescription className="text-card-foreground/70 mb-3">
                              {evento.descripcion}
                            </CardDescription>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium text-blue-800">{evento.pregunta}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
                            {evento.categoria}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-card-foreground/60 mt-2">
                          <Clock className="w-4 h-4 mr-1" />
                          Termina: {new Date(evento.fechaFin).toLocaleDateString("es-ES")}
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {evento.opciones.map((opcion) => (
                            <div
                              key={opcion.id}
                              className={`p-3 rounded-lg border transition-colors ${
                                opcion.id === "si" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-bold text-lg mb-1 text-card-foreground">{opcion.nombre}</div>
                                <Badge
                                  variant="outline"
                                  className={
                                    opcion.id === "si"
                                      ? "text-green-700 border-green-600 bg-green-100"
                                      : "text-red-700 border-red-600 bg-red-100"
                                  }
                                >
                                  {opcion.cuota}x
                                </Badge>
                                <div className="text-xs text-card-foreground/60 mt-1">{opcion.probabilidad}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full bg-primary hover:bg-primary/90 text-white shadow-md"
                              onClick={() => setEventoSeleccionado(evento)}
                              disabled={!isConnected || isWritePending || isConfirming}
                            >
                              {!isConnected ? "Conecta tu Wallet" : "Abrir Posición"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-white border border-primary/20">
                            <DialogHeader>
                              <DialogTitle className="text-card-foreground">{evento.nombre}</DialogTitle>
                              <DialogDescription className="text-card-foreground/70">
                                {evento.pregunta}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              {/* Selección de Opción */}
                              <div>
                                <Label className="text-sm font-medium text-card-foreground">
                                  Selecciona tu predicción:
                                </Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  {evento.opciones.map((opcion) => (
                                    <div
                                      key={opcion.id}
                                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                        opcionSeleccionada === opcion.id
                                          ? "border-primary bg-primary/10"
                                          : opcion.id === "si"
                                            ? "border-green-200 hover:border-green-400 bg-green-50"
                                            : "border-red-200 hover:border-red-400 bg-red-50"
                                      }`}
                                      onClick={() => setOpcionSeleccionada(opcion.id)}
                                    >
                                      <div className="text-center">
                                        <div className="font-bold text-lg mb-2 text-card-foreground">
                                          {opcion.nombre}
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className={
                                            opcion.id === "si"
                                              ? "text-green-700 border-green-600 bg-green-100"
                                              : "text-red-700 border-red-600 bg-red-100"
                                          }
                                        >
                                          {opcion.cuota}x
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Cantidad a Apostar */}
                              <div>
                                <Label htmlFor="cantidad" className="text-sm font-medium text-card-foreground">
                                  Cantidad (MXNB)
                                </Label>
                                <Input
                                  id="cantidad"
                                  type="number"
                                  placeholder="0.00"
                                  value={cantidadPosicion}
                                  onChange={(e) => setCantidadPosicion(e.target.value)}
                                  className="mt-1 border-primary/20 focus:border-primary bg-white"
                                  min="0"
                                  step="0.01"
                                  disabled={isWritePending || isConfirming}
                                />
                                <div className="text-xs text-card-foreground/60 mt-1">
                                  Balance disponible: {balance} MXNB
                                </div>
                                {needsApproval && cantidadPosicion && (
                                  <div className="text-xs text-yellow-600 mt-1">
                                    ⚠️ Necesitas aprobar {cantidadPosicion} MXNB primero
                                  </div>
                                )}
                              </div>

                              {/* Resumen */}
                              {cantidadPosicion && opcionSeleccionada && (
                                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                                  <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-card-foreground/70">Cantidad de posición:</span>
                                      <span className="font-medium text-card-foreground">{cantidadPosicion} MXNB</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-card-foreground/70">Ganancia potencial:</span>
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
                                onClick={manejarPosicion}
                                disabled={!opcionSeleccionada || !cantidadPosicion || isWritePending || isConfirming}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                              >
                                {isWritePending || isConfirming ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {needsApproval ? "Aprobando..." : "Procesando..."}
                                  </>
                                ) : needsApproval ? (
                                  "Aprobar MXNB"
                                ) : (
                                  "Confirmar Posición"
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
          </section>
        )}

        {/* Características - Solo visible cuando NO está conectado */}
        {!isConnected && (
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">¿Por qué elegir La Kiniela?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nuestra plataforma combina la seguridad de blockchain con la facilidad de uso que necesitas para
                participar de forma inteligente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {caracteristicas.map((caracteristica, index) => {
                const Icon = caracteristica.icon
                return (
                  <Card
                    key={index}
                    className="text-center hover:shadow-lg transition-shadow border border-primary/20 bg-white"
                  >
                    <CardHeader>
                      <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-primary/20">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl text-card-foreground">{caracteristica.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-card-foreground/70">
                        {caracteristica.descripcion}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Cómo Funciona - Solo visible cuando NO está conectado */}
        {!isConnected && (
          <section className="py-16 bg-white rounded-2xl shadow-lg border border-primary/20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-card-foreground mb-4">¿Cómo funciona?</h2>
              <p className="text-card-foreground/70 max-w-2xl mx-auto">
                Comenzar a participar en La Kiniela es muy sencillo. Sigue estos pasos:
              </p>
            </div>

            <div className="max-w-3xl mx-auto px-6">
              <div className="space-y-6">
                {pasos.map((paso, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg text-card-foreground">{paso}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="space-y-4">
                <ConnectButton label="Comenzar Ahora" />
                <p className="text-sm text-card-foreground/60">
                  <Wallet className="w-4 h-4 inline mr-1" />
                  Necesitas una wallet compatible con Arbitrum
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Stats en tiempo real */}
        <section className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-md border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">
                {isConnected ? eventosDisponibles.length : "---"}
              </div>
              <div className="text-card-foreground/70">Markets Activos</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">Arbitrum</div>
              <div className="text-card-foreground/70">Red Blockchain</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">MXNB</div>
              <div className="text-card-foreground/70">Token de Posiciones</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">Sí/No</div>
              <div className="text-card-foreground/70">Formato Simple</div>
            </div>
          </div>
        </section>

        {/* Información de red */}
        <section className="py-8">
          <Card className="bg-primary/10 border-primary/20 shadow-lg">
            <CardContent className="text-center py-6">
              <h3 className="text-lg font-semibold text-primary mb-2">Información de Red</h3>
              <p className="text-muted-foreground text-sm">
                La Kiniela funciona en la red Arbitrum. Asegúrate de tener tu wallet configurada para Arbitrum y tener
                MXNB para abrir posiciones.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
