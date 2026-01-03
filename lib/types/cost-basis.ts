/**
 * Cost basis types
 */

import { z } from 'zod';

/**
 * Cost basis lot schema
 */
export const CostBasisLotSchema = z.object({
  id: z.string().uuid(),
  asset_id: z.string().uuid(),
  purchase_transaction_id: z.string().uuid(),
  quantity: z.number().positive(),
  cost_basis: z.number().positive(),
  remaining_quantity: z.number().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

/**
 * Cost basis information schema
 */
export const CostBasisInfoSchema = z.object({
  totalLots: z.number().nonnegative(),
  totalQuantity: z.number().nonnegative(),
  totalCostBasis: z.number().nonnegative(),
  remainingQuantity: z.number().nonnegative(),
  remainingCostBasis: z.number().nonnegative(),
  lots: z.array(CostBasisLotSchema),
  averageCostBasis: z.number().optional(),
  method: z.enum(['FIFO', 'Average Cost']),
  note: z.string().optional(),
});

export type CostBasisLot = z.infer<typeof CostBasisLotSchema>;
export type CostBasisInfo = z.infer<typeof CostBasisInfoSchema>;

