# Implementation Plan: Asset Management UI Integration

**Feature ID:** 004-Frontend-Backend-Integration  
**Plan ID:** plan-003  
**Specification:** spec-003  
**Created:** 2025-11-30  
**Status:** Draft  
**Priority:** High

## Overview

This plan covers integrating Asset management features with the Asset API endpoints. This includes Assets page integration, Asset CRUD operations, Transaction recording, and Bulk import functionality.

## Implementation Phases

### Phase 1: Assets Page Integration (Priority: HIGH)
**Estimated Time:** 4-5 hours

**Objectives:**
- Connect Assets page to Asset API
- Display real asset data
- Implement filtering and sorting
- Add search functionality

**Tasks:**
1. Update `app/(protected)/assets/page.tsx` to fetch real data
2. Create `lib/api/server/assets.ts` - Server-side asset fetching
3. Fetch assets across all portfolios or filter by portfolio
4. Create `components/assets/asset-table.tsx` - Asset table component
5. Implement table with all columns
6. Add filtering by portfolio, asset type, currency
7. Add sorting by value, gain/loss, symbol
8. Add search functionality
9. Implement loading skeleton
10. Implement error state
11. Implement empty state

**Deliverables:**
- Updated `app/(protected)/assets/page.tsx`
- `lib/api/server/assets.ts` - Server-side utilities
- `components/assets/asset-table.tsx` - Asset table component
- Filter/sort/search functionality
- Loading/error/empty states

**Acceptance Criteria:**
- [ ] Assets page displays real asset data
- [ ] Filtering works correctly
- [ ] Sorting works correctly
- [ ] Search works correctly
- [ ] Loading/error/empty states work

---

### Phase 2: Asset Detail View (Priority: HIGH)
**Estimated Time:** 4-5 hours

**Objectives:**
- Create Asset detail page
- Display asset information
- Display transaction history
- Display performance metrics

**Tasks:**
1. Create `app/(protected)/assets/[id]/page.tsx`
2. Create `components/assets/asset-detail.tsx` - Asset detail component
3. Fetch asset with transactions using Server Component
4. Fetch asset performance metrics
5. Display asset information
6. Create `components/assets/transaction-list.tsx` - Transaction list component
7. Display transaction history with pagination
8. Add edit asset button
9. Add delete asset button
10. Add add transaction button
11. Implement loading skeleton
12. Implement error state
13. Handle 404 case (asset not found)

**Deliverables:**
- `app/(protected)/assets/[id]/page.tsx` - Asset detail page
- `components/assets/asset-detail.tsx` - Asset detail component
- `components/assets/transaction-list.tsx` - Transaction list component
- Performance metrics display
- Loading/error/404 states

**Acceptance Criteria:**
- [ ] Asset detail page displays correct data
- [ ] Transaction history displayed correctly
- [ ] Performance metrics displayed correctly
- [ ] Edit/delete/add transaction buttons work
- [ ] Loading/error/404 states work

---

### Phase 3: Asset Creation Form (Priority: HIGH)
**Estimated Time:** 3-4 hours

**Objectives:**
- Create Asset creation form
- Implement form validation
- Handle form submission
- Add success/error feedback

**Tasks:**
1. Create `app/(protected)/portfolios/[id]/assets/new/page.tsx` or Modal component
2. Create `components/assets/asset-form.tsx` - Asset form component
3. Implement form fields (symbol, name, type, quantity, average_buy_price, currency, initial_purchase_date, notes)
4. Add form validation using Zod schemas
5. Implement form submission handler
6. Call `POST /api/portfolios/[id]/assets` API
7. Handle success (redirect to asset detail)
8. Handle errors (display validation errors)
9. Add loading state during submission
10. Add cancel button

**Deliverables:**
- `app/(protected)/portfolios/[id]/assets/new/page.tsx` - Asset creation page
- `components/assets/asset-form.tsx` - Asset form component
- Form validation
- Success/error handling

**Acceptance Criteria:**
- [ ] Form displays correctly
- [ ] All fields work correctly
- [ ] Validation works
- [ ] Form submission works
- [ ] Success redirect works
- [ ] Error handling works

---

