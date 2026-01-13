# Implementation Plan: URL Structure Redesign

<!-- FEATURE_DIR: 010-url-structure -->
<!-- FEATURE_ID: 010 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-03 -->

## Specification Reference
- **Spec ID**: SPEC-010
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-03

---

## Architecture Overview

### High-Level Design
URL yapısını semantic ve okunabilir hale getirme. Portfolio seçildiğinde `/p/[slug]` formatına, asset detaylarında `/p/[slug]/[symbol]` formatına geçiş.

### Mevcut → Yeni URL Eşleştirmesi

| Sayfa | Mevcut URL | Yeni URL |
|-------|------------|----------|
| Portfolio Dashboard | `/dashboard` | `/p/borsa-istanbul` |
| Asset Detay | `/assets/uuid-here` | `/p/borsa-istanbul/doas` |
| Asset Edit | `/assets/uuid/edit` | `/p/borsa-istanbul/doas/edit` |
| Transaction New | `/assets/uuid/transactions/new` | `/p/borsa-istanbul/doas/transactions/new` |
| Transaction Edit | `/assets/uuid/transactions/tid/edit` | `/p/borsa-istanbul/doas/transactions/tid/edit` |

### Technical Stack
- **Frontend**: Next.js 14+ App Router, Dynamic Routes
- **State**: Portfolio Context (slug ekleme)
- **Utilities**: Slug generator for Turkish characters
- **Database**: Supabase (slug column optional, can derive from name)

---

## Implementation Phases

### Phase 1: Utilities & Types [Priority: HIGH]
**Timeline**: 15 min
**Dependencies**: None

#### Tasks
1. [x] Create `lib/utils/slug.ts` with Turkish character support
2. [x] Add slug utility functions: `createSlug`, `symbolToUrl`, `urlToSymbol`
3. [x] Update Portfolio type to include `slug` (derived)

#### Deliverables
- [x] Slug utility with comprehensive Turkish character mapping
- [x] Unit tests for slug generation

#### Code

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
```

---

### Phase 2: API Endpoints [Priority: HIGH]
**Timeline**: 30 min
**Dependencies**: Phase 1

#### Tasks
1. [x] Create `GET /api/portfolios/by-slug/[slug]/route.ts`
2. [x] Create `GET /api/portfolios/by-slug/[slug]/assets/[symbol]/route.ts`
3. [x] Add slug matching logic to find portfolio by name

#### Deliverables
- [x] Slug-based portfolio lookup API
- [x] Symbol-based asset lookup within portfolio

#### API Design

```typescript
// GET /api/portfolios/by-slug/[slug]
// Response: Portfolio object or 404

// GET /api/portfolios/by-slug/[slug]/assets/[symbol]
// Response: Asset object with transactions or 404
```

---

### Phase 3: New Route Pages [Priority: HIGH]
**Timeline**: 45 min
**Dependencies**: Phase 2

#### Tasks
1. [x] Create `app/(protected)/p/[slug]/page.tsx` - Portfolio Dashboard
2. [x] Create `app/(protected)/p/[slug]/[symbol]/page.tsx` - Asset Detail
3. [x] Create `app/(protected)/p/[slug]/[symbol]/edit/page.tsx` - Asset Edit
4. [x] Create `app/(protected)/p/[slug]/[symbol]/transactions/new/page.tsx`
5. [x] Create `app/(protected)/p/[slug]/[symbol]/transactions/[transactionId]/edit/page.tsx`

#### Route Structure

```
app/(protected)/p/
├── [slug]/
│   ├── page.tsx                           # Portfolio dashboard
│   └── [symbol]/
│       ├── page.tsx                       # Asset detail
│       ├── edit/
│       │   └── page.tsx                   # Asset edit
│       └── transactions/
│           ├── new/
│           │   └── page.tsx               # New transaction
│           └── [transactionId]/
│               └── edit/
│                   └── page.tsx           # Edit transaction
```

---

### Phase 4: Sidebar & Navigation Update [Priority: HIGH]
**Timeline**: 30 min
**Dependencies**: Phase 3

#### Tasks
1. [x] Update `application-layout-client.tsx` portfolio dropdown
2. [x] On portfolio select: navigate to `/p/{slug}` instead of just setting ID
3. [x] Update sidebar "Dashboard" link to use current portfolio slug
4. [x] Update sidebar "My Assets" to link to portfolio assets

#### Navigation Logic

```typescript
// Portfolio selection:
onClick={() => {
  setActivePortfolioId(portfolio.id);
  const slug = createSlug(portfolio.name);
  router.push(`/p/${slug}`);
}}

// Dashboard link:
href={activePortfolio ? `/p/${createSlug(activePortfolio.name)}` : '/dashboard'}

// Assets link:  
href={activePortfolio ? `/p/${createSlug(activePortfolio.name)}` : '/assets'}
```

---

### Phase 5: Link Updates Throughout App [Priority: MEDIUM]
**Timeline**: 30 min
**Dependencies**: Phase 4

#### Tasks
1. [x] Update `dashboard-content-client.tsx` asset links
2. [x] Update `portfolios/[id]/page.tsx` asset links
3. [x] Update `assets/page.tsx` asset links
4. [x] Update all "Add Transaction", "Edit" button links

#### Link Pattern

```typescript
// Old:
<Link href={`/assets/${asset.id}`}>

