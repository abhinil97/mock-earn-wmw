import { useQuery } from '@tanstack/react-query';
import { getAssets } from '../services/api';

/**
 * Hook to fetch all assets with caching
 * Cache is set to 5 minutes (300000ms)
 */
export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: getAssets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });
}

