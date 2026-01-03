# Specification: Portfolio Tracker Database Schema

<!-- FEATURE_DIR: 002-portfolio-tracker -->
<!-- FEATURE_ID: 002 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2025-11-29T22:00:00.000000 -->

## Description

Set up Supabase database schema for a portfolio tracker application. The schema should support tracking multiple portfolios per user, with assets (stocks, crypto, forex, investment funds) and transactions (buy/sell operations) within each portfolio.

## Requirements

### Functional Requirements

#### Must Have
- [ ] **Portfolio Model**: Each user can have multiple portfolios
  - Fields: `id` (UUID, primary key), `user_id` (UUID, foreign key to auth.users), `name` (string), `created_at` (timestamp)
  - Relationship: Belongs to User (many-to-one)

- [ ] **Asset Model**: Each portfolio can contain multiple assets
  - Fields: `id` (UUID, primary key), `portfolio_id` (UUID, foreign key to portfolios), `symbol` (string), `quantity` (float), `average_buy_price` (float), `type` (enum)
  - Relationship: Belongs to Portfolio (many-to-one)

- [ ] **Asset Type Enum**: Support multiple investment instrument types
  - Values: `STOCK`, `CRYPTO`, `FOREX`, `MUTUAL_FUND`, `ETF`, `BOND`, `COMMODITY`, `REAL_ESTATE`, `DERIVATIVE`, `OTHER`
  - [NEEDS CLARIFICATION: Should we support custom asset types or only predefined enum values?]

- [ ] **Transaction Model**: Each asset can have multiple transactions
  - Fields: `id` (UUID, primary key), `asset_id` (UUID, foreign key to assets), `type` (enum: BUY/SELL), `amount` (float), `price` (float), `date` (timestamp), `transaction_cost` (float, optional)
  - Relationship: Belongs to Asset (many-to-one)

- [ ] **Database Relationships**: Properly defined foreign keys and constraints
  - User → Portfolios (one-to-many)
  - Portfolio → Assets (one-to-many)
  - Asset → Transactions (one-to-many)

- [ ] **Row Level Security (RLS)**: Users can only access their own data
  - RLS policies for portfolios table
  - RLS policies for assets table (via portfolio ownership)
  - RLS policies for transactions table (via asset ownership)

#### Should Have
- [ ] **Indexes**: Optimize query performance
  - Index on `portfolios.user_id`
  - Index on `assets.portfolio_id`
  - Index on `assets.symbol`
  - Index on `transactions.asset_id`
  - Index on `transactions.date`

- [ ] **Timestamps**: Automatic tracking of creation and updates
  - `created_at` timestamp on all tables
  - `updated_at` timestamp on all tables (optional)

- [ ] **Data Validation**: Constraints to ensure data integrity
  - `quantity` must be positive
  - `average_buy_price` must be positive
  - `amount` must be positive
  - `price` must be positive
  - `transaction_cost` must be non-negative

#### Could Have
- [ ] **Soft Deletes**: Support for soft deletion instead of hard deletes
- [ ] **Portfolio Metadata**: Additional fields like description, currency, etc.
- [ ] **Asset Metadata**: Additional fields like company name, exchange, etc.
- [ ] **Transaction Notes**: Optional notes field for transactions

### Non-Functional Requirements

- **Performance**: 
  - Queries should complete within 100ms for typical portfolio sizes (< 100 assets)
  - Support efficient pagination for large transaction lists
  - Indexes should be optimized for common query patterns

- **Security**: 
  - All tables must have RLS enabled
  - Users cannot access other users' portfolios
  - Foreign key constraints prevent orphaned records
  - Input validation prevents SQL injection

- **Scalability**: 
  - Schema should support thousands of portfolios per user
  - Support millions of transactions across all users
  - Efficient querying with proper indexes

- **Data Integrity**:
  - Foreign key constraints ensure referential integrity
  - Check constraints validate data ranges
  - Not null constraints on required fields

## Acceptance Criteria

- [ ] Given a user is authenticated, when they create a portfolio, then a portfolio record is created with their user_id
- [ ] Given a portfolio exists, when a user adds an asset, then an asset record is created linked to that portfolio
- [ ] Given an asset exists, when a user records a transaction, then a transaction record is created linked to that asset
- [ ] Given a user queries their portfolios, then only portfolios belonging to that user are returned
- [ ] Given a user queries assets, then only assets from their portfolios are returned
- [ ] Given a user queries transactions, then only transactions from their assets are returned
- [ ] Given invalid data is provided (negative quantity, null required fields), then the database rejects the insert/update
- [ ] Given a portfolio is deleted, then all associated assets and transactions are handled appropriately (cascade or prevent deletion)
- [ ] Given multiple users have portfolios, then user A cannot access user B's portfolio data
- [ ] Given assets are queried by symbol, then the query uses an index for optimal performance

