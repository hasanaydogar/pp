/**
 * Cash Service
 * Handles cash transactions and balance updates
 */

import { createClient } from '@/lib/supabase/server';
import { CashTransactionType } from '@/lib/types/cash';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateCashTransactionParams {
  portfolioId: string;
  currency: string;
  type: CashTransactionType;
  amount: number;
  date: string;
  notes?: string;
  relatedTransactionId?: string;
  relatedAssetId?: string;
  relatedSymbol?: string;
}

export interface CashFlowDataPoint {
  date: string;
  balance: number;
  change: number;
  deposits: number;
  withdrawals: number;
  dividends: number;
  purchases: number;
  sales: number;
  isForecast?: boolean; // True if this is a projected future data point
}

export interface CashFlowSummary {
  startBalance: number;
  endBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalDividends: number;
  totalPurchases: number;
  totalSales: number;
  netChange: number;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Create a cash transaction for an asset buy/sell operation
 */
export async function createCashTransactionForAsset(
  portfolioId: string,
  assetSymbol: string,
  transactionId: string,
  assetId: string,
  type: 'BUY' | 'SELL',
  amount: number,
  date: string,
  currency: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get or create cash position
    let { data: cashPosition } = await supabase
      .from('cash_positions')
      .select('id, amount')
      .eq('portfolio_id', portfolioId)
      .eq('currency', currency)
      .single();

    if (!cashPosition) {
      // Create cash position with 0 balance
      const { data: newPosition, error: createError } = await supabase
        .from('cash_positions')
        .insert({
          portfolio_id: portfolioId,
          currency,
          amount: 0,
        })
        .select()
        .single();

      if (createError || !newPosition) {
        return { success: false, error: createError?.message || 'Failed to create cash position' };
      }
      cashPosition = newPosition;
    }

    // Determine transaction type and sign
    const transactionType = type === 'BUY' 
      ? CashTransactionType.BUY_ASSET 
      : CashTransactionType.SELL_ASSET;
    
    // BUY = cash outflow (negative), SELL = cash inflow (positive)
    const signedAmount = type === 'BUY' ? -Math.abs(amount) : Math.abs(amount);

    // Create cash transaction
    const { error: txError } = await supabase
      .from('cash_transactions')
      .insert({
        cash_position_id: cashPosition!.id,
        type: transactionType,
        amount: signedAmount,
        date: date,
        notes: `${type} ${assetSymbol}`,
        related_transaction_id: transactionId,
        related_asset_id: assetId,
        related_symbol: assetSymbol,
      });

    if (txError) {
      return { success: false, error: txError.message };
    }

    // Update cash position balance
    const newBalance = Number(cashPosition!.amount) + signedAmount;
    const { error: updateError } = await supabase
      .from('cash_positions')
      .update({ amount: newBalance, updated_at: new Date().toISOString() })
      .eq('id', cashPosition!.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create a cash transaction for dividend payment
 */
export async function createCashTransactionForDividend(
  portfolioId: string,
  assetId: string,
  symbol: string,
  netAmount: number,
  date: string,
  currency: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get or create cash position
    let { data: cashPosition } = await supabase
      .from('cash_positions')
      .select('id, amount')
      .eq('portfolio_id', portfolioId)
      .eq('currency', currency)
      .single();

    if (!cashPosition) {
      const { data: newPosition, error: createError } = await supabase
        .from('cash_positions')
        .insert({
          portfolio_id: portfolioId,
          currency,
          amount: 0,
        })
        .select()
        .single();

      if (createError || !newPosition) {
        return { success: false, error: createError?.message || 'Failed to create cash position' };
      }
      cashPosition = newPosition;
    }

    // Create cash transaction (dividend is positive)
    const { error: txError } = await supabase
      .from('cash_transactions')
      .insert({
        cash_position_id: cashPosition!.id,
        type: CashTransactionType.DIVIDEND,
        amount: netAmount,
        date: date,
        notes: `Temettü: ${symbol}`,
        related_asset_id: assetId,
        related_symbol: symbol,
      });

    if (txError) {
      return { success: false, error: txError.message };
    }

    // Update cash position balance
    const newBalance = Number(cashPosition!.amount) + netAmount;
    const { error: updateError } = await supabase
      .from('cash_positions')
      .update({ amount: newBalance, updated_at: new Date().toISOString() })
      .eq('id', cashPosition!.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get cash flow data for a portfolio
 */
export async function getCashFlowData(
  portfolioId: string,
  startDate: string,
  endDate: string
): Promise<{ data: CashFlowDataPoint[]; summary: CashFlowSummary } | null> {
  const supabase = await createClient();

  try {
    // Get cash positions for portfolio
    const { data: positions, error: posError } = await supabase
      .from('cash_positions')
      .select('id')
      .eq('portfolio_id', portfolioId);

    if (posError || !positions || positions.length === 0) {
      return null;
    }

    const positionIds = positions.map(p => p.id);

    // Get transactions in date range
    const { data: transactions, error: txError } = await supabase
      .from('cash_transactions')
      .select('*')
      .in('cash_position_id', positionIds)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (txError) {
      return null;
    }

    // Get starting balance (sum of transactions before start date)
    const { data: priorTx } = await supabase
      .from('cash_transactions')
      .select('amount')
      .in('cash_position_id', positionIds)
      .lt('date', startDate);

    const startBalance = (priorTx || []).reduce((sum, t) => sum + Number(t.amount), 0);

    // Group transactions by date and calculate daily data
    const dailyData = new Map<string, CashFlowDataPoint>();
    let runningBalance = startBalance;

    // Initialize summary
    const summary: CashFlowSummary = {
      startBalance,
      endBalance: startBalance,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalDividends: 0,
      totalPurchases: 0,
      totalSales: 0,
      netChange: 0,
    };

    for (const tx of transactions || []) {
      const date = tx.date;
      const amount = Number(tx.amount);
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          balance: runningBalance,
          change: 0,
          deposits: 0,
          withdrawals: 0,
          dividends: 0,
          purchases: 0,
          sales: 0,
        });
      }

      const day = dailyData.get(date)!;
      day.change += amount;

      // Categorize by type
      switch (tx.type) {
        case 'DEPOSIT':
          day.deposits += amount;
          summary.totalDeposits += amount;
          break;
        case 'WITHDRAW':
          day.withdrawals += Math.abs(amount);
          summary.totalWithdrawals += Math.abs(amount);
          break;
        case 'DIVIDEND':
          day.dividends += amount;
          summary.totalDividends += amount;
          break;
        case 'BUY_ASSET':
        case 'ASSET_PURCHASE':
          day.purchases += Math.abs(amount);
          summary.totalPurchases += Math.abs(amount);
          break;
        case 'SELL_ASSET':
        case 'ASSET_SALE':
          day.sales += amount;
          summary.totalSales += amount;
          break;
      }

      runningBalance += amount;
      day.balance = runningBalance;
    }

    summary.endBalance = runningBalance;
    summary.netChange = runningBalance - startBalance;

    // Convert to array and fill in missing dates
    const result = Array.from(dailyData.values());

    return { data: result, summary };
  } catch (error) {
    console.error('Error fetching cash flow:', error);
    return null;
  }
}

/**
 * Get current cash balance for a portfolio
 */
export async function getCashBalance(
  portfolioId: string,
  currency?: string
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from('cash_positions')
    .select('amount')
    .eq('portfolio_id', portfolioId);

  if (currency) {
    query = query.eq('currency', currency);
  }

  const { data } = await query;
  return (data || []).reduce((sum, p) => sum + Number(p.amount), 0);
}
