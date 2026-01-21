import {
  calculateAutoCategory,
  getEffectiveCategory,
  isWithinCategoryRange,
  getCategoryTargetRange,
  calculateWeight,
  formatWeight,
} from '../position-category';
import { PositionCategory } from '@/lib/types/sector';
import { PortfolioPolicy, DEFAULT_POLICY } from '@/lib/types/policy';

describe('position-category utility functions', () => {
  // Custom policy for testing
  const customPolicy: PortfolioPolicy = {
    id: 'policy-1',
    portfolio_id: 'portfolio-1',
    max_weight_per_stock: 0.15,
    core_min_weight: 0.10,
    core_max_weight: 0.15,
    satellite_min_weight: 0.02,
    satellite_max_weight: 0.08,
    new_position_min_weight: 0.005,
    new_position_max_weight: 0.02,
    max_weight_per_sector: 0.30,
    cash_min_percent: 0.05,
    cash_max_percent: 0.15,
    cash_target_percent: 0.10,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: null,
  };

  describe('calculateAutoCategory', () => {
    it('should return CORE when weight is above core_min_weight', () => {
      expect(calculateAutoCategory(0.12)).toBe(PositionCategory.CORE);
      expect(calculateAutoCategory(0.08)).toBe(PositionCategory.CORE);
      expect(calculateAutoCategory(0.15)).toBe(PositionCategory.CORE);
    });

    it('should return SATELLITE when weight is between satellite and core thresholds', () => {
      expect(calculateAutoCategory(0.05)).toBe(PositionCategory.SATELLITE);
      expect(calculateAutoCategory(0.03)).toBe(PositionCategory.SATELLITE);
      expect(calculateAutoCategory(0.01)).toBe(PositionCategory.SATELLITE);
    });

    it('should return NEW when weight is below satellite_min_weight', () => {
      expect(calculateAutoCategory(0.005)).toBe(PositionCategory.NEW);
      expect(calculateAutoCategory(0.001)).toBe(PositionCategory.NEW);
      expect(calculateAutoCategory(0)).toBe(PositionCategory.NEW);
    });

    it('should use custom policy when provided', () => {
      // With custom policy, core_min_weight is 0.10
      expect(calculateAutoCategory(0.09, customPolicy)).toBe(PositionCategory.SATELLITE);
      expect(calculateAutoCategory(0.10, customPolicy)).toBe(PositionCategory.CORE);
    });

    it('should use default policy when null is provided', () => {
      expect(calculateAutoCategory(0.08, null)).toBe(PositionCategory.CORE);
      expect(calculateAutoCategory(0.01, null)).toBe(PositionCategory.SATELLITE);
    });

    it('should handle edge cases at exact thresholds', () => {
      // At exactly core_min_weight (0.08 default)
      expect(calculateAutoCategory(0.08)).toBe(PositionCategory.CORE);
      // At exactly satellite_min_weight (0.01 default)
      expect(calculateAutoCategory(0.01)).toBe(PositionCategory.SATELLITE);
      // Just below satellite_min_weight
      expect(calculateAutoCategory(0.009)).toBe(PositionCategory.NEW);
    });
  });

  describe('getEffectiveCategory', () => {
    it('should return manual category when provided', () => {
      expect(getEffectiveCategory(PositionCategory.CORE, 0.01)).toBe(PositionCategory.CORE);
      expect(getEffectiveCategory(PositionCategory.SATELLITE, 0.12)).toBe(PositionCategory.SATELLITE);
      expect(getEffectiveCategory(PositionCategory.NEW, 0.15)).toBe(PositionCategory.NEW);
    });

    it('should fall back to auto category when manual is null', () => {
      expect(getEffectiveCategory(null, 0.12)).toBe(PositionCategory.CORE);
      expect(getEffectiveCategory(null, 0.05)).toBe(PositionCategory.SATELLITE);
      expect(getEffectiveCategory(null, 0.005)).toBe(PositionCategory.NEW);
    });

    it('should fall back to auto category when manual is undefined', () => {
      expect(getEffectiveCategory(undefined, 0.12)).toBe(PositionCategory.CORE);
    });

    it('should use custom policy for auto calculation', () => {
      expect(getEffectiveCategory(null, 0.09, customPolicy)).toBe(PositionCategory.SATELLITE);
      expect(getEffectiveCategory(null, 0.10, customPolicy)).toBe(PositionCategory.CORE);
    });
  });

  describe('isWithinCategoryRange', () => {
    it('should return true when weight is within CORE range', () => {
      expect(isWithinCategoryRange(PositionCategory.CORE, 0.08)).toBe(true);
      expect(isWithinCategoryRange(PositionCategory.CORE, 0.10)).toBe(true);
      expect(isWithinCategoryRange(PositionCategory.CORE, 0.12)).toBe(true);
    });

    it('should return false when weight is outside CORE range', () => {
      expect(isWithinCategoryRange(PositionCategory.CORE, 0.07)).toBe(false);
      expect(isWithinCategoryRange(PositionCategory.CORE, 0.13)).toBe(false);
    });

    it('should return true when weight is within SATELLITE range', () => {
      expect(isWithinCategoryRange(PositionCategory.SATELLITE, 0.01)).toBe(true);
      expect(isWithinCategoryRange(PositionCategory.SATELLITE, 0.03)).toBe(true);
      expect(isWithinCategoryRange(PositionCategory.SATELLITE, 0.05)).toBe(true);
    });

    it('should return false when weight is outside SATELLITE range', () => {
      expect(isWithinCategoryRange(PositionCategory.SATELLITE, 0.009)).toBe(false);
      expect(isWithinCategoryRange(PositionCategory.SATELLITE, 0.06)).toBe(false);
    });

    it('should return true when weight is within NEW range', () => {
      expect(isWithinCategoryRange(PositionCategory.NEW, 0.005)).toBe(true);
      expect(isWithinCategoryRange(PositionCategory.NEW, 0.01)).toBe(true);
      expect(isWithinCategoryRange(PositionCategory.NEW, 0.02)).toBe(true);
    });

    it('should return false when weight is outside NEW range', () => {
      expect(isWithinCategoryRange(PositionCategory.NEW, 0.004)).toBe(false);
      expect(isWithinCategoryRange(PositionCategory.NEW, 0.025)).toBe(false);
    });

    it('should use custom policy when provided', () => {
      // Custom policy has core range 0.10 - 0.15
      expect(isWithinCategoryRange(PositionCategory.CORE, 0.12, customPolicy)).toBe(true);
      expect(isWithinCategoryRange(PositionCategory.CORE, 0.09, customPolicy)).toBe(false);
    });
  });

  describe('getCategoryTargetRange', () => {
    it('should return correct range for CORE', () => {
      const range = getCategoryTargetRange(PositionCategory.CORE);
      expect(range.min).toBe(DEFAULT_POLICY.core_min_weight);
      expect(range.max).toBe(DEFAULT_POLICY.core_max_weight);
    });

    it('should return correct range for SATELLITE', () => {
      const range = getCategoryTargetRange(PositionCategory.SATELLITE);
      expect(range.min).toBe(DEFAULT_POLICY.satellite_min_weight);
      expect(range.max).toBe(DEFAULT_POLICY.satellite_max_weight);
    });

    it('should return correct range for NEW', () => {
      const range = getCategoryTargetRange(PositionCategory.NEW);
      expect(range.min).toBe(DEFAULT_POLICY.new_position_min_weight);
      expect(range.max).toBe(DEFAULT_POLICY.new_position_max_weight);
    });

    it('should use custom policy when provided', () => {
      const range = getCategoryTargetRange(PositionCategory.CORE, customPolicy);
      expect(range.min).toBe(0.10);
      expect(range.max).toBe(0.15);
    });
  });

  describe('calculateWeight', () => {
    it('should calculate weight correctly', () => {
      expect(calculateWeight(1000, 10000)).toBe(0.1);
      expect(calculateWeight(2500, 10000)).toBe(0.25);
      expect(calculateWeight(5000, 10000)).toBe(0.5);
    });

    it('should return 0 when total portfolio value is 0', () => {
      expect(calculateWeight(1000, 0)).toBe(0);
    });

    it('should return 0 when total portfolio value is negative', () => {
      expect(calculateWeight(1000, -100)).toBe(0);
    });

    it('should handle small values correctly', () => {
      expect(calculateWeight(50, 10000)).toBe(0.005);
    });

    it('should handle 100% weight', () => {
      expect(calculateWeight(10000, 10000)).toBe(1);
    });
  });

  describe('formatWeight', () => {
    it('should format weight as percentage string', () => {
      expect(formatWeight(0.1)).toBe('10.00%');
      expect(formatWeight(0.25)).toBe('25.00%');
      expect(formatWeight(0.005)).toBe('0.50%');
    });

    it('should handle edge cases', () => {
      expect(formatWeight(0)).toBe('0.00%');
      expect(formatWeight(1)).toBe('100.00%');
    });

    it('should round to 2 decimal places', () => {
      expect(formatWeight(0.12345)).toBe('12.35%');
      expect(formatWeight(0.99999)).toBe('100.00%');
    });
  });
});
