'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PortfolioPolicy,
  UpdatePortfolioPolicy,
  DEFAULT_POLICY,
} from '@/lib/types/policy';

interface UsePolicyReturn {
  policy: PortfolioPolicy | null;
  isLoading: boolean;
  error: string | null;
  savePolicy: (data: UpdatePortfolioPolicy) => Promise<boolean>;
  isSaving: boolean;
  resetToDefault: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function usePolicy(portfolioId: string): UsePolicyReturn {
  const [policy, setPolicy] = useState<PortfolioPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch policy
  const fetchPolicy = useCallback(async () => {
    if (!portfolioId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/portfolios/${portfolioId}/policy`);
      if (!res.ok) throw new Error('Politika yüklenemedi');
      const data = await res.json();
      setPolicy(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  // Save policy
  const savePolicy = useCallback(
    async (data: UpdatePortfolioPolicy) => {
      try {
        setIsSaving(true);
        setError(null);
        const res = await fetch(`/api/portfolios/${portfolioId}/policy`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || 'Kaydetme başarısız'
          );
        }
        const updated = await res.json();
        setPolicy(updated);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kaydetme hatası');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [portfolioId],
  );

  // Reset to default
  const resetToDefault = useCallback(async () => {
    return savePolicy(DEFAULT_POLICY);
  }, [savePolicy]);

  return {
    policy,
    isLoading,
    error,
    savePolicy,
    isSaving,
    resetToDefault,
    refetch: fetchPolicy,
  };
}
