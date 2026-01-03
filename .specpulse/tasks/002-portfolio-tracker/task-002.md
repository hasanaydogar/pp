# Task Breakdown: Portfolio Tracker API Development

<!-- FEATURE_DIR: 002-portfolio-tracker -->
<!-- FEATURE_ID: 002 -->
<!-- TASK_LIST_ID: 002 -->
<!-- STATUS: pending -->
<!-- CREATED: 2025-11-30T13:00:00.000000 -->
<!-- LAST_UPDATED: 2025-11-30T13:00:00.000000 -->

## Progress Overview
- **Total Tasks**: 85
- **Completed Tasks**: 0 (0%)
- **In Progress Tasks**: 0
- **Blocked Tasks**: 0

## Task Categories

### Phase 1: Foundation & Shared Utilities [Priority: HIGH]

#### T001: Review Existing Utilities
- **Status**: [ ] Pending
- **Type**: review
- **Priority**: HIGH
- **Estimate**: 0.5 hours
- **Dependencies**: None
- **Description**: Review existing utilities to understand available functions and patterns. Check `lib/supabase/server.ts`, `lib/auth/actions.ts`, and `lib/types/portfolio.ts`.
- **Acceptance Criteria**:
  - [ ] Reviewed `lib/supabase/server.ts` - understand `createClient()` usage
  - [ ] Reviewed `lib/auth/actions.ts` - understand `getCurrentUser()` usage
  - [ ] Reviewed `lib/types/portfolio.ts` - understand Zod schemas and types
  - [ ] Documented patterns and conventions
- **Files**:
  - Review: `lib/supabase/server.ts`
  - Review: `lib/auth/actions.ts`
  - Review: `lib/types/portfolio.ts`

#### T002: Create UUID Validation Utility
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 0.5 hours
- **Dependencies**: T001
- **Description**: Create a shared UUID validation utility function that can be reused across all endpoints. Use Zod for validation.
- **Acceptance Criteria**:
  - [ ] Function `validateUUID(id: string)` created
  - [ ] Returns boolean or throws error
  - [ ] Uses Zod UUID schema
  - [ ] Type-safe implementation
- **Files**:
  - `lib/api/utils.ts` - UUID validation function

#### T003: Create Error Response Helper
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 0.5 hours
- **Dependencies**: T001
- **Description**: Create shared error response helper functions for consistent error formatting across all endpoints.
- **Acceptance Criteria**:
  - [ ] Function `createErrorResponse(error: string, status: number, details?: any)` created
  - [ ] Returns NextResponse with consistent format: `{ error: string, details?: any }`
  - [ ] Supports common status codes (400, 401, 404, 500)
  - [ ] Type-safe implementation
- **Files**:
  - `lib/api/errors.ts` - Error response helpers

#### T004: Create Zod Validation Wrapper
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 0.5 hours
- **Dependencies**: T001
- **Description**: Create a wrapper function for Zod validation that handles errors consistently and returns formatted error responses.
- **Acceptance Criteria**:
  - [ ] Function `validateWithZod<T>(schema: ZodSchema<T>, data: unknown)` created
  - [ ] Returns validated data or throws formatted error
  - [ ] Handles ZodError with proper formatting
  - [ ] Type-safe implementation
- **Files**:
  - `lib/api/utils.ts` - Zod validation wrapper

#### T005: Document Standard Endpoint Structure Pattern
- **Status**: [ ] Pending
- **Type**: documentation
- **Priority**: MEDIUM
- **Estimate**: 0.5 hours
- **Dependencies**: T002, T003, T004
- **Description**: Document the standard endpoint structure pattern that all endpoints should follow for consistency.
- **Acceptance Criteria**:
  - [ ] Documented standard endpoint structure
  - [ ] Includes authentication check pattern
  - [ ] Includes error handling pattern
  - [ ] Includes validation pattern
  - [ ] Code examples provided
