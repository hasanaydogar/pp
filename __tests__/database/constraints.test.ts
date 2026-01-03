import { createClient } from '@/lib/supabase/server';

// Skip database tests in CI/test environment without real Supabase connection
const shouldSkip = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SKIP_DB_TESTS === 'true';

(shouldSkip ? describe.skip : describe)('Database Constraints Tests', () => {
  let supabase: Awaited<ReturnType<typeof createClient>>;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('CHECK Constraints', () => {
    it('should reject negative quantity', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Constraint Test Portfolio' })
        .select()
        .single();

      if (!portfolio) return;

      const { error } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'TEST',
          quantity: -10,
          average_buy_price: 100,
          type: 'STOCK',
        });

      expect(error).not.toBeNull();
      expect(error?.code).toBe('23514'); // CHECK constraint violation
    });

    it('should reject negative average_buy_price', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Constraint Test Portfolio 2' })
        .select()
        .single();

      if (!portfolio) return;

      const { error } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'TEST2',
          quantity: 10,
          average_buy_price: -100,
          type: 'STOCK',
        });

      expect(error).not.toBeNull();
    });

    it('should reject negative transaction amount', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Constraint Test Portfolio 3' })
        .select()
        .single();

      if (!portfolio) return;

      const { data: asset } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'TEST3',
          quantity: 10,
          average_buy_price: 100,
          type: 'STOCK',
        })
        .select()
        .single();

      if (!asset) return;

      const { error } = await supabase
        .from('transactions')
        .insert({
          asset_id: asset.id,
          type: 'BUY',
          amount: -10,
          price: 100,
          date: new Date().toISOString(),
        });

      expect(error).not.toBeNull();
    });

    it('should allow zero transaction_cost', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Constraint Test Portfolio 4' })
        .select()
        .single();

      if (!portfolio) return;

      const { data: asset } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'TEST4',
          quantity: 10,
          average_buy_price: 100,
          type: 'STOCK',
        })
        .select()
        .single();

      if (!asset) return;

      const { error } = await supabase
        .from('transactions')
        .insert({
          asset_id: asset.id,
          type: 'BUY',
          amount: 10,
          price: 100,
          date: new Date().toISOString(),
          transaction_cost: 0,
        });

      expect(error).toBeNull();
    });
  });

  describe('NOT NULL Constraints', () => {
    it('should reject NULL portfolio name', async () => {
      const { error } = await supabase
        .from('portfolios')
        .insert({ name: null as any });

      expect(error).not.toBeNull();
    });

    it('should reject NULL asset symbol', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Test' })
        .select()
        .single();

      if (!portfolio) return;

      const { error } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: null as any,
          quantity: 10,
          average_buy_price: 100,
          type: 'STOCK',
        });

      expect(error).not.toBeNull();
    });
  });

  describe('UNIQUE Constraints', () => {
    it('should prevent duplicate assets in same portfolio', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Unique Test Portfolio' })
        .select()
        .single();

      if (!portfolio) return;

      // Insert first asset
      const { error: error1 } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'GOOGL',
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
          symbol: 'GOOGL',
          quantity: 20,
          average_buy_price: 160,
          type: 'STOCK',
        });

      expect(error2).not.toBeNull();
      expect(error2?.code).toBe('23505'); // Unique constraint violation
    });

    it('should allow same symbol with different type', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Unique Test Portfolio 2' })
        .select()
        .single();

      if (!portfolio) return;

      // Insert STOCK
      const { error: error1 } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'BTC',
          quantity: 1,
          average_buy_price: 50000,
          type: 'STOCK',
        });

      expect(error1).toBeNull();

      // Insert CRYPTO with same symbol (should be allowed)
      const { error: error2 } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'BTC',
          quantity: 0.5,
          average_buy_price: 50000,
          type: 'CRYPTO',
        });

      expect(error2).toBeNull();
    });
  });
});

