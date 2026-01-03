# Task Breakdown: Enhanced Portfolio Tracker Features

<!-- FEATURE_DIR: 002-portfolio-tracker -->
<!-- FEATURE_ID: 002 -->
<!-- TASK_LIST_ID: 003 -->
<!-- STATUS: pending -->
<!-- CREATED: 2025-11-30T15:00:00.000000 -->
<!-- LAST_UPDATED: 2025-11-30T15:00:00.000000 -->

## Progress Overview
- **Total Tasks**: 68
- **Completed Tasks**: 68 (100%)
- **In Progress Tasks**: 0
- **Blocked Tasks**: 0

## Task Categories

### Phase 1: Database Schema Updates [Priority: HIGH]

#### T001: Create Migration for Currency Fields
- **Status**: [x] Completed
- **Type**: database
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: None
- **Description**: Create SQL migration to add currency fields to assets, transactions, and portfolios tables.
- **Acceptance Criteria**:
  - [ ] Migration file created: `supabase/migrations/20251130120000_add_currency_support.sql`
  - [ ] `assets.currency` column added (TEXT, DEFAULT 'USD', NOT NULL)
  - [ ] `transactions.currency` column added (TEXT, nullable)
  - [ ] `portfolios.base_currency` column added (TEXT, DEFAULT 'USD', NOT NULL)
  - [ ] Migration tested in development
- **Files**:
  - Create: `supabase/migrations/20251130120000_add_currency_support.sql`

#### T002: Create Migration for Initial Purchase Date
- **Status**: [x] Completed
- **Type**: database
- **Priority**: HIGH
- **Estimate**: 0.5 hours
- **Dependencies**: T001
- **Description**: Add `initial_purchase_date` field to assets table for historical asset tracking.
- **Acceptance Criteria**:
  - [ ] `assets.initial_purchase_date` column added (TIMESTAMPTZ, nullable)
  - [ ] Migration included in currency migration or separate file
  - [ ] Migration tested
- **Files**:
  - Update: `supabase/migrations/20251130120000_add_currency_support.sql`

#### T003: Create Migration for Benchmark Symbol
- **Status**: [x] Completed
- **Type**: database
- **Priority**: MEDIUM
- **Estimate**: 0.5 hours
- **Dependencies**: T001
- **Description**: Add `benchmark_symbol` field to portfolios table for benchmark comparison.
- **Acceptance Criteria**:
  - [ ] `portfolios.benchmark_symbol` column added (TEXT, nullable)
  - [ ] Migration tested
- **Files**:
  - Create: `supabase/migrations/20251130120001_add_benchmark_support.sql`

#### T004: Create Migration for Notes Fields
- **Status**: [x] Completed
- **Type**: database
- **Priority**: LOW
- **Estimate**: 0.5 hours
- **Dependencies**: T001
- **Description**: Add `notes` fields to assets and transactions tables for user annotations.
- **Acceptance Criteria**:
  - [ ] `assets.notes` column added (TEXT, nullable)
  - [ ] `transactions.notes` column added (TEXT, nullable)
  - [ ] Migration tested
- **Files**:
  - Update: `supabase/migrations/20251130120000_add_currency_support.sql`

#### T005: Create Migration for Realized Gain/Loss
- **Status**: [x] Completed
- **Type**: database
- **Priority**: HIGH
- **Estimate**: 0.5 hours
- **Dependencies**: T001
- **Description**: Add `realized_gain_loss` field to transactions table for SELL transaction tracking.
- **Acceptance Criteria**:
  - [ ] `transactions.realized_gain_loss` column added (NUMERIC(18, 8), nullable)
  - [ ] Migration tested
- **Files**:
  - Update: `supabase/migrations/20251130120000_add_currency_support.sql`

#### T006: Create Migration for Cost Basis Lots Table
- **Status**: [x] Completed
- **Type**: database
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T001
- **Description**: Create `cost_basis_lots` table for FIFO cost basis tracking.
- **Acceptance Criteria**:
  - [ ] Migration file created: `supabase/migrations/20251130120002_add_cost_basis_tracking.sql`
  - [ ] `cost_basis_lots` table created with all required fields
  - [ ] Foreign keys to `assets` and `transactions` tables
  - [ ] Indexes created for performance
  - [ ] CHECK constraints added
  - [ ] Migration tested
- **Files**:
  - Create: `supabase/migrations/20251130120002_add_cost_basis_tracking.sql`

