-- ============================================================================
-- Migration: Daily Performance Tracking
-- Feature: 014-daily-performance-tracking
-- Created: 2026-01-03
-- ============================================================================

-- ============================================================================
-- 1. PORTFOLIO SNAPSHOTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  
  -- Values
  total_value DECIMAL(18,2) NOT NULL,
  assets_value DECIMAL(18,2) NOT NULL,
  cash_value DECIMAL(18,2) NOT NULL,
  
  -- Daily changes
  daily_change DECIMAL(18,2) DEFAULT 0,
  daily_change_percent DECIMAL(8,4) DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one snapshot per portfolio per day
  UNIQUE(portfolio_id, snapshot_date)
);

-- Indexes for portfolio_snapshots
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_portfolio ON portfolio_snapshots(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON portfolio_snapshots(portfolio_id, snapshot_date DESC);

-- ============================================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on portfolio_snapshots
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Snapshots policy: Users can only manage snapshots for their portfolios
CREATE POLICY "Users can view their portfolio snapshots"
  ON portfolio_snapshots FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their portfolio snapshots"
  ON portfolio_snapshots FOR INSERT
  WITH CHECK (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their portfolio snapshots"
  ON portfolio_snapshots FOR UPDATE
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their portfolio snapshots"
  ON portfolio_snapshots FOR DELETE
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. HELPFUL VIEWS
-- ============================================================================

-- View for latest snapshot per portfolio
CREATE OR REPLACE VIEW latest_portfolio_snapshots AS
SELECT DISTINCT ON (portfolio_id)
  id,
  portfolio_id,
  snapshot_date,
  total_value,
  assets_value,
  cash_value,
  daily_change,
  daily_change_percent,
  created_at
FROM portfolio_snapshots
ORDER BY portfolio_id, snapshot_date DESC;

-- View for performance summary (last 30 days)
CREATE OR REPLACE VIEW portfolio_performance_30d AS
SELECT 
  portfolio_id,
  COUNT(*) as snapshot_count,
  MIN(total_value) as min_value,
  MAX(total_value) as max_value,
  FIRST_VALUE(total_value) OVER (PARTITION BY portfolio_id ORDER BY snapshot_date ASC) as start_value,
  LAST_VALUE(total_value) OVER (PARTITION BY portfolio_id ORDER BY snapshot_date ASC 
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as end_value,
  SUM(daily_change) as total_change,
  AVG(daily_change_percent) as avg_daily_change_percent
FROM portfolio_snapshots
WHERE snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY portfolio_id, total_value, snapshot_date;
