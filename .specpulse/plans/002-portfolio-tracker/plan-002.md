# Implementation Plan: Portfolio Tracker API Development

<!-- FEATURE_DIR: 002-portfolio-tracker -->
<!-- FEATURE_ID: 002 -->
<!-- PLAN_NUMBER: 002 -->
<!-- STATUS: pending -->
<!-- CREATED: 2025-11-30T12:30:00.000000 -->

## Specification Reference
- **Spec ID**: SPEC-002-002
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2025-11-30
- **Related Spec**: spec-001.md (Database Schema - completed)

## Architecture Overview

### High-Level Design

The Portfolio Tracker API will be implemented using Next.js 15 App Router Route Handlers, providing a RESTful API layer that:
- Leverages existing database schema and RLS policies
- Uses TypeScript types and Zod schemas for type safety
- Implements consistent error handling and validation patterns
- Supports nested queries for efficient data fetching
- Includes business logic for asset management after transactions

### Technical Stack
- **Framework**: Next.js 15+ (App Router)
- **API Layer**: Route Handlers (`route.ts` files)
- **Database**: Supabase PostgreSQL (via `@supabase/ssr`)
- **Authentication**: Existing middleware + `getCurrentUser()` action
- **Validation**: Zod schemas from `lib/types/portfolio.ts`
- **Type Safety**: TypeScript with generated types
- **Testing**: Jest (unit/integration), Playwright (E2E)

### API Structure
```
/api/portfolios          → GET (list), POST (create)
/api/portfolios/[id]     → GET (details), PUT (update), DELETE
/api/portfolios/[id]/assets → GET (list), POST (create)
/api/assets/[id]         → GET (details), PUT (update), DELETE
/api/assets/[id]/transactions → GET (list), POST (create)
/api/transactions/[id]   → GET (details), PUT (update), DELETE
```

## Implementation Phases

### Phase 1: Foundation & Shared Utilities [Priority: HIGH]
**Timeline**: 0.5-1 day
**Dependencies**: None (all utilities already exist)

#### Tasks
1. [ ] Review existing utilities (`lib/supabase/server.ts`, `lib/auth/actions.ts`, `lib/types/portfolio.ts`)
2. [ ] Create shared UUID validation utility function
3. [ ] Create shared error response helper function
4. [ ] Create shared Zod validation wrapper function
5. [ ] Document standard endpoint structure pattern
6. [ ] Set up API directory structure (`app/api/`)

#### Deliverables
- [ ] `lib/api/utils.ts` - Shared utility functions
- [ ] `lib/api/errors.ts` - Error response helpers
- [ ] API directory structure created
- [ ] Code pattern documentation

#### Acceptance Criteria
- [ ] UUID validation utility works correctly
- [ ] Error response helper returns consistent format
- [ ] Zod validation wrapper handles errors properly
- [ ] All utilities are type-safe

### Phase 2: Portfolio Endpoints [Priority: HIGH]
**Timeline**: 1-2 days
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] Create `app/api/portfolios/route.ts` (GET, POST)
   - [ ] Implement GET /api/portfolios (list all)
   - [ ] Implement POST /api/portfolios (create)
   - [ ] Add authentication check
   - [ ] Add Zod validation for POST
   - [ ] Add error handling
   - [ ] Test with authenticated user

2. [ ] Create `app/api/portfolios/[id]/route.ts` (GET, PUT, DELETE)
   - [ ] Implement GET /api/portfolios/[id] (with nested assets/transactions)
   - [ ] Implement PUT /api/portfolios/[id] (update)
   - [ ] Implement DELETE /api/portfolios/[id] (delete)
   - [ ] Add UUID validation
   - [ ] Add Zod validation for PUT
   - [ ] Add nested query support for GET
   - [ ] Test all operations

3. [ ] Manual testing of all portfolio endpoints
   - [ ] Test GET list returns user's portfolios only
   - [ ] Test POST creates portfolio with correct user_id
   - [ ] Test GET by ID returns nested data
   - [ ] Test PUT updates portfolio name
   - [ ] Test DELETE removes portfolio and cascades

#### Deliverables
- [ ] `app/api/portfolios/route.ts` - List and create endpoints
- [ ] `app/api/portfolios/[id]/route.ts` - Get, update, delete endpoints
- [ ] All portfolio endpoints working
- [ ] Manual test results documented

