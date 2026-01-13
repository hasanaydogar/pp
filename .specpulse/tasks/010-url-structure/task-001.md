# Task Breakdown: URL Structure Redesign

<!-- FEATURE_DIR: 010-url-structure -->
<!-- FEATURE_ID: 010 -->
<!-- TASK_LIST_ID: 001 -->
<!-- STATUS: completed -->
<!-- CREATED: 2026-01-03 -->
<!-- LAST_UPDATED: 2026-01-03 -->

## Progress Overview
- **Total Tasks**: 17
- **Completed Tasks**: 17 (100%)
- **In Progress Tasks**: 0
- **Blocked Tasks**: 0
- **Pending Tasks**: 0

---

## Task List

### Phase 1: Utilities [Priority: HIGH]

#### T001: Create Slug Utility
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 15 min
- **Dependencies**: None
- **Parallel**: [P] Yes

**Description**:
Türkçe karakter desteği olan slug utility fonksiyonları oluştur.

**Files to Create**:
- `lib/utils/slug.ts`

**Implementation**:
```typescript
// lib/utils/slug.ts
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/Ş/g, 's')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function symbolToUrl(symbol: string): string {
  return symbol.toLowerCase();
}

export function urlToSymbol(url: string): string {
  return url.toUpperCase();
}

export function getPortfolioSlug(portfolio: { name: string }): string {
  return createSlug(portfolio.name);
}

export function getAssetUrl(portfolioSlug: string, symbol: string): string {
  return `/p/${portfolioSlug}/${symbol.toLowerCase()}`;
}
```

**Acceptance Criteria**:
- [ ] `createSlug("Borsa İstanbul")` → `"borsa-istanbul"`
- [ ] `createSlug("ABD Borsaları")` → `"abd-borsalari"`
- [ ] `symbolToUrl("DOAS")` → `"doas"`
- [ ] `urlToSymbol("doas")` → `"DOAS"`

---

### Phase 2: API Endpoints [Priority: HIGH]

#### T002: Portfolio by Slug API
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 20 min
- **Dependencies**: T001
- **Parallel**: [P] Yes (with T003)

**Description**:
Slug ile portfolio lookup yapan API endpoint oluştur.

**Files to Create**:
- `app/api/portfolios/by-slug/[slug]/route.ts`

**Implementation**:
```typescript
// GET /api/portfolios/by-slug/[slug]
// 1. Get all portfolios for user
// 2. Find portfolio where createSlug(name) === slug
// 3. Return portfolio or 404
```

**Acceptance Criteria**:
- [ ] `GET /api/portfolios/by-slug/borsa-istanbul` → Portfolio objesi
- [ ] `GET /api/portfolios/by-slug/invalid` → 404 error

---

#### T003: Asset by Symbol API
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 20 min
- **Dependencies**: T002
- **Parallel**: [P] No

**Description**:
Portfolio slug + symbol ile asset lookup yapan API endpoint.

**Files to Create**:
- `app/api/portfolios/by-slug/[slug]/assets/[symbol]/route.ts`

**Implementation**:
```typescript
// GET /api/portfolios/by-slug/[slug]/assets/[symbol]
// 1. Find portfolio by slug
// 2. Find asset where symbol.toUpperCase() === urlSymbol
// 3. Return asset with transactions or 404
```

**Acceptance Criteria**:
- [ ] `GET /api/.../borsa-istanbul/assets/doas` → DOAS asset
- [ ] `GET /api/.../borsa-istanbul/assets/invalid` → 404

---

### Phase 3: Route Pages [Priority: HIGH]

#### T004: Portfolio Dashboard Page
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 30 min
- **Dependencies**: T002
- **Parallel**: [P] Yes (with T005-T007)

**Description**:
`/p/[slug]` route'u için portfolio dashboard sayfası.

**Files to Create**:
- `app/(protected)/p/[slug]/page.tsx`

