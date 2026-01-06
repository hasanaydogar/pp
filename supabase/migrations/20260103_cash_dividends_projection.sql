-- ============================================================================
-- Migration: Cash, Dividends, and Projection Features
-- Feature: 013-cash-dividends-performance
-- Created: 2026-01-03
-- ============================================================================

-- ============================================================================
-- 1. DIVIDENDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS dividends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- Dividend amounts
  gross_amount DECIMAL(18,4) NOT NULL,
  tax_amount DECIMAL(18,4) DEFAULT 0,
  net_amount DECIMAL(18,4) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  
  -- Dates
  ex_dividend_date DATE,
  payment_date DATE NOT NULL,
  
  -- Reinvestment strategy
  reinvest_strategy VARCHAR(20) DEFAULT 'CASH' CHECK (reinvest_strategy IN ('CASH', 'REINVEST', 'CUSTOM')),
  reinvested_to_asset_id UUID REFERENCES assets(id),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for dividends
CREATE INDEX IF NOT EXISTS idx_dividends_asset ON dividends(asset_id);
CREATE INDEX IF NOT EXISTS idx_dividends_portfolio ON dividends(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_dividends_payment_date ON dividends(payment_date);
CREATE INDEX IF NOT EXISTS idx_dividends_portfolio_payment ON dividends(portfolio_id, payment_date DESC);

-- ============================================================================
-- 2. PORTFOLIO SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL UNIQUE REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- Monthly investment settings
  monthly_investment DECIMAL(18,2) DEFAULT 0,
  investment_day_of_month INTEGER DEFAULT 1 CHECK (investment_day_of_month BETWEEN 1 AND 28),
  
  -- Projection settings
  expected_return_rate DECIMAL(5,4) DEFAULT 0.10, -- 10% annual
  withdrawal_rate DECIMAL(5,4) DEFAULT 0.04, -- 4% rule
  include_dividends_in_projection BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on dividends
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;

-- Dividends policy: Users can only manage dividends in their portfolios
CREATE POLICY "Users can view their dividends"
  ON dividends FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their dividends"
  ON dividends FOR INSERT
  WITH CHECK (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their dividends"
  ON dividends FOR UPDATE
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their dividends"
  ON dividends FOR DELETE
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

-- Enable RLS on portfolio_settings
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;

-- Portfolio settings policy: Users can only manage settings for their portfolios
CREATE POLICY "Users can view their portfolio settings"
  ON portfolio_settings FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their portfolio settings"
  ON portfolio_settings FOR INSERT
  WITH CHECK (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their portfolio settings"
  ON portfolio_settings FOR UPDATE
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their portfolio settings"
  ON portfolio_settings FOR DELETE
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Trigger function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to dividends
DROP TRIGGER IF EXISTS update_dividends_updated_at ON dividends;
CREATE TRIGGER update_dividends_updated_at
  BEFORE UPDATE ON dividends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to portfolio_settings
DROP TRIGGER IF EXISTS update_portfolio_settings_updated_at ON portfolio_settings;
CREATE TRIGGER update_portfolio_settings_updated_at
  BEFORE UPDATE ON portfolio_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. HELPFUL VIEWS (Optional)
-- ============================================================================

-- View for dividend summary by portfolio
CREATE OR REPLACE VIEW dividend_summary_by_portfolio AS
SELECT 
  portfolio_id,
  COUNT(*) as total_dividends,
  SUM(net_amount) as total_net_amount,
  SUM(gross_amount) as total_gross_amount,
  SUM(tax_amount) as total_tax_amount,
  AVG(net_amount) as avg_dividend,
  MAX(payment_date) as last_dividend_date
FROM dividends
GROUP BY portfolio_id;

-- View for monthly dividend totals
CREATE OR REPLACE VIEW dividend_monthly_totals AS
SELECT 
  portfolio_id,
  DATE_TRUNC('month', payment_date) as month,
  COUNT(*) as dividend_count,
  SUM(net_amount) as total_net,
  SUM(gross_amount) as total_gross
FROM dividends
GROUP BY portfolio_id, DATE_TRUNC('month', payment_date)
ORDER BY month DESC;
