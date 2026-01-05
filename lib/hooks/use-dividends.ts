'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dividend, DividendSummary, ReinvestStrategy } from '@/lib/types/dividend';

interface UseDividendsOptions {
  year?: string;
  assetId?: string;
  limit?: number;
}

interface UseDividendsResult {
  dividends: Dividend[];
  summary: DividendSummary | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addDividend: (data: {
    asset_id: string;
    gross_amount: number;
    tax_amount: number;
    payment_date: string;
    reinvest_strategy: ReinvestStrategy;
    notes?: string;
  }) => Promise<void>;
}

export function useDividends(
  portfolioId: string | null,
  options: UseDividendsOptions = {}
): UseDividendsResult {
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [summary, setSummary] = useState<DividendSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { year, assetId, limit = 50 } = options;

  const fetchDividends = useCallback(async () => {
    if (!portfolioId) return;

    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (assetId) params.append('asset_id', assetId);
      if (limit) params.append('limit', limit.toString());

      // Fetch dividends
      const res = await fetch(
        `/api/portfolios/${portfolioId}/dividends?${params.toString()}`
      );
      
      if (!res.ok) {
        throw new Error('Failed to fetch dividends');
      }
      
      const data = await res.json();
      setDividends(data.data || []);

      // Fetch summary
      const summaryRes = await fetch(
        `/api/portfolios/${portfolioId}/dividends/summary`
      );
      
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [portfolioId, year, assetId, limit]);

  const addDividend = useCallback(
    async (data: {
      asset_id: string;
      gross_amount: number;
      tax_amount: number;
      payment_date: string;
      reinvest_strategy: ReinvestStrategy;
      notes?: string;
    }) => {
      if (!portfolioId) {
        throw new Error('Portfolio ID is required');
      }

      const res = await fetch(`/api/portfolios/${portfolioId}/dividends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add dividend');
      }

      // Refetch after adding
      await fetchDividends();
    },
    [portfolioId, fetchDividends]
  );

  useEffect(() => {
    fetchDividends();
  }, [fetchDividends]);

  return {
    dividends,
    summary,
    loading,
    error,
    refetch: fetchDividends,
    addDividend,
  };
}
