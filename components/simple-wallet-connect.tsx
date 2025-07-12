"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useBalance, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function SimpleWalletConnect() {
    const { address, isConnected, chain } = useAccount()
    const { data: balance } = useBalance({ address })
    const { disconnect } = useDisconnect()
    const [copied, setCopied] = useState(false)

    const copyAddress = async () => {
        if (address) {
            await navigator.clipboard.writeText(address)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const getExplorerUrl = () => {
        if (!address || !chain) return ""
        if (chain.id === 421614) {
            return `https://sepolia.arbiscan.io/address/${address}`
        }
        return `https://arbiscan.io/address/${address}`
    }

    if (!isConnected || !address) {
        return (
            <div className="flex items-center">
                <ConnectButton.Custom>
                    {({ openConnectModal, connectModalOpen }) => (
                        <Button
                            onClick={openConnectModal}
                            disabled={connectModalOpen}
                            className="bg-white border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                        >
                            <Wallet className="w-4 h-4 mr-2" />
                            Conectar Wallet
                        </Button>
                    )}
                </ConnectButton.Custom>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3">
            {/* Balance display */}
            {balance && (
                <div className="flex items-center gap-2 bg-white border border-primary/20 px-3 py-2 rounded-lg">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                        {Number.parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                    </span>
                </div>
            )}

            {/* Account dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="bg-white border border-primary/20 text-primary hover:bg-primary/10"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-mono text-sm">{formatAddress(address)}</span>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? "¡Copiado!" : "Copiar dirección"}
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <a
                            href={getExplorerUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center cursor-pointer"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver en explorador
                        </a>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => disconnect()}
                        className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Desconectar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Chain selector */}
            {chain && (
                <ConnectButton.Custom>
                    {({ openChainModal, chainModalOpen }) => (
                        <Button
                            onClick={openChainModal}
                            disabled={chainModalOpen}
                            variant="outline"
                            size="sm"
                            className="bg-white border border-primary/20 text-primary hover:bg-primary/10"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs">{chain.name}</span>
                            </div>
                        </Button>
                    )}
                </ConnectButton.Custom>
            )}
        </div>
    )
} 