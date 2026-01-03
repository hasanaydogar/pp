# Implementation Plan: Portfolio Management UI Integration

**Feature ID:** 004-Frontend-Backend-Integration  
**Plan ID:** plan-002  
**Specification:** spec-002  
**Created:** 2025-11-30  
**Status:** Draft  
**Priority:** High

## Overview

This plan covers integrating Portfolio management features with the Portfolio API endpoints. This includes Dashboard integration, Portfolio list/detail views, and Portfolio CRUD operations.

## Implementation Phases

### Phase 1: Dashboard Integration (Priority: HIGH)
**Estimated Time:** 3-4 hours

**Objectives:**
- Connect Dashboard page to Portfolio API
- Display real portfolio data
- Implement loading and error states

**Tasks:**
1. Update `app/(protected)/dashboard/page.tsx` to fetch real data
2. Use Server Component for initial data fetch
3. Create `lib/api/server/portfolios.ts` - Server-side portfolio fetching
4. Calculate total value across all portfolios
5. Calculate total gain/loss across all portfolios
6. Get top assets across all portfolios
7. Implement loading skeleton
8. Implement error state
9. Implement empty state

**Deliverables:**
- Updated `app/(protected)/dashboard/page.tsx`
- `lib/api/server/portfolios.ts` - Server-side utilities
- Loading skeleton component for dashboard
- Error state component

**Acceptance Criteria:**
- [ ] Dashboard displays real portfolio data
- [ ] Total value calculated correctly
- [ ] Total gain/loss calculated correctly
- [ ] Top assets displayed correctly
- [ ] Loading state works
- [ ] Error state works
- [ ] Empty state works

---

### Phase 2: Portfolio List View (Priority: HIGH)
**Estimated Time:** 3-4 hours

**Objectives:**
- Create Portfolio list page
- Display all portfolios
- Implement portfolio cards
- Add quick actions

**Tasks:**
1. Create `app/(protected)/portfolios/page.tsx`
2. Create `components/portfolios/portfolio-card.tsx` - Portfolio card component
3. Create `components/portfolios/portfolio-list.tsx` - Portfolio list component
4. Fetch portfolios using Server Component
5. Display portfolio cards with metrics
6. Add view/edit/delete quick actions
7. Implement loading skeleton
8. Implement error state
9. Implement empty state
10. Add navigation to portfolio detail

**Deliverables:**
- `app/(protected)/portfolios/page.tsx` - Portfolio list page
- `components/portfolios/portfolio-card.tsx` - Portfolio card
- `components/portfolios/portfolio-list.tsx` - Portfolio list
- Loading/error/empty states

**Acceptance Criteria:**
- [ ] Portfolio list page displays all portfolios
- [ ] Portfolio cards show correct data
- [ ] Quick actions work
- [ ] Navigation to detail works
- [ ] Loading/error/empty states work

---

### Phase 3: Portfolio Detail View (Priority: HIGH)
**Estimated Time:** 3-4 hours

**Objectives:**
- Create Portfolio detail page
- Display portfolio information
- Display nested assets and transactions
- Add edit/delete actions

**Tasks:**
1. Create `app/(protected)/portfolios/[id]/page.tsx`
2. Create `components/portfolios/portfolio-detail.tsx` - Portfolio detail component
3. Fetch portfolio with nested data using Server Component
4. Display portfolio information
5. Display assets list
6. Display transactions list (if needed)
7. Add edit button (navigate to edit page)
8. Add delete button with confirmation
9. Implement loading skeleton
10. Implement error state
11. Handle 404 case (portfolio not found)

**Deliverables:**
- `app/(protected)/portfolios/[id]/page.tsx` - Portfolio detail page
- `components/portfolios/portfolio-detail.tsx` - Portfolio detail component
- Delete confirmation dialog
- Loading/error/404 states

**Acceptance Criteria:**
- [ ] Portfolio detail page displays correct data
- [ ] Nested assets displayed
- [ ] Edit button navigates correctly
- [ ] Delete confirmation works
- [ ] Delete action works
- [ ] Loading/error/404 states work

---

### Phase 4: Portfolio Creation Form (Priority: HIGH)
**Estimated Time:** 2-3 hours

**Objectives:**
- Create Portfolio creation form
- Implement form validation
- Handle form submission
- Add success/error feedback

**Tasks:**
1. Create `app/(protected)/portfolios/new/page.tsx` or Modal component
2. Create `components/portfolios/portfolio-form.tsx` - Portfolio form component
3. Implement form fields (name, base_currency, benchmark_symbol)
4. Add form validation using Zod schemas
5. Implement form submission handler
6. Call `POST /api/portfolios` API
7. Handle success (redirect to portfolio detail)
8. Handle errors (display validation errors)
9. Add loading state during submission
10. Add cancel button