#### T007: Update RLS Policies for New Fields
- **Status**: [x] Completed
- **Type**: database
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T001, T003, T006
- **Description**: Update Row Level Security policies to include new fields. Ensure users can only access their own data.
- **Acceptance Criteria**:
  - [ ] RLS policies updated for new columns
  - [ ] RLS policies created for `cost_basis_lots` table
  - [ ] Policies tested with authenticated user
  - [ ] Policies prevent unauthorized access
- **Files**:
  - Update: `supabase/migrations/20251130120002_add_cost_basis_tracking.sql`

#### T008: Test All Migrations
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T001-T007
- **Description**: Test all migrations in development environment. Verify existing data is preserved and new fields have proper defaults.
- **Acceptance Criteria**:
  - [ ] All migrations run successfully
  - [ ] Existing data preserved
  - [ ] Default values work correctly
  - [ ] RLS policies work correctly
  - [ ] No breaking changes to existing queries
- **Files**:
  - Test: All migration files

### Phase 2: SELL Transaction Enhancement [Priority: HIGH]

#### T009: Update Business Logic for SELL Transactions
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 2 hours
- **Dependencies**: T001-T008
- **Description**: Create business logic functions for SELL transaction handling including quantity reduction and realized gain/loss calculation.
- **Acceptance Criteria**:
  - [ ] Function `calculateSellTransaction` created in `lib/api/business-logic.ts`
  - [ ] Quantity reduction logic implemented
  - [ ] Realized gain/loss calculation implemented
  - [ ] Quantity validation (sufficient quantity check)
  - [ ] Zero quantity handling
  - [ ] Function is pure and testable
- **Files**:
  - Update: `lib/api/business-logic.ts`

#### T010: Implement Quantity Validation
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T009
- **Description**: Add validation to ensure sufficient quantity exists before SELL transaction.
- **Acceptance Criteria**:
  - [ ] Validation function created
  - [ ] Returns error if quantity insufficient
  - [ ] Error message is clear
  - [ ] Validation tested
- **Files**:
  - Update: `lib/api/business-logic.ts`

#### T011: Implement Realized Gain/Loss Calculation
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T009
- **Description**: Calculate realized gain/loss for SELL transactions using average buy price.
- **Acceptance Criteria**:
  - [ ] Calculation function created
  - [ ] Formula: `(sale_price - average_buy_price) * amount`
  - [ ] Handles negative values (losses)
  - [ ] Calculation tested
- **Files**:
  - Update: `lib/api/business-logic.ts`

#### T012: Update Transaction POST Endpoint for SELL
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 2 hours
- **Dependencies**: T009, T010, T011
- **Description**: Update `POST /api/assets/[id]/transactions` endpoint to handle SELL transactions with quantity reduction.
- **Acceptance Criteria**:
  - [ ] SELL transaction reduces asset quantity
  - [ ] Realized gain/loss calculated and stored
  - [ ] Quantity validation before SELL
  - [ ] Asset updated atomically with transaction
  - [ ] Error handling for insufficient quantity
  - [ ] Zero quantity handled (keep asset for history)
- **Files**:
  - Update: `app/api/assets/[id]/transactions/route.ts`

#### T013: Handle Zero Quantity Case
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T012
- **Description**: Decide and implement handling when asset quantity reaches zero after SELL. Options: keep asset for history or delete.
- **Acceptance Criteria**:
  - [ ] Zero quantity handling implemented
  - [ ] Asset kept for history (recommended)
  - [ ] Quantity cannot go negative
  - [ ] Behavior documented
- **Files**:
  - Update: `app/api/assets/[id]/transactions/route.ts`

#### T014: Update Business Logic Tests
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 2 hours
- **Dependencies**: T009-T013
- **Description**: Add unit tests for SELL transaction business logic including edge cases.
- **Acceptance Criteria**:
  - [ ] Tests for quantity reduction
  - [ ] Tests for realized gain/loss calculation
  - [ ] Tests for quantity validation
  - [ ] Tests for zero quantity case
  - [ ] Tests for insufficient quantity error
  - [ ] All tests passing
- **Files**:
  - Update: `lib/api/__tests__/business-logic.test.ts`

#### T015: Test SELL Transaction Flow End-to-End
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T012, T014
- **Description**: Test complete SELL transaction flow including API calls and database updates.
- **Acceptance Criteria**:
  - [ ] SELL transaction creates transaction record
  - [ ] Asset quantity reduced correctly
  - [ ] Realized gain/loss stored correctly
  - [ ] Error returned for insufficient quantity
  - [ ] Integration tests passing
