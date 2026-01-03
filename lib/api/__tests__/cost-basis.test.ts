import {
  calculateAverageCostBasis,
  getCostBasisInfo,
} from '../cost-basis';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Cost Basis Calculations', () => {
  describe('Average Cost Method', () => {
    it('should calculate cost basis using average price', () => {
      const result = calculateAverageCostBasis(100, 10);
      expect(result).toBe(1000);
    });

    it('should handle decimal quantities', () => {
      const result = calculateAverageCostBasis(100.5, 5.5);
      expect(result).toBeCloseTo(552.75, 2);
    });

    it('should handle zero quantity', () => {
      const result = calculateAverageCostBasis(100, 0);
      expect(result).toBe(0);
    });
  });

  describe('FIFO Cost Basis', () => {
    // Note: FIFO tests require mocked Supabase client
    // These would be integration tests with actual database

    it.skip('should calculate FIFO cost basis correctly', async () => {
      // This test requires:
      // 1. Mock Supabase client
      // 2. Create test lots
      // 3. Calculate FIFO for SELL transaction
      // 4. Verify oldest lots used first
    });

    it.skip('should update lot remaining quantities', async () => {
      // This test requires:
      // 1. Mock Supabase client
      // 2. Create test lots
      // 3. Process SELL transaction
      // 4. Verify lot quantities updated
    });
  });

  describe('Cost Basis Info', () => {
    it.skip('should return cost basis information', async () => {
      // This test requires:
      // 1. Mock Supabase client
      // 2. Create test lots
      // 3. Get cost basis info
      // 4. Verify all fields returned correctly
    });
  });
});

