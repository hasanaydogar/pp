/**
 * Analytics calculation utilities
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  calculatePortfolioValue,
  calculatePortfolioPerformance,
} from './benchmark';

/**
 * Portfolio analytics result
 */
export interface PortfolioAnalytics {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  performance: number; // Percentage
  assetCount: number;
  transactionCount: number;
  assetAllocation: Array<{
    assetId: string;
    symbol: string;
    type: string;
    value: number;
    percentage: number;
  }>;
}

/**
 * Asset performance result
 */
export interface AssetPerformance {
  assetId: string;
  symbol: string;
  currentValue: number;
  totalInvested: number;
  realizedGainLoss: number;
  unrealizedGainLoss: number;
  totalGainLoss: number;
  performance: number; // Percentage
  averageBuyPrice: number;
  currentPrice: number; // Using average_buy_price as proxy
  quantity: number;
}

/**
 * Transaction analytics result
 */
export interface TransactionAnalytics {
  totalTransactions: number;
  buyTransactions: number;
  sellTransactions: number;
  totalBuyValue: number;
  totalSellValue: number;
  totalRealizedGainLoss: number;
  averageTransactionSize: number;
  transactionPatterns: {
    byMonth: Array<{
      month: string;
      buyCount: number;
      sellCount: number;
      buyValue: number;
      sellValue: number;
    }>;
  };
}

/**
 * Calculates portfolio analytics
 * @param supabase Supabase client
 * @param portfolioId Portfolio ID
 * @returns Portfolio analytics
 */
export async function calculatePortfolioAnalytics(
  supabase: SupabaseClient,
  portfolioId: string,
): Promise<PortfolioAnalytics> {
  // Get portfolio value and performance
  const totalValue = await calculatePortfolioValue(supabase, portfolioId);
  const performance = await calculatePortfolioPerformance(
    supabase,
    portfolioId,
  );

  // Get all assets
  const { data: assets } = await supabase
    .from('assets')
    .select('id, symbol, type, quantity, average_buy_price')
    .eq('portfolio_id', portfolioId);

  if (!assets) {
    throw new Error('Failed to get assets');
  }

  // Calculate total invested from BUY transactions
  let totalInvested = 0;
  let transactionCount = 0;

  for (const asset of assets) {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, price, type')
      .eq('asset_id', asset.id);

    if (transactions) {
      transactionCount += transactions.length;
      totalInvested += transactions
        .filter((t) => t.type === 'BUY')
        .reduce(
          (sum, t) => sum + Number(t.amount) * Number(t.price),
          0,
        );
    }
  }

  // Calculate asset allocation
  const assetAllocation = assets.map((asset) => {
    const assetValue =
      Number(asset.quantity) * Number(asset.average_buy_price);
    return {
      assetId: asset.id,
      symbol: asset.symbol,
      type: asset.type,
      value: assetValue,
      percentage: totalValue > 0 ? (assetValue / totalValue) * 100 : 0,
    };
  });

  const totalGainLoss = totalValue - totalInvested;

  return {
    totalValue,
    totalInvested,
    totalGainLoss,
    performance,
    assetCount: assets.length,
    transactionCount,
    assetAllocation,
  };
}

/**
 * Calculates asset performance
 * @param supabase Supabase client
 * @param assetId Asset ID
 * @returns Asset performance
 */
