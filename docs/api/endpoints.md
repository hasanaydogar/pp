# Portfolio Tracker API Endpoints

Complete API documentation for the Portfolio Tracker application.

## Base URL

All endpoints are prefixed with `/api`.

## Authentication

All endpoints require authentication. Include authentication cookies in requests. Unauthenticated requests will receive a `401 Unauthorized` response.

**Note:** For Supabase SSR authentication, include both cookies:
- `sb-<project-ref>-auth-token.0`
- `sb-<project-ref>-auth-token.1`

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": { /* optional details */ }
}
```

### Status Codes

- `200 OK` - Success (GET, PUT, DELETE)
- `201 Created` - Success (POST)
- `400 Bad Request` - Validation error or invalid input
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Portfolio Endpoints

### GET /api/portfolios

List all portfolios for the authenticated user.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "My Portfolio",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Status Codes:** 200, 401, 500

---

### POST /api/portfolios

Create a new portfolio.

**Request Body:**
```json
{
  "name": "My Portfolio"
}
```

**Validation:**
- `name`: Required, string, min 1 character, max 255 characters

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "My Portfolio",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": null
  }
}
```

**Status Codes:** 201, 400, 401, 500

---

### GET /api/portfolios/[id]

Get portfolio details with nested assets and transactions.

**Path Parameters:**
- `id`: Portfolio UUID

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "My Portfolio",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": null,
    "assets": [
      {
        "id": "uuid",
        "portfolio_id": "uuid",
        "symbol": "AAPL",
        "quantity": 10,
        "average_buy_price": 150.50,
        "type": "STOCK",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": null,
        "transactions": [
          {
            "id": "uuid",
            "asset_id": "uuid",
            "type": "BUY",
            "amount": 10,
            "price": 150.50,
            "date": "2025-01-01T00:00:00Z",
            "transaction_cost": 0,
            "created_at": "2025-01-01T00:00:00Z",
            "updated_at": null
          }
        ]
      }
    ]
  }
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

### PUT /api/portfolios/[id]

Update portfolio (e.g., change name).

**Path Parameters:**
- `id`: Portfolio UUID

**Request Body:**
```json
{
  "name": "Updated Portfolio Name"
}
```

**Validation:**
- `name`: Optional, string, min 1 character, max 255 characters

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Updated Portfolio Name",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T01:00:00Z"
  }
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

### DELETE /api/portfolios/[id]

Delete portfolio. Cascade deletes all assets and transactions.

**Path Parameters:**
- `id`: Portfolio UUID

**Response:**
```json
{
  "message": "Portfolio deleted successfully"
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

## Asset Endpoints

### GET /api/portfolios/[portfolioId]/assets

List all assets in a portfolio.

**Path Parameters:**
- `portfolioId`: Portfolio UUID

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "portfolio_id": "uuid",
      "symbol": "AAPL",
      "quantity": 10,
      "average_buy_price": 150.50,
      "type": "STOCK",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": null
    }
  ]
}
```

**Status Codes:** 200, 400, 401, 500

---

### POST /api/portfolios/[portfolioId]/assets

Add new asset to portfolio.

**Path Parameters:**
- `portfolioId`: Portfolio UUID

**Request Body:**
```json
{
  "portfolio_id": "uuid",
  "symbol": "AAPL",
  "quantity": 10,
  "average_buy_price": 150.50,
  "type": "STOCK"
}
```

