# Specification: Portfolio Tracker API Development

<!-- FEATURE_DIR: 002-portfolio-tracker -->
<!-- FEATURE_ID: 002 -->
<!-- SPEC_NUMBER: 002 -->
<!-- STATUS: pending -->
<!-- CREATED: 2025-11-30T12:00:00.000000 -->
<!-- RELATED_SPEC: spec-001.md -->

## Description

Develop RESTful API endpoints for the Portfolio Tracker application using Next.js 15 App Router Route Handlers. These endpoints will enable authenticated users to manage their portfolios, assets, and transactions through a secure, type-safe API layer that leverages the existing database schema and RLS policies.

## Context

This specification builds upon **spec-001.md** (Portfolio Tracker Database Schema), which has already been implemented and migrated. The database schema includes:
- `portfolios` table with RLS policies
- `assets` table with RLS policies
- `transactions` table with RLS policies
- TypeScript types and Zod schemas in `lib/types/portfolio.ts`
- Authentication system with middleware protection

## Requirements

### Functional Requirements

#### Must Have

##### 1. Portfolio Management Endpoints

- [ ] **GET /api/portfolios**
  - List all portfolios for the authenticated user
  - Returns array of portfolios ordered by `created_at DESC`
  - RLS automatically filters to current user's portfolios
  - Response: `{ data: Portfolio[] }`
  - Status codes: 200 OK, 401 Unauthorized, 500 Server Error

- [ ] **POST /api/portfolios**
  - Create a new portfolio for the authenticated user
  - Request body: `{ name: string }` (min 1, max 255 chars)
  - Validates input with `CreatePortfolioSchema`
  - Sets `user_id` from authenticated user
  - Response: `{ data: Portfolio }`
  - Status codes: 201 Created, 400 Bad Request, 401 Unauthorized, 500 Server Error

- [ ] **GET /api/portfolios/[id]**
  - Get portfolio details with nested assets and transactions
  - Validates UUID format
  - Returns portfolio with nested data structure
  - Response: `{ data: { ...Portfolio, assets: Array<{ ...Asset, transactions: Transaction[] }> } }`
  - Status codes: 200 OK, 400 Bad Request (invalid UUID), 404 Not Found, 401 Unauthorized

- [ ] **PUT /api/portfolios/[id]**
  - Update portfolio (e.g., change name)
  - Request body: `{ name?: string }` (optional)
  - Validates UUID and request body with `UpdatePortfolioSchema`
  - RLS ensures user can only update their own portfolios
  - Response: `{ data: Portfolio }`
  - Status codes: 200 OK, 400 Bad Request, 404 Not Found, 401 Unauthorized

- [ ] **DELETE /api/portfolios/[id]**
  - Delete portfolio (cascade deletes assets and transactions)
  - Validates UUID
  - RLS ensures user can only delete their own portfolios
  - Response: `{ message: string }`
  - Status codes: 200 OK, 404 Not Found, 401 Unauthorized

##### 2. Asset Management Endpoints

- [ ] **GET /api/portfolios/[portfolioId]/assets**
  - List all assets in a portfolio
  - Validates portfolioId UUID
  - RLS ensures user can only access assets in their portfolios
  - Response: `{ data: Asset[] }`
  - Status codes: 200 OK, 400 Bad Request, 401 Unauthorized

- [ ] **POST /api/portfolios/[portfolioId]/assets**
  - Add new asset to portfolio
  - Request body: `{ symbol: string, quantity: number, average_buy_price: number, type: AssetType }`
  - Validates portfolioId UUID and request body with `CreateAssetSchema`
  - RLS ensures user can only create assets in their portfolios
  - Handles duplicate asset constraint (same symbol + type in portfolio)
  - Response: `{ data: Asset }`
  - Status codes: 201 Created, 400 Bad Request (validation or duplicate), 404 Not Found, 401 Unauthorized

