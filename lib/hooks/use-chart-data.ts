'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChartData, TimeRange } from '@/lib/types/chart';

interface UseChartDataResult {
  data: ChartData | null;
  loading: boolean;
  error: string | null;
  range: TimeRange;
  setRange: (range: TimeRange) => void;
  refetch: () => void;
}

export function useChartData(
  symbol: string | null | undefined,
  currency: string,
  defaultRange: TimeRange = '1M'
): UseChartDataResult {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>(defaultRange);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!symbol) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/chart/${encodeURIComponent(symbol)}?range=${range}&currency=${encodeURIComponent(currency)}`
      );
      
      const json = await response.json();

      if (!mountedRef.current) return;

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch chart data');
      }

      setData(json.data);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setData(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [symbol, currency, range]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const handleSetRange = useCallback((newRange: TimeRange) => {
    if (newRange !== range) {
      setRange(newRange);
    }
  }, [range]);

  return {
    data,
    loading,
    error,
    range,
    setRange: handleSetRange,
    refetch: fetchData,
  };
}
