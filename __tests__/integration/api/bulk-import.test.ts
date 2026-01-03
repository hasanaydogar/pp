/**
 * Integration tests for bulk import functionality
 */

import {
  sortTransactionsByDate,
  validateHistoricalDates,
  validateTransactionOrder,
  calculateAssetFromTransactions,
} from '@/lib/api/import-utils';
import { CreateTransaction, TransactionType } from '@/lib/types/portfolio';

describe('Integration: Bulk Import', () => {
  describe('Transaction Sorting', () => {
    it('should sort transactions by date (oldest first)', () => {
      const transactions: CreateTransaction[] = [
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 10,
          price: 100,
          date: '2024-01-15T00:00:00Z',
          transaction_cost: 0,
        },
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 5,
          price: 120,
          date: '2024-01-01T00:00:00Z',
          transaction_cost: 0,
        },
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 3,
          price: 110,
          date: '2024-01-10T00:00:00Z',
          transaction_cost: 0,
        },
      ];

      const sorted = sortTransactionsByDate(transactions);
      expect(sorted[0].date).toBe('2024-01-01T00:00:00Z');
      expect(sorted[1].date).toBe('2024-01-10T00:00:00Z');
      expect(sorted[2].date).toBe('2024-01-15T00:00:00Z');
    });
  });

  describe('Historical Date Validation', () => {
    it('should accept past dates', () => {
      const transactions: CreateTransaction[] = [
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 10,
          price: 100,
          date: '2020-01-01T00:00:00Z',
          transaction_cost: 0,
        },
      ];

      expect(() => {
        validateHistoricalDates(transactions);
      }).not.toThrow();
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const transactions: CreateTransaction[] = [
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 10,
          price: 100,
          date: futureDate.toISOString(),
          transaction_cost: 0,
        },
      ];

      expect(() => {
        validateHistoricalDates(transactions);
      }).toThrow('Transaction date cannot be in the future');
    });
  });

  describe('Transaction Order Validation', () => {
    it('should detect out-of-order transactions', () => {
      const transactions: CreateTransaction[] = [
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 10,
          price: 100,
          date: '2024-01-15T00:00:00Z',
          transaction_cost: 0,
        },
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 5,
          price: 120,
          date: '2024-01-01T00:00:00Z',
          transaction_cost: 0,
        },
      ];

      const warnings = validateTransactionOrder(transactions);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should not warn for correctly ordered transactions', () => {
      const transactions: CreateTransaction[] = [
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 5,
          price: 120,
          date: '2024-01-01T00:00:00Z',
          transaction_cost: 0,
        },
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 10,
          price: 100,
          date: '2024-01-15T00:00:00Z',
          transaction_cost: 0,
        },
      ];

      const warnings = validateTransactionOrder(transactions);
      expect(warnings.length).toBe(0);
    });
  });

  describe('Asset Calculation from Transactions', () => {
    it('should calculate quantity and average price from BUY transactions', () => {
      const transactions: CreateTransaction[] = [
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 10,
          price: 100,
          date: '2024-01-01T00:00:00Z',
          transaction_cost: 0,
        },
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 5,
          price: 120,
          date: '2024-01-15T00:00:00Z',
          transaction_cost: 0,
        },
      ];

      const result = calculateAssetFromTransactions(transactions);
      expect(result.quantity).toBe(15);
      expect(result.averageBuyPrice).toBeCloseTo(106.67, 2);
      expect(result.initialPurchaseDate).toBe('2024-01-01T00:00:00Z');
    });

    it('should handle BUY and SELL transactions', () => {
      const transactions: CreateTransaction[] = [
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 10,
          price: 100,
          date: '2024-01-01T00:00:00Z',
          transaction_cost: 0,
        },
        {
          asset_id: 'test-id',
          type: TransactionType.SELL,
          amount: 3,
          price: 120,
          date: '2024-01-15T00:00:00Z',
          transaction_cost: 0,
        },
      ];

      const result = calculateAssetFromTransactions(transactions);
      expect(result.quantity).toBe(7);
      expect(result.averageBuyPrice).toBe(100);
    });

    it('should throw error for insufficient quantity in SELL', () => {
      const transactions: CreateTransaction[] = [
        {
          asset_id: 'test-id',
          type: TransactionType.BUY,
          amount: 5,
          price: 100,
          date: '2024-01-01T00:00:00Z',
          transaction_cost: 0,
        },
        {
          asset_id: 'test-id',
          type: TransactionType.SELL,
          amount: 10,
          price: 120,
          date: '2024-01-15T00:00:00Z',
          transaction_cost: 0,
        },
      ];

      expect(() => {
        calculateAssetFromTransactions(transactions);
      }).toThrow('Insufficient quantity');
    });

    it('should handle empty transactions array', () => {
      expect(() => {
        calculateAssetFromTransactions([]);
      }).toThrow('Cannot calculate asset from empty transactions');
    });
  });

  describe('Bulk Import Endpoints', () => {
    // Note: These tests require actual database setup
    // They should be run with test database or mocked Supabase client

    it.skip('should import multiple transactions for existing asset', async () => {
      // This test requires:
      // 1. Authenticated user
      // 2. Portfolio and asset created
      // 3. Bulk transaction import via API
      // 4. Verify transactions created
      // 5. Verify asset updated correctly
    });

    it.skip('should create asset from historical transactions', async () => {
      // This test requires:
      // 1. Authenticated user
      // 2. Portfolio created
      // 3. Asset import with transactions via API
      // 4. Verify asset created with correct quantity/price
      // 5. Verify all transactions created
    });

    it.skip('should handle large transaction imports (100+ transactions)', async () => {
      // This test requires:
      // 1. Generate 100+ test transactions
      // 2. Import via API
      // 3. Verify all created successfully
      // 4. Verify performance acceptable
    });

    it.skip('should handle errors gracefully during import', async () => {
      // This test requires:
      // 1. Invalid transaction data
      // 2. Import via API
      // 3. Verify partial success
      // 4. Verify error messages returned
    });
  });
});

