import { z } from 'zod';
import { Currency, DEFAULT_CURRENCY } from './currency';

// ============================================================================
// ENUM TYPES
// ============================================================================

export enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  FOREX = 'FOREX',
  MUTUAL_FUND = 'MUTUAL_FUND',
  ETF = 'ETF',
  BOND = 'BOND',
  COMMODITY = 'COMMODITY',
  REAL_ESTATE = 'REAL_ESTATE',
  DERIVATIVE = 'DERIVATIVE',
  OTHER = 'OTHER',
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to normalize datetime strings (convert +00:00 to Z)
// Handles various UTC offset formats and converts them to Z format
const normalizeDatetime = (val: unknown): unknown => {
  if (typeof val !== 'string') {
    return val;
  }
  
  // Convert +00:00 to Z
  if (val.includes('+00:00')) {
    return val.replace('+00:00', 'Z');
  }
  
  // Convert -00:00 to Z
  if (val.includes('-00:00')) {
    return val.replace('-00:00', 'Z');
  }
  
  // Handle other UTC offset formats (e.g., +0000, -0000)
  if (/[+-]00:?00$/.test(val)) {
    return val.replace(/[+-]00:?00$/, 'Z');
  }
  
  return val;
};

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const PortfolioSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  base_currency: z.string().default(DEFAULT_CURRENCY),
  benchmark_symbol: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

export const AssetSchema = z.object({
  id: z.string().uuid(),
  portfolio_id: z.string().uuid(),
  symbol: z.string().min(1).max(20),
  quantity: z.number().positive(),
  average_buy_price: z.number().positive(),
  type: z.nativeEnum(AssetType),
  currency: z.string().default(DEFAULT_CURRENCY),
  initial_purchase_date: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  asset_id: z.string().uuid(),
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive(),
  price: z.number().positive(),
  date: z.string().datetime(),
  transaction_cost: z.number().nonnegative().default(0),
  currency: z.string().nullable().optional(),
  realized_gain_loss: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

// ============================================================================
// INSERT SCHEMAS (for creating new records)
// ============================================================================

export const CreatePortfolioSchema = z.object({
  name: z.string().min(1).max(255),
  base_currency: z.string().optional().default(DEFAULT_CURRENCY),
  benchmark_symbol: z.string().optional(),
});

export const CreateAssetSchema = z.object({
  portfolio_id: z.string().uuid(),
  symbol: z.string().min(1).max(20),
  quantity: z.number().positive(),
  average_buy_price: z.number().positive(),
  type: z.nativeEnum(AssetType),
  currency: z.string().optional().default(DEFAULT_CURRENCY),
  initial_purchase_date: z
    .preprocess(normalizeDatetime, z.string().datetime().optional()),
  notes: z.string().optional(),
});

export const CreateTransactionSchema = z.object({
  asset_id: z.string().uuid(),
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive(),
  price: z.number().positive(),
  date: z.preprocess(normalizeDatetime, z.string().datetime()),
  transaction_cost: z.number().nonnegative().default(0),
  currency: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// UPDATE SCHEMAS (for updating existing records)
// ============================================================================

export const UpdatePortfolioSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  base_currency: z.string().optional(),
  benchmark_symbol: z.string().optional().nullable(),
});

export const UpdateAssetSchema = z.object({
  symbol: z.string().min(1).max(20).optional(),
  quantity: z.number().positive().optional(),
  average_buy_price: z.number().positive().optional(),
  type: z.nativeEnum(AssetType).optional(),
  currency: z.string().optional(),
  initial_purchase_date: z
    .preprocess(normalizeDatetime, z.string().datetime().nullish()),
  notes: z.string().optional(),
});

export const UpdateTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  amount: z.number().positive().optional(),
  price: z.number().positive().optional(),
  date: z.preprocess(normalizeDatetime, z.string().datetime().optional()),
  transaction_cost: z.number().nonnegative().optional(),
  currency: z.string().optional().nullable(),
  notes: z.string().optional(),
});

// ============================================================================
// BULK IMPORT SCHEMAS
// ============================================================================

/**
 * Schema for bulk transaction import
 * Used for importing multiple historical transactions at once
 * Note: This schema is used when asset_id is already known (from route parameter)
 */
export const BulkTransactionImportSchema = z.object({
  transactions: z
    .array(CreateTransactionSchema.omit({ asset_id: true }))
    .min(1, 'At least one transaction is required')
    .max(1000, 'Maximum 1000 transactions per import'),
});

/**
 * Schema for asset import with transactions
 * Used for creating an asset from historical transactions
 * Note: transactions don't include asset_id as it will be assigned after asset creation
 */
export const AssetImportSchema = z.object({
  symbol: z.string().min(1).max(20),
  type: z.nativeEnum(AssetType),
  currency: z.string().optional().default('USD'),
  initial_purchase_date: z
    .preprocess(normalizeDatetime, z.string().datetime().optional()),
  notes: z.string().optional(),
  transactions: z
    .array(CreateTransactionSchema.omit({ asset_id: true }))
    .min(1, 'At least one transaction is required')
    .max(1000, 'Maximum 1000 transactions per import'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Portfolio = z.infer<typeof PortfolioSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;

export type CreatePortfolio = z.infer<typeof CreatePortfolioSchema>;
export type CreateAsset = z.infer<typeof CreateAssetSchema>;
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;

export type UpdatePortfolio = z.infer<typeof UpdatePortfolioSchema>;
export type UpdateAsset = z.infer<typeof UpdateAssetSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;

export type BulkTransactionImport = z.infer<typeof BulkTransactionImportSchema>;
export type AssetImport = z.infer<typeof AssetImportSchema>;