- **Files**:
  - `docs/api/patterns.md` - Endpoint structure patterns

#### T006: Set Up API Directory Structure
- **Status**: [ ] Pending
- **Type**: setup
- **Priority**: HIGH
- **Estimate**: 0.5 hours
- **Dependencies**: None
- **Description**: Create the API directory structure according to Next.js App Router conventions.
- **Acceptance Criteria**:
  - [ ] `app/api/portfolios/` directory created
  - [ ] `app/api/portfolios/[id]/` directory created
  - [ ] `app/api/portfolios/[id]/assets/` directory created
  - [ ] `app/api/assets/[id]/` directory created
  - [ ] `app/api/assets/[id]/transactions/` directory created
  - [ ] `app/api/transactions/[id]/` directory created
- **Files**:
  - `app/api/` - API directory structure

### Phase 2: Portfolio Endpoints [Priority: HIGH]

#### T007: Implement GET /api/portfolios (List All)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T002, T003, T006
- **Description**: Implement GET endpoint to list all portfolios for the authenticated user. RLS automatically filters to user's portfolios.
- **Acceptance Criteria**:
  - [ ] Endpoint returns 200 OK with portfolios array
  - [ ] Returns only authenticated user's portfolios
  - [ ] Orders by `created_at DESC`
  - [ ] Returns 401 if not authenticated
  - [ ] Returns 500 on database errors
  - [ ] Response format: `{ data: Portfolio[] }`
- **Files**:
  - `app/api/portfolios/route.ts` - GET handler

#### T008: Implement POST /api/portfolios (Create)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1.5 hours
- **Dependencies**: T004, T007
- **Description**: Implement POST endpoint to create a new portfolio. Validates input with CreatePortfolioSchema and sets user_id from authenticated user.
- **Acceptance Criteria**:
  - [ ] Endpoint creates portfolio with 201 Created status
  - [ ] Validates request body with CreatePortfolioSchema
  - [ ] Sets user_id from authenticated user
  - [ ] Returns 400 for validation errors
  - [ ] Returns 401 if not authenticated
  - [ ] Returns 500 on database errors
  - [ ] Response format: `{ data: Portfolio }`
- **Files**:
  - `app/api/portfolios/route.ts` - POST handler

#### T009: Implement GET /api/portfolios/[id] (Get Details)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 2 hours
- **Dependencies**: T002, T007
- **Description**: Implement GET endpoint to retrieve portfolio details with nested assets and transactions. Uses Supabase nested select query.
- **Acceptance Criteria**:
  - [ ] Endpoint returns 200 OK with portfolio details
  - [ ] Validates UUID format
  - [ ] Returns nested assets and transactions
  - [ ] Returns 400 for invalid UUID
  - [ ] Returns 404 if portfolio not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ data: { ...Portfolio, assets: Array<{ ...Asset, transactions: Transaction[] }> } }`
- **Files**:
  - `app/api/portfolios/[id]/route.ts` - GET handler

#### T010: Implement PUT /api/portfolios/[id] (Update)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1.5 hours
- **Dependencies**: T002, T004, T009
- **Description**: Implement PUT endpoint to update portfolio (e.g., change name). Validates UUID and request body with UpdatePortfolioSchema.
- **Acceptance Criteria**:
  - [ ] Endpoint updates portfolio with 200 OK status
  - [ ] Validates UUID format
  - [ ] Validates request body with UpdatePortfolioSchema
  - [ ] Returns 400 for validation errors
  - [ ] Returns 404 if portfolio not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ data: Portfolio }`
- **Files**:
  - `app/api/portfolios/[id]/route.ts` - PUT handler