export async function calculateAssetPerformance(
  supabase: SupabaseClient,
  assetId: string,
): Promise<AssetPerformance> {
  // Get asset
  const { data: asset, error } = await supabase
    .from('assets')
    .select('id, symbol, quantity, average_buy_price')
    .eq('id', assetId)
    .single();

  if (error || !asset) {
    throw new Error(`Failed to get asset: ${error?.message}`);
  }

  // Get all transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount, price, realized_gain_loss')
    .eq('asset_id', assetId);

  if (!transactions) {
    throw new Error('Failed to get transactions');
  }

  // Calculate total invested from BUY transactions
  const totalInvested = transactions
    .filter((t) => t.type === 'BUY')
    .reduce(
      (sum, t) => sum + Number(t.amount) * Number(t.price),
      0,
    );

  // Calculate realized gain/loss from SELL transactions
  const realizedGainLoss = transactions
    .filter((t) => t.type === 'SELL')
    .reduce(
      (sum, t) => sum + (Number(t.realized_gain_loss) || 0),
      0,
    );

  // Calculate current value
  const currentValue =
    Number(asset.quantity) * Number(asset.average_buy_price);

  // Calculate unrealized gain/loss
  const unrealizedGainLoss = currentValue - totalInvested + realizedGainLoss;

  // Total gain/loss
  const totalGainLoss = realizedGainLoss + unrealizedGainLoss;

  // Performance percentage
  const performance =
    totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return {
    assetId: asset.id,
    symbol: asset.symbol,
    currentValue,
    totalInvested,
    realizedGainLoss,
    unrealizedGainLoss,
    totalGainLoss,
    performance,
    averageBuyPrice: Number(asset.average_buy_price),
    currentPrice: Number(asset.average_buy_price), // Using average as proxy
    quantity: Number(asset.quantity),
  };
}

/**
 * Calculates transaction analytics
 * @param supabase Supabase client
 * @param portfolioId Portfolio ID
 * @returns Transaction analytics
 */
export async function calculateTransactionAnalytics(
  supabase: SupabaseClient,
  portfolioId: string,
): Promise<TransactionAnalytics> {
  // Get all assets in portfolio
  const { data: assets } = await supabase
    .from('assets')
    .select('id')
    .eq('portfolio_id', portfolioId);

  if (!assets) {
    throw new Error('Failed to get assets');
  }

  // Get all transactions
  const allTransactions: Array<{
    type: string;
    amount: number;
    price: number;
    date: string;
    realized_gain_loss: number | null;
  }> = [];

  for (const asset of assets) {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('type, amount, price, date, realized_gain_loss')
      .eq('asset_id', asset.id);

    if (transactions) {
      allTransactions.push(...transactions);
    }
  }

  // Calculate statistics
  const buyTransactions = allTransactions.filter((t) => t.type === 'BUY');
  const sellTransactions = allTransactions.filter((t) => t.type === 'SELL');

  const totalBuyValue = buyTransactions.reduce(
    (sum, t) => sum + Number(t.amount) * Number(t.price),
    0,
  );

  const totalSellValue = sellTransactions.reduce(
    (sum, t) => sum + Number(t.amount) * Number(t.price),
    0,
  );

  const totalRealizedGainLoss = sellTransactions.reduce(
    (sum, t) => sum + (Number(t.realized_gain_loss) || 0),
    0,
  );

  const averageTransactionSize =
    allTransactions.length > 0
      ? (totalBuyValue + totalSellValue) / allTransactions.length
      : 0;

  // Group by month
  const byMonthMap = new Map<string, {
    month: string;
    buyCount: number;
    sellCount: number;
    buyValue: number;
    sellValue: number;
  }>();

  allTransactions.forEach((t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!byMonthMap.has(monthKey)) {
      byMonthMap.set(monthKey, {
        month: monthKey,
        buyCount: 0,
        sellCount: 0,
        buyValue: 0,
        sellValue: 0,
      });
    }

    const monthData = byMonthMap.get(monthKey)!;
    const transactionValue = Number(t.amount) * Number(t.price);

    if (t.type === 'BUY') {
      monthData.buyCount++;
      monthData.buyValue += transactionValue;
    } else {
      monthData.sellCount++;
      monthData.sellValue += transactionValue;
    }
  });

  const byMonth = Array.from(byMonthMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  return {
    totalTransactions: allTransactions.length,
    buyTransactions: buyTransactions.length,
    sellTransactions: sellTransactions.length,
    totalBuyValue,
    totalSellValue,
    totalRealizedGainLoss,
    averageTransactionSize,
    transactionPatterns: {
      byMonth,
    },
  };
}

