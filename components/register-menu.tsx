"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { 
  ChevronDown, 
  Mail, 
  Wallet, 
  ExternalLink,
  Shield,
  Sparkles,
  Star,
  X,
  LogIn,
  UserPlus
} from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import React from 'react'

interface RegisterMenuProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function RegisterMenu({ variant = 'default', size = 'default', className = '' }: RegisterMenuProps) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  
  const {
    user,
    isConnected,
    needsUsernameSetup,
    userExistsForWallet,
    showUsernameSetup,
    loginExistingUser,
    getUserDisplay,
    isUserSetup
  } = useUser()

  // Si ya está conectado y configurado, no mostrar el menú
  if (isConnected && isUserSetup()) {
    return null
  }

  // Si está conectado pero necesita username setup, mostrar solo el botón de configuración
  if (isConnected && needsUsernameSetup) {
    return (
      <Button 
        variant="outline" 
        size={size} 
        className={`${className} gap-2 border-primary text-primary hover:bg-primary/10`}
        onClick={() => showUsernameSetup()}
      >
        <Shield className="w-4 h-4" />
        Configurar perfil
      </Button>
    )
  }

  // Determinar el texto del botón según si el usuario ya existe
  const buttonText = userExistsForWallet ? 'Iniciar Sesión' : 'Regístrate'
  const buttonIcon = userExistsForWallet ? LogIn : UserPlus

  return (
    <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`${className} gap-2`}
        >
          {React.createElement(buttonIcon, { className: "w-4 h-4" })}
          {buttonText}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-center">
            {userExistsForWallet ? 'Iniciar Sesión' : 'Conecta tu cuenta'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {userExistsForWallet ? 
              'Conecta tu wallet para acceder a tu cuenta existente' : 
              'Elige tu método preferido para conectarte'
            }
          </p>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-4">
          {/* Opción Gmail */}
          <div 
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors border border-gray-200"
            onClick={() => {
              setIsRegisterOpen(false)
              if (userExistsForWallet) {
                loginExistingUser()
              } else {
                // TODO: Integrar autenticación con Gmail
                console.log('Gmail authentication not implemented yet')
              }
            }}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg text-foreground">
                {userExistsForWallet ? 'Iniciar con Gmail' : 'Conectar usando Gmail'}
              </div>
              <div className="text-sm text-muted-foreground">
                {userExistsForWallet ? 'Accede a tu cuenta existente' : 'Acceso rápido con tu cuenta Google'}
              </div>
            </div>
          </div>

          {/* Opción Portal Wallet - Destacada */}
          <Link href="/portal" onClick={() => setIsRegisterOpen(false)}>
            <div className="flex items-start gap-4 p-4 cursor-pointer hover:bg-primary/15 rounded-lg border-2 border-primary/30 bg-primary/10 transition-colors">
              <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg text-primary">
                    {userExistsForWallet ? 'Iniciar con Portal Wallet' : 'Conectar con Portal Wallet'}
                  </span>
                  <span className="bg-gradient-to-r from-primary to-primary/80 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3" />
                    Recomendado
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {userExistsForWallet ? 'Accede a tu cuenta existente' : 'Wallet seguro con tecnología MPC'}
                </div>
                {!userExistsForWallet && (
                  <div className="text-xs text-primary font-medium bg-primary/20 px-3 py-1.5 rounded-md inline-block">
                    ¿No tienes Wallet? Crea una automáticamente y sin complicaciones.
                  </div>
                )}
              </div>
              <ExternalLink className="w-5 h-5 text-primary shrink-0 mt-1" />
            </div>
          </Link>

          {/* Opción Wallet Tradicional */}
          <div 
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors border border-gray-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg text-foreground">
                {userExistsForWallet ? 'Iniciar con Wallet' : 'Conectar con Wallet'}
              </div>
              <div className="text-sm text-muted-foreground">
                {userExistsForWallet ? 'Usa tu wallet existente' : 'MetaMask, WalletConnect, etc.'}
              </div>
            </div>
            <div className="shrink-0 ml-2">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setIsRegisterOpen(false)
                      openConnectModal()
                    }}
                    className="text-sm h-9 px-4 font-medium border border-blue-200 hover:bg-blue-50"
                  >
                    {userExistsForWallet ? 'Iniciar' : 'Conectar'}
                  </Button>
                )}
              </ConnectButton.Custom>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-sm text-muted-foreground text-center">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Todas las opciones son seguras y descentralizadas</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RegisterMenu 