#### T011: Implement DELETE /api/portfolios/[id] (Delete)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T002, T009
- **Description**: Implement DELETE endpoint to delete portfolio. Cascade deletes assets and transactions handled by database.
- **Acceptance Criteria**:
  - [ ] Endpoint deletes portfolio with 200 OK status
  - [ ] Validates UUID format
  - [ ] Cascade deletes assets and transactions
  - [ ] Returns 404 if portfolio not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ message: string }`
- **Files**:
  - `app/api/portfolios/[id]/route.ts` - DELETE handler

#### T012: Manual Test Portfolio Endpoints
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T007, T008, T009, T010, T011
- **Description**: Manually test all portfolio endpoints to verify functionality, authentication, and RLS policies.
- **Acceptance Criteria**:
  - [ ] GET list returns user's portfolios only
  - [ ] POST creates portfolio with correct user_id
  - [ ] GET by ID returns nested data correctly
  - [ ] PUT updates portfolio name successfully
  - [ ] DELETE removes portfolio and cascades
  - [ ] All endpoints return 401 if not authenticated
  - [ ] RLS prevents access to other users' portfolios
- **Files**:
  - Test results documented

### Phase 3: Asset Endpoints [Priority: HIGH]

#### T013: Implement GET /api/portfolios/[portfolioId]/assets (List Assets)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T002, T012
- **Description**: Implement GET endpoint to list all assets in a portfolio. Validates portfolioId UUID and uses RLS to ensure user can only access their portfolios.
- **Acceptance Criteria**:
  - [ ] Endpoint returns 200 OK with assets array
  - [ ] Validates portfolioId UUID format
  - [ ] Returns only assets in user's portfolios
  - [ ] Returns 400 for invalid UUID
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ data: Asset[] }`
- **Files**:
  - `app/api/portfolios/[portfolioId]/assets/route.ts` - GET handler

#### T014: Implement POST /api/portfolios/[portfolioId]/assets (Create Asset)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 2 hours
- **Dependencies**: T002, T004, T013
- **Description**: Implement POST endpoint to add new asset to portfolio. Validates portfolioId UUID and request body with CreateAssetSchema. Handles duplicate asset constraint error.
- **Acceptance Criteria**:
  - [ ] Endpoint creates asset with 201 Created status
  - [ ] Validates portfolioId UUID format
  - [ ] Validates request body with CreateAssetSchema
  - [ ] Handles duplicate asset constraint (same symbol + type) with 400 error
  - [ ] Returns 400 for validation errors
  - [ ] Returns 404 if portfolio not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ data: Asset }`
- **Files**:
  - `app/api/portfolios/[portfolioId]/assets/route.ts` - POST handler

#### T015: Implement GET /api/assets/[id] (Get Asset Details)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1.5 hours
- **Dependencies**: T002, T013
- **Description**: Implement GET endpoint to retrieve asset details with nested transactions. Uses Supabase nested select query.
- **Acceptance Criteria**:
  - [ ] Endpoint returns 200 OK with asset details
  - [ ] Validates UUID format
  - [ ] Returns nested transactions
  - [ ] Returns 400 for invalid UUID
  - [ ] Returns 404 if asset not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ data: { ...Asset, transactions: Transaction[] } }`
- **Files**:
  - `app/api/assets/[id]/route.ts` - GET handler

#### T016: Implement PUT /api/assets/[id] (Update Asset)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1.5 hours
- **Dependencies**: T002, T004, T015
- **Description**: Implement PUT endpoint to update asset (quantity, price, symbol, type). Validates UUID and request body with UpdateAssetSchema.
- **Acceptance Criteria**:
  - [ ] Endpoint updates asset with 200 OK status
  - [ ] Validates UUID format
  - [ ] Validates request body with UpdateAssetSchema
  - [ ] Returns 400 for validation errors
  - [ ] Returns 404 if asset not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ data: Asset }`
- **Files**:
  - `app/api/assets/[id]/route.ts` - PUT handler

#### T017: Implement DELETE /api/assets/[id] (Delete Asset)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T002, T015
- **Description**: Implement DELETE endpoint to delete asset. Cascade deletes transactions handled by database.
- **Acceptance Criteria**:
  - [ ] Endpoint deletes asset with 200 OK status
  - [ ] Validates UUID format
  - [ ] Cascade deletes transactions
  - [ ] Returns 404 if asset not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ message: string }`