### Phase 4: Asset Edit Form (Priority: HIGH)
**Estimated Time:** 2-3 hours

**Objectives:**
- Create Asset edit form
- Pre-fill form with existing data
- Handle form submission
- Add success/error feedback

**Tasks:**
1. Create `app/(protected)/assets/[id]/edit/page.tsx` or Modal component
2. Reuse `components/assets/asset-form.tsx` component
3. Fetch asset data using Server Component
4. Pre-fill form with existing data
5. Implement form submission handler
6. Call `PUT /api/assets/[id]` API
7. Handle success (redirect to asset detail)
8. Handle errors (display validation errors)
9. Add loading state during submission
10. Add cancel button

**Deliverables:**
- `app/(protected)/assets/[id]/edit/page.tsx` - Asset edit page
- Updated `components/assets/asset-form.tsx` - Support edit mode
- Form pre-filling
- Success/error handling

**Acceptance Criteria:**
- [ ] Form pre-fills correctly
- [ ] Validation works
- [ ] Form submission works
- [ ] Success redirect works
- [ ] Error handling works

---

### Phase 5: Asset Deletion (Priority: MEDIUM)
**Estimated Time:** 1-2 hours

**Objectives:**
- Implement Asset deletion
- Add confirmation dialog
- Handle success/error feedback

**Tasks:**
1. Create `components/assets/delete-asset-dialog.tsx` - Delete confirmation dialog
2. Implement delete handler
3. Call `DELETE /api/assets/[id]` API
4. Handle success (redirect to assets list or portfolio)
5. Handle errors (display error message)
6. Add loading state during deletion
7. Integrate delete button in asset detail and list

**Deliverables:**
- `components/assets/delete-asset-dialog.tsx` - Delete dialog
- Delete handler
- Success/error handling

**Acceptance Criteria:**
- [ ] Delete confirmation dialog works
- [ ] Delete action works
- [ ] Success redirect works
- [ ] Error handling works

---

### Phase 6: Transaction Recording (Priority: HIGH)
**Estimated Time:** 4-5 hours

**Objectives:**
- Create Transaction recording form
- Handle BUY transactions
- Handle SELL transactions
- Validate business logic (sufficient quantity for SELL)

**Tasks:**
1. Create `app/(protected)/assets/[id]/transactions/new/page.tsx` or Modal component
2. Create `components/transactions/transaction-form.tsx` - Transaction form component
3. Implement form fields (type, quantity, price, date, transaction_cost, currency, notes)
4. Add form validation using Zod schemas
5. Implement BUY transaction handler
6. Implement SELL transaction handler with quantity validation
7. Call `POST /api/assets/[id]/transactions` API
8. Handle success (redirect to asset detail)
9. Handle errors (display validation errors, insufficient quantity error)
10. Add loading state during submission
11. Add cancel button
12. Display calculated fields (total, gain/loss for SELL)

**Deliverables:**
- `app/(protected)/assets/[id]/transactions/new/page.tsx` - Transaction creation page
- `components/transactions/transaction-form.tsx` - Transaction form component
- BUY/SELL transaction handlers
- Business logic validation
- Success/error handling

**Acceptance Criteria:**
- [ ] Transaction form displays correctly
- [ ] BUY transaction works
- [ ] SELL transaction works
- [ ] Quantity validation works for SELL
- [ ] Calculated fields display correctly
- [ ] Form submission works
- [ ] Success redirect works
- [ ] Error handling works

---

### Phase 7: Transaction List & Management (Priority: MEDIUM)
**Estimated Time:** 3-4 hours

**Objectives:**
- Display transaction history
- Implement transaction edit
- Implement transaction delete
- Handle asset recalculation

**Tasks:**
1. Enhance `components/assets/transaction-list.tsx` component
2. Add pagination to transaction list
3. Add filter by transaction type
4. Add sort by date
5. Create `app/(protected)/transactions/[id]/edit/page.tsx` or Modal component
6. Create `components/transactions/transaction-edit-form.tsx` - Transaction edit form
7. Implement transaction edit handler
8. Call `PUT /api/transactions/[id]` API
9. Handle asset recalculation after edit
10. Create delete confirmation dialog
11. Implement transaction delete handler
12. Call `DELETE /api/transactions/[id]` API
13. Handle asset recalculation after delete

