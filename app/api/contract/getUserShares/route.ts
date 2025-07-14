import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { PREDICTION_MARKET_SIMPLE_ABI } from '@/lib/prediction-market-abi'

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http()
})

export async function POST(request: NextRequest) {
  try {
    const { marketId, userAddress, contractAddress } = await request.json()

    if (marketId === undefined || !userAddress || !contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Llamar a la función getUserShares del contrato
    const result = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: PREDICTION_MARKET_SIMPLE_ABI,
      functionName: 'getUserShares',
      args: [BigInt(marketId), userAddress as `0x${string}`]
    })

    // El resultado es un array: [optionAShares, optionBShares]
    const [optionAShares, optionBShares] = result as [bigint, bigint]

    return NextResponse.json({
      optionAShares: optionAShares.toString(),
      optionBShares: optionBShares.toString()
    })

  } catch (error) {
    console.error('Error in getUserShares API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user shares' },
      { status: 500 }
    )
  }
} 