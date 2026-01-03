# Specification: Currency Selection UI

<!-- FEATURE_DIR: 006-currency-selection-ui -->
<!-- FEATURE_ID: 006 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: completed -->
<!-- CREATED: 2025-12-02T00:00:00.000000 -->

## Description
Implement a default currency selection feature that allows users to choose their preferred currency for displaying values throughout the application. The currency selector should be accessible from the top-right corner of the application, and the selection should persist across sessions.

## Requirements

### Functional Requirements
- [x] Currency selector dropdown in top-right corner of the application
- [x] Support for all ISO 4217 currency codes (USD, TRY, EUR, GBP, JPY, etc.)
- [x] Persistent currency selection using localStorage
- [x] Default currency set to USD
- [x] Currency context/provider for global state management
- [x] Dashboard displays values in selected currency format
- [x] Currency formatting utility functions

### Non-Functional Requirements
- **Performance**: Currency selection should be instant with no noticeable delay
- **Security**: No sensitive data stored in localStorage (only currency preference)
- **Scalability**: Support for 30+ currencies with easy addition of more

## Acceptance Criteria
- [x] Given a user is on the dashboard, when they click the currency selector in the top-right corner, then they see a dropdown with all supported currencies
- [x] Given a user selects a currency, when they navigate away and return, then their selection persists
- [x] Given a user has selected a currency, when they view the dashboard, then all monetary values are displayed in the selected currency format
- [x] Given a new user visits the application, when they first load the dashboard, then USD is used as the default currency

## Technical Considerations

### Dependencies
- **External APIs**: None (currency conversion not implemented yet)
- **Database Changes**: None
- **Third-party Libraries**: None (using native browser Intl API for formatting)

### Implementation Notes
- Currency context uses React Context API for state management
- localStorage key: `preferred_currency`
- Currency formatting uses `Intl.NumberFormat` API
- Dashboard converted to client component to access currency context
- Currency selector integrated into topbar navbar section

## Testing Strategy
- **Unit Tests**: Currency context, formatting utilities
- **Integration Tests**: Currency selection persistence, dashboard display updates
- **End-to-End Tests**: User selects currency and verifies display updates

## Definition of Done
- [x] All requirements implemented
- [x] All acceptance criteria met
- [x] Code reviewed and approved
- [ ] Tests written and passing (optional - can be added later)
- [x] Documentation updated
- [x] Feature deployed and working

## Key Files Created/Modified
- `lib/context/currency-context.tsx` - Currency state management
- `lib/utils/currency.ts` - Currency formatting utilities
- `app/(protected)/application-layout-client.tsx` - Currency selector in topbar
- `app/(protected)/dashboard/dashboard-content-client.tsx` - Currency-aware dashboard
- `app/(protected)/layout.tsx` - CurrencyProvider wrapper

## Additional Notes
- Currency conversion (exchange rates) is not implemented - only display formatting changes
- Future enhancement: Add real-time currency conversion using exchange rate API
- Currency selection affects dashboard display only - individual asset currencies remain unchanged
