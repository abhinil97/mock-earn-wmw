import { useQuery } from '@tanstack/react-query';
import { getUserPortfolio } from '../services/api';

/**
 * Hook to fetch user portfolio with caching
 * Cache is set to 1 minute as portfolio data should be relatively fresh
 * Refetches on window focus to keep portfolio up-to-date
 */
export function useUserPortfolio(userAddress: string | undefined) {
  return useQuery({
    queryKey: ['portfolio', userAddress],
    queryFn: () => getUserPortfolio(userAddress!),
    enabled: !!userAddress,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

