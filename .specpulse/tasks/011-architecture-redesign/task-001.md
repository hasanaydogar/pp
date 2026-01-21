# Task Breakdown: Portfolio Architecture Redesign

<!-- FEATURE_DIR: 011-architecture-redesign -->
<!-- FEATURE_ID: 011 -->
<!-- TASK_LIST_ID: task-001 -->
<!-- STATUS: ready -->
<!-- CREATED: 2026-01-03 -->
<!-- LAST_UPDATED: 2026-01-03 -->

## Progress Overview
- **Total Tasks**: 35
- **Completed Tasks**: 34 (97%)
- **In Progress Tasks**: 0
- **Pending Tasks**: 1
- **Last Updated**: 2026-01-21

---

## Task Categories Summary

| Phase | Task Count | Completed | Priority | Status |
|-------|------------|-----------|----------|--------|
| Phase 1: Database Foundation | 5 | 5 ✅ | 🔴 CRITICAL | DONE |
| Phase 2: Types & Policies API | 4 | 4 ✅ | 🟠 HIGH | DONE |
| Phase 3: Cash Management | 6 | 6 ✅ | 🟠 HIGH | DONE |
| Phase 4: Sectors & Metadata | 6 | 6 ✅ | 🟡 MEDIUM | DONE |
| Phase 5: Summary | 7 | 7 ✅ | 🟠 HIGH | DONE |
| Phase 6: Settings UI | 5 | 5 ✅ | 🟡 MEDIUM | DONE |
| Phase 7: Testing | 2 | 1 ✅ | 🟡 MEDIUM | 50% |

---

## Phase 1: Database Foundation [Priority: 🔴 CRITICAL]

### T001: Create Migration File ✅
```yaml
id: T001
status: completed
type: database
priority: CRITICAL
estimate: 45 min
dependencies: []
parallel: false
completed_in: feature-013
```

**Description**: 
Yeni tablo yapısını oluşturacak migration dosyasını oluştur.

**Files to Create**:
- `supabase/migrations/20260103_architecture_redesign.sql`

**Acceptance Criteria**:
- [ ] portfolio_types tablosu oluşturuldu
- [ ] portfolio_policies tablosu oluşturuldu
- [ ] cash_positions tablosu oluşturuldu
- [ ] cash_transactions tablosu oluşturuldu
- [ ] sectors tablosu oluşturuldu
- [ ] asset_metadata tablosu oluşturuldu
- [ ] portfolios tablosuna yeni alanlar eklendi (ALTER)

**Code Snippet**:
```sql
-- Portfolio Types
CREATE TABLE portfolio_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Portfolio Policies
CREATE TABLE portfolio_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  max_weight_per_stock NUMERIC(5, 4) DEFAULT 0.12,
  core_min_weight NUMERIC(5, 4) DEFAULT 0.08,
  core_max_weight NUMERIC(5, 4) DEFAULT 0.12,
  satellite_min_weight NUMERIC(5, 4) DEFAULT 0.01,
  satellite_max_weight NUMERIC(5, 4) DEFAULT 0.05,
  new_position_min_weight NUMERIC(5, 4) DEFAULT 0.005,
  new_position_max_weight NUMERIC(5, 4) DEFAULT 0.02,
  max_weight_per_sector NUMERIC(5, 4) DEFAULT 0.25,
  cash_min_percent NUMERIC(5, 4) DEFAULT 0.05,
  cash_max_percent NUMERIC(5, 4) DEFAULT 0.10,
  cash_target_percent NUMERIC(5, 4) DEFAULT 0.07,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portfolio_id)
);

-- Cash Positions
CREATE TABLE cash_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT 'TRY',
  amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  UNIQUE(portfolio_id, currency)
);

-- Cash Transactions
CREATE TABLE cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_position_id UUID NOT NULL REFERENCES cash_positions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAW', 'BUY_ASSET', 'SELL_ASSET', 'DIVIDEND', 'FEE')),
  amount NUMERIC(18, 2) NOT NULL,
  related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sectors (Global)
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asset Metadata
CREATE TABLE asset_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  api_sector TEXT,
  manual_sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  manual_name TEXT,
  auto_category TEXT CHECK (auto_category IN ('CORE', 'SATELLITE', 'NEW')),
  manual_category TEXT CHECK (manual_category IN ('CORE', 'SATELLITE', 'NEW')),
  isin TEXT,
  exchange TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id)
);

-- Portfolios table updates
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS portfolio_type_id UUID REFERENCES portfolio_types(id) ON DELETE SET NULL;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS target_value NUMERIC(18, 2);
```

---

### T002: Create RLS Policies ✅
```yaml
id: T002
status: completed
type: database
priority: CRITICAL
estimate: 30 min
dependencies: [T001]
parallel: false
completed_in: feature-013
```