**Deliverables:**
- Enhanced `components/assets/transaction-list.tsx`
- `app/(protected)/transactions/[id]/edit/page.tsx` - Transaction edit page
- `components/transactions/transaction-edit-form.tsx` - Transaction edit form
- `components/transactions/delete-transaction-dialog.tsx` - Delete dialog
- Edit/delete handlers
- Asset recalculation logic

**Acceptance Criteria:**
- [ ] Transaction list displays correctly
- [ ] Pagination works
- [ ] Filtering works
- [ ] Sorting works
- [ ] Transaction edit works
- [ ] Transaction delete works
- [ ] Asset recalculation works after edit/delete

---

### Phase 8: Bulk Import (Priority: LOW)
**Estimated Time:** 4-5 hours

**Objectives:**
- Create Bulk import UI
- Handle CSV/JSON file upload
- Validate imported data
- Execute bulk import

**Tasks:**
1. Create `app/(protected)/portfolios/[id]/assets/import/page.tsx` or Modal component
2. Create `components/assets/bulk-import.tsx` - Bulk import component
3. Implement file upload input
4. Add file format selector (CSV/JSON)
5. Implement file parsing (CSV and JSON)
6. Create data preview table
7. Implement data validation
8. Display validation errors
9. Implement bulk import handler
10. Call `POST /api/portfolios/[id]/assets/import` API
11. Add progress indicator
12. Handle success/error feedback
13. Display import results

**Deliverables:**
- `app/(protected)/portfolios/[id]/assets/import/page.tsx` - Bulk import page
- `components/assets/bulk-import.tsx` - Bulk import component
- File parsing utilities
- Data validation
- Progress indicator
- Success/error handling

**Acceptance Criteria:**
- [ ] File upload works
- [ ] CSV parsing works
- [ ] JSON parsing works
- [ ] Data preview displays correctly
- [ ] Validation works
- [ ] Bulk import works
- [ ] Progress indicator works
- [ ] Success/error handling works

---

### Phase 9: Testing & Refinement (Priority: MEDIUM)
**Estimated Time:** 3-4 hours

**Objectives:**
- Test all Asset management features
- Fix any bugs
- Optimize performance
- Improve UX

**Tasks:**
1. Test Assets page integration
2. Test Asset detail view
3. Test Asset creation
4. Test Asset editing
5. Test Asset deletion
6. Test Transaction recording (BUY and SELL)
7. Test Transaction edit/delete
8. Test Bulk import
9. Test error scenarios
10. Test loading states
11. Test empty states
12. Performance optimization
13. UX improvements

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
- Feature 004-002: Portfolio Management UI Integration (for portfolio context)
- Feature 002: Portfolio Tracker API (all Asset and Transaction endpoints)

## Timeline

- **Phase 1:** 4-5 hours
- **Phase 2:** 4-5 hours
- **Phase 3:** 3-4 hours
- **Phase 4:** 2-3 hours
- **Phase 5:** 1-2 hours
- **Phase 6:** 4-5 hours
- **Phase 7:** 3-4 hours
- **Phase 8:** 4-5 hours
- **Phase 9:** 3-4 hours

**Total Estimated Time:** 28-36 hours

## Risk Assessment

**Low Risk:**
- Asset list/detail views (standard CRUD patterns)
- Form creation (standard form patterns)

**Medium Risk:**
- Transaction recording with business logic (needs careful validation)
- Bulk import (needs robust error handling)
- Asset recalculation after transaction edit/delete (needs careful implementation)

**Mitigation:**
- Thoroughly test transaction business logic
- Implement robust validation for bulk import
- Test asset recalculation thoroughly
- Add comprehensive error handling

## Success Criteria

- [ ] Assets page displays real asset data
- [ ] Asset detail page works correctly
- [ ] Asset creation works
- [ ] Asset editing works
- [ ] Asset deletion works
- [ ] Transaction recording works (BUY and SELL)
- [ ] Transaction edit/delete works
- [ ] Bulk import works
- [ ] All loading/error/empty states work
- [ ] All tests pass

