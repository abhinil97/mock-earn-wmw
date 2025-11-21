import type { Asset, Market, MarketDetails, UserPortfolio } from './types/api';

// Use proxy in development, direct URL in production
const BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : 'https://earn-backend-j1m2.onrender.com';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    // console.log('API response:', data);
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * GET /get-assets
 * Fetches all available assets
 */
export async function getAssets(): Promise<Asset[]> {
  const response = await fetchApi<{ assets: Asset[] }>('/get-assets');
  return response.assets;
}

/**
 * GET /get-markets-by-asset/:asset-address
 * Fetches markets for a specific asset
 * @param assetAddress - The address of the asset
 */
export async function getMarketsByAsset(assetAddress: string): Promise<Market> {
  if (!assetAddress) {
    throw new ApiError('Asset address is required');
  }
  return fetchApi<Market>(`/get-markets-by-asset/${assetAddress}`);
}

/**
 * GET /get-market-details-by-asset/:asset-address/:market
 * Fetches detailed information for a specific market (e.g., aave)
 * @param assetAddress - The address of the asset
 * @param market - The market name (e.g., 'aave')
 */
export async function getMarketDetailsByAsset(
  assetAddress: string,
  market: string
): Promise<MarketDetails> {
  if (!assetAddress) {
    throw new ApiError('Asset address is required');
  }
  if (!market) {
    throw new ApiError('Market name is required');
  }
  return fetchApi<MarketDetails>(`/get-market-details-by-asset/${assetAddress}/${market}`);
}

/**
 * GET /get-user-portfolio/:user-address
 * Fetches the portfolio for a specific user
 * @param userAddress - The address of the user
 */
export async function getUserPortfolio(userAddress: string): Promise<UserPortfolio> {
  if (!userAddress) {
    throw new ApiError('User address is required');
  }
  return fetchApi<UserPortfolio>(`/get-user-portfolio/${userAddress}`);
}

