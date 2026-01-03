# Task Breakdown: Portfolio Management UI Integration

**Feature ID:** 004-Frontend-Backend-Integration  
**Task ID:** task-002  
**Plan:** plan-002  
**Specification:** spec-002  
**Created:** 2025-11-30  
**Status:** Pending

## Progress Overview
- **Total Tasks**: 70
- **Completed Tasks**: 0 (0%)
- **In Progress Tasks**: 0
- **Blocked Tasks**: 0

## Phase 1: Dashboard Integration [Priority: HIGH]

### Task 1.1: Create Server-Side Portfolio Fetching Utility
- [ ] Create `lib/api/server/portfolios.ts` file
- [ ] Implement `getPortfolios()` function
- [ ] Add authentication check
- [ ] Add error handling
- [ ] Test server-side fetching works
- **Files**: `lib/api/server/portfolios.ts`
- **Estimated Time**: 45 minutes

### Task 1.2: Update Dashboard Page to Fetch Real Data
- [ ] Update `app/(protected)/dashboard/page.tsx`
- [ ] Convert to Server Component
- [ ] Fetch portfolios using server utility
- [ ] Calculate total value across portfolios
- [ ] Calculate total gain/loss across portfolios
- [ ] Get portfolio count
- **Files**: `app/(protected)/dashboard/page.tsx`
- **Estimated Time**: 1 hour

### Task 1.3: Calculate Dashboard Metrics
- [ ] Calculate total portfolio value
- [ ] Calculate total gain/loss
- [ ] Calculate total gain/loss percentage
- [ ] Get top assets across all portfolios
- [ ] Sort assets by value
- **Files**: `app/(protected)/dashboard/page.tsx`
- **Estimated Time**: 45 minutes

### Task 1.4: Create Dashboard Loading Skeleton
- [ ] Create `components/dashboard/dashboard-skeleton.tsx`
- [ ] Create skeleton for metric cards
- [ ] Create skeleton for top assets list
- [ ] Style with Catalyst UI
- **Files**: `components/dashboard/dashboard-skeleton.tsx`
- **Estimated Time**: 30 minutes

### Task 1.5: Implement Dashboard Error State
- [ ] Create error state component for dashboard
- [ ] Display user-friendly error message
- [ ] Add retry button
- [ ] Test error state displays correctly
- **Files**: `app/(protected)/dashboard/page.tsx`
- **Estimated Time**: 30 minutes

### Task 1.6: Implement Dashboard Empty State
- [ ] Create empty state component for dashboard
- [ ] Display message when no portfolios exist
- [ ] Add "Create Portfolio" CTA button
- [ ] Test empty state displays correctly
- **Files**: `app/(protected)/dashboard/page.tsx`
- **Estimated Time**: 30 minutes

**Phase 1 Total**: ~4 hours

---

## Phase 2: Portfolio List View [Priority: HIGH]

### Task 2.1: Create Portfolio List Page
- [ ] Create `app/(protected)/portfolios/page.tsx`
- [ ] Convert to Server Component
- [ ] Fetch portfolios using server utility
- [ ] Display portfolios list
- **Files**: `app/(protected)/portfolios/page.tsx`
- **Estimated Time**: 30 minutes

### Task 2.2: Create Portfolio Card Component
- [ ] Create `components/portfolios/portfolio-card.tsx`
- [ ] Display portfolio name
- [ ] Display total value
- [ ] Display gain/loss
- [ ] Display asset count
- [ ] Add view/edit/delete action buttons
- [ ] Style with Catalyst UI
- **Files**: `components/portfolios/portfolio-card.tsx`
- **Estimated Time**: 1 hour

### Task 2.3: Create Portfolio List Component
- [ ] Create `components/portfolios/portfolio-list.tsx`
- [ ] Display portfolio cards in grid/list
- [ ] Add responsive layout
- [ ] Handle empty state
- [ ] Style with Catalyst UI
- **Files**: `components/portfolios/portfolio-list.tsx`
- **Estimated Time**: 45 minutes

