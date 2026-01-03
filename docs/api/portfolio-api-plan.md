# Portfolio Tracker API Development Plan

## Overview

Portfolio tracker için RESTful API endpoints oluşturacağız. Next.js 15 App Router kullanarak Route Handlers ile API'ları implement edeceğiz.

## API Endpoints Yapısı

### 1. Portfolio Endpoints

#### `GET /api/portfolios`
- **Açıklama**: Kullanıcının tüm portföylerini listeler
- **Response**: Portfolio array
- **RLS**: Otomatik olarak sadece kullanıcının kendi portföylerini döner

#### `POST /api/portfolios`
- **Açıklama**: Yeni portfolio oluşturur
- **Request Body**: `{ name: string }`
- **Response**: Oluşturulan portfolio
- **Validation**: Zod schema ile validate edilir

#### `GET /api/portfolios/[id]`
- **Açıklama**: Belirli bir portfolio detayını getirir
- **Response**: Portfolio + assets + transactions (nested)
- **RLS**: Sadece kullanıcının kendi portföyüne erişebilir

#### `PUT /api/portfolios/[id]`
- **Açıklama**: Portfolio günceller (örn: isim değiştirme)
- **Request Body**: `{ name?: string }`
- **Response**: Güncellenmiş portfolio

#### `DELETE /api/portfolios/[id]`
- **Açıklama**: Portfolio siler (cascade ile assets ve transactions da silinir)
- **Response**: Success message

### 2. Asset Endpoints

#### `GET /api/portfolios/[portfolioId]/assets`
- **Açıklama**: Belirli bir portföydeki tüm asset'leri listeler
- **Response**: Asset array
- **RLS**: Portfolio sahibi kontrolü yapılır

#### `POST /api/portfolios/[portfolioId]/assets`
- **Açıklama**: Yeni asset ekler
- **Request Body**: 
  ```typescript
  {
    symbol: string;
    quantity: number;
    average_buy_price: number;
    type: AssetType;
  }
  ```
- **Validation**: Zod schema ile validate edilir
- **RLS**: Portfolio sahibi kontrolü yapılır

#### `GET /api/assets/[id]`
- **Açıklama**: Belirli bir asset detayını getirir
- **Response**: Asset + transactions (nested)

#### `PUT /api/assets/[id]`
- **Açıklama**: Asset günceller (quantity, price, vb.)
- **Request Body**: 
  ```typescript
  {
    symbol?: string;
    quantity?: number;
    average_buy_price?: number;
    type?: AssetType;
  }
  ```

#### `DELETE /api/assets/[id]`
- **Açıklama**: Asset siler (cascade ile transactions da silinir)

### 3. Transaction Endpoints

#### `GET /api/assets/[assetId]/transactions`
- **Açıklama**: Belirli bir asset'e ait tüm transaction'ları listeler
- **Query Params**: 
  - `?order=date` (asc/desc)
  - `?limit=10`
  - `?offset=0`
- **Response**: Transaction array

#### `POST /api/assets/[assetId]/transactions`
- **Açıklama**: Yeni transaction kaydeder
- **Request Body**:
  ```typescript
  {
    type: TransactionType;
    amount: number;
    price: number;
    date: string; // ISO datetime
    transaction_cost?: number; // defaults to 0
  }
  ```
- **Validation**: Zod schema ile validate edilir
- **Business Logic**: 
  - BUY transaction sonrası average_buy_price güncellenebilir
  - SELL transaction sonrası quantity kontrolü yapılabilir

#### `GET /api/transactions/[id]`
- **Açıklama**: Belirli bir transaction detayını getirir

#### `PUT /api/transactions/[id]`
- **Açıklama**: Transaction günceller

#### `DELETE /api/transactions/[id]`
- **Açıklama**: Transaction siler

### 4. Query & Aggregation Endpoints (Opsiyonel)

#### `GET /api/portfolios/[id]/summary`
- **Açıklama**: Portfolio özet bilgileri (toplam değer, asset sayısı, vb.)
- **Response**:
  ```typescript
  {
    totalValue: number;
    assetCount: number;
    transactionCount: number;
    assets: Asset[];
  }
  ```

#### `GET /api/portfolios/[id]/assets/by-type`
- **Açıklama**: Asset'leri type'a göre gruplar
- **Response**: `{ [type: AssetType]: Asset[] }`

## Implementation Detayları

### Route Handler Yapısı

Next.js App Router'da Route Handlers şu şekilde oluşturulur:

```
app/api/
├── portfolios/
│   ├── route.ts              # GET, POST /api/portfolios
│   └── [id]/
│       ├── route.ts          # GET, PUT, DELETE /api/portfolios/[id]
│       ├── assets/
│       │   └── route.ts      # GET, POST /api/portfolios/[id]/assets
│       └── summary/
│           └── route.ts      # GET /api/portfolios/[id]/summary
├── assets/
│   └── [id]/
│       ├── route.ts          # GET, PUT, DELETE /api/assets/[id]
│       └── transactions/
│           └── route.ts      # GET, POST /api/assets/[id]/transactions
└── transactions/
    └── [id]/
        └── route.ts          # GET, PUT, DELETE /api/transactions/[id]
```

### Örnek Route Handler

```typescript
// app/api/portfolios/route.ts
import { createClient } from '@/lib/supabase/server';
import { CreatePortfolioSchema } from '@/lib/types/portfolio';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const body = await request.json();
  const validatedData = CreatePortfolioSchema.parse(body);

  const { data, error } = await supabase
    .from('portfolios')
    .insert(validatedData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

## Güvenlik

- **Authentication**: Middleware ile kontrol edilir (zaten var)
- **Authorization**: RLS policies otomatik olarak çalışır
- **Validation**: Zod schemas ile input validation
- **Error Handling**: Consistent error responses

## Error Handling

Tüm endpoints standart error formatı kullanır:

```typescript
{
  error: string;
  code?: string;
  details?: any;
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Örnek Kullanım

### Frontend'den API Kullanımı

```typescript
// Client Component
'use client';

import { apiFetch } from '@/lib/utils/api';

export function PortfolioList() {
  const [portfolios, setPortfolios] = useState([]);

  useEffect(() => {
    apiFetch('/api/portfolios')
      .then(data => setPortfolios(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      {portfolios.map(portfolio => (
        <div key={portfolio.id}>{portfolio.name}</div>
      ))}
    </div>
  );
}
```

## İş Mantığı (Business Logic)

### Transaction Sonrası Asset Güncelleme

BUY transaction sonrası:
- Asset quantity artırılır
- Average buy price yeniden hesaplanır: `(old_total + new_total) / (old_quantity + new_quantity)`

SELL transaction sonrası:
- Asset quantity azaltılır
- Average buy price değişmez (FIFO veya average cost method)

Bu logic'i Server Action veya API route içinde implement edebiliriz.

## Test Stratejisi

- **Unit Tests**: Her endpoint için test
- **Integration Tests**: Supabase ile gerçek test
- **E2E Tests**: Complete flow testleri

## Sonraki Adımlar

1. Portfolio endpoints oluştur
2. Asset endpoints oluştur
3. Transaction endpoints oluştur
4. Error handling ve validation ekle
5. Test yaz
6. Documentation güncelle

