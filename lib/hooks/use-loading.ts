'use client';

import { useState, useCallback } from 'react';

/**
 * Loading state hook
 * Manages loading state for async operations
 */
export function useLoading(initialState: boolean = false) {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const setLoadingError = useCallback((err: Error) => {
    setLoading(false);
    setError(err);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  /**
   * Execute async function with loading state management
   */
  const execute = useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        startLoading();
        const result = await asyncFn();
        stopLoading();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setLoadingError(error);
        return null;
      }
    },
    [startLoading, stopLoading, setLoadingError],
  );

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset,
    execute,
  };
}

