# Implementation Plan: OAuth2 Authentication with JWT Tokens

<!-- FEATURE_DIR: 001-user-authentication -->
<!-- FEATURE_ID: 001 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2025-11-29T20:35:00.000000 -->

## Specification Reference
- **Spec ID**: SPEC-001
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2025-11-29

## Architecture Overview

### High-Level Design
The authentication system will be built using Supabase Auth as the OAuth2 provider backend, with Next.js handling both server-side and client-side authentication flows. The architecture follows Next.js App Router patterns:

1. **Server Layer**: Next.js Server Components and Server Actions for authentication operations
2. **Middleware Layer**: Next.js middleware for route protection and token refresh
3. **API Layer**: Route handlers for OAuth2 callbacks and token management
4. **Client Layer**: React Client Components for interactive UI (login/logout buttons)
5. **State Management Layer**: React Context or Zustand for client-side auth state
6. **Storage Layer**: httpOnly cookies (server-side) and secure localStorage (client-side)

The system will use Supabase's built-in OAuth2 support (handles PKCE, token exchange) and manage JWT tokens via httpOnly cookies for security. Token refresh will be handled automatically via middleware before token expiration.

### Technical Stack
- **Frontend**: Next.js 15+ (App Router), React 19+, TypeScript
- **State Management**: Zustand or Jotai (client-side), Server Components (server-side)
- **Backend**: Supabase Auth (OAuth2 provider integration)
- **Database**: Supabase PostgreSQL (user data managed by Supabase)
- **Infrastructure**: 
  - httpOnly cookies (secure token storage)
  - Next.js middleware (route protection, token refresh)
  - Route handlers (OAuth2 callbacks)
  - Axios or fetch API (HTTP client)

## Implementation Phases

### Phase 1: Foundation & Setup [Priority: HIGH]
**Timeline**: 3-4 days
**Dependencies**: None

#### Tasks
1. [ ] Initialize Next.js project with TypeScript and App Router
2. [ ] Install dependencies (@supabase/supabase-js, @supabase/ssr, zustand/jotai, zod, axios)
3. [ ] Configure Supabase project and initialize Supabase client (server and client)
4. [ ] Set up OAuth2 providers in Supabase dashboard (Google, Apple, GitHub)
5. [ ] Configure environment variables (.env.local for Supabase URL and keys)
6. [ ] Create project structure (app/, lib/auth/, lib/types/, components/)
7. [ ] Set up TypeScript configuration and path aliases
8. [ ] Configure Next.js middleware.ts for route protection

#### Deliverables
- [ ] Next.js project initialized with TypeScript
- [ ] Dependencies added to package.json
- [ ] Supabase client initialized (server and client instances)
- [ ] OAuth2 providers configured in Supabase dashboard
- [ ] Environment variables configured
- [ ] Project structure created with App Router conventions
- [ ] Middleware.ts file created for route protection

### Phase 2: Core Authentication Models & State [Priority: HIGH]
**Timeline**: 2-3 days
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] Create TypeScript types/interfaces (AuthUser, AuthState union type)
2. [ ] Create Zod schemas for runtime validation
3. [ ] Implement React Context or Zustand store for client-side auth state
4. [ ] Create authentication utilities (server actions and client functions)
5. [ ] Implement cookie management utilities (httpOnly cookies for tokens)
6. [ ] Create token validation and expiration logic
7. [ ] Set up error types and error handling utilities

#### Deliverables
- [ ] AuthUser TypeScript interface with provider information (provider_id, provider_type, email, avatar_url)
- [ ] AuthState union type (authenticated, unauthenticated, loading)
- [ ] AuthContext or Zustand store for client-side state
- [ ] Server Actions for authentication (signIn, signOut, refreshToken)
- [ ] Cookie utilities for secure token storage
- [ ] Token expiration validation logic
- [ ] Error handling utilities

### Phase 3: OAuth2 Provider Integration [Priority: HIGH]
**Timeline**: 3-4 days
**Dependencies**: Phase 2 complete

