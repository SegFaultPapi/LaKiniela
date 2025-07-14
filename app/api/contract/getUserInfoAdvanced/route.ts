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
    const { userAddress, amount, contractAddress } = await request.json()

    if (!userAddress || !amount || !contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Llamar a la función getUserInfoAdvanced del contrato
    const result = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: PREDICTION_MARKET_SIMPLE_ABI,
      functionName: 'getUserInfoAdvanced',
      args: [userAddress as `0x${string}`, BigInt(amount)]
    })

    // El resultado es un array: [balance, allowance, hasInfinite, needsApprovalForAmount]
    const [balance, allowance, hasInfinite, needsApprovalForAmount] = result as [bigint, bigint, boolean, boolean]

    return NextResponse.json({
      balance: balance.toString(),
      allowance: allowance.toString(),
      hasInfinite,
      needsApprovalForAmount
    })

  } catch (error) {
    console.error('Error in getUserInfoAdvanced API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user info' },
      { status: 500 }
    )
  }
} 