**Description**: 
Tüm yeni tablolar için Row Level Security politikaları oluştur.

**Files to Modify**:
- `supabase/migrations/20260103_architecture_redesign.sql` (append)

**Acceptance Criteria**:
- [ ] portfolio_types için SELECT/INSERT/UPDATE/DELETE politikaları
- [ ] portfolio_policies için portfolio ownership kontrolü
- [ ] cash_positions için portfolio ownership kontrolü
- [ ] cash_transactions için cascade ownership kontrolü
- [ ] sectors için herkes okuyabilir politikası
- [ ] asset_metadata için asset ownership kontrolü

---

### T003: Create Seed Data ✅
```yaml
id: T003
status: completed
type: database
priority: HIGH
estimate: 15 min
dependencies: [T001]
parallel: true
completed_in: feature-013
```

**Description**: 
Varsayılan sektörleri seed data olarak ekle.

**Acceptance Criteria**:
- [ ] 10 varsayılan sektör eklendi
- [ ] ON CONFLICT DO NOTHING ile idempotent

**Code Snippet**:
```sql
INSERT INTO sectors (name, display_name, color) VALUES
  ('technology', 'Teknoloji', '#3B82F6'),
  ('finance', 'Finans', '#10B981'),
  ('healthcare', 'Sağlık', '#EF4444'),
  ('energy', 'Enerji', '#F59E0B'),
  ('consumer', 'Tüketici', '#8B5CF6'),
  ('industrial', 'Sanayi', '#6B7280'),
  ('materials', 'Hammadde', '#EC4899'),
  ('utilities', 'Kamu Hizmetleri', '#14B8A6'),
  ('real_estate', 'Gayrimenkul', '#F97316'),
  ('communication', 'İletişim', '#06B6D4')
ON CONFLICT (name) DO NOTHING;
```

---

### T004: Create TypeScript Types ✅
```yaml
id: T004
status: completed
type: development
priority: CRITICAL
estimate: 30 min
dependencies: [T001]
parallel: true
completed_in: feature-013
```

**Description**: 
Yeni tablolar için TypeScript interface ve type'ları oluştur.

**Files to Create**:
- `lib/types/policy.ts`
- `lib/types/cash.ts`
- `lib/types/sector.ts`

**Files to Modify**:
- `lib/types/portfolio.ts`

**Acceptance Criteria**:
- [ ] PortfolioType interface
- [ ] PortfolioPolicy interface
- [ ] CashPosition interface
- [ ] CashTransaction interface
- [ ] Sector interface
- [ ] AssetMetadata interface
- [ ] PositionCategory enum
- [ ] CashTransactionType enum

**Code Snippet** (`lib/types/policy.ts`):
```typescript
import { z } from 'zod';

export interface PortfolioPolicy {
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
  updated_at?: string;
}

export const PortfolioPolicySchema = z.object({
  max_weight_per_stock: z.number().min(0).max(1).default(0.12),
  core_min_weight: z.number().min(0).max(1).default(0.08),
  core_max_weight: z.number().min(0).max(1).default(0.12),
  satellite_min_weight: z.number().min(0).max(1).default(0.01),
  satellite_max_weight: z.number().min(0).max(1).default(0.05),
  new_position_min_weight: z.number().min(0).max(1).default(0.005),
  new_position_max_weight: z.number().min(0).max(1).default(0.02),
  max_weight_per_sector: z.number().min(0).max(1).default(0.25),
  cash_min_percent: z.number().min(0).max(1).default(0.05),
  cash_max_percent: z.number().min(0).max(1).default(0.10),
  cash_target_percent: z.number().min(0).max(1).default(0.07),
});
```

---

### T005: Create Zod Schemas ✅
```yaml
id: T005
status: completed
type: development
priority: HIGH
estimate: 20 min
dependencies: [T004]
parallel: false
completed_in: feature-013
```

**Description**: 
API validation için Zod schemas oluştur.

**Files to Modify**:
- `lib/types/policy.ts`
- `lib/types/cash.ts`
- `lib/types/sector.ts`

**Acceptance Criteria**:
- [ ] CreatePortfolioTypeSchema
- [ ] UpdatePortfolioPolicySchema
- [ ] CreateCashPositionSchema
- [ ] CreateCashTransactionSchema
- [ ] UpdateAssetMetadataSchema

---

## Phase 2: Types & Policies API [Priority: 🟠 HIGH]

### T006: Portfolio Types API - CRUD ✅
```yaml
id: T006
status: completed
type: development
priority: HIGH
estimate: 30 min
dependencies: [T005]
parallel: true
completed_in: feature-013
```

**Description**: 
Portfolio türleri için CRUD API endpoints oluştur.