**Logic**:
1. URL'den slug al
2. API'den portfolio bul
3. Portfolio context'e set et
4. Dashboard içeriğini göster (mevcut dashboard-content-client'ı kullan)

**Acceptance Criteria**:
- [ ] `/p/borsa-istanbul` → Borsa İstanbul portfolio dashboard
- [ ] Invalid slug → 404 sayfası

---

#### T005: Asset Detail Page
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 30 min
- **Dependencies**: T003
- **Parallel**: [P] Yes (with T004)

**Description**:
`/p/[slug]/[symbol]` route'u için asset detay sayfası.

**Files to Create**:
- `app/(protected)/p/[slug]/[symbol]/page.tsx`

**Logic**:
1. URL'den slug ve symbol al
2. API'den asset bul
3. Mevcut asset detail sayfasındaki içeriği render et
4. Link'leri yeni URL formatına güncelle

**Acceptance Criteria**:
- [ ] `/p/borsa-istanbul/doas` → DOAS detay sayfası
- [ ] Sayfa yenileme → Aynı içerik
- [ ] Chart, transactions doğru yüklenmeli

---

#### T006: Asset Edit Page
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 15 min
- **Dependencies**: T005
- **Parallel**: [P] No

**Description**:
`/p/[slug]/[symbol]/edit` route'u.

**Files to Create**:
- `app/(protected)/p/[slug]/[symbol]/edit/page.tsx`

**Acceptance Criteria**:
- [ ] `/p/borsa-istanbul/doas/edit` → Edit sayfası
- [ ] Form submit sonrası doğru URL'e redirect

---

#### T007: Transaction Pages
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 20 min
- **Dependencies**: T005
- **Parallel**: [P] No

**Description**:
Transaction new ve edit sayfaları.

**Files to Create**:
- `app/(protected)/p/[slug]/[symbol]/transactions/new/page.tsx`
- `app/(protected)/p/[slug]/[symbol]/transactions/[transactionId]/edit/page.tsx`

**Acceptance Criteria**:
- [ ] `/p/borsa-istanbul/doas/transactions/new` çalışmalı
- [ ] Transaction edit çalışmalı

---

### Phase 4: Navigation [Priority: HIGH]

#### T008: Sidebar Navigation Update
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 20 min
- **Dependencies**: T004
- **Parallel**: [P] No

**Description**:
Sidebar'daki portfolio seçimi ve navigation linklerini güncelle.

**Files to Modify**:
- `app/(protected)/application-layout-client.tsx`

**Changes**:
1. Portfolio seçildiğinde `/p/{slug}` URL'ine git
2. Dashboard linki → `/p/{slug}` (aktif portfolio varsa)
3. My Assets linki → `/p/{slug}` (aktif portfolio varsa)
4. Import `createSlug` from slug utils

**Implementation**:
```typescript
// Portfolio dropdown onClick:
onClick={() => {
  setActivePortfolioId(portfolio.id);
  const slug = createSlug(portfolio.name);
  router.push(`/p/${slug}`);
}}

// Dashboard sidebar item:
<SidebarItem 
  href={activePortfolio ? `/p/${createSlug(activePortfolio.name)}` : '/dashboard'}
  current={...}
>
```

**Acceptance Criteria**:
- [ ] Portföy seçilince `/p/{slug}` URL'ine gitmeli
- [ ] Browser URL'i güncellenmeli
- [ ] Sayfa yenilenince doğru içerik gelmeli

---

### Phase 5: Link Updates [Priority: MEDIUM]

#### T009: Update Asset Links
- **Status**: [x] Completed
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 25 min
- **Dependencies**: T008
- **Parallel**: [P] No

**Description**:
Tüm asset linklerini yeni URL formatına güncelle.

**Files to Modify**:
- `app/(protected)/dashboard/dashboard-content-client.tsx`
- `app/(protected)/portfolios/[id]/page.tsx`
- `app/(protected)/assets/page.tsx`

**Changes**:
```typescript
// Old:
<Link href={`/assets/${asset.id}`}>

// New:
<Link href={`/p/${portfolioSlug}/${asset.symbol.toLowerCase()}`}>
```

**Acceptance Criteria**:
- [ ] Dashboard'daki asset linkler yeni URL kullanmalı
- [ ] Portfolios sayfasındaki linkler çalışmalı
- [ ] Assets listesindeki linkler çalışmalı

---

### Phase 6: Final [Priority: LOW]

#### T010: Testing & Verification
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: LOW
- **Estimate**: 15 min
- **Dependencies**: T009
- **Parallel**: [P] No

**Description**:
Tüm URL'leri test et ve kırık link olmadığını doğrula.

**Test Scenarios**:
1. Portfolio seç → URL `/p/{slug}` olmalı
2. Asset tıkla → URL `/p/{slug}/{symbol}` olmalı
3. Sayfa yenile → İçerik korunmalı
4. Transaction ekle → Doğru URL'e git
5. Transaction düzenle → Doğru URL'e git
6. Back butonu → Doğru sayfa

**Acceptance Criteria**:
- [ ] Tüm linkler çalışır durumda
- [ ] Console'da hata yok
- [ ] TypeScript hata yok

---

### Phase 7: Custom Slug Support [Priority: HIGH]

#### T011: Database Migration for Slug Column
- **Status**: [x] Completed
- **Type**: database
- **Priority**: HIGH
- **Estimate**: 15 min
- **Dependencies**: None
- **Parallel**: [P] Yes

**Description**:
portfolios tablosuna slug kolonu ekle ve mevcut veriler için migration yap.

**Files to Create**:
- `supabase/migrations/20260113_add_slug_column.sql`

**Implementation**:
```sql
-- portfolios tablosuna slug kolonu ekle
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS slug TEXT;

-- Unique constraint: user_id + slug kombinasyonu unique olmalı
CREATE UNIQUE INDEX IF NOT EXISTS portfolios_user_slug_unique
ON portfolios(user_id, slug);

-- Mevcut portfolyolar için Turkish-aware slug oluştur
-- Bu SQL'de Türkçe karakter dönüşümü yapılmalı
UPDATE portfolios
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(name, 'ş', 's', 'gi'),
          'ğ', 'g', 'gi'),
        'ü', 'u', 'gi'),
      'ö', 'o', 'gi'),
    'ç', 'c', 'gi'),
  'ı', 'i', 'gi')
)
WHERE slug IS NULL;

-- Özel karakterleri tire ile değiştir
UPDATE portfolios
SET slug = regexp_replace(slug, '[^a-z0-9]+', '-', 'g')
WHERE slug IS NOT NULL;

-- Baştaki ve sondaki tireleri kaldır
UPDATE portfolios
SET slug = regexp_replace(regexp_replace(slug, '^-+', ''), '-+$', '')
WHERE slug IS NOT NULL;
```

**Acceptance Criteria**:
- [ ] `slug` kolonu eklendi
- [ ] Unique index oluşturuldu
- [ ] Mevcut portfolyolar için slug generate edildi

---

#### T012: Slug Check API Endpoint
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 15 min
- **Dependencies**: T011
- **Parallel**: [P] Yes

**Description**:
Slug benzersizlik kontrolü için API endpoint.

**Files to Create**:
- `app/api/portfolios/check-slug/route.ts`

**Implementation**:
```typescript
// GET /api/portfolios/check-slug?slug=my-portfolio&exclude=portfolio-id
// Response: { available: boolean, suggestion?: string }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const excludeId = searchParams.get('exclude'); // Edit modunda mevcut portfolio'yu hariç tut

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  // Check if slug exists for this user
  const existing = await supabase
    .from('portfolios')
    .select('id')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .neq('id', excludeId || '')
    .single();

  return NextResponse.json({
    available: !existing.data,
    suggestion: existing.data ? `${slug}-${Date.now().toString(36).slice(-4)}` : undefined
  });
}
```

**Acceptance Criteria**:
- [ ] `GET /api/portfolios/check-slug?slug=test` → `{ available: true }`
- [ ] Mevcut slug için → `{ available: false, suggestion: "test-abc1" }`

---

#### T013: Update Portfolio Types
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 10 min
- **Dependencies**: T011
- **Parallel**: [P] Yes

**Description**:
Portfolio tiplerini slug alanı ile güncelle.

**Files to Modify**:
- `lib/types/portfolio.ts`

**Changes**:
```typescript
// Portfolio interface'e ekle:
export interface Portfolio {
  id: string;
  name: string;
  slug: string;  // YENİ - veritabanından geliyor
  currency: string;
  description?: string;
  // ...
}

// CreatePortfolioInput'a ekle:
export interface CreatePortfolioInput {
  name: string;
  slug?: string;  // YENİ - opsiyonel, verilmezse otomatik türetilir
  currency: string;
  description?: string;
}

// UpdatePortfolioInput'a ekle:
export interface UpdatePortfolioInput {
  name?: string;
  slug?: string;  // YENİ - düzenlenebilir
  currency?: string;
  description?: string;
}
```

**Acceptance Criteria**:
- [ ] Portfolio tipinde `slug` alanı var
- [ ] Create/Update input'larında slug opsiyonel

---

#### T014: Update Portfolio Create API
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 15 min
- **Dependencies**: T012, T013
- **Parallel**: [P] No

**Description**:
Portfolio oluşturma API'sini slug desteği ile güncelle.

**Files to Modify**:
- `app/api/portfolios/route.ts`

**Changes**:
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const { name, slug: customSlug, currency, description } = body;

  // Slug: custom verilmişse kullan, yoksa isimden türet
  let slug = customSlug || createSlug(name);

  // Benzersizlik kontrolü
  const existing = await supabase
    .from('portfolios')
    .select('id')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .single();

  if (existing.data) {
    // Otomatik suffix ekle
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  // Portfolio oluştur
  const { data, error } = await supabase
    .from('portfolios')
    .insert({ name, slug, currency, description, user_id: user.id })
    .select()
    .single();

  return NextResponse.json(data);
}
```

**Acceptance Criteria**:
- [ ] Custom slug ile portfolio oluşturulabiliyor
- [ ] Slug verilmezse otomatik türetiliyor
- [ ] Çakışma durumunda suffix ekleniyor

---

#### T015: Update Portfolio Update API
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 15 min
- **Dependencies**: T014
- **Parallel**: [P] No

**Description**:
Portfolio güncelleme API'sini slug düzenleme desteği ile güncelle.

**Files to Modify**:
- `app/api/portfolios/[id]/route.ts`

**Changes**:
```typescript
export async function PUT(request: Request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { name, slug, currency, description } = body;

  // Slug değiştiyse benzersizlik kontrolü
  if (slug) {
    const existing = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .neq('id', id)  // Kendisi hariç
      .single();

    if (existing.data) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanımda' },
        { status: 409 }
      );
    }
  }

  // Güncelle
  const { data, error } = await supabase
    .from('portfolios')
    .update({ name, slug, currency, description })
    .eq('id', id)
    .select()
    .single();

  return NextResponse.json(data);
}
```

**Acceptance Criteria**:
- [ ] Slug düzenlenebiliyor
- [ ] Çakışma durumunda hata dönüyor
- [ ] Eski slug kullanılabilir kalıyor (başka portfolyoya)

---

#### T016: Add Slug Field to Portfolio Forms
- **Status**: [x] Completed
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 25 min
- **Dependencies**: T014, T015
- **Parallel**: [P] No

**Description**:
Portfolio oluşturma ve düzenleme formlarına slug alanı ekle.

**Files to Modify**:
- `components/portfolios/portfolio-form.tsx`
- `app/(protected)/portfolios/new/page.tsx`
- `app/(protected)/portfolios/[id]/edit/page.tsx`

**UI Design**:
```
Portfolio Adı: [Borsa İstanbul          ]
URL Kısaltması: [bist                    ] (opsiyonel)
                ↳ Boş bırakılırsa: borsa-istanbul

