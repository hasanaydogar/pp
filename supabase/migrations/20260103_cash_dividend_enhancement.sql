-- ============================================================================
-- Migration: Cash & Dividend Enhancement
-- Feature: 015-cash-dividend-enhancement
-- Created: 2026-01-03
-- ============================================================================

-- ============================================================================
-- 1. DIVIDENDS TABLE ENHANCEMENTS
-- ============================================================================

-- Add source column for tracking auto vs manual dividends
ALTER TABLE dividends 
  ADD COLUMN IF NOT EXISTS source VARCHAR(10) DEFAULT 'MANUAL';

-- Add ex_dividend_date for tracking when dividend was earned
ALTER TABLE dividends 
  ADD COLUMN IF NOT EXISTS ex_dividend_date DATE;

-- Add yahoo_event_id for duplicate prevention from Yahoo Finance
ALTER TABLE dividends 
  ADD COLUMN IF NOT EXISTS yahoo_event_id VARCHAR(50);

-- Create unique index to prevent duplicate auto-recorded dividends
-- Only applies when yahoo_event_id is not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_dividends_yahoo_event 
  ON dividends(asset_id, yahoo_event_id) 
  WHERE yahoo_event_id IS NOT NULL;

-- Create index for querying by payment date
CREATE INDEX IF NOT EXISTS idx_dividends_payment_date 
  ON dividends(portfolio_id, payment_date DESC);

-- ============================================================================
-- 2. CASH_TRANSACTIONS TABLE ENHANCEMENTS
-- ============================================================================

-- Add related_transaction_id for linking to asset transactions
ALTER TABLE cash_transactions 
  ADD COLUMN IF NOT EXISTS related_transaction_id UUID;

-- Add related_asset_id for quick asset lookup
ALTER TABLE cash_transactions 
  ADD COLUMN IF NOT EXISTS related_asset_id UUID;

-- Add related_symbol for display without joins
ALTER TABLE cash_transactions 
  ADD COLUMN IF NOT EXISTS related_symbol VARCHAR(20);

-- Add foreign key constraints (with ON DELETE SET NULL to preserve history)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_cash_transactions_related_transaction'
  ) THEN
    ALTER TABLE cash_transactions 
      ADD CONSTRAINT fk_cash_transactions_related_transaction 
      FOREIGN KEY (related_transaction_id) 
      REFERENCES transactions(id) 
      ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_cash_transactions_related_asset'
  ) THEN
    ALTER TABLE cash_transactions 
      ADD CONSTRAINT fk_cash_transactions_related_asset 
      FOREIGN KEY (related_asset_id) 
      REFERENCES assets(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for querying transactions by date
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date 
  ON cash_transactions(cash_position_id, date DESC);

-- Create index for finding transactions by related asset
CREATE INDEX IF NOT EXISTS idx_cash_transactions_related_asset 
  ON cash_transactions(related_asset_id) 
  WHERE related_asset_id IS NOT NULL;

-- ============================================================================
-- 3. UPDATE CASH_TRANSACTION_TYPE ENUM
-- ============================================================================

-- Add new transaction types if not exists
DO $$
BEGIN
  -- Check if we need to add new enum values
  -- ASSET_PURCHASE and ASSET_SALE should already exist from previous migration
  -- This is just a safety check
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'ASSET_PURCHASE' 
    AND enumtypid = 'cash_transaction_type'::regtype
  ) THEN
    ALTER TYPE cash_transaction_type ADD VALUE IF NOT EXISTS 'ASSET_PURCHASE';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'ASSET_SALE' 
    AND enumtypid = 'cash_transaction_type'::regtype
  ) THEN
    ALTER TYPE cash_transaction_type ADD VALUE IF NOT EXISTS 'ASSET_SALE';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- Enum type doesn't exist yet, that's fine
    NULL;
END $$;

-- ============================================================================
-- 4. HELPFUL VIEWS
-- ============================================================================

-- View for cash flow with running balance
CREATE OR REPLACE VIEW cash_flow_with_balance AS
SELECT 
  ct.id,
  ct.cash_position_id,
  ct.type as transaction_type,
  ct.amount,
  ct.date as transaction_date,
  ct.notes,
  ct.related_symbol,
  ct.related_transaction_id,
  ct.created_at,
  cp.portfolio_id,
  cp.currency,
  SUM(ct.amount) OVER (
    PARTITION BY ct.cash_position_id 
    ORDER BY ct.date, ct.created_at
  ) as running_balance
FROM cash_transactions ct
JOIN cash_positions cp ON cp.id = ct.cash_position_id
ORDER BY ct.date DESC, ct.created_at DESC;

-- View for dividend summary with source breakdown
CREATE OR REPLACE VIEW dividend_summary_by_source AS
SELECT 
  portfolio_id,
  source,
  COUNT(*) as count,
  SUM(net_amount) as total_net,
  SUM(gross_amount) as total_gross,
  SUM(tax_amount) as total_tax,
  MIN(payment_date) as earliest_date,
  MAX(payment_date) as latest_date
FROM dividends
GROUP BY portfolio_id, source;
