"use client"

import { useState, useEffect, useCallback } from "react"
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
  AlertCircle,
  FileText,
  Users,
  BarChart3,
  Download,
  Upload,
  Plus,
  Home,
  Search,
  Settings,
  User,
  LogOut,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  Image as ImageIcon,
  Key,
  DollarSign,
  Loader2,
} from "lucide-react"
import { usePredictionMarketV2 } from "@/hooks/use-prediction-market-v2"
import { RegisterMenu } from "@/components/register-menu"
import { MarketAdminControls } from "@/components/market-admin-controls"
import { useUser } from "@/hooks/useUser"
import { UsernameSetupDialog } from "@/components/username-setup-dialog"
import { useAccount, useDisconnect } from "wagmi"
import { usePortalWallet } from "@/hooks/usePortalWallet"
import Image from "next/image"
import type { EventoApuesta } from "@/lib/types"
import Link from "next/link"
import { ImageUpload } from "@/components/image-upload"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useToast } from "@/hooks/use-toast"
import { MarketImageStorage } from "@/lib/market-images"
import { CONTRACTS } from "@/lib/contracts-config"

export default function InicioPage() {
  const { disconnect } = useDisconnect()
  const { disconnect: disconnectPortal } = usePortalWallet()
  const { toast } = useToast()

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
    marketCount,
    hasInfiniteAllowance,
    isWritePending,
    isConfirming,
    isConfirmed,
    lastTxHash,
    buySharesWithAllowance,
    approveInfiniteMXNB,
    refetchMarketCount,
    refetchBalance, // Agregar refetch del balance
    createMarket,
    events, // Ya viene del hook v2
    markets, // Markets directos del hook
    loadingMarkets, // Estado de carga
    loadAllMarkets, // Función para recargar markets
  } = usePredictionMarketV2()

  const { address, chainId } = useAccount()

  // Estados para trackear tipos de transacciones
  const [currentTxType, setCurrentTxType] = useState<'approval' | 'market_creation' | 'participation' | null>(null)

  // Debug: Mostrar información en consola
  useEffect(() => {
    console.log("=== DEBUG INFO ===")
    console.log("Balance:", balance)
    console.log("Market Count:", marketCount)
    console.log("Markets Array:", markets)
    console.log("Events Array:", events)
    console.log("Loading Markets:", loadingMarkets)
    console.log("Has Infinite Allowance:", hasInfiniteAllowance)
    console.log("Address:", address)
    console.log("Is Connected:", isConnected)
    console.log("Chain ID:", chainId)
    console.log("==================")
  }, [balance, marketCount, markets, events, loadingMarkets, hasInfiniteAllowance, address, isConnected, chainId])

  // Función específica para diagnosticar balance MXNB
  const diagnosticarBalanceMXNB = useCallback(async () => {
    if (!address || !isConnected) {
      console.log("❌ No hay wallet conectada")
      return
    }

    console.log("🔍 DIAGNÓSTICO BALANCE MXNB")
    console.log("Wallet Address:", address)
    console.log("Token MXNB Address:", "0x82B9e52b26A2954E113F94Ff26647754d5a4247D")
    console.log("Chain ID actual:", chainId)
    console.log("Esperado Chain ID:", 421614)

    try {
      // Importar viem para hacer llamada directa
      const { createPublicClient, http } = await import('viem')
      const { arbitrumSepolia } = await import('viem/chains')
      
      const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http()
      })

      // Llamada directa al balance
      const balanceRaw = await client.readContract({
        address: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D",
        abi: [
          {
            name: "balanceOf",
            type: "function",
            stateMutability: "view", 
            inputs: [{ name: "account", type: "address" }],
            outputs: [{ name: "", type: "uint256" }],
          }
        ],
        functionName: "balanceOf",
        args: [address]
      })

      console.log("✅ Balance Raw (BigInt):", balanceRaw)
      console.log("✅ Balance Formateado:", Number(balanceRaw) / 1e18, "MXNB")

      // Verificar también info del token
      const tokenName = await client.readContract({
        address: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D",
        abi: [
          {
            name: "name",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "string" }],
          }
        ],
        functionName: "name"
      })

      const tokenSymbol = await client.readContract({
        address: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D", 
        abi: [
          {
            name: "symbol",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "string" }],
          }
        ],
        functionName: "symbol"
      })

      console.log("✅ Token Name:", tokenName)
      console.log("✅ Token Symbol:", tokenSymbol)

    } catch (error) {
      console.error("❌ Error leyendo balance MXNB:", error)
    }
  }, [address, isConnected, chainId])

  // Función para refrescar todo manualmente
  const refrescarTodo = useCallback(() => {
    console.log("🔄 Refrescando datos...")
    refetchBalance()
    refetchMarketCount()
    loadAllMarkets()
    // También ejecutar diagnóstico
    diagnosticarBalanceMXNB()
  }, [refetchBalance, refetchMarketCount, loadAllMarkets, diagnosticarBalanceMXNB])

  // Mapear a nombres compatibles con el código existente (simplificado)
  const allowance = hasInfiniteAllowance ? "999999999999999999999999999" : "0"
  const placeBet = async (eventId: string, optionId: string, amount: string) => {
    console.log("🎯 placeBet llamado con:", { eventId, optionId, amount })
    
    // Validar y convertir marketId
    const marketId = parseInt(eventId)
    if (isNaN(marketId) || marketId < 0) {
      throw new Error(`Event ID inválido: ${eventId}`)
    }
    
    const isOptionA = optionId === "si" || optionId === "option_a"
    
    console.log("🎯 Participando en market:", { 
      originalEventId: eventId,
      marketId, 
      isOptionA, 
      amount,
      marketCount
    })
    
    // Verificar que el market existe
    if (marketCount && marketId >= marketCount) {
      throw new Error(`Market ${marketId} no existe. Solo hay ${marketCount} markets.`)
    }
    
    const result = await buySharesWithAllowance(marketId, isOptionA, amount)
    
    if (!result.success) {
      throw new Error(result.step)
    }
    
    console.log("✅ Participación exitosa:", result.step)
    return result.hash
  }
  const approveMXNB = approveInfiniteMXNB
  const refetchEvents = refetchMarketCount

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
    imagen: "",
  })
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Usar eventos del contrato (ahora vacíos hasta que se creen)
  const eventosDisponibles = events

  const categorias = [
    { id: "todos", nombre: "Todos", icon: BarChart3 },
    { id: "deportes", nombre: "Deportes", icon: BarChart3 },
    { id: "cripto", nombre: "Cripto", icon: TrendingUp },
    { id: "politica", nombre: "Política", icon: Calendar },
    { id: "general", nombre: "General", icon: Users },
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
    if (isConfirmed && lastTxHash) {
      console.log("✅ Transacción confirmada:", lastTxHash)
      
      // Mostrar notificación específica según el tipo de transacción
      if (currentTxType === 'approval') {
        toast({
          title: "🎉 ¡Aprobación Exitosa!",
          description: `Los tokens MXNB han sido aprobados. Transacción: ${lastTxHash.slice(0, 10)}... - Ver en: https://sepolia.arbiscan.io/tx/${lastTxHash}`,
          duration: 8000,
        })
      } else if (currentTxType === 'market_creation') {
        toast({
          title: "🚀 ¡Market Creado Exitosamente!",
          description: `Tu nuevo mercado de predicción ha sido creado. Transacción: ${lastTxHash.slice(0, 10)}... - Ver en: https://sepolia.arbiscan.io/tx/${lastTxHash}`,
          duration: 8000,
        })
        // Refrescar la lista de markets
        setTimeout(() => {
          refetchMarketCount()
          loadAllMarkets()
        }, 2000)
      } else if (currentTxType === 'participation') {
        toast({
          title: "💰 ¡Participación Exitosa!",
          description: `Tu apuesta ha sido registrada correctamente. ¡Buena suerte! Transacción: ${lastTxHash.slice(0, 10)}... - Ver en: https://sepolia.arbiscan.io/tx/${lastTxHash}`,
          duration: 8000,
        })
        // Refrescar balance y cerrar modal
        setTimeout(() => {
          refetchBalance()
          setDialogOpen(false)
          setEventoSeleccionado(null)
          setOpcionSeleccionada("")
          setCantidadPosicion("")
        }, 2000)
      }
      
      // Resetear el tipo de transacción y limpiar errores
      setCurrentTxType(null)
      setTxError("")
      
      // Refrescar datos generales
      setTimeout(() => {
        refetchBalance()
      }, 3000)
    }
  }, [isConfirmed, lastTxHash, currentTxType, toast, refetchBalance, refetchMarketCount, loadAllMarkets])

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

  // Toast de bienvenida cuando el usuario está completamente configurado
  useEffect(() => {
    if (isConnected && isUserSetup() && balance && marketCount !== undefined) {
      const welcomeShown = sessionStorage.getItem('welcome-toast-shown')
      if (!welcomeShown) {
        setTimeout(() => {
          toast({
            title: "🎉 ¡Bienvenido a La Kiniela!",
            description: `¡Hola ${getUserDisplay()}! Tu cuenta está lista. Balance: ${balance} MXNB | Markets disponibles: ${marketCount}`,
            duration: 5000,
          })
          sessionStorage.setItem('welcome-toast-shown', 'true')
        }, 1000)
      }
    }
  }, [isConnected, isUserSetup, balance, marketCount, toast, getUserDisplay])

  // Efecto para limpiar imágenes antiguas al cargar la página
  useEffect(() => {
    MarketImageStorage.cleanupOldImages()
  }, [])

  const manejarPosicion = async () => {
    if (!eventoSeleccionado || !opcionSeleccionada || !cantidadPosicion) return

    setTxError("")

    try {
      // Intentar participar directamente
      console.log("🎯 Intentando participar en market")
      console.log("🔍 Estado actual - hasInfiniteAllowance:", hasInfiniteAllowance)
      
      // Establecer el tipo de transacción
      setCurrentTxType('participation')
      
      const buyHash = await placeBet(eventoSeleccionado.id, opcionSeleccionada, cantidadPosicion)
      
      if (buyHash) {
        setTxError("⏳ Transacción enviada, esperando confirmación...")
        console.log("🔄 Hash de transacción:", buyHash)
      }
      
    } catch (error: any) {
      console.error("Error en transacción:", error)
      setCurrentTxType(null) // Resetear en caso de error
      
      // Si el error incluye allowance, mostrar mensaje específico
      if (error.message.includes("allowance") || error.message.includes("aprobar")) {
        setTxError("❌ Se necesita aprobar allowance de MXNB primero. Usa el botón 'Aprobar MXNB'.")
      } else {
        setTxError("❌ " + (error.message || "Error al procesar la transacción"))
      }
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
      setTxError("❌ Por favor completa todos los campos requeridos")
      return
    }

    setTxError("")
    setIsUploading(true)

    try {
      let imageUrl = undefined

      // Subir imagen si existe
      if (imagenFile) {
        setTxError("📸 Subiendo imagen...")
        const formData = new FormData()
        formData.append('image', imagenFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Error al subir la imagen')
        }

        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.imageUrl
      }

      // Obtener el ID que tendrá el nuevo market (marketCount actual)
      const newMarketId = marketCount || 0

      // Calcular duración en horas desde ahora hasta la fecha fin
      const now = new Date()
      const endDate = new Date(nuevoMarket.fechaFin)
      const durationHours = Math.max(1, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60)))

      setTxError("⏳ Creando market en blockchain...")
      
      // Establecer el tipo de transacción
      setCurrentTxType('market_creation')

      await createMarket(
        nuevoMarket.pregunta,
        "Sí", // optionA
        "No", // optionB
        durationHours
      )

      // Guardar la imagen asociada al market ID si existe
      if (imageUrl && typeof newMarketId === 'number') {
        console.log("💾 Guardando imagen para market ID:", newMarketId, "URL:", imageUrl)
        MarketImageStorage.saveImage(newMarketId, imageUrl, CONTRACTS.PREDICTION_MARKET)
      }

      setTxError("⏳ Transacción enviada, esperando confirmación...")

      // Limpiar formulario
      setNuevoMarket({
        nombre: "",
        descripcion: "",
        pregunta: "",
        fechaFin: "",
        categoria: "general",
        poolInicial: 1000,
        imagen: "",
      })
      setImagenFile(null)

      setCreateMarketOpen(false)
    } catch (error: any) {
      console.error("Error al crear market:", error)
      setCurrentTxType(null) // Resetear en caso de error
      setTxError("❌ " + (error.message || "Error al crear el market"))
    } finally {
      setIsUploading(false)
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
                  <div className="flex items-center gap-4 text-sm mt-3">
                    <span>Balance: <strong>{balance} MXNB</strong></span>
                    <span>Markets: <strong>{marketCount}</strong></span>
                    <Button 
                      onClick={refrescarTodo} 
                      size="sm" 
                      variant="outline"
                      className="border-primary/20 hover:bg-primary/10"
                    >
                      🔄 Refrescar
                    </Button>
                    <Button 
                      onClick={() => {
                        toast({
                          title: "🧪 Prueba de Notificación",
                          description: "¡El sistema de notificaciones funciona correctamente! Esta es una prueba.",
                          duration: 4000,
                        })
                      }} 
                      size="sm" 
                      variant="outline"
                      className="border-blue-200 hover:bg-blue-50 text-blue-600"
                    >
                      🔔 Test
                    </Button>
                    <Button 
                      onClick={() => {
                        const images = MarketImageStorage.getAllImages()
                        console.log("📸 Imágenes almacenadas:", images)
                        toast({
                          title: "📸 Debug de Imágenes",
                          description: `Imágenes almacenadas: ${images.length}. Ver consola para detalles.`,
                          duration: 4000,
                        })
                      }} 
                      size="sm" 
                      variant="outline"
                      className="border-purple-200 hover:bg-purple-50 text-purple-600"
                    >
                      📸 Debug
                    </Button>
                  </div>
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
                {!isConnected ? (
                  <div className="text-center py-8">
                    <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Inicia sesión primero para ver los markets activos</p>
                    <p className="text-sm text-muted-foreground mt-2">Conecta tu wallet o regístrate para participar</p>
                  </div>
                ) : eventosDisponibles.length > 0 ? (
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
          {!isConnected ? (
            <div className="text-center py-16">
              <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Inicia sesión primero para ver los markets activos</h3>
              <p className="text-muted-foreground mb-6">
                Conecta tu wallet o regístrate para participar en los mercados de predicción
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <RegisterMenu />
              </div>
            </div>
          ) : eventosFiltrados.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventosFiltrados.map((evento) => (
                <Card key={evento.id} className="border border-primary/20 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  {evento.imagen ? (
                    <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-primary/5">
                      <Image
                        src={evento.imagen}
                        alt={evento.nombre}
                        fill
                        className="object-cover transition-opacity"
                        onError={(e) => {
                          // En lugar de ocultar, mostrar un placeholder
                          const target = e.currentTarget;
                          target.style.opacity = '0';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.image-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'image-placeholder absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20';
                            placeholder.innerHTML = `
                              <div class="text-center text-primary/60">
                                <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                </svg>
                                <p class="text-sm font-medium">Market Image</p>
                              </div>
                            `;
                            parent.appendChild(placeholder);
                          }
                        }}
                        onLoad={(e) => {
                          // Asegurar que la imagen se muestre cuando cargue correctamente
                          e.currentTarget.style.opacity = '1';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                      <div className="text-center text-primary/60">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium">Market Image</p>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3">{evento.nombre}</h3>
                    <p className="text-muted-foreground mb-4">{evento.pregunta}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {evento.opciones.map((opcion) => (
                        <div
                          key={opcion.id}
                          className="p-3 border border-primary/20 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          <div className="font-medium text-foreground">{opcion.nombre}</div>
                          <div className="text-sm text-primary font-bold">{opcion.cuota.toFixed(2)}x</div>
                          <div className="text-xs text-muted-foreground">{opcion.probabilidad.toFixed(0)}%</div>
                        </div>
                      ))}
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

                    {/* Controles de administrador */}
                    <MarketAdminControls
                      marketId={parseInt(evento.id)}
                      marketQuestion={evento.pregunta}
                      isResolved={evento.estado === "finalizado"}
                      endTime={Math.floor(new Date(evento.fechaFin).getTime() / 1000)}
                      className="mt-4"
                    />
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
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
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
                Cantidad MXNB (Mínimo: 1 MXNB)
              </Label>
              <Input
                id="cantidad"
                type="number"
                placeholder="1.00"
                min="1"
                step="0.01"
                value={cantidadPosicion}
                onChange={(e) => setCantidadPosicion(e.target.value)}
                className="mt-1"
              />
              {cantidadPosicion && (
                <p className="text-sm text-muted-foreground mt-1">
                  Ganancia potencial: {calcularGananciaPotencial().toFixed(2)} MXNB
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                📋 Cantidad mínima de apuesta: 1 MXNB
              </p>
            </div>
            {txError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{txError}</AlertDescription>
              </Alert>
            )}
            
            {/* Mostrar botón de approve si no tiene allowance infinito */}
            {!hasInfiniteAllowance && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Necesitas aprobar tokens MXNB antes de participar.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            
            {/* Botón de aprobar si no tiene allowance infinito */}
            {!hasInfiniteAllowance && (
              <Button
                onClick={async () => {
                  setTxError("⏳ Aprobando tokens MXNB...")
                  setCurrentTxType('approval') // Establecer tipo de transacción
                  try {
                    await approveInfiniteMXNB()
                    setTxError("⏳ Aprobación enviada, esperando confirmación...")
                  } catch (error: any) {
                    setCurrentTxType(null) // Resetear en caso de error
                    setTxError("❌ Error al aprobar: " + (error.message || "Error desconocido"))
                  }
                }}
                disabled={isWritePending || isConfirming}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {(isWritePending || isConfirming) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Aprobar MXNB
              </Button>
            )}
            
            <Button
              onClick={manejarPosicion}
              disabled={!opcionSeleccionada || !cantidadPosicion || isWritePending || isConfirming || !hasInfiniteAllowance}
              className="bg-primary hover:bg-primary/90"
            >
              {(isWritePending || isConfirming) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isWritePending ? "Confirmando..." : isConfirming ? "Procesando..." : "Participar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Dialog para crear market */}
      <Dialog open={createMarketOpen} onOpenChange={setCreateMarketOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Crear Nuevo Market</DialogTitle>
            <DialogDescription>
              Crea un nuevo mercado de predicción para la comunidad
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
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
                rows={3}
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
            <ImageUpload
              onImageChange={setImagenFile}
              className="space-y-2"
            />
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
          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setCreateMarketOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={manejarCrearMarket}
              disabled={!nuevoMarket.nombre || !nuevoMarket.pregunta || !nuevoMarket.fechaFin || isUploading}
              className="bg-primary hover:bg-primary/90"
            >
              {(isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isUploading ? "Subiendo imagen..." : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Market
                </>
              )}
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
    </div>
  )
}
