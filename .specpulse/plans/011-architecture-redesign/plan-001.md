# Implementation Plan: Portfolio Architecture Redesign

<!-- FEATURE_DIR: 011-architecture-redesign -->
<!-- FEATURE_ID: 011 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: approved -->
<!-- CREATED: 2026-01-03 -->

## Specification Reference
- **Spec ID**: SPEC-011
- **Spec Version**: 1.1
- **Plan Version**: 1.0
- **Generated**: 2026-01-03

## Executive Summary

Bu plan, portfolio yönetim sisteminin kapsamlı bir şekilde yeniden tasarlanmasını içerir:
- **Toplam Özet**: Tüm portfolyoların birleşik görünümü
- **Cash Management**: Nakit pozisyon ve hareket takibi
- **Portfolio Policies**: Yatırım kuralları ve ağırlık limitleri
- **Sectors & Categories**: Sektör bilgisi ve pozisyon kategorileri
- **Portfolio Types**: Dinamik portfolyo türleri

---

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  📊 Summary Page    💼 Portfolio Dashboard    ⚙️ Settings    │
│  /summary           /p/[slug]                /settings       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  /api/summary              /api/portfolios/[id]/policy       │
│  /api/portfolio-types      /api/portfolios/[id]/cash         │
│  /api/sectors              /api/assets/[id]/metadata         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  portfolio_types    portfolio_policies    cash_positions     │
│  cash_transactions  sectors               asset_metadata     │
│  + portfolios (updated)                                      │
└─────────────────────────────────────────────────────────────┘
```

### Technical Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Catalyst UI
- **Backend**: Next.js API Routes, Supabase Client
- **Database**: PostgreSQL (Supabase)
- **State Management**: React Context, Zustand (auth store)
- **Validation**: Zod schemas

### Database Schema Changes

```
NEW TABLES:
├── portfolio_types       (user_id, name, display_name, icon, color)
├── portfolio_policies    (portfolio_id, max_weight_per_stock, cash_target, etc.)
├── cash_positions        (portfolio_id, currency, amount)
├── cash_transactions     (cash_position_id, type, amount, date)
├── sectors               (name, display_name, color) - GLOBAL
└── asset_metadata        (asset_id, sector_id, position_category, etc.)

MODIFIED TABLES:
└── portfolios            (+portfolio_type_id, +description, +target_value)
```

---

## Implementation Phases

### Phase 1: Database Foundation [Priority: CRITICAL]
**Timeline**: 2 saat
**Dependencies**: None

#### Objective
Yeni tablo yapısını oluştur ve mevcut portfolios tablosunu güncelle.

#### Tasks
1. [ ] **T1.1** Migration dosyası oluştur: `20260103_architecture_redesign.sql`
   - portfolio_types tablosu
   - portfolio_policies tablosu
   - cash_positions tablosu
   - cash_transactions tablosu
   - sectors tablosu (global)
   - asset_metadata tablosu
   - portfolios tablosu güncellemeleri (ALTER)

2. [ ] **T1.2** RLS politikaları ekle
   - Her tablo için SELECT/INSERT/UPDATE/DELETE politikaları
   - Portfolyo ownership kontrolü

3. [ ] **T1.3** Seed data ekle
   - Varsayılan sektörler (10 adet)

4. [ ] **T1.4** TypeScript types güncelle
   - `lib/types/portfolio.ts` - yeni interface'ler
   - `lib/types/policy.ts` - yeni dosya
   - `lib/types/cash.ts` - yeni dosya
   - `lib/types/sector.ts` - yeni dosya

5. [ ] **T1.5** Zod schemas oluştur
   - PortfolioTypeSchema, PortfolioPolicySchema
   - CashPositionSchema, CashTransactionSchema
   - SectorSchema, AssetMetadataSchema

#### Files to Create/Modify
```
CREATE:
- supabase/migrations/20260103_architecture_redesign.sql
- lib/types/policy.ts
- lib/types/cash.ts
- lib/types/sector.ts

