import { useState, useEffect, useCallback, useRef } from 'react';
import { LivePrice, PriceError } from '@/lib/types/price';

interface UseLivePricesOptions {
  enabled?: boolean;
  refreshInterval?: number; // ms, 0 = no auto-refresh
}

interface UseLivePricesResult {
  prices: Record<string, LivePrice>;
  loading: boolean;
  errors: Record<string, PriceError>;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
  getPrice: (symbol: string) => LivePrice | null;
}

interface AssetPriceRequest {
  symbol: string;
  currency: string;
}

/**
 * React hook to fetch live prices for multiple assets
 *
 * @param symbols - Array of asset symbols (e.g., ["AAPL", "THYAO"])
 * @param currency - Base currency for all (e.g., "USD", "TRY")
 * @param options - Optional configuration
 * @returns Live prices map and controls
 *
 * @example
 * const { prices, loading, getPrice } = useLivePrices(['THYAO', 'GARAN'], 'TRY');
 */
export function useLivePrices(
  symbols: string[],
  currency: string,
  options: UseLivePricesOptions = {}
): UseLivePricesResult {
  const { enabled = true, refreshInterval = 0 } = options;

  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, PriceError>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Track if component is mounted
  const mountedRef = useRef(true);

  // Keep track of symbols to avoid unnecessary fetches
  const symbolsKey = symbols.sort().join(',');

  const fetchPrices = useCallback(async () => {
    if (!enabled || symbols.length === 0) {
      return;
    }

    setLoading(true);

    const newPrices: Record<string, LivePrice> = {};
    const newErrors: Record<string, PriceError> = {};

    // Fetch prices in parallel (max 10 concurrent)
    const batchSize = 10;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (symbol) => {
          try {
            const response = await fetch(
              `/api/prices/${encodeURIComponent(symbol)}?currency=${encodeURIComponent(currency)}`
            );

            if (!mountedRef.current) return;

            const result = await response.json();

            if (result.success) {
              newPrices[symbol] = result.data;
            } else {
              newErrors[symbol] = result.error;
            }
          } catch (e) {
            if (!mountedRef.current) return;

            newErrors[symbol] = {
              symbol,
              error: e instanceof Error ? e.message : 'Network error',
              code: 'API_ERROR',
            };
          }
        })
      );
    }

    if (mountedRef.current) {
      setPrices((prev) => ({ ...prev, ...newPrices }));
      setErrors(newErrors);
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, [symbolsKey, currency, enabled]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    mountedRef.current = true;

    if (enabled && symbols.length > 0) {
      fetchPrices();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [symbolsKey, currency, enabled]);

  // Optional auto-refresh
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0 || !enabled || symbols.length === 0) {
      return;
    }

    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, enabled, symbolsKey, fetchPrices]);

  const getPrice = useCallback(
    (symbol: string): LivePrice | null => {
      return prices[symbol] || null;
    },
    [prices]
  );

  return {
    prices,
    loading,
    errors,
    refetch: fetchPrices,
    lastUpdated,
    getPrice,
  };
}

/**
 * React hook to fetch live prices for assets with different currencies
 *
 * @param assets - Array of assets with symbol and currency
 * @param options - Optional configuration
 * @returns Live prices map and controls
 *
 * @example
 * const { prices, loading, getPrice } = useLivePricesMultiCurrency([
 *   { symbol: 'AAPL', currency: 'USD' },
 *   { symbol: 'THYAO', currency: 'TRY' }
 * ]);
 */
export function useLivePricesMultiCurrency(
  assets: AssetPriceRequest[],
  options: UseLivePricesOptions = {}
): UseLivePricesResult {
  const { enabled = true, refreshInterval = 0 } = options;

  const [prices, setPrices] = useState<Record<string, LivePrice>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, PriceError>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Track if component is mounted
  const mountedRef = useRef(true);

  // Create a stable key from assets
  const assetsKey = assets.map(a => `${a.symbol}:${a.currency}`).sort().join(',');

  const fetchPrices = useCallback(async () => {
    if (!enabled || assets.length === 0) {
      return;
    }

    setLoading(true);

    const newPrices: Record<string, LivePrice> = {};
    const newErrors: Record<string, PriceError> = {};

    // Fetch prices in parallel (max 10 concurrent)
    const batchSize = 10;
    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async ({ symbol, currency }) => {
          try {
            const response = await fetch(
              `/api/prices/${encodeURIComponent(symbol)}?currency=${encodeURIComponent(currency)}`
            );

            if (!mountedRef.current) return;

            const result = await response.json();

            if (result.success) {
              newPrices[symbol] = result.data;
            } else {
              newErrors[symbol] = result.error;
            }
          } catch (e) {
            if (!mountedRef.current) return;

            newErrors[symbol] = {
              symbol,
              error: e instanceof Error ? e.message : 'Network error',
              code: 'API_ERROR',
            };
          }
        })
      );
    }

    if (mountedRef.current) {
      setPrices((prev) => ({ ...prev, ...newPrices }));
      setErrors(newErrors);
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, [assetsKey, enabled]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    mountedRef.current = true;

    if (enabled && assets.length > 0) {
      fetchPrices();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [assetsKey, enabled]);

  // Optional auto-refresh
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0 || !enabled || assets.length === 0) {
      return;
    }

    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, enabled, assetsKey, fetchPrices]);

  const getPrice = useCallback(
    (symbol: string): LivePrice | null => {
      return prices[symbol] || null;
    },
    [prices]
  );

  return {
    prices,
    loading,
    errors,
    refetch: fetchPrices,
    lastUpdated,
    getPrice,
  };
}