### Task 2.4: Add Quick Actions to Portfolio Cards
- [ ] Add "View" button (navigate to detail)
- [ ] Add "Edit" button (navigate to edit page)
- [ ] Add "Delete" button (open delete dialog)
- [ ] Test navigation works
- **Files**: `components/portfolios/portfolio-card.tsx`
- **Estimated Time**: 30 minutes

### Task 2.5: Implement Portfolio List Loading Skeleton
- [ ] Create skeleton for portfolio cards
- [ ] Display skeleton while loading
- [ ] Style with Catalyst UI
- **Files**: `components/portfolios/portfolio-list.tsx`
- **Estimated Time**: 30 minutes

### Task 2.6: Implement Portfolio List Error State
- [ ] Display error message
- [ ] Add retry button
- [ ] Test error state works
- **Files**: `app/(protected)/portfolios/page.tsx`
- **Estimated Time**: 30 minutes

### Task 2.7: Implement Portfolio List Empty State
- [ ] Display empty state message
- [ ] Add "Create Portfolio" CTA button
- [ ] Test empty state works
- **Files**: `app/(protected)/portfolios/page.tsx`
- **Estimated Time**: 30 minutes

**Phase 2 Total**: ~4.5 hours

---

## Phase 3: Portfolio Detail View [Priority: HIGH]

### Task 3.1: Create Portfolio Detail Page
- [ ] Create `app/(protected)/portfolios/[id]/page.tsx`
- [ ] Convert to Server Component
- [ ] Fetch portfolio with nested data
- [ ] Handle dynamic route parameter
- **Files**: `app/(protected)/portfolios/[id]/page.tsx`
- **Estimated Time**: 30 minutes

### Task 3.2: Create Portfolio Detail Component
- [ ] Create `components/portfolios/portfolio-detail.tsx`
- [ ] Display portfolio information
- [ ] Display portfolio metrics
- [ ] Style with Catalyst UI
- **Files**: `components/portfolios/portfolio-detail.tsx`
- **Estimated Time**: 1 hour

### Task 3.3: Display Nested Assets
- [ ] Create assets list section
- [ ] Display assets in table or cards
- [ ] Add link to asset detail
- [ ] Style with Catalyst UI
- **Files**: `components/portfolios/portfolio-detail.tsx`
- **Estimated Time**: 1 hour

### Task 3.4: Add Edit Button
- [ ] Add edit button to portfolio detail
- [ ] Navigate to edit page on click
- [ ] Test navigation works
- **Files**: `components/portfolios/portfolio-detail.tsx`
- **Estimated Time**: 15 minutes

### Task 3.5: Add Delete Button
- [ ] Add delete button to portfolio detail
- [ ] Open delete confirmation dialog on click
- [ ] Test delete button works
- **Files**: `components/portfolios/portfolio-detail.tsx`
- **Estimated Time**: 15 minutes

### Task 3.6: Implement Portfolio Detail Loading Skeleton
- [ ] Create skeleton for portfolio detail
- [ ] Create skeleton for assets list
- [ ] Display skeleton while loading
- **Files**: `app/(protected)/portfolios/[id]/page.tsx`
- **Estimated Time**: 30 minutes

### Task 3.7: Implement Portfolio Detail Error State
- [ ] Display error message
- [ ] Add retry button
- [ ] Test error state works
- **Files**: `app/(protected)/portfolios/[id]/page.tsx`
- **Estimated Time**: 30 minutes

### Task 3.8: Handle 404 Case (Portfolio Not Found)
- [ ] Check if portfolio exists
- [ ] Display 404 message if not found
- [ ] Add "Back to Portfolios" button
- [ ] Test 404 handling works
- **Files**: `app/(protected)/portfolios/[id]/page.tsx`
- **Estimated Time**: 30 minutes

**Phase 3 Total**: ~4.5 hours

---

## Phase 4: Portfolio Creation Form [Priority: HIGH]

### Task 4.1: Create Portfolio Creation Page
- [ ] Create `app/(protected)/portfolios/new/page.tsx` or Modal component
- [ ] Create route structure
- [ ] Add navigation from portfolio list
- **Files**: `app/(protected)/portfolios/new/page.tsx`
- **Estimated Time**: 15 minutes