- **Files**:
  - `app/api/assets/[id]/route.ts` - DELETE handler

#### T018: Manual Test Asset Endpoints
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T013, T014, T015, T016, T017
- **Description**: Manually test all asset endpoints to verify functionality, authentication, RLS policies, and duplicate constraint handling.
- **Acceptance Criteria**:
  - [ ] GET list returns assets in portfolio
  - [ ] POST creates asset with correct portfolio_id
  - [ ] Duplicate asset creation fails with 400 error
  - [ ] GET by ID returns nested transactions
  - [ ] PUT updates asset fields successfully
  - [ ] DELETE removes asset and cascades transactions
  - [ ] All endpoints enforce RLS policies
  - [ ] Validation errors return 400 with details
- **Files**:
  - Test results documented

### Phase 4: Transaction Endpoints & Business Logic [Priority: HIGH]

#### T019: Implement GET /api/assets/[assetId]/transactions (List with Pagination)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 2 hours
- **Dependencies**: T002, T018
- **Description**: Implement GET endpoint to list all transactions for an asset with pagination support (limit, offset, order).
- **Acceptance Criteria**:
  - [ ] Endpoint returns 200 OK with paginated transactions
  - [ ] Validates assetId UUID format
  - [ ] Supports query parameters: limit (default 100), offset (default 0), order (default desc)
  - [ ] Returns total count for pagination UI
  - [ ] Returns 400 for invalid UUID
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ data: Transaction[], count?: number }`
- **Files**:
  - `app/api/assets/[assetId]/transactions/route.ts` - GET handler

#### T020: Implement Business Logic: Calculate Average Buy Price
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T019
- **Description**: Create helper function to calculate new average buy price after BUY transaction. Formula: `(oldTotal + newTotal) / newQuantity`.
- **Acceptance Criteria**:
  - [ ] Function `calculateAverageBuyPrice()` created
  - [ ] Takes old quantity, old average price, transaction amount, transaction price
  - [ ] Returns new quantity and new average buy price
  - [ ] Handles edge cases (division by zero, etc.)
  - [ ] Unit tests written
- **Files**:
  - `lib/api/business-logic.ts` - Business logic functions

#### T021: Implement POST /api/assets/[assetId]/transactions (Create Transaction)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 3 hours
- **Dependencies**: T004, T020, T019
- **Description**: Implement POST endpoint to create transaction. For BUY transactions, automatically updates asset's quantity and average_buy_price using business logic.
- **Acceptance Criteria**:
  - [ ] Endpoint creates transaction with 201 Created status
  - [ ] Validates assetId UUID format
  - [ ] Validates request body with CreateTransactionSchema
  - [ ] For BUY transactions: fetches current asset, calculates new values, updates asset atomically
  - [ ] For SELL transactions: only creates transaction (no asset update)
  - [ ] Handles transaction rollback if asset update fails
  - [ ] Returns 400 for validation errors
  - [ ] Returns 404 if asset not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ data: Transaction }`
- **Files**:
  - `app/api/assets/[assetId]/transactions/route.ts` - POST handler

#### T022: Test Business Logic Calculations
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T020, T021
- **Description**: Test business logic calculations with various scenarios to ensure accuracy.
- **Acceptance Criteria**:
  - [ ] Test with single BUY transaction
  - [ ] Test with multiple BUY transactions
  - [ ] Test calculation accuracy (verify math)
  - [ ] Test edge cases (zero quantity, etc.)
  - [ ] Test atomicity (rollback on failure)
- **Files**:
  - Test results documented

