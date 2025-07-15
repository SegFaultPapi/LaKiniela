"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, AlertTriangle, Shield } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { usePredictionMarketV2 } from "@/hooks/use-prediction-market-v2"
import { useToast } from "@/hooks/use-toast"

interface MarketAdminControlsProps {
  marketId: number
  marketQuestion: string
  isResolved: boolean
  outcome?: number
  endTime: number
  className?: string
}

export function MarketAdminControls({ 
  marketId, 
  marketQuestion, 
  isResolved, 
  outcome,
  endTime,
  className = "" 
}: MarketAdminControlsProps) {
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const { isOwner, closeMarket, emergencyResolveMarket, isWritePending, address, contractOwner, isConnected } = usePredictionMarketV2()
  const { toast } = useToast()

  // Debug logging para desarrollo
  console.log("🔍 MarketAdminControls Debug:", {
    isConnected,
    address,
    contractOwner,
    isOwner,
    isResolved,
    marketId,
    endTime,
    currentTime: Math.floor(Date.now() / 1000),
    addressMatch: address && contractOwner ? address.toLowerCase() === contractOwner.toLowerCase() : false
  })

  // Verificación robusta: Solo mostrar si:
  // 1. El usuario está conectado
  // 2. El usuario es el owner verificado
  // 3. El market no está resuelto
  // 4. Tenemos datos válidos de owner del contrato
  if (!isConnected || !address || !contractOwner || !isOwner || isResolved) {
    return null
  }

  // Verificación adicional de seguridad comparando addresses directamente
  if (address.toLowerCase() !== contractOwner.toLowerCase()) {
    console.warn("⚠️ Intento de acceso no autorizado a controles de administrador:", {
      userAddress: address,
      contractOwner,
      isOwner
    })
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  const isActive = !isResolved && endTime * 1000 > Date.now()
  const isExpired = !isResolved && endTime * 1000 <= Date.now()
  const canEmergencyClose = isActive // Se puede usar emergencyResolveMarket si está activo
  const canNormalClose = isExpired && !isResolved // Solo se puede cerrar normalmente si ya expiró

  const handleEmergencyCloseMarket = async () => {
    try {
      setIsClosing(true)
      
      console.log("🚨 Usando emergencyResolveMarket para cerrar market activo")
      
      // Usar emergencyResolveMarket con outcome CANCELLED
      const hash = await emergencyResolveMarket(marketId, 3) // 3 = CANCELLED
      
      if (hash) {
        toast({
          title: "Market cerrado en modo emergencia",
          description: `El market "${marketQuestion}" ha sido cancelado usando emergencyResolveMarket. Los fondos serán devueltos a los participantes.`,
        })
        setShowCloseDialog(false)
      }
    } catch (error) {
      console.error("Error cerrando market en emergencia:", error)
      toast({
        title: "Error al cerrar market en emergencia",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsClosing(false)
    }
  }

  const handleNormalCloseMarket = async () => {
    try {
      setIsClosing(true)
      
      console.log("🕒 Usando closeMarket para market expirado")
      
      // Usar la función normal closeMarket para markets expirados
      const hash = await closeMarket(marketId)
      
      if (hash) {
        toast({
          title: "Market cerrado exitosamente",
          description: `El market "${marketQuestion}" ha sido cancelado. Los fondos serán devueltos a los participantes.`,
        })
        setShowCloseDialog(false)
      }
    } catch (error) {
      console.error("Error cerrando market:", error)
      toast({
        title: "Error al cerrar market",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsClosing(false)
    }
  }

  const handleCloseMarket = () => {
    if (canEmergencyClose) {
      handleEmergencyCloseMarket()
    } else if (canNormalClose) {
      handleNormalCloseMarket()
    }
  }

  return (
    <>
      <Card className={`${canEmergencyClose || canNormalClose ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'} ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <Shield className="w-4 h-4 mr-2 text-orange-600" />
            Controles de Administrador
            <Badge variant="outline" className="ml-2 text-xs">
              Solo Owner
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              <strong>Market ID:</strong> {marketId}
            </div>
            
            <div className="text-xs text-muted-foreground">
              <strong>Estado:</strong>{" "}
              {isActive ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Activo
                </Badge>
              ) : isExpired ? (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Expirado
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  Finalizado
                </Badge>
              )}
            </div>

            {/* Información sobre el tipo de cierre disponible */}
            {canEmergencyClose && (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <p className="text-xs text-orange-800">
                  <strong>🚨 Cierre de Emergencia:</strong> Este market está activo pero puede ser cerrado inmediatamente usando emergencyResolveMarket.
                </p>
              </div>
            )}
            
            {canNormalClose && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-xs text-red-800">
                  <strong>⏰ Market Expirado:</strong> Este market ya terminó y puede ser cerrado usando la función normal.
                </p>
              </div>
            )}

            {!canEmergencyClose && !canNormalClose && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                <p className="text-xs text-gray-800">
                  <strong>ℹ️ Market Finalizado:</strong> Este market ya está resuelto y no puede ser modificado.
                </p>
              </div>
            )}

            <Button
              onClick={() => setShowCloseDialog(true)}
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={!(canEmergencyClose || canNormalClose) || isClosing || isWritePending}
            >
              <X className="w-4 h-4 mr-2" />
              {isClosing || isWritePending ? "Cerrando..." : 
               canEmergencyClose ? "Cerrar Market (Emergencia)" :
               canNormalClose ? "Cerrar Market (Normal)" : 
               "Market ya finalizado"}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              ⚠️ {canEmergencyClose ? 
                "EMERGENCIA: Cerrar un market activo lo cancela permanentemente usando emergencyResolveMarket." :
                canNormalClose ?
                "Cerrar un market lo cancela permanentemente y devuelve los fondos a los participantes." :
                "Este market ya está finalizado y no puede ser modificado."
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación actualizado */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              {canEmergencyClose ? "Confirmar Cierre de Emergencia" : "Confirmar Cierre de Market"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                ¿Estás seguro de que quieres cerrar permanentemente este market?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-sm">"{marketQuestion}"</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Market ID: {marketId}
                </p>
                <p className="text-xs text-muted-foreground">
                  Método: {canEmergencyClose ? "emergencyResolveMarket (Activo)" : "resolveMarket (Expirado)"}
                </p>
              </div>
              <div className={`${canEmergencyClose ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'} border p-3 rounded-lg`}>
                <p className={`text-sm ${canEmergencyClose ? 'text-orange-800' : 'text-red-800'}`}>
                  <strong>Esta acción no se puede deshacer.</strong> 
                  {canEmergencyClose ? 
                    " El market activo será cerrado inmediatamente en modo emergencia." :
                    " El market expirado será marcado como cancelado."
                  } Todos los fondos apostados serán devueltos automáticamente a los participantes.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing || isWritePending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseMarket}
              disabled={isClosing || isWritePending || !(canEmergencyClose || canNormalClose)}
              className={`${canEmergencyClose ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isClosing || isWritePending ? "Cerrando..." : 
               canEmergencyClose ? "Sí, Cerrar en Emergencia" : "Sí, Cerrar Market"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 