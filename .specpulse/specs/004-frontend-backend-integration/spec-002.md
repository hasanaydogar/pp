# Specification: Portfolio Management UI Integration

**Feature ID:** 004-Frontend-Backend-Integration  
**Specification ID:** spec-002  
**Created:** 2025-11-30  
**Status:** Draft  
**Priority:** High

## Overview

Integrate the Dashboard page and Portfolio management features with the Portfolio API endpoints. This includes displaying portfolio data, creating/editing portfolios, and managing portfolio settings.

## Requirements

### 1. Dashboard Page Integration

- **Location**: `app/(protected)/dashboard/page.tsx`
- **Data Sources**:
  - `GET /api/portfolios` - List all portfolios
  - `GET /api/portfolios/[id]/analytics` - Portfolio analytics
- **Features**:
  - Display total portfolio value (sum of all portfolios)
  - Display total gain/loss across all portfolios
  - Display portfolio count
  - Display top assets across all portfolios
  - Real-time data updates
  - Loading states
  - Error handling

### 2. Portfolio List View

- **Location**: `app/(protected)/portfolios/page.tsx` (new page)
- **Data Source**: `GET /api/portfolios`
- **Features**:
  - Display list of all portfolios
  - Portfolio cards with key metrics
  - Quick actions (view, edit, delete)
  - Empty state when no portfolios exist
  - Loading skeleton
  - Error state

### 3. Portfolio Detail View

- **Location**: `app/(protected)/portfolios/[id]/page.tsx` (new page)
- **Data Source**: `GET /api/portfolios/[id]`
- **Features**:
  - Display portfolio details
  - Display nested assets
  - Display nested transactions
  - Portfolio analytics
  - Edit portfolio button
  - Delete portfolio button
  - Loading states
  - Error handling

### 4. Portfolio Creation Form

- **Location**: `app/(protected)/portfolios/new/page.tsx` (new page) or Modal
- **Data Source**: `POST /api/portfolios`
- **Features**:
  - Form fields: name, base_currency, benchmark_symbol
  - Form validation (Zod schemas)
  - Submit handler
  - Success/error feedback
  - Redirect after creation

### 5. Portfolio Edit Form

- **Location**: `app/(protected)/portfolios/[id]/edit/page.tsx` (new page) or Modal
- **Data Source**: `PUT /api/portfolios/[id]`
- **Features**:
  - Pre-filled form with existing data
  - Form validation
  - Submit handler
  - Success/error feedback
  - Redirect after update

### 6. Portfolio Deletion

- **Location**: Portfolio detail page or list view
- **Data Source**: `DELETE /api/portfolios/[id]`
- **Features**:
  - Confirmation dialog
  - Delete handler
  - Success/error feedback
  - Redirect after deletion
  - Optimistic UI update

## UI Components Required

### Portfolio Card Component
- Display portfolio name
- Display total value
- Display gain/loss
- Display asset count
- Action buttons (view, edit, delete)

### Portfolio Form Component
- Name input
- Base currency select
- Benchmark symbol input
- Submit button
- Cancel button
- Validation error display

### Portfolio Analytics Component
- Total value display
- Gain/loss display
- ROI percentage
- Asset allocation chart (optional)
- Performance chart (optional)

## Data Flow

1. **Dashboard Load**:
   - Server Component fetches portfolios on initial load
   - Client Component handles real-time updates (optional)

2. **Portfolio List**:
   - Server Component fetches portfolios
   - Client Component handles filtering/sorting (optional)

3. **Portfolio Detail**:
   - Server Component fetches portfolio with nested data
   - Client Component handles real-time updates (optional)

4. **Portfolio Create/Edit**:
   - Client Component handles form state
   - API call on submit
   - Optimistic UI update
   - Redirect on success

5. **Portfolio Delete**:
   - Client Component handles confirmation
   - API call on confirm
   - Optimistic UI update
   - Redirect on success

## Error Handling

- Network errors: Display user-friendly message
- Validation errors: Display field-specific errors
- Authentication errors: Redirect to login
- Server errors: Display generic error message

## Loading States

- Dashboard: Skeleton cards
- Portfolio list: Skeleton cards
- Portfolio detail: Skeleton sections
- Forms: Disable submit button, show spinner
- Actions: Show loading indicator

## Acceptance Criteria

- [ ] Dashboard displays real portfolio data from API
- [ ] Portfolio list page created and functional
- [ ] Portfolio detail page created and functional
- [ ] Portfolio creation form works
- [ ] Portfolio edit form works
- [ ] Portfolio deletion works
- [ ] All loading states implemented
- [ ] All error states handled
- [ ] Empty states displayed when no data
- [ ] Type-safe API calls throughout

## Related Specifications

- `spec-001.md`: Frontend-Backend Integration - General
- `spec-003.md`: Asset Management UI Integration

