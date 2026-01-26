'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ColumnConfig } from '@/lib/types/table-columns';
import { getDefaultColumns } from '@/lib/config/default-columns';
import {
  loadPreferences,
  savePreferences,
  clearPreferences,
} from '@/lib/utils/table-storage';
import {
  reorderColumns,
  toggleColumn,
  getVisibleColumns,
  mergeWithDefaults,
} from '@/lib/utils/column-utils';

export interface UseTablePreferencesReturn {
  /** All columns (visible and hidden) */
  columns: ColumnConfig[];
  /** Only visible columns, sorted by order */
  visibleColumns: ColumnConfig[];
  /** Update column order after drag-and-drop */
  setColumnOrder: (columns: ColumnConfig[]) => void;
  /** Move a column from one position to another */
  moveColumn: (fromIndex: number, toIndex: number) => void;
  /** Toggle column visibility */
  toggleColumnVisibility: (columnId: string) => void;
  /** Reset to default column configuration */
  resetToDefault: () => void;
  /** Whether preferences are still loading */
  isLoading: boolean;
}

/**
 * Hook for managing table column preferences
 * Persists preferences to localStorage per portfolio
 */
export function useTablePreferences(portfolioId: string | null): UseTablePreferencesReturn {
  const [columns, setColumns] = useState<ColumnConfig[]>(() => getDefaultColumns());
  const [isLoading, setIsLoading] = useState(true);

  // Track if user has made changes (to avoid saving during initialization)
  const hasUserChangedRef = useRef(false);
  const currentPortfolioIdRef = useRef<string | null>(null);

  // Load preferences from localStorage on mount or when portfolioId changes
  useEffect(() => {
    // Reset user change flag when portfolio changes
    hasUserChangedRef.current = false;
    currentPortfolioIdRef.current = portfolioId;

    if (!portfolioId) {
      setColumns(getDefaultColumns());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Use setTimeout to ensure this runs after hydration
    const timer = setTimeout(() => {
      // Double-check portfolioId hasn't changed during timeout
      if (currentPortfolioIdRef.current !== portfolioId) return;

      const saved = loadPreferences(portfolioId);
      if (saved) {
        // Merge with defaults in case new columns were added
        const merged = mergeWithDefaults(saved.columns, getDefaultColumns());
        setColumns(merged);
      } else {
        setColumns(getDefaultColumns());
      }
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [portfolioId]);

  // Memoize visible columns
  const visibleColumns = useMemo(() => getVisibleColumns(columns), [columns]);

  // Save helper - only saves if user has made changes
  const saveIfChanged = useCallback((newColumns: ColumnConfig[]) => {
    if (portfolioId && hasUserChangedRef.current) {
      savePreferences(portfolioId, newColumns);
    }
  }, [portfolioId]);

  // Set column order directly (for drag-and-drop)
  const setColumnOrder = useCallback((newColumns: ColumnConfig[]) => {
    hasUserChangedRef.current = true;
    const withOrder = newColumns.map((col, index) => ({ ...col, order: index }));
    setColumns(withOrder);
    if (portfolioId) {
      savePreferences(portfolioId, withOrder);
    }
  }, [portfolioId]);

  // Move a column from one position to another
  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    hasUserChangedRef.current = true;
    setColumns(prev => {
      const newColumns = reorderColumns(prev, fromIndex, toIndex);
      if (portfolioId) {
        savePreferences(portfolioId, newColumns);
      }
      return newColumns;
    });
  }, [portfolioId]);

  // Toggle column visibility
  const toggleColumnVisibility = useCallback((columnId: string) => {
    hasUserChangedRef.current = true;
    setColumns(prev => {
      const newColumns = toggleColumn(prev, columnId);
      if (portfolioId) {
        savePreferences(portfolioId, newColumns);
      }
      return newColumns;
    });
  }, [portfolioId]);

  // Reset to default configuration
  const resetToDefault = useCallback(() => {
    hasUserChangedRef.current = true;
    if (portfolioId) {
      clearPreferences(portfolioId);
    }
    setColumns(getDefaultColumns());
  }, [portfolioId]);

  return {
    columns,
    visibleColumns,
    setColumnOrder,
    moveColumn,
    toggleColumnVisibility,
    resetToDefault,
    isLoading,
  };
}
