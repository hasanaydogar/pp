# Specification: Asset Management UI Integration

**Feature ID:** 004-Frontend-Backend-Integration  
**Specification ID:** spec-003  
**Created:** 2025-11-30  
**Status:** Draft  
**Priority:** High

## Overview

Integrate the Assets page and Asset management features with the Asset API endpoints. This includes displaying assets, creating/editing assets, recording transactions, and managing asset data.

## Requirements

### 1. Assets Page Integration

- **Location**: `app/(protected)/assets/page.tsx`
- **Data Sources**:
  - `GET /api/portfolios/[id]/assets` - List assets for a portfolio
  - `GET /api/assets/[id]` - Get asset details
  - `GET /api/assets/[id]/performance` - Get asset performance
- **Features**:
  - Display all assets across portfolios or filter by portfolio
  - Asset table with all columns
  - Asset cards view (optional)
  - Filtering by portfolio, asset type, currency
  - Sorting by value, gain/loss, symbol
  - Search functionality
  - Loading states
  - Error handling

### 2. Asset Detail View

- **Location**: `app/(protected)/assets/[id]/page.tsx` (new page)
- **Data Source**: `GET /api/assets/[id]`
- **Features**:
  - Display asset details
  - Display transaction history
  - Display performance metrics
  - Display cost basis information
  - Edit asset button
  - Delete asset button
  - Add transaction button
  - Loading states
  - Error handling

### 3. Asset Creation Form

- **Location**: `app/(protected)/portfolios/[id]/assets/new/page.tsx` (new page) or Modal
- **Data Source**: `POST /api/portfolios/[id]/assets`
- **Features**:
  - Form fields: symbol, name, type, quantity, average_buy_price, currency, initial_purchase_date, notes
  - Form validation (Zod schemas)
  - Submit handler
  - Success/error feedback
  - Redirect after creation

### 4. Asset Edit Form

- **Location**: `app/(protected)/assets/[id]/edit/page.tsx` (new page) or Modal
- **Data Source**: `PUT /api/assets/[id]`
- **Features**:
  - Pre-filled form with existing data
  - Form validation
  - Submit handler
  - Success/error feedback
  - Redirect after update

### 5. Asset Deletion

- **Location**: Asset detail page or assets list
- **Data Source**: `DELETE /api/assets/[id]`
- **Features**:
  - Confirmation dialog
  - Delete handler
  - Success/error feedback
  - Redirect after deletion
  - Optimistic UI update

### 6. Transaction Recording

- **Location**: `app/(protected)/assets/[id]/transactions/new/page.tsx` (new page) or Modal
- **Data Source**: `POST /api/assets/[id]/transactions`
- **Features**:
  - Form fields: type (BUY/SELL), quantity, price, date, transaction_cost, currency, notes
  - Form validation
  - BUY transaction: Updates asset quantity and average price
  - SELL transaction: Validates sufficient quantity, calculates realized gain/loss
  - Submit handler
  - Success/error feedback
  - Redirect after creation

### 7. Transaction List View

- **Location**: Asset detail page (transactions section)
- **Data Source**: `GET /api/assets/[id]/transactions`
- **Features**:
  - Display transaction history
  - Pagination
  - Filter by transaction type
  - Sort by date
  - Transaction details (BUY/SELL, quantity, price, gain/loss)
  - Edit transaction button
  - Delete transaction button

### 8. Transaction Edit/Delete

- **Location**: Transaction list or detail view
- **Data Sources**: `PUT /api/transactions/[id]`, `DELETE /api/transactions/[id]`
- **Features**:
  - Edit transaction form
  - Delete confirmation
  - Success/error feedback
  - Asset recalculation after edit/delete

### 9. Bulk Import

- **Location**: `app/(protected)/portfolios/[id]/assets/import/page.tsx` (new page) or Modal
- **Data Source**: `POST /api/portfolios/[id]/assets/import`
- **Features**:
  - CSV/JSON import form
  - File upload
  - Data preview
  - Validation before import
  - Bulk import handler
  - Progress indicator
  - Success/error feedback

## UI Components Required

### Asset Table Component
- Display all asset columns
- Sortable columns
- Filterable rows
- Row actions (view, edit, delete)
- Empty state
- Loading skeleton

### Asset Card Component (Optional)
- Display key asset information
- Visual gain/loss indicator
- Quick actions
- Performance chart (mini)

### Asset Form Component
- Symbol input
- Name input
- Type select (STOCK, CRYPTO, FOREX, etc.)
- Quantity input
- Average buy price input
- Currency select
- Initial purchase date picker
- Notes textarea
- Validation error display

### Transaction Form Component
- Transaction type select (BUY/SELL)
- Quantity input
- Price input
- Date picker
- Transaction cost input
- Currency select
- Notes textarea
- Real-time validation
- Calculated fields display (total, gain/loss for SELL)

### Transaction List Component
- Transaction table
- Pagination controls
- Filter controls
- Sort controls
- Empty state
- Loading skeleton

### Bulk Import Component
- File upload input
- File format selector (CSV/JSON)
- Data preview table
- Validation errors display
- Import button
- Progress indicator

## Data Flow

1. **Assets List Load**:
   - Server Component fetches assets on initial load
   - Client Component handles filtering/sorting/search

2. **Asset Detail Load**:
   - Server Component fetches asset with transactions
   - Client Component handles real-time updates (optional)

3. **Asset Create/Edit**:
   - Client Component handles form state
   - API call on submit
   - Optimistic UI update
   - Redirect on success

4. **Transaction Record**:
   - Client Component handles form state
   - API call on submit
   - Asset recalculation
   - Optimistic UI update
   - Redirect on success

5. **Bulk Import**:
   - Client Component handles file upload
   - Parse and validate data
   - API call for bulk import
   - Progress tracking
   - Success/error feedback

## Error Handling

- Network errors: Display user-friendly message
- Validation errors: Display field-specific errors
- Business logic errors: Display specific error (e.g., insufficient quantity for SELL)
- Authentication errors: Redirect to login
- Server errors: Display generic error message

## Loading States

- Assets list: Skeleton table/cards
- Asset detail: Skeleton sections
- Forms: Disable submit button, show spinner
- Transactions: Skeleton table
- Bulk import: Progress bar

## Acceptance Criteria

- [ ] Assets page displays real asset data from API
- [ ] Asset detail page created and functional
- [ ] Asset creation form works
- [ ] Asset edit form works
- [ ] Asset deletion works
- [ ] Transaction recording works (BUY and SELL)
- [ ] Transaction list displays correctly
- [ ] Transaction edit/delete works
- [ ] Bulk import works
- [ ] All loading states implemented
- [ ] All error states handled
- [ ] Empty states displayed when no data
- [ ] Type-safe API calls throughout
- [ ] Asset recalculation works after transactions

## Related Specifications

- `spec-001.md`: Frontend-Backend Integration - General
- `spec-002.md`: Portfolio Management UI Integration

