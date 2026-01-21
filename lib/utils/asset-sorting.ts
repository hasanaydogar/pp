import { Asset } from '@/lib/types/portfolio';
import { AssetWithMetrics, SortColumn, SortDirection } from '@/lib/types/asset-metrics';
import { PositionCategory } from '@/lib/types/sector';
import { PortfolioPolicy, DEFAULT_POLICY } from '@/lib/types/policy';
import { LivePrice } from '@/lib/types/price';

// ============================================================================
// SORTING
// ============================================================================

/**
 * Sorts assets by the specified column and direction
 */
export function sortAssets(
  assets: AssetWithMetrics[], 
  column: SortColumn, 
  direction: SortDirection
): AssetWithMetrics[] {
  return [...assets].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;
    
    switch (column) {
      case 'symbol':
        aVal = a.symbol.toUpperCase();
        bVal = b.symbol.toUpperCase();
        break;
      case 'category':
        // Sort order: CORE > SATELLITE > NEW
        const categoryOrder = { CORE: 0, SATELLITE: 1, NEW: 2 };
        aVal = categoryOrder[a.category] ?? 3;
        bVal = categoryOrder[b.category] ?? 3;
        break;
      case 'weight':
        aVal = a.weight;
        bVal = b.weight;
        break;
      case 'currentPrice':
        aVal = a.currentPrice;
        bVal = b.currentPrice;
        break;
      case 'currentValue':
        aVal = a.currentValue;
        bVal = b.currentValue;
        break;
      case 'costBasis':
        aVal = a.costBasis;
        bVal = b.costBasis;
        break;
      case 'gainLoss':
        aVal = a.gainLoss;
        bVal = b.gainLoss;
        break;
      case 'gainLossPercent':
        aVal = a.gainLossPercent;
        bVal = b.gainLossPercent;
        break;
      case 'dailyChangePercent':
        aVal = a.dailyChangePercent;
        bVal = b.dailyChangePercent;
        break;
      case 'positionDailyChange':
        aVal = a.positionDailyChange;
        bVal = b.positionDailyChange;
        break;
      default:
        aVal = 0;
        bVal = 0;
    }
    
    const modifier = direction === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal as string) * modifier;
    }
    return ((aVal as number) - (bVal as number)) * modifier;
  });
}

// ============================================================================
// METRICS CALCULATION
// ============================================================================

/**
 * Calculates metrics for each asset including weight, category, overweight status, and daily changes
 * 
 * @param assets - Array of assets
 * @param totalPortfolioValue - Total portfolio value for weight calculation (pass 0 to auto-calculate)
 * @param policy - Portfolio policy for category thresholds
 * @param livePrices - Optional map of symbol -> LivePrice (full price data with change info)
 */
export function calculateAssetMetrics(
  assets: Asset[],
  totalPortfolioValue: number,
  policy?: PortfolioPolicy | null,
  livePrices?: Record<string, number | LivePrice>
): AssetWithMetrics[] {
  const p = policy || DEFAULT_POLICY;
  
  // First pass: calculate current values with live prices
  const assetsWithValues = assets.map(asset => {
    const costBasis = Number(asset.quantity) * Number(asset.average_buy_price);
    const priceData = livePrices?.[asset.symbol];
    
    // Handle both number (old format) and LivePrice (new format)
    let currentPrice: number;
    let dailyChangePercent = 0;
    let dailyChangeAmount = 0;
    let previousClose: number | undefined;
    
    if (typeof priceData === 'object' && priceData !== null) {
      // Full LivePrice object
      currentPrice = priceData.price;
      dailyChangePercent = priceData.changePercent || 0;
      dailyChangeAmount = priceData.change || 0;
      previousClose = priceData.previousClose;
    } else if (typeof priceData === 'number') {
      // Just price number (backward compatible)
      currentPrice = priceData;
    } else {
      // No price data, use cost basis
      currentPrice = Number(asset.average_buy_price);
    }
    
    const currentValue = Number(asset.quantity) * currentPrice;
    const positionDailyChange = Number(asset.quantity) * dailyChangeAmount;
    
    return {
      asset,
      costBasis,
      currentPrice,
      currentValue,
      hasLivePrice: !!priceData,
      dailyChangePercent,
      dailyChangeAmount,
      positionDailyChange,
      previousClose,
    };
  });
  
  // Calculate total if not provided or is 0
  const calculatedTotal = totalPortfolioValue > 0 
    ? totalPortfolioValue 
    : assetsWithValues.reduce((sum, a) => sum + a.currentValue, 0);
  
  // Second pass: calculate weights and categories
  return assetsWithValues.map(({
    asset,
    costBasis,
    currentPrice,
    currentValue,
    dailyChangePercent,
    dailyChangeAmount,
    positionDailyChange,
    previousClose,
  }) => {
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
    const weight = calculatedTotal > 0 ? currentValue / calculatedTotal : 0;

    // Determine category based on weight thresholds
    const category = determineCategory(weight, p);
    const isOverWeight = weight > p.max_weight_per_stock;

    return {
      ...asset,
      currentPrice,
      currentValue,
      costBasis,
      gainLoss,
      gainLossPercent,
      weight,
      category,
      isOverWeight,
      dailyChangePercent,
      dailyChangeAmount,
      positionDailyChange,
      previousClose,
    };
  });
}

/**
 * Determines position category based on weight and policy thresholds
 */
function determineCategory(
  weight: number, 
  policy: PortfolioPolicy | typeof DEFAULT_POLICY
): PositionCategory {
  if (weight >= policy.core_min_weight) {
    return PositionCategory.CORE;
  }
  if (weight >= policy.satellite_min_weight) {
    return PositionCategory.SATELLITE;
  }
  return PositionCategory.NEW;
}

// ============================================================================
// DISTRIBUTION CALCULATION
// ============================================================================

export interface AssetDistribution {
  symbol: string;
  value: number;
  weight: number;
  color: string;
}

const DISTRIBUTION_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

/**
 * Calculates distribution data for the top N assets plus "Other"
 */
export function calculateAssetDistribution(
  assets: AssetWithMetrics[],
  maxItems: number = 6
): AssetDistribution[] {
  if (assets.length === 0) return [];
  
  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  if (totalValue === 0) return [];
  
  // Sort by value descending
  const sorted = [...assets].sort((a, b) => b.currentValue - a.currentValue);
  
  const result: AssetDistribution[] = [];
  let otherValue = 0;
  
  sorted.forEach((asset, index) => {
    if (index < maxItems) {
      result.push({
        symbol: asset.symbol,
        value: asset.currentValue,
        weight: asset.currentValue / totalValue,
        color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
      });
    } else {
      otherValue += asset.currentValue;
    }
  });
  
  // Add "Other" category if needed
  if (otherValue > 0) {
    result.push({
      symbol: 'Diğer',
      value: otherValue,
      weight: otherValue / totalValue,
      color: '#6b7280', // gray-500
    });
  }
  
  return result;
}

// ============================================================================
// SUMMARY CALCULATION
// ============================================================================

/**
 * Calculates summary statistics for portfolio assets
 */
export function calculatePortfolioAssetsSummary(
  assets: AssetWithMetrics[],
  cashAmount: number = 0,
  cashTargetPercent: number = 0.07
): {
  totalValue: number;
  totalAssetsValue: number;
  cashPercent: number;
  assetCount: number;
} {
  const totalAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalValue = totalAssetsValue + cashAmount;
  const cashPercent = totalValue > 0 ? cashAmount / totalValue : 0;
  
  return {
    totalValue,
    totalAssetsValue,
    cashPercent,
    assetCount: assets.length,
  };
}
