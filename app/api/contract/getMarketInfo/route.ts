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
    const { marketId, contractAddress } = await request.json()

    if (marketId === undefined || !contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Llamar a la función getMarketInfo del contrato
    const result = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: PREDICTION_MARKET_SIMPLE_ABI,
      functionName: 'getMarketInfo',
      args: [BigInt(marketId)]
    })

    // El resultado es un array: [question, optionA, optionB, endTime, outcome, totalOptionAShares, totalOptionBShares, resolved]
    const [
      question,
      optionA,
      optionB,
      endTime,
      outcome,
      totalOptionAShares,
      totalOptionBShares,
      resolved
    ] = result as [string, string, string, bigint, number, bigint, bigint, boolean]

    return NextResponse.json({
      question,
      optionA,
      optionB,
      endTime: endTime.toString(),
      outcome,
      totalOptionAShares: totalOptionAShares.toString(),
      totalOptionBShares: totalOptionBShares.toString(),
      resolved
    })

  } catch (error) {
    console.error('Error in getMarketInfo API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market info' },
      { status: 500 }
    )
  }
} 