- **Files**:
  - Create: `__tests__/integration/api/sell-transaction.test.ts`

### Phase 3: Historical Import [Priority: HIGH]

#### T016: Create Bulk Transaction Import Schema
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T001-T008
- **Description**: Create Zod schema for bulk transaction import validation.
- **Acceptance Criteria**:
  - [ ] Schema created in `lib/types/portfolio.ts`
  - [ ] Validates array of transactions
  - [ ] Validates date format
  - [ ] Validates required fields
  - [ ] Schema tested
- **Files**:
  - Update: `lib/types/portfolio.ts`

#### T017: Create Asset Import Schema
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T016
- **Description**: Create Zod schema for asset import with transactions.
- **Acceptance Criteria**:
  - [ ] Schema created for asset import
  - [ ] Includes transactions array
  - [ ] Validates initial_purchase_date
  - [ ] Schema tested
- **Files**:
  - Update: `lib/types/portfolio.ts`

#### T018: Implement Transaction Sorting by Date
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T016
- **Description**: Create utility function to sort transactions chronologically (oldest first).
- **Acceptance Criteria**:
  - [ ] Sorting function created
  - [ ] Sorts by date ascending
  - [ ] Handles timezone correctly
  - [ ] Function tested
- **Files**:
  - Create: `lib/api/import-utils.ts`

#### T019: Implement Quantity and Average Price Calculation from Transactions
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 2 hours
- **Dependencies**: T018
- **Description**: Create function to calculate initial quantity and average buy price from historical transactions.
- **Acceptance Criteria**:
  - [ ] Calculation function created
  - [ ] Processes transactions chronologically
  - [ ] Calculates running quantity
  - [ ] Calculates weighted average price
  - [ ] Handles BUY and SELL transactions
  - [ ] Function tested
- **Files**:
  - Update: `lib/api/import-utils.ts`

#### T020: Create Bulk Transaction Import Endpoint
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 2 hours
- **Dependencies**: T016, T018, T019
- **Description**: Create `POST /api/assets/[id]/transactions/import` endpoint for bulk transaction import.
- **Acceptance Criteria**:
  - [ ] Endpoint created: `app/api/assets/[id]/transactions/import/route.ts`
  - [ ] Validates request body with schema
  - [ ] Sorts transactions by date
  - [ ] Creates transactions in order
  - [ ] Updates asset quantity and price
  - [ ] Error handling for invalid data
  - [ ] Returns import summary
- **Files**:
  - Create: `app/api/assets/[id]/transactions/import/route.ts`

#### T021: Create Asset Creation from Transactions Endpoint
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 3 hours
- **Dependencies**: T017, T018, T019
- **Description**: Create `POST /api/portfolios/[id]/assets/import` endpoint to create asset from historical transactions.
- **Acceptance Criteria**:
  - [ ] Endpoint created: `app/api/portfolios/[id]/assets/import/route.ts`
  - [ ] Validates asset and transactions data
  - [ ] Calculates initial quantity and average price
  - [ ] Creates asset with calculated values
  - [ ] Creates all transactions
  - [ ] Sets initial_purchase_date
  - [ ] Error handling for invalid data
  - [ ] Returns created asset and transactions
- **Files**:
  - Create: `app/api/portfolios/[id]/assets/import/route.ts`

#### T022: Add Historical Date Validation
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T020, T021
- **Description**: Add validation to ensure transaction dates are not in the future and are logical.
- **Acceptance Criteria**:
  - [ ] Date validation function created
  - [ ] Prevents future dates
  - [ ] Warns about out-of-order dates (optional)
  - [ ] Validation tested
- **Files**:
  - Update: `lib/api/import-utils.ts`

#### T023: Add Error Handling for Invalid Import Data
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T020, T021
- **Description**: Implement comprehensive error handling for bulk import operations.
- **Acceptance Criteria**:
  - [ ] Validation errors returned clearly
  - [ ] Partial import errors handled
  - [ ] Transaction rollback on error (if possible)
  - [ ] Error messages are helpful
- **Files**:
  - Update: `app/api/assets/[id]/transactions/import/route.ts`
  - Update: `app/api/portfolios/[id]/assets/import/route.ts`

#### T024: Test Bulk Import Scenarios
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 2 hours
- **Dependencies**: T020, T021, T022, T023
- **Description**: Create comprehensive tests for bulk import functionality.
- **Acceptance Criteria**:
  - [ ] Tests for bulk transaction import
  - [ ] Tests for asset creation from transactions
  - [ ] Tests for date validation
  - [ ] Tests for error handling
  - [ ] Tests for large datasets (100+ transactions)
  - [ ] All tests passing
