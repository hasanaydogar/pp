import { createClient } from '@/lib/supabase/server';

describe('Portfolio Flow E2E Tests', () => {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  let testPortfolioId: string;
  let testAssetId: string;
  let testTransactionId: string;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('Complete Portfolio Creation Flow', () => {
    it('should create portfolio, add asset, and record transaction', async () => {
      // Step 1: Create Portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({ name: 'E2E Test Portfolio' })
        .select()
        .single();

      expect(portfolioError).toBeNull();
      expect(portfolio).toBeDefined();
      expect(portfolio?.name).toBe('E2E Test Portfolio');
      testPortfolioId = portfolio!.id;

      // Step 2: Add Asset
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .insert({
          portfolio_id: portfolio!.id,
          symbol: 'AAPL',
          quantity: 10,
          average_buy_price: 150.00,
          type: 'STOCK',
        })
        .select()
        .single();

      expect(assetError).toBeNull();
      expect(asset).toBeDefined();
      expect(asset?.symbol).toBe('AAPL');
      expect(asset?.portfolio_id).toBe(portfolio!.id);
      testAssetId = asset!.id;

      // Step 3: Record Transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          asset_id: asset!.id,
          type: 'BUY',
          amount: 10,
          price: 150.00,
          date: new Date().toISOString(),
          transaction_cost: 1.50,
        })
        .select()
        .single();

      expect(transactionError).toBeNull();
      expect(transaction).toBeDefined();
      expect(transaction?.type).toBe('BUY');
      expect(transaction?.asset_id).toBe(asset!.id);
      testTransactionId = transaction!.id;
    });

    it('should query portfolio with assets and transactions', async () => {
      const { data: portfolio, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          assets (
            *,
            transactions (*)
          )
        `)
        .eq('id', testPortfolioId)
        .single();

      expect(error).toBeNull();
      expect(portfolio).toBeDefined();
      expect(portfolio?.assets).toBeDefined();
      expect(portfolio?.assets.length).toBeGreaterThan(0);
      expect(portfolio?.assets[0].transactions).toBeDefined();
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test data (cascade will handle related records)
    if (testPortfolioId) {
      await supabase
        .from('portfolios')
        .delete()
        .eq('id', testPortfolioId);
    }
  });
});

