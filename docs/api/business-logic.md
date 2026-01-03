# Business Logic: Portfolio Tracker

This document explains the business logic implemented in the Portfolio Tracker API.

## Average Buy Price Calculation

When a **BUY** transaction is recorded, the system automatically updates the asset's quantity and average buy price.

### Formula

```
newQuantity = oldQuantity + transactionAmount
newAveragePrice = (oldTotal + newTotal) / newQuantity

where:
  oldTotal = oldQuantity * oldAveragePrice
  newTotal = transactionAmount * transactionPrice
```

### Example 1: First Purchase

**Initial State:**
- Quantity: 0
- Average Buy Price: 0

**Transaction:**
- Amount: 10 shares
- Price: $100 per share

**Result:**
- New Quantity: 10
- New Average Price: $100
- Calculation: (0 + 10*100) / 10 = 100

### Example 2: Additional Purchase

**Initial State:**
- Quantity: 10 shares
- Average Buy Price: $100

**Transaction:**
- Amount: 5 shares
- Price: $120 per share

**Calculation:**
- oldTotal = 10 * 100 = $1,000
- newTotal = 5 * 120 = $600
- newQuantity = 10 + 5 = 15
- newAveragePrice = (1,000 + 600) / 15 = $106.67

**Result:**
- New Quantity: 15 shares
- New Average Price: $106.67

### Example 3: Multiple Purchases

**Initial State:**
- Quantity: 20 shares
- Average Buy Price: $50

**Transaction:**
- Amount: 10 shares
- Price: $60 per share

**Calculation:**
- oldTotal = 20 * 50 = $1,000
- newTotal = 10 * 60 = $600
- newQuantity = 20 + 10 = 30
- newAveragePrice = (1,000 + 600) / 30 = $53.33

**Result:**
- New Quantity: 30 shares
- New Average Price: $53.33

## Implementation

The calculation is implemented in `lib/api/business-logic.ts`:

```typescript
export function calculateAverageBuyPrice(
  oldQuantity: number,
  oldAveragePrice: number,
  transactionAmount: number,
  transactionPrice: number,
): { newQuantity: number; newAveragePrice: number } {
  const oldTotal = oldQuantity * oldAveragePrice;
  const newTotal = transactionAmount * transactionPrice;
  const newQuantity = oldQuantity + transactionAmount;
  const newAveragePrice = (oldTotal + newTotal) / newQuantity;
  
  return { newQuantity, newAveragePrice };
}
```

## Transaction Flow

### BUY Transaction

1. User creates BUY transaction via `POST /api/assets/[assetId]/transactions`
2. System validates transaction data
3. System fetches current asset (`quantity`, `average_buy_price`)
4. System calculates new values using `calculateAverageBuyPrice()`
5. System creates transaction record
6. System updates asset with new `quantity` and `average_buy_price`
7. Returns created transaction

**Note:** If asset update fails, transaction is still created. In production, consider implementing transaction rollback.

### SELL Transaction

1. User creates SELL transaction via `POST /api/assets/[assetId]/transactions`
2. System validates transaction data
3. System creates transaction record
4. **No asset update** (quantity and average price remain unchanged)
5. Returns created transaction

## Edge Cases

### Zero Quantity

If `newQuantity` equals zero after calculation, the function throws an error:
```
Cannot calculate average price with zero quantity
```

### Decimal Values

The calculation supports decimal quantities and prices:
- Quantity: 1.5 shares
- Price: $100.50 per share

### Large Numbers

The calculation handles large numbers correctly:
- Quantity: 1,000 shares
- Price: $50 per share
- Transaction: 500 shares at $60

## Precision

Financial values are stored as `NUMERIC(18,8)` in the database, providing:
- 18 total digits
- 8 decimal places
- Precision suitable for cryptocurrencies and high-value assets

## Testing

Unit tests for the business logic are located in:
- `lib/api/__tests__/business-logic.test.ts`

Integration tests for transaction flow are located in:
- `__tests__/integration/api/business-logic.test.ts`