#### T023: Implement GET /api/transactions/[id] (Get Transaction)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T002, T021
- **Description**: Implement GET endpoint to retrieve transaction details.
- **Acceptance Criteria**:
  - [ ] Endpoint returns 200 OK with transaction
  - [ ] Validates UUID format
  - [ ] Returns 400 for invalid UUID
  - [ ] Returns 404 if transaction not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ data: Transaction }`
- **Files**:
  - `app/api/transactions/[id]/route.ts` - GET handler

#### T024: Implement PUT /api/transactions/[id] (Update Transaction)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1.5 hours
- **Dependencies**: T002, T004, T023
- **Description**: Implement PUT endpoint to update transaction. Validates UUID and request body with UpdateTransactionSchema.
- **Acceptance Criteria**:
  - [ ] Endpoint updates transaction with 200 OK status
  - [ ] Validates UUID format
  - [ ] Validates request body with UpdateTransactionSchema
  - [ ] Returns 400 for validation errors
  - [ ] Returns 404 if transaction not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ data: Transaction }`
- **Files**:
  - `app/api/transactions/[id]/route.ts` - PUT handler

#### T025: Implement DELETE /api/transactions/[id] (Delete Transaction)
- **Status**: [ ] Pending
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T002, T023
- **Description**: Implement DELETE endpoint to delete transaction.
- **Acceptance Criteria**:
  - [ ] Endpoint deletes transaction with 200 OK status
  - [ ] Validates UUID format
  - [ ] Returns 404 if transaction not found or doesn't belong to user
  - [ ] Returns 401 if not authenticated
  - [ ] Response format: `{ message: string }`
- **Files**:
  - `app/api/transactions/[id]/route.ts` - DELETE handler

#### T026: Manual Test Transaction Endpoints
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 1.5 hours
- **Dependencies**: T019, T021, T022, T023, T024, T025
- **Description**: Manually test all transaction endpoints including pagination, business logic, and error handling.
- **Acceptance Criteria**:
  - [ ] GET list with pagination works correctly
  - [ ] POST creates transaction successfully
  - [ ] BUY transaction updates asset correctly
  - [ ] SELL transaction doesn't update asset
  - [ ] GET by ID returns transaction
  - [ ] PUT updates transaction successfully
  - [ ] DELETE removes transaction
  - [ ] Pagination parameters work correctly
  - [ ] All endpoints enforce RLS policies
- **Files**:
  - Test results documented

### Phase 5: Testing & Validation [Priority: MEDIUM]

#### T027: Create Unit Tests for UUID Validation Utility
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 0.5 hours
- **Dependencies**: T002
- **Description**: Write unit tests for UUID validation utility function.
- **Acceptance Criteria**:
  - [ ] Test valid UUIDs pass
  - [ ] Test invalid UUIDs fail
  - [ ] Test edge cases (empty string, null, etc.)
  - [ ] All tests passing
- **Files**:
  - `lib/api/__tests__/utils.test.ts`

#### T028: Create Unit Tests for Error Response Helpers
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 0.5 hours
- **Dependencies**: T003
- **Description**: Write unit tests for error response helper functions.
- **Acceptance Criteria**:
  - [ ] Test error response format
  - [ ] Test status codes
  - [ ] Test details parameter
  - [ ] All tests passing
- **Files**:
  - `lib/api/__tests__/errors.test.ts`

#### T029: Create Unit Tests for Zod Validation Wrapper
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 0.5 hours
- **Dependencies**: T004
- **Description**: Write unit tests for Zod validation wrapper function.
- **Acceptance Criteria**:
  - [ ] Test valid data passes
  - [ ] Test invalid data throws formatted error
  - [ ] Test ZodError handling
  - [ ] All tests passing
- **Files**:
  - `lib/api/__tests__/utils.test.ts`

#### T030: Create Unit Tests for Business Logic Calculations
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T020
- **Description**: Write unit tests for average buy price calculation business logic.
- **Acceptance Criteria**:
  - [ ] Test calculation accuracy
  - [ ] Test with various scenarios
  - [ ] Test edge cases
  - [ ] All tests passing