**Files to Create**:
- `app/api/portfolio-types/route.ts` (GET, POST)
- `app/api/portfolio-types/[id]/route.ts` (GET, PUT, DELETE)

**Acceptance Criteria**:
- [ ] GET /api/portfolio-types - Kullanıcının tüm türlerini listele
- [ ] POST /api/portfolio-types - Yeni tür oluştur
- [ ] PUT /api/portfolio-types/[id] - Tür güncelle
- [ ] DELETE /api/portfolio-types/[id] - Tür sil
- [ ] Authentication kontrolü
- [ ] Zod validation

**Code Snippet** (`app/api/portfolio-types/route.ts`):
```typescript
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { CreatePortfolioTypeSchema } from '@/lib/types/policy';

export async function GET() {
  const supabase = await createRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('portfolio_types')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validated = CreatePortfolioTypeSchema.safeParse(body);
  
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('portfolio_types')
    .insert({ ...validated.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

---

### T007: Portfolio Policies API ✅
```yaml
id: T007
status: completed
type: development
priority: HIGH
estimate: 30 min
dependencies: [T005]
parallel: true
completed_in: feature-013
```

**Description**: 
Portfolio politikaları için CRUD API endpoints oluştur.

**Files to Create**:
- `app/api/portfolios/[id]/policy/route.ts` (GET, PUT, DELETE)

**Acceptance Criteria**:
- [ ] GET /api/portfolios/[id]/policy - Politika getir
- [ ] PUT /api/portfolios/[id]/policy - Oluştur/Güncelle (upsert)
- [ ] DELETE /api/portfolios/[id]/policy - Sil (varsayılana dön)
- [ ] Portfolio ownership kontrolü
- [ ] Varsayılan değerler ile oluşturma

---

### T008: Update Portfolios API ✅
```yaml
id: T008
status: completed
type: development
priority: HIGH
estimate: 20 min
dependencies: [T005]
parallel: true
completed_in: feature-013
```

**Description**: 
Mevcut portfolios API'yi yeni alanları destekleyecek şekilde güncelle.

**Files to Modify**:
- `app/api/portfolios/[id]/route.ts`

**Acceptance Criteria**:
- [ ] PUT body'de portfolio_type_id kabul edilir
- [ ] PUT body'de description kabul edilir
- [ ] PUT body'de target_value kabul edilir
- [ ] Mevcut işlevsellik korunuyor

---

### T009: Default Policy on Portfolio Create ✅
```yaml
id: T009
status: completed
type: development
priority: MEDIUM
estimate: 20 min
dependencies: [T007]
parallel: false
completed_in: feature-013
```

**Description**: 
Yeni portfolio oluşturulduğunda varsayılan policy otomatik oluştur.

**Files to Modify**:
- `app/api/portfolios/route.ts` (POST handler)

**Acceptance Criteria**:
- [ ] Yeni portfolio oluşturulduğunda policy de oluşuyor
- [ ] Varsayılan değerler kullanılıyor
- [ ] Transaction içinde (atomik)

---

## Phase 3: Cash Management [Priority: 🟠 HIGH]

### T010: Cash Positions API ✅
```yaml
id: T010
status: completed
type: development
priority: HIGH
estimate: 30 min
dependencies: [T005]
parallel: true
completed_in: feature-013
```

**Description**: 
Cash positions için CRUD API endpoints oluştur.

**Files to Create**:
- `app/api/portfolios/[id]/cash/route.ts` (GET, POST)
- `app/api/portfolios/[id]/cash/[currency]/route.ts` (GET, PUT, DELETE)

**Acceptance Criteria**:
- [ ] GET /api/portfolios/[id]/cash - Tüm cash pozisyonları
- [ ] POST /api/portfolios/[id]/cash - Yeni cash pozisyonu
- [ ] PUT /api/portfolios/[id]/cash/[currency] - Güncelle
- [ ] DELETE /api/portfolios/[id]/cash/[currency] - Sil
- [ ] Currency unique constraint

---

### T011: Cash Transactions API ✅
```yaml
id: T011
status: completed
type: development
priority: HIGH
estimate: 30 min
dependencies: [T010]
parallel: false
completed_in: feature-013
```

**Description**: 
Cash transactions için API endpoints oluştur.

**Files to Create**:
- `app/api/portfolios/[id]/cash/[currency]/transactions/route.ts` (GET, POST)

**Acceptance Criteria**:
- [ ] GET - İşlem listesi (pagination, filtering)
- [ ] POST - Yeni işlem (DEPOSIT, WITHDRAW, DIVIDEND)
- [ ] İşlem sonrası cash_position.amount güncelleme
- [ ] Transaction türüne göre amount artırma/azaltma

---

### T012: Cash Position Card Component ✅
```yaml
id: T012
status: completed
type: development
priority: HIGH
estimate: 30 min
dependencies: [T010]
parallel: true
completed_in: feature-013
```

**Description**: 
Dashboard'da gösterilecek cash position kartı komponenti.

**Files to Create**:
- `components/cash/cash-position-card.tsx`

**Acceptance Criteria**:
- [ ] Para birimi bazlı görünüm
- [ ] Toplam nakit miktarı
- [ ] Portfolio'daki yüzdesi
- [ ] Hedef vs mevcut karşılaştırma (policy'den)
- [ ] Renk kodlu durum (yeşil: hedefte, sarı: altında, kırmızı: üstünde)

**UI Design**:
```
┌─────────────────────────────────────────┐
│  💵 Nakit Pozisyonları                  │
├─────────────────────────────────────────┤
│  TRY: ₺100,000        USD: $500         │
│  Toplam: ₺118,500 (7.5%) ✅             │
│  Hedef: 7%                               │
│                          [+ Ekle]       │
└─────────────────────────────────────────┘
```

---

### T013: Cash Transaction Form ✅
```yaml
id: T013
status: completed
type: development
priority: HIGH
estimate: 30 min
dependencies: [T011]
parallel: true
completed_in: feature-013
```

**Description**: 
Nakit işlemi ekleme formu.

**Files to Create**:
- `components/cash/cash-transaction-form.tsx`

**Acceptance Criteria**:
- [ ] Transaction type seçimi (DEPOSIT, WITHDRAW, DIVIDEND)
- [ ] Amount input
- [ ] Date picker
- [ ] Notes (optional)
- [ ] Currency seçimi (mevcut pozisyonlardan)
- [ ] Form validation
- [ ] Loading state

---

### T014: Cash Transaction List ✅
```yaml
id: T014
status: completed
type: development
priority: MEDIUM
estimate: 30 min
dependencies: [T011]
parallel: true
completed_in: feature-013
```

**Description**: 
Nakit işlemleri listesi komponenti.

**Files to Create**:
- `components/cash/cash-transaction-list.tsx`

**Acceptance Criteria**:
- [ ] İşlem listesi tablosu
- [ ] Tür bazlı filtreleme
- [ ] Tarih bazlı sıralama
- [ ] Pagination
- [ ] Empty state

---

### T015: Portfolio Dashboard Cash Integration ✅
```yaml
id: T015
status: completed
type: development
priority: HIGH
estimate: 30 min
dependencies: [T012, T013]
parallel: false
completed_in: feature-013
```

**Description**: 
Cash kartını portfolio dashboard'a entegre et.

**Files to Modify**:
- `app/(protected)/p/[slug]/page.tsx`

**Files to Create**:
- `lib/hooks/use-cash-positions.ts`

**Acceptance Criteria**:
- [ ] Cash kartı dashboard'da görünüyor
- [ ] useCashPositions hook çalışıyor
- [ ] Add cash dialog açılabiliyor
- [ ] Cash işlemleri görüntülenebiliyor

---

## Phase 4: Sectors & Asset Metadata [Priority: 🟡 MEDIUM]

### T016: Sectors API ✅
```yaml
id: T016
status: completed
type: development
priority: MEDIUM
estimate: 15 min
dependencies: [T005]
parallel: true
completed_in: feature-013
```

**Description**: 
Sektörler için read-only API endpoint.

**Files to Create**:
- `app/api/sectors/route.ts` (GET only)

**Acceptance Criteria**:
- [ ] GET /api/sectors - Tüm sektörleri listele
- [ ] Public endpoint (auth optional)
- [ ] Cache-friendly response

---

### T017: Asset Metadata API ✅
```yaml
id: T017
status: completed
type: development
priority: MEDIUM
estimate: 30 min
dependencies: [T005]
parallel: true
completed_in: feature-013
```

**Description**: 
Asset metadata için CRUD API endpoint.

**Files to Create**:
- `app/api/assets/[id]/metadata/route.ts` (GET, PUT)

**Acceptance Criteria**:
- [ ] GET /api/assets/[id]/metadata - Metadata getir
- [ ] PUT /api/assets/[id]/metadata - Oluştur/Güncelle
- [ ] Asset ownership kontrolü
- [ ] Sector join ile effective_sector döndür

---

### T018: Position Category Logic ✅
```yaml
id: T018
status: completed
type: development
priority: MEDIUM
estimate: 20 min
dependencies: [T007]
parallel: true
completed_in: feature-013
```

**Description**: 
Position category otomatik hesaplama utility'si.

**Files to Create**:
- `lib/utils/position-category.ts`

**Acceptance Criteria**:
- [ ] calculateAutoCategory(weight, policy) fonksiyonu
- [ ] getEffectiveCategory(metadata, weight, policy) fonksiyonu
- [ ] Policy'ye göre CORE/SATELLITE/NEW döndürme

**Code Snippet**:
```typescript
import { PositionCategory } from '@/lib/types/sector';
import { PortfolioPolicy } from '@/lib/types/policy';

