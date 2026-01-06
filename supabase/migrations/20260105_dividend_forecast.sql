-- ============================================================================
-- Migration: Dividend Forecast Support
-- Feature: 016-cash-dividend-bugfix-refactoring
-- Created: 2026-01-05
-- ============================================================================

-- First, drop the view that depends on source column
DROP VIEW IF EXISTS dividend_summary_by_source;

-- Expand source column to accommodate longer values like 'MANUAL_FORECAST'
ALTER TABLE dividends 
ALTER COLUMN source TYPE VARCHAR(20);

-- Recreate the view
CREATE OR REPLACE VIEW dividend_summary_by_source AS
SELECT 
  portfolio_id,
  source,
  COUNT(*) as dividend_count,
  SUM(gross_amount) as total_gross,
  SUM(net_amount) as total_net,
  SUM(tax_amount) as total_tax
FROM dividends
GROUP BY portfolio_id, source;

-- Add is_forecast column to dividends table
-- This marks entries that are expectations, not realized dividends
ALTER TABLE dividends 
ADD COLUMN IF NOT EXISTS is_forecast BOOLEAN DEFAULT FALSE;

-- Add merged_from_id for conflict tracking
-- When a forecast is merged with actual data, this references the original forecast
ALTER TABLE dividends 
ADD COLUMN IF NOT EXISTS merged_from_id UUID REFERENCES dividends(id) ON DELETE SET NULL;

-- Add expected_payment_date for forecasts (optional, for date flexibility)
ALTER TABLE dividends 
ADD COLUMN IF NOT EXISTS expected_date_min DATE;

ALTER TABLE dividends 
ADD COLUMN IF NOT EXISTS expected_date_max DATE;

-- Create index for forecast queries
CREATE INDEX IF NOT EXISTS idx_dividends_is_forecast 
ON dividends(is_forecast) 
WHERE is_forecast = TRUE;

-- Create index for finding forecasts by asset and date range (for conflict detection)
CREATE INDEX IF NOT EXISTS idx_dividends_forecast_conflict_check
ON dividends(asset_id, payment_date)
WHERE is_forecast = TRUE;

-- Update existing manual dividends to have is_forecast = false explicitly
UPDATE dividends 
SET is_forecast = FALSE 
WHERE is_forecast IS NULL;

-- Comment for documentation
COMMENT ON COLUMN dividends.is_forecast IS 'True if this is a user-entered forecast, false if realized dividend';
COMMENT ON COLUMN dividends.merged_from_id IS 'References original forecast when merged with actual dividend data';
COMMENT ON COLUMN dividends.expected_date_min IS 'Earliest expected payment date for forecast (optional)';
COMMENT ON COLUMN dividends.expected_date_max IS 'Latest expected payment date for forecast (optional)';
