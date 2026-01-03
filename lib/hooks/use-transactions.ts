'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useLoading } from './use-loading';

export interface Transaction {
  id: string;
  asset_id: string;
  type: string;
  quantity: number;
  price: number;
  date: string;
  transaction_cost?: number | null;
  currency: string;
  realized_gain_loss?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface UseTransactionsOptions {
  assetId: string;
  limit?: number;
  offset?: number;
}

interface TransactionsResponse {
  data: Transaction[];
  count?: number;
}

/**
 * Hook to fetch transactions for an asset
 */
export function useTransactions(options: UseTransactionsOptions) {
  const { loading, error, execute } = useLoading();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = async () => {
    const { assetId, limit = 20, offset = 0 } = options;
    const result = await execute(() =>
      apiClient.get<TransactionsResponse | Transaction[]>(`/assets/${assetId}/transactions?limit=${limit}&offset=${offset}`),
    );
    if (result) {
      // Handle both { data: Transaction[], count?: number } and Transaction[] formats
      let transactionsData: Transaction[];
      let count: number | undefined;
      
      if (Array.isArray(result)) {
        transactionsData = result;
        count = undefined;
      } else {
        transactionsData = result.data;
        count = result.count;
      }
      
      setTransactions(transactionsData);
      if (count !== undefined) {
        setTotalCount(count);
        setHasMore(offset + transactionsData.length < count);
      } else {
        setHasMore(transactionsData.length === limit);
      }
    }
  };

  useEffect(() => {
    if (options.assetId) {
      fetchTransactions();
    }
  }, [options.assetId, options.limit, options.offset]);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    const { assetId, limit = 20 } = options;
    const nextOffset = transactions.length;
    const result = await execute(() =>
      apiClient.get<TransactionsResponse | Transaction[]>(`/assets/${assetId}/transactions?limit=${limit}&offset=${nextOffset}`),
    );
    if (result) {
      let transactionsData: Transaction[];
      let count: number | undefined;
      
      if (Array.isArray(result)) {
        transactionsData = result;
        count = undefined;
      } else {
        transactionsData = result.data;
        count = result.count;
      }
      
      setTransactions((prev) => [...prev, ...transactionsData]);
      if (count !== undefined) {
        setTotalCount(count);
        setHasMore(nextOffset + transactionsData.length < count);
      } else {
        setHasMore(transactionsData.length === limit);
      }
    }
  };

  return {
    transactions,
    loading,
    error,
    hasMore,
    totalCount,
    refetch: fetchTransactions,
    loadMore,
  };
}

