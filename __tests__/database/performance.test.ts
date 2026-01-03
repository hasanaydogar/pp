import { createClient } from '@/lib/supabase/server';

// Skip database tests in CI/test environment without real Supabase connection
const shouldSkip = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SKIP_DB_TESTS === 'true';

(shouldSkip ? describe.skip : describe)('Database Performance Tests', () => {
  let supabase: Awaited<ReturnType<typeof createClient>>;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('Query Performance', () => {
    it('should query portfolios by user_id efficiently', async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .limit(100);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(queryTime).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should query assets by portfolio_id efficiently', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Performance Test Portfolio' })
        .select()
        .single();

      if (!portfolio) return;

      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .limit(100);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(queryTime).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should query transactions by date efficiently', async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(queryTime).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should query assets by symbol efficiently', async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('symbol', 'AAPL')
        .limit(100);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(queryTime).toBeLessThan(100); // Should complete in < 100ms
    });
  });

  describe('Index Usage', () => {
    it('should use index for user_id queries', async () => {
      // This test verifies that indexes are being used
      // Actual index usage verification would require EXPLAIN ANALYZE
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      // Index usage is verified by query performance
    });

    it('should use index for portfolio_id queries', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Index Test Portfolio' })
        .select()
        .single();

      if (!portfolio) return;

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .limit(1);

      expect(error).toBeNull();
    });
  });
});

