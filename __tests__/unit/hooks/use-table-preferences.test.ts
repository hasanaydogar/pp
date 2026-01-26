/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTablePreferences } from '@/lib/hooks/use-table-preferences';
import { DEFAULT_COLUMNS, getDefaultColumns, PREFERENCES_VERSION } from '@/lib/config/default-columns';
import { COLUMN_IDS } from '@/lib/types/table-columns';
import * as storage from '@/lib/utils/table-storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useTablePreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with default columns', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      // Run timer for initial load
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.columns).toHaveLength(DEFAULT_COLUMNS.length);
      expect(result.current.columns[0].id).toBe(COLUMN_IDS.ROW_NUMBER);
    });

    it('should return default columns when portfolioId is null', async () => {
      const { result } = renderHook(() => useTablePreferences(null));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.columns).toHaveLength(DEFAULT_COLUMNS.length);
    });

    it('should load saved preferences from localStorage', async () => {
      const savedColumns = getDefaultColumns();
      savedColumns[0].visible = false; // Hide row number

      localStorageMock.setItem(
        'table-prefs-portfolio-1',
        JSON.stringify({
          version: PREFERENCES_VERSION,
          portfolioId: 'portfolio-1',
          columns: savedColumns,
          lastUpdated: new Date().toISOString(),
        })
      );

      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.columns[0].visible).toBe(false);
    });
  });

  describe('visibleColumns', () => {
    it('should return only visible columns sorted by order', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // All default columns are visible
      expect(result.current.visibleColumns).toHaveLength(DEFAULT_COLUMNS.length);

      // Toggle a column to hidden
      act(() => {
        result.current.toggleColumnVisibility(COLUMN_IDS.ROW_NUMBER);
      });

      expect(result.current.visibleColumns).toHaveLength(DEFAULT_COLUMNS.length - 1);
      expect(result.current.visibleColumns.find(c => c.id === COLUMN_IDS.ROW_NUMBER)).toBeUndefined();
    });
  });

  describe('toggleColumnVisibility', () => {
    it('should toggle column visibility', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialVisibility = result.current.columns.find(
        c => c.id === COLUMN_IDS.COST_BASIS
      )?.visible;

      act(() => {
        result.current.toggleColumnVisibility(COLUMN_IDS.COST_BASIS);
      });

      const newVisibility = result.current.columns.find(
        c => c.id === COLUMN_IDS.COST_BASIS
      )?.visible;

      expect(newVisibility).toBe(!initialVisibility);
    });

    it('should not toggle required columns', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Symbol is required
      act(() => {
        result.current.toggleColumnVisibility(COLUMN_IDS.SYMBOL);
      });

      const symbolColumn = result.current.columns.find(c => c.id === COLUMN_IDS.SYMBOL);
      expect(symbolColumn?.visible).toBe(true);
    });

    it('should not toggle Actions column (required)', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.toggleColumnVisibility(COLUMN_IDS.ACTIONS);
      });

      const actionsColumn = result.current.columns.find(c => c.id === COLUMN_IDS.ACTIONS);
      expect(actionsColumn?.visible).toBe(true);
    });
  });

  describe('moveColumn', () => {
    it('should reorder columns', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalFirst = result.current.columns[0].id;
      const originalSecond = result.current.columns[1].id;

      act(() => {
        result.current.moveColumn(0, 1);
      });

      expect(result.current.columns[0].id).toBe(originalSecond);
      expect(result.current.columns[1].id).toBe(originalFirst);
    });

    it('should update order values after reordering', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.moveColumn(0, 5);
      });

      // Check that all order values are sequential
      result.current.columns.forEach((col, index) => {
        expect(col.order).toBe(index);
      });
    });
  });

  describe('setColumnOrder', () => {
    it('should set column order directly', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newOrder = [...result.current.columns].reverse();

      act(() => {
        result.current.setColumnOrder(newOrder);
      });

      expect(result.current.columns[0].id).toBe(newOrder[0].id);
    });
  });

  describe('resetToDefault', () => {
    it('should reset columns to default configuration', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Make some changes
      act(() => {
        result.current.toggleColumnVisibility(COLUMN_IDS.COST_BASIS);
        result.current.moveColumn(0, 5);
      });

      // Reset
      act(() => {
        result.current.resetToDefault();
      });

      // Verify defaults restored
      expect(result.current.columns).toEqual(getDefaultColumns());
    });

    it('should clear localStorage on reset', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.resetToDefault();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('table-prefs-portfolio-1');
    });
  });

  describe('persistence', () => {
    it('should save changes to localStorage', async () => {
      const { result } = renderHook(() => useTablePreferences('portfolio-1'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.toggleColumnVisibility(COLUMN_IDS.COST_BASIS);
      });

      // Wait for save effect
      act(() => {
        jest.runAllTimers();
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1][1]
      );
      expect(savedData.portfolioId).toBe('portfolio-1');
    });

    it('should maintain separate preferences per portfolio', async () => {
      // Save preferences for portfolio-1
      const { result: result1, unmount: unmount1 } = renderHook(() =>
        useTablePreferences('portfolio-1')
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      act(() => {
        result1.current.toggleColumnVisibility(COLUMN_IDS.COST_BASIS);
      });

      act(() => {
        jest.runAllTimers();
      });

      unmount1();

      // Check portfolio-2 has defaults
      const { result: result2 } = renderHook(() => useTablePreferences('portfolio-2'));

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false);
      });

      const costBasisCol = result2.current.columns.find(c => c.id === COLUMN_IDS.COST_BASIS);
      expect(costBasisCol?.visible).toBe(true); // Default is visible
    });
  });
});
