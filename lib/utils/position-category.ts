import { PositionCategory } from '@/lib/types/sector';
import { PortfolioPolicy, DEFAULT_POLICY } from '@/lib/types/policy';

/**
 * Calculate position category automatically based on weight and policy
 */
export function calculateAutoCategory(
  weight: number,
  policy?: PortfolioPolicy | null
): PositionCategory {
  const p = policy || DEFAULT_POLICY;
  
  if (weight >= p.core_min_weight) {
    return PositionCategory.CORE;
  }
  if (weight >= p.satellite_min_weight) {
    return PositionCategory.SATELLITE;
  }
  return PositionCategory.NEW;
}

/**
 * Get effective category (manual override or auto-calculated)
 */
export function getEffectiveCategory(
  manualCategory: PositionCategory | null | undefined,
  weight: number,
  policy?: PortfolioPolicy | null
): PositionCategory {
  if (manualCategory) {
    return manualCategory;
  }
  return calculateAutoCategory(weight, policy);
}

/**
 * Check if position weight is within category range
 */
export function isWithinCategoryRange(
  category: PositionCategory,
  weight: number,
  policy?: PortfolioPolicy | null
): boolean {
  const p = policy || DEFAULT_POLICY;
  
  switch (category) {
    case PositionCategory.CORE:
      return weight >= p.core_min_weight && weight <= p.core_max_weight;
    case PositionCategory.SATELLITE:
      return weight >= p.satellite_min_weight && weight <= p.satellite_max_weight;
    case PositionCategory.NEW:
      return weight >= p.new_position_min_weight && weight <= p.new_position_max_weight;
  }
}

/**
 * Get target weight range for a category
 */
export function getCategoryTargetRange(
  category: PositionCategory,
  policy?: PortfolioPolicy | null
): { min: number; max: number } {
  const p = policy || DEFAULT_POLICY;
  
  switch (category) {
    case PositionCategory.CORE:
      return { min: p.core_min_weight, max: p.core_max_weight };
    case PositionCategory.SATELLITE:
      return { min: p.satellite_min_weight, max: p.satellite_max_weight };
    case PositionCategory.NEW:
      return { min: p.new_position_min_weight, max: p.new_position_max_weight };
  }
}

/**
 * Calculate weight percentage from value
 */
export function calculateWeight(
  assetValue: number,
  totalPortfolioValue: number
): number {
  if (totalPortfolioValue <= 0) return 0;
  return assetValue / totalPortfolioValue;
}

/**
 * Format weight as percentage string
 */
export function formatWeight(weight: number): string {
  return `${(weight * 100).toFixed(2)}%`;
}