MODIFY:
- lib/types/portfolio.ts (add new enums, interfaces)
```

#### Deliverables
- [ ] Migration başarıyla çalıştı
- [ ] Tüm tablolar RLS ile korunuyor
- [ ] TypeScript types hazır
- [ ] Zod schemas validate ediyor

#### Acceptance Criteria
- `npx supabase db push` başarılı
- TypeScript compilation hatasız
- Mevcut portfolyolar etkilenmedi

---

### Phase 2: Portfolio Types & Policies API [Priority: HIGH]
**Timeline**: 2 saat
**Dependencies**: Phase 1 complete

#### Objective
Portfolio türleri ve politikaları için CRUD API'ları oluştur.

#### Tasks
1. [ ] **T2.1** Portfolio Types API
   - `GET /api/portfolio-types` - Liste
   - `POST /api/portfolio-types` - Oluştur
   - `PUT /api/portfolio-types/[id]` - Güncelle
   - `DELETE /api/portfolio-types/[id]` - Sil

2. [ ] **T2.2** Portfolio Policies API
   - `GET /api/portfolios/[id]/policy` - Politika getir
   - `PUT /api/portfolios/[id]/policy` - Oluştur/Güncelle
   - `DELETE /api/portfolios/[id]/policy` - Sil (varsayılana dön)

3. [ ] **T2.3** Portfolios API güncellemesi
   - `PUT /api/portfolios/[id]` - portfolio_type_id, description, target_value ekle

4. [ ] **T2.4** Default policy logic
   - Yeni portfolio oluşturulduğunda varsayılan policy oluştur

#### Files to Create/Modify
```
CREATE:
- app/api/portfolio-types/route.ts
- app/api/portfolio-types/[id]/route.ts
- app/api/portfolios/[id]/policy/route.ts

MODIFY:
- app/api/portfolios/[id]/route.ts
```

#### Deliverables
- [ ] Portfolio types CRUD çalışıyor
- [ ] Portfolio policies CRUD çalışıyor
- [ ] Varsayılan policy otomatik oluşuyor

#### Acceptance Criteria
- API endpoints 200 döndürüyor
- Yetkilendirme kontrolleri çalışıyor
- Zod validation aktif

---

### Phase 3: Cash Management [Priority: HIGH]
**Timeline**: 3 saat
**Dependencies**: Phase 1 complete

#### Objective
Nakit pozisyon takibi ve nakit hareketleri için API ve UI oluştur.

#### Tasks
1. [ ] **T3.1** Cash Positions API
   - `GET /api/portfolios/[id]/cash` - Tüm cash pozisyonları
   - `POST /api/portfolios/[id]/cash` - Yeni cash pozisyonu
   - `PUT /api/portfolios/[id]/cash/[currency]` - Güncelle
   - `DELETE /api/portfolios/[id]/cash/[currency]` - Sil

2. [ ] **T3.2** Cash Transactions API
   - `GET /api/portfolios/[id]/cash/[currency]/transactions` - İşlem listesi
   - `POST /api/portfolios/[id]/cash/[currency]/transactions` - Yeni işlem

3. [ ] **T3.3** Cash Position Card Component
   - `components/cash/cash-position-card.tsx`
   - Para birimi bazlı görünüm
   - Hedef vs mevcut karşılaştırma

4. [ ] **T3.4** Cash Transaction Form
   - `components/cash/cash-transaction-form.tsx`
   - DEPOSIT, WITHDRAW, DIVIDEND türleri
   - Date picker, amount input

5. [ ] **T3.5** Cash Transaction List
   - `components/cash/cash-transaction-list.tsx`
   - Filtreleme (tür, tarih)
   - Pagination

6. [ ] **T3.6** Portfolio Dashboard Integration
   - Cash kartını dashboard'a ekle
   - Nakit yüzdesi gösterimi

#### Files to Create/Modify
```
CREATE:
- app/api/portfolios/[id]/cash/route.ts
- app/api/portfolios/[id]/cash/[currency]/route.ts
- app/api/portfolios/[id]/cash/[currency]/transactions/route.ts
- components/cash/cash-position-card.tsx
- components/cash/cash-transaction-form.tsx
- components/cash/cash-transaction-list.tsx
- lib/hooks/use-cash-positions.ts

MODIFY:
- app/(protected)/p/[slug]/page.tsx (add cash card)
```

#### Deliverables
- [ ] Cash CRUD API çalışıyor
- [ ] Cash kartı dashboard'da görünüyor
- [ ] Nakit işlemleri kaydedilebiliyor

#### Acceptance Criteria
- TRY, USD, EUR için ayrı cash pozisyonları
- Cash transaction history görüntülenebilir
- Nakit yüzdesi doğru hesaplanıyor

---

### Phase 4: Sectors & Asset Metadata [Priority: MEDIUM]
**Timeline**: 2 saat
**Dependencies**: Phase 1 complete

#### Objective
Sektör bilgisi ve asset metadata yönetimi.

#### Tasks
1. [ ] **T4.1** Sectors API
   - `GET /api/sectors` - Tüm sektörler (global)

2. [ ] **T4.2** Asset Metadata API
   - `GET /api/assets/[id]/metadata` - Metadata getir
   - `PUT /api/assets/[id]/metadata` - Oluştur/Güncelle

3. [ ] **T4.3** Position Category Logic
   - Auto-calculate based on weight
   - Manual override support

4. [ ] **T4.4** Sector Badge Component
   - `components/assets/sector-badge.tsx`
   - Renk kodlu sektör gösterimi

5. [ ] **T4.5** Category Badge Component
   - `components/assets/category-badge.tsx`
   - CORE (yeşil), SATELLITE (mavi), NEW (sarı)

6. [ ] **T4.6** Asset Detail Integration
   - Sektör ve kategori badge'lerini ekle
   - Metadata edit formu

#### Files to Create/Modify
```
CREATE:
- app/api/sectors/route.ts
- app/api/assets/[id]/metadata/route.ts
- components/assets/sector-badge.tsx
- components/assets/category-badge.tsx
- components/assets/asset-metadata-form.tsx
- lib/utils/position-category.ts

