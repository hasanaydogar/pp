# Specification: OAuth2 Authentication with JWT Tokens

<!-- FEATURE_DIR: 001-user-authentication -->
<!-- FEATURE_ID: 001 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2025-11-29T20:30:00.000000 -->

## Description
Implement OAuth2 authentication flow with JWT token management for the Next.js application. Users should be able to authenticate using OAuth2 providers (Google, Apple, GitHub, etc.) and receive JWT tokens for secure API access. The system should handle token refresh, secure storage, and automatic token renewal.

## Requirements

### Functional Requirements
- [ ] Users can authenticate using OAuth2 providers (Google, Apple, GitHub)
- [ ] Users receive JWT access tokens and refresh tokens upon successful authentication
- [ ] JWT tokens are securely stored using httpOnly cookies (server-side) or secure localStorage (client-side)
- [ ] Access tokens are automatically included in API requests via HTTP interceptors
- [ ] System automatically refreshes expired access tokens using refresh tokens
- [ ] Users can log out, which invalidates tokens and clears secure storage
- [ ] Authentication state persists across page reloads and browser sessions
- [ ] Users can view their authentication status and provider information
- [ ] System handles authentication errors gracefully with user-friendly messages
- [ ] [NEEDS CLARIFICATION]: Which OAuth2 providers should be supported initially? (Google, Apple, GitHub, or all?)

### Non-Functional Requirements
- **Performance**: 
  - Token refresh should complete within 2 seconds
  - Authentication flow should complete within 5 seconds
  - No blocking UI operations during authentication
- **Security**: 
  - JWT tokens must be stored using httpOnly cookies (preferred) or secure localStorage with XSS protection
  - Access tokens should be stored in memory when possible, refresh tokens in httpOnly cookies
  - Tokens must never be logged or exposed in error messages
  - Implement token expiration validation before API calls
  - Use HTTPS for all authentication endpoints
  - Implement proper PKCE (Proof Key for Code Exchange) flow for OAuth2
  - Use CSRF protection for authentication endpoints
- **Scalability**: 
  - Support multiple concurrent authentication sessions
  - Token refresh mechanism should handle rate limiting gracefully
  - Architecture should support adding new OAuth2 providers easily

## Acceptance Criteria
- [ ] Given a user opens the app for the first time, when they click "Sign in with Google", then they are redirected to Google OAuth2 consent screen
- [ ] Given a user completes OAuth2 authentication, when they grant permissions, then they receive JWT access and refresh tokens
- [ ] Given tokens are stored securely, when the page reloads, then the user remains authenticated
- [ ] Given an access token expires, when making an API request, then the system automatically refreshes the token using the refresh token
- [ ] Given a refresh token expires, when attempting to refresh, then the user is redirected to login screen
- [ ] Given a user clicks logout, when confirmed, then all tokens are cleared and user is redirected to login screen
- [ ] Given an authentication error occurs, when displayed to user, then error message is user-friendly and doesn't expose sensitive information
- [ ] Given a user is authenticated, when viewing profile, then their OAuth2 provider information is displayed

## Technical Considerations

### Dependencies
- **External APIs**: 
  - Supabase Auth API for OAuth2 flows
  - Google OAuth2 API
  - Apple Sign In API
  - GitHub OAuth2 API
- **Database Changes**: 
  - User table with OAuth2 provider information (provider_id, provider_type, email, avatar_url)
  - Token storage handled by Supabase (no direct database changes needed)
- **Third-party Libraries**: 
  - `@supabase/supabase-js` - Supabase client and authentication
  - `@supabase/ssr` - Supabase SSR support for Next.js
  - `next-auth` or `@auth/core` - Optional: Authentication framework (or use Supabase directly)
  - `zustand` or `jotai` - State management for client-side auth state
  - `axios` or native `fetch` - HTTP client with interceptors for token injection
  - `js-cookie` - Cookie management for token storage
  - `zod` - Schema validation for TypeScript types

### Implementation Notes
- Use Supabase Auth for OAuth2 provider integration (handles PKCE, token exchange, etc.)
- Use Next.js App Router with Server Components and Server Actions:
  - Server Components for initial auth state (no client-side JS needed)
  - Server Actions for authentication operations (signIn, signOut, refreshToken)
  - Client Components only where interactivity is needed
- Implement state management:
  - Use React Context or Zustand/Jotai for client-side auth state
  - Use Server Components for initial auth check (via Supabase server client)
  - Use middleware for route protection and token refresh
