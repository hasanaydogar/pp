/**
 * Benchmark comparison utilities
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Benchmark comparison result
 */
export interface BenchmarkComparison {
  portfolioValue: number;
  portfolioPerformance: number; // Percentage gain/loss
  benchmarkSymbol: string | null;
  benchmarkPerformance: number | null; // Percentage gain/loss (placeholder for future)
  relativePerformance: number | null; // Portfolio vs Benchmark
  note?: string;
}

/**
 * Calculates portfolio total value
 * @param supabase Supabase client
 * @param portfolioId Portfolio ID
 * @returns Total portfolio value
 */
export async function calculatePortfolioValue(
  supabase: SupabaseClient,
  portfolioId: string,
): Promise<number> {
  // Get all assets in portfolio
  const { data: assets, error } = await supabase
    .from('assets')
    .select('quantity, average_buy_price')
    .eq('portfolio_id', portfolioId);

  if (error || !assets) {
    throw new Error(`Failed to get assets: ${error?.message}`);
  }

  // Calculate total value (quantity * average_buy_price)
  const totalValue = assets.reduce((sum, asset) => {
    return sum + Number(asset.quantity) * Number(asset.average_buy_price);
  }, 0);

  return totalValue;
}

/**
 * Calculates portfolio performance (gain/loss percentage)
 * This is a simplified calculation - in production, you'd compare against initial investment
 * @param supabase Supabase client
 * @param portfolioId Portfolio ID
 * @returns Performance percentage
 */
export async function calculatePortfolioPerformance(
  supabase: SupabaseClient,
  portfolioId: string,
): Promise<number> {
  // Get all transactions to calculate total invested
  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('id')
    .eq('id', portfolioId)
    .single();

  if (!portfolios) {
    throw new Error('Portfolio not found');
  }

  // Get all assets
  const { data: assets } = await supabase
    .from('assets')
    .select('id')
    .eq('portfolio_id', portfolioId);

  if (!assets || assets.length === 0) {
    return 0;
  }

  // Get all BUY transactions
  let totalInvested = 0;
  for (const asset of assets) {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, price')
      .eq('asset_id', asset.id)
      .eq('type', 'BUY');

    if (transactions) {
      totalInvested += transactions.reduce(
        (sum, t) => sum + Number(t.amount) * Number(t.price),
        0,
      );
    }
  }

  // Get current portfolio value
  const currentValue = await calculatePortfolioValue(supabase, portfolioId);

  // Calculate performance
  if (totalInvested === 0) {
    return 0;
  }

  const performance = ((currentValue - totalInvested) / totalInvested) * 100;
  return performance;
}

/**
 * Compares portfolio performance vs benchmark
 * @param supabase Supabase client
 * @param portfolioId Portfolio ID
 * @returns Benchmark comparison result
 */
export async function compareWithBenchmark(
  supabase: SupabaseClient,
  portfolioId: string,
): Promise<BenchmarkComparison> {
  // Get portfolio with benchmark symbol
  const { data: portfolio, error } = await supabase
    .from('portfolios')
    .select('benchmark_symbol')
    .eq('id', portfolioId)
    .single();

  if (error || !portfolio) {
    throw new Error(`Failed to get portfolio: ${error?.message}`);
  }

  // Calculate portfolio value and performance
  const portfolioValue = await calculatePortfolioValue(supabase, portfolioId);
  const portfolioPerformance = await calculatePortfolioPerformance(
    supabase,
    portfolioId,
  );

  // Benchmark performance (placeholder - would fetch from external API in production)
  let benchmarkPerformance: number | null = null;
  let relativePerformance: number | null = null;

  if (portfolio.benchmark_symbol) {
    // TODO: Fetch benchmark performance from external API
    // For now, return placeholder
    benchmarkPerformance = null;
    relativePerformance = null;
  }

  return {
    portfolioValue,
    portfolioPerformance,
    benchmarkSymbol: portfolio.benchmark_symbol,
    benchmarkPerformance,
    relativePerformance,
    note: portfolio.benchmark_symbol
      ? 'Benchmark data fetching not yet implemented. This is a placeholder.'
      : undefined,
  };
}

