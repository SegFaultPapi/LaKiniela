import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/components/wallet-provider"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "La Kiniela - Markets Descentralizados",
  description: "Plataforma de markets descentralizados usando MXNB en Arbitrum",
  generator: "v0.dev",
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
        </WalletProvider>
      </body>
    </html>
  )
}