Önizleme URL: portfoy.app/p/bist
```

**Implementation**:
```typescript
// portfolio-form.tsx'e slug alanı ekle
<div className="space-y-2">
  <Label htmlFor="slug">URL Kısaltması (opsiyonel)</Label>
  <div className="flex items-center gap-2">
    <span className="text-zinc-500">/p/</span>
    <Input
      id="slug"
      value={slug}
      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
      placeholder={createSlug(name) || 'my-portfolio'}
    />
  </div>
  <p className="text-xs text-zinc-500">
    Boş bırakılırsa portfolio adından otomatik oluşturulur
  </p>
</div>

// Slug preview
<div className="rounded bg-zinc-100 p-2 text-sm">
  <span className="text-zinc-500">Önizleme: </span>
  <code>/p/{slug || createSlug(name) || 'slug'}</code>
</div>
```

**Acceptance Criteria**:
- [ ] Slug alanı formda görünüyor
- [ ] Sadece geçerli karakterler kabul ediliyor (a-z, 0-9, -)
- [ ] Önizleme URL gösteriliyor
- [ ] Boş bırakılırsa placeholder doğru

---

#### T017: Final Testing for Custom Slug
- **Status**: [x] Completed
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 15 min
- **Dependencies**: T016
- **Parallel**: [P] No

**Description**:
Custom slug özelliğini end-to-end test et.

**Test Scenarios**:
1. Yeni portfolio - custom slug ile oluştur → URL doğru
2. Yeni portfolio - slug boş bırak → Otomatik slug
3. Portfolio düzenle - slug değiştir → Yeni URL çalışır
4. Aynı slug ile ikinci portfolio → Hata mesajı
5. TypeScript check → Hata yok
6. Build → Başarılı

**Acceptance Criteria**:
- [ ] Tüm senaryolar başarılı
- [ ] `npx tsc --noEmit` hata yok
- [ ] `npm run build` başarılı

---

## Dependencies Graph

```
T001 (Slug Utility) ────────────────────┐
  ↓                                     ↓
