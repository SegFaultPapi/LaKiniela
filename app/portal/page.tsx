import { Metadata } from 'next'
import { PortalWalletSetup } from '@/components/portal-wallet-setup'

export const metadata: Metadata = {
  title: 'Portal Wallet - La Kiniela',
  description: 'Configura tu wallet descentralizada usando el Portal SDK para interactuar con La Kiniela en Arbitrum Sepolia',
}

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Portal Wallet
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Configura tu wallet descentralizada usando el Portal SDK para interactuar con La Kiniela 
            en Arbitrum Sepolia. Disfruta de la seguridad MPC y transacciones rápidas.
          </p>
        </div>
        
        <PortalWalletSetup />
      </div>
    </div>
  )
} 