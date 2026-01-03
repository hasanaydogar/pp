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
}

/**
 * Hook to fetch portfolios
 */
export function usePortfolios() {
  const { loading, error, execute } = useLoading();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  const fetchPortfolios = async () => {
    const data = await execute(() => apiClient.get<Portfolio[]>('/portfolios'));
    if (data) {
      setPortfolios(data);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return {
    portfolios,
    loading,
    error,
    refetch: fetchPortfolios,
  };
}

