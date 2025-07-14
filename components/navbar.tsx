"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RegisterMenu } from "@/components/register-menu"
import { Menu, X, User, LogOut, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { useDisconnect } from "wagmi"
import { usePortalWallet } from "@/hooks/usePortalWallet"
import { usePredictionMarket } from "@/hooks/use-prediction-market"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
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

  const { balance } = usePredictionMarket()

  const navItems = [
    { name: "Inicio", href: "/", active: pathname === "/" },
    { name: "Portal Wallet", href: "/portal", active: pathname === "/portal" },
  ]

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

  return (
    <nav className="bg-background border-b border-primary/20 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-8 h-8">
              <Image src="/la-kiniela-logo.png" alt="La Kiniela" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">
              La <span className="text-primary">Kiniela</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className={
                      item.active
                        ? "bg-primary text-white hover:bg-primary/90 border border-primary"
                        : "text-foreground hover:bg-primary/10 border border-primary/20 bg-white"
                    }
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
            
            {/* Estado del usuario */}
            {!isConnected || !isUserSetup() ? (
              <RegisterMenu />
            ) : (
              <div className="flex items-center space-x-3">
                {/* Balance */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    Balance: {parseFloat(balance || "0").toFixed(0)} MXN
                  </span>
                </div>
                
                {/* Botón Depositar */}
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 px-3 py-2 bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
                >
                  Depositar
                </Button>
                
                {/* Dropdown del usuario */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2 px-3 py-2 bg-primary/10 border-primary/20 hover:bg-primary/15"
                    >
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">
                        {getUserDisplay()}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem disabled>
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">{getUserDisplay()}</span>
                        <span className="text-xs text-muted-foreground">
                          {connectionType}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/perfil">
                        <User className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700">
                      <LogOut className="w-4 h-4 mr-2" />
                      Desconectar y Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:bg-primary/10"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-primary/20 pb-4">
            <div className="flex flex-col space-y-2 pt-4">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className={
                      item.active
                        ? "w-full justify-start bg-primary text-white hover:bg-primary/90"
                        : "w-full justify-start text-foreground hover:bg-primary/10"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
              
              {/* Usuario en móvil */}
              <div className="pt-2">
                {!isConnected || !isUserSetup() ? (
                  <RegisterMenu variant="outline" className="w-full" />
                ) : (
                  <div className="space-y-2">
                    {/* Balance en móvil */}
                    <div className="flex items-center space-x-3 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        Balance: {parseFloat(balance || "0").toFixed(0)} MXN
                      </span>
                    </div>
                    
                    {/* Botón Depositar en móvil */}
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center space-x-2 px-3 py-2 bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
                    >
                      Depositar
                    </Button>
                    
                    <div className="flex items-center space-x-3 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                      <User className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {getUserDisplay()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {connectionType}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Desconectar y Cerrar Sesión
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
