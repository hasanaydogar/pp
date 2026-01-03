# Portfolio Tracker Database Schema

## Overview

The portfolio tracker database schema consists of three main tables with hierarchical relationships:
- **User** (auth.users) → **Portfolios** → **Assets** → **Transactions**

## Tables

### portfolios

Stores user portfolios.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique portfolio identifier |
| user_id | UUID | NOT NULL, FK → auth.users | Owner of the portfolio |
| name | TEXT | NOT NULL | Portfolio name |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_portfolios_user_id` on `user_id`

**RLS Policies:**
- Users can view their own portfolios
- Users can create their own portfolios
- Users can update their own portfolios
- Users can delete their own portfolios

### assets

Stores assets (stocks, crypto, etc.) within portfolios.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique asset identifier |
| portfolio_id | UUID | NOT NULL, FK → portfolios | Parent portfolio |
| symbol | TEXT | NOT NULL | Asset symbol (e.g., AAPL, BTC) |
| quantity | NUMERIC(18,8) | NOT NULL, CHECK > 0 | Quantity held |
| average_buy_price | NUMERIC(18,8) | NOT NULL, CHECK > 0 | Average purchase price |
| type | asset_type | NOT NULL | Asset type (ENUM) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Unique Constraint:**
- `(portfolio_id, symbol, type)` - Prevents duplicate assets in same portfolio

**Indexes:**
- `idx_assets_portfolio_id` on `portfolio_id`
- `idx_assets_symbol` on `symbol`
- `idx_assets_type` on `type`

**RLS Policies:**
- Users can view assets in their portfolios
- Users can create assets in their portfolios
- Users can update assets in their portfolios
- Users can delete assets in their portfolios

### transactions

Stores buy/sell transactions for assets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique transaction identifier |
| asset_id | UUID | NOT NULL, FK → assets | Parent asset |
| type | transaction_type | NOT NULL | Transaction type (BUY/SELL) |
| amount | NUMERIC(18,8) | NOT NULL, CHECK > 0 | Transaction amount |
| price | NUMERIC(18,8) | NOT NULL, CHECK > 0 | Transaction price |
| date | TIMESTAMPTZ | NOT NULL | Transaction date |
| transaction_cost | NUMERIC(18,8) | DEFAULT 0, CHECK >= 0 | Additional transaction costs |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_transactions_asset_id` on `asset_id`
- `idx_transactions_date` on `date`

**RLS Policies:**
- Users can view transactions for their assets
- Users can create transactions for their assets
- Users can update transactions for their assets
- Users can delete transactions for their assets

## ENUM Types

### asset_type

Investment instrument types:
- `STOCK` - Traditional stocks/shares
- `CRYPTO` - Cryptocurrencies
- `FOREX` - Foreign exchange currencies
- `MUTUAL_FUND` - Mutual funds (including TEFAS funds)
- `ETF` - Exchange-traded funds
- `BOND` - Bonds and fixed income securities
- `COMMODITY` - Commodities (gold, oil, etc.)
- `REAL_ESTATE` - Real estate investments
- `DERIVATIVE` - Derivatives (options, futures, etc.)
- `OTHER` - Other investment instruments

### transaction_type

Transaction types:
- `BUY` - Purchase transaction
- `SELL` - Sale transaction

## Relationships

```
auth.users (1) ──→ (many) portfolios
portfolios (1) ──→ (many) assets
assets (1) ──→ (many) transactions
```

All relationships use `ON DELETE CASCADE` to automatically clean up related records.

## Constraints

### CHECK Constraints

- `assets.quantity > 0` - Quantity must be positive
- `assets.average_buy_price > 0` - Price must be positive
- `transactions.amount > 0` - Amount must be positive
- `transactions.price > 0` - Price must be positive
- `transactions.transaction_cost >= 0` - Transaction cost must be non-negative

### UNIQUE Constraints

- `assets(portfolio_id, symbol, type)` - Prevents duplicate assets in same portfolio

### Foreign Key Constraints

- `portfolios.user_id` → `auth.users(id)` CASCADE
- `assets.portfolio_id` → `portfolios(id)` CASCADE
- `transactions.asset_id` → `assets(id)` CASCADE

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only access their own portfolios
- Users can only access assets in their portfolios
- Users can only access transactions for their assets

RLS policies use `auth.uid()` to identify the current user and EXISTS subqueries to check ownership through the relationship hierarchy.

## Performance Considerations

- Indexes on foreign keys for efficient joins
- Indexes on commonly queried columns (symbol, date)
- RLS policies optimized with EXISTS subqueries
- NUMERIC(18,8) precision for financial data

## Example Queries

### Get all portfolios for a user
```sql
SELECT * FROM portfolios WHERE user_id = auth.uid();
```

### Get all assets in a portfolio
```sql
SELECT * FROM assets WHERE portfolio_id = 'portfolio-id';
```

### Get all transactions for an asset
```sql
SELECT * FROM transactions WHERE asset_id = 'asset-id' ORDER BY date DESC;
```

### Get portfolio with assets and transaction count
```sql
SELECT 
  p.*,
  COUNT(DISTINCT a.id) as asset_count,
  COUNT(DISTINCT t.id) as transaction_count
FROM portfolios p
LEFT JOIN assets a ON a.portfolio_id = p.id
LEFT JOIN transactions t ON t.asset_id = a.id
WHERE p.user_id = auth.uid()
GROUP BY p.id;
```