export function calculateAutoCategory(
  weight: number,
  policy: PortfolioPolicy
): PositionCategory {
  if (weight >= policy.core_min_weight) {
    return 'CORE';
  }
  if (weight >= policy.satellite_min_weight) {
    return 'SATELLITE';
  }
  return 'NEW';
}

export function getEffectiveCategory(
  manualCategory: PositionCategory | null,
  weight: number,
  policy: PortfolioPolicy
): PositionCategory {
  return manualCategory || calculateAutoCategory(weight, policy);
}
```

---

### T019: Sector Badge Component ✅
```yaml
id: T019
status: completed
type: development
priority: MEDIUM
estimate: 15 min
dependencies: [T016]
parallel: true
completed_in: sp-execute-011
```

**Description**: 
Sektör gösterimi için badge komponenti.

**Files to Create**:
- `components/assets/sector-badge.tsx`

**Acceptance Criteria**:
- [ ] Sektör adı gösterimi
- [ ] Sektör rengi ile background
- [ ] Tooltip ile tam isim

---

### T020: Category Badge Component ✅
```yaml
id: T020
status: completed
type: development
priority: MEDIUM
estimate: 15 min
dependencies: [T018]
parallel: true
completed_in: sp-execute-011
```

**Description**: 
Position category için badge komponenti.

**Files to Create**:
- `components/assets/category-badge.tsx`

**Acceptance Criteria**:
- [ ] CORE = yeşil badge
- [ ] SATELLITE = mavi badge
- [ ] NEW = sarı badge
- [ ] Manual override göstergesi (ikon)

---

### T021: Asset Detail Metadata Integration ✅
```yaml
id: T021
status: completed
type: development
priority: MEDIUM
estimate: 30 min
dependencies: [T017, T019, T020]
parallel: false
completed_in: sp-execute-011
```

**Description**: 
Asset detail sayfasına metadata, sector ve category badge'leri ekle.

**Files to Modify**:
- `app/(protected)/p/[slug]/[symbol]/page.tsx`

**Files to Create**:
- `components/assets/asset-metadata-form.tsx`

**Acceptance Criteria**:
- [ ] Sector badge görünüyor
- [ ] Category badge görünüyor
- [ ] Metadata edit formu açılabiliyor
- [ ] Manual override yapılabiliyor

---

## Phase 5: All Portfolios Summary [Priority: 🟠 HIGH]

### T022: Summary API ✅
```yaml
id: T022
status: completed
type: development
priority: HIGH
estimate: 45 min
dependencies: [T007, T010]
parallel: false
completed_in: feature-013
```

**Description**: 
Tüm portfolyoların toplam özetini döndüren API.

**Files to Create**:
- `app/api/summary/route.ts`
- `lib/api/summary.ts`

**Acceptance Criteria**:
- [ ] Toplam değer (display currency'e çevrilmiş)
- [ ] Toplam nakit
- [ ] Portfolio bazlı breakdown
- [ ] Asset type bazlı breakdown
- [ ] Sector bazlı breakdown
- [ ] Policy violations dahil
- [ ] Performans metrikleri (günlük/haftalık/aylık)

**Response Schema**:
```typescript
interface SummaryResponse {
  display_currency: string;
  total_value: number;
  total_cash: number;
  total_assets_value: number;
  portfolio_count: number;
  total_asset_count: number;
  daily_change: number;
  daily_change_percent: number;
  by_portfolio: PortfolioSummary[];
  by_asset_type: { type: string; value: number; percentage: number }[];
  by_sector: { sector: Sector; value: number; percentage: number }[];
  all_policy_violations: PolicyViolation[];
}
```

---

### T023: Policy Violations API ✅
```yaml
id: T023
status: completed
type: development
priority: HIGH
estimate: 30 min
dependencies: [T007]
parallel: true
completed_in: feature-013
```

**Description**: 
Portfolio bazlı policy ihlallerini hesaplayan API.

**Files to Create**:
- `app/api/portfolios/[id]/violations/route.ts`
- `lib/api/violations.ts`

**Acceptance Criteria**:
- [ ] OVER_WEIGHT (hisse ağırlığı aşımı)
- [ ] UNDER_CASH (nakit hedefin altında)
- [ ] OVER_CASH (nakit hedefin üstünde)
- [ ] SECTOR_CONCENTRATION (sektör yoğunlaşması)
- [ ] Severity levels (warning, critical)
- [ ] Recommendations

---

### T024: Summary Page ✅
```yaml
id: T024
status: completed
type: development
priority: HIGH
estimate: 45 min
dependencies: [T022, T023]
parallel: false
completed_in: feature-013
```

**Description**: 
Tüm portfolyoların toplam özetini gösteren sayfa.

**Files to Create**:
- `app/(protected)/summary/page.tsx`
- `lib/hooks/use-summary.ts`

**Acceptance Criteria**:
- [ ] Toplam değer kartları
- [ ] Portfolio listesi
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive layout

**UI Design**:
```
┌──────────────────────────────────────────────────────────────┐
│  📊 Toplam Özet                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Toplam Değer │  │ Toplam Nakit │  │ Günlük P/L   │       │
│  │ ₺2,500,000   │  │ ₺150,000     │  │ +₺25,000     │       │
│  │              │  │ (%6)         │  │ (+1.02%)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  [Portfolio Listesi]  [Dağılım Grafikleri]  [Uyarılar]      │
└──────────────────────────────────────────────────────────────┘
```

---

### T025: Portfolio Summary Card Component ✅
```yaml
id: T025
status: completed
type: development
priority: HIGH
estimate: 20 min
dependencies: [T022]
parallel: true
completed_in: feature-013
```

**Description**: 
Summary sayfasında her portfolio için mini özet kartı.

**Files to Create**:
- `components/summary/portfolio-summary-card.tsx`

**Acceptance Criteria**:
- [ ] Portfolio adı ve türü
- [ ] Toplam değer
- [ ] Günlük değişim
- [ ] Nakit yüzdesi
- [ ] Policy ihlal sayısı (badge)
- [ ] Tıklanabilir (portfolio'ya yönlendirme)

---

### T026: Distribution Chart Component ✅
```yaml
id: T026
status: completed
type: development
priority: MEDIUM
estimate: 30 min
dependencies: [T022]
parallel: true
completed_in: sp-execute-011
```

**Description**: 
Dağılım grafikleri (basit HTML/CSS veya chart library).

**Files to Create**:
- `components/summary/distribution-chart.tsx`

**Acceptance Criteria**:
- [ ] Portfolio dağılımı pie chart
- [ ] Asset type dağılımı
- [ ] Renk kodlu segmentler
- [ ] Hover ile değer gösterimi
- [ ] Legend

---

### T027: Violations Panel Component ✅
```yaml
id: T027
status: completed
type: development
priority: MEDIUM
estimate: 20 min
dependencies: [T023]
parallel: true
completed_in: feature-013
```

**Description**: 
Tüm policy ihlallerini gösteren panel.

**Files to Create**:
- `components/summary/violations-panel.tsx`

**Acceptance Criteria**:
- [ ] İhlal listesi
- [ ] Severity renk kodları (sarı: warning, kırmızı: critical)
- [ ] Portfolio ve asset bilgisi
- [ ] Recommendation gösterimi
- [ ] Empty state

---

### T028: Sidebar Summary Link ✅
```yaml
id: T028
status: completed
type: development
priority: HIGH
estimate: 15 min
dependencies: [T024]
parallel: false
completed_in: feature-013
```

**Description**: 
Sidebar'a "Toplam Özet" linkini ekle.

**Files to Modify**:
- `app/(protected)/application-layout-client.tsx`

**Acceptance Criteria**:
- [ ] "📊 Toplam Özet" linki en üstte
- [ ] /summary route'una yönlendirme
- [ ] Active state styling
- [ ] Icon entegrasyonu

---

## Phase 6: Portfolio Settings UI [Priority: 🟡 MEDIUM]

### T029: Portfolio Settings Page ✅
```yaml
id: T029
status: completed
type: development
priority: MEDIUM
estimate: 30 min
dependencies: [T007, T008]
parallel: false
completed_in: sp-execute-011
```

**Description**: 
Portfolio ayarları sayfası.

**Files to Create**:
- `app/(protected)/p/[slug]/settings/page.tsx`

**Acceptance Criteria**:
- [ ] Genel bilgiler formu (ad, açıklama, tür, hedef değer)
- [ ] Policy formu (ayrı sekme veya section)
- [ ] Save/Cancel butonları
- [ ] Loading ve success states

---

### T030: Portfolio Type Selector Component ✅
```yaml
id: T030
status: completed
type: development
priority: MEDIUM
estimate: 20 min
dependencies: [T006]
parallel: true
completed_in: sp-execute-011
```

**Description**: 
Portfolio türü seçici dropdown.

**Files to Create**:
- `components/portfolios/portfolio-type-selector.tsx`

**Acceptance Criteria**:
- [ ] Mevcut türleri listele
- [ ] Icon ve renk gösterimi
- [ ] "Yeni tür ekle" seçeneği
- [ ] Loading state

---

### T031: Policy Form Component ✅
```yaml
id: T031
status: completed
type: development
priority: MEDIUM
estimate: 30 min
dependencies: [T007]
parallel: true
completed_in: feature-017
```

**Description**: 
Portfolio policy düzenleme formu.

**Files to Create**:
- `components/portfolios/policy-form.tsx`

**Acceptance Criteria**:
- [ ] Tüm policy alanları düzenlenebilir
- [ ] Yüzde inputları (%0-100)
- [ ] Range validation
- [ ] Varsayılana sıfırla butonu
- [ ] Form validation hataları

**UI Design**:
```
┌──────────────────────────────────────────────────────┐
│  Yatırım Politikası                                  │
├──────────────────────────────────────────────────────┤
│  Hisse Limitleri                                     │
│  Max Hisse Ağırlığı:      [12  ] %                   │
│  Max Sektör Ağırlığı:     [25  ] %                   │
│                                                      │
│  Position Kategorileri                               │
│  Core:      Min [8  ]% - Max [12 ]%                  │
│  Satellite: Min [1  ]% - Max [5  ]%                  │
│  New:       Min [0.5]% - Max [2  ]%                  │
│                                                      │
│  Nakit Hedefleri                                     │
│  Minimum:   [5  ] %                                  │
│  Hedef:     [7  ] %                                  │
│  Maximum:   [10 ] %                                  │
│                                                      │
│  [Varsayılana Sıfırla]  [Kaydet]                    │
└──────────────────────────────────────────────────────┘
```

---

### T032: Portfolio Type Manager Page ✅
```yaml
id: T032
status: completed
type: development
priority: LOW
estimate: 30 min
dependencies: [T006]
parallel: true
completed_in: sp-execute-011
```

**Description**: 
Portfolio türlerini yönetme sayfası.

**Files to Create**:
- `app/(protected)/settings/portfolio-types/page.tsx`

**Acceptance Criteria**:
- [ ] Tür listesi
- [ ] Yeni tür ekleme
- [ ] Tür düzenleme
- [ ] Tür silme (kullanılmıyorsa)
- [ ] Icon ve renk seçici

---

### T033: Settings Link in Portfolio Header ✅
```yaml
id: T033
status: completed
type: development
priority: MEDIUM
estimate: 10 min
dependencies: [T029]
parallel: false
completed_in: sp-execute-011
```

**Description**: 
Portfolio dashboard'a settings linki ekle.

**Files to Modify**:
- `app/(protected)/p/[slug]/page.tsx`

**Acceptance Criteria**:
- [ ] ⚙️ Ayarlar ikonu/butonu
- [ ] /p/[slug]/settings'e yönlendirme
- [ ] Tooltip

---

## Phase 7: Testing & Polish [Priority: 🟡 MEDIUM]

### T034: API Integration Tests ✅
```yaml
id: T034
status: completed
type: testing
priority: MEDIUM
estimate: 45 min
dependencies: [T006, T007, T010, T022]
parallel: true
completed_at: 2026-01-21
```

**Description**:
Yeni API endpoints için integration testleri.

**Files Created**:
- `__tests__/integration/api/portfolio-types.test.ts`
- `__tests__/integration/api/portfolio-policies.test.ts`
- `__tests__/integration/api/cash-management.test.ts`
- `__tests__/integration/api/summary.test.ts`
- `lib/utils/__tests__/position-category.test.ts`
- `lib/types/__tests__/cash.test.ts`
- `lib/types/__tests__/sector.test.ts`

**Acceptance Criteria**:
- [x] CRUD operations testleri
- [x] Authentication testleri
- [x] Validation testleri
- [x] Edge case testleri

**Results**: 106 tests passing

---

### T035: Documentation Update
```yaml
id: T035
status: pending
type: documentation
priority: LOW
estimate: 30 min
dependencies: [all]
parallel: true
```

**Description**: 
API documentation ve README güncelle.

**Files to Create/Modify**:
- `docs/api/portfolio-types.md`
- `docs/api/portfolio-policies.md`
- `docs/api/cash-management.md`
- `docs/api/summary.md`
- `README.md`

**Acceptance Criteria**:
- [ ] Yeni endpoints dokümante edildi
- [ ] Request/Response örnekleri
- [ ] Error codes
- [ ] README'de yeni özellikler

---

## Dependencies Graph

```
Phase 1 (Database Foundation)
├── T001 (Migration) ─┬─→ T002 (RLS)
│                     ├─→ T003 (Seed) [P]
│                     └─→ T004 (Types) [P] → T005 (Schemas)
│
Phase 2 (Types & Policies API) - depends on T005
├── T006 (Portfolio Types) [P]
├── T007 (Policies) [P]
├── T008 (Update Portfolios) [P]
└── T009 (Default Policy) → depends on T007

