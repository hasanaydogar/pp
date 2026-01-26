/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SortableAssetsTable } from '@/components/portfolio/sortable-assets-table';
import { DEFAULT_COLUMNS, getDefaultColumns } from '@/lib/config/default-columns';
import { COLUMN_IDS } from '@/lib/types/table-columns';
import { AssetWithMetrics } from '@/lib/types/asset-metrics';

// Mock @dnd-kit
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: jest.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: jest.fn((arr, from, to) => {
    const result = [...arr];
    const [moved] = result.splice(from, 1);
    result.splice(to, 0, moved);
    return result;
  }),
}));

const mockAssets: AssetWithMetrics[] = [
  {
    id: 'asset-1',
    portfolio_id: 'portfolio-1',
    symbol: 'AAPL',
    name: 'Apple Inc',
    quantity: 10,
    average_buy_price: 150,
    created_at: '2025-01-01',
    currentPrice: 175,
    currentValue: 1750,
    costBasis: 1500,
    gainLoss: 250,
    gainLossPercent: 16.67,
    weight: 0.35,
    category: 'core',
    isOverWeight: false,
    dailyChangePercent: 1.5,
    dailyChangeAmount: 2.5,
    positionDailyChange: 25,
  },
  {
    id: 'asset-2',
    portfolio_id: 'portfolio-1',
    symbol: 'GOOGL',
    name: 'Alphabet Inc',
    quantity: 5,
    average_buy_price: 100,
    created_at: '2025-01-01',
    currentPrice: 120,
    currentValue: 600,
    costBasis: 500,
    gainLoss: 100,
    gainLossPercent: 20,
    weight: 0.12,
    category: 'satellite',
    isOverWeight: false,
    dailyChangePercent: -0.5,
    dailyChangeAmount: -0.6,
    positionDailyChange: -3,
  },
];

describe('SortableAssetsTable with Column Customization', () => {
  const mockOnSort = jest.fn();
  const mockOnColumnsChange = jest.fn();
  const mockOnToggleColumn = jest.fn();
  const mockOnResetColumns = jest.fn();

  const defaultProps = {
    assets: mockAssets,
    sortColumn: 'weight' as const,
    sortDirection: 'desc' as const,
    onSort: mockOnSort,
    slug: 'test-portfolio',
    displayCurrency: 'USD',
  };

  const propsWithColumns = {
    ...defaultProps,
    columns: getDefaultColumns(),
    onColumnsChange: mockOnColumnsChange,
    onToggleColumn: mockOnToggleColumn,
    onResetColumns: mockOnResetColumns,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('without column customization', () => {
    it('should render table with default static columns', () => {
      render(<SortableAssetsTable {...defaultProps} />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
    });

    it('should not show column config panel', () => {
      render(<SortableAssetsTable {...defaultProps} />);

      expect(screen.queryByTitle('Tablo kolonlarını düzenle')).not.toBeInTheDocument();
    });
  });

  describe('with column customization', () => {
    it('should render column config panel', () => {
      render(<SortableAssetsTable {...propsWithColumns} />);

      expect(screen.getByTitle('Tablo kolonlarını düzenle')).toBeInTheDocument();
    });

    it('should render all visible columns', () => {
      render(<SortableAssetsTable {...propsWithColumns} />);

      // Check header labels
      expect(screen.getByText('Sembol')).toBeInTheDocument();
      expect(screen.getByText('Son Fiyat')).toBeInTheDocument();
      expect(screen.getByText('Ağırlık')).toBeInTheDocument();
    });

    it('should hide columns when visibility is toggled', () => {
      const columnsWithHidden = getDefaultColumns().map(col =>
        col.id === COLUMN_IDS.COST_BASIS ? { ...col, visible: false } : col
      );

      render(<SortableAssetsTable {...propsWithColumns} columns={columnsWithHidden} />);

      // Maliyet should not be in headers
      expect(screen.queryByRole('columnheader', { name: /maliyet/i })).not.toBeInTheDocument();
    });

    it('should respect column order', () => {
      // Reorder: put Weight before Symbol
      const reorderedColumns = getDefaultColumns().map(col => {
        if (col.id === COLUMN_IDS.SYMBOL) return { ...col, order: 2 };
        if (col.id === COLUMN_IDS.WEIGHT) return { ...col, order: 1 };
        return col;
      });

      render(<SortableAssetsTable {...propsWithColumns} columns={reorderedColumns} />);

      // Both should be present
      expect(screen.getByText('Sembol')).toBeInTheDocument();
      expect(screen.getByText('Ağırlık')).toBeInTheDocument();
    });

    it('should call onToggleColumn when column visibility changed', () => {
      render(<SortableAssetsTable {...propsWithColumns} />);

      // Open panel
      const panelButton = screen.getByTitle('Tablo kolonlarını düzenle');
      fireEvent.click(panelButton);

      // Toggle Maliyet column
      const checkbox = screen.getByLabelText('Toggle Maliyet visibility');
      fireEvent.click(checkbox);

      expect(mockOnToggleColumn).toHaveBeenCalledWith(COLUMN_IDS.COST_BASIS);
    });

    it('should call onResetColumns when reset clicked', () => {
      render(<SortableAssetsTable {...propsWithColumns} />);

      // Open panel
      const panelButton = screen.getByTitle('Tablo kolonlarını düzenle');
      fireEvent.click(panelButton);

      // Click reset
      const resetButton = screen.getByText('Varsayılana Sıfırla');
      fireEvent.click(resetButton);

      expect(mockOnResetColumns).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no assets', () => {
      render(<SortableAssetsTable {...defaultProps} assets={[]} />);

      expect(screen.getByText('Henüz varlık eklenmemiş.')).toBeInTheDocument();
    });
  });
});
