"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Trophy, User, Home, Target, Menu } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useWallet } from "./wallet-provider"

export function Navbar() {
  const pathname = usePathname()
  const { balance } = useWallet()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/apuestas", label: "Apuestas", icon: Target },
    { href: "/perfil", label: "Perfil", icon: User },
  ]

  const NavContent = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isActive ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </>
  )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">La Kiniela</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavContent />
          </div>

          {/* Wallet Section */}
          <div className="flex items-center space-x-4">
            {/* Balance MXNB */}
            {balance !== "0.00" && (
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">{balance} MXNB</div>
                <div className="text-xs text-gray-500">Balance disponible</div>
              </div>
            )}

            {/* RainbowKit Connect Button */}
            <ConnectButton
              label="Conectar Wallet"
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

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavContent />

                  {balance !== "0.00" && (
                    <div className="pt-4 border-t">
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <div className="text-sm font-medium text-gray-900">{balance} MXNB</div>
                        <div className="text-xs text-gray-500">Balance disponible</div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
