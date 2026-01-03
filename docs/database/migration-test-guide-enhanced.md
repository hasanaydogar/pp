# Enhanced Features Migration Test Guide

**Date:** 2025-11-30  
**Migrations:** 20251130120000, 20251130120001, 20251130120002

## Overview

This guide helps you test the three new migrations for enhanced portfolio tracker features:
1. Currency Support Migration (`20251130120000_add_currency_support.sql`)
2. Benchmark Support Migration (`20251130120001_add_benchmark_support.sql`)
3. Cost Basis Tracking Migration (`20251130120002_add_cost_basis_tracking.sql`)

## Pre-Migration Checklist

- [ ] Backup your database (if production)
- [ ] Ensure you have access to Supabase Dashboard or CLI
- [ ] Verify existing data exists (for backward compatibility testing)

## Migration 1: Currency Support

### Test Steps

1. **Run Migration**
   ```sql
   -- Copy and paste the contents of:
   -- supabase/migrations/20251130120000_add_currency_support.sql
   ```

2. **Verify Currency Fields Added**
   ```sql
   -- Check assets table
   SELECT column_name, data_type, column_default, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'assets'
   AND column_name IN ('currency', 'initial_purchase_date', 'notes');
   
   -- Check transactions table
   SELECT column_name, data_type, column_default, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'transactions'
   AND column_name IN ('currency', 'realized_gain_loss', 'notes');
   
   -- Check portfolios table
   SELECT column_name, data_type, column_default, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'portfolios'
   AND column_name = 'base_currency';
   ```

3. **Test Default Values**
   ```sql
   -- Create a new asset (should default to USD)
   INSERT INTO assets (portfolio_id, symbol, quantity, average_buy_price, type)
   VALUES (
     (SELECT id FROM portfolios LIMIT 1),
     'TEST',
     10,
     100,
     'STOCK'
   );
   
   -- Verify currency is USD
   SELECT currency FROM assets WHERE symbol = 'TEST';
   -- Expected: USD
   
   -- Clean up
   DELETE FROM assets WHERE symbol = 'TEST';
   ```

4. **Test Existing Data**
   ```sql
   -- Check that existing assets have currency = 'USD'
   SELECT id, symbol, currency FROM assets LIMIT 5;
   -- All should show currency = 'USD'
   
   -- Check that existing portfolios have base_currency = 'USD'
   SELECT id, name, base_currency FROM portfolios LIMIT 5;
   -- All should show base_currency = 'USD'
   ```

### Expected Results

- ✅ All currency fields added successfully
- ✅ Default values are 'USD'
- ✅ Existing data preserved
- ✅ New fields are nullable (except assets.currency and portfolios.base_currency)

## Migration 2: Benchmark Support

### Test Steps

1. **Run Migration**
   ```sql
   -- Copy and paste the contents of:
   -- supabase/migrations/20251130120001_add_benchmark_support.sql
   ```

2. **Verify Benchmark Symbol Field Added**
   ```sql
   -- Check portfolios table
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'portfolios'
   AND column_name = 'benchmark_symbol';
   ```

3. **Test Benchmark Symbol**
   ```sql
   -- Update a portfolio with benchmark symbol
   UPDATE portfolios
   SET benchmark_symbol = 'BIST100'
   WHERE id = (SELECT id FROM portfolios LIMIT 1);
   
   -- Verify update
   SELECT id, name, benchmark_symbol FROM portfolios
   WHERE benchmark_symbol IS NOT NULL;
   ```

### Expected Results

- ✅ benchmark_symbol field added successfully
- ✅ Field is nullable (optional)
- ✅ Can set and update benchmark symbols

## Migration 3: Cost Basis Tracking

### Test Steps

1. **Run Migration**
   ```sql
   -- Copy and paste the contents of:
   -- supabase/migrations/20251130120002_add_cost_basis_tracking.sql
   ```

2. **Verify Table Created**
   ```sql
   -- Check table exists
   SELECT table_name
   FROM information_schema.tables
   WHERE table_name = 'cost_basis_lots';
   
   -- Check columns
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'cost_basis_lots'
   ORDER BY ordinal_position;
   ```

3. **Verify Indexes Created**
   ```sql
   -- Check indexes
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename = 'cost_basis_lots';
   ```

4. **Test RLS Policies**
   ```sql
   -- Check RLS is enabled
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE tablename = 'cost_basis_lots';
   -- Expected: rowsecurity = true
   
   -- Check policies exist
   SELECT policyname, cmd, qual
   FROM pg_policies
   WHERE tablename = 'cost_basis_lots';
   -- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)
   ```

