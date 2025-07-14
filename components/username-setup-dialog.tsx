"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Check, 
  AlertCircle, 
  Sparkles,
  Shield
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { usePortalWallet } from '@/hooks/usePortalWallet'

interface UsernameSetupDialogProps {
  isOpen: boolean
  onClose: () => void
  onUsernameSet: (username: string) => void
}

export function UsernameSetupDialog({ isOpen, onClose, onUsernameSet }: UsernameSetupDialogProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount()
  const { isConnected: isPortalConnected, walletAddress: portalAddress } = usePortalWallet()

  // Limpiar estado cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      setUsername('')
      setError('')
      setIsLoading(false)
    }
  }, [isOpen])

  // Detectar el tipo de conexión
  const connectionType = isPortalConnected ? 'Portal Wallet' : 
                        isWagmiConnected ? 'Wallet Tradicional' : 
                        'Gmail'

  const walletAddress = portalAddress || wagmiAddress || ''

  const validateUsername = (value: string) => {
    // Remover @ si el usuario lo agrega
    const cleanValue = value.replace('@', '')
    
    if (!cleanValue) {
      return 'El nombre de usuario es requerido'
    }
    
    if (cleanValue.length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres'
    }
    
    if (cleanValue.length > 20) {
      return 'El nombre de usuario no puede exceder 20 caracteres'
    }
    
    // Solo permitir letras, números y guiones bajos
    const regex = /^[a-zA-Z0-9_]+$/
    if (!regex.test(cleanValue)) {
      return 'Solo se permiten letras, números y guiones bajos'
    }
    
    return null
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace('@', '') // Remover @ si lo escriben
    setUsername(value)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simular verificación de disponibilidad
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verificar si el username ya existe (simulado)
      const existingUsernames = JSON.parse(localStorage.getItem('la-kiniela-usernames') || '[]')
      if (existingUsernames.includes(username.toLowerCase())) {
        setError('Este nombre de usuario ya está en uso')
        setIsLoading(false)
        return
      }

      // Guardar username
      const userData = {
        username: username.toLowerCase(),
        walletAddress,
        connectionType,
        createdAt: new Date().toISOString()
      }

      localStorage.setItem('la-kiniela-user', JSON.stringify(userData))
      
      // Agregar a lista de usernames existentes
      existingUsernames.push(username.toLowerCase())
      localStorage.setItem('la-kiniela-usernames', JSON.stringify(existingUsernames))

      onUsernameSet(username)
      onClose()
    } catch (error) {
      setError('Error al crear el nombre de usuario. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <User className="w-5 h-5 text-primary" />
            ¡Bienvenido a La Kiniela!
          </DialogTitle>
          <DialogDescription className="text-center">
            Configura tu nombre de usuario para completar tu perfil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de conexión */}
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="font-medium text-sm">Conectado via {connectionType}</div>
                <div className="text-xs text-muted-foreground">
                  {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Cuenta conectada'}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary font-medium">
                  @
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="tu_nombre_unico"
                  value={username}
                  onChange={handleUsernameChange}
                  className="pl-8 text-base"
                  disabled={isLoading}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Tu nombre de usuario será @{username || 'tu_nombre_unico'}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Requisitos del nombre de usuario:
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Entre 3 y 20 caracteres</li>
                <li>• Solo letras, números y guiones bajos</li>
                <li>• Debe ser único en la plataforma</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !username}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verificando disponibilidad...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Crear mi cuenta
                </>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UsernameSetupDialog 