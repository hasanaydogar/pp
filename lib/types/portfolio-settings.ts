import { z } from 'zod';

// ============================================================================
// PORTFOLIO SETTINGS
// ============================================================================

export interface PortfolioSettings {
  id: string;
  portfolio_id: string;
  monthly_investment: number;
  investment_day_of_month: number;
  expected_return_rate: number; // 0.10 = %10
  withdrawal_rate: number; // 0.04 = %4
  include_dividends_in_projection: boolean;
  created_at: string;
  updated_at?: string | null;
}

export const PortfolioSettingsSchema = z.object({
  id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  monthly_investment: z.number().min(0),
  investment_day_of_month: z.number().int().min(1).max(28),
  expected_return_rate: z.number().min(0).max(1),
  withdrawal_rate: z.number().min(0).max(1),
  include_dividends_in_projection: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable().optional(),
});

export const UpdatePortfolioSettingsSchema = z.object({
  monthly_investment: z.number().min(0).optional(),
  investment_day_of_month: z.number().int().min(1).max(28).optional(),
  expected_return_rate: z.number().min(0).max(0.50).optional(), // Max 50%
  withdrawal_rate: z.number().min(0).max(0.20).optional(), // Max 20%
  include_dividends_in_projection: z.boolean().optional(),
});

export type UpdatePortfolioSettings = z.infer<typeof UpdatePortfolioSettingsSchema>;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_PORTFOLIO_SETTINGS: Omit<PortfolioSettings, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'> = {
  monthly_investment: 0,
  investment_day_of_month: 1,
  expected_return_rate: 0.10, // %10
  withdrawal_rate: 0.04, // %4 (4% rule)
  include_dividends_in_projection: true,
};

// ============================================================================
// PROJECTION TYPES
// ============================================================================

export interface ProjectionResult {
  years: number;
  future_value: number;
  total_invested: number;
  total_returns: number;
  monthly_income: number;
}

export interface ProjectionScenario {
  optimistic: ProjectionResult[];
  base: ProjectionResult[];
  pessimistic: ProjectionResult[];
}

export interface ProjectionParams {
  current_value: number;
  monthly_investment: number;
  annual_return_rate: number;
  withdrawal_rate: number;
  periods: number[]; // [1, 5, 10, 15, 20, 25]
}

// ============================================================================
// PROJECTION PRESETS
// ============================================================================

export const DEFAULT_PROJECTION_PERIODS = [1, 5, 10, 15, 20, 25];

export const SCENARIO_ADJUSTMENTS = {
  optimistic: 0.02, // +2%
  pessimistic: -0.02, // -2%
};
