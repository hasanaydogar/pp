import { z } from 'zod';
import {
  PortfolioSchema,
  AssetSchema,
  TransactionSchema,
  CreatePortfolioSchema,
  CreateAssetSchema,
  CreateTransactionSchema,
  UpdatePortfolioSchema,
  UpdateAssetSchema,
  UpdateTransactionSchema,
  AssetType,
  TransactionType,
} from '@/lib/types/portfolio';

describe('Portfolio TypeScript Types and Zod Schemas', () => {
  describe('PortfolioSchema', () => {
    it('should validate valid portfolio data', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Portfolio',
        created_at: '2025-11-30T12:00:00Z',
        updated_at: '2025-11-30T12:00:00Z',
      };

      const result = PortfolioSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        id: 'invalid-uuid',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Portfolio',
        created_at: '2025-11-30T12:00:00Z',
        updated_at: null,
      };

      const result = PortfolioSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow null updated_at', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Portfolio',
        created_at: '2025-11-30T12:00:00Z',
        updated_at: null,
      };

      const result = PortfolioSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('AssetSchema', () => {
    it('should validate valid asset data', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        portfolio_id: '123e4567-e89b-12d3-a456-426614174001',
        symbol: 'AAPL',
        quantity: 10.5,
        average_buy_price: 150.00,
        type: AssetType.STOCK,
        created_at: '2025-11-30T12:00:00Z',
        updated_at: null,
      };

      const result = AssetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative quantity', () => {
      const invalidData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        portfolio_id: '123e4567-e89b-12d3-a456-426614174001',
        symbol: 'AAPL',
        quantity: -10,
        average_buy_price: 150.00,
        type: AssetType.STOCK,
        created_at: '2025-11-30T12:00:00Z',
        updated_at: null,
      };

      const result = AssetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate all asset types', () => {
      const types = [
        AssetType.STOCK,
        AssetType.CRYPTO,
        AssetType.FOREX,
        AssetType.MUTUAL_FUND,
        AssetType.ETF,
        AssetType.BOND,
        AssetType.COMMODITY,
        AssetType.REAL_ESTATE,
        AssetType.DERIVATIVE,
        AssetType.OTHER,
      ];

      types.forEach((type) => {
        const data = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          portfolio_id: '123e4567-e89b-12d3-a456-426614174001',
          symbol: 'TEST',
          quantity: 1,
          average_buy_price: 100,
          type,
          created_at: '2025-11-30T12:00:00Z',
          updated_at: null,
        };

        const result = AssetSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('TransactionSchema', () => {
    it('should validate valid transaction data', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        asset_id: '123e4567-e89b-12d3-a456-426614174001',
        type: TransactionType.BUY,
        amount: 10,
        price: 150.00,
        date: '2025-11-30T12:00:00Z',
        transaction_cost: 1.50,
        created_at: '2025-11-30T12:00:00Z',
        updated_at: null,
      };

      const result = TransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const invalidData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        asset_id: '123e4567-e89b-12d3-a456-426614174001',
        type: TransactionType.BUY,
        amount: -10,
        price: 150.00,
        date: '2025-11-30T12:00:00Z',
        transaction_cost: 0,
        created_at: '2025-11-30T12:00:00Z',
        updated_at: null,
      };

      const result = TransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow zero transaction_cost', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        asset_id: '123e4567-e89b-12d3-a456-426614174001',
        type: TransactionType.BUY,
        amount: 10,
        price: 150.00,
        date: '2025-11-30T12:00:00Z',
        transaction_cost: 0,
        created_at: '2025-11-30T12:00:00Z',
        updated_at: null,
      };

      const result = TransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('CreatePortfolioSchema', () => {
    it('should validate create portfolio data', () => {
      const validData = {
        name: 'New Portfolio',
      };

      const result = CreatePortfolioSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
      };

      const result = CreatePortfolioSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateAssetSchema', () => {
    it('should validate create asset data', () => {
      const validData = {
        portfolio_id: '123e4567-e89b-12d3-a456-426614174001',
        symbol: 'BTC',
        quantity: 0.5,
        average_buy_price: 50000,
        type: AssetType.CRYPTO,
      };

      const result = CreateAssetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid asset type', () => {
      const invalidData = {
        portfolio_id: '123e4567-e89b-12d3-a456-426614174001',
        symbol: 'BTC',
        quantity: 0.5,
        average_buy_price: 50000,
        type: 'INVALID_TYPE' as any,
      };

      const result = CreateAssetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateTransactionSchema', () => {
    it('should validate create transaction data', () => {
      const validData = {
        asset_id: '123e4567-e89b-12d3-a456-426614174001',
        type: TransactionType.SELL,
        amount: 5,
        price: 160.00,
        date: '2025-11-30T12:00:00Z',
        transaction_cost: 2.00,
      };

      const result = CreateTransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should default transaction_cost to 0', () => {
      const data = {
        asset_id: '123e4567-e89b-12d3-a456-426614174001',
        type: TransactionType.BUY,
        amount: 10,
        price: 150.00,
        date: '2025-11-30T12:00:00Z',
      };

      const result = CreateTransactionSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.transaction_cost).toBe(0);
      }
    });
  });

  describe('Update Schemas', () => {
    it('should validate partial update for portfolio', () => {
      const validData = {
        name: 'Updated Portfolio Name',
      };

      const result = UpdatePortfolioSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow empty update object', () => {
      const result = UpdatePortfolioSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate partial update for asset', () => {
      const validData = {
        quantity: 15,
        average_buy_price: 155.00,
      };

      const result = UpdateAssetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate partial update for transaction', () => {
      const validData = {
        amount: 20,
        price: 165.00,
      };

      const result = UpdateTransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Type Exports', () => {
    it('should export AssetType enum correctly', () => {
      expect(AssetType.STOCK).toBe('STOCK');
      expect(AssetType.CRYPTO).toBe('CRYPTO');
      expect(Object.keys(AssetType).length).toBe(10);
    });

    it('should export TransactionType enum correctly', () => {
      expect(TransactionType.BUY).toBe('BUY');
      expect(TransactionType.SELL).toBe('SELL');
      expect(Object.keys(TransactionType).length).toBe(2);
    });
  });
});