**Validation:**
- `portfolio_id`: Required, UUID, must match path parameter
- `symbol`: Required, string, min 1 character, max 20 characters
- `quantity`: Required, number, positive
- `average_buy_price`: Required, number, positive
- `type`: Required, enum: STOCK, CRYPTO, FOREX, MUTUAL_FUND, ETF, BOND, COMMODITY, REAL_ESTATE, DERIVATIVE, OTHER

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "portfolio_id": "uuid",
    "symbol": "AAPL",
    "quantity": 10,
    "average_buy_price": 150.50,
    "type": "STOCK",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": null
  }
}
```

**Status Codes:** 201, 400, 401, 404, 500

**Error Cases:**
- `400 Bad Request`: Duplicate asset (same symbol + type in portfolio)

---

### GET /api/assets/[id]

Get asset details with nested transactions.

**Path Parameters:**
- `id`: Asset UUID

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "portfolio_id": "uuid",
    "symbol": "AAPL",
    "quantity": 10,
    "average_buy_price": 150.50,
    "type": "STOCK",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": null,
    "transactions": [
      {
        "id": "uuid",
        "asset_id": "uuid",
        "type": "BUY",
        "amount": 10,
        "price": 150.50,
        "date": "2025-01-01T00:00:00Z",
        "transaction_cost": 0,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": null
      }
    ]
  }
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

### PUT /api/assets/[id]

Update asset (quantity, price, symbol, type).

**Path Parameters:**
- `id`: Asset UUID

**Request Body:**
```json
{
  "symbol": "AAPL",
  "quantity": 15,
  "average_buy_price": 155.00,
  "type": "STOCK"
}
```

**Validation:**
- All fields optional
- `symbol`: String, min 1 character, max 20 characters
- `quantity`: Number, positive
- `average_buy_price`: Number, positive
- `type`: Enum: STOCK, CRYPTO, FOREX, MUTUAL_FUND, ETF, BOND, COMMODITY, REAL_ESTATE, DERIVATIVE, OTHER

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "portfolio_id": "uuid",
    "symbol": "AAPL",
    "quantity": 15,
    "average_buy_price": 155.00,
    "type": "STOCK",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T01:00:00Z"
  }
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

### DELETE /api/assets/[id]

Delete asset. Cascade deletes all transactions.

**Path Parameters:**
- `id`: Asset UUID

**Response:**
```json
{
  "message": "Asset deleted successfully"
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

## Transaction Endpoints

### GET /api/assets/[assetId]/transactions

List all transactions for an asset with pagination.

**Path Parameters:**
- `assetId`: Asset UUID

**Query Parameters:**
- `limit`: Number of results (default: 100, max: 1000)
- `offset`: Number of results to skip (default: 0)
- `order`: Sort order - `asc` or `desc` (default: `desc`)

**Example:** `/api/assets/[assetId]/transactions?limit=10&offset=0&order=desc`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "asset_id": "uuid",
      "type": "BUY",
      "amount": 10,
      "price": 150.50,
      "date": "2025-01-01T00:00:00Z",
      "transaction_cost": 0,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": null
    }
  ],
  "count": 25
}
```

**Status Codes:** 200, 400, 401, 500

---

### POST /api/assets/[assetId]/transactions

Record new transaction (BUY or SELL).

**Path Parameters:**
- `assetId`: Asset UUID

**Request Body:**
```json
{
  "asset_id": "uuid",
  "type": "BUY",
  "amount": 5,
  "price": 155.00,
  "date": "2025-01-01T00:00:00Z",
  "transaction_cost": 1.50
}
```

**Validation:**
- `asset_id`: Required, UUID, must match path parameter
- `type`: Required, enum: BUY, SELL
- `amount`: Required, number, positive
- `price`: Required, number, positive
- `date`: Required, ISO datetime string
- `transaction_cost`: Optional, number, non-negative (default: 0)

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "asset_id": "uuid",
    "type": "BUY",
    "amount": 5,
    "price": 155.00,
    "date": "2025-01-01T00:00:00Z",
    "transaction_cost": 1.50,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": null
  }
}
```

**Status Codes:** 201, 400, 401, 404, 500

**Business Logic:**
- For **BUY** transactions: Automatically updates asset's `quantity` and `average_buy_price`
- For **SELL** transactions: Only creates transaction (no asset update)

**Average Buy Price Calculation:**
```
newQuantity = oldQuantity + transactionAmount
newAveragePrice = (oldTotal + newTotal) / newQuantity
where:
  oldTotal = oldQuantity * oldAveragePrice
  newTotal = transactionAmount * transactionPrice
```

---

### GET /api/transactions/[id]

Get transaction details.

**Path Parameters:**
- `id`: Transaction UUID

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "asset_id": "uuid",
    "type": "BUY",
    "amount": 10,
    "price": 150.50,
    "date": "2025-01-01T00:00:00Z",
    "transaction_cost": 0,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": null
  }
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

### PUT /api/transactions/[id]

Update transaction.

**Path Parameters:**
- `id`: Transaction UUID

**Request Body:**
```json
{
  "type": "SELL",
  "amount": 5,
  "price": 160.00,
  "date": "2025-01-02T00:00:00Z",
  "transaction_cost": 1.00
}
```

**Validation:**
- All fields optional
- `type`: Enum: BUY, SELL
- `amount`: Number, positive
- `price`: Number, positive
- `date`: ISO datetime string
- `transaction_cost`: Number, non-negative

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "asset_id": "uuid",
    "type": "SELL",
    "amount": 5,
    "price": 160.00,
    "date": "2025-01-02T00:00:00Z",
    "transaction_cost": 1.00,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-02T00:00:00Z"
  }
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

### DELETE /api/transactions/[id]

Delete transaction.

**Path Parameters:**
- `id`: Transaction UUID

**Response:**
```json
{
  "message": "Transaction deleted successfully"
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

## Usage Examples

### Create Portfolio and Add Asset

```bash
# 1. Create portfolio
curl -X POST http://localhost:3000/api/portfolios \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"name":"My Portfolio"}'

# 2. Add asset to portfolio
curl -X POST http://localhost:3000/api/portfolios/{portfolioId}/assets \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "portfolio_id": "{portfolioId}",
    "symbol": "AAPL",
    "quantity": 10,
    "average_buy_price": 150.50,
    "type": "STOCK"
  }'

