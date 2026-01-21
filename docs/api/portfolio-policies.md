# Portfolio Policies API

API documentation for managing portfolio investment policies (position limits, cash targets, sector weights).

## Base URL

All endpoints are prefixed with `/api`.

## Authentication

All endpoints require authentication. Include authentication cookies in requests.

---

## Endpoints

### GET /api/portfolios/[id]/policy

Get the policy for a portfolio. Returns default values if no custom policy exists.

**Path Parameters:**
- `id`: Portfolio UUID

**Response (Custom Policy):**
```json
{
  "id": "uuid",
  "portfolio_id": "uuid",
  "max_weight_per_stock": 0.12,
  "core_min_weight": 0.08,
  "core_max_weight": 0.12,
  "satellite_min_weight": 0.01,
  "satellite_max_weight": 0.05,
  "new_position_min_weight": 0.005,
  "new_position_max_weight": 0.02,
  "max_weight_per_sector": 0.25,
  "cash_min_percent": 0.05,
  "cash_max_percent": 0.10,
  "cash_target_percent": 0.07,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-02T00:00:00Z",
  "is_default": false
}
```

**Response (Default Policy):**
```json
{
  "portfolio_id": "uuid",
  "max_weight_per_stock": 0.12,
  "core_min_weight": 0.08,
  "core_max_weight": 0.12,
  "satellite_min_weight": 0.01,
  "satellite_max_weight": 0.05,
  "new_position_min_weight": 0.005,
  "new_position_max_weight": 0.02,
  "max_weight_per_sector": 0.25,
  "cash_min_percent": 0.05,
  "cash_max_percent": 0.10,
  "cash_target_percent": 0.07,
  "is_default": true
}
```

**Status Codes:** 200, 401, 404, 500

---

### PUT /api/portfolios/[id]/policy

Create or update a portfolio policy (upsert).

**Path Parameters:**
- `id`: Portfolio UUID

**Request Body:**
```json
{
  "max_weight_per_stock": 0.15,
  "core_min_weight": 0.10,
  "core_max_weight": 0.15,
  "satellite_min_weight": 0.02,
  "satellite_max_weight": 0.08,
  "new_position_min_weight": 0.005,
  "new_position_max_weight": 0.02,
  "max_weight_per_sector": 0.30,
  "cash_min_percent": 0.05,
  "cash_max_percent": 0.15,
  "cash_target_percent": 0.10
}
```

**Validation:**
- All values must be between 0 and 1 (0% to 100%)
- All fields are optional (partial updates supported)

**Response:**
```json
{
  "id": "uuid",
  "portfolio_id": "uuid",
  "max_weight_per_stock": 0.15,
  "core_min_weight": 0.10,
  "core_max_weight": 0.15,
  "satellite_min_weight": 0.02,
  "satellite_max_weight": 0.08,
  "new_position_min_weight": 0.005,
  "new_position_max_weight": 0.02,
  "max_weight_per_sector": 0.30,
  "cash_min_percent": 0.05,
  "cash_max_percent": 0.15,
  "cash_target_percent": 0.10,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-02T00:00:00Z"
}
```

**Status Codes:** 200, 400, 401, 404, 500

---

### DELETE /api/portfolios/[id]/policy

Delete a custom policy (revert to defaults).

**Path Parameters:**
- `id`: Portfolio UUID

**Response:**
```json
{
  "success": true,
  "message": "Policy deleted, default values will be used"
}
```

**Status Codes:** 200, 401, 404, 500

---

## Policy Fields

| Field | Description | Default | Range |
|-------|-------------|---------|-------|
| `max_weight_per_stock` | Maximum weight for any single stock | 12% | 0-100% |
| `core_min_weight` | Minimum weight for CORE positions | 8% | 0-100% |
| `core_max_weight` | Maximum weight for CORE positions | 12% | 0-100% |
| `satellite_min_weight` | Minimum weight for SATELLITE positions | 1% | 0-100% |
| `satellite_max_weight` | Maximum weight for SATELLITE positions | 5% | 0-100% |
| `new_position_min_weight` | Minimum weight for NEW positions | 0.5% | 0-100% |
| `new_position_max_weight` | Maximum weight for NEW positions | 2% | 0-100% |
| `max_weight_per_sector` | Maximum weight for any sector | 25% | 0-100% |
| `cash_min_percent` | Minimum cash allocation | 5% | 0-100% |
| `cash_max_percent` | Maximum cash allocation | 10% | 0-100% |
| `cash_target_percent` | Target cash allocation | 7% | 0-100% |

---

## Position Categories

Based on policy thresholds, positions are automatically categorized:

- **CORE**: Weight >= `core_min_weight` (default 8%+)
- **SATELLITE**: Weight >= `satellite_min_weight` and < `core_min_weight` (default 1-8%)
- **NEW**: Weight < `satellite_min_weight` (default <1%)

---

## TypeScript Types

```typescript
interface PortfolioPolicy {
  id: string;
  portfolio_id: string;
  max_weight_per_stock: number;
  core_min_weight: number;
  core_max_weight: number;
  satellite_min_weight: number;
  satellite_max_weight: number;
  new_position_min_weight: number;
  new_position_max_weight: number;
  max_weight_per_sector: number;
  cash_min_percent: number;
  cash_max_percent: number;
  cash_target_percent: number;
  created_at: string;
  updated_at: string | null;
}

// Default policy values
const DEFAULT_POLICY = {
  max_weight_per_stock: 0.12,
  core_min_weight: 0.08,
  core_max_weight: 0.12,
  satellite_min_weight: 0.01,
  satellite_max_weight: 0.05,
  new_position_min_weight: 0.005,
  new_position_max_weight: 0.02,
  max_weight_per_sector: 0.25,
  cash_min_percent: 0.05,
  cash_max_percent: 0.10,
  cash_target_percent: 0.07,
};
```

## Usage Example

```typescript
// Update portfolio policy
const response = await fetch('/api/portfolios/portfolio-id/policy', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    max_weight_per_stock: 0.15,
    cash_target_percent: 0.10,
  }),
});

const policy = await response.json();
```
