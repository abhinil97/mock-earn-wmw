import { useState } from 'react'
import { Button } from './ui/button.tsx'
import { useWallet, groupAndSortWallets, WalletReadyState } from '@aptos-labs/wallet-adapter-react'

export function Header() {
  const { account, connected, connect, disconnect, wallets } = useWallet()
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false)

  // Group and sort wallets by ready state
  const { availableWallets, installableWallets } = groupAndSortWallets(wallets)

  // Combine all wallets for display
  const allWallets = [...availableWallets, ...installableWallets]

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName)
      setIsWalletSelectorOpen(false)
    } catch (error) {
      console.error('Error connecting to wallet:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Error disconnecting from wallet:', error)
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getAddressString = () => {
    if (!account?.address) return ''
    return typeof account.address === 'string' 
      ? account.address 
      : account.address.toString()
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
          {connected && account ? (
            <div className="flex items-center space-x-2">
              <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
                {truncateAddress(getAddressString())}
              </div>
              <Button
                variant="outline"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Button
                onClick={() => setIsWalletSelectorOpen(!isWalletSelectorOpen)}
              >
                Connect Wallet
              </Button>

              {isWalletSelectorOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-sm font-semibold px-3 py-2 text-foreground">
                      Select Wallet
                    </div>
                    <div className="space-y-1">
                      {allWallets.map((wallet) => (
                        <button
                          key={wallet.name}
                          onClick={() => {
                            if (wallet.readyState === WalletReadyState.Installed) {
                              handleConnect(wallet.name)
                            } else {
                              window.open(wallet.url, '_blank')
                            }
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-muted rounded-md transition-colors"
                        >
                          <img
                            src={wallet.icon}
                            alt={wallet.name}
                            className="w-6 h-6"
                          />
                          <span className="text-sm font-medium text-foreground">
                            {wallet.name}
                          </span>
                          {wallet.readyState === WalletReadyState.NotDetected && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              Install
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Backdrop to close wallet selector */}
      {isWalletSelectorOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsWalletSelectorOpen(false)}
        />
      )}
    </header>
  )
}

