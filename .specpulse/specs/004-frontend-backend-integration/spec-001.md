# Specification: Frontend-Backend Integration - General

**Feature ID:** 004-Frontend-Backend-Integration  
**Specification ID:** spec-001  
**Created:** 2025-11-30  
**Status:** Draft  
**Priority:** High

## Overview

Integrate the frontend UI pages with the backend API endpoints. This specification covers the general integration architecture, data fetching patterns, error handling, and loading states.

## Requirements

### 1. Data Fetching Architecture

- **Server Components**: Use Next.js Server Components for initial data fetching
- **Client Components**: Use React hooks (useState, useEffect) for client-side data fetching
- **API Client**: Create a centralized API client utility (`lib/api/client.ts`)
- **Error Handling**: Consistent error handling across all API calls
- **Loading States**: Loading indicators for async operations
- **Cache Management**: Implement proper caching strategies

### 2. API Client Utility

- **Location**: `lib/api/client.ts`
- **Features**:
  - Centralized fetch wrapper
  - Automatic token injection
  - Request/response interceptors
  - Error transformation
  - Retry logic for failed requests
  - Type-safe API calls

### 3. Error Handling

- **Error Types**: Network errors, validation errors, authentication errors, server errors
- **Error Display**: User-friendly error messages
- **Error Recovery**: Retry mechanisms and fallback UI
- **Error Logging**: Client-side error logging (optional)

### 4. Loading States

- **Loading Indicators**: Skeleton loaders, spinners, progress bars
- **Optimistic Updates**: For better UX
- **Loading States Management**: Centralized loading state management

### 5. State Management

- **Server State**: React Server Components for initial data
- **Client State**: React hooks for interactive data
- **Cache**: Next.js cache for server-side data
- **Real-time Updates**: Supabase Realtime integration (optional, future)

## Technical Requirements

### API Client Structure

```typescript
// lib/api/client.ts
- createApiClient() - Factory function
- getPortfolios() - Fetch portfolios
- getPortfolio(id) - Fetch single portfolio
- createPortfolio(data) - Create portfolio
- updatePortfolio(id, data) - Update portfolio
- deletePortfolio(id) - Delete portfolio
- Error handling utilities
- Token management
```

### Error Handling Pattern

- Consistent error response format
- Error boundary components
- Error toast notifications
- Error retry mechanisms

### Loading State Pattern

- Skeleton loaders for lists
- Spinners for actions
- Progress indicators for long operations
- Optimistic UI updates

## Dependencies

- Feature 001: User Authentication (for token management)
- Feature 002: Portfolio Tracker API (all endpoints)
- Feature 003: UI Layout & Sidebar (for page structure)

## Acceptance Criteria

- [ ] API client utility created and tested
- [ ] Error handling implemented consistently
- [ ] Loading states implemented for all async operations
- [ ] Type-safe API calls throughout the application
- [ ] Error boundaries implemented
- [ ] Documentation created for API client usage

## Related Specifications

- `spec-002.md`: Portfolio Management UI Integration
- `spec-003.md`: Asset Management UI Integration

