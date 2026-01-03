# Developer Guide: Portfolio Tracker Database

## Quick Start

### Prerequisites

- Supabase project configured
- Database migration run successfully
- TypeScript types generated

### Basic Operations

#### Create a Portfolio

```typescript
import { createClient } from '@/lib/supabase/server';
import { CreatePortfolioSchema } from '@/lib/types/portfolio';

const supabase = await createClient();

const portfolioData = CreatePortfolioSchema.parse({
  name: 'My Investment Portfolio',
});

const { data, error } = await supabase
  .from('portfolios')
  .insert(portfolioData)
  .select()
  .single();

if (error) {
  console.error('Error creating portfolio:', error);
}
```

#### Create an Asset

```typescript
import { CreateAssetSchema, AssetType } from '@/lib/types/portfolio';

const assetData = CreateAssetSchema.parse({
  portfolio_id: portfolioId,
  symbol: 'AAPL',
  quantity: 10.5,
  average_buy_price: 150.00,
  type: AssetType.STOCK,
});

const { data, error } = await supabase
  .from('assets')
  .insert(assetData)
  .select()
  .single();
```

#### Create a Transaction

```typescript
import { CreateTransactionSchema, TransactionType } from '@/lib/types/portfolio';

const transactionData = CreateTransactionSchema.parse({
  asset_id: assetId,
  type: TransactionType.BUY,
  amount: 10,
  price: 150.00,
  date: new Date().toISOString(),
  transaction_cost: 1.50,
});

const { data, error } = await supabase
  .from('transactions')
  .insert(transactionData)
  .select()
  .single();
```

## Querying Data

### Get User's Portfolios

```typescript
const { data: portfolios, error } = await supabase
  .from('portfolios')
  .select('*')
  .order('created_at', { ascending: false });
```

### Get Assets in a Portfolio

```typescript
const { data: assets, error } = await supabase
  .from('assets')
  .select('*')
  .eq('portfolio_id', portfolioId)
  .order('symbol');
```

### Get Transactions for an Asset

```typescript
const { data: transactions, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('asset_id', assetId)
  .order('date', { ascending: false });
```

### Get Portfolio with Assets and Transactions

```typescript
const { data: portfolio, error } = await supabase
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

## Updating Data

### Update Portfolio

```typescript
import { UpdatePortfolioSchema } from '@/lib/types/portfolio';

const updateData = UpdatePortfolioSchema.parse({
  name: 'Updated Portfolio Name',
});

const { data, error } = await supabase
  .from('portfolios')
  .update(updateData)
  .eq('id', portfolioId)
  .select()
  .single();
```

### Update Asset

```typescript
import { UpdateAssetSchema } from '@/lib/types/portfolio';

const updateData = UpdateAssetSchema.parse({
  quantity: 15.0,
  average_buy_price: 155.00,
});

const { data, error } = await supabase
  .from('assets')
  .update(updateData)
  .eq('id', assetId)
  .select()
  .single();
```

## Deleting Data

### Delete Portfolio (Cascades to Assets and Transactions)

```typescript
const { error } = await supabase
  .from('portfolios')
  .delete()
  .eq('id', portfolioId);
```

### Delete Asset (Cascades to Transactions)

```typescript
const { error } = await supabase
  .from('assets')
  .delete()
  .eq('id', assetId);
```

### Delete Transaction

```typescript
const { error } = await supabase
  .from('transactions')
  .delete()
  .eq('id', transactionId);
```

## Data Validation

### Using Zod Schemas

Always validate data before inserting or updating:

```typescript
import { CreateAssetSchema } from '@/lib/types/portfolio';

try {
  const validatedData = CreateAssetSchema.parse(rawData);
  // Use validatedData for database operations
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation errors:', error.errors);
  }
}
```

## RLS Considerations

### Automatic User Filtering

RLS automatically filters data by user. You don't need to add `user_id` filters manually:

```typescript
// RLS automatically filters to current user's portfolios
const { data } = await supabase
  .from('portfolios')
  .select('*');
// Only returns portfolios for auth.uid()
```

### Cross-User Access Prevention

RLS prevents users from accessing other users' data:

```typescript
// This will return empty if portfolio belongs to another user
const { data } = await supabase
  .from('portfolios')
  .select('*')
  .eq('id', 'other-user-portfolio-id');
```

## Error Handling

### Constraint Violations

```typescript
const { error } = await supabase
  .from('assets')
  .insert({
    portfolio_id: portfolioId,
    symbol: 'AAPL',
    quantity: -10, // Invalid: negative quantity
    average_buy_price: 150.00,
    type: AssetType.STOCK,
  });

if (error) {
  if (error.code === '23514') { // CHECK constraint violation
    console.error('Invalid data: quantity must be positive');
  }
}
```

### Unique Constraint Violations

```typescript
const { error } = await supabase
  .from('assets')
  .insert({
    portfolio_id: portfolioId,
    symbol: 'AAPL',
    quantity: 10,
    average_buy_price: 150.00,
    type: AssetType.STOCK,
  });

if (error) {
  if (error.code === '23505') { // Unique constraint violation
    console.error('Asset already exists in this portfolio');
  }
}
```

## Best Practices

1. **Always validate data** using Zod schemas before database operations
2. **Handle errors gracefully** - check error codes and provide user-friendly messages
3. **Use transactions** for multi-step operations when needed
4. **Leverage RLS** - don't manually filter by user_id, RLS handles it
5. **Use indexes** - queries on indexed columns (symbol, date) are faster
6. **Batch operations** when possible for better performance
7. **Monitor query performance** - use EXPLAIN ANALYZE for slow queries

## Common Patterns

### Calculate Portfolio Value

```typescript
const { data: assets } = await supabase
  .from('assets')
  .select('quantity, average_buy_price')
  .eq('portfolio_id', portfolioId);

const totalValue = assets?.reduce((sum, asset) => {
  return sum + (asset.quantity * asset.average_buy_price);
}, 0) || 0;
```

### Get Recent Transactions

```typescript
const { data: transactions } = await supabase
  .from('transactions')
  .select('*, assets!inner(portfolio_id)')
  .eq('assets.portfolio_id', portfolioId)
  .order('date', { ascending: false })
  .limit(10);
```

### Filter Assets by Type

```typescript
const { data: stocks } = await supabase
  .from('assets')
  .select('*')
  .eq('portfolio_id', portfolioId)
  .eq('type', AssetType.STOCK);
```