#### Tasks
1. [ ] Create Server Actions for OAuth2 sign-in (signInWithGoogle, signInWithApple, signInWithGitHub)
2. [ ] Create OAuth2 callback route handler (app/api/auth/callback/route.ts)
3. [ ] Implement Google OAuth2 sign-in flow with Supabase
4. [ ] Implement Apple Sign In flow with Supabase
5. [ ] Implement GitHub OAuth2 sign-in flow with Supabase
6. [ ] Handle OAuth2 redirect URLs and callback processing
7. [ ] Extract and store JWT tokens in httpOnly cookies after authentication
8. [ ] Implement sign-out Server Action
9. [ ] Handle authentication errors with user-friendly messages

#### Deliverables
- [ ] signInWithGoogle() Server Action working end-to-end
- [ ] signInWithApple() Server Action working end-to-end
- [ ] signInWithGitHub() Server Action working end-to-end
- [ ] OAuth2 callback route handler processing redirects correctly
- [ ] Tokens stored securely in httpOnly cookies after successful authentication
- [ ] signOut() Server Action clears tokens and updates auth state
- [ ] Error handling displays user-friendly messages

### Phase 4: Token Management & HTTP Integration [Priority: HIGH]
**Timeline**: 2-3 days
**Dependencies**: Phase 3 complete

#### Tasks
1. [ ] Configure Next.js middleware for route protection and token management
2. [ ] Implement token injection in API routes (via middleware or fetch wrapper)
3. [ ] Create token refresh API route or Server Action
4. [ ] Implement automatic token refresh in middleware on 401 responses
5. [ ] Create fetch wrapper or axios interceptor for client-side API calls
6. [ ] Implement request retry after token refresh
7. [ ] Add token refresh queue to prevent concurrent refresh requests
8. [ ] Implement proactive token refresh (before expiration) in middleware

#### Deliverables
- [ ] Next.js middleware configured for route protection
- [ ] Token injection working in API routes and Server Actions
- [ ] Token refresh API route or Server Action functional
- [ ] Automatic token refresh triggered on 401 responses
- [ ] Client-side fetch wrapper with token injection
- [ ] Failed requests retried after successful token refresh
- [ ] Token refresh queue prevents race conditions
- [ ] Proactive refresh happens before token expiration

### Phase 5: UI Components & User Experience [Priority: MEDIUM]
**Timeline**: 2-3 days
**Dependencies**: Phase 4 complete

#### Tasks
1. [ ] Create login page (app/login/page.tsx) with OAuth2 provider buttons
2. [ ] Create loading states during authentication (Server Components + Suspense)
3. [ ] Create error display component (error.tsx and error boundaries)
4. [ ] Implement authentication state check on app initialization (layout.tsx)
5. [ ] Create logout button/functionality (Client Component with Server Action)
6. [ ] Create profile page displaying user information (provider, email, avatar)
7. [ ] Handle empty states and error states gracefully
8. [ ] Implement protected route wrapper component

#### Deliverables
- [ ] Login page with Google, Apple, GitHub buttons (Server Component)
- [ ] Loading states using Suspense and loading.tsx
- [ ] Error boundaries and error.tsx for error handling
- [ ] App checks authentication state on startup (Server Component)
- [ ] Logout functionality accessible from profile (Client Component)
- [ ] User profile page displays OAuth2 provider information
- [ ] Empty and error states handled appropriately
- [ ] Protected route wrapper component

### Phase 6: Testing & Quality Assurance [Priority: MEDIUM]
**Timeline**: 3-4 days
**Dependencies**: Phase 5 complete

