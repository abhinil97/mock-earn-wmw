import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import type { Asset, MarketData } from './types/api'

// Module address for supply logic
const MODULE_ADDRESS = '0x39ddcd9e1a39fa14f25e3f9ec8a86074d05cc0881cbf667df8a6ee70942016fb'

// Initialize Aptos client
const config = new AptosConfig({ network: Network.MAINNET })
const aptos = new Aptos(config)

export interface SupplyParams {
  asset: Asset
  market: MarketData
  amount: string
  userAddress: string
  signAndSubmitTransaction: (payload: any) => Promise<any>
}

export interface SupplyResult {
  success: boolean
  hash?: string
  error?: string
}

/**
 * Execute a supply transaction on the Aptos blockchain
 * @param params Supply transaction parameters
 * @returns Supply result with transaction hash or error
 */
export async function executeSupply(params: SupplyParams): Promise<SupplyResult> {
  const { asset, market, amount, userAddress, signAndSubmitTransaction } = params

  try {
    // Convert amount to the correct decimals
    const amountFloat = parseFloat(amount)
    const amountWithDecimals = Math.floor(amountFloat * Math.pow(10, asset.decimals))

    console.log('Supply Transaction Details:', {
      asset: asset.symbol,
      tokenAddress: asset.tokenAddress,
      reserveObject: market.reserveObject,
      amountInput: amount,
      amountWithDecimals: amountWithDecimals.toString(),
      decimals: asset.decimals,
      userAddress: userAddress
    })

    // Build the transaction payload using the correct Aptos SDK format
    const functionName = `${MODULE_ADDRESS}::supply_logic::supply`
    
    console.log('Transaction Details:', {
      function: functionName,
      arguments: [
        asset.tokenAddress, // asset address
        amountWithDecimals.toString(), // amount as u256
        userAddress, // on_behalf_of (self)
        0 // referral_code as u16
      ]
    })

    // Sign and submit the transaction
    const response = await signAndSubmitTransaction({
      data: {
        function: functionName,
        typeArguments: [],
        functionArguments: [
          asset.tokenAddress, // asset address
          amountWithDecimals.toString(), // amount as u256
          userAddress, // on_behalf_of (self)
          0 // referral_code as u16
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
    console.error('Supply transaction failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

