# Portfolio Tracker API Development - Detailed Prompt

## Context

You are working on a Next.js 15+ application with Supabase backend. The database schema for portfolio tracker is already created and migrated. Now you need to create RESTful API endpoints to interact with the database.

## Current State

- ✅ Database schema created (portfolios, assets, transactions tables)
- ✅ RLS policies active
- ✅ TypeScript types and Zod schemas ready (`lib/types/portfolio.ts`)
- ✅ Authentication system working (middleware protects routes)
- ✅ Supabase client utilities available (`lib/supabase/server.ts`)

## Task: Create Portfolio Tracker API Endpoints

Create RESTful API endpoints using Next.js 15 App Router Route Handlers for portfolio management operations.

## API Endpoints to Create

### 1. Portfolio Endpoints

#### `GET /api/portfolios`
**Purpose**: List all portfolios for the authenticated user

**Implementation**:
- Use `createClient()` from `@/lib/supabase/server`
- Query `portfolios` table
- RLS automatically filters to current user's portfolios
- Return array of portfolios
- Order by `created_at DESC`

**Response**:
```typescript
{
  data: Portfolio[];
  error?: string;
}
```

**Error Handling**:
- 401 if not authenticated (middleware handles this)
- 500 for database errors

#### `POST /api/portfolios`
**Purpose**: Create a new portfolio

**Request Body**:
```typescript
{
  name: string; // min 1, max 255 chars
}
```

**Implementation**:
- Validate request body with `CreatePortfolioSchema` from `lib/types/portfolio.ts`
- Use `createClient()` from `@/lib/supabase/server`
- Get current user with `getCurrentUser()` from `lib/auth/actions`
- Insert into `portfolios` table with `user_id` from authenticated user
- Return created portfolio

**Response**:
```typescript
{
  data: Portfolio;
  error?: string;
}
```

**Status Codes**:
- 201 Created on success
- 400 Bad Request for validation errors
- 401 Unauthorized if not authenticated
- 500 Server Error

#### `GET /api/portfolios/[id]`
**Purpose**: Get portfolio details with nested assets and transactions

**Implementation**:
- Validate UUID format
- Query portfolio with nested assets and transactions using Supabase select
- RLS ensures user can only access their own portfolios
- Return portfolio with nested data

**Response**:
```typescript
{
  data: {
    ...Portfolio,
    assets: Array<{
      ...Asset,
      transactions: Transaction[];
    }>;
  };
  error?: string;
}
```

**Status Codes**:
- 200 OK
- 404 Not Found if portfolio doesn't exist or doesn't belong to user
- 400 Bad Request for invalid UUID

#### `PUT /api/portfolios/[id]`
**Purpose**: Update portfolio (e.g., change name)

**Request Body**:
```typescript
{
  name?: string; // optional, min 1, max 255 chars
}
```

**Implementation**:
- Validate UUID and request body with `UpdatePortfolioSchema`
- Update portfolio in database
- RLS ensures user can only update their own portfolios
- Return updated portfolio

**Response**:
```typescript
{
  data: Portfolio;
  error?: string;
}
```

**Status Codes**:
- 200 OK
- 404 Not Found
- 400 Bad Request

#### `DELETE /api/portfolios/[id]`
**Purpose**: Delete portfolio (cascade deletes assets and transactions)

**Implementation**:
- Validate UUID
- Delete portfolio (cascade handled by database)
- RLS ensures user can only delete their own portfolios
- Return success message

**Response**:
```typescript
{
  message: string;
  error?: string;
}
```

**Status Codes**:
- 200 OK
- 404 Not Found

### 2. Asset Endpoints

#### `GET /api/portfolios/[portfolioId]/assets`
**Purpose**: List all assets in a portfolio

**Implementation**:
- Validate portfolioId UUID
- Query assets where `portfolio_id = portfolioId`
- RLS ensures user can only access assets in their portfolios
- Return array of assets

**Response**:
```typescript
{
  data: Asset[];
  error?: string;
}
```

#### `POST /api/portfolios/[portfolioId]/assets`
**Purpose**: Add new asset to portfolio

