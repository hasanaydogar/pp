import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { TransactionType } from '@/lib/types/portfolio';
import { POST } from '@/app/api/assets/[id]/transactions/route';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/auth/actions');

// Generate a valid UUID for tests
const generateUUID = () => 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('Transaction Business Logic Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('POST /api/assets/[id]/transactions - BUY Transaction', () => {
    it('should update asset quantity and average price after BUY transaction', async () => {
      const assetId = generateUUID();
      const initialAsset = {
        quantity: 10,
        average_buy_price: 100,
      };

      const newTransaction = {
        id: 'transaction-1',
        asset_id: assetId,
        type: TransactionType.BUY,
        amount: 5,
        price: 120,
        date: '2025-01-01T00:00:00Z',
        transaction_cost: 0,
      };

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({
            data: initialAsset,
            error: null,
          })
          .mockResolvedValueOnce({
            data: newTransaction,
            error: null,
          }),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
      };

      // Make update chain work
      mockSupabase.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new Request(`http://localhost/api/assets/${assetId}/transactions`, {
        method: 'POST',
        body: JSON.stringify({
          asset_id: assetId,
          type: TransactionType.BUY,
          amount: 5,
          price: 120,
          date: '2025-01-01T00:00:00Z',
          transaction_cost: 0,
        }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: assetId }),
      });

      expect(response.status).toBe(201);

      // Verify asset update was called with correct values
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 15, // 10 + 5
        }),
      );
    });

    it('should not update asset for SELL transaction', async () => {
      const assetId = generateUUID();
      const initialAsset = {
        quantity: 10,
        average_buy_price: 100,
      };
      const newTransaction = {
        id: 'transaction-2',
        asset_id: assetId,
        type: TransactionType.SELL,
        amount: 5,
        price: 120,
        date: '2025-01-01T00:00:00Z',
        transaction_cost: 0,
        realized_gain_loss: 100,
      };

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({
            data: initialAsset,
            error: null,
          })
          .mockResolvedValueOnce({
            data: newTransaction,
            error: null,
          }),
        update: jest.fn().mockReturnThis(),
      };

      // Mock the cost basis lots query (for FIFO calculation)
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null,
      });

      // Make update chain work
      mockSupabase.update.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const request = new Request(`http://localhost/api/assets/${assetId}/transactions`, {
        method: 'POST',
        body: JSON.stringify({
          asset_id: assetId,
          type: TransactionType.SELL,
          amount: 5,
          price: 120,
          date: '2025-01-01T00:00:00Z',
          transaction_cost: 0,
        }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: assetId }),
      });

      expect(response.status).toBe(201);
    });
  });
});

