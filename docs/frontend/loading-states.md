# Loading States Documentation

## Overview

The application provides various loading state components and hooks for better UX during async operations.

## Loading Hook

The `useLoading` hook manages loading state for async operations.

### Usage

```typescript
import { useLoading } from '@/lib/hooks/use-loading';

function MyComponent() {
  const { loading, error, execute } = useLoading();

  const fetchData = async () => {
    const data = await execute(async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
    
    if (data) {
      // Handle success
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <div>Content</div>;
}
```

### Manual Control

```typescript
const {
  loading,
  error,
  startLoading,
  stopLoading,
  setLoadingError,
  reset,
} = useLoading();

const handleClick = async () => {
  startLoading();
  try {
    await someAsyncOperation();
    stopLoading();
  } catch (err) {
    setLoadingError(err as Error);
  }
};
```

## Skeleton Loaders

Skeleton loaders provide visual feedback while content is loading.

### Basic Skeleton

```typescript
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton variant="rectangular" width="100%" height={200} />
```

### Variants

- `text`: Text-like skeleton
- `circular`: Circular skeleton (for avatars)
- `rectangular`: Rectangular skeleton (for cards)

### Pre-built Variants

```typescript
import { SkeletonCard, SkeletonTable, SkeletonList } from '@/components/ui/skeleton';

// Card skeleton
<SkeletonCard />

// Table skeleton
<SkeletonTable />

// List skeleton
<SkeletonList />
```

## Spinner Component

The `Spinner` component displays a loading spinner.

### Usage

```typescript
import { Spinner } from '@/components/ui/spinner';

<Spinner size="md" color="primary" />
```

### Props

- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `color`: `'primary' | 'white' | 'zinc'` (default: `'primary'`)

## Loading Overlay

The `LoadingOverlay` component displays a loading overlay with backdrop blur.

### Usage

```typescript
import { LoadingOverlay } from '@/components/ui/loading-overlay';

<LoadingOverlay isLoading={loading} message="Loading data...">
  <YourContent />
</LoadingOverlay>
```

## Best Practices

1. **Use skeleton loaders** for initial page loads
2. **Use spinners** for button actions and inline loading
3. **Use loading overlay** for blocking operations
4. **Show loading state immediately** - don't wait for network delay
5. **Combine with error states** for complete UX