- **Files**:
  - Create: `__tests__/integration/api/bulk-import.test.ts`

### Phase 4: Currency Support [Priority: MEDIUM]

#### T025: Create Currency Enum/Constants
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 0.5 hours
- **Dependencies**: T001-T008
- **Description**: Create currency enum or constants for supported currencies.
- **Acceptance Criteria**:
  - [ ] Currency enum/constants created
  - [ ] Includes: USD, TRY, EUR, GBP, etc.
  - [ ] Type-safe implementation
  - [ ] Exported for use in schemas
- **Files**:
  - Create: `lib/types/currency.ts` or update `lib/types/portfolio.ts`

#### T026: Update CreateAssetSchema to Include Currency
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T025
- **Description**: Add optional `currency` field to CreateAssetSchema with default value.
- **Acceptance Criteria**:
  - [ ] `currency` field added to schema
  - [ ] Default value: 'USD'
  - [ ] Validates against currency enum
  - [ ] Schema tested
- **Files**:
  - Update: `lib/types/portfolio.ts`

#### T027: Update CreateTransactionSchema to Include Currency
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T025
- **Description**: Add optional `currency` field to CreateTransactionSchema.
- **Acceptance Criteria**:
  - [ ] `currency` field added to schema
  - [ ] Optional field
  - [ ] Validates against currency enum
  - [ ] Schema tested
- **Files**:
  - Update: `lib/types/portfolio.ts`

#### T028: Create Currency Validation Utility
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T025
- **Description**: Create utility function to validate currency codes.
- **Acceptance Criteria**:
  - [ ] Validation function created
  - [ ] Returns boolean or throws error
  - [ ] Uses currency enum
  - [ ] Function tested
- **Files**:
  - Update: `lib/api/utils.ts` or create `lib/api/currency.ts`

#### T029: Update Asset Creation Endpoint for Currency
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T026, T028
- **Description**: Update asset creation endpoint to accept and validate currency field.
- **Acceptance Criteria**:
  - [ ] Endpoint accepts currency field
  - [ ] Currency validated
  - [ ] Default currency applied if not provided
  - [ ] Currency stored in database
  - [ ] Endpoint tested
- **Files**:
  - Update: `app/api/portfolios/[id]/assets/route.ts`

#### T030: Update Transaction Creation Endpoint for Currency
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T027, T028
- **Description**: Update transaction creation endpoint to accept and validate currency field.
- **Acceptance Criteria**:
  - [ ] Endpoint accepts currency field
  - [ ] Currency validated
  - [ ] Currency stored in database
  - [ ] Endpoint tested
- **Files**:
  - Update: `app/api/assets/[id]/transactions/route.ts`

#### T031: Update Portfolio Creation for Base Currency
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T025, T028
- **Description**: Update portfolio creation endpoint to accept base_currency field.
- **Acceptance Criteria**:
  - [ ] Endpoint accepts base_currency field
  - [ ] Currency validated
  - [ ] Default currency applied if not provided
  - [ ] Currency stored in database
  - [ ] Endpoint tested
- **Files**:
  - Update: `app/api/portfolios/route.ts`

#### T032: Add Currency to Response Types
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T026, T027
- **Description**: Update TypeScript types to include currency fields in responses.
- **Acceptance Criteria**:
  - [ ] AssetSchema updated with currency
  - [ ] TransactionSchema updated with currency
  - [ ] PortfolioSchema updated with base_currency
  - [ ] Types exported correctly
- **Files**:
  - Update: `lib/types/portfolio.ts`

#### T033: Test Multi-Currency Scenarios
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T029, T030, T031, T032
- **Description**: Create tests for multi-currency functionality.
- **Acceptance Criteria**:
  - [ ] Tests for asset creation with currency
  - [ ] Tests for transaction creation with currency
  - [ ] Tests for portfolio base currency
  - [ ] Tests for invalid currency error
  - [ ] All tests passing
- **Files**:
  - Create: `__tests__/integration/api/currency.test.ts`

### Phase 5: Cost Basis Tracking [Priority: MEDIUM]

#### T034: Implement FIFO Cost Basis Calculation
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 3 hours
- **Dependencies**: T006, T012
- **Description**: Implement FIFO (First In First Out) cost basis calculation method.
- **Acceptance Criteria**:
  - [ ] FIFO calculation function created
  - [ ] Tracks cost basis per lot
  - [ ] Processes oldest lots first
  - [ ] Updates cost_basis_lots table
  - [ ] Function tested
