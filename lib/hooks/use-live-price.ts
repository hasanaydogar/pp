import { useState, useEffect, useCallback, useRef } from 'react';
import { LivePrice, PriceError } from '@/lib/types/price';

interface UseLivePriceOptions {
  enabled?: boolean;
  refreshInterval?: number; // ms, 0 = no auto-refresh
}

interface UseLivePriceResult {
  price: LivePrice | null;
  loading: boolean;
  error: PriceError | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * React hook to fetch and manage live price state
 *
 * @param symbol - Asset symbol (e.g., "AAPL", "THYAO")
 * @param currency - Asset currency (e.g., "USD", "TRY")
 * @param options - Optional configuration
 * @returns Live price state and controls
 *
 * @example
 * const { price, loading, error, refetch } = useLivePrice('THYAO', 'TRY');
 */
export function useLivePrice(
  symbol: string | null | undefined,
  currency: string,
  options: UseLivePriceOptions = {}
): UseLivePriceResult {
  const { enabled = true, refreshInterval = 0 } = options;

  const [price, setPrice] = useState<LivePrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PriceError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Track if component is mounted
  const mountedRef = useRef(true);

  const fetchPrice = useCallback(async () => {
    if (!symbol || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/prices/${encodeURIComponent(symbol)}?currency=${encodeURIComponent(currency)}`
      );

      // Check if component is still mounted
      if (!mountedRef.current) return;

      const result = await response.json();

      if (result.success) {
        setPrice(result.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(result.error);
        // Keep previous price on error
      }
    } catch (e) {
      if (!mountedRef.current) return;

      setError({
        symbol: symbol,
        error: e instanceof Error ? e.message : 'Network error',
        code: 'API_ERROR',
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [symbol, currency, enabled]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    mountedRef.current = true;

    if (symbol && enabled) {
      fetchPrice();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [symbol, currency, enabled, fetchPrice]);

  // Optional auto-refresh
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0 || !enabled || !symbol) {
      return;
    }

    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, enabled, symbol, fetchPrice]);

  return {
    price,
    loading,
    error,
    refetch: fetchPrice,
    lastUpdated,
  };
}