- Create TypeScript types/interfaces:
  - `AuthUser` - User information from OAuth2 provider
  - `AuthState` - Union type for authenticated/unauthenticated/loading states
  - Use Zod schemas for runtime validation
- Token storage strategy:
  - **Server-side**: Store refresh token in httpOnly cookie (secure, XSS-protected)
  - **Client-side**: Store access token in memory or secure localStorage
  - Use Supabase's built-in cookie handling via `@supabase/ssr`
- Implement Next.js middleware for:
  - Token injection in API routes (via middleware)
  - Automatic token refresh on 401 responses
  - Route protection (redirect unauthenticated users)
  - CSRF protection
- Create authentication utilities:
  - `signInWithGoogle()` - Server Action to initiate Google OAuth2 flow
  - `signInWithApple()` - Server Action to initiate Apple Sign In flow
  - `signInWithGitHub()` - Server Action to initiate GitHub OAuth2 flow
  - `signOut()` - Server Action to clear tokens and sign out
  - `refreshToken()` - Server Action or API route to refresh expired access token
  - `getCurrentUser()` - Server Component helper to get current authenticated user
- Handle OAuth2 callbacks:
  - Create `/auth/callback` route handler to process OAuth2 redirects
  - Use Next.js route handlers (app/api/auth/callback/route.ts)
  - Store tokens securely after successful authentication
- Error handling:
  - Display errors using React error boundaries
  - Show user-friendly error messages (don't expose sensitive info)
  - Handle network errors, token expiration, and provider-specific errors
  - Use toast notifications or error UI components
- [NEEDS CLARIFICATION]: Should we support email/password authentication as a fallback option?
- [NEEDS CLARIFICATION]: What is the token expiration time for access tokens? (typically 1 hour)
- [NEEDS CLARIFICATION]: What is the token expiration time for refresh tokens? (typically 30 days)

## Testing Strategy
- **Unit Tests**: 
  - Token storage and retrieval logic
  - Token refresh logic
  - Authentication state management
  - Error handling for various failure scenarios
- **Integration Tests**: 
  - OAuth2 flow with mock providers
  - Token injection in HTTP requests
  - Automatic token refresh on expired tokens
  - Secure storage operations
- **End-to-End Tests**: 
  - Complete OAuth2 authentication flow (Google, Apple, GitHub)
  - Token persistence across page reloads
  - Logout flow
  - Error scenarios (network failures, invalid tokens)
  - Route protection (redirects for unauthenticated users)

## Definition of Done
- [ ] All requirements implemented
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Unit tests written with >80% coverage
- [ ] Integration tests written and passing
- [ ] E2E tests written for critical flows
- [ ] Documentation updated (README, API docs)
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Error handling tested and verified
- [ ] Tokens stored securely using httpOnly cookies (server-side) or secure localStorage
- [ ] OAuth2 flows tested with at least one provider (Google)
- [ ] Token refresh mechanism tested and working
- [ ] Ready for staging deployment

## Additional Notes
- Follow Next.js and React best practices:
  - Use Server Components by default, Client Components only when needed
  - Use Server Actions for mutations (signIn, signOut)
  - Implement proper error boundaries for error handling
  - Use TypeScript for type safety
  - Use Zod for runtime validation
  - Follow Next.js App Router conventions
  - Use middleware for route protection and token management
- Supabase handles most OAuth2 complexity, but we need to:
  - Configure OAuth2 providers in Supabase dashboard
  - Handle redirect URLs properly (configure in Next.js environment)
  - Implement token refresh logic in middleware or API routes
  - Secure token storage (httpOnly cookies preferred)
- Next.js App Router considerations:
  - Use Server Components for initial auth state (faster, no JS needed)
  - Use middleware.ts for route protection and token refresh
  - Create route handlers for OAuth2 callbacks (app/api/auth/callback/route.ts)
  - Use Server Actions for authentication operations
- Security best practices:
  - Prefer httpOnly cookies for refresh tokens (XSS protection)
  - Store access tokens in memory when possible
  - Implement CSRF protection for authentication endpoints
  - Use secure cookie flags (Secure, SameSite)
- Token refresh should happen proactively (before expiration) to avoid failed requests
- Consider implementing token refresh queue to prevent multiple simultaneous refresh requests
- Consider implementing WebAuthn/Passkeys for passwordless authentication in future iterations

