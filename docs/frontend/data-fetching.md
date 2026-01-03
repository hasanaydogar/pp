# Data Fetching Documentation

## Overview

The application provides both Server Component utilities and Client Component hooks for data fetching.

## Server Components

Server Components run on the server and are ideal for initial data fetching.

### Server Utilities

```typescript
import {
  getPortfolios,
  getPortfolio,
  getPortfolioWithDetails,
  getAllAssets,
  getAsset,
  getAssetWithTransactions,
} from '@/lib/api/server';

// In a Server Component
export default async function PortfoliosPage() {
  const portfolios = await getPortfolios();
  
  return (
    <div>
      {portfolios.map((portfolio) => (
        <div key={portfolio.id}>{portfolio.name}</div>
      ))}
    </div>
  );
}
```

### Available Server Functions

- `getPortfolios()`: Fetch all portfolios
- `getPortfolio(id)`: Fetch single portfolio
- `getPortfolioWithDetails(id)`: Fetch portfolio with nested assets/transactions
- `getPortfolioAssets(portfolioId)`: Fetch assets for a portfolio
- `getAllAssets()`: Fetch all assets for the user
- `getAsset(id)`: Fetch single asset
- `getAssetWithTransactions(id)`: Fetch asset with transactions
- `getAssetTransactions(assetId, limit?, offset?)`: Fetch transactions with pagination

## Client Components (Hooks)

Client hooks are used for interactive data fetching and real-time updates.

### usePortfolios Hook

```typescript
import { usePortfolios } from '@/lib/hooks/use-portfolios';

function PortfoliosList() {
  const { portfolios, loading, error, refetch } = usePortfolios();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {portfolios.map((portfolio) => (
        <div key={portfolio.id}>{portfolio.name}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### usePortfolio Hook

```typescript
import { usePortfolio } from '@/lib/hooks/use-portfolio';

function PortfolioDetail({ id }: { id: string }) {
  const { portfolio, loading, error, refetch } = usePortfolio(id);

  // ...
}
```

### useAssets Hook

```typescript
import { useAssets } from '@/lib/hooks/use-assets';

// All assets
function AllAssets() {
  const { assets, loading, error } = useAssets();
  // ...
}

// Assets for a portfolio
function PortfolioAssets({ portfolioId }: { portfolioId: string }) {
  const { assets, loading, error } = useAssets({ portfolioId });
  // ...
}
```

### useAsset Hook

```typescript
import { useAsset } from '@/lib/hooks/use-asset';

function AssetDetail({ id }: { id: string }) {
  const { asset, loading, error, refetch } = useAsset(id);
  // ...
}
```

### useTransactions Hook

```typescript
import { useTransactions } from '@/lib/hooks/use-transactions';

function TransactionList({ assetId }: { assetId: string }) {
  const {
    transactions,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useTransactions({ assetId, limit: 10 });

  return (
    <div>
      {transactions.map((tx) => (
        <div key={tx.id}>{tx.type} - {tx.quantity}</div>
      ))}
      {hasMore && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}
```

## When to Use What

### Use Server Components When:
- Initial page load
- SEO is important
- Data doesn't change frequently
- No user interaction needed

### Use Client Hooks When:
- User interaction triggers data fetch
- Real-time updates needed
- Data changes frequently
- Interactive features (pagination, filtering, etc.)

## Best Practices

1. **Use Server Components** for initial data fetching
2. **Use Client Hooks** for interactive features
3. **Combine both** - Server Component for initial load, Client Hook for updates
4. **Handle loading states** appropriately
5. **Handle errors** gracefully
6. **Use refetch** for manual refresh

## Example: Hybrid Approach

```typescript
// Server Component (initial load)
export default async function PortfolioPage({ id }: { id: string }) {
  const portfolio = await getPortfolio(id);
  
  return <PortfolioClient initialPortfolio={portfolio} />;
}

// Client Component (updates)
'use client';
function PortfolioClient({ initialPortfolio }: { initialPortfolio: Portfolio }) {
  const { portfolio, refetch } = usePortfolio(initialPortfolio.id);
  const currentPortfolio = portfolio || initialPortfolio;
  
  return (
    <div>
      <h1>{currentPortfolio.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