- [ ] **GET /api/assets/[id]**
  - Get asset details with transactions
  - Validates UUID
  - Returns asset with nested transactions
  - Response: `{ data: { ...Asset, transactions: Transaction[] } }`
  - Status codes: 200 OK, 400 Bad Request, 404 Not Found, 401 Unauthorized

- [ ] **PUT /api/assets/[id]**
  - Update asset (quantity, price, symbol, type)
  - Request body: `{ symbol?: string, quantity?: number, average_buy_price?: number, type?: AssetType }`
  - Validates UUID and request body with `UpdateAssetSchema`
  - RLS ensures user can only update their assets
  - Response: `{ data: Asset }`
  - Status codes: 200 OK, 400 Bad Request, 404 Not Found, 401 Unauthorized

- [ ] **DELETE /api/assets/[id]**
  - Delete asset (cascade deletes transactions)
  - Validates UUID
  - RLS ensures user can only delete their assets
  - Response: `{ message: string }`
  - Status codes: 200 OK, 404 Not Found, 401 Unauthorized

##### 3. Transaction Management Endpoints

- [ ] **GET /api/assets/[assetId]/transactions**
  - List all transactions for an asset
  - Supports pagination with query parameters: `limit`, `offset`, `order` (asc/desc)
  - Default: `limit=100`, `offset=0`, `order=desc`
  - Validates assetId UUID
  - RLS ensures user can only access transactions for their assets
  - Response: `{ data: Transaction[], count?: number }`
  - Status codes: 200 OK, 400 Bad Request, 401 Unauthorized

- [ ] **POST /api/assets/[assetId]/transactions**
  - Record new transaction (BUY or SELL)
  - Request body: `{ type: TransactionType, amount: number, price: number, date: string, transaction_cost?: number }`
  - Validates assetId UUID and request body with `CreateTransactionSchema`
  - RLS ensures user can only create transactions for their assets
  - **Business Logic**: After BUY transaction, automatically updates asset's `quantity` and `average_buy_price`
  - Average buy price calculation: `(oldTotal + newTotal) / newQuantity`
  - Response: `{ data: Transaction }`
  - Status codes: 201 Created, 400 Bad Request, 404 Not Found, 401 Unauthorized

- [ ] **GET /api/transactions/[id]**
  - Get transaction details
  - Validates UUID
  - RLS ensures user can only access their transactions
  - Response: `{ data: Transaction }`
  - Status codes: 200 OK, 400 Bad Request, 404 Not Found, 401 Unauthorized

- [ ] **PUT /api/transactions/[id]**
  - Update transaction
  - Request body: `{ type?: TransactionType, amount?: number, price?: number, date?: string, transaction_cost?: number }`
  - Validates UUID and request body with `UpdateTransactionSchema`
  - RLS ensures user can only update their transactions
  - Response: `{ data: Transaction }`
  - Status codes: 200 OK, 400 Bad Request, 404 Not Found, 401 Unauthorized

- [ ] **DELETE /api/transactions/[id]**
  - Delete transaction
  - Validates UUID
  - RLS ensures user can only delete their transactions
  - Response: `{ message: string }`
  - Status codes: 200 OK, 404 Not Found, 401 Unauthorized

#### Should Have

- [ ] **Error Handling**
  - Consistent error response format: `{ error: string, details?: any }`
  - Proper HTTP status codes (400, 401, 404, 500)
  - Detailed validation error messages for Zod validation failures
  - Database error messages properly formatted

- [ ] **Request Validation**
  - All request bodies validated with Zod schemas
  - UUID format validation for all route parameters
  - Type-safe request/response handling

- [ ] **Nested Query Support**
  - Portfolio endpoint returns nested assets and transactions
  - Asset endpoint returns nested transactions
  - Efficient query structure using Supabase select syntax

- [ ] **Pagination**
  - Transaction list endpoint supports limit/offset pagination
  - Returns total count for pagination UI
  - Default pagination values prevent excessive data transfer

#### Nice to Have

