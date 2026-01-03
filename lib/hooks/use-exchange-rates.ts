import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchExchangeRates } from '@/lib/api/exchange-rates';
import { ExchangeRates, ExchangeRateError } from '@/lib/types/exchange-rates';
import { STATIC_EXCHANGE_RATES, getStaticRatesWarning } from '@/lib/constants/exchange-rates';

/**
 * Exchange rate query options
 */
export interface UseExchangeRatesOptions {
  /**
   * Base currency for exchange rates
   * @default 'USD'
   */
  baseCurrency?: string;
  
  /**
   * Enable or disable the query
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Stale time in milliseconds
   * @default 24 hours (86400000 ms)
   */
  staleTime?: number;
  
  /**
   * Garbage collection time in milliseconds
   * @default 48 hours (172800000 ms)
   */
  gcTime?: number;
  
  /**
   * Retry failed requests
   * @default 2
   */
  retry?: number;
}

/**
 * Default options for exchange rate queries
 */
const DEFAULT_OPTIONS: Required<Omit<UseExchangeRatesOptions, 'baseCurrency'>> = {
  enabled: true,
  staleTime: 24 * 60 * 60 * 1000, // 24 hours
  gcTime: 48 * 60 * 60 * 1000, // 48 hours
  retry: 2,
};

/**
 * React Query hook for fetching exchange rates
 * 
 * Features:
 * - Automatic caching (24-hour stale time, 48-hour cache time)
 * - Background refetching when stale
 * - Automatic retry on failure
 * - Loading and error states
 * - Manual refetch function
 * 
 * @param options - Query options
 * @returns Query result with exchange rates data
 * 
 * @example
 * ```tsx
 * function CurrencyConverter() {
 *   const { data: rates, isLoading, error, refetch } = useExchangeRates();
 *   
 *   if (isLoading) return <div>Loading rates...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return (
 *     <div>
 *       <p>1 USD = {rates.rates['EUR']} EUR</p>
 *       <button onClick={() => refetch()}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // With custom base currency
 * const { data: eurRates } = useExchangeRates({ baseCurrency: 'EUR' });
 * 
 * // Disabled until needed
 * const { data, refetch } = useExchangeRates({ enabled: false });
 * // Later: refetch()
 * ```
 */
export function useExchangeRates(
  options: UseExchangeRatesOptions = {}
): UseQueryResult<ExchangeRates, ExchangeRateError> {
  const {
    baseCurrency = 'USD',
    enabled = DEFAULT_OPTIONS.enabled,
    staleTime = DEFAULT_OPTIONS.staleTime,
    gcTime = DEFAULT_OPTIONS.gcTime,
    retry = DEFAULT_OPTIONS.retry,
  } = options;

  const query = useQuery({
    queryKey: ['exchange-rates', baseCurrency] as const,
    queryFn: async (): Promise<ExchangeRates> => {
      try {
        return await fetchExchangeRates({ baseCurrency });
      } catch (error) {
        // Fallback to static rates if API fails
        console.warn('Exchange rate API failed, using static rates:', error);

        // Convert static rates to ExchangeRates format
        const fallbackRates: ExchangeRates = {
          base: STATIC_EXCHANGE_RATES.base,
          rates: STATIC_EXCHANGE_RATES.rates as Record<string, number>,
          lastUpdate: new Date(STATIC_EXCHANGE_RATES.lastUpdated),
          nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          isFallback: true,
          fallbackWarning: getStaticRatesWarning(),
        };

        return fallbackRates;
      }
    },
    enabled,
    staleTime,
    gcTime,
    retry,
    // Refetch on window focus if data is stale
    refetchOnWindowFocus: true,
    // Refetch on reconnect if data is stale
    refetchOnReconnect: true,
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  });

  return query as UseQueryResult<ExchangeRates, ExchangeRateError>;
}

/**
 * Get conversion rate between two currencies
 * 
 * @param from - Source currency code
 * @param to - Target currency code
 * @param rates - Exchange rates data
 * @returns Conversion rate or undefined if not available
 * 
 * @example
 * ```tsx
 * const { data: rates } = useExchangeRates();
 * const usdToEur = getConversionRate('USD', 'EUR', rates);
 * ```
 */
export function getConversionRate(
  from: string,
  to: string,
  rates?: ExchangeRates
): number | undefined {
  if (!rates) return undefined;
  
  // Same currency
  if (from === to) return 1;
  
  // Direct conversion if from is the base currency
  if (from === rates.base) {
    return rates.rates[to];
  }
  
  // Cross-currency conversion via base currency
  const fromRate = rates.rates[from];
  const toRate = rates.rates[to];
  
  if (fromRate === undefined || toRate === undefined) {
    return undefined;
  }
  
  return toRate / fromRate;
}

/**
 * Check if exchange rates are stale (older than 24 hours)
 * 
 * @param rates - Exchange rates data
 * @returns True if rates are stale
 */
export function areRatesStale(rates?: ExchangeRates): boolean {
  if (!rates) return true;
  
  const now = new Date();
  const ageInHours = (now.getTime() - rates.lastUpdate.getTime()) / (1000 * 60 * 60);
  
  return ageInHours > 24;
}

/**
 * Format last update time as relative string
 * 
 * @param rates - Exchange rates data
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function formatLastUpdate(rates?: ExchangeRates): string {
  if (!rates) return 'Never';
  
  const now = new Date();
  const diff = now.getTime() - rates.lastUpdate.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Get time until next update
 * 
 * @param rates - Exchange rates data
 * @returns Time until next update in hours
 */
export function getTimeUntilNextUpdate(rates?: ExchangeRates): number | undefined {
  if (!rates) return undefined;
  
  const now = new Date();
  const diff = rates.nextUpdate.getTime() - now.getTime();
  
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}