#### Tasks
1. [ ] Write unit tests for token storage and retrieval
2. [ ] Write unit tests for token refresh logic
3. [ ] Write unit tests for authentication state management
4. [ ] Write unit tests for error handling scenarios
5. [ ] Write integration tests for OAuth2 flows (with mock providers)
6. [ ] Write integration tests for token injection in HTTP requests
7. [ ] Write integration tests for automatic token refresh
8. [ ] Write E2E tests for complete authentication flow (Google) using Playwright
9. [ ] Write E2E tests for token persistence across page reloads
10. [ ] Write E2E tests for logout flow
11. [ ] Write E2E tests for route protection (redirects)
12. [ ] Performance testing (token refresh < 2s, auth flow < 5s)
13. [ ] Security review (token storage, no token logging, CSRF protection)

#### Deliverables
- [ ] Unit test coverage > 80%
- [ ] Integration tests for all critical flows
- [ ] E2E tests for Google OAuth2 flow
- [ ] E2E tests for token persistence across page reloads
- [ ] E2E tests for route protection
- [ ] Performance benchmarks met
- [ ] Security review completed and issues addressed

### Phase 7: Documentation & Deployment Preparation [Priority: MEDIUM]
**Timeline**: 1-2 days
**Dependencies**: Phase 6 complete

#### Tasks
1. [ ] Document authentication flow and architecture
2. [ ] Document OAuth2 provider setup process
3. [ ] Document token refresh mechanism
4. [ ] Update README with authentication setup instructions
5. [ ] Create developer guide for adding new OAuth2 providers
6. [ ] Prepare deployment checklist
7. [ ] Verify all acceptance criteria met

#### Deliverables
- [ ] Architecture documentation complete
- [ ] Setup instructions documented
- [ ] Developer guide for extending providers
- [ ] README updated with authentication info
- [ ] Deployment checklist prepared
- [ ] All acceptance criteria verified

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OAuth2 callback URL configuration issues | Medium | High | Test callback URLs thoroughly, configure redirect URLs correctly in Supabase and OAuth2 providers |
| Token refresh race conditions | Medium | Medium | Implement token refresh queue to prevent concurrent refresh requests |
| Cookie storage issues (SameSite, Secure flags) | Medium | High | Test cookie settings across browsers, implement fallback to localStorage if needed |
| Supabase OAuth2 provider configuration errors | Medium | High | Document configuration steps clearly, validate configuration early |
| Token expiration edge cases | Low | Medium | Implement proactive refresh, handle edge cases in tests |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| Supabase Auth API availability | Low | Supabase has high uptime SLA, monitor API status |
| flutter_secure_storage compatibility | Low | Well-maintained package, test on target devices early |
| OAuth2 provider API changes | Low | Providers maintain backward compatibility, monitor changelogs |
| Next.js middleware execution order issues | Low | Medium | Test middleware carefully, ensure proper execution order for auth checks |

## Resource Requirements

### Development Team
- **Next.js/React Developer**: 1 developer (full-time)
- **Backend/DevOps**: 0.2 FTE (for Supabase configuration)
- **QA Engineer**: 0.3 FTE (for testing phases)

### Infrastructure
- **Development Environment**: 
  - Node.js 18+ and npm/yarn/pnpm
  - Next.js 15+ (latest stable)
  - Supabase account (free tier sufficient for development)
  - Modern browser (Chrome, Firefox, Safari, Edge)
- **Testing Environment**: 
  - Test Supabase project
  - Test OAuth2 provider applications (Google, Apple, GitHub)
  - Playwright or Cypress for E2E testing
  - Multiple browsers for cross-browser testing
- **Production Environment**: 
  - Production Supabase project
  - Production OAuth2 provider applications
  - Vercel or similar hosting platform
  - Production domain with HTTPS

## Success Metrics

- **Performance**: 
  - Token refresh completes within 2 seconds (target: < 1.5s)
  - Authentication flow completes within 5 seconds (target: < 4s)
  - No UI blocking during authentication
- **User Satisfaction**: 
  - Smooth authentication experience (< 3 clicks to authenticate)
  - Clear error messages when authentication fails
  - Persistent authentication across page reloads
- **Business Impact**: 
  - Users can authenticate with preferred OAuth2 provider
  - Reduced friction in user onboarding
  - Secure token management enables API access
