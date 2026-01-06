import { z } from 'zod';

// ============================================================================
// PORTFOLIO SNAPSHOT TYPES
// ============================================================================

export interface PortfolioSnapshot {
  id: string;
  portfolio_id: string;
  snapshot_date: string; // YYYY-MM-DD
  total_value: number;
  assets_value: number;
  cash_value: number;
  daily_change: number;
  daily_change_percent: number;
  created_at: string;
}

export const PortfolioSnapshotSchema = z.object({
  id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  snapshot_date: z.string(),
  total_value: z.number(),
  assets_value: z.number(),
  cash_value: z.number(),
  daily_change: z.number(),
  daily_change_percent: z.number(),
  created_at: z.string().datetime(),
});

export const CreateSnapshotSchema = z.object({
  total_value: z.number(),
  assets_value: z.number(),
  cash_value: z.number(),
  daily_change: z.number().optional(),
  daily_change_percent: z.number().optional(),
});

export type CreateSnapshot = z.infer<typeof CreateSnapshotSchema>;

// ============================================================================
// ASSET DAILY CHANGE
// ============================================================================

export interface AssetDailyChange {
  symbol: string;
  currentPrice: number;
  previousClose: number;
  changeAmount: number;
  changePercent: number;
  positionChangeAmount: number; // quantity * changeAmount
}

// ============================================================================
// PERFORMANCE SUMMARY
// ============================================================================

export interface PerformanceSummary {
  startValue: number;
  endValue: number;
  totalChange: number;
  totalChangePercent: number;
  bestDay: { date: string; change: number; changePercent: number } | null;
  worstDay: { date: string; change: number; changePercent: number } | null;
}

// ============================================================================
// PERIOD TYPE
// ============================================================================

export type Period = '7d' | '30d' | '90d' | '365d' | 'all';

export const PERIOD_LABELS: Record<Period, string> = {
  '7d': '1H',
  '30d': '1A',
  '90d': '3A',
  '365d': '1Y',
  'all': 'Tümü',
};

export const PERIOD_DAYS: Record<Period, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '365d': 365,
  'all': null,
};

// ============================================================================
// LIVE PRICE WITH CHANGE
// ============================================================================

export interface LivePriceWithChange {
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate daily change percentage
 */
export function calculateDailyChangePercent(
  currentPrice: number,
  previousClose: number
): number {
  if (previousClose === 0) return 0;
  return ((currentPrice - previousClose) / previousClose) * 100;
}

/**
 * Calculate daily change amount
 */
export function calculateDailyChangeAmount(
  currentPrice: number,
  previousClose: number
): number {
  return currentPrice - previousClose;
}

/**
 * Calculate position daily change
 */
export function calculatePositionDailyChange(
  quantity: number,
  currentPrice: number,
  previousClose: number
): number {
  return quantity * (currentPrice - previousClose);
}

/**
 * Get period start date
 */
export function getPeriodStartDate(period: Period): Date | null {
  const days = PERIOD_DAYS[period];
  if (days === null) return null;
  
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatSnapshotDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
