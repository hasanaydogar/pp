// ============================================================================
// TABLE COLUMN CONFIGURATION TYPES
// ============================================================================

/**
 * Configuration for a single table column
 */
export interface ColumnConfig {
  /** Unique column identifier */
  id: string;
  /** Display label for the column header */
  label: string;
  /** Whether the column is currently visible */
  visible: boolean;
  /** Whether the column can be sorted */
  sortable: boolean;
  /** Whether the column is required (cannot be hidden) */
  required: boolean;
  /** Position in the table (0-based) */
  order: number;
  /** Text alignment */
  align: 'left' | 'right' | 'center';
  /** Minimum width CSS value */
  minWidth?: string;
  /** CSS class for responsive hiding (e.g., 'sm:table-cell') */
  responsiveHide?: string;
}

/**
 * User's table preferences stored in localStorage
 */
export interface TablePreferences {
  /** Version number for migration support */
  version: number;
  /** Portfolio ID these preferences belong to */
  portfolioId: string;
  /** Column configurations */
  columns: ColumnConfig[];
  /** ISO timestamp of last update */
  lastUpdated: string;
}

/**
 * Column identifiers matching the assets table columns
 */
export const COLUMN_IDS = {
  ROW_NUMBER: 'rowNumber',
  SYMBOL: 'symbol',
  CURRENT_PRICE: 'currentPrice',
  WEIGHT: 'weight',
  CURRENT_VALUE: 'currentValue',
  COST_BASIS: 'costBasis',
  GAIN_LOSS: 'gainLoss',
  GAIN_LOSS_PERCENT: 'gainLossPercent',
  DAILY_CHANGE_PERCENT: 'dailyChangePercent',
  DAILY_CHANGE_AMOUNT: 'dailyChangeAmount',
  CATEGORY: 'category',
  ACTIONS: 'actions',
} as const;

/**
 * Type for column ID values
 */
export type ColumnId = typeof COLUMN_IDS[keyof typeof COLUMN_IDS];

/**
 * Map of column IDs to their sortable column names (for SortColumn type)
 */
export const COLUMN_SORT_MAP: Partial<Record<ColumnId, string>> = {
  [COLUMN_IDS.SYMBOL]: 'symbol',
  [COLUMN_IDS.CURRENT_PRICE]: 'currentPrice',
  [COLUMN_IDS.WEIGHT]: 'weight',
  [COLUMN_IDS.CURRENT_VALUE]: 'currentValue',
  [COLUMN_IDS.COST_BASIS]: 'costBasis',
  [COLUMN_IDS.GAIN_LOSS]: 'gainLoss',
  [COLUMN_IDS.GAIN_LOSS_PERCENT]: 'gainLossPercent',
  [COLUMN_IDS.DAILY_CHANGE_PERCENT]: 'dailyChangePercent',
  [COLUMN_IDS.DAILY_CHANGE_AMOUNT]: 'dailyChangeAmount',
  [COLUMN_IDS.CATEGORY]: 'category',
};