# 3. Record BUY transaction (updates asset automatically)
curl -X POST http://localhost:3000/api/assets/{assetId}/transactions \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "asset_id": "{assetId}",
    "type": "BUY",
    "amount": 5,
    "price": 155.00,
    "date": "2025-01-01T00:00:00Z"
  }'
```

### Get Portfolio with Nested Data

```bash
curl http://localhost:3000/api/portfolios/{portfolioId} \
  -H "Cookie: sb-access-token=..."
```

### List Transactions with Pagination

```bash
curl "http://localhost:3000/api/assets/{assetId}/transactions?limit=10&offset=0&order=desc" \
  -H "Cookie: sb-access-token=..."
```

---

## Enhanced Features Endpoints

### POST /api/portfolios/[id]/assets/import

Create asset from historical transactions. Calculates initial quantity and average buy price from transactions.

**Request Body:**
```json
{
  "symbol": "AAPL",
  "type": "STOCK",
  "currency": "USD",
  "initial_purchase_date": "2024-01-01T00:00:00Z",
  "notes": "Initial purchase",
  "transactions": [
    {
      "type": "BUY",
      "amount": 10,
      "price": 150.00,
      "date": "2024-01-01T00:00:00Z",
      "transaction_cost": 0
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "asset": { /* created asset */ },
    "transactions": [ /* created transactions */ ],
    "created": 1,
    "failed": 0
  }
}
```

### POST /api/assets/[id]/transactions/import

Bulk import historical transactions for an asset.

**Request Body:**
```json
{
  "transactions": [
    {
      "type": "BUY",
      "amount": 5,
      "price": 155.00,
      "date": "2024-01-15T00:00:00Z",
      "transaction_cost": 0
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "created": 1,
    "failed": 0,
    "transactions": [ /* created transactions */ ]
  }
}
```

### GET /api/assets/[id]/cost-basis

Get cost basis information for an asset (FIFO method).

**Response:** `200 OK`
```json
{
  "data": {
    "totalLots": 2,
    "totalQuantity": 15,
    "totalCostBasis": 2250,
    "remainingQuantity": 10,
    "remainingCostBasis": 1500,
    "lots": [ /* cost basis lots */ ],
    "method": "FIFO"
  }
}
```

### GET /api/portfolios/[id]/benchmark-comparison

Compare portfolio performance vs benchmark.

**Response:** `200 OK`
```json
{
  "data": {
    "portfolioValue": 10000,
    "portfolioPerformance": 15.5,
    "benchmarkSymbol": "BIST100",
    "benchmarkPerformance": null,
    "relativePerformance": null,
    "note": "Benchmark data fetching not yet implemented"
  }
}
```

### GET /api/portfolios/[id]/analytics

Get portfolio analytics (value, performance, allocation).

**Response:** `200 OK`
```json
{
  "data": {
    "totalValue": 10000,
    "totalInvested": 8500,
    "totalGainLoss": 1500,
    "performance": 17.65,
    "assetCount": 5,
    "transactionCount": 20,
    "assetAllocation": [
      {
        "assetId": "uuid",
        "symbol": "AAPL",
        "type": "STOCK",
        "value": 5000,
        "percentage": 50
      }
    ]
  }
}
```

### GET /api/assets/[id]/performance

Get asset performance metrics.

**Response:** `200 OK`
```json
{
  "data": {
    "assetId": "uuid",
    "symbol": "AAPL",
    "currentValue": 5000,
    "totalInvested": 4500,
    "realizedGainLoss": 200,
    "unrealizedGainLoss": 300,
    "totalGainLoss": 500,
    "performance": 11.11,
    "averageBuyPrice": 150,
    "currentPrice": 150,
    "quantity": 30
  }
}
```

### GET /api/portfolios/[id]/transactions/analytics

Get transaction analytics for a portfolio.

**Response:** `200 OK`
```json
{
  "data": {
    "totalTransactions": 20,
    "buyTransactions": 12,
    "sellTransactions": 8,
    "totalBuyValue": 10000,
    "totalSellValue": 5000,
    "totalRealizedGainLoss": 500,
    "averageTransactionSize": 750,
    "transactionPatterns": {
      "byMonth": [
        {
          "month": "2024-01",
          "buyCount": 5,
          "sellCount": 2,
          "buyValue": 5000,
          "sellValue": 2000
        }
      ]
    }
  }
}
```

---

## Notes

- All endpoints require authentication
- RLS policies automatically filter data by user
- UUIDs must be valid UUID format
- Dates must be ISO 8601 datetime strings
- Financial values use NUMERIC(18,8) precision
- Cascade deletes are handled by database constraints
- SELL transactions automatically reduce asset quantity
- BUY transactions automatically update average buy price
- Historical import supports bulk transaction processing
- Currency support: USD (default), TRY, EUR, GBP, and more
- Cost basis tracking uses FIFO method with fallback to Average Cost

