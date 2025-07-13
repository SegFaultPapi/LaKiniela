"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Key, 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Shield,
  Zap,
  Globe
} from 'lucide-react'
import { usePortalWallet, type WalletBalance, type TransactionRequest } from '@/hooks/usePortalWallet'
import { useToast } from '@/hooks/use-toast'

export function PortalWalletSetup() {
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [sendToAddress, setSendToAddress] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [messageToSign, setMessageToSign] = useState('')
  const [lastTxHash, setLastTxHash] = useState('')
  
  const { toast } = useToast()
  
  const {
    apiKey,
    walletAddress,
    balance,
    isConnected,
    isLoading,
    error,
    isInitialized,
    initializePortal,
    createWallet,
    refreshBalance,
    sendTransaction,
    signMessage,
    disconnect,
    formatBalance,
    getExplorerUrl,
    getAddressUrl,
    config
  } = usePortalWallet()

  // Manejar inicialización del Portal SDK
  const handleInitialize = async () => {
    if (!apiKeyInput.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una API Key válida",
        variant: "destructive"
      })
      return
    }
    
    await initializePortal(apiKeyInput.trim())
  }

  // Manejar creación de wallet
  const handleCreateWallet = async () => {
    await createWallet()
    if (walletAddress) {
      toast({
        title: "¡Wallet creado exitosamente!",
        description: `Dirección: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      })
    }
  }

  // Copiar dirección
  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      toast({
        title: "Dirección copiada",
        description: "La dirección del wallet ha sido copiada al portapapeles"
      })
    }
  }

  // Manejar envío de transacción
  const handleSendTransaction = async () => {
    if (!sendToAddress || !sendAmount) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      })
      return
    }

    try {
      const tx: TransactionRequest = {
        to: sendToAddress,
        value: (parseFloat(sendAmount) * 1e18).toString() // Convertir a wei
      }
      
      const result = await sendTransaction(tx)
      if (result) {
        setLastTxHash(result.hash)
        toast({
          title: "Transacción enviada",
          description: `Hash: ${result.hash.slice(0, 10)}...`
        })
        setSendToAddress('')
        setSendAmount('')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al enviar la transacción",
        variant: "destructive"
      })
    }
  }

  // Manejar firma de mensaje
  const handleSignMessage = async () => {
    if (!messageToSign) {
      toast({
        title: "Error",
        description: "Por favor ingresa un mensaje para firmar",
        variant: "destructive"
      })
      return
    }

    const signature = await signMessage(messageToSign)
    if (signature) {
      toast({
        title: "Mensaje firmado",
        description: `Firma: ${signature.slice(0, 10)}...`
      })
      setMessageToSign('')
    }
  }

  // Mostrar errores
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      })
    }
  }, [error, toast])

  if (!isInitialized) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border border-primary/20 bg-white shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Key className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Configuración del Portal SDK
            </CardTitle>
            <CardDescription className="text-gray-600">
              Ingresa tu API Key del Portal SDK para comenzar a usar wallets descentralizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
                API Key del Portal SDK
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="pk_test_..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Obtén tu API Key en{' '}
                <a 
                  href="https://docs.portalhq.io/"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Portal Dashboard
                </a>
              </p>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuración para Arbitrum Sepolia:</strong>
                <br />
                • Chain ID: {config.chainId}
                <br />
                • Testnet: {config.isTestnet ? 'Sí' : 'No'}
                <br />
                • Explorador: sepolia.arbiscan.io
              </AlertDescription>
            </Alert>

            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleInitialize}
                disabled={isLoading || !apiKeyInput.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inicializando Portal SDK...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Inicializar Portal SDK
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Características del Portal SDK:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Seguro MPC</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Transacciones rápidas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-700">Cross-chain</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header del Wallet */}
      <Card className="border border-primary/20 bg-white shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Portal Wallet
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {isConnected ? `Conectado en Arbitrum Sepolia` : 'Wallet no conectado'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                SDK Inicializado
              </Badge>
              {isConnected && (
                <Badge variant="outline" className="border-primary text-primary">
                  Conectado
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Crear Wallet o Información del Wallet */}
      {!isConnected ? (
        <Card className="border border-primary/20 bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/5 rounded-full w-fit mx-auto">
                <Wallet className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                ¡Crea tu wallet descentralizada!
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Crea un wallet seguro usando el Portal SDK. Tu wallet estará protegido con tecnología MPC.
              </p>
              <Button 
                onClick={handleCreateWallet}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Crear Wallet
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Información del Wallet */}
          <Card className="border border-primary/20 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Información del Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Dirección</Label>
                <div className="flex items-center space-x-2">
                  <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded border flex-1">
                    {walletAddress}
                  </div>
                  <Button variant="outline" size="sm" onClick={copyAddress}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={getAddressUrl(walletAddress!)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Balance</Label>
                  <Button variant="ghost" size="sm" onClick={refreshBalance}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {balance ? formatBalance(balance) : 'Cargando...'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones del Wallet */}
          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="send">Enviar Tokens</TabsTrigger>
              <TabsTrigger value="sign">Firmar Mensaje</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send" className="space-y-4">
              <Card className="border border-primary/20 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Enviar ETH
                  </CardTitle>
                  <CardDescription>
                    Envía ETH a otra dirección en Arbitrum Sepolia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sendTo">Dirección destino</Label>
                    <Input
                      id="sendTo"
                      placeholder="0x..."
                      value={sendToAddress}
                      onChange={(e) => setSendToAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Cantidad (ETH)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.001"
                      placeholder="0.001"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleSendTransaction}
                    disabled={isLoading || !sendToAddress || !sendAmount}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Transacción'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sign" className="space-y-4">
              <Card className="border border-primary/20 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Firmar Mensaje
                  </CardTitle>
                  <CardDescription>
                    Firma un mensaje con tu wallet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje a firmar</Label>
                    <Input
                      id="message"
                      placeholder="Escribe tu mensaje aquí..."
                      value={messageToSign}
                      onChange={(e) => setMessageToSign(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleSignMessage}
                    disabled={isLoading || !messageToSign}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Firmando...
                      </>
                    ) : (
                      'Firmar Mensaje'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Última transacción */}
          {lastTxHash && (
            <Card className="border border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    Última transacción: 
                    <a 
                      href={getExplorerUrl(lastTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 underline hover:no-underline"
                    >
                      {lastTxHash.slice(0, 10)}...
                    </a>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Desconectar */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={disconnect}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Desconectar Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortalWalletSetup 