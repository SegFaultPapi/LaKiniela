import { createPublicClient, http, getContract } from 'viem'
import { arbitrumSepolia } from 'wagmi/chains'
import { CONTRACTS, MXNB_TOKEN_ABI } from './web3-config'

// Cliente público para Arbitrum Sepolia
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
})

// Función para probar el contrato MXNB
export async function testMXNBContract() {
  try {
    console.log('=== TESTING MXNB CONTRACT ===')
    console.log('Contract address:', CONTRACTS.MXNB_TOKEN)
    
    // Obtener información del token
    const name = await publicClient.readContract({
      address: CONTRACTS.MXNB_TOKEN,
      abi: MXNB_TOKEN_ABI,
      functionName: 'name',
    })
    console.log('Token name:', name)
    
    const symbol = await publicClient.readContract({
      address: CONTRACTS.MXNB_TOKEN,
      abi: MXNB_TOKEN_ABI,
      functionName: 'symbol',
    })
    console.log('Token symbol:', symbol)
    
    const decimals = await publicClient.readContract({
      address: CONTRACTS.MXNB_TOKEN,
      abi: MXNB_TOKEN_ABI,
      functionName: 'decimals',
    })
    console.log('Token decimals:', decimals)
    
    console.log('=== CONTRACT TEST SUCCESSFUL ===')
    return { success: true, name, symbol, decimals }
  } catch (error) {
    console.error('=== CONTRACT TEST FAILED ===')
    console.error('Error:', error)
    return { success: false, error }
  }
}

// Función para probar balance de una dirección específica
export async function testBalance(address: string) {
  try {
    console.log('=== TESTING BALANCE ===')
    console.log('Address:', address)
    
    const balance = await publicClient.readContract({
      address: CONTRACTS.MXNB_TOKEN,
      abi: MXNB_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    })
    console.log('Balance (raw):', balance)
    console.log('Balance (formatted):', Number(balance) / 1e6)
    
    return { success: true, balance }
  } catch (error) {
    console.error('=== BALANCE TEST FAILED ===')
    console.error('Error:', error)
    return { success: false, error }
  }
} 