MODIFY:
- app/(protected)/p/[slug]/[symbol]/page.tsx (add badges)
```

#### Deliverables
- [ ] Sektörler listelenebiliyor
- [ ] Asset metadata CRUD çalışıyor
- [ ] Kategori otomatik hesaplanıyor

#### Acceptance Criteria
- 10 varsayılan sektör mevcut
- Manual override çalışıyor
- Badge'ler doğru renkte

---

### Phase 5: All Portfolios Summary [Priority: HIGH]
**Timeline**: 3 saat
**Dependencies**: Phase 2, Phase 3 complete

#### Objective
Tüm portfolyoların toplam özetini gösteren sayfa ve API.

#### Tasks
1. [ ] **T5.1** Summary API
   - `GET /api/summary` - Tüm portfolyoların özeti
   - Para birimi dönüşümü (display currency)
   - Portfolio breakdown
   - Asset type breakdown
   - Sector breakdown

2. [ ] **T5.2** Policy Violations API
   - `GET /api/portfolios/[id]/violations` - Tek portfolio ihlalleri
   - Summary API'ye ihlalleri dahil et

3. [ ] **T5.3** Summary Page
   - `app/(protected)/summary/page.tsx`
   - Toplam değer kartları
   - Portfolio listesi
   - Dağılım grafikleri (pie chart)

4. [ ] **T5.4** Portfolio Summary Cards
   - `components/summary/portfolio-summary-card.tsx`
   - Mini portfolio özeti

5. [ ] **T5.5** Distribution Charts
   - `components/summary/distribution-chart.tsx`
   - Portfolio dağılımı
   - Asset type dağılımı

6. [ ] **T5.6** Violations Alert Panel
   - `components/summary/violations-panel.tsx`
   - Tüm ihlallerin listesi

7. [ ] **T5.7** Sidebar Update
   - "Toplam Özet" linkini ekle
   - Navigation güncelle

#### Files to Create/Modify
```
CREATE:
- app/api/summary/route.ts
- app/api/portfolios/[id]/violations/route.ts
- app/(protected)/summary/page.tsx
- components/summary/portfolio-summary-card.tsx
- components/summary/distribution-chart.tsx
- components/summary/violations-panel.tsx
- lib/hooks/use-summary.ts
- lib/api/summary.ts

MODIFY:
- app/(protected)/application-layout-client.tsx (add summary link)
- components/layout/sidebar.tsx (if needed)
```

#### Deliverables
- [ ] Summary API çalışıyor
- [ ] Summary sayfası görüntülenebiliyor
- [ ] Dağılım grafikleri çalışıyor
- [ ] Sidebar'da link mevcut

#### Acceptance Criteria
- Tüm portfolyolar tek sayfada özet
- Para birimi dönüşümü doğru
- Policy ihlalleri görünüyor

---

### Phase 6: Portfolio Settings UI [Priority: MEDIUM]
**Timeline**: 2 saat
**Dependencies**: Phase 2 complete

#### Objective
Portfolio ayarları ve policy düzenleme UI'ı.

#### Tasks
1. [ ] **T6.1** Portfolio Settings Page
   - `app/(protected)/p/[slug]/settings/page.tsx`
   - Genel bilgiler formu
   - Policy formu

2. [ ] **T6.2** Portfolio Type Selector
   - `components/portfolios/portfolio-type-selector.tsx`
   - Dropdown with icons

3. [ ] **T6.3** Policy Form Component
   - `components/portfolios/policy-form.tsx`
   - Ağırlık limitleri
   - Nakit hedefleri
   - Position category ranges

4. [ ] **T6.4** Portfolio Type Manager
   - `app/(protected)/settings/portfolio-types/page.tsx`
   - CRUD for portfolio types

5. [ ] **T6.5** Navigation Integration
   - Settings linkini portfolio header'a ekle

#### Files to Create/Modify
```
CREATE:
- app/(protected)/p/[slug]/settings/page.tsx
- app/(protected)/settings/portfolio-types/page.tsx
- components/portfolios/portfolio-type-selector.tsx
- components/portfolios/policy-form.tsx

