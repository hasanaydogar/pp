'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useLoading } from './use-loading';

export interface AssetPerformance {
  assetId: string;
  symbol: string;
  currentValue: number;
  totalInvested: number;
  realizedGainLoss: number;
  unrealizedGainLoss: number;
  totalGainLoss: number;
  performance: number; // Percentage
  averageBuyPrice: number;
  currentPrice: number;
  quantity: number;
}

/**
 * Hook to fetch asset performance metrics
 */
export function useAssetPerformance(id: string) {
  const { loading, error, execute } = useLoading();
  const [performance, setPerformance] = useState<AssetPerformance | null>(null);

  const fetchPerformance = async () => {
    const data = await execute(() => apiClient.get<AssetPerformance>(`/assets/${id}/performance`));
    if (data) {
      setPerformance(data);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPerformance();
    }
  }, [id]);

  return {
    performance,
    loading,
    error,
    refetch: fetchPerformance,
  };
}

