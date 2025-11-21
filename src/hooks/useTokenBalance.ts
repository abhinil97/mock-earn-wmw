import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch user's token balance for a specific asset using Aptos REST API
 * Automatically refetches on window focus to keep balance up-to-date
 */
export function useTokenBalance(
  userAddress: string | undefined, 
  tokenAddress: string | undefined,
  decimals: number = 6
) {
  return useQuery({
    queryKey: ['tokenBalance', userAddress, tokenAddress],
    queryFn: async () => {
      if (!userAddress || !tokenAddress) {
        return null;
      }

      try {
        // tokenAddress should be in format: 0x1::aptos_coin::AptosCoin
        // or a full struct tag format: {address}::{module}::{struct}
        const assetType = tokenAddress;
        
        // URL encode the asset type for the API call
        // The double colons (::) need to be properly encoded
        const encodedAssetType = encodeURIComponent(assetType);
        
        const apiUrl = `https://api.mainnet.aptoslabs.com/v1/accounts/${userAddress}/balance/${encodedAssetType}`;
        
        console.log('Fetching balance:', {
          userAddress,
          assetType,
          encodedAssetType,
          apiUrl
        });
        
        // Fetch balance from Aptos REST API
        const response = await fetch(apiUrl);

        if (!response.ok) {
          // If account doesn't have this coin type, return 0
          if (response.status === 404) {
            console.log('Account does not have this coin type, returning 0 balance');
            return {
              raw: '0',
              formatted: 0,
              decimals: decimals
            };
          }
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const rawBalance = await response.json();
        console.log('Balance API response:', rawBalance);
    
        
        // Convert from smallest unit to human-readable format
        const balance = Number(rawBalance) / Math.pow(10, decimals);
        
        console.log('Parsed balance:', {
          raw: rawBalance.toString(),
          formatted: balance,
          decimals: decimals
        });
        
        return {
          raw: rawBalance,
          formatted: balance,
          decimals: decimals
        };
      } catch (error) {
        console.error('Error fetching token balance:', {
          error: error instanceof Error ? error.message : error,
          userAddress,
          tokenAddress,
          decimals
        });
        // If the account doesn't have this token or there's an error, return 0
        return {
          raw: '0',
          formatted: 0,
          decimals: decimals
        };
      }
    },
    enabled: !!userAddress && !!tokenAddress,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

