# Currency Selection Feature

## Overview

The Currency Selection feature allows users to view their portfolio values in their preferred currency. The application automatically converts all monetary values using real-time exchange rates.

## Features

### ✅ Implemented (Phase 1 & 2)

1. **Currency Selector UI**
   - Dropdown in sidebar (desktop) and topbar (mobile)
   - Shows selected currency with icon
   - Lists all supported currencies
   - Persists selection in localStorage

2. **Exchange Rate Integration**
   - Real-time rates from ExchangeRate-API
   - 24-hour caching via React Query
   - Automatic background refresh
   - Fallback to static rates on API failure

3. **Currency Conversion**
   - Automatic conversion of all monetary values
   - Support for 50+ currencies
   - Cross-currency conversion (EUR → TRY, etc.)
   - Precise rounding (2 decimal places)

4. **Dashboard Integration**
   - Portfolio value conversion
   - Asset value conversion
   - Gain/loss conversion
   - Original currency display alongside converted

5. **Developer Experience**
   - Reusable `CurrencyDisplay` component
   - Utility functions for conversion
   - TypeScript types for all APIs
   - Comprehensive unit tests

### 🔄 Supported Currencies

**Major Currencies:**
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CHF (Swiss Franc)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)

**Regional Currencies:**
- TRY (Turkish Lira)
- CNY (Chinese Yuan)
- INR (Indian Rupee)
- BRL (Brazilian Real)
- MXN (Mexican Peso)
- And 40+ more...

## Usage

### For Users

1. **Select Currency:**
   - Click currency selector in sidebar (💵 USD)
   - Choose your preferred currency from dropdown
   - Selection is saved automatically

2. **View Converted Values:**
   - All monetary values automatically convert
   - Original currency shown in parentheses
   - Exchange rate timestamp displayed in dropdown

3. **Refresh Rates:**
   - Rates update automatically every 24 hours
   - Manual refresh: reopen currency dropdown
   - Fallback to static rates if API unavailable

### For Developers

#### Display Currency Values

```tsx
import { CurrencyDisplay } from '@/components/ui/currency-display';

// Automatic conversion to user's selected currency
<CurrencyDisplay 
  amount={1000} 
  currency="USD" 
  format="inline"
/>
// Output: ₺32,500.00 ($1,000.00)

// Converted only (no original)
<CurrencyDisplay 
  amount={1000} 
  currency="USD" 
  format="converted-only"
/>
// Output: ₺32,500.00

// Stacked format
<CurrencyDisplay 
  amount={1000} 
  currency="USD" 
  format="stacked"
/>
// Output:
// $1,000.00
// ₺32,500.00
```

#### Manual Conversion

```tsx
import { convertCurrency, formatCurrency } from '@/lib/utils/currency-conversion';
import { useExchangeRates } from '@/lib/hooks/use-exchange-rates';

function MyComponent() {
  const { data: rates } = useExchangeRates();
  
  const converted = convertCurrency(100, 'USD', 'EUR', rates);
  // Returns: 91.00
  
  const formatted = formatCurrency(converted, 'EUR');
  // Returns: "€91.00"
}
```

#### Get Conversion Rate

```tsx
import { getConversionRate, formatConversionRate } from '@/lib/utils/currency-conversion';

const rate = getConversionRate('USD', 'TRY', rates);
// Returns: 32.5

const formatted = formatConversionRate('USD', 'TRY', rate);
// Returns: "1 USD = 32.50 TRY"
```

#### Batch Conversion

```tsx
import { batchConvert, calculateTotal } from '@/lib/utils/currency-conversion';

const amounts = [
  { amount: 100, currency: 'USD' },
  { amount: 200, currency: 'EUR' },
];

// Convert all to TRY
const converted = batchConvert(amounts, 'TRY', rates);

// Calculate total in TRY
const total = calculateTotal(amounts, 'TRY', rates);
```

## Architecture

### Components

```
components/ui/
├── currency-display.tsx      # Main display component
└── spinner.tsx               # Loading indicator

lib/
├── api/
│   └── exchange-rates.ts     # API client
├── hooks/
│   └── use-exchange-rates.ts # React Query hook
├── utils/
│   └── currency-conversion.ts # Conversion utilities
├── types/
│   └── exchange-rates.ts     # TypeScript types
├── constants/
│   └── exchange-rates.ts     # Static fallback rates
└── context/
    └── currency-context.tsx  # Global currency state
```

