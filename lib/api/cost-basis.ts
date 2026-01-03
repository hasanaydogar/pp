/**
 * Cost basis tracking utilities
 * Supports FIFO (First In First Out) and Average Cost methods
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Cost basis lot structure
 */
export interface CostBasisLot {
  id: string;
  asset_id: string;
  purchase_transaction_id: string;
  quantity: number;
  cost_basis: number;
  remaining_quantity: number;
}

/**
 * FIFO cost basis calculation result
 */
export interface FIFOResult {
  costBasis: number;
  lotsUsed: Array<{
    lotId: string;
    quantityUsed: number;
    costBasis: number;
  }>;
}

/**
 * Creates a cost basis lot from a BUY transaction
 * @param supabase Supabase client
 * @param assetId Asset ID
 * @param purchaseTransactionId BUY transaction ID
 * @param quantity Quantity purchased
 * @param price Price per unit
 * @returns Created cost basis lot
 */
export async function createCostBasisLot(
  supabase: SupabaseClient,
  assetId: string,
  purchaseTransactionId: string,
  quantity: number,
  price: number,
): Promise<CostBasisLot> {
  const costBasis = quantity * price;

  const { data, error } = await supabase
    .from('cost_basis_lots')
    .insert({
      asset_id: assetId,
      purchase_transaction_id: purchaseTransactionId,
      quantity,
      cost_basis: costBasis,
      remaining_quantity: quantity,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create cost basis lot: ${error.message}`);
  }

  return data as unknown as CostBasisLot;
}

/**
 * Gets all cost basis lots for an asset, ordered by creation date (FIFO)
 * @param supabase Supabase client
 * @param assetId Asset ID
 * @returns Array of cost basis lots
 */
export async function getCostBasisLots(
  supabase: SupabaseClient,
  assetId: string,
): Promise<CostBasisLot[]> {
  const { data, error } = await supabase
    .from('cost_basis_lots')
    .select('*')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get cost basis lots: ${error.message}`);
  }

  return (data || []) as unknown as CostBasisLot[];
}

/**
 * Calculates FIFO cost basis for a SELL transaction
 * Uses oldest lots first (First In First Out)
 * @param supabase Supabase client
 * @param assetId Asset ID
 * @param sellQuantity Quantity to sell
 * @returns FIFO calculation result
 */
export async function calculateFIFOCostBasis(
  supabase: SupabaseClient,
  assetId: string,
  sellQuantity: number,
): Promise<FIFOResult> {
  // Get all lots ordered by creation date (oldest first)
  const lots = await getCostBasisLots(supabase, assetId);

  let remainingToSell = sellQuantity;
  let totalCostBasis = 0;
  const lotsUsed: FIFOResult['lotsUsed'] = [];

  // Process lots in FIFO order
  for (const lot of lots) {
    if (remainingToSell <= 0) {
      break;
    }

    if (lot.remaining_quantity > 0) {
      const quantityToUse = Math.min(
        lot.remaining_quantity,
        remainingToSell,
      );
      const costBasisPerUnit = lot.cost_basis / lot.quantity;
      const costBasisUsed = quantityToUse * costBasisPerUnit;

      totalCostBasis += costBasisUsed;
      remainingToSell -= quantityToUse;

      lotsUsed.push({
        lotId: lot.id,
        quantityUsed: quantityToUse,
        costBasis: costBasisUsed,
      });

      // Update lot remaining quantity
      const newRemainingQuantity =
        lot.remaining_quantity - quantityToUse;

      await supabase
        .from('cost_basis_lots')
        .update({
          remaining_quantity: newRemainingQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lot.id);
    }
  }

  if (remainingToSell > 0) {
    throw new Error(
      `Insufficient cost basis lots. Remaining: ${remainingToSell}`,
    );
  }

  return {
    costBasis: totalCostBasis,
    lotsUsed,
  };
}

/**
 * Calculates Average Cost method cost basis
 * Uses average_buy_price from asset for all sales
 * @param averageBuyPrice Average buy price from asset
 * @param sellQuantity Quantity to sell
 * @returns Cost basis using average cost method
 */
export function calculateAverageCostBasis(
  averageBuyPrice: number,
  sellQuantity: number,
): number {
  return averageBuyPrice * sellQuantity;
}

/**
 * Gets cost basis information for an asset
 * @param supabase Supabase client
 * @param assetId Asset ID
 * @returns Cost basis information
 */
export async function getCostBasisInfo(
  supabase: SupabaseClient,
  assetId: string,
): Promise<{
  totalLots: number;
  totalQuantity: number;
  totalCostBasis: number;
  remainingQuantity: number;
  remainingCostBasis: number;
  lots: CostBasisLot[];
}> {
  const lots = await getCostBasisLots(supabase, assetId);

  const totalQuantity = lots.reduce(
    (sum, lot) => sum + lot.quantity,
    0,
  );
  const totalCostBasis = lots.reduce((sum, lot) => sum + lot.cost_basis, 0);
  const remainingQuantity = lots.reduce(
    (sum, lot) => sum + lot.remaining_quantity,
    0,
  );

  // Calculate remaining cost basis proportionally
  const remainingCostBasis = lots.reduce((sum, lot) => {
    if (lot.quantity > 0) {
      const ratio = lot.remaining_quantity / lot.quantity;
      return sum + lot.cost_basis * ratio;
    }
    return sum;
  }, 0);

  return {
    totalLots: lots.length,
    totalQuantity,
    totalCostBasis,
    remainingQuantity,
    remainingCostBasis,
    lots,
  };
}

