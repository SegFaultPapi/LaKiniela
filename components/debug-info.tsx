"use client"

import { useWallet } from "@/components/wallet-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, CheckCircle, Loader2, TestTube } from "lucide-react"

export function DebugInfo() {
  const {
    isConnected,
    address,
    balance,
    balanceLoading,
    balanceError,
    chainId,
    tokenInfo,
    refetchBalance,
    forceRefreshBalance,
  } = useWallet()

  const handleTestContract = async () => {
    console.log("=== MANUAL CONTRACT TEST ===")
    console.log("Contract address:", "0x82B9e52b26A2954E113F94Ff26647754d5a4247D")
    console.log("Current chain ID:", chainId)
    console.log("Wallet address:", address)
    
    // Verificar si estamos en la red correcta
    if (chainId !== 421614) {
      console.error("❌ Estás en la red incorrecta. Necesitas Arbitrum Sepolia (Chain ID: 421614)")
      return
    }
    
    try {
      // Hacer una llamada directa usando fetch
      const response = await fetch("https://sepolia-rollup.arbitrum.io/rpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D",
              data: "0x06fdde03", // name() function selector
            },
            "latest",
          ],
          id: 1,
        }),
      })
      
      const result = await response.json()
      console.log("RPC Response:", result)
      
      if (result.error) {
        console.error("❌ Error en RPC:", result.error)
      } else {
        console.log("✅ Contrato responde correctamente")
      }
    } catch (error) {
      console.error("❌ Error al probar contrato:", error)
    }
  }

  const handleTestBalance = async () => {
    if (!address) {
      console.error("❌ No hay wallet conectada")
      return
    }
    
    console.log("=== MANUAL BALANCE TEST ===")
    console.log("Address:", address)
    console.log("Contract:", "0x82B9e52b26A2954E113F94Ff26647754d5a4247D")
    
    try {
      // Hacer una llamada directa para balanceOf
      const response = await fetch("https://sepolia-rollup.arbitrum.io/rpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D",
              data: "0x70a08231000000000000000000000000" + address.slice(2), // balanceOf(address)
            },
            "latest",
          ],
          id: 1,
        }),
      })
      
      const result = await response.json()
      console.log("Balance RPC Response:", result)
      
      if (result.error) {
        console.error("❌ Error al obtener balance:", result.error)
      } else if (result.result) {
        const balanceHex = result.result
        const balanceWei = BigInt(balanceHex)
        const balanceEth = Number(balanceWei) / 1e6 // Cambiar de 1e18 a 1e6
        console.log("✅ Balance obtenido:", balanceEth, "MXNB")
        console.log("Balance en wei:", balanceWei.toString())
      }
    } catch (error) {
      console.error("❌ Error al probar balance:", error)
    }
  }

  const handleDirectBalanceCheck = async () => {
    if (!address) {
      console.error("❌ No hay wallet conectada")
      return
    }
    
    console.log("=== VERIFICACIÓN DIRECTA DEL BALANCE ===")
    console.log("Address:", address)
    console.log("Contract:", "0x82B9e52b26A2954E113F94Ff26647754d5a4247D")
    
    try {
      // Llamada directa al RPC
      const response = await fetch("https://sepolia-rollup.arbitrum.io/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{
            to: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D",
            data: "0x70a08231000000000000000000000000" + address.slice(2),
          }, "latest"],
          id: 1,
        }),
      })
      
      const result = await response.json()
      console.log("RPC Response:", result)
      
      if (result.error) {
        console.error("❌ Error en RPC:", result.error)
        alert(`Error en RPC: ${result.error.message}`)
      } else if (result.result) {
        const balanceHex = result.result
        const balanceWei = BigInt(balanceHex)
        const balanceEth = Number(balanceWei) / 1e6 // Cambiar de 1e18 a 1e6
        
        console.log("✅ Balance directo:", balanceEth, "MXNB")
        console.log("Balance en wei:", balanceWei.toString())
        console.log("Balance en hex:", balanceHex)
        
        alert(`Balance directo: ${balanceEth.toFixed(2)} MXNB\nWei: ${balanceWei.toString()}\nHex: ${balanceHex}`)
      }
    } catch (error) {
      console.error("❌ Error al verificar balance:", error)
      alert(`Error: ${error}`)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <Card className="border border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Debug Info - Balance MXNB
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-yellow-800">Wallet:</span>
            <div className="text-yellow-700 font-mono text-xs break-all">
              {address}
            </div>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Chain ID:</span>
            <div className="text-yellow-700">
              {chainId} {chainId === 421614 ? "(Arbitrum Sepolia)" : chainId === 42161 ? "(Arbitrum)" : "(Desconocida)"}
            </div>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Balance MXNB:</span>
            <div className="text-yellow-700 font-bold text-lg flex items-center">
              {balanceLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : balanceError ? (
                <span className="text-red-600">Error: {balanceError.message}</span>
              ) : (
                <>
                  {balance} MXNB
                  <Badge variant="outline" className="ml-2 text-xs">
                    {balance === "0.00" ? "⚠️ Verificar" : "✅ OK"}
                  </Badge>
                </>
              )}
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              Estado: {balanceLoading ? "Cargando..." : balanceError ? "Error" : "Actualizado"}
            </div>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Token Info:</span>
            <div className="text-yellow-700 text-xs">
              {tokenInfo.name || "Cargando..."} ({tokenInfo.symbol || "..."}) - {tokenInfo.decimals || "..."} decimals
            </div>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Contrato MXNB:</span>
            <div className="text-yellow-700 font-mono text-xs break-all">
              {tokenInfo.address}
            </div>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Estado de Red:</span>
            <div className="text-yellow-700">
              {chainId === 421614 ? (
                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Arbitrum Sepolia
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Red Incorrecta
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-yellow-300 pt-3">
          <h4 className="font-medium text-yellow-800 mb-2">Acciones:</h4>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={refetchBalance} className="text-yellow-800 border-yellow-600">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refrescar Balance
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => window.open(`https://sepolia.arbiscan.io/address/${address}`, '_blank')}
              className="text-yellow-800 border-yellow-600"
            >
              Ver en Explorer
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => window.open(`https://sepolia.arbiscan.io/address/${tokenInfo.address}`, '_blank')}
              className="text-yellow-800 border-yellow-600"
            >
              Ver Contrato
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleTestContract}
              className="text-yellow-800 border-yellow-600"
            >
              <TestTube className="w-4 h-4 mr-1" />
              Probar Contrato
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleTestBalance}
              className="text-yellow-800 border-yellow-600"
            >
              <Loader2 className="w-4 h-4 mr-1" />
              Probar Balance
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDirectBalanceCheck}
              className="text-yellow-800 border-yellow-600"
            >
              <TestTube className="w-4 h-4 mr-1" />
              Ver Balance Directo
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                console.log("=== FORZANDO RECARGA ===")
                refetchBalance()
                setTimeout(() => {
                  console.log("Balance después de recarga:", balance)
                }, 2000)
              }}
              className="text-yellow-800 border-yellow-600"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Forzar Recarga
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={forceRefreshBalance}
              className="text-yellow-800 border-yellow-600"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualizar Balance
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                console.log("=== ESTADO COMPLETO DEL BALANCE ===")
                console.log("Balance en UI:", balance)
                console.log("Balance loading:", balanceLoading)
                console.log("Balance error:", balanceError)
                console.log("Chain ID:", chainId)
                console.log("Address:", address)
                console.log("Contract:", tokenInfo.address)
                console.log("Token info:", tokenInfo)
                console.log("================================")
              }}
              className="text-yellow-800 border-yellow-600"
            >
              <TestTube className="w-4 h-4 mr-1" />
              Estado Completo
            </Button>
          </div>
        </div>

        <div className="border-t border-yellow-300 pt-3">
          <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting:</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>• Asegúrate de estar en Arbitrum Sepolia (Chain ID: 421614)</div>
            <div>• Verifica que tengas MXNB en tu wallet</div>
            <div>• Revisa la consola del navegador para más detalles</div>
            <div>• Si el balance es 0, necesitas obtener MXNB de un faucet</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 