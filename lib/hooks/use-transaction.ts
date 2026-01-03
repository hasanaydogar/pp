'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useLoading } from './use-loading';

export interface Transaction {
  id: string;
  asset_id: string;
  type: string;
  amount: number;
  price: number;
  date: string;
  transaction_cost: number;
  currency?: string | null;
  notes?: string | null;
  realized_gain_loss?: number | null;
  created_at: string;
  updated_at?: string | null;
}

/**
 * Hook to fetch a single transaction
 */
export function useTransaction(id: string) {
  const { loading, error, execute } = useLoading();
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const fetchTransaction = async () => {
    const data = await execute(() => apiClient.get<Transaction>(`/transactions/${id}`));
    if (data) {
      setTransaction(data);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTransaction();
    }
  }, [id]);

  return {
    transaction,
    loading,
    error,
    refetch: fetchTransaction,
  };
}

