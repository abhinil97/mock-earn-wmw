import { useQuery } from '@tanstack/react-query';
import { getMarketsByAsset } from '../services/api';

/**
 * Hook to fetch markets for a specific asset with caching
 * Cache is set to 2 minutes as market data changes more frequently
 */
export function useMarketsByAsset(assetAddress: string | undefined) {
  return useQuery({
    queryKey: ['markets', assetAddress],
    queryFn: () => getMarketsByAsset(assetAddress!),
    enabled: !!assetAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

