import { ContractDiagnostics } from '@/components/contract-diagnostics'

export default function DiagnosticsPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Diagnóstico de Contratos</h1>
        <p className="text-gray-600">
          Herramienta para identificar y solucionar problemas de conectividad con los smart contracts de LaKiniela.
        </p>
      </div>
      
      <ContractDiagnostics />
      
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Problemas Comunes y Soluciones</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-red-600">❌ Balance MXNB no se muestra</h3>
            <p className="text-gray-700">
              <strong>Causa:</strong> El token MXNB no existe en la dirección configurada o hay problemas de red.
            </p>
            <p className="text-gray-700">
              <strong>Solución:</strong> Verifica que estés en Arbitrum Sepolia y que la dirección del token sea correcta.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-red-600">❌ No puedo interactuar con el contrato</h3>
            <p className="text-gray-700">
              <strong>Causa:</strong> El contrato no está deployado en la dirección configurada o el ABI no coincide.
            </p>
            <p className="text-gray-700">
              <strong>Solución:</strong> Verifica la dirección del contrato en Arbiscan y asegúrate de que esté deployado correctamente.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-red-600">❌ Market Count muestra "Error"</h3>
            <p className="text-gray-700">
              <strong>Causa:</strong> El contrato no tiene la función marketCount o hay un error en el ABI.
            </p>
            <p className="text-gray-700">
              <strong>Solución:</strong> Verifica que hayas deployado el contrato PredictionMarketSimple.sol correcto.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-green-600">✅ Token configurado incorrectamente</h3>
            <p className="text-gray-700">
              <strong>Causa:</strong> La dirección del token MXNB en el contrato no coincide con la configuración del frontend.
            </p>
            <p className="text-gray-700">
              <strong>Solución:</strong> Actualiza las direcciones en lib/web3-config.ts o redeploya el contrato con la dirección correcta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 