- **Files**:
  - Create: `lib/api/cost-basis.ts`

#### T035: Implement Average Cost Method
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T034
- **Description**: Implement Average Cost method for cost basis calculation (simpler alternative to FIFO).
- **Acceptance Criteria**:
  - [ ] Average Cost calculation function created
  - [ ] Uses average_buy_price for all sales
  - [ ] Function tested
- **Files**:
  - Update: `lib/api/cost-basis.ts`

#### T036: Create Cost Basis Lots Management Functions
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: T006, T034
- **Description**: Create functions to manage cost_basis_lots table (create, update, query).
- **Acceptance Criteria**:
  - [ ] Function to create lot from BUY transaction
  - [ ] Function to update lot after SELL transaction
  - [ ] Function to query remaining lots
  - [ ] Functions tested
- **Files**:
  - Update: `lib/api/cost-basis.ts`

#### T037: Update SELL Transaction to Track Cost Basis
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: T012, T034, T036
- **Description**: Update SELL transaction endpoint to track cost basis using FIFO method.
- **Acceptance Criteria**:
  - [ ] SELL transaction updates cost_basis_lots
  - [ ] Realized gain/loss calculated from cost basis
  - [ ] Oldest lots sold first
  - [ ] Cost basis tracked correctly
  - [ ] Endpoint tested
- **Files**:
  - Update: `app/api/assets/[id]/transactions/route.ts`
  - Update: `lib/api/cost-basis.ts`

#### T038: Create Cost Basis Endpoint
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: T034, T036
- **Description**: Create `GET /api/assets/[id]/cost-basis` endpoint to return cost basis information.
- **Acceptance Criteria**:
  - [ ] Endpoint created: `app/api/assets/[id]/cost-basis/route.ts`
  - [ ] Returns cost basis information
  - [ ] Includes remaining lots
  - [ ] Includes total cost basis
  - [ ] Endpoint tested
- **Files**:
  - Create: `app/api/assets/[id]/cost-basis/route.ts`

#### T039: Calculate Realized Gain/Loss Per Transaction
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T037
- **Description**: Ensure realized gain/loss is calculated and stored for each SELL transaction.
- **Acceptance Criteria**:
  - [ ] Realized gain/loss calculated correctly
  - [ ] Stored in transaction.realized_gain_loss
  - [ ] Calculation tested
- **Files**:
  - Update: `app/api/assets/[id]/transactions/route.ts`

#### T040: Test Cost Basis Calculations
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: T034, T035, T036, T037, T038, T039
- **Description**: Create comprehensive tests for cost basis tracking including FIFO and Average Cost methods.
- **Acceptance Criteria**:
  - [ ] Tests for FIFO calculation
  - [ ] Tests for Average Cost calculation
  - [ ] Tests for cost basis lots management
  - [ ] Tests for edge cases (zero quantity, etc.)
  - [ ] All tests passing
- **Files**:
  - Create: `lib/api/__tests__/cost-basis.test.ts`
  - Create: `__tests__/integration/api/cost-basis.test.ts`

### Phase 6: Benchmark Comparison [Priority: MEDIUM]

#### T041: Update Portfolio Creation for Benchmark Symbol
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T003
- **Description**: Update portfolio creation endpoint to accept benchmark_symbol field.
- **Acceptance Criteria**:
  - [ ] Endpoint accepts benchmark_symbol field
  - [ ] Field is optional
  - [ ] Stored in database
  - [ ] Endpoint tested
- **Files**:
  - Update: `app/api/portfolios/route.ts`

#### T042: Update Portfolio Update for Benchmark Symbol
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T041
- **Description**: Update portfolio update endpoint to allow updating benchmark_symbol.
- **Acceptance Criteria**:
  - [ ] Endpoint accepts benchmark_symbol in update
  - [ ] Field can be updated
  - [ ] Endpoint tested
- **Files**:
  - Update: `app/api/portfolios/[id]/route.ts`

#### T043: Create Benchmark Comparison Logic
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: T041
- **Description**: Create logic to compare portfolio performance vs benchmark (placeholder for future external API integration).
- **Acceptance Criteria**:
  - [ ] Comparison function created
  - [ ] Calculates portfolio performance
  - [ ] Calculates benchmark performance (placeholder)
  - [ ] Calculates relative performance
  - [ ] Function tested