- **Files**:
  - `lib/api/__tests__/business-logic.test.ts`

#### T031: Create Integration Test for GET /api/portfolios
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T007
- **Description**: Write integration test for GET /api/portfolios endpoint.
- **Acceptance Criteria**:
  - [ ] Test with authenticated user
  - [ ] Test returns only user's portfolios
  - [ ] Test returns 401 if not authenticated
  - [ ] Test error handling
  - [ ] All tests passing
- **Files**:
  - `__tests__/integration/api/portfolios.test.ts`

#### T032: Create Integration Test for POST /api/portfolios
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T008
- **Description**: Write integration test for POST /api/portfolios endpoint.
- **Acceptance Criteria**:
  - [ ] Test creates portfolio successfully
  - [ ] Test validation errors return 400
  - [ ] Test sets user_id correctly
  - [ ] Test returns 401 if not authenticated
  - [ ] All tests passing
- **Files**:
  - `__tests__/integration/api/portfolios.test.ts`

#### T033: Create Integration Test for GET /api/portfolios/[id]
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T009
- **Description**: Write integration test for GET /api/portfolios/[id] endpoint with nested data.
- **Acceptance Criteria**:
  - [ ] Test returns portfolio with nested assets and transactions
  - [ ] Test returns 404 for non-existent portfolio
  - [ ] Test RLS prevents access to other users' portfolios
  - [ ] Test invalid UUID returns 400
  - [ ] All tests passing
- **Files**:
  - `__tests__/integration/api/portfolios.test.ts`

#### T034: Create Integration Test for Asset Endpoints
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: T013, T014, T015, T016, T017
- **Description**: Write integration tests for all asset endpoints (GET list, POST create, GET by ID, PUT update, DELETE).
- **Acceptance Criteria**:
  - [ ] Test all asset endpoints
  - [ ] Test duplicate asset constraint
  - [ ] Test nested transactions in GET by ID
  - [ ] Test RLS enforcement
  - [ ] All tests passing
- **Files**:
  - `__tests__/integration/api/assets.test.ts`

#### T035: Create Integration Test for Transaction Endpoints
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 2 hours
- **Dependencies**: T019, T021, T023, T024, T025
- **Description**: Write integration tests for all transaction endpoints including business logic.
- **Acceptance Criteria**:
  - [ ] Test all transaction endpoints
  - [ ] Test pagination works correctly
  - [ ] Test BUY transaction updates asset
  - [ ] Test SELL transaction doesn't update asset
  - [ ] Test business logic calculations
  - [ ] Test RLS enforcement
  - [ ] All tests passing
- **Files**:
  - `__tests__/integration/api/transactions.test.ts`

#### T036: Create Integration Test for RLS Policy Enforcement
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: HIGH
- **Estimate**: 1.5 hours
- **Dependencies**: T012, T018, T026
- **Description**: Write integration tests to verify RLS policies prevent users from accessing other users' data.
- **Acceptance Criteria**:
  - [ ] Test user cannot access other users' portfolios
  - [ ] Test user cannot access other users' assets
  - [ ] Test user cannot access other users' transactions
  - [ ] Test all CRUD operations respect RLS
  - [ ] All tests passing
- **Files**:
  - `__tests__/integration/api/rls.test.ts`

#### T037: Create E2E Test for Portfolio Creation Flow
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T012
- **Description**: Write E2E test using Playwright for complete portfolio creation flow.
- **Acceptance Criteria**:
  - [ ] Test user can create portfolio
  - [ ] Test user can view portfolio
  - [ ] Test user can update portfolio
  - [ ] Test user can delete portfolio
  - [ ] All tests passing
- **Files**:
  - `e2e/api/portfolio-flow.spec.ts`

