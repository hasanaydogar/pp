# Specification: Enhanced Portfolio Tracker Features

<!-- FEATURE_DIR: 002-portfolio-tracker -->
<!-- FEATURE_ID: 002 -->
<!-- SPEC_NUMBER: 003 -->
<!-- STATUS: pending -->
<!-- CREATED: 2025-11-30T14:00:00.000000 -->
<!-- RELATED_SPEC: spec-001.md, spec-002.md -->

## Description

Enhance the Portfolio Tracker API with advanced features for professional portfolio management including historical data import, currency support, benchmark comparisons, cost basis tracking, and improved transaction handling.

## Context

This specification builds upon **spec-001.md** (Database Schema) and **spec-002.md** (API Development). Current implementation has basic CRUD operations but lacks:
- Historical asset import capabilities
- Currency support for multi-currency portfolios
- SELL transaction quantity reduction
- Benchmark comparison features
- Cost basis tracking
- Bulk operations

## Requirements

### Functional Requirements

#### Must Have

##### 1. Historical Asset Import

- [ ] **Bulk Transaction Import**
  - Import multiple historical transactions at once
  - Create asset from historical transactions
  - Calculate initial quantity and average buy price from transactions
  - Support for transactions with different dates
  - Endpoint: `POST /api/portfolios/[id]/assets/import`

- [ ] **Asset Creation with Initial Date**
  - Create asset with initial purchase date
  - Support for backdating assets
  - Endpoint: `POST /api/portfolios/[id]/assets` (enhanced)
  - New field: `initial_purchase_date` (optional, defaults to now)

- [ ] **Transaction History Import**
  - Import CSV/JSON transaction history
  - Validate and create multiple transactions
  - Update asset quantities and prices automatically
  - Endpoint: `POST /api/assets/[id]/transactions/import`

##### 2. Enhanced Transaction Handling

- [ ] **SELL Transaction Quantity Reduction**
  - When SELL transaction is created, reduce asset quantity
  - Validate sufficient quantity before selling
  - Calculate realized gain/loss
  - Update asset quantity atomically
  - Business logic: `newQuantity = oldQuantity - transactionAmount`

- [ ] **Transaction Date Validation**
  - Ensure transaction dates are logical (not in future)
  - Support historical transaction dates
  - Validate date order (optional: warn if out of order)

- [ ] **Cost Basis Tracking**
  - Track cost basis per transaction
  - Calculate total cost basis for asset
  - Support FIFO, LIFO, Average Cost methods
  - Endpoint: `GET /api/assets/[id]/cost-basis`

##### 3. Currency Support

- [ ] **Multi-Currency Assets**
  - Add `currency` field to assets table
  - Support currencies: USD, TRY, EUR, GBP, etc.
  - Default currency: USD
  - Currency validation

- [ ] **Multi-Currency Transactions**
  - Add `currency` field to transactions table
  - Transaction currency can differ from asset currency
  - Currency conversion support (future)

- [ ] **Portfolio Currency**
  - Add `base_currency` field to portfolios table
  - Portfolio-level currency setting
  - Currency conversion for portfolio value

##### 4. Benchmark Comparison

- [ ] **Benchmark Reference**
  - Add `benchmark_symbol` field to portfolios table
  - Support benchmarks: BIST100, XAUUSD (Gold), SP500, etc.
  - Store benchmark symbol as string

- [ ] **Benchmark Comparison Endpoint**
  - Compare portfolio performance vs benchmark
  - Calculate relative performance
  - Endpoint: `GET /api/portfolios/[id]/benchmark-comparison`

#### Should Have

##### 5. Advanced Analytics

- [ ] **Portfolio Analytics**
  - Total portfolio value calculation
  - Portfolio performance metrics (gain/loss, ROI)
  - Asset allocation breakdown
  - Endpoint: `GET /api/portfolios/[id]/analytics`

- [ ] **Asset Performance**
  - Asset performance metrics
  - Realized vs unrealized gains
  - Performance over time
  - Endpoint: `GET /api/assets/[id]/performance`