- **Files**:
  - Create: `lib/api/benchmark.ts`

#### T044: Create Benchmark Comparison Endpoint
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: T043
- **Description**: Create `GET /api/portfolios/[id]/benchmark-comparison` endpoint.
- **Acceptance Criteria**:
  - [ ] Endpoint created: `app/api/portfolios/[id]/benchmark-comparison/route.ts`
  - [ ] Returns portfolio vs benchmark comparison
  - [ ] Handles missing benchmark gracefully
  - [ ] Endpoint tested
- **Files**:
  - Create: `app/api/portfolios/[id]/benchmark-comparison/route.ts`

#### T045: Add Benchmark Data Structure (Future)
- **Status**: [x] Completed
- **Type**: development
- **Priority**: LOW
- **Estimate**: 1 hour
- **Dependencies**: T044
- **Description**: Create structure for storing benchmark data (for future external API integration).
- **Acceptance Criteria**:
  - [ ] Benchmark data structure defined
  - [ ] Placeholder for external API
  - [ ] Structure documented
- **Files**:
  - Update: `lib/api/benchmark.ts`

#### T046: Test Benchmark Comparison
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T044
- **Description**: Create tests for benchmark comparison functionality.
- **Acceptance Criteria**:
  - [ ] Tests for benchmark comparison endpoint
  - [ ] Tests for missing benchmark handling
  - [ ] All tests passing
- **Files**:
  - Create: `__tests__/integration/api/benchmark.test.ts`

### Phase 7: Analytics Endpoints [Priority: LOW]

#### T047: Create Portfolio Analytics Calculation Functions
- **Status**: [x] Completed
- **Type**: development
- **Priority**: LOW
- **Estimate**: 3 hours
- **Dependencies**: T012, T039
- **Description**: Create functions to calculate portfolio analytics (total value, performance, allocation).
- **Acceptance Criteria**:
  - [ ] Function to calculate total portfolio value
  - [ ] Function to calculate portfolio performance (gain/loss, ROI)
  - [ ] Function to calculate asset allocation breakdown
  - [ ] Functions tested
- **Files**:
  - Create: `lib/api/analytics.ts`

#### T048: Create Portfolio Analytics Endpoint
- **Status**: [x] Completed
- **Type**: development
- **Priority**: LOW
- **Estimate**: 2 hours
- **Dependencies**: T047
- **Description**: Create `GET /api/portfolios/[id]/analytics` endpoint.
- **Acceptance Criteria**:
  - [ ] Endpoint created: `app/api/portfolios/[id]/analytics/route.ts`
  - [ ] Returns portfolio analytics
  - [ ] Includes total value, performance, allocation
  - [ ] Endpoint tested
- **Files**:
  - Create: `app/api/portfolios/[id]/analytics/route.ts`

#### T049: Create Asset Performance Calculation Functions
- **Status**: [x] Completed
- **Type**: development
- **Priority**: LOW
- **Estimate**: 2 hours
- **Dependencies**: T039
- **Description**: Create functions to calculate asset performance metrics.
- **Acceptance Criteria**:
  - [ ] Function to calculate asset performance
  - [ ] Function to calculate realized vs unrealized gains
  - [ ] Functions tested
- **Files**:
  - Update: `lib/api/analytics.ts`

#### T050: Create Asset Performance Endpoint
- **Status**: [x] Completed
- **Type**: development
- **Priority**: LOW
- **Estimate**: 2 hours
- **Dependencies**: T049
- **Description**: Create `GET /api/assets/[id]/performance` endpoint.
- **Acceptance Criteria**:
  - [ ] Endpoint created: `app/api/assets/[id]/performance/route.ts`
  - [ ] Returns asset performance metrics
  - [ ] Includes realized/unrealized gains
  - [ ] Endpoint tested
- **Files**:
  - Create: `app/api/assets/[id]/performance/route.ts`

#### T051: Create Transaction Analytics Calculation Functions
- **Status**: [x] Completed
- **Type**: development
- **Priority**: LOW
- **Estimate**: 2 hours
- **Dependencies**: T039
- **Description**: Create functions to analyze transaction history.
- **Acceptance Criteria**:
  - [ ] Function to analyze transaction patterns
  - [ ] Function to analyze buy/sell patterns
  - [ ] Function to analyze cost basis
  - [ ] Functions tested
- **Files**:
  - Update: `lib/api/analytics.ts`

