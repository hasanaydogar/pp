# Token Refresh Mechanism

## Overview

The application implements automatic token refresh to maintain user sessions without interruption. Tokens are refreshed proactively before expiration and automatically when expired.

## How It Works

### 1. Token Expiration

JWT tokens have an expiration time (`exp` claim). Access tokens typically expire after 1 hour, while refresh tokens last longer (7-30 days).

### 2. Proactive Refresh

The middleware checks token expiration on every request:

```typescript
if (session?.access_token && session.expires_at) {
  const expiresAt = session.expires_at * 1000;
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (expiresAt - now < fiveMinutes) {
    // Token expires soon, refresh it
    await supabase.auth.refreshSession();
  }
}
```

**Benefits:**
- Prevents failed requests due to expired tokens
- Seamless user experience
- No interruption in user flow

### 3. Automatic Refresh on 401

When a request fails with 401 Unauthorized, the client-side fetch wrapper automatically refreshes the token and retries:

```typescript
if (response.status === 401 && retry && retryCount < 1) {
  const newToken = await refreshToken();
  if (newToken) {
    // Retry request with new token
    return fetch(url, { ...options, headers });
  }
}
```

### 4. Token Refresh Queue

The refresh queue prevents multiple concurrent refresh requests:

```typescript
class TokenRefreshQueue {
  async enqueue(refreshFn: RefreshCallback) {
    // Queue refresh requests
    // Execute single refresh operation
    // Resolve all queued requests with same token
  }
}
```

**Benefits:**
- Prevents duplicate refresh calls
- Efficient token management
- Consistent token state

## Refresh Endpoints

### Server-Side Refresh

**API Route**: `/api/auth/refresh`

```typescript
POST /api/auth/refresh
```

**Response**:
```json
{
  "success": true,
  "access_token": "new-access-token",
  "expires_at": 1234567890
}
```

### Client-Side Refresh

Uses Supabase client directly:

```typescript
const { data: { session } } = await supabase.auth.refreshSession();
```

## Token Storage

### Server-Side (httpOnly Cookies)

Tokens are stored in httpOnly cookies by Supabase SSR:
- `sb-access-token` - Access token
- `sb-refresh-token` - Refresh token

**Security:**
- httpOnly: JavaScript cannot access
- secure: HTTPS only in production
- sameSite: CSRF protection

### Client-Side (Session Storage)

Supabase client manages session in browser:
- Used for client-side components
- Automatically synced with cookies
- Cleared on sign out

## Refresh Scenarios

### Scenario 1: Normal Request Flow

1. User makes request
2. Middleware checks token expiration
3. Token valid (> 5 minutes remaining)
4. Request proceeds normally

### Scenario 2: Proactive Refresh

1. User makes request
2. Middleware checks token expiration
3. Token expires in < 5 minutes
4. Token refreshed proactively
5. Request proceeds with fresh token

### Scenario 3: Expired Token

1. User makes request
2. Token already expired
3. Request fails with 401
4. Client-side wrapper refreshes token
5. Request retried with new token

### Scenario 4: Refresh Token Expired

1. Refresh token expired
2. Refresh fails
3. User redirected to login
4. User must re-authenticate

## Configuration

### Refresh Threshold

Default: 5 minutes before expiration

To change:
```typescript
const fiveMinutes = 5 * 60 * 1000; // Adjust this value
```

### Retry Logic

Default: Retry once after refresh

To change:
```typescript
if (response.status === 401 && retry && retryCount < 1) {
  // Adjust retryCount limit
}
```

## Error Handling

### Refresh Failures

- Network errors: Retry with exponential backoff
- Invalid refresh token: Redirect to login
- Server errors: Log and show error message

### Token Validation

- Decode JWT to check expiration
- Validate token structure
- Handle malformed tokens gracefully

## Best Practices

1. **Always refresh proactively** - Prevents user-facing errors
2. **Use refresh queue** - Prevents duplicate refresh calls
3. **Handle refresh failures** - Redirect to login if refresh fails
4. **Monitor refresh frequency** - Too many refreshes indicate issues
5. **Log refresh events** - Helps debug authentication issues

## Monitoring

### Metrics to Track

- Token refresh success rate
- Average time to refresh
- Number of refresh failures
- Refresh token expiration events

### Logging

```typescript
console.log('Token refresh:', {
  success: true,
  expiresAt: session.expires_at,
  refreshedAt: Date.now(),
});
```

## Troubleshooting

### Issue: Frequent Refresh Failures

**Possible Causes:**
- Network issues
- Supabase service issues
- Invalid refresh token

**Solutions:**
- Check network connectivity
- Verify Supabase status
- Clear cookies and re-authenticate

### Issue: Tokens Not Refreshing

**Possible Causes:**
- Middleware not running
- Token expiration check failing
- Refresh endpoint not accessible

**Solutions:**
- Verify middleware configuration
- Check token expiration logic
- Test refresh endpoint directly

