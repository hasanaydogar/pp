/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnConfigPanel } from '@/components/portfolio/column-config-panel';
import { DEFAULT_COLUMNS } from '@/lib/config/default-columns';
import { COLUMN_IDS } from '@/lib/types/table-columns';

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

describe('ColumnConfigPanel', () => {
  const mockOnReorder = jest.fn();
  const mockOnToggleVisibility = jest.fn();
  const mockOnReset = jest.fn();

  const defaultProps = {
    columns: DEFAULT_COLUMNS,
    onReorder: mockOnReorder,
    onToggleVisibility: mockOnToggleVisibility,
    onReset: mockOnReset,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the panel button', () => {
    render(<ColumnConfigPanel {...defaultProps} />);

    const button = screen.getByTitle('Tablo kolonlarını düzenle');
    expect(button).toBeInTheDocument();
  });

  it('should show panel content when clicked', () => {
    render(<ColumnConfigPanel {...defaultProps} />);

    const button = screen.getByTitle('Tablo kolonlarını düzenle');
    fireEvent.click(button);

    expect(screen.getByText('Tablo Kolonları')).toBeInTheDocument();
  });

  it('should display all columns in the panel', () => {
    render(<ColumnConfigPanel {...defaultProps} />);

    const button = screen.getByTitle('Tablo kolonlarını düzenle');
    fireEvent.click(button);

    // Check for column labels
    expect(screen.getByText('Sembol')).toBeInTheDocument();
    expect(screen.getByText('Son Fiyat')).toBeInTheDocument();
    expect(screen.getByText('Ağırlık')).toBeInTheDocument();
    expect(screen.getByText('Değer')).toBeInTheDocument();
    expect(screen.getByText('Aksiyon')).toBeInTheDocument();
  });

  it('should show visible count', () => {
    render(<ColumnConfigPanel {...defaultProps} />);

    const button = screen.getByTitle('Tablo kolonlarını düzenle');
    fireEvent.click(button);

    // All 12 columns visible by default
    expect(screen.getByText('12/12 görünür')).toBeInTheDocument();
  });

  it('should show correct visible count when some columns hidden', () => {
    const columnsWithHidden = DEFAULT_COLUMNS.map(col =>
      col.id === COLUMN_IDS.COST_BASIS ? { ...col, visible: false } : col
    );

    render(<ColumnConfigPanel {...defaultProps} columns={columnsWithHidden} />);

    const button = screen.getByTitle('Tablo kolonlarını düzenle');
    fireEvent.click(button);

    expect(screen.getByText('11/12 görünür')).toBeInTheDocument();
  });

  it('should call onToggleVisibility when checkbox clicked', () => {
    render(<ColumnConfigPanel {...defaultProps} />);

    const button = screen.getByTitle('Tablo kolonlarını düzenle');
    fireEvent.click(button);

    // Find checkbox for "Maliyet" column
    const checkbox = screen.getByLabelText('Toggle Maliyet visibility');
    fireEvent.click(checkbox);

    expect(mockOnToggleVisibility).toHaveBeenCalledWith(COLUMN_IDS.COST_BASIS);
  });

  it('should have disabled checkbox for required columns', () => {
    render(<ColumnConfigPanel {...defaultProps} />);

    const button = screen.getByTitle('Tablo kolonlarını düzenle');
    fireEvent.click(button);

    // Symbol is required
    const symbolCheckbox = screen.getByLabelText('Toggle Sembol visibility');
    expect(symbolCheckbox).toBeDisabled();

    // Actions is required
    const actionsCheckbox = screen.getByLabelText('Toggle Aksiyon visibility');
    expect(actionsCheckbox).toBeDisabled();
  });

  it('should call onReset when reset button clicked', () => {
    render(<ColumnConfigPanel {...defaultProps} />);

    const button = screen.getByTitle('Tablo kolonlarını düzenle');
    fireEvent.click(button);

    const resetButton = screen.getByText('Varsayılana Sıfırla');
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalled();
  });

  it('should show required label for required columns', () => {
    render(<ColumnConfigPanel {...defaultProps} />);

    const button = screen.getByTitle('Tablo kolonlarını düzenle');
    fireEvent.click(button);

    // Required columns show "(zorunlu)"
    const zorunluLabels = screen.getAllByText('(zorunlu)');
    expect(zorunluLabels.length).toBe(2); // Symbol and Actions
  });
});