#### T052: Create Transaction Analytics Endpoint
- **Status**: [x] Completed
- **Type**: development
- **Priority**: LOW
- **Estimate**: 2 hours
- **Dependencies**: T051
- **Description**: Create `GET /api/portfolios/[id]/transactions/analytics` endpoint.
- **Acceptance Criteria**:
  - [ ] Endpoint created: `app/api/portfolios/[id]/transactions/analytics/route.ts`
  - [ ] Returns transaction analytics
  - [ ] Includes patterns and cost basis analysis
  - [ ] Endpoint tested
- **Files**:
  - Create: `app/api/portfolios/[id]/transactions/analytics/route.ts`

#### T053: Add Time-Based Analytics
- **Status**: [x] Completed
- **Type**: development
- **Priority**: LOW
- **Estimate**: 2 hours
- **Dependencies**: T047, T049, T051
- **Description**: Add time-based analytics (performance over time, trends).
- **Acceptance Criteria**:
  - [ ] Time-based calculation functions created
  - [ ] Supports date ranges
  - [ ] Functions tested
- **Files**:
  - Update: `lib/api/analytics.ts`

#### T054: Test Analytics Endpoints
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: LOW
- **Estimate**: 2 hours
- **Dependencies**: T048, T050, T052, T053
- **Description**: Create comprehensive tests for all analytics endpoints.
- **Acceptance Criteria**:
  - [ ] Tests for portfolio analytics
  - [ ] Tests for asset performance
  - [ ] Tests for transaction analytics
  - [ ] Tests for time-based analytics
  - [ ] All tests passing
- **Files**:
  - Create: `__tests__/integration/api/analytics.test.ts`

### Phase 8: TypeScript Types & Schema Updates

#### T055: Update Asset TypeScript Types
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T001-T008
- **Description**: Update TypeScript types for Asset to include new fields (currency, initial_purchase_date, notes).
- **Acceptance Criteria**:
  - [ ] AssetSchema updated
  - [ ] CreateAssetSchema updated
  - [ ] UpdateAssetSchema updated
  - [ ] Types exported correctly
- **Files**:
  - Update: `lib/types/portfolio.ts`

#### T056: Update Transaction TypeScript Types
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T001-T008
- **Description**: Update TypeScript types for Transaction to include new fields (currency, realized_gain_loss, notes).
- **Acceptance Criteria**:
  - [ ] TransactionSchema updated
  - [ ] CreateTransactionSchema updated
  - [ ] UpdateTransactionSchema updated
  - [ ] Types exported correctly
- **Files**:
  - Update: `lib/types/portfolio.ts`

#### T057: Update Portfolio TypeScript Types
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T001-T008
- **Description**: Update TypeScript types for Portfolio to include new fields (base_currency, benchmark_symbol).
- **Acceptance Criteria**:
  - [ ] PortfolioSchema updated
  - [ ] CreatePortfolioSchema updated
  - [ ] UpdatePortfolioSchema updated
  - [ ] Types exported correctly
- **Files**:
  - Update: `lib/types/portfolio.ts`

#### T058: Create Cost Basis Types
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T006
- **Description**: Create TypeScript types for cost basis lots and related structures.
- **Acceptance Criteria**:
  - [ ] CostBasisLot type created
  - [ ] CostBasisInfo type created
  - [ ] Types exported correctly
- **Files**:
  - Create: `lib/types/cost-basis.ts` or update `lib/types/portfolio.ts`

### Phase 9: Documentation & Testing

#### T059: Update API Documentation
- **Status**: [x] Completed
- **Type**: documentation
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: All phases
- **Description**: Update API documentation to include all new endpoints and features.
- **Acceptance Criteria**:
  - [ ] New endpoints documented
  - [ ] Updated endpoints documented
  - [ ] Request/response examples included
  - [ ] Error cases documented
- **Files**:
  - Update: `docs/api/endpoints.md`

#### T060: Update Postman Collection
- **Status**: [x] Completed
- **Type**: documentation
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: All phases
- **Description**: Update Postman collection to include all new endpoints.
- **Acceptance Criteria**:
  - [ ] New endpoints added to collection
  - [ ] Updated endpoints updated in collection
  - [ ] Test scripts added
  - [ ] Collection tested
- **Files**:
  - Update: `docs/api/Portfolio-Tracker-API.postman_collection.json`

#### T061: Create Migration Guide
- **Status**: [x] Completed
- **Type**: documentation
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T001-T008
- **Description**: Create guide for running database migrations.
- **Acceptance Criteria**:
  - [ ] Migration steps documented
  - [ ] Rollback instructions included
  - [ ] Testing instructions included
