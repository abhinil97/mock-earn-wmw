interface UserAssetData {
  asset: string
  tokenAddress: string
  current_a_token_balance: string
  current_variable_debt: string
}

interface PositionCardProps {
  assetData: UserAssetData
  onWithdraw: () => void
}

export function PositionCard({ assetData, onWithdraw }: PositionCardProps) {
  const supplied = parseFloat(assetData.current_a_token_balance) / 1e6 // Assuming 6 decimals
  const borrowed = parseFloat(assetData.current_variable_debt) / 1e6
  const netValue = supplied - borrowed

  // Only show if there's a balance
  if (supplied === 0 && borrowed === 0) return null

  return (
    <div className="p-4 border border-border rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-medium">{assetData.asset}</p>
          <p className="text-xs text-muted-foreground">
            {assetData.tokenAddress.slice(0, 10)}...{assetData.tokenAddress.slice(-8)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Supplied: ${supplied.toFixed(4)}</p>
          <p className="text-sm text-muted-foreground">Borrowed: ${borrowed.toFixed(4)}</p>
          <p className="text-sm font-medium">Net: ${netValue.toFixed(4)}</p>
        </div>
      </div>
      
      <button
        onClick={onWithdraw}
        disabled={supplied === 0}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Withdraw
      </button>
    </div>
  )
}

