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
  transactions?: unknown[];
}

/**
 * Hook to fetch a single asset
 */
export function useAsset(id: string) {
  const { loading, error, execute } = useLoading();
  const [asset, setAsset] = useState<Asset | null>(null);

  const fetchAsset = async () => {
    const data = await execute(() => apiClient.get<Asset>(`/assets/${id}`));
    if (data) {
      setAsset(data);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAsset();
    }
  }, [id]);

  return {
    asset,
    loading,
    error,
    refetch: fetchAsset,
  };
}

