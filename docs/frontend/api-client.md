# API Client Documentation

## Overview

The API client provides a centralized way to make authenticated API requests with automatic token injection, error handling, and retry logic.

## Usage

### Basic Usage

```typescript
import { apiClient } from '@/lib/api/client';

// GET request
const portfolios = await apiClient.get<Portfolio[]>('/portfolios');

// POST request
const newPortfolio = await apiClient.post<Portfolio>('/portfolios', {
  name: 'My Portfolio',
  base_currency: 'USD',
});

// PUT request
const updated = await apiClient.put<Portfolio>(`/portfolios/${id}`, {
  name: 'Updated Name',
});

// DELETE request
await apiClient.delete(`/portfolios/${id}`);
```

### Request Configuration

```typescript
// Skip authentication
const publicData = await apiClient.get('/public-endpoint', {
  skipAuth: true,
});

// Custom retry configuration
const data = await apiClient.get('/endpoint', {
  retries: 5,
  retryDelay: 2000, // 2 seconds
  timeout: 60000, // 60 seconds
});
```

### Error Handling

```typescript
import { ApiError, ApiErrorType } from '@/lib/api/types';

try {
  const data = await apiClient.get('/portfolios');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ApiErrorType.NETWORK:
        // Handle network error
        break;
      case ApiErrorType.AUTHENTICATION:
        // Handle auth error - redirect to login
        break;
      case ApiErrorType.VALIDATION:
        // Handle validation error
        console.error('Validation errors:', error.details);
        break;
      default:
        // Handle other errors
    }
  }
}
```

## Features

### Automatic Token Injection

The API client automatically injects the authentication token from Supabase session into request headers. No manual token management needed.

### Retry Logic

The client automatically retries failed requests:
- Network errors
- 5xx server errors
- Configurable retry attempts and delays
- Exponential backoff

### Error Transformation

All errors are transformed into `ApiError` instances with:
- User-friendly error messages
- Error type classification
- HTTP status codes
- Error details

### Timeout Handling

Requests have a default timeout of 30 seconds (configurable). Timeout errors are automatically retried.

## API Reference

### `createApiClient()`

Creates a new API client instance.

```typescript
import { createApiClient } from '@/lib/api/client';

const customClient = createApiClient();
```

### `apiClient.get<T>(url, config?)`

Make a GET request.

### `apiClient.post<T>(url, data?, config?)`

Make a POST request with JSON body.

### `apiClient.put<T>(url, data?, config?)`

Make a PUT request with JSON body.

### `apiClient.patch<T>(url, data?, config?)`

Make a PATCH request with JSON body.

### `apiClient.delete<T>(url, config?)`

Make a DELETE request.

## Best Practices

1. **Always use TypeScript types** for response data
2. **Handle errors appropriately** based on error type
3. **Use retry configuration** for critical requests
4. **Don't skip auth** unless absolutely necessary
5. **Use Server Components** for initial data fetching when possible