// New (inside portfolio context):
<Link href={`/p/${portfolioSlug}/${asset.symbol.toLowerCase()}`}>

// Helper function:
function getAssetUrl(portfolioSlug: string, symbol: string) {
  return `/p/${portfolioSlug}/${symbol.toLowerCase()}`;
}
```

---

### Phase 6: Custom Slug Support [Priority: HIGH]
**Timeline**: 45 min
**Dependencies**: Phase 1

#### Tasks
1. [ ] Database migration: Add `slug` column to `portfolios` table
2. [ ] Create unique index on `(user_id, slug)`
3. [ ] Migrate existing portfolios with auto-generated slugs
4. [ ] Update Portfolio create form with slug field (optional input)
5. [ ] Update Portfolio edit form with editable slug field
6. [ ] Create slug validation API endpoint
7. [ ] Add slug uniqueness check in create/update APIs

#### Database Migration

```sql
-- portfolios tablosuna slug kolonu ekle (user bazında unique)
ALTER TABLE portfolios ADD COLUMN slug TEXT;

-- Unique constraint: user_id + slug kombinasyonu unique olmalı
CREATE UNIQUE INDEX portfolios_user_slug_unique ON portfolios(user_id, slug);

-- Mevcut portfolyolar için otomatik slug oluştur
UPDATE portfolios SET slug = lower(replace(name, ' ', '-'));
```

#### Form Changes

```typescript
// Portfolio create form - slug opsiyonel
interface CreatePortfolioForm {
  name: string;
  slug?: string;  // Kullanıcı girebilir, boşsa otomatik türetilir
  currency: string;
  description?: string;
}

// Portfolio edit form - slug düzenlenebilir
interface EditPortfolioForm {
  name: string;
  slug: string;  // Değiştirilebilir
  currency: string;
  description?: string;
}
```

---

### Phase 7: Backwards Compatibility [Priority: LOW]
**Timeline**: 15 min
**Dependencies**: Phase 6

#### Tasks
1. [ ] Keep old `/assets/[id]` routes functional (optional)
2. [ ] Add redirect from old URLs to new (optional)
3. [ ] Update bookmarks hint in UI (optional)

---

## File Checklist

### New Files
| File | Status | Description |
|------|--------|-------------|
| `lib/utils/slug.ts` | ✅ | Slug utility functions |
| `app/api/portfolios/by-slug/[slug]/route.ts` | ✅ | Portfolio by slug API |
| `app/api/portfolios/by-slug/[slug]/assets/[symbol]/route.ts` | ✅ | Asset by symbol API |
| `app/(protected)/p/[slug]/page.tsx` | ✅ | Portfolio dashboard |
| `app/(protected)/p/[slug]/[symbol]/page.tsx` | ✅ | Asset detail |
| `app/(protected)/p/[slug]/[symbol]/edit/page.tsx` | ✅ | Asset edit |
| `app/(protected)/p/[slug]/[symbol]/transactions/new/page.tsx` | ✅ | New transaction |
| `app/(protected)/p/[slug]/[symbol]/transactions/[transactionId]/edit/page.tsx` | ✅ | Edit transaction |
| `supabase/migrations/XXX_add_slug_column.sql` | ⬜ | Database migration for slug |
| `app/api/portfolios/check-slug/route.ts` | ⬜ | Slug uniqueness check API |

### Modified Files
| File | Status | Changes |
|------|--------|---------|
| `app/(protected)/application-layout-client.tsx` | ✅ | Portfolio navigation |
| `app/(protected)/dashboard/dashboard-content-client.tsx` | ✅ | Asset links |
| `app/(protected)/portfolios/[id]/page.tsx` | ✅ | Asset links |
| `lib/context/portfolio-context.tsx` | ✅ | Add slug helper |
| `components/portfolios/portfolio-form.tsx` | ⬜ | Add slug field to create form |
| `app/(protected)/portfolios/[id]/edit/page.tsx` | ⬜ | Add slug field to edit form |
| `app/api/portfolios/route.ts` | ⬜ | Handle slug in create |
| `app/api/portfolios/[id]/route.ts` | ⬜ | Handle slug in update |

---

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Slug collisions (same name) | Low | Medium | Include portfolio ID as fallback |
| Symbol case sensitivity | Medium | Low | Always lowercase in URL, uppercase for API |
| Broken existing bookmarks | Low | Low | Keep old routes working |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| Supabase API | Low | Already working |
| Next.js dynamic routes | Low | Well-documented |

---

## Success Metrics
- **URL Readability**: `/p/borsa-istanbul/doas` visible in browser
- **Navigation**: Sidebar portfolio select goes to `/p/{slug}`
- **Consistency**: All asset links use new format
- **Backwards Compat**: Old bookmarks still work (optional)

---

## Definition of Done
- [x] All new route pages created
- [x] Portfolio selection navigates to `/p/{slug}`
- [x] Asset links use `/p/{slug}/{symbol}` format
- [x] URL reflects current portfolio and asset
- [x] Page refresh loads correct content
- [x] No broken links in application
