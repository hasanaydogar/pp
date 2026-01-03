import { createClient } from '@/lib/supabase/server';

// Skip database tests in CI/test environment without real Supabase connection
const shouldSkip = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SKIP_DB_TESTS === 'true';

(shouldSkip ? describe.skip : describe)('Database Relationships Tests', () => {
  let supabase: Awaited<ReturnType<typeof createClient>>;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('Foreign Key Relationships', () => {
    it('should enforce portfolio -> assets relationship', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Relationship Test Portfolio' })
        .select()
        .single();

      expect(portfolio).toBeDefined();

      const { data: asset, error } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio!.id,
          symbol: 'NVDA',
          quantity: 5,
          average_buy_price: 400,
          type: 'STOCK',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(asset).toBeDefined();
      expect(asset?.portfolio_id).toBe(portfolio!.id);
    });

    it('should enforce asset -> transactions relationship', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Relationship Test Portfolio 2' })
        .select()
        .single();

      if (!portfolio) return;

      const { data: asset } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'AMD',
          quantity: 10,
          average_buy_price: 100,
          type: 'STOCK',
        })
        .select()
        .single();

      if (!asset) return;

      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          asset_id: asset.id,
          type: 'BUY',
          amount: 10,
          price: 100,
          date: new Date().toISOString(),
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(transaction).toBeDefined();
      expect(transaction?.asset_id).toBe(asset.id);
    });

    it('should prevent orphaned assets', async () => {
      const { error } = await supabase
        .from('assets')
        .insert({
          portfolio_id: '00000000-0000-0000-0000-000000000000',
          symbol: 'ORPHAN',
          quantity: 1,
          average_buy_price: 100,
          type: 'STOCK',
        });

      expect(error).not.toBeNull();
    });

    it('should prevent orphaned transactions', async () => {
      const { error } = await supabase
        .from('transactions')
        .insert({
          asset_id: '00000000-0000-0000-0000-000000000000',
          type: 'BUY',
          amount: 1,
          price: 100,
          date: new Date().toISOString(),
        });

      expect(error).not.toBeNull();
    });
  });

  describe('Cascade Deletes', () => {
    it('should cascade delete assets when portfolio is deleted', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Cascade Test Portfolio' })
        .select()
        .single();

      if (!portfolio) return;

      const { data: asset } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'CASCADE',
          quantity: 1,
          average_buy_price: 100,
          type: 'STOCK',
        })
        .select()
        .single();

      expect(asset).toBeDefined();

      // Delete portfolio
      const { error: deleteError } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolio.id);

      expect(deleteError).toBeNull();

      // Asset should be deleted (cascade)
      const { data: deletedAsset } = await supabase
        .from('assets')
        .select('*')
        .eq('id', asset!.id)
        .single();

      expect(deletedAsset).toBeNull();
    });

    it('should cascade delete transactions when asset is deleted', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({ name: 'Cascade Test Portfolio 2' })
        .select()
        .single();

      if (!portfolio) return;

      const { data: asset } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio.id,
          symbol: 'CASCADE2',
          quantity: 1,
          average_buy_price: 100,
          type: 'STOCK',
        })
        .select()
        .single();

      if (!asset) return;

      const { data: transaction } = await supabase
        .from('transactions')
        .insert({
          asset_id: asset.id,
          type: 'BUY',
          amount: 1,
          price: 100,
          date: new Date().toISOString(),
        })
        .select()
        .single();

      expect(transaction).toBeDefined();

      // Delete asset
      const { error: deleteError } = await supabase
        .from('assets')
        .delete()
        .eq('id', asset.id);

      expect(deleteError).toBeNull();

      // Transaction should be deleted (cascade)
      const { data: deletedTransaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transaction!.id)
        .single();

      expect(deletedTransaction).toBeNull();
    });
  });
});

