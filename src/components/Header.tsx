import { useState, useEffect } from 'react'
import { Button } from './ui/button.tsx'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

// Define Petra wallet types
interface PetraWallet {
  connect: () => Promise<{ address: string }>
  disconnect: () => Promise<void>
  account: () => Promise<{ address: string }>
  isConnected: () => Promise<boolean>
}

declare global {
  interface Window {
    aptos?: PetraWallet
  }
}

export function Header() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Initialize Aptos client
  const config = new AptosConfig({ network: Network.MAINNET })
  const aptos = new Aptos(config)

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (window.aptos) {
      try {
        const isConnected = await window.aptos.isConnected()
        if (isConnected) {
          const account = await window.aptos.account()
          setWalletAddress(account.address)
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.aptos) {
      alert('Petra Wallet is not installed. Please install it from the Chrome Web Store.')
      window.open('https://petra.app/', '_blank')
      return
    }

    setIsConnecting(true)
    try {
      const response = await window.aptos.connect()
      setWalletAddress(response.address)
      console.log('Connected to wallet:', response.address)
    } catch (error) {
      console.error('Error connecting to wallet:', error)
      alert('Failed to connect to Petra Wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    if (window.aptos) {
      try {
        await window.aptos.disconnect()
        setWalletAddress(null)
        console.log('Disconnected from wallet')
      } catch (error) {
        console.error('Error disconnecting from wallet:', error)
      }
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-foreground">
            Mock Earn WMW
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {walletAddress ? (
            <div className="flex items-center space-x-2">
              <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
                {truncateAddress(walletAddress)}
              </div>
              <Button
                variant="outline"
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Petra Wallet'}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