- **Files**:
  - Create: `docs/database/migration-guide-enhanced.md`

#### T062: Create Feature Documentation
- **Status**: [x] Completed
- **Type**: documentation
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: All phases
- **Description**: Create comprehensive documentation for new features.
- **Acceptance Criteria**:
  - [ ] Historical import documented
  - [ ] Currency support documented
  - [ ] Cost basis tracking documented
  - [ ] Benchmark comparison documented
  - [ ] Analytics documented
- **Files**:
  - Create: `docs/api/enhanced-features.md`

#### T063: Run All Existing Tests
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: All phases
- **Description**: Run all existing tests to ensure backward compatibility.
- **Acceptance Criteria**:
  - [ ] All existing tests pass
  - [ ] No regressions introduced
  - [ ] Test results documented
- **Files**:
  - Test: All test files

#### T064: Create Integration Test Suite
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 3 hours
- **Dependencies**: All phases
- **Description**: Create comprehensive integration tests for all new features.
- **Acceptance Criteria**:
  - [ ] Integration tests for SELL transactions
  - [ ] Integration tests for bulk import
  - [ ] Integration tests for currency support
  - [ ] Integration tests for cost basis
  - [ ] Integration tests for analytics
  - [ ] All tests passing
- **Files**:
  - Create: `__tests__/integration/api/enhanced-features.test.ts`

### Phase 10: Finalization

#### T065: Code Review and Refactoring
- **Status**: [x] Completed
- **Type**: review
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: All phases
- **Description**: Review all code changes and refactor as needed.
- **Acceptance Criteria**:
  - [ ] Code reviewed
  - [ ] Refactoring completed
  - [ ] Code quality maintained
  - [ ] Best practices followed
- **Files**:
  - Review: All modified files

#### T066: Performance Testing
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: All phases
- **Description**: Test performance of new endpoints, especially bulk import.
- **Acceptance Criteria**:
  - [ ] Bulk import performance acceptable
  - [ ] Analytics endpoints perform well
  - [ ] No performance regressions
  - [ ] Performance metrics documented
- **Files**:
  - Create: `docs/api/performance-testing-enhanced.md`

#### T067: Security Review
- **Status**: [x] Completed
- **Type**: review
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: All phases
- **Description**: Review security implications of new features.
- **Acceptance Criteria**:
  - [ ] RLS policies reviewed
  - [ ] Input validation reviewed
  - [ ] Security best practices followed
  - [ ] Security review documented
- **Files**:
  - Review: All new endpoints and migrations

#### T068: Update README
- **Status**: [x] Completed
- **Type**: documentation
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: All phases
- **Description**: Update project README with new features.
- **Acceptance Criteria**:
  - [ ] New features documented in README
  - [ ] API endpoints listed
  - [ ] Migration instructions included
- **Files**:
  - Update: `README.md`

## Summary

### Task Statistics by Phase

| Phase | Tasks | Estimated Hours |
|-------|-------|-----------------|
| Phase 1: Database Schema Updates | 8 | 6.5 |
| Phase 2: SELL Transaction Enhancement | 7 | 10 |
| Phase 3: Historical Import | 9 | 13 |
| Phase 4: Currency Support | 9 | 7.5 |
| Phase 5: Cost Basis Tracking | 7 | 11 |
| Phase 6: Benchmark Comparison | 6 | 7 |
| Phase 7: Analytics Endpoints | 8 | 13 |
| Phase 8: TypeScript Types & Schema Updates | 4 | 4 |
| Phase 9: Documentation & Testing | 6 | 11 |
| Phase 10: Finalization | 4 | 6 |
| **Total** | **68** | **89 hours** |

### Priority Breakdown

- **HIGH Priority**: 25 tasks
- **MEDIUM Priority**: 30 tasks
- **LOW Priority**: 13 tasks

### Dependencies Graph

```
Phase 1 (Database) → Phase 2 (SELL) → Phase 3 (Import)
                  ↓
Phase 4 (Currency) → Phase 5 (Cost Basis)
                  ↓
Phase 6 (Benchmark)
                  ↓
Phase 7 (Analytics)
                  ↓
Phase 8 (Types) → Phase 9 (Docs/Testing) → Phase 10 (Finalization)
```

## Notes

- All tasks maintain backward compatibility
- Test migrations thoroughly before production
- Prioritize HIGH priority tasks first
- Document all changes
- Update Postman collection as features are completed

