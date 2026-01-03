'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useLoading } from './use-loading';

export interface Asset {
  id: string;
  portfolio_id: string;
  symbol: string;
  name?: string | null;
  type: string;
  quantity: number;
  average_buy_price: number;
  currency: string;
  initial_purchase_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface UseAssetsOptions {
  portfolioId?: string;
}

/**
 * Hook to fetch assets
 */
export function useAssets(options?: UseAssetsOptions) {
  const { loading, error, execute } = useLoading();
  const [assets, setAssets] = useState<Asset[]>([]);

  const fetchAssets = async () => {
    let url = '/assets';
    if (options?.portfolioId) {
      url = `/portfolios/${options.portfolioId}/assets`;
    }

    const data = await execute(() => apiClient.get<Asset[]>(url));
    if (data) {
      setAssets(data);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [options?.portfolioId]);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
  };
}