- [ ] **Filtering & Sorting**
  - Filter assets by type
  - Sort portfolios by name or date
  - Filter transactions by date range

- [ ] **Bulk Operations**
  - Bulk create transactions
  - Bulk update assets

- [ ] **Analytics Endpoints**
  - Portfolio value calculation
  - Asset performance metrics
  - Transaction history summary

### Technical Requirements

#### Architecture

- [ ] **Next.js 15 App Router Route Handlers**
  - Use Route Handlers (`route.ts` files) for API endpoints
  - Support HTTP methods: GET, POST, PUT, DELETE
  - Proper async/await handling

- [ ] **File Structure**
  ```
  app/api/
  ├── portfolios/
  │   ├── route.ts                    # GET, POST /api/portfolios
  │   └── [id]/
  │       ├── route.ts                # GET, PUT, DELETE /api/portfolios/[id]
  │       └── assets/
  │           └── route.ts            # GET, POST /api/portfolios/[id]/assets
  ├── assets/
  │   └── [id]/
  │       ├── route.ts                # GET, PUT, DELETE /api/assets/[id]
  │       └── transactions/
  │           └── route.ts            # GET, POST /api/assets/[id]/transactions
  └── transactions/
      └── [id]/
          └── route.ts                # GET, PUT, DELETE /api/transactions/[id]
  ```

#### Dependencies

- [ ] **Supabase Client**
  - Use `createClient()` from `@/lib/supabase/server`
  - Server-side client with cookie-based authentication
  - Automatic RLS policy enforcement

- [ ] **Authentication**
  - Use `getCurrentUser()` from `@/lib/auth/actions`
  - All endpoints require authentication (middleware handles route protection)
  - Return 401 Unauthorized if user not authenticated

- [ ] **Type Safety**
  - Use TypeScript types from `lib/types/portfolio.ts`
  - Use Zod schemas for runtime validation
  - Type-safe request/response handling

- [ ] **Error Handling**
  - Try-catch blocks for all endpoints
  - Proper error propagation
  - User-friendly error messages

#### Business Logic

- [ ] **Asset Update After BUY Transaction**
  - When BUY transaction is created:
    1. Fetch current asset: `quantity`, `average_buy_price`
    2. Calculate new values:
       - `oldTotal = quantity * average_buy_price`
       - `newTotal = transaction.amount * transaction.price`
       - `newQuantity = quantity + transaction.amount`
       - `newAveragePrice = (oldTotal + newTotal) / newQuantity`
    3. Update asset with new `quantity` and `average_buy_price`
  - This logic should be atomic (transaction should be rolled back if asset update fails)

#### Security

- [ ] **Authentication Required**
  - All endpoints check authentication first
  - Middleware protects `/api/*` routes
  - Return 401 if not authenticated

- [ ] **RLS Policy Enforcement**
  - RLS policies automatically filter data by user
  - No manual ownership checks needed (RLS handles it)
  - Users can only access their own portfolios/assets/transactions

- [ ] **Input Validation**
  - All inputs validated with Zod schemas
  - UUID format validation for route parameters
  - Prevent SQL injection through Supabase client

- [ ] **Error Information**
  - Don't expose sensitive database errors to clients
  - Return generic error messages for 500 errors
  - Detailed validation errors for 400 errors

### Implementation Guidelines

#### Code Patterns

- [ ] **Standard Endpoint Structure**
  ```typescript
  export async function GET() {
    try {
      // 1. Check authentication
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // 2. Get Supabase client
      const supabase = await createClient();

      // 3. Perform operation
      const { data, error } = await supabase.from('table').select('*');

      // 4. Handle errors
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // 5. Return success
      return NextResponse.json({ data });
    } catch (error) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  ```

- [ ] **UUID Validation**
  ```typescript
  import { z } from 'zod';
  const UUIDSchema = z.string().uuid();
  try {
    UUIDSchema.parse(id);
  } catch {
    return NextResponse.json(
      { error: 'Invalid UUID format' },
      { status: 400 }
    );
  }
  ```

