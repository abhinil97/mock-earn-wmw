import { useQueries } from '@tanstack/react-query';
import { getMarketsByAsset } from '../services/api';
import type { Asset, Market } from '../services/types/api';

export interface AssetWithMarkets {
  asset: Asset;
  markets: Market;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch markets for multiple assets in parallel with caching
 * Uses useQueries to fetch all markets simultaneously
 */
export function useAssetsWithMarkets(assets: Asset[] | undefined) {
  const queries = useQueries({
    queries: (assets || []).map((asset) => ({
      queryKey: ['markets', asset.tokenAddress],
      queryFn: () => getMarketsByAsset(asset.tokenAddress),
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    })),
  });

  // Combine assets with their markets
  const assetsWithMarkets: AssetWithMarkets[] = (assets || []).map((asset, index) => ({
    asset,
    markets: queries[index].data || {
      asset: asset.symbol,
      markets: [],
      tokenAddress: asset.tokenAddress,
    },
    isLoading: queries[index].isLoading,
    error: queries[index].error,
  }));

  // Overall loading state - true if any query is loading
  const isLoading = queries.some((query) => query.isLoading);
  
  // Collect all errors
  const errors = queries
    .filter((query) => query.error)
    .map((query) => query.error);

  return {
    assetsWithMarkets,
    isLoading,
    errors,
  };
}

