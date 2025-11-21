// API Response Types

export interface Asset {
  tokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  // Add more fields based on actual API response
}

export interface AssetsResponse {
  assets: Asset[];
}

export interface MarketData {
  accruedToTreasury: number;
  borrowAPY: number;
  lastUpdateTimestamp: string;
  liquidityIndex: string;
  reserveObject: string;
  supplyAPY: number;
  tokenAddress: string;
  totalATokenSupply: number;
  totalVariableDebt: number;
  variableBorrowIndex: string;
}

export interface Market {
  asset: string;
  markets: MarketData[];
  tokenAddress: string;
}

export interface MarketDetails {
  asset_address: string;
  market: string;
  protocol: string;
  apy: number;
  tvl: number;
  total_supply: number;
  total_borrow: number;
  utilization_rate: number;
  // Add more fields based on actual API response
}

export interface UserAssetData {
  asset: string;
  tokenAddress: string;
  current_a_token_balance: string;
  current_variable_debt: string;
  scaled_variable_debt: string;
  principal_stable_debt: string;
  scaled_a_token_balance: string;
  stable_borrow_rate: string;
  stable_rate_last_updated: string;
  usage_as_collateral_enabled: string;
}

export interface ProtocolPortfolio {
  protocol: string;
  userAddress: string;
  totalCollateralBase: string;
  totalDebtBase: string;
  availableBorrowsBase: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
  userAssetData: UserAssetData[];
}

export interface UserPortfolio {
  userAddress: string;
  protocols: {
    [key: string]: ProtocolPortfolio;
  };
  errors: {
    [key: string]: string;
  };
}