- [ ] **Zod Validation**
  ```typescript
  import { CreatePortfolioSchema } from '@/lib/types/portfolio';
  try {
    const validatedData = CreatePortfolioSchema.parse(requestBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
  ```

- [ ] **Nested Queries**
  ```typescript
  const { data, error } = await supabase
    .from('portfolios')
    .select(`
      *,
      assets (
        *,
        transactions (*)
      )
    `)
    .eq('id', portfolioId)
    .single();
  ```

- [ ] **Pagination**
  ```typescript
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');
  const order = searchParams.get('order') || 'desc';

  const { data, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('asset_id', assetId)
    .order('date', { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);
  ```

## Dependencies

### Existing Dependencies
- `next` (15+) - App Router Route Handlers
- `@supabase/ssr` - Supabase server-side client
- `zod` - Runtime validation
- `@/lib/supabase/server` - Supabase client utility
- `@/lib/auth/actions` - Authentication utilities
- `@/lib/types/portfolio` - TypeScript types and Zod schemas

### No New Dependencies Required
All necessary dependencies are already installed.

## Testing Strategy

### Unit Tests
- [ ] Test UUID validation logic
- [ ] Test Zod schema validation
- [ ] Test error handling patterns

### Integration Tests
- [ ] Test each endpoint with authenticated user
- [ ] Test RLS policy enforcement (users can't access other users' data)
- [ ] Test nested queries return correct structure
- [ ] Test pagination works correctly
- [ ] Test business logic (asset update after BUY transaction)

### E2E Tests
- [ ] Test complete portfolio creation flow
- [ ] Test asset creation and transaction recording
- [ ] Test cascade delete (portfolio → assets → transactions)
- [ ] Test unauthorized access attempts

### Manual Testing
- [ ] Test with browser DevTools Network tab
- [ ] Test with curl commands
- [ ] Test with Postman/Thunder Client
- [ ] Verify all status codes
- [ ] Verify error messages

## Success Criteria

- [ ] All 15 endpoints created and working
- [ ] Authentication required for all endpoints
- [ ] RLS policies working (users can only access their data)
- [ ] Validation working (Zod schemas reject invalid data)
- [ ] Error handling consistent across all endpoints
- [ ] Business logic implemented (asset update after BUY)
- [ ] Nested queries working (portfolio with assets and transactions)
- [ ] Pagination working (for transactions)
- [ ] All endpoints return proper HTTP status codes
- [ ] Type-safe request/response handling
- [ ] No TypeScript errors
- [ ] All tests passing

## Related Specifications

- **spec-001.md**: Portfolio Tracker Database Schema (prerequisite, completed)
- **Feature 001**: User Authentication (prerequisite, completed)

## Notes

- RLS policies handle authorization automatically - no manual ownership checks needed
- Use Zod schemas for all input validation
- Return consistent error format: `{ error: string, details?: any }`
- Use appropriate HTTP status codes
- Business logic (asset update after BUY) should be atomic
- All endpoints should check authentication first
- Use TypeScript types from `lib/types/portfolio.ts`
- Middleware protects `/api/*` routes automatically

## Implementation Order

1. Portfolio endpoints (GET list, POST create, GET by ID, PUT update, DELETE)
2. Asset endpoints (GET list, POST create, GET by ID, PUT update, DELETE)
3. Transaction endpoints (GET list, POST create, GET by ID, PUT update, DELETE)
4. Test each endpoint as you create it
5. Implement business logic (asset update after BUY)
6. Add pagination to transaction list endpoint
7. Write tests
8. Documentation

## References

- Next.js 15 Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Supabase JavaScript Client: https://supabase.com/docs/reference/javascript/introduction
- Zod Validation: https://zod.dev/
- Existing codebase: `lib/types/portfolio.ts`, `lib/supabase/server.ts`, `lib/auth/actions.ts`