## Technical Considerations

### Dependencies

- **Database**: Supabase PostgreSQL database
- **Authentication**: Existing Supabase Auth (users table from auth schema)
- **Migration Tool**: Supabase migrations or SQL scripts
- **Type Generation**: Supabase TypeScript types generation

### Database Schema Design

#### Tables Structure

**portfolios**
```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
```

**assets**
```sql
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

CREATE INDEX idx_assets_portfolio_id ON assets(portfolio_id);
CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_type ON assets(type);
```

**transactions**
```sql
CREATE TYPE transaction_type AS ENUM ('BUY', 'SELL');

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

CREATE INDEX idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX idx_transactions_date ON transactions(date);
```

#### Row Level Security Policies

**portfolios RLS**
```sql
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
```

**assets RLS**
```sql
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
```

**transactions RLS**
```sql
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
```

### Implementation Notes

1. **UUID vs Serial IDs**: Using UUIDs for better distributed system support and security (no sequential ID guessing)

2. **Numeric Precision**: Using `NUMERIC(18, 8)` for financial data to ensure precision for crypto and forex values

3. **Cascade Deletes**: Using `ON DELETE CASCADE` to automatically clean up related records when parent is deleted

4. **Unique Constraint**: Assets have unique constraint on `(portfolio_id, symbol, type)` to prevent duplicate assets in same portfolio

5. **RLS Performance**: RLS policies use EXISTS subqueries which can be optimized with proper indexes

6. **Timestamps**: Using `TIMESTAMPTZ` for timezone-aware timestamps

7. **Enum Types**: Using PostgreSQL ENUM types for type safety and validation

8. **Check Constraints**: Using CHECK constraints for data validation at database level

9. **Index Strategy**: 
   - Foreign key columns are indexed for join performance
   - Symbol and date columns are indexed for common query patterns
   - Composite indexes may be needed based on actual query patterns

10. **Migration Strategy**: 
    - Create migration files in Supabase migrations directory
    - Test migrations on development database first
    - Use versioned migrations for rollback capability

### TypeScript Types Generation

After schema is created, generate TypeScript types:
```bash
npx supabase gen types typescript --project-id <project-id> > lib/types/database.ts
```

## Testing Strategy

### Unit Tests
- [ ] Test database schema creation
- [ ] Test enum types are created correctly
- [ ] Test foreign key constraints work
- [ ] Test check constraints reject invalid data
- [ ] Test unique constraints prevent duplicates

### Integration Tests
- [ ] Test RLS policies allow authorized access
- [ ] Test RLS policies deny unauthorized access
- [ ] Test cascade deletes work correctly
- [ ] Test queries with joins perform efficiently
- [ ] Test indexes are used in query plans

### End-to-End Tests
- [ ] Test complete flow: Create portfolio → Add asset → Add transaction
- [ ] Test user isolation: User A cannot access User B's data
- [ ] Test data integrity: Invalid data is rejected
- [ ] Test performance: Queries complete within acceptable time

## Definition of Done

- [ ] Database schema created in Supabase
- [ ] All tables created with correct structure
- [ ] All foreign key relationships defined
- [ ] All indexes created
- [ ] RLS policies implemented and tested
- [ ] Check constraints validate data correctly
- [ ] TypeScript types generated from schema
- [ ] Migration scripts created and tested
- [ ] Documentation updated with schema details
- [ ] Tests written and passing
- [ ] Schema reviewed and approved

## Additional Notes

### Asset Type Enum Rationale

The asset type enum includes:
- **STOCK**: Traditional stocks/shares
- **CRYPTO**: Cryptocurrencies
- **FOREX**: Foreign exchange currencies
- **MUTUAL_FUND**: Mutual funds (including TEFAS funds)
- **ETF**: Exchange-traded funds
- **BOND**: Bonds and fixed income securities
- **COMMODITY**: Commodities (gold, oil, etc.)
- **REAL_ESTATE**: Real estate investments
- **DERIVATIVE**: Derivatives (options, futures, etc.)
- **OTHER**: Other investment instruments not covered above

### Future Considerations

- Consider adding a `currencies` table for multi-currency portfolios
- Consider adding `asset_metadata` table for additional asset information
- Consider adding `portfolio_performance` table for calculated metrics
- Consider adding `asset_prices` table for historical price tracking
- Consider adding soft delete support with `deleted_at` timestamp

### Migration File Structure

Migration files should be created in:
```
supabase/migrations/YYYYMMDDHHMMSS_create_portfolio_schema.sql
```

### Data Validation Examples

- Portfolio name: Required, max 255 characters
- Asset symbol: Required, max 20 characters, uppercase
- Quantity: Must be > 0, precision to 8 decimal places
- Price: Must be > 0, precision to 8 decimal places
- Transaction cost: Must be >= 0, defaults to 0

