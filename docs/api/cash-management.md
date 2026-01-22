# Cash Management API

API documentation for managing cash positions and transactions within portfolios.

## Base URL

All endpoints are prefixed with `/api`.

## Authentication

All endpoints require authentication. Include authentication cookies in requests.

---

## Cash Position Endpoints

### GET /api/portfolios/[id]/cash

List all cash positions for a portfolio.

**Path Parameters:**
- `id`: Portfolio UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "portfolio_id": "uuid",
    "currency": "TRY",
    "amount": 100000.00,
    "last_updated": "2025-01-01T00:00:00Z",
    "notes": "Ana hesap"
  },
  {
    "id": "uuid",
    "portfolio_id": "uuid",
    "currency": "USD",
    "amount": 5000.00,
    "last_updated": "2025-01-01T00:00:00Z",
    "notes": null
  }
]
```

**Status Codes:** 200, 401, 404, 500

---

### POST /api/portfolios/[id]/cash

Create a new cash position.

**Path Parameters:**
- `id`: Portfolio UUID

**Request Body:**
```json
{
  "currency": "EUR",
  "amount": 2500.00,
  "notes": "Euro hesabı"
}
```

**Validation:**
- `currency`: Required, string (ISO 4217 currency code)
- `amount`: Optional, number (default: 0)
- `notes`: Optional, string

**Response:**
```json
{
  "id": "uuid",
  "portfolio_id": "uuid",
  "currency": "EUR",
  "amount": 2500.00,
  "last_updated": "2025-01-01T00:00:00Z",
  "notes": "Euro hesabı"
}
```

**Status Codes:** 201, 400, 401, 404, 409 (duplicate currency), 500

---

### GET /api/portfolios/[id]/cash/[currency]

Get a specific cash position by currency.

**Path Parameters:**
- `id`: Portfolio UUID
- `currency`: Currency code (e.g., TRY, USD, EUR)

**Response:**
```json
{
  "id": "uuid",
  "portfolio_id": "uuid",
  "currency": "TRY",
  "amount": 100000.00,
  "last_updated": "2025-01-01T00:00:00Z",
  "notes": "Ana hesap"
}
```

**Status Codes:** 200, 401, 404, 500

---

### PUT /api/portfolios/[id]/cash/[currency]

Update a cash position.

**Path Parameters:**
- `id`: Portfolio UUID
- `currency`: Currency code

**Request Body:**
```json
{
  "amount": 150000.00,
  "notes": "Güncellendi"
}
```

**Response:**
```json
{
  "id": "uuid",
  "portfolio_id": "uuid",
  "currency": "TRY",
  "amount": 150000.00,
  "last_updated": "2025-01-02T00:00:00Z",
  "notes": "Güncellendi"
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

### DELETE /api/portfolios/[id]/cash/[currency]

Delete a cash position.

**Path Parameters:**
- `id`: Portfolio UUID
- `currency`: Currency code

**Response:**
```json
{
  "success": true
}
```

**Status Codes:** 200, 401, 404, 500

---

## Cash Transaction Endpoints

### GET /api/portfolios/[id]/cash/[currency]/transactions

List transactions for a cash position.

**Path Parameters:**
- `id`: Portfolio UUID
- `currency`: Currency code

**Query Parameters:**
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)
- `type`: Filter by transaction type

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "cash_position_id": "uuid",
      "type": "DEPOSIT",
      "amount": 10000.00,
      "related_transaction_id": null,
      "date": "2025-01-01T00:00:00Z",
      "notes": "Maaş yatırımı",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

**Status Codes:** 200, 401, 404, 500

---

### POST /api/portfolios/[id]/cash/[currency]/transactions

Create a new cash transaction.

**Path Parameters:**
- `id`: Portfolio UUID
- `currency`: Currency code

**Request Body:**
```json
{
  "type": "DEPOSIT",
  "amount": 10000.00,
  "date": "2025-01-01T00:00:00Z",
  "notes": "Maaş yatırımı"
}
```

**Validation:**
- `type`: Required, one of: DEPOSIT, WITHDRAW, BUY_ASSET, SELL_ASSET, DIVIDEND, FEE, INTEREST, TRANSFER_IN, TRANSFER_OUT
- `amount`: Required, positive number
- `date`: Optional, ISO 8601 datetime (default: now)
- `notes`: Optional, string

**Response:**
```json
{
  "id": "uuid",
  "cash_position_id": "uuid",
  "type": "DEPOSIT",
  "amount": 10000.00,
  "related_transaction_id": null,
  "date": "2025-01-01T00:00:00Z",
  "notes": "Maaş yatırımı",
  "created_at": "2025-01-01T00:00:00Z",
  "new_position_amount": 10000.00
}
```

**Response (WITHDRAW example):**
```json
{
  "id": "uuid",
  "cash_position_id": "uuid",
  "type": "WITHDRAW",
  "amount": -5000.00,
  "related_transaction_id": null,
  "date": "2025-01-01T00:00:00Z",
  "notes": "Para çekme",
  "created_at": "2025-01-01T00:00:00Z",
  "new_position_amount": 5000.00
}
```

**Notes:**
- Cash position amount is automatically updated based on transaction type
- Transaction amounts are stored as **signed values** in the database:
  - Positive for inflows (DEPOSIT, SELL_ASSET, DIVIDEND, INTEREST, TRANSFER_IN)
  - Negative for outflows (WITHDRAW, BUY_ASSET, FEE, TRANSFER_OUT)
- The response `amount` field reflects the signed value stored

**Status Codes:** 201, 400, 401, 404, 500

---

## Transaction Types

| Type | Effect | Description |
|------|--------|-------------|
| `DEPOSIT` | +amount | Para yatırma |
| `WITHDRAW` | -amount | Para çekme |
| `BUY_ASSET` | -amount | Varlık alımı |
| `SELL_ASSET` | +amount | Varlık satışı |
| `DIVIDEND` | +amount | Temettü |
| `FEE` | -amount | Komisyon/Ücret |
| `INTEREST` | +amount | Faiz geliri |
| `TRANSFER_IN` | +amount | Transfer (gelen) |
| `TRANSFER_OUT` | -amount | Transfer (giden) |

---

## TypeScript Types

```typescript
enum CashTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  BUY_ASSET = 'BUY_ASSET',
  SELL_ASSET = 'SELL_ASSET',
  DIVIDEND = 'DIVIDEND',
  FEE = 'FEE',
  INTEREST = 'INTEREST',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

interface CashPosition {
  id: string;
  portfolio_id: string;
  currency: string;
  amount: number;
  last_updated: string;
  notes?: string | null;
}

interface CashTransaction {
  id: string;
  cash_position_id: string;
  type: CashTransactionType;
  amount: number;
  related_transaction_id?: string | null;
  date: string;
  notes?: string | null;
  created_at: string;
}
```

## Usage Example

```typescript
// Add a deposit transaction
const response = await fetch('/api/portfolios/portfolio-id/cash/TRY/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'DEPOSIT',
    amount: 10000,
    notes: 'Maaş yatırımı',
  }),
});

const transaction = await response.json();
```
