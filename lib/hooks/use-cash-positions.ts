'use client';

import { useState, useEffect, useCallback } from 'react';
import { CashPosition, CashTransaction, CreateCashPosition, CreateCashTransaction } from '@/lib/types/cash';

interface UseCashPositionsResult {
  positions: CashPosition[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addPosition: (data: CreateCashPosition) => Promise<CashPosition | null>;
  updatePosition: (currency: string, amount: number) => Promise<CashPosition | null>;
  deletePosition: (currency: string) => Promise<boolean>;
  addTransaction: (currency: string, data: CreateCashTransaction) => Promise<CashTransaction | null>;
  totalCash: number;
}

export function useCashPositions(portfolioId: string | null): UseCashPositionsResult {
  const [positions, setPositions] = useState<CashPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!portfolioId) {
      setPositions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/cash`);
      if (!response.ok) {
        throw new Error('Failed to fetch cash positions');
      }
      const data = await response.json();
      setPositions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const addPosition = useCallback(async (data: CreateCashPosition): Promise<CashPosition | null> => {
    if (!portfolioId) return null;

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add cash position');
      }

      const newPosition = await response.json();
      setPositions(prev => [...prev, newPosition]);
      return newPosition;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [portfolioId]);

  const updatePosition = useCallback(async (currency: string, amount: number): Promise<CashPosition | null> => {
    if (!portfolioId) return null;

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/cash/${currency}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update cash position');
      }

      const updatedPosition = await response.json();
      setPositions(prev => prev.map(p => p.currency === currency ? updatedPosition : p));
      return updatedPosition;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [portfolioId]);

  const deletePosition = useCallback(async (currency: string): Promise<boolean> => {
    if (!portfolioId) return false;

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/cash/${currency}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete cash position');
      }

      setPositions(prev => prev.filter(p => p.currency !== currency));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [portfolioId]);

  const addTransaction = useCallback(async (
    currency: string, 
    data: CreateCashTransaction
  ): Promise<CashTransaction | null> => {
    if (!portfolioId) return null;

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/cash/${currency}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add transaction');
      }

      const result = await response.json();
      
      // Update the position amount
      setPositions(prev => prev.map(p => 
        p.currency === currency 
          ? { ...p, amount: result.new_position_amount } 
          : p
      ));

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [portfolioId]);

  const totalCash = positions.reduce((sum, p) => sum + p.amount, 0);

  return {
    positions,
    isLoading,
    error,
    refetch: fetchPositions,
    addPosition,
    updatePosition,
    deletePosition,
    addTransaction,
    totalCash,
  };
}
