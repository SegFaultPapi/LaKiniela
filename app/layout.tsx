import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/components/wallet-provider"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "La Kiniela - Apuestas Descentralizadas",
  description: "Plataforma de apuestas descentralizadas usando MXNB en Arbitrum",
    generator: 'v0.dev'
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
          <main className="min-h-screen bg-gray-50">{children}</main>
        </WalletProvider>
      </body>
    </html>
  )
}