#### T038: Create E2E Test for Asset and Transaction Flow
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 1.5 hours
- **Dependencies**: T018, T026
- **Description**: Write E2E test using Playwright for complete asset creation and transaction recording flow.
- **Acceptance Criteria**:
  - [ ] Test user can create asset
  - [ ] Test user can record BUY transaction
  - [ ] Test asset updates after BUY transaction
  - [ ] Test user can record SELL transaction
  - [ ] Test cascade delete works
  - [ ] All tests passing
- **Files**:
  - `e2e/api/asset-transaction-flow.spec.ts`

#### T039: Create E2E Test for Unauthorized Access
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T012, T018, T026
- **Description**: Write E2E test using Playwright to verify unauthorized access attempts are blocked.
- **Acceptance Criteria**:
  - [ ] Test unauthenticated requests return 401
  - [ ] Test users cannot access other users' data
  - [ ] Test invalid tokens are rejected
  - [ ] All tests passing
- **Files**:
  - `e2e/api/unauthorized-access.spec.ts`

#### T040: Manual Testing Checklist
- **Status**: [ ] Pending
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: T026
- **Description**: Complete manual testing checklist using browser DevTools, curl, and Postman/Thunder Client.
- **Acceptance Criteria**:
  - [ ] Tested with browser DevTools Network tab
  - [ ] Tested with curl commands
  - [ ] Tested with Postman/Thunder Client
  - [ ] Verified all status codes
  - [ ] Verified error messages
  - [ ] Tested edge cases
  - [ ] Checklist completed
- **Files**:
  - `docs/api/manual-testing-checklist.md`

### Phase 6: Documentation & Finalization [Priority: MEDIUM]

#### T041: Document All API Endpoints
- **Status**: [ ] Pending
- **Type**: documentation
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: T026
- **Description**: Create comprehensive API documentation for all endpoints including request/response formats, error codes, and examples.
- **Acceptance Criteria**:
  - [ ] All 15 endpoints documented
  - [ ] Request/response formats documented
  - [ ] Error codes and messages documented
  - [ ] Authentication requirements documented
  - [ ] Usage examples provided
- **Files**:
  - `docs/api/endpoints.md`

#### T042: Document Business Logic
- **Status**: [ ] Pending
- **Type**: documentation
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T021
- **Description**: Document the business logic for BUY transaction asset update including calculation formulas and examples.
- **Acceptance Criteria**:
  - [ ] Business logic documented
  - [ ] Calculation formulas explained
  - [ ] Examples provided
  - [ ] Edge cases documented
- **Files**:
  - `docs/api/business-logic.md`

#### T043: Add JSDoc Comments to All Endpoints
- **Status**: [ ] Pending
- **Type**: documentation
- **Priority**: MEDIUM
- **Estimate**: 2 hours
- **Dependencies**: T026
- **Description**: Add JSDoc comments to all endpoint handlers for better code documentation.
- **Acceptance Criteria**:
  - [ ] All endpoints have JSDoc comments
  - [ ] Parameters documented
  - [ ] Return types documented
  - [ ] Examples included where helpful
- **Files**:
  - All `app/api/**/route.ts` files

#### T044: Document Error Handling Patterns
- **Status**: [ ] Pending
- **Type**: documentation
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T003
- **Description**: Document error handling patterns used across all endpoints.
- **Acceptance Criteria**:
  - [ ] Error handling patterns documented
  - [ ] Error response format documented
  - [ ] Status code usage documented
  - [ ] Examples provided
- **Files**:
  - `docs/api/error-handling.md`

#### T045: Update README with API Information
- **Status**: [ ] Pending
- **Type**: documentation
- **Priority**: MEDIUM
- **Estimate**: 0.5 hours
- **Dependencies**: T041
- **Description**: Update project README with API endpoint information and usage instructions.
- **Acceptance Criteria**:
  - [ ] API section added to README
  - [ ] Endpoint list included
  - [ ] Authentication instructions included
  - [ ] Links to detailed documentation included