**Request Body**:
```typescript
{
  symbol: string; // min 1, max 20 chars
  quantity: number; // > 0
  average_buy_price: number; // > 0
  type: AssetType; // enum: STOCK, CRYPTO, etc.
}
```

**Implementation**:
- Validate portfolioId UUID
- Validate request body with `CreateAssetSchema`
- Verify portfolio belongs to user (RLS handles this)
- Insert asset with `portfolio_id`
- Return created asset

**Response**:
```typescript
{
  data: Asset;
  error?: string;
}
```

**Status Codes**:
- 201 Created
- 400 Bad Request (validation or duplicate asset)
- 404 Not Found (portfolio doesn't exist)

#### `GET /api/assets/[id]`
**Purpose**: Get asset details with transactions

**Implementation**:
- Validate UUID
- Query asset with nested transactions
- RLS ensures user can only access their assets
- Return asset with transactions

**Response**:
```typescript
{
  data: {
    ...Asset,
    transactions: Transaction[];
  };
  error?: string;
}
```

#### `PUT /api/assets/[id]`
**Purpose**: Update asset (quantity, price, etc.)

**Request Body**:
```typescript
{
  symbol?: string;
  quantity?: number; // > 0
  average_buy_price?: number; // > 0
  type?: AssetType;
}
```

**Implementation**:
- Validate UUID and request body with `UpdateAssetSchema`
- Update asset in database
- RLS ensures user can only update their assets
- Return updated asset

**Response**:
```typescript
{
  data: Asset;
  error?: string;
}
```

#### `DELETE /api/assets/[id]`
**Purpose**: Delete asset (cascade deletes transactions)

**Implementation**:
- Validate UUID
- Delete asset (cascade handled by database)
- RLS ensures user can only delete their assets
- Return success message

**Response**:
```typescript
{
  message: string;
  error?: string;
}
```

### 3. Transaction Endpoints

#### `GET /api/assets/[assetId]/transactions`
**Purpose**: List all transactions for an asset

**Query Parameters** (optional):
- `order=date` (asc/desc) - default: desc
- `limit=10` - default: 100
- `offset=0` - default: 0

**Implementation**:
- Validate assetId UUID
- Query transactions where `asset_id = assetId`
- Apply ordering, limit, offset
- RLS ensures user can only access transactions for their assets
- Return array of transactions

**Response**:
```typescript
{
  data: Transaction[];
  count?: number; // total count (for pagination)
  error?: string;
}
```

#### `POST /api/assets/[assetId]/transactions`
**Purpose**: Record new transaction

**Request Body**:
```typescript
{
  type: TransactionType; // BUY or SELL
  amount: number; // > 0
  price: number; // > 0
  date: string; // ISO datetime string
  transaction_cost?: number; // >= 0, defaults to 0
}
```

**Implementation**:
- Validate assetId UUID
- Validate request body with `CreateTransactionSchema`
- Verify asset belongs to user (RLS handles this)
- Insert transaction
- **Business Logic**: After BUY transaction, optionally update asset's average_buy_price
- Return created transaction

**Response**:
```typescript
{
  data: Transaction;
  error?: string;
}
```

**Status Codes**:
- 201 Created
- 400 Bad Request
- 404 Not Found

**Business Logic for BUY Transactions**:
```typescript
// After inserting BUY transaction:
// Calculate new average buy price
const oldTotal = asset.quantity * asset.average_buy_price;
const newTotal = transaction.amount * transaction.price;
const newQuantity = asset.quantity + transaction.amount;
const newAveragePrice = (oldTotal + newTotal) / newQuantity;

// Update asset
await supabase
  .from('assets')
  .update({
    quantity: newQuantity,
    average_buy_price: newAveragePrice
  })
  .eq('id', assetId);
```

#### `GET /api/transactions/[id]`
**Purpose**: Get transaction details

**Implementation**:
- Validate UUID
- Query transaction
- RLS ensures user can only access their transactions
- Return transaction

**Response**:
```typescript
{
  data: Transaction;
  error?: string;
}
```

#### `PUT /api/transactions/[id]`
**Purpose**: Update transaction

**Request Body**:
```typescript
{
  type?: TransactionType;
  amount?: number;
  price?: number;
  date?: string;
  transaction_cost?: number;
}
```

**Implementation**:
- Validate UUID and request body with `UpdateTransactionSchema`
- Update transaction
- RLS ensures user can only update their transactions
- Return updated transaction

**Response**:
```typescript
{
  data: Transaction;
  error?: string;
}
```

#### `DELETE /api/transactions/[id]`
**Purpose**: Delete transaction

**Implementation**:
- Validate UUID
- Delete transaction
- RLS ensures user can only delete their transactions
- Return success message

**Response**:
```typescript
{
  message: string;
  error?: string;
}
```

## File Structure

Create the following files:

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

## Implementation Guidelines

### 1. Use Existing Utilities

**Supabase Client**:
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```

**Authentication Check**:
```typescript
import { getCurrentUser } from '@/lib/auth/actions';

const user = await getCurrentUser();
if (!user) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

**Zod Validation**:
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
}
```

### 2. Error Handling Pattern

```typescript
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('portfolios').select('*');
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. UUID Validation

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

