# API Endpoint Structure Patterns

This document describes the standard patterns used for all API endpoints in the Portfolio Tracker application.

## Standard Endpoint Structure

All endpoints follow this consistent structure:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { validateUUIDOrThrow } from '@/lib/api/utils';
import { unauthorized, badRequest, notFound, internalServerError } from '@/lib/api/errors';
import { validateWithZod } from '@/lib/api/utils';
import { CreatePortfolioSchema } from '@/lib/types/portfolio';

export async function GET() {
  try {
    // 1. Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // 2. Get Supabase client
    const supabase = await createClient();

    // 3. Perform operation
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false });

    // 4. Handle errors
    if (error) {
      return internalServerError(error.message);
    }

    // 5. Return success
    return NextResponse.json({ data });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}
```

## Pattern Components

### 1. Authentication Check

Always check authentication first:

```typescript
const user = await getCurrentUser();
if (!user) {
  return unauthorized();
}
```

### 2. UUID Validation

For endpoints with UUID parameters:

```typescript
import { validateUUIDOrThrow } from '@/lib/api/utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate UUID
    try {
      validateUUIDOrThrow(params.id);
    } catch {
      return badRequest('Invalid UUID format');
    }
    
    // ... rest of endpoint
  } catch (error) {
    return internalServerError('Internal server error');
  }
}
```

### 3. Request Body Validation

For POST/PUT endpoints:

```typescript
import { validateWithZod } from '@/lib/api/utils';
import { CreatePortfolioSchema } from '@/lib/types/portfolio';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // Parse and validate request body
    const body = await request.json();
    let validatedData;
    try {
      validatedData = validateWithZod(CreatePortfolioSchema, body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return badRequest('Validation error', error.errors);
      }
      throw error;
    }

    // ... rest of endpoint
  } catch (error) {
    return internalServerError('Internal server error');
  }
}
```

### 4. Error Handling

Use consistent error responses:

```typescript
import {
  unauthorized,
  badRequest,
  notFound,
  internalServerError,
} from '@/lib/api/errors';

// Authentication error
return unauthorized();

// Validation error
return badRequest('Validation error', zodError.errors);

// Not found error
return notFound('Portfolio not found');

// Database error
if (error) {
  return internalServerError(error.message);
}

// Generic error
catch (error) {
  return internalServerError('Internal server error');
}
```

### 5. Nested Queries

For endpoints that return nested data:

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

### 6. Pagination

For list endpoints with pagination:

```typescript
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const order = searchParams.get('order') || 'desc';

    const supabase = await createClient();
    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('asset_id', assetId)
      .order('date', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      return internalServerError(error.message);
    }

    return NextResponse.json({ data, count });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}
```

## Response Formats

### Success Response

```typescript
// Single item
return NextResponse.json({ data: portfolio }, { status: 201 });

// List
return NextResponse.json({ data: portfolios });

// With pagination
return NextResponse.json({ data: transactions, count: totalCount });
```

### Error Response

```typescript
// Standard error
{
  "error": "Error message",
  "details": { /* optional details */ }
}
```

## Status Codes

- `200 OK` - Success (GET, PUT, DELETE)
- `201 Created` - Success (POST)
- `400 Bad Request` - Validation error or invalid input
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Best Practices

1. **Always check authentication first** - Before any database operations
2. **Validate UUIDs** - Use `validateUUIDOrThrow()` for route parameters
3. **Validate request bodies** - Use Zod schemas for all inputs
4. **Use consistent error responses** - Use helper functions from `lib/api/errors`
5. **Handle database errors** - Check `error` from Supabase responses
6. **Use try-catch** - Wrap entire endpoint in try-catch for unexpected errors
7. **Return proper status codes** - Use appropriate HTTP status codes
8. **RLS handles authorization** - No need to manually check ownership, RLS does it

## Example: Complete Endpoint

```typescript
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { validateUUIDOrThrow, validateWithZod } from '@/lib/api/utils';
import {
  unauthorized,
  badRequest,
  notFound,
  internalServerError,
} from '@/lib/api/errors';
import { CreatePortfolioSchema } from '@/lib/types/portfolio';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const user = await getCurrentUser();
    if (!user) {
      return unauthorized();
    }

    // 2. Parse and validate request body
    const body = await request.json();
    let validatedData;
    try {
      validatedData = validateWithZod(CreatePortfolioSchema, body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return badRequest('Validation error', error.errors);
      }
      throw error;
    }

    // 3. Get Supabase client
    const supabase = await createClient();

    // 4. Perform operation
    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single();

    // 5. Handle errors
    if (error) {
      return internalServerError(error.message);
    }

    // 6. Return success
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return internalServerError('Internal server error');
  }
}
```

