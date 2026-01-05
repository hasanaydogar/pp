import { Asset } from './portfolio';
import { PositionCategory } from './sector';

// ============================================================================
// ASSET WITH METRICS (Extended Asset Interface for UI)
// ============================================================================

export interface AssetWithMetrics extends Asset {
  /** Current market value (quantity * current_price) */
  currentValue: number;
  
  /** Total cost basis (quantity * average_buy_price) */
  costBasis: number;
  
  /** Gain/Loss amount (currentValue - costBasis) */
  gainLoss: number;
  
  /** Gain/Loss percentage ((gainLoss / costBasis) * 100) */
  gainLossPercent: number;
  
  /** Weight in portfolio (0-1) */
  weight: number;
  
  /** Position category based on weight */
  category: PositionCategory;
  
  /** Whether the position exceeds max weight policy */
  isOverWeight: boolean;
  
  /** Daily change percentage (from previous close) */
  dailyChangePercent: number;
  
  /** Daily change amount per share */
  dailyChangeAmount: number;
  
  /** Daily P&L for this position (quantity * dailyChangeAmount) */
  positionDailyChange: number;
  
  /** Previous close price (if available) */
  previousClose?: number;
}

// ============================================================================
// SORTING TYPES
// ============================================================================

export type SortColumn = 
  | 'symbol' 
  | 'weight' 
  | 'currentValue' 
  | 'costBasis' 
  | 'gainLoss' 
  | 'gainLossPercent'
  | 'category'
  | 'dailyChangePercent'
  | 'positionDailyChange';

export type SortDirection = 'asc' | 'desc';

// ============================================================================
// SUMMARY TYPES
// ============================================================================

export interface PortfolioAssetsSummary {
  /** Total portfolio value (assets + cash) */
  totalValue: number;
  
  /** Total assets value (excluding cash) */
  totalAssetsValue: number;
  
  /** Daily change amount */
  dailyChange: number;
  
  /** Daily change percentage */
  dailyChangePercent: number;
  
  /** Number of unique assets */
  assetCount: number;
  
  /** Cash amount */
  cashAmount: number;
  
  /** Cash percentage of total */
  cashPercent: number;
  
  /** Target cash percentage from policy */
  cashTarget: number;
}
