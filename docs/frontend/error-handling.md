# Error Handling Documentation

## Overview

The application provides comprehensive error handling through error boundaries, error utilities, and user-friendly error messages.

## Error Boundary

The `ErrorBoundary` component catches React errors in the component tree and displays a fallback UI.

### Usage

```typescript
import { ErrorBoundary } from '@/components/ui/error-boundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Custom Fallback

```typescript
<ErrorBoundary
  fallback={<div>Custom error UI</div>}
  onError={(error, errorInfo) => {
    // Log to error tracking service
    console.error('Error caught:', error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Error Message Component

The `ErrorMessage` component displays user-friendly error messages with optional retry functionality.

### Usage

```typescript
import { ErrorMessage } from '@/components/ui/error-message';

function MyComponent() {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={() => {
          // Retry logic
          setError(null);
          fetchData();
        }}
      />
    );
  }

  return <div>Content</div>;
}
```

## Error Utilities

### `detectErrorType(error)`

Detects the type of error.

```typescript
import { detectErrorType, ApiErrorType } from '@/lib/api/error-handler';

const type = detectErrorType(error);
if (type === ApiErrorType.NETWORK) {
  // Handle network error
}
```

### `extractErrorMessage(error)`

Extracts a user-friendly error message.

```typescript
import { extractErrorMessage } from '@/lib/api/error-handler';

const message = extractErrorMessage(error);
```

### `extractErrorDetails(error)`

Extracts error details (validation errors, etc.).

```typescript
import { extractErrorDetails } from '@/lib/api/error-handler';

const details = extractErrorDetails(error);
if (details) {
  // Display validation errors
}
```

### `isRetryable(error)`

Checks if an error is retryable.

```typescript
import { isRetryable } from '@/lib/api/error-handler';

if (isRetryable(error)) {
  // Show retry button
}
```

### `logError(error, context?)`

Logs error (development only by default).

```typescript
import { logError } from '@/lib/api/error-handler';

try {
  // Some operation
} catch (error) {
  logError(error, 'MyComponent');
}
```

## Error Types

- `NETWORK`: Network/connection errors
- `VALIDATION`: Input validation errors
- `AUTHENTICATION`: Authentication required
- `AUTHORIZATION`: Permission denied
- `NOT_FOUND`: Resource not found
- `SERVER`: Server errors (5xx)
- `UNKNOWN`: Unknown errors

## Best Practices

1. **Wrap components in ErrorBoundary** for critical sections
2. **Use ErrorMessage component** for user-facing errors
3. **Handle errors appropriately** based on error type
4. **Provide retry functionality** for retryable errors
5. **Log errors** for debugging (development) and monitoring (production)

