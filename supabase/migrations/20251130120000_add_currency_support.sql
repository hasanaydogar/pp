-- Enhanced Portfolio Tracker: Currency Support Migration
-- Created: 2025-11-30
-- Description: Adds currency support, initial purchase date, notes fields, and realized gain/loss tracking

-- ============================================================================
-- ADD CURRENCY FIELDS
-- ============================================================================

-- Add currency to assets table
ALTER TABLE assets 
ADD COLUMN currency TEXT DEFAULT 'USD' NOT NULL;

-- Add currency to transactions table (nullable, can inherit from asset)
ALTER TABLE transactions 
ADD COLUMN currency TEXT;

-- Add base_currency to portfolios table
ALTER TABLE portfolios 
ADD COLUMN base_currency TEXT DEFAULT 'USD' NOT NULL;

-- ============================================================================
-- ADD INITIAL PURCHASE DATE
-- ============================================================================

-- Add initial_purchase_date to assets table for historical tracking
ALTER TABLE assets 
ADD COLUMN initial_purchase_date TIMESTAMPTZ;

-- ============================================================================
-- ADD NOTES FIELDS
-- ============================================================================

-- Add notes field to assets table for user annotations
ALTER TABLE assets 
ADD COLUMN notes TEXT;

-- Add notes field to transactions table for user annotations
ALTER TABLE transactions 
ADD COLUMN notes TEXT;

-- ============================================================================
-- ADD REALIZED GAIN/LOSS TRACKING
-- ============================================================================

-- Add realized_gain_loss to transactions table for SELL transaction tracking
ALTER TABLE transactions 
ADD COLUMN realized_gain_loss NUMERIC(18, 8);

-- Add CHECK constraint to ensure realized_gain_loss can be negative (losses)
-- Note: We allow NULL for BUY transactions and negative values for losses
-- No CHECK constraint needed as NUMERIC allows negative values

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN assets.currency IS 'Currency code for the asset (e.g., USD, TRY, EUR)';
COMMENT ON COLUMN assets.initial_purchase_date IS 'Date when the asset was first purchased (for historical tracking)';
COMMENT ON COLUMN assets.notes IS 'User notes/annotations for the asset';
COMMENT ON COLUMN transactions.currency IS 'Currency code for the transaction (can differ from asset currency)';
COMMENT ON COLUMN transactions.realized_gain_loss IS 'Realized gain (positive) or loss (negative) for SELL transactions';
COMMENT ON COLUMN transactions.notes IS 'User notes/annotations for the transaction';
COMMENT ON COLUMN portfolios.base_currency IS 'Base currency for the portfolio (default: USD)';

