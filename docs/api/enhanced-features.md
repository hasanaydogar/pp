# Enhanced Portfolio Tracker Features

This document describes the enhanced features added to the Portfolio Tracker API.

## Overview

Enhanced features include:
- Historical data import
- Multi-currency support
- SELL transaction quantity reduction
- Cost basis tracking (FIFO)
- Benchmark comparison
- Advanced analytics

## Historical Import

### Asset Import from Transactions

Create an asset by importing historical transactions. The system calculates initial quantity and average buy price automatically.

**Endpoint:** `POST /api/portfolios/[id]/assets/import`

**Features:**
- Processes transactions chronologically
- Calculates running quantity and average price
- Supports both BUY and SELL transactions
- Validates transaction dates (no future dates)
- Handles out-of-order transactions with warnings

### Bulk Transaction Import

Import multiple historical transactions for an existing asset.

**Endpoint:** `POST /api/assets/[id]/transactions/import`

**Features:**
- Bulk import up to 1000 transactions
- Automatic sorting by date
- Incremental asset updates
- Error handling for invalid data

## SELL Transaction Enhancement

### Automatic Quantity Reduction

When a SELL transaction is created, the asset quantity is automatically reduced.

**Features:**
- Quantity validation (ensures sufficient quantity)
- Realized gain/loss calculation
- Asset quantity updated atomically
- Zero quantity handling (asset kept for history)

**Example:**
```json
{
  "asset_id": "uuid",
  "type": "SELL",
  "amount": 5,
  "price": 160.00,
  "date": "2025-01-01T00:00:00Z"
}
```

After this transaction:
- Asset quantity reduced by 5
- Realized gain/loss calculated and stored
- Transaction includes `realized_gain_loss` field

## Currency Support

### Multi-Currency Assets

Assets can be created with different currencies.

**Supported Currencies:**
- USD (default)
- TRY, EUR, GBP, JPY, CNY, CHF, CAD, AUD, NZD
- And more (see `lib/types/currency.ts`)

**Features:**
- Currency validation
- Default currency (USD) if not specified
- Portfolio base currency
- Transaction currency (can differ from asset currency)

## Cost Basis Tracking

### FIFO Method

First In First Out cost basis tracking for accurate tax reporting.

**Endpoint:** `GET /api/assets/[id]/cost-basis`

**Features:**
- Tracks cost basis per lot
- Oldest lots sold first
- Automatic lot management
- Fallback to Average Cost if no lots exist

**Cost Basis Lots:**
- Created automatically for BUY transactions
- Updated automatically for SELL transactions
- Tracks remaining quantity per lot

## Benchmark Comparison

### Portfolio vs Benchmark

Compare portfolio performance against benchmarks like BIST100, SP500, etc.

**Endpoint:** `GET /api/portfolios/[id]/benchmark-comparison`

**Features:**
- Portfolio performance calculation
- Benchmark symbol storage
- Relative performance calculation (placeholder for future external API)

**Note:** Benchmark data fetching from external APIs is planned for future implementation.

## Analytics

### Portfolio Analytics

Comprehensive portfolio analytics including value, performance, and allocation.

**Endpoint:** `GET /api/portfolios/[id]/analytics`

**Metrics:**
- Total portfolio value
- Total invested
- Total gain/loss
- Performance percentage
- Asset allocation breakdown

### Asset Performance

Detailed asset performance metrics.

**Endpoint:** `GET /api/assets/[id]/performance`

**Metrics:**
- Current value
- Total invested
- Realized gain/loss
- Unrealized gain/loss
- Total gain/loss
- Performance percentage

### Transaction Analytics

Transaction history analysis and patterns.

**Endpoint:** `GET /api/portfolios/[id]/transactions/analytics`

**Metrics:**
- Total transactions
- Buy/sell counts
- Total buy/sell values
- Realized gain/loss
- Monthly transaction patterns

## Database Schema Updates

### New Fields

**Assets:**
- `currency` (TEXT, default: 'USD')
- `initial_purchase_date` (TIMESTAMPTZ, nullable)
- `notes` (TEXT, nullable)

**Transactions:**
- `currency` (TEXT, nullable)
- `realized_gain_loss` (NUMERIC(18,8), nullable)
- `notes` (TEXT, nullable)

**Portfolios:**
- `base_currency` (TEXT, default: 'USD')
- `benchmark_symbol` (TEXT, nullable)

### New Tables

**cost_basis_lots:**
- Tracks cost basis per lot for FIFO calculation
- Links to assets and purchase transactions
- Tracks remaining quantity per lot

## Migration Guide

See `docs/database/migration-test-guide-enhanced.md` for detailed migration instructions.

## Backward Compatibility

All changes maintain backward compatibility:
- New fields have default values
- Existing endpoints continue to work
- Optional fields don't break existing code
- Default currency (USD) applied automatically

## Future Enhancements

Planned features:
- External benchmark data API integration
- Currency conversion API
- Real-time price data
- Advanced reporting and charts
- Export functionality (CSV, PDF)

