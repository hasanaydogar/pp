'use client';

import { useState, useEffect, useCallback } from 'react';
import { Period } from '@/lib/types/snapshot';

// ============================================================================
// TYPES
// ============================================================================

export interface CashFlowDataPoint {
  date: string;
  balance: number;
  change: number;
  deposits: number;
  withdrawals: number;
  dividends: number;
  purchases: number;
  sales: number;
}

export interface CashFlowSummary {
  startBalance: number;
  endBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalDividends: number;
  totalPurchases: number;
  totalSales: number;
  netChange: number;
}

interface UseCashFlowResult {
  data: CashFlowDataPoint[];
  summary: CashFlowSummary | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useCashFlow(
  portfolioId: string | null,
  period: Period = '30d'
): UseCashFlowResult {
  const [data, setData] = useState<CashFlowDataPoint[]>([]);
  const [summary, setSummary] = useState<CashFlowSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCashFlow = useCallback(async () => {
    if (!portfolioId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/portfolios/${portfolioId}/cash/flow?period=${period}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cash flow data');
      }

      const result = await response.json();
      setData(result.data?.data || []);
      setSummary(result.data?.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [portfolioId, period]);

  useEffect(() => {
    fetchCashFlow();
  }, [fetchCashFlow]);

  return {
    data,
    summary,
    loading,
    error,
    refetch: fetchCashFlow,
  };
}
