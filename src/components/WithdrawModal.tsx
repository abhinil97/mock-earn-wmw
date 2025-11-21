import { useState, useEffect } from 'react'
import type { Asset, MarketData } from '../services/types/api'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset | null
  market: MarketData | null
  onWithdraw: (amount: string) => void
  isSubmitting?: boolean
  suppliedAmount: number
}

export function WithdrawModal({ 
  isOpen, 
  onClose, 
  asset, 
  market, 
  onWithdraw,
  isSubmitting = false,
  suppliedAmount 
}: WithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  // Reset amount when modal opens/closes or asset changes
  useEffect(() => {
    if (!isOpen) {
      setAmount('')
      setError('')
    }
  }, [isOpen, asset?.tokenAddress])

  if (!isOpen || !asset || !market) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const amountNum = parseFloat(amount)

    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amountNum > suppliedAmount) {
      setError('Insufficient supplied balance')
      return
    }

    onWithdraw(amount)
  }

  const handleMaxClick = () => {
    if (suppliedAmount > 0) {
      setAmount(suppliedAmount.toString())
      setError('')
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('')
      setError('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg backdrop-blur-xl" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">Withdraw {asset.symbol}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Net Balance: <span className="text-foreground font-medium">${suppliedAmount.toFixed(4)}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="amount" className="block text-sm font-medium">
                Amount
              </label>
              <div className="text-sm text-muted-foreground">
                Available: <span className="font-medium text-foreground">
                  {suppliedAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: asset.decimals
                  })} {asset.symbol}
                </span>
              </div>
            </div>
            <div className="relative">
              <input
                id="amount"
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                disabled={isSubmitting}
                className="w-full px-4 py-3 pr-24 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMaxClick}
                  disabled={isSubmitting || suppliedAmount === 0}
                  className="px-2 py-1 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  MAX
                </button>
                <span className="text-sm text-muted-foreground font-medium">
                  {asset.symbol}
                </span>
              </div>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="bg-muted rounded-lg p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Token Address:</span>
              <span className="font-mono text-xs">
                {asset.tokenAddress.slice(0, 6)}...{asset.tokenAddress.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Decimals:</span>
              <span className="font-medium">{asset.decimals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserve:</span>
              <span className="font-mono text-xs">
                {market.reserveObject.slice(0, 6)}...{market.reserveObject.slice(-4)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Withdrawing...' : 'Withdraw'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