### 4. Nested Queries (Portfolio with Assets and Transactions)

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

### 5. Pagination (for Transactions)

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

### 6. Business Logic: Update Asset After BUY Transaction

```typescript
// After creating BUY transaction:
const { data: asset } = await supabase
  .from('assets')
  .select('quantity, average_buy_price')
  .eq('id', assetId)
  .single();

if (asset && transaction.type === 'BUY') {
  const oldTotal = asset.quantity * asset.average_buy_price;
  const newTotal = transaction.amount * transaction.price;
  const newQuantity = asset.quantity + transaction.amount;
  const newAveragePrice = (oldTotal + newTotal) / newQuantity;

  await supabase
    .from('assets')
    .update({
      quantity: newQuantity,
      average_buy_price: newAveragePrice
    })
    .eq('id', assetId);
}
```

## Testing

After creating endpoints, test them:

1. **Using Browser DevTools**:
   - Open Network tab
   - Make requests from frontend
   - Check responses

2. **Using curl**:
```bash
# Get portfolios
curl http://localhost:3000/api/portfolios \
  -H "Cookie: sb-access-token=..."

# Create portfolio
curl -X POST http://localhost:3000/api/portfolios \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"name":"Test Portfolio"}'
```

3. **Using Postman/Thunder Client**:
   - Set up authentication
   - Test all endpoints
   - Verify responses

## Success Criteria

- [ ] All endpoints created and working
- [ ] Authentication required (middleware handles this)
- [ ] RLS policies working (users can only access their data)
- [ ] Validation working (Zod schemas reject invalid data)
- [ ] Error handling consistent
- [ ] Business logic implemented (asset update after BUY)
- [ ] Nested queries working (portfolio with assets and transactions)
- [ ] Pagination working (for transactions)

## Example Implementation

Here's a complete example for `GET /api/portfolios`:

```typescript
// app/api/portfolios/route.ts
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get portfolios (RLS automatically filters to user's portfolios)
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { CreatePortfolioSchema } = await import('@/lib/types/portfolio');
    
    let validatedData;
    try {
      validatedData = CreatePortfolioSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Create portfolio
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        ...validatedData,
        user_id: user.id, // Set user_id from authenticated user
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Notes

- RLS policies handle authorization automatically - you don't need to manually check ownership
- Use Zod schemas for all input validation
- Return consistent error format: `{ error: string, details?: any }`
- Use appropriate HTTP status codes
- Business logic (asset update after BUY) should be in the transaction POST endpoint
- All endpoints should check authentication first
- Use TypeScript types from `lib/types/portfolio.ts`

## Dependencies

- `@/lib/supabase/server` - Supabase client
- `@/lib/auth/actions` - Authentication utilities
- `@/lib/types/portfolio` - Types and Zod schemas
- `next/server` - NextResponse, NextRequest
- `zod` - Validation

## Start Implementation

Begin with Portfolio endpoints, then Assets, then Transactions. Test each endpoint as you create it.

Good luck! 🚀

