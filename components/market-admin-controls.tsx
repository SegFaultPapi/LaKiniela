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
  const { isOwner, closeMarket, isWritePending, address, contractOwner, isConnected } = usePredictionMarketV2()
  const { toast } = useToast()

  // Debug logging para desarrollo
  console.log("🔍 MarketAdminControls Debug:", {
    isConnected,
    address,
    contractOwner,
    isOwner,
    isResolved,
    marketId,
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

  const handleCloseMarket = async () => {
    try {
      setIsClosing(true)
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

  const isActive = !isResolved && endTime * 1000 > Date.now()
  const isExpired = !isResolved && endTime * 1000 <= Date.now()

  return (
    <>
      <Card className={`border-orange-200 bg-orange-50 ${className}`}>
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

            <Button
              onClick={() => setShowCloseDialog(true)}
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={isClosing || isWritePending}
            >
              <X className="w-4 h-4 mr-2" />
              {isClosing || isWritePending ? "Cerrando..." : "Cerrar Market"}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              ⚠️ Cerrar un market lo cancela permanentemente y devuelve los fondos a los participantes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Confirmar Cierre de Market
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
              </div>
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Esta acción no se puede deshacer.</strong> El market será marcado como cancelado 
                  y todos los fondos apostados serán devueltos automáticamente a los participantes.
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
              disabled={isClosing || isWritePending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isClosing || isWritePending ? "Cerrando..." : "Sí, Cerrar Market"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 