5. **Test Foreign Keys**
   ```sql
   -- Get an asset and transaction ID
   SELECT a.id as asset_id, t.id as transaction_id
   FROM assets a
   JOIN transactions t ON t.asset_id = a.id
   LIMIT 1;
   
   -- Create a cost basis lot (if you have valid IDs)
   -- Note: This requires authenticated user context
   INSERT INTO cost_basis_lots (
     asset_id,
     purchase_transaction_id,
     quantity,
     cost_basis,
     remaining_quantity
   )
   VALUES (
     '<asset_id_from_above>',
     '<transaction_id_from_above>',
     10,
     1000,
     10
   );
   
   -- Verify insertion
   SELECT * FROM cost_basis_lots LIMIT 1;
   ```

### Expected Results

- ✅ cost_basis_lots table created successfully
- ✅ All indexes created
- ✅ RLS enabled and policies created
- ✅ Foreign keys work correctly
- ✅ CHECK constraints enforce data integrity

## Backward Compatibility Tests

### Test Existing Queries Still Work

1. **Test Portfolio Queries**
   ```sql
   -- Existing query should still work
   SELECT * FROM portfolios WHERE user_id = auth.uid();
   ```

2. **Test Asset Queries**
   ```sql
   -- Existing query should still work
   SELECT * FROM assets 
   WHERE portfolio_id IN (
     SELECT id FROM portfolios WHERE user_id = auth.uid()
   );
   ```

3. **Test Transaction Queries**
   ```sql
   -- Existing query should still work
   SELECT * FROM transactions
   WHERE asset_id IN (
     SELECT id FROM assets
     WHERE portfolio_id IN (
       SELECT id FROM portfolios WHERE user_id = auth.uid()
     )
   );
   ```

### Expected Results

- ✅ All existing queries work without modification
- ✅ No breaking changes to API responses (new fields are optional)
- ✅ Default values ensure backward compatibility

## Rollback Instructions

If you need to rollback, run these migrations in reverse order:

### Rollback Migration 3 (Cost Basis Tracking)
```sql
-- Drop RLS policies
DROP POLICY IF EXISTS "Users can delete cost basis lots for their assets" ON cost_basis_lots;
DROP POLICY IF EXISTS "Users can update cost basis lots for their assets" ON cost_basis_lots;
DROP POLICY IF EXISTS "Users can create cost basis lots for their assets" ON cost_basis_lots;
DROP POLICY IF EXISTS "Users can view cost basis lots for their assets" ON cost_basis_lots;

-- Drop indexes
DROP INDEX IF EXISTS idx_cost_basis_lots_purchase_transaction_id;
DROP INDEX IF EXISTS idx_cost_basis_lots_asset_id;

-- Drop table
DROP TABLE IF EXISTS cost_basis_lots;
```

### Rollback Migration 2 (Benchmark Support)
```sql
ALTER TABLE portfolios DROP COLUMN IF EXISTS benchmark_symbol;
```

### Rollback Migration 1 (Currency Support)
```sql
-- Remove realized_gain_loss
ALTER TABLE transactions DROP COLUMN IF EXISTS realized_gain_loss;

-- Remove notes fields
ALTER TABLE transactions DROP COLUMN IF EXISTS notes;
ALTER TABLE assets DROP COLUMN IF EXISTS notes;

-- Remove initial_purchase_date
ALTER TABLE assets DROP COLUMN IF EXISTS initial_purchase_date;

-- Remove currency fields
ALTER TABLE transactions DROP COLUMN IF EXISTS currency;
ALTER TABLE assets DROP COLUMN IF EXISTS currency;
ALTER TABLE portfolios DROP COLUMN IF EXISTS base_currency;
```

## Success Criteria

- [ ] All migrations run without errors
- [ ] All new columns exist with correct data types
- [ ] Default values work correctly
- [ ] Existing data preserved
- [ ] RLS policies work correctly
- [ ] Foreign keys work correctly
- [ ] Indexes created successfully
- [ ] Backward compatibility maintained
- [ ] No breaking changes to existing queries

## Next Steps

After successful migration testing:
1. Update TypeScript types (`lib/types/portfolio.ts`)
2. Update Zod schemas
3. Update API endpoints to use new fields
4. Test API endpoints with new fields

## Troubleshooting

### Error: Column already exists
- **Cause:** Migration already run
- **Solution:** Skip this migration or rollback first

### Error: Cannot add NOT NULL column without default
- **Cause:** Existing data in table
- **Solution:** Migration includes DEFAULT values, should not occur

### Error: RLS policy already exists
- **Cause:** Policy already created
- **Solution:** Use `CREATE POLICY IF NOT EXISTS` or drop existing policy first

### Error: Foreign key constraint violation
- **Cause:** Invalid asset_id or transaction_id
- **Solution:** Ensure referenced records exist

