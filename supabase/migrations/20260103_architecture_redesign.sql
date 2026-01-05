-- Portfolio Architecture Redesign Migration
-- Feature: 011-architecture-redesign
-- Created: 2026-01-03
-- Description: Adds portfolio types, policies, cash management, sectors, and asset metadata

-- ============================================================================
-- PORTFOLIO TYPES (Kullanıcı Tanımlı Portfolyo Türleri)
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- ============================================================================
-- PORTFOLIO POLICIES (Yatırım Kuralları)
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- Per Stock Limits
  max_weight_per_stock NUMERIC(5, 4) DEFAULT 0.12,
  
  -- Position Categories
  core_min_weight NUMERIC(5, 4) DEFAULT 0.08,
  core_max_weight NUMERIC(5, 4) DEFAULT 0.12,
  satellite_min_weight NUMERIC(5, 4) DEFAULT 0.01,
  satellite_max_weight NUMERIC(5, 4) DEFAULT 0.05,
  new_position_min_weight NUMERIC(5, 4) DEFAULT 0.005,
  new_position_max_weight NUMERIC(5, 4) DEFAULT 0.02,
  
  -- Sector Limits
  max_weight_per_sector NUMERIC(5, 4) DEFAULT 0.25,
  
  -- Cash Management
  cash_min_percent NUMERIC(5, 4) DEFAULT 0.05,
  cash_max_percent NUMERIC(5, 4) DEFAULT 0.10,
  cash_target_percent NUMERIC(5, 4) DEFAULT 0.07,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(portfolio_id)
);

-- ============================================================================
-- CASH POSITIONS (Nakit Takibi)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cash_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT 'TRY',
  amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  UNIQUE(portfolio_id, currency)
);

-- ============================================================================
-- CASH TRANSACTIONS (Nakit Hareketleri)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_position_id UUID NOT NULL REFERENCES cash_positions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAW', 'BUY_ASSET', 'SELL_ASSET', 'DIVIDEND', 'FEE')),
  amount NUMERIC(18, 2) NOT NULL,
  related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTORS (Global Sektör Tanımları)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ASSET METADATA (Varlık Ek Bilgileri)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  
  -- Sector Info (from API)
  sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  api_sector TEXT,
  
  -- Manual Overrides
  manual_sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  manual_name TEXT,
  
  -- Position Category
  auto_category TEXT CHECK (auto_category IN ('CORE', 'SATELLITE', 'NEW')),
  manual_category TEXT CHECK (manual_category IN ('CORE', 'SATELLITE', 'NEW')),
  
  -- Additional Info
  isin TEXT,
  exchange TEXT,
  country TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(asset_id)
);

-- ============================================================================
-- PORTFOLIOS TABLE UPDATES
-- ============================================================================

ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS portfolio_type_id UUID REFERENCES portfolio_types(id) ON DELETE SET NULL;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS target_value NUMERIC(18, 2);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_portfolio_types_user_id ON portfolio_types(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_policies_portfolio_id ON portfolio_policies(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_cash_positions_portfolio_id ON cash_positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_cash_position_id ON cash_transactions(cash_position_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date ON cash_transactions(date);
CREATE INDEX IF NOT EXISTS idx_asset_metadata_asset_id ON asset_metadata(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_metadata_sector_id ON asset_metadata(sector_id);

-- ============================================================================
-- ROW LEVEL SECURITY - PORTFOLIO TYPES
-- ============================================================================

ALTER TABLE portfolio_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolio types"
  ON portfolio_types FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio types"
  ON portfolio_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio types"
  ON portfolio_types FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio types"
  ON portfolio_types FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ROW LEVEL SECURITY - PORTFOLIO POLICIES
-- ============================================================================

ALTER TABLE portfolio_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view policies for their portfolios"
  ON portfolio_policies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_policies.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create policies for their portfolios"
  ON portfolio_policies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_policies.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update policies for their portfolios"
  ON portfolio_policies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_policies.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete policies for their portfolios"
  ON portfolio_policies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_policies.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ROW LEVEL SECURITY - CASH POSITIONS
-- ============================================================================

ALTER TABLE cash_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cash positions for their portfolios"
  ON cash_positions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = cash_positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cash positions for their portfolios"
  ON cash_positions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = cash_positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cash positions for their portfolios"
  ON cash_positions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = cash_positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cash positions for their portfolios"
  ON cash_positions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = cash_positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ROW LEVEL SECURITY - CASH TRANSACTIONS
-- ============================================================================

ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cash transactions for their portfolios"
  ON cash_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cash_positions
      JOIN portfolios ON portfolios.id = cash_positions.portfolio_id
      WHERE cash_positions.id = cash_transactions.cash_position_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cash transactions for their portfolios"
  ON cash_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cash_positions
      JOIN portfolios ON portfolios.id = cash_positions.portfolio_id
      WHERE cash_positions.id = cash_transactions.cash_position_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cash transactions for their portfolios"
  ON cash_transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM cash_positions
      JOIN portfolios ON portfolios.id = cash_positions.portfolio_id
      WHERE cash_positions.id = cash_transactions.cash_position_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cash transactions for their portfolios"
  ON cash_transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM cash_positions
      JOIN portfolios ON portfolios.id = cash_positions.portfolio_id
      WHERE cash_positions.id = cash_transactions.cash_position_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ROW LEVEL SECURITY - SECTORS (Public Read)
-- ============================================================================

ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view sectors"
  ON sectors FOR SELECT
  USING (true);

-- ============================================================================
-- ROW LEVEL SECURITY - ASSET METADATA
-- ============================================================================

ALTER TABLE asset_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metadata for their assets"
  ON asset_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = asset_metadata.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create metadata for their assets"
  ON asset_metadata FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = asset_metadata.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update metadata for their assets"
  ON asset_metadata FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = asset_metadata.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete metadata for their assets"
  ON asset_metadata FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = asset_metadata.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SEED DATA - DEFAULT SECTORS
-- ============================================================================

INSERT INTO sectors (name, display_name, color) VALUES
  ('technology', 'Teknoloji', '#3B82F6'),
  ('finance', 'Finans', '#10B981'),
  ('healthcare', 'Sağlık', '#EF4444'),
  ('energy', 'Enerji', '#F59E0B'),
  ('consumer', 'Tüketici', '#8B5CF6'),
  ('industrial', 'Sanayi', '#6B7280'),
  ('materials', 'Hammadde', '#EC4899'),
  ('utilities', 'Kamu Hizmetleri', '#14B8A6'),
  ('real_estate', 'Gayrimenkul', '#F97316'),
  ('communication', 'İletişim', '#06B6D4')
ON CONFLICT (name) DO NOTHING;
