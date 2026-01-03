# Portfolio Tracker API Overview

## Ne Yapacağız?

Portfolio tracker uygulaması için **RESTful API endpoints** oluşturacağız. Bu API'lar sayesinde:

1. **Frontend** (React components) ↔️ **Backend** (Supabase database) arasında iletişim kurulacak
2. Kullanıcılar portföylerini yönetebilecek
3. Asset'leri ekleyip güncelleyebilecek
4. Transaction'ları kaydedebilecek

## API Endpoints Listesi

### Portfolio İşlemleri
- ✅ `GET /api/portfolios` - Tüm portföylerimi listele
- ✅ `POST /api/portfolios` - Yeni portfolio oluştur
- ✅ `GET /api/portfolios/[id]` - Portfolio detayını getir
- ✅ `PUT /api/portfolios/[id]` - Portfolio güncelle
- ✅ `DELETE /api/portfolios/[id]` - Portfolio sil

### Asset İşlemleri
- ✅ `GET /api/portfolios/[id]/assets` - Portföydeki asset'leri listele
- ✅ `POST /api/portfolios/[id]/assets` - Yeni asset ekle
- ✅ `GET /api/assets/[id]` - Asset detayını getir
- ✅ `PUT /api/assets/[id]` - Asset güncelle
- ✅ `DELETE /api/assets/[id]` - Asset sil

### Transaction İşlemleri
- ✅ `GET /api/assets/[id]/transactions` - Asset'in transaction'larını listele
- ✅ `POST /api/assets/[id]/transactions` - Yeni transaction kaydet
- ✅ `GET /api/transactions/[id]` - Transaction detayını getir
- ✅ `PUT /api/transactions/[id]` - Transaction güncelle
- ✅ `DELETE /api/transactions/[id]` - Transaction sil

## Örnek Senaryolar

### Senaryo 1: Portfolio Oluşturma ve Asset Ekleme

```typescript
// 1. Portfolio oluştur
POST /api/portfolios
Body: { name: "My Investment Portfolio" }
Response: { id: "uuid", name: "My Investment Portfolio", ... }

// 2. Asset ekle
POST /api/portfolios/[portfolio-id]/assets
Body: {
  symbol: "AAPL",
  quantity: 10,
  average_buy_price: 150.00,
  type: "STOCK"
}
Response: { id: "uuid", symbol: "AAPL", ... }

// 3. Transaction kaydet
POST /api/assets/[asset-id]/transactions
Body: {
  type: "BUY",
  amount: 10,
  price: 150.00,
  date: "2025-11-30T12:00:00Z",
  transaction_cost: 1.50
}
Response: { id: "uuid", type: "BUY", ... }
```

### Senaryo 2: Portfolio Listesi ve Detay

```typescript
// 1. Tüm portföylerimi listele
GET /api/portfolios
Response: [
  { id: "uuid1", name: "Stock Portfolio", ... },
  { id: "uuid2", name: "Crypto Portfolio", ... }
]

// 2. Portfolio detayını getir (assets ve transactions ile)
GET /api/portfolios/[id]
Response: {
  id: "uuid",
  name: "Stock Portfolio",
  assets: [
    {
      id: "asset-uuid",
      symbol: "AAPL",
      quantity: 10,
      transactions: [...]
    }
  ]
}
```

## Teknik Detaylar

### Next.js Route Handlers

Next.js 15 App Router'da API routes şu şekilde oluşturulur:

```typescript
// app/api/portfolios/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // GET logic
  return NextResponse.json({ data: [...] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // POST logic
  return NextResponse.json({ data: {...} }, { status: 201 });
}
```

### Güvenlik

- ✅ **Authentication**: Middleware ile kontrol (zaten var)
- ✅ **Authorization**: RLS policies otomatik çalışır
- ✅ **Validation**: Zod schemas ile input kontrolü
- ✅ **Error Handling**: Standart error formatı

### RLS (Row Level Security)

Supabase RLS sayesinde:
- Kullanıcı sadece kendi portföylerini görebilir
- Başka kullanıcının portföyüne erişemez
- API'da ekstra kontrol gerekmez (Supabase otomatik yapar)

## Frontend'den Kullanım

```typescript
// Client Component
'use client';

import { apiFetch } from '@/lib/utils/api';

// Portfolio listesi
const portfolios = await apiFetch('/api/portfolios');

// Yeni portfolio oluştur
const newPortfolio = await apiFetch('/api/portfolios', {
  method: 'POST',
  body: JSON.stringify({ name: 'My Portfolio' })
});
```

## İş Mantığı (Business Logic)

### Transaction Sonrası Asset Güncelleme

**BUY Transaction:**
- Asset quantity artırılır
- Average buy price yeniden hesaplanır

**SELL Transaction:**
- Asset quantity azaltılır
- Average buy price değişmez

Bu logic'i API route içinde veya ayrı bir service function'da implement edeceğiz.

## Avantajlar

1. **Separation of Concerns**: Frontend ve backend ayrı
2. **Reusability**: API'lar farklı client'lardan kullanılabilir
3. **Testing**: API'ları bağımsız test edebiliriz
4. **Type Safety**: TypeScript ile tip güvenliği
5. **Validation**: Zod ile runtime validation

## Sonraki Adımlar

1. Portfolio endpoints oluştur (GET, POST, PUT, DELETE)
2. Asset endpoints oluştur
3. Transaction endpoints oluştur
4. Error handling ekle
5. Test yaz
6. Frontend'de kullan

Bu API'ları oluşturduktan sonra frontend'de portfolio yönetimi için UI components geliştirebiliriz.