T002 (Portfolio API) ──────┐      T011 (DB Migration)
  ↓                        │         ↓
T003 (Asset API)           │      T012 (Check Slug API)
  ↓                        ↓         ↓
T004 (Dashboard Page) ← T005      T013 (Update Types)
  ↓                        ↓         ↓
T008 (Sidebar)         T006      T014 (Create API + slug)
  ↓                        ↓         ↓
T009 (Link Updates)    T007      T015 (Update API + slug)
  ↓                                  ↓
T010 (Testing)               T016 (Form slug field)
                                     ↓
                             T017 (Custom Slug Testing)
```

## Parallel Execution

### Can Run in Parallel
- T001 (only task in Phase 1)
- T004, T005, T006, T007 (all route pages)

### Must Be Sequential
- T001 → T002 → T003 (API depends on slug utility)
- T008 → T009 → T010 (navigation changes)

---

## Estimated Total Time

| Phase | Tasks | Time | Status |
|-------|-------|------|--------|
| Phase 1 | T001 | 15 min | ✅ Done |
| Phase 2 | T002, T003 | 40 min | ✅ Done |
| Phase 3 | T004-T007 | 95 min | ✅ Done |
| Phase 4 | T008 | 20 min | ✅ Done |
| Phase 5 | T009 | 25 min | ✅ Done |
| Phase 6 | T010 | 15 min | ✅ Done |
| Phase 7 | T011-T017 | 110 min | ✅ Done |
| **Total** | **17 tasks** | **~5.5 hours** | **100% Complete** |

---

**Legend:**
- [S] = Small (< 15 min), [M] = Medium (15-30 min), [L] = Large (> 30 min)
- [P] = Can be done in parallel
- Status: [ ] Pending, [>] In Progress, [x] Completed, [!] Blocked
