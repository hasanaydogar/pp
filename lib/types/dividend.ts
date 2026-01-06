import { z } from 'zod';

// ============================================================================
// REINVEST STRATEGY
// ============================================================================

export enum ReinvestStrategy {
  CASH = 'CASH',
  REINVEST = 'REINVEST',
  CUSTOM = 'CUSTOM',
}

export const ReinvestStrategyLabels: Record<ReinvestStrategy, string> = {
  [ReinvestStrategy.CASH]: 'Nakit Olarak Tut',
  [ReinvestStrategy.REINVEST]: 'Aynı Varlığa Yatır',
  [ReinvestStrategy.CUSTOM]: 'Başka Varlığa Yatır',
};

// ============================================================================
// DIVIDEND
// ============================================================================

export interface Dividend {
  id: string;
  asset_id: string;
  portfolio_id: string;
  gross_amount: number;
  tax_amount: number;
  net_amount: number;
  currency: string;
  ex_dividend_date?: string | null;
  payment_date: string;
  reinvest_strategy: ReinvestStrategy;
  reinvested_to_asset_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  // Joined data
  asset?: {
    symbol: string;
    type: string;
  };
}

export const DividendSchema = z.object({
  id: z.string().uuid(),
  asset_id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  gross_amount: z.number().positive(),
  tax_amount: z.number().min(0),
  net_amount: z.number().positive(),
  currency: z.string().min(1).max(10).default('TRY'),
  ex_dividend_date: z.string().nullable().optional(),
  payment_date: z.string(),
  reinvest_strategy: z.nativeEnum(ReinvestStrategy).default(ReinvestStrategy.CASH),
  reinvested_to_asset_id: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable().optional(),
});

export const CreateDividendSchema = z.object({
  asset_id: z.string().uuid(),
  gross_amount: z.number().positive(),
  tax_amount: z.number().min(0).default(0),
  currency: z.string().min(1).max(10).default('TRY'),
  ex_dividend_date: z.string().optional(),
  payment_date: z.string(),
  reinvest_strategy: z.nativeEnum(ReinvestStrategy).default(ReinvestStrategy.CASH),
  reinvested_to_asset_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type CreateDividend = z.infer<typeof CreateDividendSchema>;

// ============================================================================
// DIVIDEND SUMMARY
// ============================================================================

export interface DividendByAsset {
  asset_id: string;
  symbol: string;
  amount: number;
  count: number;
}

export interface DividendByMonth {
  month: string; // YYYY-MM
  amount: number;
  count: number;
}

export interface DividendSummary {
  total_yearly: number;
  total_ytd: number;
  monthly_average: number;
  dividend_yield: number;
  by_asset: DividendByAsset[];
  by_month: DividendByMonth[];
  last_dividend?: Dividend | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate net amount from gross and tax rate
 */
export function calculateNetDividend(grossAmount: number, taxRate: number = 0.10): number {
  const taxAmount = grossAmount * taxRate;
  return grossAmount - taxAmount;
}

/**
 * Calculate tax amount from gross and tax rate
 */
export function calculateTaxAmount(grossAmount: number, taxRate: number = 0.10): number {
  return grossAmount * taxRate;
}

/**
 * Default withholding tax rate for dividends in Turkey
 */
export const DEFAULT_DIVIDEND_TAX_RATE = 0.15; // %15 stopaj

// ============================================================================
// UPCOMING DIVIDEND (Yahoo Finance Data)
// ============================================================================

export interface UpcomingDividend {
  id?: string; // Database ID (for manual/forecast entries)
  symbol: string;
  assetId: string;
  exDividendDate: string;
  paymentDate: string | null;
  dividendPerShare: number;
  quantity: number;
  expectedTotal: number; // quantity × dividendPerShare
  currency: string;
  daysUntil: number;
  isForecast?: boolean; // True if this is a user-entered forecast
  source?: string; // MANUAL, AUTO, MANUAL_FORECAST, YAHOO
}

export interface DividendCalendarItem {
  date: string;
  dividends: UpcomingDividend[];
  totalExpected: number;
}

export interface DividendCalendarResponse {
  upcoming: UpcomingDividend[];
  byMonth: Record<string, DividendCalendarItem[]>;
  totalExpected90Days: number;
  totalExpectedYearly: number;
}

// ============================================================================
// DIVIDEND SOURCE (for auto vs manual)
// ============================================================================

export type DividendSource = 'MANUAL' | 'AUTO';

export interface DividendWithSource extends Dividend {
  source: DividendSource;
  yahoo_event_id?: string | null;
}