- **Files**:
  - `README.md`

#### T046: Code Review for Consistency
- **Status**: [ ] Pending
- **Type**: review
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T026
- **Description**: Review all code for consistency, following established patterns and conventions.
- **Acceptance Criteria**:
  - [ ] All endpoints follow same pattern
  - [ ] Error handling is consistent
  - [ ] Validation is consistent
  - [ ] Code style is consistent
  - [ ] No code smells identified
- **Files**:
  - All `app/api/**/route.ts` files

#### T047: Verify All Success Criteria Met
- **Status**: [ ] Pending
- **Type**: review
- **Priority**: HIGH
- **Estimate**: 1 hour
- **Dependencies**: T040
- **Description**: Verify that all success criteria from the specification are met.
- **Acceptance Criteria**:
  - [ ] All 15 endpoints created and working
  - [ ] Authentication required for all endpoints
  - [ ] RLS policies working
  - [ ] Validation working
  - [ ] Error handling consistent
  - [ ] Business logic implemented
  - [ ] Nested queries working
  - [ ] Pagination working
  - [ ] All tests passing
- **Files**:
  - Success criteria checklist

#### T048: Check TypeScript Errors
- **Status**: [ ] Pending
- **Type**: review
- **Priority**: HIGH
- **Estimate**: 0.5 hours
- **Dependencies**: T026
- **Description**: Run TypeScript compiler to check for any type errors.
- **Acceptance Criteria**:
  - [ ] No TypeScript errors
  - [ ] All types are correct
  - [ ] Type safety verified
- **Files**:
  - TypeScript compilation output

#### T049: Verify All Tests Passing
- **Status**: [ ] Pending
- **Type**: review
- **Priority**: HIGH
- **Estimate**: 0.5 hours
- **Dependencies**: T030, T035, T038
- **Description**: Run all tests (unit, integration, E2E) to verify they all pass.
- **Acceptance Criteria**:
  - [ ] All unit tests passing
  - [ ] All integration tests passing
  - [ ] All E2E tests passing
  - [ ] Test coverage > 80%
- **Files**:
  - Test execution output

#### T050: Performance Check
- **Status**: [ ] Pending
- **Type**: review
- **Priority**: MEDIUM
- **Estimate**: 1 hour
- **Dependencies**: T026
- **Description**: Check API performance, verify query optimization, and ensure no N+1 query problems.
- **Acceptance Criteria**:
  - [ ] API response time < 500ms for simple queries
  - [ ] API response time < 2s for nested queries
  - [ ] No N+1 query problems
  - [ ] Database queries are efficient
- **Files**:
  - Performance test results

## Summary

### Task Distribution by Phase
- **Phase 1**: 6 tasks (Foundation & Shared Utilities)
- **Phase 2**: 6 tasks (Portfolio Endpoints)
- **Phase 3**: 6 tasks (Asset Endpoints)
- **Phase 4**: 8 tasks (Transaction Endpoints & Business Logic)
- **Phase 5**: 14 tasks (Testing & Validation)
- **Phase 6**: 10 tasks (Documentation & Finalization)

### Task Distribution by Type
- **Development**: 25 tasks
- **Testing**: 18 tasks
- **Documentation**: 7 tasks
- **Review**: 4 tasks
- **Setup**: 1 task

### Estimated Total Time
- **Development**: ~35 hours
- **Testing**: ~20 hours
- **Documentation**: ~8 hours
- **Review**: ~4 hours
- **Total**: ~67 hours (~12-15 working days)

## Notes

- Follow existing code patterns from authentication implementation
- RLS policies handle authorization automatically - no manual checks needed
- Use Zod schemas for all input validation
- Return consistent error format: `{ error: string, details?: any }`
- Business logic (asset update after BUY) should be atomic
- Test each endpoint as you create it
- Middleware protects `/api/*` routes automatically

