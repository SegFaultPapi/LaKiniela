// Script para verificar conectividad de contratos desde la consola del navegador
// Uso: Abre la consola del navegador (F12) y ejecuta: window.checkContracts()

import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { CONTRACTS, MXNB_TOKEN_ABI, PREDICTION_MARKET_ABI } from './contracts-config'

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http()
})

export async function checkContracts(userAddress?: string) {
  console.log('🔍 Verificando conectividad de contratos...')
  console.log('📍 Red: Arbitrum Sepolia')
  console.log('🔗 Contrato Principal:', CONTRACTS.PREDICTION_MARKET)
  console.log('🪙 Token MXNB:', CONTRACTS.MXNB_TOKEN)
  
  const results = {
    network: 'Arbitrum Sepolia',
    timestamp: new Date().toISOString(),
    mxnbToken: {} as any,
    predictionMarket: {} as any,
    userInfo: {} as any
  }

  try {
    // 1. Verificar token MXNB
    console.log('\n🪙 Verificando token MXNB...')
    
    try {
      const tokenName = await client.readContract({
        address: CONTRACTS.MXNB_TOKEN,
        abi: MXNB_TOKEN_ABI,
        functionName: 'name'
      })
      results.mxnbToken.name = tokenName
      console.log('✅ Nombre del token:', tokenName)
    } catch (error) {
      results.mxnbToken.nameError = (error as Error).message
      console.log('❌ Error leyendo nombre:', (error as Error).message)
    }

    try {
      const tokenSymbol = await client.readContract({
        address: CONTRACTS.MXNB_TOKEN,
        abi: MXNB_TOKEN_ABI,
        functionName: 'symbol'
      })
      results.mxnbToken.symbol = tokenSymbol
      console.log('✅ Símbolo del token:', tokenSymbol)
    } catch (error) {
      results.mxnbToken.symbolError = (error as Error).message
      console.log('❌ Error leyendo símbolo:', (error as Error).message)
    }

    // 2. Verificar contrato principal
    console.log('\n🎯 Verificando contrato principal...')
    
    try {
      const marketCount = await client.readContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'marketCount'
      })
      results.predictionMarket.marketCount = marketCount.toString()
      console.log('✅ Número de mercados:', marketCount.toString())
    } catch (error) {
      results.predictionMarket.marketCountError = (error as Error).message
      console.log('❌ Error leyendo marketCount:', (error as Error).message)
    }

    try {
      const bettingToken = await client.readContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'bettingToken'
      }) as string
      results.predictionMarket.bettingToken = bettingToken
      results.predictionMarket.tokenMatches = bettingToken.toLowerCase() === CONTRACTS.MXNB_TOKEN.toLowerCase()
      console.log('✅ Token de apuestas configurado:', bettingToken)
      console.log(
        results.predictionMarket.tokenMatches 
          ? '✅ Token configurado correctamente' 
          : '❌ Token NO coincide con la configuración'
      )
    } catch (error) {
      results.predictionMarket.bettingTokenError = (error as Error).message
      console.log('❌ Error leyendo bettingToken:', (error as Error).message)
    }

    // 3. Verificar información del usuario (si se proporciona dirección)
    if (userAddress) {
      console.log('\n👤 Verificando información del usuario...')
      
      try {
        const balance = await client.readContract({
          address: CONTRACTS.MXNB_TOKEN,
          abi: MXNB_TOKEN_ABI,
          functionName: 'balanceOf',
          args: [userAddress as `0x${string}`]
        })
        results.userInfo.balance = balance.toString()
        results.userInfo.balanceFormatted = (Number(balance) / 1e6).toFixed(4)
        console.log('✅ Balance MXNB:', results.userInfo.balanceFormatted, 'MXNB')
      } catch (error) {
        results.userInfo.balanceError = (error as Error).message
        console.log('❌ Error leyendo balance:', (error as Error).message)
      }

      try {
        const allowance = await client.readContract({
          address: CONTRACTS.MXNB_TOKEN,
          abi: MXNB_TOKEN_ABI,
          functionName: 'allowance',
          args: [userAddress as `0x${string}`, CONTRACTS.PREDICTION_MARKET]
        })
        results.userInfo.allowance = allowance.toString()
        results.userInfo.hasInfiniteAllowance = allowance > BigInt('1000000000000000000000000') // > 1M tokens
        console.log('✅ Allowance:', (Number(allowance) / 1e6).toFixed(4), 'MXNB')
        console.log(
          results.userInfo.hasInfiniteAllowance 
            ? '✅ Tiene allowance infinito' 
            : '⚠️ Allowance limitado'
        )
      } catch (error) {
        results.userInfo.allowanceError = (error as Error).message
        console.log('❌ Error leyendo allowance:', (error as Error).message)
      }
    }

    // 4. Resumen
    console.log('\n📊 RESUMEN:')
    console.log('Token MXNB:', results.mxnbToken.name && results.mxnbToken.symbol ? '✅ OK' : '❌ Error')
    console.log('Contrato Principal:', results.predictionMarket.marketCount ? '✅ OK' : '❌ Error')
    console.log('Configuración:', results.predictionMarket.tokenMatches ? '✅ Correcta' : '❌ Incorrecta')
    
    if (userAddress) {
      console.log('Balance Usuario:', results.userInfo.balance ? '✅ OK' : '❌ Error')
      console.log('Allowance:', results.userInfo.allowance ? '✅ OK' : '❌ Error')
    }

    console.log('\n📋 Enlaces útiles:')
    console.log('🔍 Contrato Principal:', `https://sepolia.arbiscan.io/address/${CONTRACTS.PREDICTION_MARKET}`)
    console.log('🪙 Token MXNB:', `https://sepolia.arbiscan.io/address/${CONTRACTS.MXNB_TOKEN}`)

    return results

  } catch (error) {
    console.error('❌ Error general:', error)
    return { error: (error as Error).message, ...results }
  }
}

// Hacer la función disponible globalmente en el navegador
if (typeof window !== 'undefined') {
  (window as any).checkContracts = checkContracts
  console.log('✅ Función checkContracts() disponible en la consola')
  console.log('💡 Uso: checkContracts() o checkContracts("0xTU_DIRECCION")')
}

// Función rápida para verificar solo conectividad básica
export async function quickCheck() {
  console.log('⚡ Verificación rápida...')
  
  try {
    // Verificar si los contratos responden
    const [tokenSymbol, marketCount] = await Promise.allSettled([
      client.readContract({
        address: CONTRACTS.MXNB_TOKEN,
        abi: MXNB_TOKEN_ABI,
        functionName: 'symbol'
      }),
      client.readContract({
        address: CONTRACTS.PREDICTION_MARKET,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'marketCount'
      })
    ])

    console.log('🪙 Token MXNB:', tokenSymbol.status === 'fulfilled' ? '✅ OK' : '❌ Error')
    console.log('🎯 Contrato Principal:', marketCount.status === 'fulfilled' ? '✅ OK' : '❌ Error')

    if (tokenSymbol.status === 'fulfilled' && marketCount.status === 'fulfilled') {
      console.log('🎉 Ambos contratos funcionan correctamente')
      return true
    } else {
      console.log('⚠️ Hay problemas con los contratos')
      return false
    }
  } catch (error) {
    console.error('❌ Error en verificación rápida:', error)
    return false
  }
}

if (typeof window !== 'undefined') {
  (window as any).quickCheck = quickCheck
} 