### Task 4.2: Create Portfolio Form Component
- [ ] Create `components/portfolios/portfolio-form.tsx`
- [ ] Add form fields: name, base_currency, benchmark_symbol
- [ ] Use Catalyst UI Input components
- [ ] Style form with Catalyst UI
- **Files**: `components/portfolios/portfolio-form.tsx`
- **Estimated Time**: 1 hour

### Task 4.3: Implement Form Validation
- [ ] Add Zod schema validation
- [ ] Display validation errors
- [ ] Validate on submit
- [ ] Validate on blur (optional)
- **Files**: `components/portfolios/portfolio-form.tsx`
- **Estimated Time**: 45 minutes

### Task 4.4: Implement Form Submission Handler
- [ ] Create submit handler function
- [ ] Call `POST /api/portfolios` API
- [ ] Handle loading state during submission
- [ ] Handle success (redirect to portfolio detail)
- [ ] Handle errors (display validation errors)
- **Files**: `components/portfolios/portfolio-form.tsx`
- **Estimated Time**: 1 hour

### Task 4.5: Add Cancel Button
- [ ] Add cancel button to form
- [ ] Navigate back on cancel
- [ ] Test cancel button works
- **Files**: `components/portfolios/portfolio-form.tsx`
- **Estimated Time**: 15 minutes

### Task 4.6: Test Portfolio Creation
- [ ] Test form validation works
- [ ] Test form submission works
- [ ] Test success redirect works
- [ ] Test error handling works
- **Files**: `components/portfolios/portfolio-form.tsx`
- **Estimated Time**: 30 minutes

**Phase 4 Total**: ~3.5 hours

---

## Phase 5: Portfolio Edit Form [Priority: HIGH]

### Task 5.1: Create Portfolio Edit Page
- [ ] Create `app/(protected)/portfolios/[id]/edit/page.tsx` or Modal component
- [ ] Create route structure
- [ ] Add navigation from portfolio detail
- **Files**: `app/(protected)/portfolios/[id]/edit/page.tsx`
- **Estimated Time**: 15 minutes

### Task 5.2: Fetch Portfolio Data for Edit
- [ ] Fetch portfolio data using Server Component
- [ ] Pass data to form component
- [ ] Handle loading state
- **Files**: `app/(protected)/portfolios/[id]/edit/page.tsx`
- **Estimated Time**: 30 minutes

### Task 5.3: Update Portfolio Form for Edit Mode
- [ ] Update `components/portfolios/portfolio-form.tsx`
- [ ] Add edit mode support
- [ ] Pre-fill form with existing data
- [ ] Handle initial values
- **Files**: `components/portfolios/portfolio-form.tsx`
- **Estimated Time**: 45 minutes

### Task 5.4: Implement Form Submission Handler for Edit
- [ ] Create submit handler function
- [ ] Call `PUT /api/portfolios/[id]` API
- [ ] Handle loading state during submission
- [ ] Handle success (redirect to portfolio detail)
- [ ] Handle errors (display validation errors)
- **Files**: `components/portfolios/portfolio-form.tsx`
- **Estimated Time**: 1 hour

### Task 5.5: Test Portfolio Editing
- [ ] Test form pre-fills correctly
- [ ] Test form submission works
- [ ] Test success redirect works
- [ ] Test error handling works
- **Files**: `components/portfolios/portfolio-form.tsx`
- **Estimated Time**: 30 minutes

**Phase 5 Total**: ~3 hours

---

## Phase 6: Portfolio Deletion [Priority: MEDIUM]

### Task 6.1: Create Delete Confirmation Dialog
- [ ] Create `components/portfolios/delete-portfolio-dialog.tsx`
- [ ] Use Catalyst UI Dialog component
- [ ] Display confirmation message
- [ ] Add confirm and cancel buttons
- [ ] Style with Catalyst UI
- **Files**: `components/portfolios/delete-portfolio-dialog.tsx`
- **Estimated Time**: 45 minutes

