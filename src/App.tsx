import { useState } from 'react'
import { Header } from './components/Header.tsx'
import { SupplyModal } from './components/SupplyModal.tsx'
import { WithdrawModal } from './components/WithdrawModal.tsx'
import { PositionCard } from './components/PositionCard.tsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card.tsx'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useAssets, useAssetsWithMarkets, useUserPortfolio } from './hooks'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { Asset, MarketData } from './services/types/api'
import { executeSupply } from './services/supplyService'
import { executeWithdraw } from './services/withdrawService'

function App() {
  const { account, connected, signAndSubmitTransaction } = useWallet()
  
  // Supply Modal state
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Withdraw Modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [withdrawAsset, setWithdrawAsset] = useState<Asset | null>(null)
  const [withdrawMarket, setWithdrawMarket] = useState<MarketData | null>(null)
  const [suppliedAmount, setSuppliedAmount] = useState(0)

  // Get the user address from the connected wallet
  const getAddressString = () => {
    if (!account?.address) return ''
    return typeof account.address === 'string' 
      ? account.address 
      : account.address.toString()
  }

  const userAddress = connected ? getAddressString() : undefined

  // Fetch assets with React Query
  const { data: assets, isLoading: assetsLoading, error: assetsError } = useAssets()

  // Fetch markets for all assets with React Query (uses parallel queries)
  const { assetsWithMarkets, isLoading: marketsLoading } = useAssetsWithMarkets(assets)

  // Fetch user portfolio with React Query (only when connected)
  const { data: userPortfolio } = useUserPortfolio(userAddress)

  // Combined loading state
  const loading = assetsLoading || marketsLoading
  const error = assetsError ? (assetsError as Error).message : null

  // Log data for debugging
  if (assetsWithMarkets.length > 0) {
    console.log('All Markets:', assetsWithMarkets)
  }
  if (userPortfolio) {
    console.log('User Portfolio:', userPortfolio)
  }

  // Handle opening the supply modal
  const handleSupplyClick = (asset: Asset, market: MarketData) => {
    if (!connected) {
      alert('Please connect your wallet first')
      return
    }
    setSelectedAsset(asset)
    setSelectedMarket(market)
    setIsSupplyModalOpen(true)
  }

  // Handle opening the withdraw modal
  const handleWithdrawClick = (asset: Asset, market: MarketData, supplied: number) => {
    if (!connected) {
      alert('Please connect your wallet first')
      return
    }
    setWithdrawAsset(asset)
    setWithdrawMarket(market)
    setSuppliedAmount(supplied)
    setIsWithdrawModalOpen(true)
  }

  // Handle the supply transaction
  const handleSupply = async (amountString: string) => {
    if (!account || !selectedAsset || !selectedMarket) {
      console.error('Missing required data for supply')
      return
    }

    setIsSubmitting(true)

    const result = await executeSupply({
      asset: selectedAsset,
      market: selectedMarket,
      amount: amountString,
      userAddress: account.address.toString(),
      signAndSubmitTransaction
    })

    setIsSubmitting(false)

    if (result.success) {
      alert(`Supply successful! Transaction: ${result.hash}`)
      
      // Close modal on success
      setIsSupplyModalOpen(false)
      setSelectedAsset(null)
      setSelectedMarket(null)
    } else {
      alert(`Supply failed: ${result.error}`)
    }
  }

  // Handle the withdraw transaction
  const handleWithdraw = async (amountString: string) => {
    if (!account || !withdrawAsset || !withdrawMarket) {
      console.error('Missing required data for withdraw')
      return
    }

    setIsSubmitting(true)

    const result = await executeWithdraw({
      asset: withdrawAsset,
      market: withdrawMarket,
      amount: amountString,
      userAddress: account.address.toString(),
      signAndSubmitTransaction
    })

    setIsSubmitting(false)

    if (result.success) {
      alert(`Withdraw successful! Transaction: ${result.hash}`)
      
      // Close modal on success
      setIsWithdrawModalOpen(false)
      setWithdrawAsset(null)
      setWithdrawMarket(null)
      setSuppliedAmount(0)
    } else {
      alert(`Withdraw failed: ${result.error}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-destructive">Error: {error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* User Portfolio Section */}
            {connected && userPortfolio && (
              <section>
                <h2 className="text-3xl font-bold text-foreground mb-6">Your Portfolio</h2>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Portfolio Summary</CardTitle>
                    <CardDescription>User: {userPortfolio.userAddress}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Display each protocol's data */}
                    {Object.entries(userPortfolio.protocols).map(([protocolName, protocolData]) => (
                      <div key={protocolName} className="mb-6 last:mb-0">
                        <h3 className="text-xl font-semibold mb-4 capitalize">{protocolName}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Collateral</p>
                            <p className="text-xl font-bold">${parseFloat(protocolData.totalCollateralBase).toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Debt</p>
                            <p className="text-xl font-bold">${parseFloat(protocolData.totalDebtBase).toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Available Borrows</p>
                            <p className="text-xl font-bold">${parseFloat(protocolData.availableBorrowsBase).toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Health Factor</p>
                            <p className="text-xl font-bold">
                              {parseFloat(protocolData.healthFactor) > 1e18 
                                ? '∞' 
                                : parseFloat(protocolData.healthFactor).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Display user asset positions */}
                        {protocolData.userAssetData && protocolData.userAssetData.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-3">Asset Positions</h4>
                            <div className="space-y-2">
                              {protocolData.userAssetData.map((assetData, idx) => {
                                // Find the matching asset and market from assetsWithMarkets
                                const matchingAssetWithMarket = assetsWithMarkets.find(
                                  ({ asset }) => asset.tokenAddress === assetData.tokenAddress
                                )
                                
                                // Get the first market (or could be improved to match specific reserve)
                                const market = matchingAssetWithMarket?.markets.markets[0]
                                
                                // Create proper Asset object
                                const asset: Asset = matchingAssetWithMarket?.asset || {
                                  name: assetData.asset,
                                  symbol: assetData.asset,
                                  tokenAddress: assetData.tokenAddress,
                                  decimals: 6
                                }

                                const supplied = parseFloat(assetData.current_a_token_balance) / 1e6
                                
                                return (
                                  <PositionCard
                                    key={idx}
                                    assetData={assetData}
                                    onWithdraw={() => {
                                      // Use the actual market if found, otherwise use a placeholder
                                      const actualMarket: MarketData = market || {
                                        accruedToTreasury: 0,
                                        borrowAPY: 0,
                                        lastUpdateTimestamp: '',
                                        liquidityIndex: '0',
                                        reserveObject: '',
                                        supplyAPY: 0,
                                        tokenAddress: assetData.tokenAddress,
                                        totalATokenSupply: 0,
                                        totalVariableDebt: 0,
                                        variableBorrowIndex: '0'
                                      }
                                      handleWithdrawClick(asset, actualMarket, supplied)
                                    }}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Display any errors */}
                    {userPortfolio.errors && Object.keys(userPortfolio.errors).length > 0 && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Protocol Errors</h4>
                        {Object.entries(userPortfolio.errors).map(([protocol, error]) => (
                          <p key={protocol} className="text-sm text-muted-foreground">
                            <span className="font-medium capitalize">{protocol}:</span> {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Assets and Markets Section */}
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-6">Assets & Markets</h2>
              {assetsWithMarkets.length === 0 ? (
                <p className="text-muted-foreground">No assets found</p>
              ) : (
                <div className="space-y-8">
                  {assetsWithMarkets.map(({ asset, markets }) => (
                    <div key={asset.tokenAddress}>
                      <h3 className="text-2xl font-semibold text-foreground mb-4">
                        {asset.name} ({asset.symbol})
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Address: {asset.tokenAddress}
                      </p>

                      {markets.markets.length === 0 ? (
                        <p className="text-muted-foreground">No markets available for this asset</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {markets.markets.map((market, idx) => (
                            <Card key={idx}>
                              <CardHeader>
                                <CardTitle className="text-lg">{asset.symbol} Market</CardTitle>
                                <CardDescription>Reserve: {market.reserveObject.slice(0, 10)}...</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Supply APY</span>
                                    <span className="text-sm font-medium text-green-600">
                                      {market.supplyAPY.toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Borrow APY</span>
                                    <span className="text-sm font-medium text-orange-600">
                                      {market.borrowAPY.toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Supply</span>
                                    <span className="text-sm font-medium">
                                      ${market.totalATokenSupply.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Borrowed</span>
                                    <span className="text-sm font-medium">
                                      ${market.totalVariableDebt.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter>
                                <button
                                  onClick={() => handleSupplyClick(asset, market)}
                                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                  Supply
                                </button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
      
      {/* Supply Modal */}
      <SupplyModal
        isOpen={isSupplyModalOpen}
        onClose={() => setIsSupplyModalOpen(false)}
        asset={selectedAsset}
        market={selectedMarket}
        onSupply={handleSupply}
        isSubmitting={isSubmitting}
        userAddress={userAddress}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        asset={withdrawAsset}
        market={withdrawMarket}
        onWithdraw={handleWithdraw}
        isSubmitting={isSubmitting}
        suppliedAmount={suppliedAmount}
      />
      
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  )
}

export default App