- [ ] **Transaction Analytics**
  - Transaction history analysis
  - Buy/sell patterns
  - Cost basis analysis
  - Endpoint: `GET /api/portfolios/[id]/transactions/analytics`

##### 6. Bulk Operations

- [ ] **Bulk Transaction Creation**
  - Create multiple transactions in one request
  - Validate all transactions before creating
  - Atomic operation (all or nothing)
  - Endpoint: `POST /api/assets/[id]/transactions/bulk`

- [ ] **Bulk Asset Update**
  - Update multiple assets at once
  - Useful for price updates
  - Endpoint: `PUT /api/portfolios/[id]/assets/bulk`

#### Nice to Have

##### 7. External Data Integration

- [ ] **Price Data Integration**
  - Real-time price fetching (future)
  - Historical price data
  - Price update endpoints

- [ ] **Currency Exchange Rates**
  - Real-time exchange rates
  - Historical exchange rates
  - Currency conversion API

### Technical Requirements

#### Database Schema Updates

##### 1. Assets Table Enhancements

```sql
ALTER TABLE assets ADD COLUMN currency TEXT DEFAULT 'USD';
ALTER TABLE assets ADD COLUMN initial_purchase_date TIMESTAMPTZ;
ALTER TABLE assets ADD COLUMN notes TEXT;
```

##### 2. Transactions Table Enhancements

```sql
ALTER TABLE transactions ADD COLUMN currency TEXT;
ALTER TABLE transactions ADD COLUMN realized_gain_loss NUMERIC(18, 8);
ALTER TABLE transactions ADD COLUMN notes TEXT;
```

##### 3. Portfolios Table Enhancements

```sql
ALTER TABLE portfolios ADD COLUMN base_currency TEXT DEFAULT 'USD';
ALTER TABLE portfolios ADD COLUMN benchmark_symbol TEXT;
```

##### 4. New Tables

- [ ] **currency_rates** table (for exchange rates)
- [ ] **benchmark_data** table (for benchmark prices)

#### API Endpoint Updates

##### Enhanced Endpoints

- [ ] `POST /api/portfolios/[id]/assets` - Add `initial_purchase_date`, `currency`
- [ ] `POST /api/assets/[id]/transactions` - Add SELL quantity reduction, `currency`
- [ ] `GET /api/assets/[id]` - Include currency, cost basis info

##### New Endpoints

- [ ] `POST /api/portfolios/[id]/assets/import` - Bulk import historical assets
- [ ] `POST /api/assets/[id]/transactions/import` - Bulk import transactions
- [ ] `POST /api/assets/[id]/transactions/bulk` - Create multiple transactions
- [ ] `GET /api/assets/[id]/cost-basis` - Get cost basis information
- [ ] `GET /api/assets/[id]/performance` - Get asset performance metrics
- [ ] `GET /api/portfolios/[id]/analytics` - Get portfolio analytics
- [ ] `GET /api/portfolios/[id]/benchmark-comparison` - Compare vs benchmark
- [ ] `GET /api/portfolios/[id]/transactions/analytics` - Transaction analytics

#### Business Logic Updates

##### 1. SELL Transaction Logic

```typescript
// When SELL transaction is created:
// 1. Validate sufficient quantity
if (asset.quantity < transaction.amount) {
  throw new Error('Insufficient quantity');
}

// 2. Calculate realized gain/loss
const costBasis = asset.average_buy_price * transaction.amount;
const saleValue = transaction.price * transaction.amount;
const realizedGainLoss = saleValue - costBasis;

// 3. Update asset quantity
const newQuantity = asset.quantity - transaction.amount;

// 4. If quantity becomes zero, optionally delete asset or keep for history
```

##### 2. Historical Import Logic

```typescript
// When importing historical transactions:
// 1. Sort transactions by date (oldest first)
// 2. Process each transaction chronologically
// 3. Calculate running quantity and average price
// 4. Create asset with final calculated values
```

##### 3. Cost Basis Calculation

