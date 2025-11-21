import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import type { Asset, MarketData } from './types/api'

// Module address for withdraw logic
const MODULE_ADDRESS = '0x39ddcd9e1a39fa14f25e3f9ec8a86074d05cc0881cbf667df8a6ee70942016fb'

// Initialize Aptos client
const config = new AptosConfig({ network: Network.MAINNET })
const aptos = new Aptos(config)

export interface WithdrawParams {
  asset: Asset
  market: MarketData
  amount: string
  userAddress: string
  signAndSubmitTransaction: (payload: any) => Promise<any>
}

export interface WithdrawResult {
  success: boolean
  hash?: string
  error?: string
}

/**
 * Execute a withdraw transaction on the Aptos blockchain
 * @param params Withdraw transaction parameters
 * @returns Withdraw result with transaction hash or error
 */
export async function executeWithdraw(params: WithdrawParams): Promise<WithdrawResult> {
  const { asset, amount, userAddress, signAndSubmitTransaction } = params

  try {
    // Convert amount to the correct decimals
    const amountFloat = parseFloat(amount)
    const amountWithDecimals = Math.floor(amountFloat * Math.pow(10, asset.decimals))


    // Build the transaction payload using the correct Aptos SDK format
    const functionName = `${MODULE_ADDRESS}::supply_logic::withdraw`
    
    console.log('Transaction Details:', {
      function: functionName,
      arguments: [
        asset.tokenAddress, // asset address
        amountWithDecimals, // amount as u256
        userAddress, // to (self)
      ]
    })

    // Sign and submit the transaction
    const response = await signAndSubmitTransaction({
      data: {
        function: functionName,
        typeArguments: [],
        functionArguments: [
          asset.tokenAddress, // asset address
          amountWithDecimals, // amount as u256
          userAddress, // to (self)
        ]
      }
    })

    console.log('Transaction Response:', response)
    
    // Wait for transaction to be confirmed
    if (response.hash) {
      console.log('Waiting for transaction confirmation...')
      const txn = await aptos.waitForTransaction({
        transactionHash: response.hash
      })
      console.log('Transaction Confirmed:', txn)
      
      return {
        success: true,
        hash: response.hash
      }
    }

    return {
      success: false,
      error: 'No transaction hash returned'
    }
  } catch (error) {
    console.error('Withdraw transaction failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

