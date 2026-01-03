import {
  calculateAverageBuyPrice,
  validateSufficientQuantity,
  calculateRealizedGainLoss,
  calculateSellTransaction,
} from '../business-logic';

describe('Business Logic: Average Buy Price Calculation', () => {
  describe('calculateAverageBuyPrice', () => {
    it('should calculate correct average for first purchase', () => {
      const result = calculateAverageBuyPrice(0, 0, 10, 100);
      expect(result.newQuantity).toBe(10);
      expect(result.newAveragePrice).toBe(100);
    });

    it('should calculate correct average for additional purchase', () => {
      // Initial: 10 shares at $100 = $1000 total
      // Buy: 5 shares at $120 = $600 total
      // New: 15 shares, total $1600, average $106.67
      const result = calculateAverageBuyPrice(10, 100, 5, 120);
      expect(result.newQuantity).toBe(15);
      expect(result.newAveragePrice).toBeCloseTo(106.67, 2);
    });

    it('should calculate correct average for multiple purchases', () => {
      // Initial: 20 shares at $50 = $1000 total
      // Buy: 10 shares at $60 = $600 total
      // New: 30 shares, total $1600, average $53.33
      const result = calculateAverageBuyPrice(20, 50, 10, 60);
      expect(result.newQuantity).toBe(30);
      expect(result.newAveragePrice).toBeCloseTo(53.33, 2);
    });

    it('should handle decimal quantities', () => {
      // Initial: 1.5 shares at $100 = $150 total
      // Buy: 0.5 shares at $120 = $60 total
      // New: 2 shares, total $210, average $105
      const result = calculateAverageBuyPrice(1.5, 100, 0.5, 120);
      expect(result.newQuantity).toBe(2);
      expect(result.newAveragePrice).toBe(105);
    });

    it('should handle decimal prices', () => {
      // Initial: 10 shares at $100.50 = $1005 total
      // Buy: 5 shares at $120.75 = $603.75 total
      // New: 15 shares, total $1608.75, average $107.25
      const result = calculateAverageBuyPrice(10, 100.5, 5, 120.75);
      expect(result.newQuantity).toBe(15);
      expect(result.newAveragePrice).toBeCloseTo(107.25, 2);
    });

    it('should throw error for zero quantity', () => {
      expect(() => {
        calculateAverageBuyPrice(0, 0, 0, 100);
      }).toThrow('Cannot calculate average price with zero quantity');
    });

    it('should handle large numbers', () => {
      const result = calculateAverageBuyPrice(1000, 50, 500, 60);
      expect(result.newQuantity).toBe(1500);
      expect(result.newAveragePrice).toBeCloseTo(53.33, 2);
    });
  });

  describe('validateSufficientQuantity', () => {
    it('should not throw when sufficient quantity exists', () => {
      expect(() => {
        validateSufficientQuantity(10, 5);
      }).not.toThrow();
    });

    it('should not throw when exact quantity exists', () => {
      expect(() => {
        validateSufficientQuantity(10, 10);
      }).not.toThrow();
    });

    it('should throw error when insufficient quantity', () => {
      expect(() => {
        validateSufficientQuantity(5, 10);
      }).toThrow('Insufficient quantity');
    });

    it('should include current and requested amounts in error', () => {
      try {
        validateSufficientQuantity(5, 10);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toContain('Current: 5');
          expect(error.message).toContain('Requested: 10');
        }
      }
    });
  });

  describe('calculateRealizedGainLoss', () => {
    it('should calculate gain when selling above average buy price', () => {
      // Average buy price: $100, Sell price: $120, Amount: 10
      // Gain: (120 - 100) * 10 = $200
      const result = calculateRealizedGainLoss(100, 120, 10);
      expect(result).toBe(200);
    });

    it('should calculate loss when selling below average buy price', () => {
      // Average buy price: $100, Sell price: $80, Amount: 10
      // Loss: (80 - 100) * 10 = -$200
      const result = calculateRealizedGainLoss(100, 80, 10);
      expect(result).toBe(-200);
    });

    it('should return zero when selling at average buy price', () => {
      // Average buy price: $100, Sell price: $100, Amount: 10
      // Gain/Loss: (100 - 100) * 10 = $0
      const result = calculateRealizedGainLoss(100, 100, 10);
      expect(result).toBe(0);
    });

    it('should handle decimal prices and amounts', () => {
      // Average buy price: $100.50, Sell price: $120.75, Amount: 5.5
      // Gain: (120.75 - 100.50) * 5.5 = $111.375
      const result = calculateRealizedGainLoss(100.5, 120.75, 5.5);
      expect(result).toBeCloseTo(111.375, 2);
    });

    it('should handle large numbers', () => {
      const result = calculateRealizedGainLoss(50, 60, 1000);
      expect(result).toBe(10000);
    });
  });

  describe('calculateSellTransaction', () => {
    it('should calculate new quantity after sale', () => {
      // Current: 10, Sell: 5, New: 5
      const result = calculateSellTransaction(10, 5);
      expect(result).toBe(5);
    });

    it('should handle selling all quantity', () => {
      // Current: 10, Sell: 10, New: 0
      const result = calculateSellTransaction(10, 10);
      expect(result).toBe(0);
    });

    it('should handle decimal quantities', () => {
      // Current: 10.5, Sell: 2.5, New: 8
      const result = calculateSellTransaction(10.5, 2.5);
      expect(result).toBe(8);
    });

    it('should throw error when insufficient quantity', () => {
      expect(() => {
        calculateSellTransaction(5, 10);
      }).toThrow('Insufficient quantity');
    });

    it('should throw error when quantity would go negative', () => {
      // This shouldn't happen after validation, but test defensive code
      expect(() => {
        calculateSellTransaction(5, 10);
      }).toThrow();
    });

    it('should handle large numbers', () => {
      const result = calculateSellTransaction(1000, 500);
      expect(result).toBe(500);
    });
  });
});