### Data Flow

```
User selects currency
    ↓
CurrencyContext updates
    ↓
localStorage saves selection
    ↓
Components re-render
    ↓
useExchangeRates fetches rates (if needed)
    ↓
CurrencyDisplay converts values
    ↓
Formatted output displayed
```

### Caching Strategy

1. **React Query Cache:**
   - Stale time: 24 hours
   - Cache time: 48 hours
   - Background refetch on stale data

2. **localStorage:**
   - User's currency preference
   - Persists across sessions

3. **Fallback Rates:**
   - Static rates in code
   - Updated monthly
   - Used when API unavailable

## API Integration

### Provider: ExchangeRate-API

- **Website:** https://www.exchangerate-api.com/
- **Free Tier:** 1,500 requests/month
- **Update Frequency:** Daily
- **Supported Currencies:** 160+

### Environment Setup

```bash
# .env.local
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_api_key_here
```

Get your API key:
1. Visit https://www.exchangerate-api.com/
2. Click "Get Free Key"
3. Sign up with email (no credit card)
4. Copy API key to `.env.local`

### Rate Limiting

- **Expected Usage:** ~30 requests/month (with 24h cache)
- **Free Tier Limit:** 1,500 requests/month
- **Usage:** ~2% of free tier
- **Monitoring:** Via React Query DevTools

## Testing

### Unit Tests

```bash
npm test lib/utils/__tests__/currency-conversion.test.ts
```

Tests cover:
- Base currency conversion
- Cross-currency conversion
- Edge cases (zero, negative, same currency)
- Rounding behavior
- Batch operations
- Error handling

### Manual Testing

1. **Currency Selection:**
   - Open currency dropdown
   - Select different currencies
   - Verify selection persists on reload

2. **Value Conversion:**
   - Check dashboard values update
   - Verify original currency shown
   - Confirm conversion accuracy

3. **API Fallback:**
   - Disable network
   - Verify fallback rates used
   - Check warning message displayed

4. **Performance:**
   - Monitor React Query DevTools
   - Verify 24-hour cache working
   - Check no unnecessary API calls

## Performance

- **Initial Load:** <100ms (cached rates)
- **Currency Switch:** <50ms (instant)
- **API Call:** <200ms (when needed)
- **Cache Hit Rate:** >95%

## Accessibility

- Keyboard navigation supported
- Screen reader friendly
- ARIA labels on interactive elements
- High contrast mode compatible

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

### Phase 4: User Preferences (Planned)
- Save currency per portfolio
- Default currency setting
- Recent currencies list

### Phase 5: Performance (Planned)
- Memoization of conversions
- Virtual scrolling for large lists
- Lazy loading of rates

### Phase 6: Advanced Features (Planned)
- Historical exchange rates
- Currency trends charts
- Rate alerts
- Multi-currency portfolios

## Troubleshooting

### Currency not converting

**Problem:** Values show in original currency only

**Solution:**
1. Check API key in `.env.local`
2. Verify network connection
3. Check browser console for errors
4. Try manual refresh in currency dropdown

### Static rates warning

**Problem:** "Using static rates" message appears

**Solution:**
1. Check internet connection
2. Verify API key is valid
3. Check API status: https://status.exchangerate-api.com/
4. Rates will auto-refresh when API available

### Conversion inaccurate

**Problem:** Converted values seem wrong

**Solution:**
1. Check exchange rate timestamp
2. Verify original currency is correct
3. Compare with external source (xe.com)
4. Report issue if persistent

## Support

For issues or questions:
1. Check documentation: `/docs/features/currency-selection.md`
2. Review API docs: `/docs/development/currency-integration.md`
3. Check tests: `/lib/utils/__tests__/currency-conversion.test.ts`
4. Open GitHub issue

## Changelog

### v2.0.0 (2025-01-02)
- ✅ Exchange rate API integration
- ✅ Currency conversion utilities
- ✅ Dashboard integration
- ✅ Fallback mechanism
- ✅ Unit tests

### v1.0.0 (2024-12-02)
- ✅ Basic currency selector
- ✅ localStorage persistence
- ✅ UI components

---

**Last Updated:** 2025-01-02  
**Status:** ✅ Production Ready (Core Features)  
**Coverage:** Dashboard, Currency Selector, Conversion Utils
