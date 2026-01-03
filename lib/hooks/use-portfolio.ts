'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { useLoading } from './use-loading';

export interface Portfolio {
  id: string;
  name: string;
  base_currency: string;
  benchmark_symbol?: string | null;
  created_at: string;
  updated_at: string;
  assets?: unknown[];
}

/**
 * Hook to fetch a single portfolio
 */
export function usePortfolio(id: string) {
  const { loading, error, execute } = useLoading();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  const fetchPortfolio = async () => {
    const result = await execute(() => apiClient.get<{ data: Portfolio } | Portfolio>(`/portfolios/${id}`));
    if (result) {
      // Handle both { data: Portfolio } and Portfolio formats
      const portfolio = 'data' in result ? result.data : result;
      setPortfolio(portfolio);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPortfolio();
    }
  }, [id]);

  return {
    portfolio,
    loading,
    error,
    refetch: fetchPortfolio,
  };
}