**Deliverables:**
- `app/(protected)/portfolios/new/page.tsx` - Portfolio creation page
- `components/portfolios/portfolio-form.tsx` - Portfolio form component
- Form validation
- Success/error handling

**Acceptance Criteria:**
- [ ] Form displays correctly
- [ ] Validation works
- [ ] Form submission works
- [ ] Success redirect works
- [ ] Error handling works
- [ ] Loading state works

---

### Phase 5: Portfolio Edit Form (Priority: HIGH)
**Estimated Time:** 2-3 hours

**Objectives:**
- Create Portfolio edit form
- Pre-fill form with existing data
- Handle form submission
- Add success/error feedback

**Tasks:**
1. Create `app/(protected)/portfolios/[id]/edit/page.tsx` or Modal component
2. Reuse `components/portfolios/portfolio-form.tsx` component
3. Fetch portfolio data using Server Component
4. Pre-fill form with existing data
5. Implement form submission handler
6. Call `PUT /api/portfolios/[id]` API
7. Handle success (redirect to portfolio detail)
8. Handle errors (display validation errors)
9. Add loading state during submission
10. Add cancel button

**Deliverables:**
- `app/(protected)/portfolios/[id]/edit/page.tsx` - Portfolio edit page
- Updated `components/portfolios/portfolio-form.tsx` - Support edit mode
- Form pre-filling
- Success/error handling

**Acceptance Criteria:**
- [ ] Form pre-fills correctly
- [ ] Validation works
- [ ] Form submission works
- [ ] Success redirect works
- [ ] Error handling works
- [ ] Loading state works

---

### Phase 6: Portfolio Deletion (Priority: MEDIUM)
**Estimated Time:** 1-2 hours

**Objectives:**
- Implement Portfolio deletion
- Add confirmation dialog
- Handle success/error feedback

**Tasks:**
1. Create `components/portfolios/delete-portfolio-dialog.tsx` - Delete confirmation dialog
2. Implement delete handler
3. Call `DELETE /api/portfolios/[id]` API
4. Handle success (redirect to portfolios list)
5. Handle errors (display error message)
6. Add loading state during deletion
7. Integrate delete button in portfolio detail and list

**Deliverables:**
- `components/portfolios/delete-portfolio-dialog.tsx` - Delete dialog
- Delete handler
- Success/error handling

**Acceptance Criteria:**
- [ ] Delete confirmation dialog works
- [ ] Delete action works
- [ ] Success redirect works
- [ ] Error handling works
- [ ] Loading state works

---

### Phase 7: Testing & Refinement (Priority: MEDIUM)
**Estimated Time:** 2-3 hours

**Objectives:**
- Test all Portfolio management features
- Fix any bugs
- Optimize performance
- Improve UX

**Tasks:**
1. Test Dashboard integration
2. Test Portfolio list view
3. Test Portfolio detail view
4. Test Portfolio creation
5. Test Portfolio editing
6. Test Portfolio deletion
7. Test error scenarios
8. Test loading states
9. Test empty states
10. Performance optimization
11. UX improvements

**Deliverables:**
- All features tested
- Bugs fixed
- Performance optimized
- UX improved

**Acceptance Criteria:**
- [ ] All features work correctly
- [ ] No bugs found
- [ ] Performance is acceptable
- [ ] UX is smooth

---

## Dependencies

- Feature 004-001: Frontend-Backend Integration - General (API client, error handling, loading states)
- Feature 002: Portfolio Tracker API (all Portfolio endpoints)

## Timeline

- **Phase 1:** 3-4 hours
- **Phase 2:** 3-4 hours
- **Phase 3:** 3-4 hours
- **Phase 4:** 2-3 hours
- **Phase 5:** 2-3 hours
- **Phase 6:** 1-2 hours
- **Phase 7:** 2-3 hours

**Total Estimated Time:** 16-23 hours

## Risk Assessment

**Low Risk:**
- Portfolio list/detail views (standard CRUD patterns)
- Form creation (standard form patterns)

**Medium Risk:**
- Dashboard data aggregation (needs optimization for large datasets)
- Nested data fetching (needs efficient queries)

**Mitigation:**
- Optimize aggregation queries
- Use efficient data fetching strategies
- Add pagination if needed

## Success Criteria

- [ ] Dashboard displays real portfolio data
- [ ] Portfolio list page works correctly
- [ ] Portfolio detail page works correctly
- [ ] Portfolio creation works
- [ ] Portfolio editing works
- [ ] Portfolio deletion works
- [ ] All loading/error/empty states work
- [ ] All tests pass

