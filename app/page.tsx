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
import { MarketDescriptionStorage } from "@/lib/market-descriptions"
import { CONTRACTS, MIN_MARKET_DURATION, MAX_MARKET_DURATION, CURRENT_CONTRACT_ADDRESS } from "@/lib/contracts-config"

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
        // Obtener datos de la participación guardados
        const participationData = sessionStorage.getItem('pending-participation')
        let toastDescription = `Tu apuesta ha sido registrada correctamente. ¡Buena suerte! Transacción: ${lastTxHash.slice(0, 10)}...`
        
        if (participationData) {
          try {
            const data = JSON.parse(participationData)
            toastDescription = `🎯 Market: ${data.marketName}\n💰 Apuesta: ${data.amount} MXNB en "${data.option}"\n📈 Ganancia potencial: ${data.potentialWinnings} MXNB\n🔗 TX: ${lastTxHash.slice(0, 10)}... - Ver en Arbiscan`
            // Limpiar datos temporales
            sessionStorage.removeItem('pending-participation')
          } catch (error) {
            console.log("Error parsing participation data:", error)
          }
        }
        
        toast({
          title: "🎉 ¡Participación Exitosa!",
          description: toastDescription,
          duration: 10000,
        })
        
        // Cerrar modal inmediatamente y limpiar estados
        setDialogOpen(false)
        setEventoSeleccionado(null)
        setOpcionSeleccionada("")
        setCantidadPosicion("")
        setTxError("")
        
        // Refrescar balance y markets después de un momento
        setTimeout(() => {
          refetchBalance()
          loadAllMarkets() // Agregar para actualizar los totales de participaciones
        }, 1000)
      }
      
      // Resetear el tipo de transacción y limpiar errores
      setCurrentTxType(null)
      setTxError("")
      
      // Refrescar datos generales
      setTimeout(() => {
        refetchBalance()
        loadAllMarkets() // Asegurar que los markets se actualicen en todos los casos
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
      // Usar clave específica por contrato y usuario para el toast de bienvenida
      const welcomeKey = `welcome-toast-shown-${CURRENT_CONTRACT_ADDRESS}-${address}`
      const welcomeShown = sessionStorage.getItem(welcomeKey)
      
      if (!welcomeShown) {
        setTimeout(() => {
          toast({
            title: "🎉 ¡Bienvenido a La Kiniela!",
            description: `¡Hola ${getUserDisplay()}! Tu cuenta está lista. Balance: ${balance} MXNB | Markets disponibles: ${marketCount}`,
            duration: 5000,
          })
          sessionStorage.setItem(welcomeKey, 'true')
        }, 1000)
      }
    }
  }, [isConnected, isUserSetup, balance, marketCount, toast, getUserDisplay, address])

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
        
        // Guardar datos de la transacción para el resumen
        sessionStorage.setItem('pending-participation', JSON.stringify({
          marketName: eventoSeleccionado.nombre,
          option: opcionSeleccionada === "si" ? eventoSeleccionado.opciones.find(o => o.id === "si")?.nombre : eventoSeleccionado.opciones.find(o => o.id === "no")?.nombre,
          amount: cantidadPosicion,
          potentialWinnings: calcularGananciaPotencial().toFixed(2),
          hash: buyHash
        }))
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
    if (!nuevoMarket.nombre || !nuevoMarket.fechaFin) {
      setTxError("❌ Por favor completa todos los campos requeridos")
      return
    }

    // Validar duración del market
    const now = new Date()
    const endDate = new Date(nuevoMarket.fechaFin)
    const durationSeconds = Math.floor((endDate.getTime() - now.getTime()) / 1000)
    
    // Validaciones de duración usando las constantes del contrato
    if (durationSeconds < MIN_MARKET_DURATION) {
      const horasMinimas = Math.ceil(MIN_MARKET_DURATION / 3600)
      setTxError(`❌ La fecha de finalización debe ser al menos ${horasMinimas} hora(s) en el futuro`)
      return
    }
    
    if (durationSeconds > MAX_MARKET_DURATION) {
      const diasMaximos = Math.floor(MAX_MARKET_DURATION / (24 * 3600))
      setTxError(`❌ La duración máxima permitida es ${diasMaximos} días. Por favor selecciona una fecha más cercana.`)
      return
    }
    
    // Convertir a horas para el contrato (redondeado hacia arriba para asegurar que cumple el mínimo)
    const durationHours = Math.ceil(durationSeconds / 3600)
    
    console.log("✅ Duración validada:", {
      durationSeconds,
      durationHours,
      durationDays: (durationHours / 24).toFixed(1),
      minSeconds: MIN_MARKET_DURATION,
      maxSeconds: MAX_MARKET_DURATION,
      contractLimits: {
        minHours: MIN_MARKET_DURATION / 3600,
        maxHours: MAX_MARKET_DURATION / 3600,
        maxDays: MAX_MARKET_DURATION / (24 * 3600)
      }
    })

    setTxError("")
    setIsUploading(true)

    try {
      let imageUrl = undefined

      // Subir imagen si existe
      if (imagenFile) {
        console.log("📸 Iniciando upload de imagen:", {
          fileName: imagenFile.name,
          fileSize: imagenFile.size,
          fileType: imagenFile.type
        })
        
        setTxError("📸 Procesando imagen...")
        
        const formData = new FormData()
        formData.append('image', imagenFile)

        console.log("🌐 Enviando request a /api/upload...")
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        console.log("📡 Response recibida:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          ok: uploadResponse.ok
        })

        if (!uploadResponse.ok) {
          let errorData
          try {
            errorData = await uploadResponse.json()
          } catch (parseError) {
            console.error("❌ Error parseando response JSON:", parseError)
            throw new Error(`Error de servidor (${uploadResponse.status}): No se pudo procesar la respuesta`)
          }
          
          console.error("❌ Error del servidor:", errorData)
          throw new Error(`Error al procesar imagen: ${errorData.error || 'Error desconocido del servidor'}`)
        }

        const uploadResult = await uploadResponse.json()
        console.log("✅ Upload exitoso:", uploadResult)
        
        imageUrl = uploadResult.imageUrl
        
        if (!imageUrl) {
          throw new Error("El servidor no devolvió una URL de imagen válida")
        }
        
        console.log("💾 Imagen procesada correctamente como base64")
      }

      // Obtener el ID que tendrá el nuevo market (marketCount actual)
      const newMarketId = marketCount || 0

      setTxError("⏳ Creando market en blockchain...")
      
      // Establecer el tipo de transacción
      setCurrentTxType('market_creation')

      await createMarket(
        nuevoMarket.nombre, // Usar el nombre como pregunta
        "Sí", // optionA
        "No", // optionB
        durationHours
      )

      // Guardar la imagen asociada al market ID si existe
      if (imageUrl && typeof newMarketId === 'number') {
        console.log("💾 Guardando imagen para market ID:", newMarketId, "URL tipo:", typeof imageUrl)
        MarketImageStorage.saveImage(newMarketId, imageUrl, CONTRACTS.PREDICTION_MARKET)
      }

      // Guardar la descripción asociada al market ID si existe
      if (nuevoMarket.descripcion && typeof newMarketId === 'number') {
        console.log("📝 Guardando descripción para market ID:", newMarketId)
        MarketDescriptionStorage.saveDescription(newMarketId, nuevoMarket.descripcion, CONTRACTS.PREDICTION_MARKET)
      }

      setTxError("⏳ Transacción enviada, esperando confirmación...")

      // Limpiar formulario
      setNuevoMarket({
        nombre: "",
        descripcion: "",
        fechaFin: "",
        categoria: "general",
        poolInicial: 1000,
        imagen: "",
      })
      setImagenFile(null)

      setCreateMarketOpen(false)
      
    } catch (error: any) {
      console.error("❌ Error al crear market:", error)
      setCurrentTxType(null) // Resetear en caso de error
      
      // Manejo de errores más específico
      if (error.message.includes("fetch")) {
        setTxError("❌ Error de conectividad. Verifica tu conexión a internet y vuelve a intentar.")
      } else if (error.message.includes("imagen") || error.message.includes("upload")) {
        setTxError("❌ Error procesando imagen: " + error.message)
      } else if (error.message.includes("servidor")) {
        setTxError("❌ Error del servidor: " + error.message)
      } else {
        setTxError("❌ " + (error.message || "Error desconocido al crear el market"))
      }
      
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
                  <h3 className="text-lg font-semibold text-foreground">Nuevos Markets</h3>
                  <Badge variant="outline" className="text-primary border-primary">
                    {eventosDisponibles.length > 0 ? `${Math.min(2, eventosDisponibles.length)} recientes` : '0 markets'}
                  </Badge>
                </div>
                {!isConnected ? (
                  <div className="text-center py-8">
                    <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Inicia sesión primero para ver los markets más recientes</p>
                    <p className="text-sm text-muted-foreground mt-2">Conecta tu wallet o regístrate para participar</p>
                  </div>
                ) : eventosDisponibles.length > 0 ? (
                  <div className="space-y-6">
                    {eventosDisponibles.slice(-2).reverse().map((evento) => (
                      <div key={evento.id} className="border border-primary/10 rounded-xl bg-gradient-to-br from-white to-primary/5 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                          {/* Imagen a la izquierda */}
                          <div className="w-24 h-24 flex-shrink-0 rounded-l-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 relative">
                            {evento.imagen ? (
                              <Image
                                src={evento.imagen}
                                alt={evento.nombre}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-primary/40" />
                              </div>
                            )}
                          </div>
                          
                          {/* Contenido a la derecha */}
                          <div className="flex-1 p-4">
                            <h4 className="font-medium text-foreground mb-1 line-clamp-1">{evento.nombre}</h4>
                            
                            {/* Mostrar descripción siempre debajo del nombre */}
                            <div className="mb-3">
                              {evento.descripcion && evento.descripcion !== evento.nombre ? (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {evento.descripcion.length > 100 ? `${evento.descripcion.substring(0, 100)}...` : evento.descripcion}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic opacity-60">
                                  Sin descripción personalizada
                                </p>
                              )}
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-3">
                                <span className="text-primary font-medium bg-primary/10 px-2 py-1 rounded">
                                  Pool: {evento.opciones[0].cuota.toFixed(1)}x
                                </span>
                                <span className="text-green-600 font-medium">
                                  {evento.opciones[0].probabilidad.toFixed(0)}% Sí
                                </span>
                              </div>
                              <div className="text-muted-foreground">
                                {new Date(evento.fechaFin).toLocaleDateString("es-ES", { 
                                  month: "short", 
                                  day: "numeric" 
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-primary/20 hover:bg-primary/10 text-primary"
                      onClick={() => setDialogOpen(true)}
                    >
                      Ver todos los markets
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay markets disponibles</p>
                    <p className="text-sm mt-2">¡Sé el primero en crear uno!</p>
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
          <div className="flex flex-wrap gap-3 mb-8">
            {categorias.map((categoria) => (
              <Button
                key={categoria.id}
                variant={categoriaActiva === categoria.id ? "default" : "outline"}
                size="lg"
                onClick={() => setCategoriaActiva(categoria.id)}
                className={
                  categoriaActiva === categoria.id
                    ? "bg-primary text-white hover:bg-primary/90 px-8 py-4 text-lg font-semibold"
                    : "border-primary/20 text-foreground hover:bg-primary/10 px-8 py-4 text-lg font-semibold"
                }
              >
                <categoria.icon className="w-5 h-5 mr-3" />
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
                    <h3 className="text-xl font-bold text-foreground mb-2">{evento.nombre}</h3>
                    
                    {/* Mostrar descripción siempre debajo del nombre */}
                    <div className="mb-4">
                      {evento.descripcion && evento.descripcion !== evento.nombre ? (
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {evento.descripcion.length > 150 ? `${evento.descripcion.substring(0, 150)}...` : evento.descripcion}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-sm italic opacity-75">
                          Descripción personalizada no disponible
                        </p>
                      )}
                    </div>

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
              <Label className="text-sm font-medium text-foreground">Market</Label>
              <p className="text-sm text-muted-foreground mt-1">{eventoSeleccionado?.nombre}</p>
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
            
          </div>
          <DialogFooter className="flex flex-col gap-3">
            {/* Botón de aprobar si no tiene allowance infinito - En su propia fila */}
            {!hasInfiniteAllowance && (
              <div className="w-full">
                <Alert className="mb-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Necesitas aprobar tokens MXNB antes de participar.
                  </AlertDescription>
                </Alert>
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {(isWritePending || isConfirming) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Aprobar MXNB (Solo una vez)
                </Button>
              </div>
            )}
            
            {/* Botones principales - En una fila separada */}
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              <Button
                onClick={manejarPosicion}
                disabled={!opcionSeleccionada || !cantidadPosicion || isWritePending || isConfirming || !hasInfiniteAllowance}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {(isWritePending || isConfirming) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isWritePending ? "Confirmando..." : isConfirming ? "Procesando..." : "Participar"}
              </Button>
            </div>
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
                placeholder="Ej: ¿Bitcoin alcanzará $120,000 antes de septiembre 2024?"
                value={nuevoMarket.nombre}
                onChange={(e) => setNuevoMarket({ ...nuevoMarket, nombre: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Escribe la pregunta de predicción que quieres crear
              </p>
            </div>
            <div>
              <Label htmlFor="descripcion" className="text-sm font-medium text-foreground">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción detallada del evento (opcional)..."
                value={nuevoMarket.descripcion}
                onChange={(e) => setNuevoMarket({ ...nuevoMarket, descripcion: e.target.value })}
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Información adicional sobre el market (se mostrará en la tarjeta)
              </p>
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
            
            {/* Botón de prueba para la API de upload */}
            <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="text-sm font-medium text-gray-700 mb-2">🧪 Pruebas de API</div>
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/test')
                      const data = await response.json()
                      console.log('✅ API Test:', data)
                      toast({
                        title: "✅ API Test",
                        description: `APIs funcionando: ${data.success ? 'Sí' : 'No'} - Ver consola para detalles`,
                        duration: 4000,
                      })
                    } catch (error) {
                      console.error('❌ Error en API test:', error)
                      toast({
                        title: "❌ Error API Test",
                        description: "Error probando APIs. Ver consola para detalles.",
                        variant: "destructive",
                        duration: 4000,
                      })
                    }
                  }}
                >
                  Test API
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    if (!imagenFile) {
                      toast({
                        title: "⚠️ Sin imagen",
                        description: "Selecciona una imagen primero",
                        variant: "destructive",
                      })
                      return
                    }
                    
                    try {
                      const formData = new FormData()
                      formData.append('image', imagenFile)
                      
                      console.log('🧪 Probando upload de imagen...')
                      const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                      })
                      
                      console.log('📡 Upload response:', {
                        status: response.status,
                        statusText: response.statusText,
                        ok: response.ok
                      })
                      
                      if (response.ok) {
                        const data = await response.json()
                        console.log('✅ Upload exitoso:', data)
                        toast({
                          title: "✅ Upload Test Exitoso",
                          description: `Imagen procesada correctamente como base64. Ver consola para detalles.`,
                          duration: 5000,
                        })
                      } else {
                        const errorData = await response.json()
                        console.error('❌ Upload falló:', errorData)
                        toast({
                          title: "❌ Upload Test Falló",
                          description: `Error: ${errorData.error || 'Error desconocido'}`,
                          variant: "destructive",
                          duration: 5000,
                        })
                      }
                    } catch (error) {
                      console.error('❌ Error en upload test:', error)
                      toast({
                        title: "❌ Error Upload Test",
                        description: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                        variant: "destructive",
                        duration: 5000,
                      })
                    }
                  }}
                >
                  Test Upload
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    if (!imagenFile) {
                      toast({
                        title: "⚠️ Sin imagen",
                        description: "Selecciona una imagen primero",
                        variant: "destructive",
                      })
                      return
                    }
                    
                    try {
                      const formData = new FormData()
                      formData.append('image', imagenFile)
                      
                      console.log('🔍 Probando upload debug...')
                      const response = await fetch('/api/upload-debug', {
                        method: 'POST',
                        body: formData,
                      })
                      
                      console.log('📡 Upload debug response:', {
                        status: response.status,
                        statusText: response.statusText,
                        ok: response.ok
                      })
                      
                      if (response.ok) {
                        const data = await response.json()
                        console.log('✅ Upload debug exitoso:', data)
                        toast({
                          title: "✅ Upload Debug Exitoso",
                          description: `Todos los tests pasaron. Ver consola para detalles completos.`,
                          duration: 5000,
                        })
                      } else {
                        const errorData = await response.json()
                        console.error('❌ Upload debug falló:', errorData)
                        toast({
                          title: "❌ Upload Debug Falló",
                          description: `Error en step: ${errorData.error || 'Error desconocido'}`,
                          variant: "destructive",
                          duration: 5000,
                        })
                      }
                    } catch (error) {
                      console.error('❌ Error en upload debug:', error)
                      toast({
                        title: "❌ Error Upload Debug",
                        description: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                        variant: "destructive",
                        duration: 5000,
                      })
                    }
                  }}
                >
                  Debug Upload
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Test API verifica el servidor, Test Upload prueba la subida completa, Debug Upload prueba paso a paso.
              </p>
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
                min={(() => {
                  // Mínimo: MIN_MARKET_DURATION segundos desde ahora
                  const minDate = new Date()
                  minDate.setSeconds(minDate.getSeconds() + MIN_MARKET_DURATION)
                  return minDate.toISOString().split('T')[0]
                })()}
                max={(() => {
                  // Máximo: MAX_MARKET_DURATION segundos desde ahora
                  const maxDate = new Date()
                  maxDate.setSeconds(maxDate.getSeconds() + MAX_MARKET_DURATION)
                  return maxDate.toISOString().split('T')[0]
                })()}
              />
              <p className="text-xs text-muted-foreground mt-1">
                📅 Duración válida: desde {Math.ceil(MIN_MARKET_DURATION / 3600)} horas hasta {Math.floor(MAX_MARKET_DURATION / (24 * 3600))} días desde ahora
                {nuevoMarket.fechaFin && (() => {
                  const now = new Date()
                  const endDate = new Date(nuevoMarket.fechaFin)
                  const durationSeconds = Math.floor((endDate.getTime() - now.getTime()) / 1000)
                  const durationHours = Math.ceil(durationSeconds / 3600)
                  const durationDays = (durationHours / 24).toFixed(1)
                  
                  if (durationSeconds < MIN_MARKET_DURATION) {
                    const horasMinimas = Math.ceil(MIN_MARKET_DURATION / 3600)
                    return ` ⚠️ Muy pronto (necesita al menos ${horasMinimas}h)`
                  } else if (durationSeconds > MAX_MARKET_DURATION) {
                    const diasMaximos = Math.floor(MAX_MARKET_DURATION / (24 * 3600))
                    return ` ⚠️ Muy lejano (máximo ${diasMaximos} días)`
                  } else {
                    return ` ✅ Duración: ${durationDays} días`
                  }
                })()}
              </p>
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
              disabled={!nuevoMarket.nombre || !nuevoMarket.fechaFin || isUploading}
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