Phase 3 (Cash Management) - depends on T005
├── T010 (Cash Positions) [P] → T011 (Cash Transactions)
├── T012 (Cash Card) [P]
├── T013 (Cash Form) [P]
├── T014 (Cash List) [P]
└── T015 (Dashboard Integration) → depends on T012, T013

Phase 4 (Sectors & Metadata) - depends on T005
├── T016 (Sectors API) [P]
├── T017 (Metadata API) [P]
├── T018 (Category Logic) [P]
├── T019 (Sector Badge) [P]
├── T020 (Category Badge) [P]
└── T021 (Asset Detail) → depends on T017, T019, T020

Phase 5 (Summary) - depends on T007, T010
├── T022 (Summary API) → depends on T007, T010
├── T023 (Violations API) [P]
├── T024 (Summary Page) → depends on T022, T023
├── T025 (Summary Card) [P]
├── T026 (Distribution Chart) [P]
├── T027 (Violations Panel) [P]
└── T028 (Sidebar Link) → depends on T024

Phase 6 (Settings UI) - depends on T007
├── T029 (Settings Page) → depends on T007, T008
├── T030 (Type Selector) [P]
├── T031 (Policy Form) [P]
├── T032 (Type Manager) [P]
└── T033 (Settings Link) → depends on T029