### Task 6.2: Implement Delete Handler
- [ ] Create delete handler function
- [ ] Call `DELETE /api/portfolios/[id]` API
- [ ] Handle loading state during deletion
- [ ] Handle success (redirect to portfolios list)
- [ ] Handle errors (display error message)
- **Files**: `components/portfolios/delete-portfolio-dialog.tsx`
- **Estimated Time**: 45 minutes

### Task 6.3: Integrate Delete Button in Portfolio Detail
- [ ] Add delete button to portfolio detail
- [ ] Open delete dialog on click
- [ ] Test delete flow works
- **Files**: `components/portfolios/portfolio-detail.tsx`
- **Estimated Time**: 15 minutes

### Task 6.4: Integrate Delete Button in Portfolio List
- [ ] Add delete button to portfolio card
- [ ] Open delete dialog on click
- [ ] Test delete flow works
- **Files**: `components/portfolios/portfolio-card.tsx`
- **Estimated Time**: 15 minutes

### Task 6.5: Test Portfolio Deletion
- [ ] Test delete confirmation works
- [ ] Test delete action works
- [ ] Test success redirect works
- [ ] Test error handling works
- **Files**: `components/portfolios/delete-portfolio-dialog.tsx`
- **Estimated Time**: 30 minutes

**Phase 6 Total**: ~2.5 hours

---

## Phase 7: Testing & Refinement [Priority: MEDIUM]

### Task 7.1: Test Dashboard Integration
- [ ] Test dashboard displays real data
- [ ] Test loading state works
- [ ] Test error state works
- [ ] Test empty state works
- **Files**: `app/(protected)/dashboard/page.tsx`
- **Estimated Time**: 30 minutes

### Task 7.2: Test Portfolio List View
- [ ] Test portfolio list displays correctly
- [ ] Test quick actions work
- [ ] Test navigation works
- [ ] Test loading/error/empty states
- **Files**: `app/(protected)/portfolios/page.tsx`
- **Estimated Time**: 30 minutes

### Task 7.3: Test Portfolio Detail View
- [ ] Test portfolio detail displays correctly
- [ ] Test nested assets display correctly
- [ ] Test edit/delete buttons work
- [ ] Test loading/error/404 states
- **Files**: `app/(protected)/portfolios/[id]/page.tsx`
- **Estimated Time**: 30 minutes

### Task 7.4: Test Portfolio Creation
- [ ] Test form validation works
- [ ] Test form submission works
- [ ] Test success redirect works
- [ ] Test error handling works
- **Files**: `components/portfolios/portfolio-form.tsx`
- **Estimated Time**: 30 minutes

### Task 7.5: Test Portfolio Editing
- [ ] Test form pre-fills correctly
- [ ] Test form submission works
- [ ] Test success redirect works
- [ ] Test error handling works
- **Files**: `components/portfolios/portfolio-form.tsx`
- **Estimated Time**: 30 minutes

### Task 7.6: Test Portfolio Deletion
- [ ] Test delete confirmation works
- [ ] Test delete action works
- [ ] Test success redirect works
- [ ] Test error handling works
- **Files**: `components/portfolios/delete-portfolio-dialog.tsx`
- **Estimated Time**: 30 minutes

### Task 7.7: Performance Optimization
- [ ] Optimize data fetching
- [ ] Add caching where appropriate
- [ ] Optimize re-renders
- [ ] Test performance improvements
- **Files**: Various
- **Estimated Time**: 1 hour

### Task 7.8: UX Improvements
- [ ] Add optimistic UI updates
- [ ] Improve loading states
- [ ] Improve error messages
- [ ] Add success notifications
- **Files**: Various
- **Estimated Time**: 1 hour

**Phase 7 Total**: ~5 hours

---

## Summary

**Total Tasks**: 70  
**Total Estimated Time**: ~26.5 hours

**Phase Breakdown:**
- Phase 1: Dashboard Integration - 4 hours
- Phase 2: Portfolio List View - 4.5 hours
- Phase 3: Portfolio Detail View - 4.5 hours
- Phase 4: Portfolio Creation Form - 3.5 hours
- Phase 5: Portfolio Edit Form - 3 hours
- Phase 6: Portfolio Deletion - 2.5 hours
- Phase 7: Testing & Refinement - 5 hours

