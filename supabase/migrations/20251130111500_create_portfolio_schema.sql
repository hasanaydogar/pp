-- Portfolio Tracker Database Schema Migration
-- Created: 2025-11-30
-- Description: Creates tables, ENUMs, constraints, indexes, and RLS policies for portfolio tracker

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Asset Type Enum
CREATE TYPE asset_type AS ENUM (
  'STOCK',
  'CRYPTO',
  'FOREX',
  'MUTUAL_FUND',
  'ETF',
  'BOND',
  'COMMODITY',
  'REAL_ESTATE',
  'DERIVATIVE',
  'OTHER'
);

-- Transaction Type Enum
CREATE TYPE transaction_type AS ENUM ('BUY', 'SELL');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Portfolios Table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets Table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity NUMERIC(18, 8) NOT NULL CHECK (quantity > 0),
  average_buy_price NUMERIC(18, 8) NOT NULL CHECK (average_buy_price > 0),
  type asset_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portfolio_id, symbol, type)
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount NUMERIC(18, 8) NOT NULL CHECK (amount > 0),
  price NUMERIC(18, 8) NOT NULL CHECK (price > 0),
  date TIMESTAMPTZ NOT NULL,
  transaction_cost NUMERIC(18, 8) DEFAULT 0 CHECK (transaction_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Indexes for portfolios
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);

-- Indexes for assets
CREATE INDEX idx_assets_portfolio_id ON assets(portfolio_id);
CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_type ON assets(type);

-- Indexes for transactions
CREATE INDEX idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on portfolios
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assets in their portfolios"
  ON assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = assets.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assets in their portfolios"
  ON assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = assets.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assets in their portfolios"
  ON assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = assets.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete assets in their portfolios"
  ON assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = assets.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions for their assets"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = transactions.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions for their assets"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = transactions.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions for their assets"
  ON transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = transactions.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions for their assets"
  ON transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = transactions.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