```typescript
// FIFO Method:
// - First transactions sold first
// - Track cost basis per lot

// Average Cost Method:
// - Use average_buy_price for all sales
// - Simpler but less accurate for tax purposes
```

## Database Migration Plan

### Migration 1: Currency Support

```sql
-- Add currency to assets
ALTER TABLE assets 
ADD COLUMN currency TEXT DEFAULT 'USD' NOT NULL;

-- Add currency to transactions
ALTER TABLE transactions 
ADD COLUMN currency TEXT;

-- Add base_currency to portfolios
ALTER TABLE portfolios 
ADD COLUMN base_currency TEXT DEFAULT 'USD' NOT NULL;

-- Add initial_purchase_date to assets
ALTER TABLE assets 
ADD COLUMN initial_purchase_date TIMESTAMPTZ;

-- Add notes fields
ALTER TABLE assets ADD COLUMN notes TEXT;
ALTER TABLE transactions ADD COLUMN notes TEXT;
```

### Migration 2: Benchmark Support

```sql
-- Add benchmark_symbol to portfolios
ALTER TABLE portfolios 
ADD COLUMN benchmark_symbol TEXT;

-- Create benchmark_data table (optional, for future)
CREATE TABLE IF NOT EXISTS benchmark_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  date DATE NOT NULL,
  price NUMERIC(18, 8) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(symbol, date)
);
```

### Migration 3: Cost Basis Tracking

```sql
-- Add realized_gain_loss to transactions
ALTER TABLE transactions 
ADD COLUMN realized_gain_loss NUMERIC(18, 8);

-- Create cost_basis_lots table (for FIFO tracking)
CREATE TABLE IF NOT EXISTS cost_basis_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  purchase_transaction_id UUID NOT NULL REFERENCES transactions(id),
  quantity NUMERIC(18, 8) NOT NULL CHECK (quantity > 0),
  cost_basis NUMERIC(18, 8) NOT NULL CHECK (cost_basis > 0),
  remaining_quantity NUMERIC(18, 8) NOT NULL CHECK (remaining_quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cost_basis_lots_asset_id ON cost_basis_lots(asset_id);
```

## Implementation Phases

### Phase 1: Database Schema Updates [Priority: HIGH]
- Add currency fields
- Add initial_purchase_date
- Add benchmark_symbol
- Add notes fields
- Create cost_basis_lots table

### Phase 2: SELL Transaction Enhancement [Priority: HIGH]
- Implement quantity reduction for SELL
- Add realized gain/loss calculation
- Validate sufficient quantity
- Update business logic

### Phase 3: Historical Import [Priority: HIGH]
- Bulk transaction import endpoint
- Asset creation from transactions
- Historical date support
- Validation and error handling

### Phase 4: Currency Support [Priority: MEDIUM]
- Currency validation
- Multi-currency asset support
- Portfolio base currency
- Currency conversion (future)

### Phase 5: Cost Basis Tracking [Priority: MEDIUM]
- FIFO cost basis calculation
- Average cost method
- Cost basis endpoints
- Realized gain/loss tracking

### Phase 6: Benchmark Comparison [Priority: MEDIUM]
- Benchmark symbol storage
- Benchmark comparison logic
- Performance comparison endpoints

### Phase 7: Analytics Endpoints [Priority: LOW]
- Portfolio analytics
- Asset performance metrics
- Transaction analytics

## Success Criteria

- [ ] SELL transactions reduce asset quantity
- [ ] Historical transactions can be imported
- [ ] Assets can be created with initial purchase date
- [ ] Multi-currency support implemented
- [ ] Cost basis tracking working
- [ ] Benchmark comparison available
- [ ] All existing functionality still works
- [ ] Backward compatibility maintained

## Related Specifications

- **spec-001.md**: Portfolio Tracker Database Schema (prerequisite)
- **spec-002.md**: Portfolio Tracker API Development (prerequisite)

## Notes

- All changes must maintain backward compatibility
- Existing API endpoints should continue to work
- New fields should have sensible defaults
- Migration scripts must be tested thoroughly
- RLS policies need to be updated for new fields

