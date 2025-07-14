"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check, Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUser } from "@/hooks/useUser"
import { usePredictionMarket } from "@/hooks/use-prediction-market"
import { useToast } from "@/hooks/use-toast"
import QRCode from "qrcode"

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Componente para el logo de Arbitrum
const ArbitrumLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L3 7L12 12L21 7L12 2Z"
      fill="#2D374B"
    />
    <path
      d="M3 17L12 22L21 17L12 12L3 17Z"
      fill="#28A0F0"
    />
    <path
      d="M3 12L12 17L21 12L12 7L3 12Z"
      fill="#96BEDC"
    />
  </svg>
)

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const { user, walletAddress } = useUser()
  const { balance } = usePredictionMarket()
  const { toast } = useToast()

  // Generar QR Code
  useEffect(() => {
    if (walletAddress && open) {
      QRCode.toDataURL(walletAddress, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Error generating QR code:", err))
    }
  }, [walletAddress, open])

  // Copiar dirección
  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress)
        setCopied(true)
        toast({
          title: "¡Dirección copiada!",
          description: "La dirección ha sido copiada al portapapeles",
        })
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        toast({
          title: "Error",
          description: "No se pudo copiar la dirección",
          variant: "destructive",
        })
      }
    }
  }

  // Formatear dirección
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Formatear balance
  const formatBalance = (balance: string) => {
    const numBalance = parseFloat(balance || '0')
    return `$${numBalance.toFixed(2)}`
  }

  const handleSpeiDeposit = () => {
    toast({
      title: "Próximamente",
      description: "La función de depósito SPEI estará disponible pronto",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-foreground">
            Deposita Fondos
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Balance actual: {formatBalance(balance)}
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Información de tokens y red */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Moneda soportada
              </label>
              <div className="flex items-center mt-1 p-2 bg-muted rounded-lg border">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="font-medium text-sm">MXNb</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Red soportada
              </label>
              <div className="flex items-center mt-1 p-2 bg-muted rounded-lg border">
                <ArbitrumLogo className="w-5 h-5 mr-2" />
                <span className="font-medium text-sm">Arbitrum Sepolia</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <Card className="border border-border bg-background">
            <CardContent className="flex justify-center p-4">
              {qrCodeUrl ? (
                <div className="text-center">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code de dirección de wallet" 
                    className="w-40 h-40 mx-auto border border-border rounded-lg"
                  />
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mx-auto mt-3">
                    <ArbitrumLogo className="w-4 h-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-40 h-40 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Generando QR...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dirección de depósito */}
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center mb-2">
              Tu dirección de depósito
              <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded">ℹ️</span>
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-xs font-mono bg-muted p-2.5 rounded-lg border break-all">
                {walletAddress || "Cargando..."}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAddress}
                className="px-2.5 py-2.5 h-auto"
                disabled={!walletAddress}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
              <span>Depósito mínimo: $2.5</span>
            </div>
          </div>

          {/* Botón SPEI destacado */}
          <Button 
            onClick={handleSpeiDeposit}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 text-sm relative"
            size="lg"
          >
            <Star className="w-4 h-4 mr-2 fill-current" />
            Deposita mediante SPEI
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg">
              Recomendado
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 