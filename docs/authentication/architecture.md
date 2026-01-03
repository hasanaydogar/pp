# Authentication Architecture

## Overview

This application implements OAuth2 authentication using Supabase Auth with JWT tokens. The architecture follows Next.js 15+ App Router patterns with Server Components, Server Actions, and Middleware.

## Architecture Diagram

```
┌─────────────┐
│   Browser    │
└──────┬───────┘
       │
       │ 1. User clicks "Sign in with Google"
       ▼
┌─────────────────────────────────┐
│   Next.js App Router             │
│   ┌───────────────────────────┐ │
│   │  Server Action            │ │
│   │  signInWithProvider()     │ │
│   └───────────┬───────────────┘ │
│               │                  │
│               │ 2. Initiate OAuth2
│               ▼                  │
│   ┌───────────────────────────┐ │
│   │  Supabase Client          │ │
│   │  (Server-side)            │ │
│   └───────────┬───────────────┘ │
└───────────────┼──────────────────┘
                │
                │ 3. Redirect to Google
                ▼
┌───────────────────────────────┐
│   Google OAuth2               │
│   Consent Screen              │
└───────────┬───────────────────┘
            │
            │ 4. User grants permission
            ▼
┌───────────────────────────────┐
│   Callback Handler            │
│   /api/auth/callback          │
│   ┌─────────────────────────┐│
│   │ Exchange code for tokens ││
│   │ Store in httpOnly cookies││
│   └───────────┬──────────────┘│
└───────────────┼───────────────┘
                │
                │ 5. Redirect to app
                ▼
┌───────────────────────────────┐
│   Middleware                  │
│   ┌─────────────────────────┐│
│   │ Check authentication      ││
│   │ Refresh tokens if needed ││
│   │ Protect routes           ││
│   └──────────────────────────┘│
└───────────────────────────────┘
```

## Components

### 1. Server Actions (`lib/auth/actions.ts`)

Server Actions handle authentication operations:

- `signInWithProvider(provider)` - Initiates OAuth2 flow
- `signOut()` - Signs out user and clears session
- `getCurrentUser()` - Retrieves current authenticated user

### 2. Middleware (`middleware.ts`)

Middleware runs on every request:

- Checks authentication status
- Refreshes tokens proactively (if expiring soon)
- Protects routes (redirects unauthenticated users)
- Redirects authenticated users away from login

### 3. Supabase Clients

**Server Client** (`lib/supabase/server.ts`):
- Used in Server Components and Server Actions
- Handles httpOnly cookies automatically
- Works with Next.js cookies API

**Client Client** (`lib/supabase/client.ts`):
- Used in Client Components
- Browser-based Supabase client
- Handles client-side auth state

### 4. State Management (`lib/store/auth-store.ts`)

Zustand store for client-side auth state:

- `user` - Current authenticated user
- `loading` - Loading state
- `setUser()` - Update user state
- `setLoading()` - Update loading state
- `clearAuth()` - Clear authentication

### 5. Token Management

**Token Utilities** (`lib/auth/token.ts`):
- `decodeJWT()` - Decode JWT token
- `isTokenExpired()` - Check if token is expired
- `getTokenExpirationTime()` - Get token expiration time

**Token Refresh Queue** (`lib/auth/token-refresh.ts`):
- Prevents concurrent refresh requests
- Queues multiple refresh requests
- Ensures single refresh operation

**Token Utilities** (`lib/auth/utils.ts`):
- `getAccessToken()` - Get current access token
- `refreshToken()` - Refresh access token
- `getAuthHeaders()` - Get Authorization headers

## Authentication Flow

### Sign In Flow

1. User visits `/login` page
2. Clicks "Sign in with Google" button
3. Server Action `signInWithProvider('google')` is called
4. Supabase initiates OAuth2 flow with Google
5. User redirected to Google consent screen
6. After consent, Google redirects to `/api/auth/callback?code=...`
7. Callback handler exchanges code for tokens via Supabase
8. Tokens stored in httpOnly cookies (handled by Supabase SSR)
9. User redirected to `/test` or protected route

### Token Refresh Flow

1. Middleware checks token expiration on each request
2. If token expires in < 5 minutes, proactively refresh
3. Refresh queue prevents concurrent refresh requests
4. New tokens stored in cookies
5. Request continues with fresh token

### Sign Out Flow

1. User clicks "Sign Out" button
2. Server Action `signOut()` is called
3. Supabase clears session and cookies
4. User redirected to `/login`
5. Client-side state cleared

## Route Protection

### Protected Routes

Routes that require authentication:
- `/test` - Test page
- `/profile` - User profile

### Public Routes

Routes accessible without authentication:
- `/login` - Login page
- `/api/auth/callback` - OAuth2 callback

### Middleware Logic

```typescript
if (isProtectedRoute && !user) {
  redirect('/login?redirect=/protected-route');
}

if (isLoginPage && user) {
  redirect('/test');
}
```

## Security Features

1. **httpOnly Cookies**: Tokens stored server-side only
2. **Secure Cookies**: Enabled in production (HTTPS only)
3. **Token Expiration**: Tokens expire and refresh automatically
4. **Proactive Refresh**: Tokens refreshed before expiration
5. **Route Protection**: Middleware protects routes
6. **CSRF Protection**: Handled by Supabase
7. **Rate Limiting**: Handled by Supabase

## Error Handling

- `AuthError` - Base authentication error
- `TokenError` - Token-related errors (401)
- `ProviderError` - OAuth2 provider errors
- Error formatting for user-friendly messages
- Error logging for debugging

## Testing Strategy

- **Unit Tests**: Token utilities, error handling, state management
- **Integration Tests**: OAuth2 flows, token injection, token refresh
- **E2E Tests**: Complete user flows (Playwright)

## Performance Considerations

- Proactive token refresh prevents failed requests
- Token refresh queue prevents duplicate refresh calls
- Middleware runs efficiently with minimal overhead
- Server Components reduce client-side JavaScript

