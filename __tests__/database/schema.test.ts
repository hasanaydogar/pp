import { createClient } from '@/lib/supabase/server';

// Skip database tests in CI/test environment without real Supabase connection
const shouldSkip = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SKIP_DB_TESTS === 'true';

(shouldSkip ? describe.skip : describe)('Database Schema Tests', () => {
  let supabase: Awaited<ReturnType<typeof createClient>>;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('Tables Existence', () => {
    it('should have portfolios table', async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id')
        .limit(1);

      // Should not error even if empty (table exists)
      expect(error).toBeNull();
    });

    it('should have assets table', async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('id')
        .limit(1);

      expect(error).toBeNull();
    });

    it('should have transactions table', async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id')
        .limit(1);

      expect(error).toBeNull();
    });
  });

  describe('Foreign Key Relationships', () => {
    it('should enforce foreign key from assets to portfolios', async () => {
      const { error } = await supabase
        .from('assets')
        .insert({
          portfolio_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID
          symbol: 'TEST',
          quantity: 1,
          average_buy_price: 100,
          type: 'STOCK',
        });

      // Should fail due to foreign key constraint
      expect(error).not.toBeNull();
    });

    it('should enforce foreign key from transactions to assets', async () => {
      const { error } = await supabase
        .from('transactions')
        .insert({
          asset_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID
          type: 'BUY',
          amount: 1,
          price: 100,
          date: new Date().toISOString(),
        });

      // Should fail due to foreign key constraint
      expect(error).not.toBeNull();
    });
  });

  describe('Check Constraints', () => {
    it('should reject negative quantity', async () => {
      // First create a portfolio
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Test Portfolio' })
        .select()
        .single();

      if (!portfolio) return;

      const { error } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'TEST',
          quantity: -10, // Negative - should fail
          average_buy_price: 100,
          type: 'STOCK',
        });

      expect(error).not.toBeNull();
    });

    it('should reject negative price', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Test Portfolio 2' })
        .select()
        .single();

      if (!portfolio) return;

      const { error } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'TEST2',
          quantity: 10,
          average_buy_price: -100, // Negative - should fail
          type: 'STOCK',
        });

      expect(error).not.toBeNull();
    });
  });

  describe('Unique Constraints', () => {
    it('should prevent duplicate assets in same portfolio', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Test Portfolio 3' })
        .select()
        .single();

      if (!portfolio) return;

      // Insert first asset
      const { error: error1 } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'AAPL',
          quantity: 10,
          average_buy_price: 150,
          type: 'STOCK',
        });

      expect(error1).toBeNull();

      // Try to insert duplicate
      const { error: error2 } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'AAPL',
          quantity: 20,
          average_buy_price: 160,
          type: 'STOCK', // Same symbol and type in same portfolio
        });

      // Should fail due to unique constraint
      expect(error2).not.toBeNull();
    });
  });
});

