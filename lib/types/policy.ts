import { z } from 'zod';

// ============================================================================
// PORTFOLIO TYPE (Portfolyo Türleri)
// ============================================================================

export interface PortfolioType {
  id: string;
  user_id: string;
  name: string;
  display_name: string;
  icon?: string | null;
  color?: string | null;
  created_at: string;
}

export const PortfolioTypeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(50),
  display_name: z.string().min(1).max(100),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  created_at: z.string().datetime(),
});

export const CreatePortfolioTypeSchema = z.object({
  name: z.string().min(1).max(50),
  display_name: z.string().min(1).max(100),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const UpdatePortfolioTypeSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  display_name: z.string().min(1).max(100).optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

export type CreatePortfolioType = z.infer<typeof CreatePortfolioTypeSchema>;
export type UpdatePortfolioType = z.infer<typeof UpdatePortfolioTypeSchema>;

// ============================================================================
// PORTFOLIO POLICY (Yatırım Kuralları)
// ============================================================================

export interface PortfolioPolicy {
  id: string;
  portfolio_id: string;
  
  // Per Stock Limits
  max_weight_per_stock: number;
  
  // Position Categories
  core_min_weight: number;
  core_max_weight: number;
  satellite_min_weight: number;
  satellite_max_weight: number;
  new_position_min_weight: number;
  new_position_max_weight: number;
  
  // Sector Limits
  max_weight_per_sector: number;
  
  // Cash Management
  cash_min_percent: number;
  cash_max_percent: number;
  cash_target_percent: number;
  
  created_at: string;
  updated_at?: string | null;
}

export const PortfolioPolicySchema = z.object({
  id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  max_weight_per_stock: z.number().min(0).max(1),
  core_min_weight: z.number().min(0).max(1),
  core_max_weight: z.number().min(0).max(1),
  satellite_min_weight: z.number().min(0).max(1),
  satellite_max_weight: z.number().min(0).max(1),
  new_position_min_weight: z.number().min(0).max(1),
  new_position_max_weight: z.number().min(0).max(1),
  max_weight_per_sector: z.number().min(0).max(1),
  cash_min_percent: z.number().min(0).max(1),
  cash_max_percent: z.number().min(0).max(1),
  cash_target_percent: z.number().min(0).max(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable().optional(),
});

export const CreatePortfolioPolicySchema = z.object({
  max_weight_per_stock: z.number().min(0).max(1).default(0.12),
  core_min_weight: z.number().min(0).max(1).default(0.08),
  core_max_weight: z.number().min(0).max(1).default(0.12),
  satellite_min_weight: z.number().min(0).max(1).default(0.01),
  satellite_max_weight: z.number().min(0).max(1).default(0.05),
  new_position_min_weight: z.number().min(0).max(1).default(0.005),
  new_position_max_weight: z.number().min(0).max(1).default(0.02),
  max_weight_per_sector: z.number().min(0).max(1).default(0.25),
  cash_min_percent: z.number().min(0).max(1).default(0.05),
  cash_max_percent: z.number().min(0).max(1).default(0.10),
  cash_target_percent: z.number().min(0).max(1).default(0.07),
});

export const UpdatePortfolioPolicySchema = CreatePortfolioPolicySchema.partial();

export type CreatePortfolioPolicy = z.infer<typeof CreatePortfolioPolicySchema>;
export type UpdatePortfolioPolicy = z.infer<typeof UpdatePortfolioPolicySchema>;

// ============================================================================
// DEFAULT POLICY VALUES
// ============================================================================

export const DEFAULT_POLICY: CreatePortfolioPolicy = {
  max_weight_per_stock: 0.12,
  core_min_weight: 0.08,
  core_max_weight: 0.12,
  satellite_min_weight: 0.01,
  satellite_max_weight: 0.05,
  new_position_min_weight: 0.005,
  new_position_max_weight: 0.02,
  max_weight_per_sector: 0.25,
  cash_min_percent: 0.05,
  cash_max_percent: 0.10,
  cash_target_percent: 0.07,
};

// ============================================================================
// POLICY VIOLATION TYPES
// ============================================================================

export type PolicyViolationType = 
  | 'OVER_WEIGHT' 
  | 'UNDER_WEIGHT' 
  | 'UNDER_CASH' 
  | 'OVER_CASH' 
  | 'SECTOR_CONCENTRATION';

export type PolicyViolationSeverity = 'warning' | 'critical';

export interface PolicyViolation {
  portfolio_id: string;
  type: PolicyViolationType;
  severity: PolicyViolationSeverity;
  asset_id?: string;
  asset_symbol?: string;
  sector_id?: string;
  sector_name?: string;
  current_value: number;
  limit_value: number;
  recommendation: string;
}
