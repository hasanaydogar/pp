import { PortfolioPolicy, PolicyViolation, PolicyViolationType, PolicyViolationSeverity, DEFAULT_POLICY } from '@/lib/types/policy';
import { CashPosition } from '@/lib/types/cash';
import { Sector, PositionCategory } from '@/lib/types/sector';
import { Portfolio, Asset } from '@/lib/types/portfolio';
import { calculateWeight } from '@/lib/utils/position-category';

// ============================================================================
// SUMMARY TYPES
// ============================================================================

export interface PortfolioWithExtras extends Portfolio {
  assets?: Asset[];
  cash_positions?: CashPosition[];
  description?: string | null;
}

export interface PortfolioSummary {
  portfolio: PortfolioWithExtras;
  total_value: number;
  total_cash: number;
  total_assets_value: number;
  cash_percentage: number;
  asset_count: number;
  daily_change: number;
  daily_change_percent: number;
  policy?: PortfolioPolicy;
  policy_violations: PolicyViolation[];
}

export interface AllPortfoliosSummary {
  user_id: string;
  display_currency: string;
  total_value: number;
  total_cash: number;
  total_assets_value: number;
  portfolio_count: number;
  total_asset_count: number;
  daily_change: number;
  daily_change_percent: number;
  by_portfolio: PortfolioSummary[];
  by_asset_type: { type: string; value: number; percentage: number }[];
  by_sector: { sector: Sector | null; name: string; value: number; percentage: number }[];
  all_policy_violations: PolicyViolation[];
}

// ============================================================================
// VIOLATION DETECTION
// ============================================================================

export function detectPolicyViolations(
  portfolioId: string,
  assets: Asset[],
  cashPositions: CashPosition[],
  totalPortfolioValue: number,
  policy?: PortfolioPolicy | null
): PolicyViolation[] {
  const violations: PolicyViolation[] = [];
  const p = policy || DEFAULT_POLICY;

  // Skip if no value
  if (totalPortfolioValue <= 0) return violations;

  // Calculate total cash
  const totalCash = cashPositions.reduce((sum, cp) => sum + cp.amount, 0);
  const cashPercentage = totalCash / totalPortfolioValue;

  // Check cash violations
  if (cashPercentage < p.cash_min_percent) {
    violations.push({
      portfolio_id: portfolioId,
      type: 'UNDER_CASH',
      severity: cashPercentage < p.cash_min_percent * 0.5 ? 'critical' : 'warning',
      current_value: cashPercentage,
      limit_value: p.cash_min_percent,
      recommendation: `Nakit oranını ${formatPercent(p.cash_target_percent)} hedefine yükseltin`,
    });
  } else if (cashPercentage > p.cash_max_percent) {
    violations.push({
      portfolio_id: portfolioId,
      type: 'OVER_CASH',
      severity: 'warning',
      current_value: cashPercentage,
      limit_value: p.cash_max_percent,
      recommendation: `Nakit oranı yüksek, yatırım fırsatlarını değerlendirin`,
    });
  }

  // Check per-stock weight violations
  for (const asset of assets) {
    // Assume asset has a current_value field or calculate from quantity * price
    const assetValue = asset.quantity * asset.average_buy_price; // Simplified
    const weight = calculateWeight(assetValue, totalPortfolioValue);

    if (weight > p.max_weight_per_stock) {
      violations.push({
        portfolio_id: portfolioId,
        type: 'OVER_WEIGHT',
        severity: weight > p.max_weight_per_stock * 1.25 ? 'critical' : 'warning',
        asset_id: asset.id,
        asset_symbol: asset.symbol,
        current_value: weight,
        limit_value: p.max_weight_per_stock,
        recommendation: `${asset.symbol} pozisyonunu ${formatPercent(weight - p.max_weight_per_stock)} azaltın`,
      });
    }
  }

  // TODO: Check sector concentration when sector data is available

  return violations;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatPercent(value: number): string {
  return `%${(value * 100).toFixed(1)}`;
}

export function calculatePortfolioSummary(
  portfolio: PortfolioWithExtras,
  policy?: PortfolioPolicy | null
): PortfolioSummary {
  const assets = portfolio.assets || [];
  const cashPositions = portfolio.cash_positions || [];

  // Calculate asset values (simplified - using average_buy_price)
  const totalAssetsValue = assets.reduce(
    (sum, asset) => sum + asset.quantity * asset.average_buy_price,
    0
  );

  const totalCash = cashPositions.reduce((sum, cp) => sum + cp.amount, 0);
  const totalValue = totalAssetsValue + totalCash;
  const cashPercentage = totalValue > 0 ? totalCash / totalValue : 0;

  const violations = detectPolicyViolations(
    portfolio.id,
    assets,
    cashPositions,
    totalValue,
    policy
  );

  return {
    portfolio,
    total_value: totalValue,
    total_cash: totalCash,
    total_assets_value: totalAssetsValue,
    cash_percentage: cashPercentage,
    asset_count: assets.length,
    daily_change: 0, // TODO: Implement with live prices
    daily_change_percent: 0,
    policy: policy || undefined,
    policy_violations: violations,
  };
}

export function aggregatePortfolioSummaries(
  summaries: PortfolioSummary[],
  userId: string,
  displayCurrency: string
): AllPortfoliosSummary {
  const totalValue = summaries.reduce((sum, s) => sum + s.total_value, 0);
  const totalCash = summaries.reduce((sum, s) => sum + s.total_cash, 0);
  const totalAssetsValue = summaries.reduce((sum, s) => sum + s.total_assets_value, 0);
  const totalAssetCount = summaries.reduce((sum, s) => sum + s.asset_count, 0);
  const allViolations = summaries.flatMap((s) => s.policy_violations);

  // Aggregate by asset type
  const byAssetType: Record<string, number> = {};
  for (const summary of summaries) {
    const portfolioWithAssets = summary.portfolio as PortfolioWithExtras;
    if (portfolioWithAssets.assets) {
      for (const asset of portfolioWithAssets.assets) {
        const value = asset.quantity * asset.average_buy_price;
        byAssetType[asset.type] = (byAssetType[asset.type] || 0) + value;
      }
    }
  }

  const byAssetTypeArray = Object.entries(byAssetType)
    .map(([type, value]) => ({
      type,
      value,
      percentage: totalAssetsValue > 0 ? value / totalAssetsValue : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    user_id: userId,
    display_currency: displayCurrency,
    total_value: totalValue,
    total_cash: totalCash,
    total_assets_value: totalAssetsValue,
    portfolio_count: summaries.length,
    total_asset_count: totalAssetCount,
    daily_change: 0, // TODO: Implement with live prices
    daily_change_percent: 0,
    by_portfolio: summaries,
    by_asset_type: byAssetTypeArray,
    by_sector: [], // TODO: Implement when sector data is available
    all_policy_violations: allViolations,
  };
}
