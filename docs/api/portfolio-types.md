# Portfolio Types API

API documentation for managing portfolio types (e.g., Retirement, Growth, Income).

## Base URL

All endpoints are prefixed with `/api`.

## Authentication

All endpoints require authentication. Include authentication cookies in requests.

---

## Endpoints

### GET /api/portfolio-types

List all portfolio types for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "retirement",
    "display_name": "Emeklilik",
    "icon": "🏦",
    "color": "#10B981",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

**Status Codes:** 200, 401, 500

---

### POST /api/portfolio-types

Create a new portfolio type.

**Request Body:**
```json
{
  "name": "retirement",
  "display_name": "Emeklilik",
  "icon": "🏦",
  "color": "#10B981"
}
```

**Validation:**
- `name`: Required, string, unique per user
- `display_name`: Required, string
- `icon`: Optional, string (emoji)
- `color`: Optional, string (hex color)

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "retirement",
  "display_name": "Emeklilik",
  "icon": "🏦",
  "color": "#10B981",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Status Codes:** 201, 400, 401, 409 (duplicate name), 500

---

### GET /api/portfolio-types/[id]

Get a specific portfolio type.

**Path Parameters:**
- `id`: Portfolio type UUID

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "retirement",
  "display_name": "Emeklilik",
  "icon": "🏦",
  "color": "#10B981",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Status Codes:** 200, 401, 404, 500

---

### PUT /api/portfolio-types/[id]

Update a portfolio type.

**Path Parameters:**
- `id`: Portfolio type UUID

**Request Body:**
```json
{
  "name": "retirement-updated",
  "display_name": "Emeklilik Hesabı",
  "icon": "💰",
  "color": "#3B82F6"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "retirement-updated",
  "display_name": "Emeklilik Hesabı",
  "icon": "💰",
  "color": "#3B82F6",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Status Codes:** 200, 400, 401, 404, 409 (duplicate name), 500

---

### DELETE /api/portfolio-types/[id]

Delete a portfolio type.

**Path Parameters:**
- `id`: Portfolio type UUID

**Response:**
```json
{
  "success": true
}
```

**Status Codes:** 200, 401, 404, 500

---

## TypeScript Types

```typescript
interface PortfolioType {
  id: string;
  user_id: string;
  name: string;
  display_name: string;
  icon?: string | null;
  color?: string | null;
  created_at: string;
}

// Zod Schema
const CreatePortfolioTypeSchema = z.object({
  name: z.string().min(1).max(50),
  display_name: z.string().min(1).max(100),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});
```

## Usage Example

```typescript
// Create a portfolio type
const response = await fetch('/api/portfolio-types', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'growth',
    display_name: 'Büyüme Portföyü',
    icon: '📈',
    color: '#3B82F6',
  }),
});

const portfolioType = await response.json();
```