#### Acceptance Criteria
- [ ] GET /api/portfolios returns 200 with user's portfolios
- [ ] POST /api/portfolios creates portfolio with 201 status
- [ ] GET /api/portfolios/[id] returns nested assets and transactions
- [ ] PUT /api/portfolios/[id] updates portfolio successfully
- [ ] DELETE /api/portfolios/[id] removes portfolio
- [ ] All endpoints return 401 if not authenticated
- [ ] Validation errors return 400 with details
- [ ] RLS prevents access to other users' portfolios

### Phase 3: Asset Endpoints [Priority: HIGH]
**Timeline**: 1-2 days
**Dependencies**: Phase 2 complete

#### Tasks
1. [ ] Create `app/api/portfolios/[portfolioId]/assets/route.ts` (GET, POST)
   - [ ] Implement GET /api/portfolios/[portfolioId]/assets (list assets)
   - [ ] Implement POST /api/portfolios/[portfolioId]/assets (create asset)
   - [ ] Add UUID validation for portfolioId
   - [ ] Add Zod validation for POST
   - [ ] Handle duplicate asset constraint error
   - [ ] Test with authenticated user

2. [ ] Create `app/api/assets/[id]/route.ts` (GET, PUT, DELETE)
   - [ ] Implement GET /api/assets/[id] (with nested transactions)
   - [ ] Implement PUT /api/assets/[id] (update asset)
   - [ ] Implement DELETE /api/assets/[id] (delete asset)
   - [ ] Add UUID validation
   - [ ] Add Zod validation for PUT
   - [ ] Add nested query support for GET
   - [ ] Test all operations

3. [ ] Manual testing of all asset endpoints
   - [ ] Test GET list returns assets in portfolio
   - [ ] Test POST creates asset with correct portfolio_id
   - [ ] Test duplicate asset creation fails with 400
   - [ ] Test GET by ID returns nested transactions
   - [ ] Test PUT updates asset fields
   - [ ] Test DELETE removes asset and cascades transactions

#### Deliverables
- [ ] `app/api/portfolios/[portfolioId]/assets/route.ts` - List and create endpoints
- [ ] `app/api/assets/[id]/route.ts` - Get, update, delete endpoints
- [ ] All asset endpoints working
- [ ] Manual test results documented

#### Acceptance Criteria
- [ ] GET /api/portfolios/[portfolioId]/assets returns 200 with assets
- [ ] POST /api/portfolios/[portfolioId]/assets creates asset with 201 status
- [ ] Duplicate asset creation returns 400 error
- [ ] GET /api/assets/[id] returns nested transactions
- [ ] PUT /api/assets/[id] updates asset successfully
- [ ] DELETE /api/assets/[id] removes asset
- [ ] All endpoints enforce RLS policies
- [ ] Validation errors return 400 with details

### Phase 4: Transaction Endpoints & Business Logic [Priority: HIGH]
**Timeline**: 2-3 days
**Dependencies**: Phase 3 complete

#### Tasks
1. [ ] Create `app/api/assets/[assetId]/transactions/route.ts` (GET, POST)
   - [ ] Implement GET /api/assets/[assetId]/transactions (list with pagination)
   - [ ] Implement POST /api/assets/[assetId]/transactions (create transaction)
   - [ ] Add UUID validation for assetId
   - [ ] Add Zod validation for POST
   - [ ] Add pagination support (limit, offset, order)
   - [ ] Implement business logic for BUY transactions
   - [ ] Test pagination parameters
   - [ ] Test BUY transaction updates asset

2. [ ] Create `app/api/transactions/[id]/route.ts` (GET, PUT, DELETE)
   - [ ] Implement GET /api/transactions/[id] (get transaction)
   - [ ] Implement PUT /api/transactions/[id] (update transaction)
   - [ ] Implement DELETE /api/transactions/[id] (delete transaction)
   - [ ] Add UUID validation
   - [ ] Add Zod validation for PUT
   - [ ] Test all operations

