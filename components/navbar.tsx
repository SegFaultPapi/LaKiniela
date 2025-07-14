"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RegisterMenu } from "@/components/register-menu"
import { Menu, X, User, LogOut, TrendingUp, Wallet, Plus, Search, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { useDisconnect } from "wagmi"
import { usePortalWallet } from "@/hooks/usePortalWallet"
import { usePredictionMarket } from "@/hooks/use-prediction-market"
import { DepositModal } from "@/components/deposit-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { disconnect } = useDisconnect()
  const { disconnect: disconnectPortal } = usePortalWallet()
  
  const {
    user,
    isConnected,
    needsUsernameSetup,
    logout,
    getUserDisplay,
    isUserSetup,
    walletAddress,
    connectionType
  } = useUser()

  // Hook para obtener balance y posiciones
  const { balance, userBets } = usePredictionMarket()

  // Cargar imagen de perfil desde localStorage
  useEffect(() => {
    if (user && user.walletAddress) {
      const savedImage = localStorage.getItem(`la-kiniela-profile-image-${user.walletAddress}`)
      setProfileImage(savedImage || "")
    } else {
      setProfileImage("")
    }
  }, [user])

  // Calcular total apostado
  const totalApostado = useMemo(() => {
    return userBets.reduce((sum, pos) => sum + pos.cantidad, 0)
  }, [userBets])

  // Función para formatear números con K cuando son grandes
  const formatCurrency = (amount: number) => {
    if (amount >= 10000) {
      return `$${(amount / 1000).toFixed(2)}K`
    }
    return `$${amount.toFixed(2)}`
  }

  // Determinar si el usuario está completamente conectado y configurado
  const isUserLoggedIn = isConnected && isUserSetup()

  // Items de navegación dinámicos basados en el estado de conexión (sin Inicio)
  const navItems = useMemo(() => {
    if (!isUserLoggedIn) {
      // Si no está conectado, mostrar Portal Wallet y Perfil
      return [
        { name: "Portal Wallet", href: "/portal", active: pathname === "/portal" },
        { name: "Perfil", href: "/perfil", active: pathname === "/perfil" },
      ]
    } else {
      // Si está conectado, mostrar solo Deposit
      return [
        { name: "Deposit", href: "#", active: false },
      ]
    }
  }, [isUserLoggedIn, pathname])

  // Manejar click en navegación
  const handleNavClick = (item: { name: string; href: string }) => {
    if (item.name === "Deposit") {
      setIsDepositModalOpen(true)
    } else {
      router.push(item.href)
    }
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    // Desconectar la wallet
    if (connectionType === 'Portal Wallet') {
      disconnectPortal()
    } else {
      disconnect()
    }
    
    // Cerrar sesión del usuario
    logout()
    setIsMenuOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Navegar a la página principal con el término de búsqueda como query parameter
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm("")
      setIsMenuOpen(false)
    }
  }

  // Generar iniciales del usuario para el avatar
  const getUserInitials = () => {
    const display = getUserDisplay()
    if (display.includes('@')) {
      return display.substring(0, 2).toUpperCase()
    }
    return display.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2)
  }

  return (
    <nav className="bg-background border-b border-primary/20 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center h-32">
          {/* Logo - Lado izquierdo */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <Link href="/" className="flex items-center space-x-4">
              <div className="relative w-12 h-12">
                <Image src="/la-kiniela-logo.png" alt="La Kiniela" fill className="object-contain" />
              </div>
              <span className="text-3xl font-bold text-foreground whitespace-nowrap">
                La <span className="text-primary">Kiniela</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Distribución en 3 columnas */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-8">
            {/* Columna izquierda - Botones de navegación */}
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  variant={item.active ? "default" : "ghost"}
                  size="lg"
                  className={
                    item.active
                      ? "bg-primary text-white hover:bg-primary/90 border border-primary text-lg px-6 h-16"
                      : item.name === "Deposit"
                      ? "text-white bg-primary hover:bg-primary/90 border border-primary text-lg px-6 h-16"
                      : "text-foreground hover:bg-primary/10 border border-primary/20 bg-white text-lg px-6 h-16"
                  }
                >
                  {item.name}
                </Button>
              ))}
            </div>

            {/* Columna central - Barra de búsqueda centrada y más grande */}
            <div className="flex-1 flex justify-center max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar markets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-5 h-16 w-full text-xl placeholder:text-xl border-primary/20 focus:border-primary rounded-xl shadow-sm font-medium"
                  />
                </div>
              </form>
            </div>

            {/* Columna derecha - Controles de usuario */}
            <div className="flex items-center space-x-3">
              {/* Botones de balance y total apostado - solo si está conectado */}
              {isUserLoggedIn && (
                <>
                  {/* Botón Posiciones */}
                  <Link href="/perfil">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex flex-col items-center justify-center px-3 bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700 h-16 w-32"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-base font-medium text-center">Posiciones</span>
                        <span className="text-lg font-bold text-green-600 leading-none">{formatCurrency(totalApostado)}</span>
                      </div>
                    </Button>
                  </Link>

                  {/* Botón Balance */}
                  <Link href="/perfil">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex flex-col items-center justify-center px-3 bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700 h-16 w-32"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-base font-medium text-center">Balance</span>
                        <span className="text-lg font-bold text-green-600 leading-none">{formatCurrency(parseFloat(balance || '0'))}</span>
                      </div>
                    </Button>
                  </Link>
                </>
              )}
              
              {/* Estado del usuario */}
              {!isUserLoggedIn ? (
                <RegisterMenu />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-16 w-16 rounded-full border-2 border-primary/20 hover:border-primary/40 p-0"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profileImage} alt={getUserDisplay()} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem disabled>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profileImage} alt={getUserDisplay()} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium text-base">{getUserDisplay()}</span>
                          <span className="text-sm text-muted-foreground">
                            {connectionType}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/perfil">
                        <User className="w-5 h-5 mr-3" />
                        <span className="text-base">Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/editar-perfil">
                        <Settings className="w-5 h-5 mr-3" />
                        <span className="text-base">Editar Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700">
                      <LogOut className="w-5 h-5 mr-3" />
                      <span className="text-base">Desconectar y Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ml-auto">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:bg-primary/10 p-3"
            >
              {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-primary/20 pb-6">
            <div className="flex flex-col space-y-3 pt-6">
              {/* Barra de búsqueda móvil */}
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar markets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-4 h-14 text-xl placeholder:text-xl border-primary/20 focus:border-primary rounded-xl font-medium"
                  />
                </div>
              </form>

              {navItems.map((item) => (
                <Button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  variant={item.active ? "default" : "ghost"}
                  size="lg"
                  className={
                    item.active
                      ? "w-full justify-start bg-primary text-white hover:bg-primary/90 text-lg h-14"
                      : item.name === "Deposit"
                      ? "w-full justify-start text-white bg-primary hover:bg-primary/90 text-lg h-14"
                      : "w-full justify-start text-foreground hover:bg-primary/10 text-lg h-14"
                  }
                >
                  {item.name}
                </Button>
              ))}

              {/* Botones de balance y total apostado en móvil - solo si está conectado */}
              {isUserLoggedIn && (
                <div className="space-y-3 pt-3">
                  {/* Botón Posiciones Móvil */}
                  <Link href="/perfil">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-center bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700 h-14"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-medium text-center">Posiciones</span>
                        <span className="text-2xl font-bold text-green-600 leading-none">{formatCurrency(totalApostado)}</span>
                      </div>
                    </Button>
                  </Link>

                  {/* Botón Balance Móvil */}
                  <Link href="/perfil">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-center bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700 h-14"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-medium text-center">Balance</span>
                        <span className="text-2xl font-bold text-green-600 leading-none">{formatCurrency(parseFloat(balance || '0'))}</span>
                      </div>
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Usuario en móvil */}
              <div className="pt-3">
                {!isUserLoggedIn ? (
                  <RegisterMenu variant="outline" className="w-full" />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 px-4 py-4 bg-primary/10 rounded-lg border border-primary/20">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profileImage} alt={getUserDisplay()} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-lg">
                          {getUserDisplay()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {connectionType}
                        </div>
                      </div>
                    </div>
                    
                    {/* Botones adicionales en móvil */}
                    <Link href="/editar-perfil">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="w-full justify-start text-foreground hover:bg-primary/10 text-lg h-14"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-6 h-6 mr-3" />
                        Editar Perfil
                      </Button>
                    </Link>
                    
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-lg h-14"
                    >
                      <LogOut className="w-6 h-6 mr-3" />
                      Desconectar y Cerrar Sesión
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de depósito */}
      <DepositModal 
        open={isDepositModalOpen} 
        onOpenChange={setIsDepositModalOpen} 
      />
    </nav>
  )
}

export default Navbar