- **Technical Debt**: 
  - Code follows Next.js and React best practices
  - Test coverage > 80%
  - Architecture supports adding new OAuth2 providers easily
  - Server Components used appropriately (minimize client-side JS)

## Rollout Plan

### Phase Rollout Strategy
1. **Alpha**: Internal testing with development team
   - Test all OAuth2 providers (Google, Apple, GitHub)
   - Verify token refresh mechanism
   - Test across different browsers (Chrome, Firefox, Safari, Edge)
2. **Beta**: Limited user group testing (10-20 users)
   - Monitor authentication success rates
   - Collect feedback on UX
   - Verify token persistence across page reloads
3. **GA**: General availability release
   - Monitor authentication metrics
   - Track error rates
   - Monitor token refresh performance

### Monitoring & Observability
- **Application Metrics**: 
  - Authentication success/failure rates
  - Token refresh frequency and success rate
  - Average authentication flow duration
  - Token expiration events
- **Business Metrics**: 
  - User registration via OAuth2 providers
  - Most popular OAuth2 provider
  - Authentication abandonment rate
- **Error Monitoring**: 
  - Authentication error types and frequencies
  - Token refresh failures
  - OAuth2 callback failures
  - Cookie storage errors
  - Middleware execution errors
- **Performance Monitoring**: 
  - Token refresh latency
  - Authentication flow duration
  - API request latency (with token injection)

## Definition of Done
- [ ] All implementation phases complete
- [ ] All acceptance criteria met from specification
- [ ] Comprehensive testing completed (>80% coverage)
- [ ] Documentation complete (architecture, setup, developer guide)
- [ ] Security review completed (no token logging, secure storage verified)
- [ ] Performance benchmarks met (token refresh < 2s, auth flow < 5s)
- [ ] Error handling tested and verified
- [ ] OAuth2 flows tested with at least Google provider
- [ ] Token refresh mechanism tested and working
- [ ] OAuth2 callbacks tested across browsers
- [ ] Route protection tested (middleware redirects)
- [ ] Code reviewed and approved
- [ ] Ready for staging deployment

## Additional Notes

### Architecture Decisions
- **Supabase Auth**: Chosen for built-in OAuth2 support, PKCE handling, and token management. Reduces implementation complexity significantly.
- **Next.js App Router**: Selected for modern React patterns, Server Components, and built-in routing. Provides better performance and SEO.
- **httpOnly Cookies**: Used for refresh token storage as it provides XSS protection and is more secure than localStorage.
- **Server Actions**: Used for authentication operations to keep sensitive logic on the server and reduce client-side bundle size.
- **Middleware**: Used for route protection and token refresh to handle authentication at the edge before page rendering.
- **Zustand/Jotai**: Selected for client-side state management due to simplicity and React integration.
- **TypeScript + Zod**: Used for type safety and runtime validation.

### Future Enhancements
- WebAuthn/Passkeys for passwordless authentication
- Email/password authentication as fallback option
- Multi-factor authentication (MFA) support
- Social account linking (connect multiple OAuth2 providers to one account)
- Token refresh optimization (batch refresh requests)
- Server-side session management improvements

### Technical Debt Considerations
- Monitor Supabase Auth API changes and updates
- Keep Next.js and React versions updated
- Review token refresh strategy periodically for optimization opportunities
- Consider implementing token refresh caching to reduce API calls
- Monitor middleware performance and optimize if needed
- Keep OAuth2 provider configurations up to date

### Clarifications Needed
- [NEEDS CLARIFICATION]: Which OAuth2 providers should be supported initially? (Google, Apple, GitHub, or all?)
- [NEEDS CLARIFICATION]: Should we support email/password authentication as a fallback option?
- [NEEDS CLARIFICATION]: What is the token expiration time for access tokens? (typically 1 hour)
- [NEEDS CLARIFICATION]: What is the token expiration time for refresh tokens? (typically 30 days)

