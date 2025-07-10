"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useWallet } from "@/components/wallet-provider"
import { Menu, X, Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isConnected, balance } = useWallet()
  const pathname = usePathname()

  const navItems = [
    { name: "Inicio", href: "/", active: pathname === "/" },
    { name: "Perfil", href: "/perfil", active: pathname === "/perfil" },
  ]

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

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isConnected && (
                <div className="flex items-center space-x-2 bg-white border border-primary/20 px-3 py-2 rounded-lg">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{balance} MXNB</span>
                </div>
              )}
              <ConnectButton
                label="Conectar"
                accountStatus={{
                  smallScreen: "avatar",
                  largeScreen: "full",
                }}
                chainStatus={{
                  smallScreen: "icon",
                  largeScreen: "full",
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: false,
                }}
              />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:bg-primary/10"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/20">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className={
                      item.active
                        ? "w-full justify-start bg-primary text-white hover:bg-primary/90 border border-primary"
                        : "w-full justify-start text-foreground hover:bg-primary/10 border border-primary/20 bg-white"
                    }
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}

              {/* Mobile Wallet Info */}
              {isConnected && (
                <div className="flex items-center justify-center space-x-2 bg-white border border-primary/20 px-3 py-2 rounded-lg">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{balance} MXNB</span>
                </div>
              )}

              {/* Mobile Connect Button */}
              <div className="flex justify-center pt-2">
                <ConnectButton label="Conectar Wallet" accountStatus="full" chainStatus="full" showBalance={false} />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