3. [ ] Implement Business Logic: Asset Update After BUY
   - [ ] Fetch current asset quantity and average_buy_price
   - [ ] Calculate new average buy price: `(oldTotal + newTotal) / newQuantity`
   - [ ] Update asset quantity and average_buy_price atomically
   - [ ] Handle transaction rollback if asset update fails
   - [ ] Test with multiple BUY transactions
   - [ ] Test calculation accuracy

4. [ ] Manual testing of all transaction endpoints
   - [ ] Test GET list with pagination
   - [ ] Test POST creates transaction
   - [ ] Test BUY transaction updates asset correctly
   - [ ] Test SELL transaction doesn't update asset
   - [ ] Test GET by ID returns transaction
   - [ ] Test PUT updates transaction
   - [ ] Test DELETE removes transaction

#### Deliverables
- [ ] `app/api/assets/[assetId]/transactions/route.ts` - List and create endpoints
- [ ] `app/api/transactions/[id]/route.ts` - Get, update, delete endpoints
- [ ] Business logic for BUY transactions implemented
- [ ] Pagination working correctly
- [ ] All transaction endpoints working
- [ ] Manual test results documented

#### Acceptance Criteria
- [ ] GET /api/assets/[assetId]/transactions returns paginated results
- [ ] POST /api/assets/[assetId]/transactions creates transaction with 201 status
- [ ] BUY transaction automatically updates asset quantity and average_buy_price
- [ ] Average buy price calculation is correct
- [ ] Asset update is atomic (rollback on failure)
- [ ] GET /api/transactions/[id] returns transaction
- [ ] PUT /api/transactions/[id] updates transaction successfully
- [ ] DELETE /api/transactions/[id] removes transaction
- [ ] Pagination parameters work correctly (limit, offset, order)
- [ ] All endpoints enforce RLS policies

### Phase 5: Testing & Validation [Priority: MEDIUM]
**Timeline**: 2-3 days
**Dependencies**: Phase 4 complete

#### Tasks
1. [ ] Unit Tests
   - [ ] Test UUID validation utility
   - [ ] Test error response helpers
   - [ ] Test Zod validation wrappers
   - [ ] Test business logic calculations

2. [ ] Integration Tests
   - [ ] Test each endpoint with authenticated user
   - [ ] Test RLS policy enforcement (users can't access other users' data)
   - [ ] Test nested queries return correct structure
   - [ ] Test pagination works correctly
   - [ ] Test business logic (asset update after BUY transaction)
   - [ ] Test error handling (400, 401, 404, 500)
   - [ ] Test validation errors return proper format

3. [ ] E2E Tests (Playwright)
   - [ ] Test complete portfolio creation flow
   - [ ] Test asset creation and transaction recording
   - [ ] Test cascade delete (portfolio → assets → transactions)
   - [ ] Test unauthorized access attempts
   - [ ] Test nested data retrieval

4. [ ] Manual Testing
   - [ ] Test with browser DevTools Network tab
   - [ ] Test with curl commands
   - [ ] Test with Postman/Thunder Client
   - [ ] Verify all status codes
   - [ ] Verify error messages
   - [ ] Test edge cases (empty portfolios, invalid UUIDs, etc.)

#### Deliverables
- [ ] Unit test files for utilities
- [ ] Integration test files for all endpoints
- [ ] E2E test files for complete flows
- [ ] Test coverage report
- [ ] Manual testing checklist completed

#### Acceptance Criteria
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Test coverage > 80%
- [ ] All endpoints tested manually
- [ ] Error scenarios tested
- [ ] Edge cases handled

### Phase 6: Documentation & Finalization [Priority: MEDIUM]
**Timeline**: 1 day
**Dependencies**: Phase 5 complete

#### Tasks
1. [ ] API Documentation
   - [ ] Document all endpoints (request/response formats)
   - [ ] Document error codes and messages
   - [ ] Document authentication requirements
   - [ ] Document business logic (BUY transaction)
   - [ ] Create API usage examples

2. [ ] Code Documentation
   - [ ] Add JSDoc comments to all endpoints
   - [ ] Document complex business logic
   - [ ] Document error handling patterns
   - [ ] Update README with API information

3. [ ] Final Review
   - [ ] Code review for consistency
   - [ ] Verify all success criteria met
   - [ ] Check TypeScript errors
   - [ ] Verify all tests passing
   - [ ] Performance check (query optimization)

