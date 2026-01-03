# Enhanced Features Migration Guide

This guide helps you run the database migrations for enhanced portfolio tracker features.

## Migration Files

1. `20251130120000_add_currency_support.sql` - Currency fields, initial purchase date, notes, realized gain/loss
2. `20251130120001_add_benchmark_support.sql` - Benchmark symbol support
3. `20251130120002_add_cost_basis_tracking.sql` - Cost basis lots table for FIFO tracking

## Quick Start

### Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste each migration file content
3. Run migrations in order (20000 → 20001 → 20002)
4. Verify migrations completed successfully

### Using Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Migration Details

### Migration 1: Currency Support

**File:** `20251130120000_add_currency_support.sql`

**Changes:**
- Adds `currency` to assets (default: 'USD')
- Adds `currency` to transactions (nullable)
- Adds `base_currency` to portfolios (default: 'USD')
- Adds `initial_purchase_date` to assets
- Adds `notes` to assets and transactions
- Adds `realized_gain_loss` to transactions

**Impact:** Low - All new fields have defaults or are nullable

### Migration 2: Benchmark Support

**File:** `20251130120001_add_benchmark_support.sql`

**Changes:**
- Adds `benchmark_symbol` to portfolios (nullable)

**Impact:** None - Field is optional

### Migration 3: Cost Basis Tracking

**File:** `20251130120002_add_cost_basis_tracking.sql`

**Changes:**
- Creates `cost_basis_lots` table
- Adds indexes for performance
- Adds RLS policies

**Impact:** None - New table, no existing data affected

## Verification

After running migrations, verify:

```sql
-- Check currency fields
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'assets' AND column_name IN ('currency', 'initial_purchase_date', 'notes');

-- Check benchmark field
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'portfolios' AND column_name = 'benchmark_symbol';

-- Check cost basis table
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'cost_basis_lots';
```

## Rollback

If you need to rollback, see `docs/database/migration-test-guide-enhanced.md` for rollback scripts.

## Notes

- All migrations are backward compatible
- Existing data is preserved
- Default values ensure existing functionality continues to work
- RLS policies updated for new fields

