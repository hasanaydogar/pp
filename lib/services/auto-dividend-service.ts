/**
 * Auto-Dividend Service
 * Automatically records dividends when ex-dividend date passes
 */

import { createClient } from '@/lib/supabase/server';
import { fetchMultipleDividendInfo, DividendInfo } from './dividend-service';
import { createCashTransactionForDividend } from './cash-service';
import { DEFAULT_DIVIDEND_TAX_RATE } from '@/lib/types/dividend';

// ============================================================================
// TYPES
// ============================================================================

export interface AutoRecordResult {
  recorded: number;
  skipped: number;
  errors: string[];
  details: Array<{
    symbol: string;
    amount: number;
    status: 'recorded' | 'skipped' | 'error';
    reason?: string;
  }>;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Check and automatically record dividends for a portfolio
 * Called when user visits the Cash & Dividend page
 */
export async function checkAndRecordDividends(
  portfolioId: string
): Promise<AutoRecordResult> {
  const result: AutoRecordResult = {
    recorded: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  const supabase = await createClient();

  try {
    // Get portfolio with assets
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select(`
        id,
        base_currency,
        assets (
          id,
          symbol,
          quantity,
          currency
        )
      `)
      .eq('id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      result.errors.push('Portfolio not found');
      return result;
    }

    const assets = portfolio.assets || [];
    if (assets.length === 0) {
      return result;
    }

    // Fetch dividend info for all assets
    const assetInfos = assets.map((a: any) => ({
      symbol: a.symbol,
      currency: a.currency || portfolio.base_currency || 'TRY',
      assetId: a.id,
      quantity: Number(a.quantity) || 0,
    }));

    const dividendInfoMap = await fetchMultipleDividendInfo(assetInfos);

    // Check each asset for eligible dividends
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (const [symbol, info] of dividendInfoMap) {
      try {
        // Skip if no ex-dividend date
        if (!info.exDividendDate) {
          result.details.push({
            symbol,
            amount: 0,
            status: 'skipped',
            reason: 'No ex-dividend date',
          });
          result.skipped++;
          continue;
        }

        // Check if ex-dividend date has passed (or is today)
        const exDate = new Date(info.exDividendDate);
        if (exDate > today) {
          result.details.push({
            symbol,
            amount: 0,
            status: 'skipped',
            reason: 'Ex-dividend date in future',
          });
          result.skipped++;
          continue;
        }

        // Check if already recorded
        const isRecorded = await isDividendAlreadyRecorded(
          supabase,
          info.assetId,
          info.exDividendDate
        );

        if (isRecorded) {
          result.details.push({
            symbol,
            amount: 0,
            status: 'skipped',
            reason: 'Already recorded',
          });
          result.skipped++;
          continue;
        }

        // Calculate dividend amount
        const dividendPerShare = info.forwardDividend || info.lastDividendValue || 0;
        if (dividendPerShare <= 0) {
          result.details.push({
            symbol,
            amount: 0,
            status: 'skipped',
            reason: 'No dividend value',
          });
          result.skipped++;
          continue;
        }

        const grossAmount = dividendPerShare * info.quantity;
        const taxAmount = grossAmount * DEFAULT_DIVIDEND_TAX_RATE;
        const netAmount = grossAmount - taxAmount;

        // Record the dividend
        const recordResult = await recordDividend(
          supabase,
          portfolioId,
          info.assetId,
          symbol,
          grossAmount,
          taxAmount,
          netAmount,
          info.exDividendDate,
          info.paymentDate,
          info.currency
        );

        if (recordResult.success) {
          result.details.push({
            symbol,
            amount: netAmount,
            status: 'recorded',
          });
          result.recorded++;
        } else {
          result.details.push({
            symbol,
            amount: 0,
            status: 'error',
            reason: recordResult.error,
          });
          result.errors.push(`${symbol}: ${recordResult.error}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.details.push({
          symbol,
          amount: 0,
          status: 'error',
          reason: errorMsg,
        });
        result.errors.push(`${symbol}: ${errorMsg}`);
      }
    }

    return result;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return result;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a dividend has already been recorded for this asset and date
 */
async function isDividendAlreadyRecorded(
  supabase: any,
  assetId: string,
  exDividendDate: string
): Promise<boolean> {
  // Check by ex_dividend_date (AUTO recorded dividends)
  const { data } = await supabase
    .from('dividends')
    .select('id')
    .eq('asset_id', assetId)
    .eq('ex_dividend_date', exDividendDate)
    .eq('source', 'AUTO')
    .limit(1);

  return data && data.length > 0;
}

/**
 * Record a dividend and create associated cash transaction
 */
async function recordDividend(
  supabase: any,
  portfolioId: string,
  assetId: string,
  symbol: string,
  grossAmount: number,
  taxAmount: number,
  netAmount: number,
  exDividendDate: string,
  paymentDate: string | null,
  currency: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create dividend record
    const { error: dividendError } = await supabase
      .from('dividends')
      .insert({
        asset_id: assetId,
        portfolio_id: portfolioId,
        gross_amount: grossAmount,
        tax_amount: taxAmount,
        net_amount: netAmount,
        currency,
        ex_dividend_date: exDividendDate,
        payment_date: paymentDate || exDividendDate,
        reinvest_strategy: 'CASH',
        source: 'AUTO',
        notes: `Otomatik kayıt: ${symbol}`,
      });

    if (dividendError) {
      return { success: false, error: dividendError.message };
    }

    // Create cash transaction
    const cashResult = await createCashTransactionForDividend(
      portfolioId,
      assetId,
      symbol,
      netAmount,
      paymentDate || exDividendDate,
      currency
    );

    if (!cashResult.success) {
      // Dividend was recorded, but cash transaction failed
      // This is acceptable - user can manually fix
      console.error('Cash transaction failed for dividend:', cashResult.error);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
