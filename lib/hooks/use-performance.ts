'use client';

import { useState, useEffect, useCallback } from 'react';
import { PortfolioSnapshot, PerformanceSummary, Period } from '@/lib/types/snapshot';

interface UsePerformanceResult {
  snapshots: PortfolioSnapshot[];
  summary: PerformanceSummary | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePerformance(
  portfolioId: string | null,
  period: Period = '30d'
): UsePerformanceResult {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPerformance = useCallback(async () => {
    if (!portfolioId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/portfolios/${portfolioId}/performance?period=${period}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }

      const result = await response.json();
      setSnapshots(result.data.snapshots || []);
      setSummary(result.data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [portfolioId, period]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  return {
    snapshots,
    summary,
    loading,
    error,
    refetch: fetchPerformance,
  };
}