MODIFY:
- app/(protected)/p/[slug]/page.tsx (add settings link)
```

#### Deliverables
- [ ] Portfolio settings sayfası çalışıyor
- [ ] Policy düzenlenebiliyor
- [ ] Portfolio types yönetilebiliyor

#### Acceptance Criteria
- Tüm policy alanları düzenlenebilir
- Değişiklikler kaydediliyor
- Validation hataları gösteriliyor

---

### Phase 7: Testing & Polish [Priority: MEDIUM]
**Timeline**: 2 saat
**Dependencies**: All phases complete

#### Objective
Kapsamlı test ve son düzeltmeler.

#### Tasks
1. [ ] **T7.1** API Integration Tests
   - Portfolio types endpoints
   - Cash management endpoints
   - Summary endpoint

2. [ ] **T7.2** UI Testing
   - Cash kartı
   - Summary sayfası
   - Settings formu

3. [ ] **T7.3** Edge Cases
   - Boş portfolio
   - Sıfır nakit
   - Policy olmayan portfolio

4. [ ] **T7.4** Performance Check
   - Summary API response time
   - Dashboard loading time

5. [ ] **T7.5** Documentation
   - API documentation güncelle
   - README güncelle

#### Files to Create/Modify
```
CREATE:
- __tests__/integration/cash-management.test.ts
- __tests__/integration/portfolio-policies.test.ts
- __tests__/integration/summary.test.ts

MODIFY:
- docs/api/*.md
- README.md
```

#### Deliverables
- [ ] Tüm testler geçiyor
- [ ] Edge case'ler handle edilmiş
- [ ] Dokümantasyon güncel

#### Acceptance Criteria
- Test coverage > 80%
- No console errors
- Loading states mevcut

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Migration failure | Low | High | Test on local first, backup before prod |
| RLS policy errors | Medium | High | Thorough testing with different users |
| Performance issues on summary | Medium | Medium | Implement caching, optimize queries |
| Currency conversion errors | Low | Medium | Use existing exchange rate logic |

### Dependencies

| Dependency | Risk | Contingency |
|------------|------|-------------|
| Supabase migrations | Low | Manual SQL execution if needed |
| Exchange rate API | Low | Fallback to manual rates |
| Chart library (if needed) | Low | Use simple HTML/CSS charts |

---

## Resource Requirements

### Development Team
- **Full-stack Developer**: 1 developer (solo project)
- **Estimated Total Time**: 14-16 hours

### Time Breakdown by Phase

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Database | 2 hours | CRITICAL |
| Phase 2: Types & Policies API | 2 hours | HIGH |
| Phase 3: Cash Management | 3 hours | HIGH |
| Phase 4: Sectors & Metadata | 2 hours | MEDIUM |
| Phase 5: Summary | 3 hours | HIGH |
| Phase 6: Settings UI | 2 hours | MEDIUM |
| Phase 7: Testing | 2 hours | MEDIUM |
| **Total** | **16 hours** | |

---

## Success Metrics

- **Functionality**: Tüm CRUD işlemleri çalışıyor
- **Performance**: Summary API < 500ms response time
- **UX**: Nakit ve policy yönetimi kolay anlaşılır
- **Data Integrity**: Mevcut veriler korundu

---

## Rollout Plan

### Phase Rollout Strategy
1. **Development**: Local environment testing
2. **Staging**: Supabase preview branch (if available)
3. **Production**: Main branch deploy

### Monitoring
- Supabase dashboard for DB health
- Console errors in browser dev tools
- API response times

---

## Definition of Done

- [ ] All 7 phases complete
- [ ] All acceptance criteria met
- [ ] TypeScript compilation successful
- [ ] No console errors
- [ ] Mevcut portfolyolar çalışmaya devam ediyor
- [ ] Summary sayfası doğru toplam gösteriyor
- [ ] Cash management full CRUD
- [ ] Policy settings editable

---

## SDD Compliance Checklist

### Principle 1: Specification First ✅
- [x] Clear requirements documented in spec-001.md
- [x] User stories with acceptance criteria
- [x] Functional and non-functional requirements defined

### Principle 2: Incremental Planning ✅
- [x] Work broken into 7 phases
- [x] Each phase delivers working functionality
- [x] Milestones defined (per phase deliverables)

### Principle 3: Task Decomposition ✅
- [x] Tasks specific and actionable (T1.1, T1.2, etc.)
- [x] Effort estimates provided
- [x] Dependencies identified

### Principle 6: Quality Assurance ✅
- [x] Testing phase included (Phase 7)
- [x] Acceptance criteria for each phase
- [x] Edge cases identified

### Principle 7: Architecture Documentation ✅
- [x] Technology choices documented
- [x] Database schema defined
- [x] API endpoints listed

---

## Next Steps

1. `/sp-task` ile task breakdown oluştur
2. Phase 1 (Database) ile başla
3. Her phase sonunda test et

**Ready for**: `/sp-task`
