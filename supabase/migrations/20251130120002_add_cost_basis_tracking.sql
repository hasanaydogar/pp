-- Enhanced Portfolio Tracker: Cost Basis Tracking Migration
-- Created: 2025-11-30
-- Description: Creates cost_basis_lots table for FIFO cost basis tracking

-- ============================================================================
-- COST BASIS LOTS TABLE
-- ============================================================================

-- Create cost_basis_lots table for FIFO cost basis tracking
CREATE TABLE cost_basis_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  purchase_transaction_id UUID NOT NULL REFERENCES transactions(id),
  quantity NUMERIC(18, 8) NOT NULL CHECK (quantity > 0),
  cost_basis NUMERIC(18, 8) NOT NULL CHECK (cost_basis > 0),
  remaining_quantity NUMERIC(18, 8) NOT NULL CHECK (remaining_quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for efficient querying by asset_id
CREATE INDEX idx_cost_basis_lots_asset_id ON cost_basis_lots(asset_id);

-- Index for efficient querying by purchase_transaction_id
CREATE INDEX idx_cost_basis_lots_purchase_transaction_id ON cost_basis_lots(purchase_transaction_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on cost_basis_lots
ALTER TABLE cost_basis_lots ENABLE ROW LEVEL SECURITY;

-- Users can view cost basis lots for their assets
CREATE POLICY "Users can view cost basis lots for their assets"
  ON cost_basis_lots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = cost_basis_lots.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Users can create cost basis lots for their assets
CREATE POLICY "Users can create cost basis lots for their assets"
  ON cost_basis_lots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = cost_basis_lots.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Users can update cost basis lots for their assets
CREATE POLICY "Users can update cost basis lots for their assets"
  ON cost_basis_lots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = cost_basis_lots.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Users can delete cost basis lots for their assets
CREATE POLICY "Users can delete cost basis lots for their assets"
  ON cost_basis_lots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = cost_basis_lots.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE cost_basis_lots IS 'Tracks cost basis lots for FIFO cost basis calculation';
COMMENT ON COLUMN cost_basis_lots.asset_id IS 'Reference to the asset this lot belongs to';
COMMENT ON COLUMN cost_basis_lots.purchase_transaction_id IS 'Reference to the BUY transaction that created this lot';
COMMENT ON COLUMN cost_basis_lots.quantity IS 'Original quantity purchased in this lot';
COMMENT ON COLUMN cost_basis_lots.cost_basis IS 'Total cost basis for this lot (quantity * price)';
COMMENT ON COLUMN cost_basis_lots.remaining_quantity IS 'Remaining quantity in this lot after SELL transactions';

