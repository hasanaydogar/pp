# Task Breakdown: URL Structure Redesign

<!-- FEATURE_DIR: 010-url-structure -->
<!-- FEATURE_ID: 010 -->
<!-- TASK_LIST_ID: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-03 -->
<!-- LAST_UPDATED: 2026-01-03 -->

## Progress Overview
- **Total Tasks**: 10
- **Completed Tasks**: 10 (100%)
- **In Progress Tasks**: 0
- **Blocked Tasks**: 0

---

## Task List

### Phase 1: Utilities [Priority: HIGH]

#### T001: Create Slug Utility
- **Status**: [ ] Pending
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
- **Status**: [ ] Pending
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
- **Status**: [ ] Pending
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
- **Status**: [ ] Pending
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
- **Status**: [ ] Pending
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
- **Status**: [ ] Pending
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
- **Status**: [ ] Pending
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
- **Status**: [ ] Pending
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
- **Status**: [ ] Pending
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
- **Status**: [ ] Pending
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

## Dependencies Graph

```
T001 (Slug Utility)
  ↓
T002 (Portfolio API) ──────┐
  ↓                        │
T003 (Asset API)           │
  ↓                        ↓
T004 (Dashboard Page) ← T005 (Asset Page)
  ↓                        ↓
T008 (Sidebar)         T006 (Edit Page)
  ↓                        ↓
T009 (Link Updates)    T007 (Transaction Pages)
  ↓
T010 (Testing)
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

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1 | T001 | 15 min |
| Phase 2 | T002, T003 | 40 min |
| Phase 3 | T004-T007 | 95 min |
| Phase 4 | T008 | 20 min |
| Phase 5 | T009 | 25 min |
| Phase 6 | T010 | 15 min |
| **Total** | **10 tasks** | **~3.5 hours** |

---

**Legend:**
- [S] = Small (< 15 min), [M] = Medium (15-30 min), [L] = Large (> 30 min)
- [P] = Can be done in parallel
- Status: [ ] Pending, [>] In Progress, [x] Completed, [!] Blocked
