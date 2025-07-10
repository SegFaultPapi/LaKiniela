"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Shield, Zap, Globe, ArrowRight, CheckCircle, Wallet } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"

export default function InicioPage() {
  const { isConnected, events } = useWallet()

  const caracteristicas = [
    {
      icon: Shield,
      titulo: "Seguro y Descentralizado",
      descripcion: "Tus fondos están protegidos por contratos inteligentes en Arbitrum",
    },
    {
      icon: Zap,
      titulo: "Transacciones Rápidas",
      descripcion: "Apuesta y recibe ganancias al instante con bajas comisiones",
    },
    {
      icon: Globe,
      titulo: "Para Latinoamérica",
      descripcion: "Diseñado específicamente para la comunidad latina con MXNB",
    },
  ]

  const pasos = [
    "Conecta tu wallet compatible con Arbitrum",
    "Deposita MXNB en tu cuenta",
    "Elige un evento y realiza tu apuesta",
    "¡Gana y reclama tus recompensas!",
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Trophy className="w-4 h-4 mr-2" />
              Plataforma Web3 de Apuestas
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Bienvenido a{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                La Kiniela
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              La primera plataforma de apuestas descentralizadas para Latinoamérica. Apuesta en deportes, política,
              cripto y más usando MXNB en la red Arbitrum.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isConnected ? (
              <Link href="/apuestas">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg">
                  Explorar Apuestas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <ConnectButton label="Conectar Wallet" />
                <p className="text-sm text-gray-500">Conecta tu wallet para comenzar a apostar</p>
              </div>
            )}
            <Link href="/apuestas">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg bg-transparent">
                Ver Eventos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Estado de conexión */}
      {isConnected && (
        <section className="py-8">
          <Card className="bg-green-50 border-green-200 max-w-2xl mx-auto">
            <CardContent className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">¡Wallet Conectado!</h3>
              <p className="text-green-600 mb-4">
                Tu wallet está conectado y listo para apostar. Hay {events.length} eventos activos disponibles.
              </p>
              <Link href="/apuestas">
                <Button className="bg-green-600 hover:bg-green-700">Ver Eventos Activos</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Características */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir La Kiniela?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nuestra plataforma combina la seguridad de blockchain con la facilidad de uso que necesitas para apostar de
            forma inteligente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caracteristicas.map((caracteristica, index) => {
            const Icon = caracteristica.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{caracteristica.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{caracteristica.descripcion}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-16 bg-white rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comenzar a apostar en La Kiniela es muy sencillo. Sigue estos pasos:
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {pasos.map((paso, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg text-gray-700">{paso}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          {!isConnected && (
            <div className="space-y-4">
              <ConnectButton label="Comenzar Ahora" />
              <p className="text-sm text-gray-500">
                <Wallet className="w-4 h-4 inline mr-1" />
                Necesitas una wallet compatible con Arbitrum
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats en tiempo real */}
      <section className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{isConnected ? events.length : "---"}</div>
            <div className="text-gray-600">Eventos Activos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">Arbitrum</div>
            <div className="text-gray-600">Red Blockchain</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">MXNB</div>
            <div className="text-gray-600">Token de Apuestas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">Web3</div>
            <div className="text-gray-600">Tecnología</div>
          </div>
        </div>
      </section>

      {/* Información de red */}
      <section className="py-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Información de Red</h3>
            <p className="text-blue-600 text-sm">
              La Kiniela funciona en la red Arbitrum. Asegúrate de tener tu wallet configurada para Arbitrum y tener
              MXNB para apostar.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
