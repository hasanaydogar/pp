# Database Migration Guide

## Running the Portfolio Schema Migration

### Option 1: Using Supabase Dashboard (Recommended for First Time)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/20251130111500_create_portfolio_schema.sql`
4. Copy the entire SQL content
5. Paste into SQL Editor
6. Click **Run** to execute the migration
7. Verify tables are created in **Table Editor**

### Option 2: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

4. Push migrations:
```bash
supabase db push
```

### Verification Steps

After running the migration, verify:

1. **Tables Created**:
   - `portfolios`
   - `assets`
   - `transactions`

2. **ENUM Types Created**:
   - `asset_type`
   - `transaction_type`

3. **Indexes Created**:
   - `idx_portfolios_user_id`
   - `idx_assets_portfolio_id`
   - `idx_assets_symbol`
   - `idx_assets_type`
   - `idx_transactions_asset_id`
   - `idx_transactions_date`

4. **RLS Enabled**:
   - Check that RLS is enabled on all three tables
   - Verify policies are created

5. **Test Data Insertion**:
   ```sql
   -- Test portfolio creation (replace with your user_id)
   INSERT INTO portfolios (user_id, name) 
   VALUES ('your-user-id', 'Test Portfolio');
   
   -- Test asset creation
   INSERT INTO assets (portfolio_id, symbol, quantity, average_buy_price, type)
   VALUES (
     (SELECT id FROM portfolios LIMIT 1),
     'AAPL',
     10.5,
     150.00,
     'STOCK'
   );
   ```

## Rollback

If you need to rollback the migration:

1. Create a rollback migration file
2. Drop tables in reverse order (transactions → assets → portfolios)
3. Drop indexes
4. Drop RLS policies
5. Drop ENUM types

See `supabase/migrations/YYYYMMDDHHMMSS_rollback_portfolio_schema.sql` for rollback script.

