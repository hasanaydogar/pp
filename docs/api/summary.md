# Summary API

API documentation for retrieving aggregated portfolio summaries across all portfolios.

## Base URL

All endpoints are prefixed with `/api`.

## Authentication

All endpoints require authentication. Include authentication cookies in requests.

---

## Endpoints

### GET /api/summary

Get aggregated summary of all portfolios for the authenticated user.

**Query Parameters:**
- `currency`: Display currency for values (default: TRY)

**Response:**
```json
{
  "user_id": "uuid",
  "display_currency": "TRY",
  "total_value": 2500000.00,
  "total_cash": 150000.00,
  "total_assets_value": 2350000.00,
  "portfolio_count": 3,
  "total_asset_count": 25,
  "daily_change": 25000.00,
  "daily_change_percent": 1.02,
  "by_portfolio": [
    {
      "portfolio_id": "uuid",
      "portfolio_name": "Ana Portföy",
      "total_value": 1500000.00,
      "total_cash": 100000.00,
      "total_assets_value": 1400000.00,
      "asset_count": 15,
      "daily_change": 15000.00,
      "daily_change_percent": 1.01,
      "cash_percentage": 6.67
    }
  ],
  "by_asset_type": [
    {
      "type": "STOCK",
      "value": 2000000.00,
      "percentage": 0.80
    },
    {
      "type": "CRYPTO",
      "value": 350000.00,
      "percentage": 0.14
    }
  ],
  "by_sector": [
    {
      "sector": {
        "id": "uuid",
        "name": "technology",
        "display_name": "Teknoloji",
        "color": "#3B82F6"
      },
      "value": 800000.00,
      "percentage": 0.32
    }
  ],
  "all_policy_violations": [
    {
      "portfolio_id": "uuid",
      "portfolio_name": "Ana Portföy",
      "type": "OVER_WEIGHT",
      "severity": "critical",
      "asset_symbol": "AAPL",
      "current_value": 0.18,
      "limit_value": 0.12,
      "recommendation": "AAPL pozisyonunu %12'ye düşürmeyi düşünün"
    }
  ]
}
```

**Status Codes:** 200, 401, 500

---

## Response Fields

### Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string | User UUID |
| `display_currency` | string | Currency used for display values |
| `total_value` | number | Total value of all portfolios |
| `total_cash` | number | Total cash across all portfolios |
| `total_assets_value` | number | Total value of all assets |
| `portfolio_count` | number | Number of portfolios |
| `total_asset_count` | number | Total number of assets |
| `daily_change` | number | Daily change in value |
| `daily_change_percent` | number | Daily change percentage |

### Portfolio Summary (`by_portfolio`)

| Field | Type | Description |
|-------|------|-------------|
| `portfolio_id` | string | Portfolio UUID |
| `portfolio_name` | string | Portfolio name |
| `total_value` | number | Total portfolio value |
| `total_cash` | number | Cash in portfolio |
| `total_assets_value` | number | Value of assets |
| `asset_count` | number | Number of assets |
| `daily_change` | number | Daily change |
| `daily_change_percent` | number | Daily change % |
| `cash_percentage` | number | Cash as % of portfolio |

### Asset Type Distribution (`by_asset_type`)

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Asset type (STOCK, CRYPTO, etc.) |
| `value` | number | Total value of this type |
| `percentage` | number | Percentage of total (0-1) |

### Sector Distribution (`by_sector`)

| Field | Type | Description |
|-------|------|-------------|
| `sector` | object | Sector details |
| `value` | number | Total value in sector |
| `percentage` | number | Percentage of total (0-1) |

### Policy Violations (`all_policy_violations`)

| Field | Type | Description |
|-------|------|-------------|
| `portfolio_id` | string | Portfolio UUID |
| `portfolio_name` | string | Portfolio name |
| `type` | string | Violation type |
| `severity` | string | "warning" or "critical" |
| `asset_symbol` | string | Asset symbol (if applicable) |
| `current_value` | number | Current value |
| `limit_value` | number | Policy limit |
| `recommendation` | string | Suggested action |

---

## Violation Types

| Type | Description |
|------|-------------|
| `OVER_WEIGHT` | Asset weight exceeds maximum |
| `UNDER_CASH` | Cash below minimum target |
| `OVER_CASH` | Cash above maximum target |
| `SECTOR_CONCENTRATION` | Sector weight exceeds limit |

---

## TypeScript Types

```typescript
interface SummaryResponse {
  user_id: string;
  display_currency: string;
  total_value: number;
  total_cash: number;
  total_assets_value: number;
  portfolio_count: number;
  total_asset_count: number;
  daily_change: number;
  daily_change_percent: number;
  by_portfolio: PortfolioSummary[];
  by_asset_type: AssetTypeDistribution[];
  by_sector: SectorDistribution[];
  all_policy_violations: PolicyViolation[];
}

interface PortfolioSummary {
  portfolio_id: string;
  portfolio_name: string;
  total_value: number;
  total_cash: number;
  total_assets_value: number;
  asset_count: number;
  daily_change: number;
  daily_change_percent: number;
  cash_percentage: number;
}

interface PolicyViolation {
  portfolio_id: string;
  portfolio_name: string;
  type: 'OVER_WEIGHT' | 'UNDER_CASH' | 'OVER_CASH' | 'SECTOR_CONCENTRATION';
  severity: 'warning' | 'critical';
  asset_symbol?: string;
  current_value: number;
  limit_value: number;
  recommendation: string;
}
```

## Usage Example

```typescript
// Get summary in USD
const response = await fetch('/api/summary?currency=USD');
const summary = await response.json();

console.log(`Total Value: $${summary.total_value.toLocaleString()}`);
console.log(`Daily Change: ${summary.daily_change_percent.toFixed(2)}%`);

// Check for policy violations
if (summary.all_policy_violations.length > 0) {
  console.log('Policy violations found:');
  summary.all_policy_violations.forEach(v => {
    console.log(`- ${v.portfolio_name}: ${v.type} - ${v.recommendation}`);
  });
}
```

## Empty State Response

When user has no portfolios:

```json
{
  "user_id": "uuid",
  "display_currency": "TRY",
  "total_value": 0,
  "total_cash": 0,
  "total_assets_value": 0,
  "portfolio_count": 0,
  "total_asset_count": 0,
  "daily_change": 0,
  "daily_change_percent": 0,
  "by_portfolio": [],
  "by_asset_type": [],
  "by_sector": [],
  "all_policy_violations": []
}
```
