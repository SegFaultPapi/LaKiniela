"use client"

import { usePredictionMarket } from "@/hooks/use-prediction-market"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

export function DebugInfo() {
  const {
    isConnected,
    address,
    balance,
    chainId,
    tokenInfo,
    refetchBalance,
  } = usePredictionMarket()

  const handleRefresh = () => {
    refetchBalance()
  }

  if (!isConnected) {
    return null
  }

  return (
    <Card className="border border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
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
            <div className="text-yellow-700 font-bold">{balance}</div>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Token Info:</span>
            <div className="text-yellow-700 text-xs">
              {tokenInfo.name} ({tokenInfo.symbol}) - {tokenInfo.decimals} decimals
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-yellow-800 border-yellow-600">
            {chainId === 421614 ? "Red Correcta" : "Red Incorrecta"}
            {chainId === 421614 ? <CheckCircle className="w-3 h-3 ml-1" /> : <AlertCircle className="w-3 h-3 ml-1" />}
          </Badge>
          <Button size="sm" variant="outline" onClick={handleRefresh} className="text-yellow-800 border-yellow-600">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refrescar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 