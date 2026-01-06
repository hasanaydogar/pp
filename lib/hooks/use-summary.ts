'use client';

import { useState, useEffect, useCallback } from 'react';
import { AllPortfoliosSummary } from '@/lib/api/summary';

interface UseSummaryResult {
  summary: AllPortfoliosSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSummary(displayCurrency?: string): UseSummaryResult {
  const [summary, setSummary] = useState<AllPortfoliosSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = displayCurrency ? `?currency=${displayCurrency}` : '';
      const response = await fetch(`/api/summary${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }
      
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [displayCurrency]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refetch: fetchSummary,
  };
}
