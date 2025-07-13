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
  DollarSign,
  Key,
} from "lucide-react"
import { usePredictionMarket } from "@/hooks/use-prediction-market"
import { RegisterMenu } from "@/components/register-menu"
import { useUser } from "@/hooks/useUser"
import { UsernameSetupDialog } from "@/components/username-setup-dialog"
import { useAccount, useDisconnect } from "wagmi"
import { usePortalWallet } from "@/hooks/usePortalWallet"
import Image from "next/image"
import type { EventoApuesta } from "@/lib/types"
import { DebugInfo } from "@/components/debug-info"
import Link from "next/link"

export default function InicioPage() {
  const { disconnect } = useDisconnect()
  const { disconnect: disconnectPortal } = usePortalWallet()
  
  const {
    user,
    isConnected,
    needsUsernameSetup,
    showUsernameDialog,
    setUsername,
    closeUsernameDialog,
    showUsernameSetup,
    logout,
    getUserDisplay,
    isUserSetup,
    connectionType
  } = useUser()

  const {
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
    createMarket,
  } = usePredictionMarket()

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
    poolInicial: 1000,
  })

  // Usar eventos del contrato (ahora vacíos hasta que se creen)
  const eventosDisponibles = events

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
    {
      icon: Key,
      titulo: "Portal Wallet SDK",
      descripcion: "Utiliza wallets descentralizadas seguras con tecnología MPC avanzada",
    },
  ]

  const pasos = [
    "Conecta tu wallet compatible con Arbitrum o usa Portal Wallet",
    "Deposita MXNB en tu cuenta",
    "Elige un market y abre tu posición",
    "¡Gana y reclama tus recompensas!",
  ]

  // Función para desconectar y cerrar sesión
  const handleDisconnectAndLogout = () => {
    // Desconectar la wallet
    if (connectionType === 'Portal Wallet') {
      disconnectPortal()
    } else {
      disconnect()
    }
    
    // Cerrar sesión del usuario
    logout()
  }

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

  // Efecto para mostrar el diálogo de username cuando sea necesario
  useEffect(() => {
    if (isConnected && needsUsernameSetup && !showUsernameDialog) {
      // Pequeño delay para asegurar que la conexión esté completa
      const timer = setTimeout(() => {
        showUsernameSetup()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isConnected, needsUsernameSetup, showUsernameDialog, showUsernameSetup])

  const manejarPosicion = async () => {
    if (!eventoSeleccionado || !opcionSeleccionada || !cantidadPosicion) return

    setTxError("")

    try {
      await placeBet(eventoSeleccionado.id, opcionSeleccionada, cantidadPosicion)
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

  const manejarCrearMarket = async () => {
    if (!nuevoMarket.nombre || !nuevoMarket.pregunta || !nuevoMarket.fechaFin) {
      setTxError("Por favor completa todos los campos requeridos")
      return
    }

    setTxError("")

    try {
      await createMarket({
        nombre: nuevoMarket.nombre,
        descripcion: nuevoMarket.descripcion,
        pregunta: nuevoMarket.pregunta,
        categoria: nuevoMarket.categoria,
        fechaFin: nuevoMarket.fechaFin,
        poolInicial: nuevoMarket.poolInicial,
      })

      // Limpiar formulario
      setNuevoMarket({
        nombre: "",
        descripcion: "",
        pregunta: "",
        fechaFin: "",
        categoria: "general",
        poolInicial: 1000,
      })

      setCreateMarketOpen(false)
      refetchEvents()
    } catch (error: any) {
      console.error("Error al crear market:", error)
      setTxError(error.message || "Error al crear el market")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                La{" "}
                <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Kiniela
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                La primera plataforma de mercados de predicción descentralizada para Latinoamérica.
                Apuesta con MXNB y gana con la sabiduría de la multitud.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isConnected || !isUserSetup() ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <RegisterMenu size="lg" />
                    <Button variant="outline" size="lg" asChild>
                      <a href="#como-funciona">Cómo Funciona</a>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" onClick={() => setCreateMarketOpen(true)} className="bg-primary hover:bg-primary/90">
                      <Plus className="w-5 h-5 mr-2" />
                      Crear Market
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <a href="#como-funciona">Cómo Funciona</a>
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Mensaje de bienvenida para usuarios conectados */}
              {isConnected && isUserSetup() && (
                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-medium text-primary">
                      ¡Bienvenido {getUserDisplay()}!
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tu cuenta está configurada y lista para participar en los mercados de predicción.
                  </p>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Markets Activos</h3>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {eventosDisponibles.length} activos
                  </Badge>
                </div>
                {eventosDisponibles.length > 0 ? (
                  <div className="space-y-4">
                    {eventosDisponibles.slice(0, 3).map((evento) => (
                      <div key={evento.id} className="p-4 border border-primary/10 rounded-lg bg-primary/5">
                        <h4 className="font-medium text-foreground mb-2">{evento.nombre}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{evento.pregunta}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-primary font-medium">
                            Pool: {evento.opciones[0].cuota.toFixed(2)}x
                          </span>
                          <span className="text-muted-foreground">
                            {evento.opciones[0].probabilidad.toFixed(0)}% Sí
                          </span>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-primary/20 hover:bg-primary/10"
                      onClick={() => setDialogOpen(true)}
                    >
                      Ver todos los markets
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay markets activos en este momento</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              ¿Por qué elegir La Kiniela?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Construido sobre Arbitrum con tecnología de vanguardia para una experiencia segura y eficiente
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {caracteristicas.map((caracteristica, index) => (
              <Card key={index} className="border border-primary/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <caracteristica.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{caracteristica.titulo}</h3>
                  <p className="text-muted-foreground">{caracteristica.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="como-funciona" className="py-20 bg-gradient-to-br from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Cómo funciona La Kiniela
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comenzar es fácil y rápido. Sigue estos simples pasos para empezar a ganar
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pasos.map((paso, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {index + 1}
                </div>
                <p className="text-foreground font-medium">{paso}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Markets de Predicción</h2>
              <p className="text-muted-foreground">Participa en mercados de predicción y gana MXNB</p>
            </div>
            {isConnected && isUserSetup() && (
              <Button onClick={() => setCreateMarketOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Crear Market
              </Button>
            )}
          </div>

          {/* Filtros de categorías */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categorias.map((categoria) => (
              <Button
                key={categoria.id}
                variant={categoriaActiva === categoria.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoriaActiva(categoria.id)}
                className={
                  categoriaActiva === categoria.id
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border-primary/20 text-foreground hover:bg-primary/10"
                }
              >
                <categoria.icon className="w-4 h-4 mr-2" />
                {categoria.nombre}
              </Button>
            ))}
          </div>

          {/* Lista de eventos */}
          {eventosFiltrados.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventosFiltrados.map((evento) => (
                <Card key={evento.id} className="border border-primary/20 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-foreground">{evento.nombre}</CardTitle>
                        <CardDescription className="text-muted-foreground mt-2">
                          {evento.pregunta}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={evento.estado === "activo" ? "default" : "secondary"}
                        className={
                          evento.estado === "activo"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {evento.estado === "activo" ? "Activo" : "Finalizado"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-foreground">Sí</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{evento.opciones[0].cuota.toFixed(2)}x</div>
                          <div className="text-sm text-muted-foreground">{evento.opciones[0].probabilidad.toFixed(0)}%</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="font-medium text-foreground">No</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{evento.opciones[1].cuota.toFixed(2)}x</div>
                          <div className="text-sm text-muted-foreground">{evento.opciones[1].probabilidad.toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Fin: {new Date(evento.fechaFin).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Pool: {((evento.opciones[0].cuota + evento.opciones[1].cuota) / 2 * 100).toFixed(0)} MXNB</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        if (isConnected && isUserSetup()) {
                          setEventoSeleccionado(evento)
                          setDialogOpen(true)
                        }
                      }}
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={evento.estado !== "activo" || !isConnected || !isUserSetup()}
                    >
                      {evento.estado === "activo" ? 
                        (isConnected && isUserSetup() ? "Participar" : "Conecta tu wallet") : 
                        "Finalizado"
                      }
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No hay markets disponibles</h3>
              <p className="text-muted-foreground mb-6">
                {categoriaActiva === "todos"
                  ? "Aún no se han creado markets. ¡Sé el primero!"
                  : `No hay markets en la categoría "${categorias.find(c => c.id === categoriaActiva)?.nombre}"`
                }
              </p>
              {isConnected && isUserSetup() && categoriaActiva === "todos" && (
                <Button onClick={() => setCreateMarketOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Market
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Dialog para participar en evento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Participar en Market</DialogTitle>
            <DialogDescription>
              {eventoSeleccionado?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Pregunta</Label>
              <p className="text-sm text-muted-foreground mt-1">{eventoSeleccionado?.pregunta}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Selecciona tu predicción</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {eventoSeleccionado?.opciones.map((opcion) => (
                  <Button
                    key={opcion.id}
                    variant={opcionSeleccionada === opcion.id ? "default" : "outline"}
                    onClick={() => setOpcionSeleccionada(opcion.id)}
                    className={
                      opcionSeleccionada === opcion.id
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "border-primary/20 text-foreground hover:bg-primary/10"
                    }
                  >
                    <div className="text-center">
                      <div className="font-bold">{opcion.nombre}</div>
                      <div className="text-sm opacity-90">{opcion.cuota.toFixed(2)}x</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="cantidad" className="text-sm font-medium text-foreground">
                Cantidad MXNB
              </Label>
              <Input
                id="cantidad"
                type="number"
                placeholder="0.00"
                value={cantidadPosicion}
                onChange={(e) => setCantidadPosicion(e.target.value)}
                className="mt-1"
              />
              {cantidadPosicion && (
                <p className="text-sm text-muted-foreground mt-1">
                  Ganancia potencial: {calcularGananciaPotencial().toFixed(2)} MXNB
                </p>
              )}
            </div>
            {txError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{txError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={manejarPosicion}
              disabled={!opcionSeleccionada || !cantidadPosicion || isWritePending || isConfirming}
              className="bg-primary hover:bg-primary/90"
            >
              {(isWritePending || isConfirming) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isWritePending ? "Confirmando..." : isConfirming ? "Procesando..." : "Participar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear market */}
      <Dialog open={createMarketOpen} onOpenChange={setCreateMarketOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Market</DialogTitle>
            <DialogDescription>
              Crea un nuevo mercado de predicción para la comunidad
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre" className="text-sm font-medium text-foreground">
                Nombre del Market *
              </Label>
              <Input
                id="nombre"
                placeholder="Ej: Bitcoin $120K Septiembre 2024"
                value={nuevoMarket.nombre}
                onChange={(e) => setNuevoMarket({ ...nuevoMarket, nombre: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="descripcion" className="text-sm font-medium text-foreground">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción detallada del evento..."
                value={nuevoMarket.descripcion}
                onChange={(e) => setNuevoMarket({ ...nuevoMarket, descripcion: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pregunta" className="text-sm font-medium text-foreground">
                Pregunta de Predicción *
              </Label>
              <Input
                id="pregunta"
                placeholder="¿Bitcoin alcanzará $120,000 antes de septiembre 2024?"
                value={nuevoMarket.pregunta}
                onChange={(e) => setNuevoMarket({ ...nuevoMarket, pregunta: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="categoria" className="text-sm font-medium text-foreground">
                Categoría
              </Label>
              <select
                id="categoria"
                value={nuevoMarket.categoria}
                onChange={(e) => setNuevoMarket({ ...nuevoMarket, categoria: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="general">General</option>
                <option value="deportes">Deportes</option>
                <option value="cripto">Cripto</option>
                <option value="politica">Política</option>
              </select>
            </div>
            <div>
              <Label htmlFor="fechaFin" className="text-sm font-medium text-foreground">
                Fecha de Finalización *
              </Label>
              <Input
                id="fechaFin"
                type="date"
                value={nuevoMarket.fechaFin}
                onChange={(e) => setNuevoMarket({ ...nuevoMarket, fechaFin: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="poolInicial" className="text-sm font-medium text-foreground">
                Pool Inicial (MXNB)
              </Label>
              <Input
                id="poolInicial"
                type="number"
                placeholder="1000"
                value={nuevoMarket.poolInicial}
                onChange={(e) => setNuevoMarket({ ...nuevoMarket, poolInicial: Number(e.target.value) })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cantidad inicial que se reparte entre Sí/No (500 MXNB cada uno)
              </p>
            </div>
            {txError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{txError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateMarketOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={manejarCrearMarket}
              disabled={!nuevoMarket.nombre || !nuevoMarket.pregunta || !nuevoMarket.fechaFin}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Market
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de configuración de username - Solo aquí para evitar duplicaciones */}
      <UsernameSetupDialog
        isOpen={showUsernameDialog}
        onClose={closeUsernameDialog}
        onUsernameSet={setUsername}
      />

      {/* DebugInfo */}
      <DebugInfo />
    </div>
  )
}