#### Deliverables
- [ ] API documentation file (`docs/api/endpoints.md`)
- [ ] Code comments and JSDoc
- [ ] Updated README
- [ ] Final review checklist completed

#### Acceptance Criteria
- [ ] All endpoints documented
- [ ] Code is well-commented
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Ready for production use

## Risk Assessment

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| RLS policies not working correctly | HIGH | LOW | Test thoroughly with multiple users, verify RLS policies in database |
| Business logic calculation errors | HIGH | MEDIUM | Write unit tests for calculations, test with various scenarios |
| Nested queries performance issues | MEDIUM | MEDIUM | Use Supabase select efficiently, add indexes if needed |
| Transaction atomicity issues | HIGH | LOW | Use database transactions, test rollback scenarios |
| Type safety issues | MEDIUM | LOW | Use TypeScript strictly, validate with Zod at runtime |

### Project Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Timeline delays | MEDIUM | MEDIUM | Prioritize must-have features, defer nice-to-have |
| Testing gaps | HIGH | MEDIUM | Create comprehensive test plan, automate where possible |
| API design inconsistencies | MEDIUM | LOW | Follow established patterns, code review |

## Success Metrics

### Functional Metrics
- [ ] All 15 endpoints implemented and working
- [ ] 100% of endpoints require authentication
- [ ] 100% of endpoints enforce RLS policies
- [ ] All validation working (Zod schemas)
- [ ] Business logic implemented correctly
- [ ] Nested queries working
- [ ] Pagination working

### Quality Metrics
- [ ] Test coverage > 80%
- [ ] Zero TypeScript errors
- [ ] All tests passing (unit, integration, E2E)
- [ ] Consistent error handling across all endpoints
- [ ] Code follows established patterns

### Performance Metrics
- [ ] API response time < 500ms for simple queries
- [ ] API response time < 2s for nested queries
- [ ] No N+1 query problems
- [ ] Efficient database queries

## Dependencies

### Prerequisites (Completed)
- ✅ Database schema (spec-001.md)
- ✅ TypeScript types and Zod schemas (`lib/types/portfolio.ts`)
- ✅ Authentication system (Feature 001)
- ✅ Supabase client utilities (`lib/supabase/server.ts`)
- ✅ Authentication actions (`lib/auth/actions.ts`)

### External Dependencies
- Next.js 15+ (installed)
- Supabase SSR package (installed)
- Zod (installed)
- Jest (installed)
- Playwright (installed)

### No Blocking Dependencies
All required dependencies are already installed and configured.

## Timeline Estimate

| Phase | Duration | Total Days |
|-------|----------|------------|
| Phase 1: Foundation | 0.5-1 day | 1 |
| Phase 2: Portfolio Endpoints | 1-2 days | 2 |
| Phase 3: Asset Endpoints | 1-2 days | 2 |
| Phase 4: Transaction Endpoints | 2-3 days | 3 |
| Phase 5: Testing | 2-3 days | 3 |
| Phase 6: Documentation | 1 day | 1 |
| **Total** | | **12-15 days** |

*Note: Timeline assumes sequential execution. Some phases can be parallelized (e.g., testing while implementing).*

## Implementation Order

1. **Foundation** → Set up utilities and patterns
2. **Portfolio Endpoints** → Start with simplest resource
3. **Asset Endpoints** → Build on portfolio foundation
4. **Transaction Endpoints** → Most complex, includes business logic
5. **Testing** → Validate all functionality
6. **Documentation** → Finalize and document

## Notes

- Follow existing code patterns from authentication implementation
- RLS policies handle authorization automatically - no manual checks needed
- Use Zod schemas for all input validation
- Return consistent error format: `{ error: string, details?: any }`
- Business logic (asset update after BUY) should be atomic
- Test each endpoint as you create it
- Middleware protects `/api/*` routes automatically

## References

- Next.js 15 Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Supabase JavaScript Client: https://supabase.com/docs/reference/javascript/introduction
- Zod Validation: https://zod.dev/
- Existing codebase:
  - `lib/types/portfolio.ts` - Types and schemas
  - `lib/supabase/server.ts` - Supabase client
  - `lib/auth/actions.ts` - Authentication utilities
  - `middleware.ts` - Route protection