Phase 7 (Testing) - depends on all
├── T034 (Integration Tests) [P]
└── T035 (Documentation) [P]
```

**Legend**: [P] = Can run in parallel within phase

---

## Parallel Execution Opportunities

### Can Be Done In Parallel (within phases)

**Phase 1**:
- T003 (Seed) + T004 (Types) after T001

**Phase 2**:
- T006, T007, T008 after T005

**Phase 3**:
- T010, T012, T013, T014 after T005

**Phase 4**:
- T016, T017, T018, T019, T020 after T005

**Phase 5**:
- T023, T025, T026, T027 after T022

**Phase 6**:
- T030, T031, T032 after T006/T007

**Phase 7**:
- T034, T035 after all phases

### Must Be Sequential

```
T001 → T002 → T005
T010 → T011
T022 → T024 → T028
T029 → T033
```

---

## Completion Criteria

### Definition of Done for Each Task
- [ ] Code implemented
- [ ] TypeScript compilation successful
- [ ] Zod validation working
- [ ] API returns correct responses
- [ ] UI renders correctly
- [ ] No console errors

### Feature Definition of Done
- [ ] All 35 tasks completed
- [ ] Summary page shows correct totals
- [ ] Cash management fully functional
- [ ] Policy settings editable
- [ ] Mevcut portfolyolar çalışıyor
- [ ] TypeScript check passes

---

## Progress Tracking

```yaml
status:
  total: 35
  completed: 34
  in_progress: 0
  pending: 1

