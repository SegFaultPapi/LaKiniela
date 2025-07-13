import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import { WalletProvider } from "@/components/wallet-provider"
import { Navbar } from "@/components/navbar"
import { ChatbaseWidget } from "@/components/chatbase-widget"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "La Kiniela - Predicciones Descentralizadas",
  description: "Plataforma de predicciones descentralizadas para Latinoamérica",
}

// Suprimir warning específico de errorCorrection de RainbowKit
if (typeof window !== 'undefined') {
  const originalConsoleWarn = console.warn
  console.warn = (...args) => {
    if (args[0]?.includes?.('errorCorrection') || args[0]?.includes?.('React does not recognize')) {
      return // Suprimir estos warnings específicos
    }
    originalConsoleWarn.apply(console, args)
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <WalletProvider>
          <Navbar />
          <main className="min-h-screen bg-background">{children}</main>
          <ChatbaseWidget chatbotId="9yg5No15K56pB7G1AbONq" />

        </WalletProvider>
      </body>
    </html>
  )
}