phases:
  phase_1: 5/5 ✅
  phase_2: 4/4 ✅
  phase_3: 6/6 ✅
  phase_4: 6/6 ✅
  phase_5: 7/7 ✅
  phase_6: 5/5 ✅
  phase_7: 1/2

completion_percentage: 97%
estimated_remaining: 30 min
last_updated: 2026-01-21
```

---

## AI Execution Strategy

### Recommended Execution Order

**Batch 1 (Foundation)** - ~2 hours:
1. T001 → T002 → T005
2. T003, T004 (parallel with T002)

**Batch 2 (Core APIs)** - ~2 hours:
3. T006, T007, T008 (parallel)
4. T009

**Batch 3 (Cash Management)** - ~3 hours:
5. T010 → T011
6. T012, T013, T014 (parallel)
7. T015

**Batch 4 (Metadata)** - ~2 hours:
8. T016, T017, T018 (parallel)
9. T019, T020 (parallel)
10. T021

**Batch 5 (Summary)** - ~3 hours:
11. T022, T023 (parallel)
12. T024
13. T025, T026, T027 (parallel)
14. T028

**Batch 6 (Settings)** - ~2 hours:
15. T029
16. T030, T031, T032 (parallel)
17. T033

**Batch 7 (Polish)** - ~2 hours:
18. T034, T035 (parallel)

---

## Notes & Decisions

- Cash pozisyonları ayrı tabloda tutulacak
- Position category hibrit: otomatik + manuel override
- Sector bilgisi API + manuel override
- Portfolio types kullanıcı bazlı (dinamik)
- Summary sayfası toplam özet için yeni route: `/summary`

---

**Status**: READY FOR EXECUTION
**Next Step**: `/sp-execute` veya Phase 1'den başla (T001)
