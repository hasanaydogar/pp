# Implementation Plan: Nakit ve Temettü Modülü Geliştirmesi

<!-- FEATURE_DIR: 015-cash-dividend-enhancement -->
<!-- FEATURE_ID: 015 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-03 -->

## Specification Reference
- **Spec ID**: SPEC-015
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-03

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Nakit & Temettü Modülü                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │ Dividend Service │    │  Cash Service    │    │Transaction    │  │
│  │ (Yahoo Finance)  │    │  (CRUD + Calc)   │    │Hooks          │  │
│  └────────┬─────────┘    └────────┬─────────┘    └───────┬───────┘  │
│           │                       │                      │          │
│           ▼                       ▼                      ▼          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    API Layer (Next.js Routes)                │   │
│  │  /api/dividends/calendar   /api/cash/flow   /api/transactions│   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Database (Supabase)                        │   │
│  │  dividends  |  cash_positions  |  cash_transactions  | assets │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    UI Components                              │   │
│  │  DividendCalendarUI | CashFlowChart | UpcomingDividends      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Technical Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase), RLS policies
- **External APIs**: Yahoo Finance (temettü takvimi)
- **Charts**: Recharts (nakit akış grafiği)

## Implementation Phases

---

### Phase 1: Temettü API & Servis (3 saat)
**Priority**: HIGH
**Dependencies**: Mevcut `lib/services/price-service.ts` yapısı

#### Dosya Listesi:
| Dosya | Tip | Açıklama |
|-------|-----|----------|
| `lib/services/dividend-service.ts` | Yeni | Yahoo Finance temettü API servisi |
| `lib/types/dividend.ts` | Güncelleme | Yeni tipler ekle |
| `app/api/dividends/calendar/route.ts` | Yeni | Temettü takvimi endpoint |
| `app/api/dividends/upcoming/route.ts` | Yeni | Yaklaşan temettüler endpoint |

#### Tasks:
1. **T001**: Yahoo Finance dividend API servisi oluştur
   - `fetchDividendCalendar(symbol, currency)` fonksiyonu
   - `calendarEvents` ve `summaryDetail` modüllerini parse et
   - Cache mekanizması (5 dk TTL)
   - BIST hisseleri için `.IS` suffix mapping

2. **T002**: Dividend types güncelle
   ```typescript
   interface UpcomingDividend {
     symbol: string;
     exDividendDate: string;
     paymentDate: string;
     dividendPerShare: number;
     quantity: number; // Portföydeki adet
     expectedTotal: number; // quantity × dividendPerShare
     currency: string;
   }
   ```

3. **T003**: Temettü takvimi API endpoint
   - GET `/api/dividends/calendar?portfolioId={id}`
   - Portföydeki tüm hisseler için temettü bilgisi getir
   - Paralel fetch (Promise.allSettled)

4. **T004**: Yaklaşan temettüler API
   - GET `/api/dividends/upcoming?portfolioId={id}&days=90`
   - Tarih sıralı liste

#### Deliverables:
- [ ] Yahoo Finance'den temettü verisi çekiliyor
- [ ] Portföy hisseleri için beklenen temettü hesaplanıyor
- [ ] API'ler çalışıyor ve cache'leniyor

---

### Phase 2: Database & Nakit-Transaction Entegrasyonu (2.5 saat)
**Priority**: HIGH
**Dependencies**: Phase 1

#### Dosya Listesi:
| Dosya | Tip | Açıklama |
|-------|-----|----------|
| `supabase/migrations/20260103_cash_dividend_enhancement.sql` | Yeni | DB değişiklikleri |
| `lib/types/cash.ts` | Güncelleme | Yeni alanlar |
| `app/api/assets/[id]/transactions/route.ts` | Güncelleme | Cash entegrasyonu |
| `lib/services/cash-service.ts` | Yeni | Nakit işlem servisi |

#### Tasks:
5. **T005**: Database migration
   ```sql
   -- dividends tablosuna yeni alanlar
   ALTER TABLE dividends ADD COLUMN source VARCHAR(10) DEFAULT 'MANUAL';
   ALTER TABLE dividends ADD COLUMN ex_dividend_date DATE;
   ALTER TABLE dividends ADD COLUMN yahoo_event_id VARCHAR(50);
   
   -- cash_transactions tablosuna yeni alanlar
   ALTER TABLE cash_transactions ADD COLUMN related_transaction_id UUID;
   ALTER TABLE cash_transactions ADD COLUMN related_asset_id UUID;
   ALTER TABLE cash_transactions ADD COLUMN related_symbol VARCHAR(20);
   ```

6. **T006**: Cash service oluştur
   - `createCashTransaction()` - Nakit hareketi kaydet
   - `updateCashBalance()` - Bakiye güncelle
   - `getCashFlow()` - Tarihsel akış

7. **T007**: Transaction API güncelle - Hisse alımında nakit düş
   - POST `/api/assets/[id]/transactions` içinde:
   - BUY işleminde: `cash_transactions` INSERT (ASSET_PURCHASE, negatif)
   - `cash_positions` UPDATE (bakiye düş)

8. **T008**: Transaction API güncelle - Hisse satışında nakit ekle
   - SELL işleminde: `cash_transactions` INSERT (ASSET_SALE, pozitif)
   - `cash_positions` UPDATE (bakiye arttır)

9. **T009**: Yetersiz nakit uyarısı
   - Bakiye < işlem tutarı ise UI'da uyarı göster
   - Engelleme yok, sadece bilgilendirme

#### Deliverables:
- [ ] Hisse alımında nakit otomatik düşüyor
- [ ] Hisse satışında nakit otomatik ekleniyor
- [ ] İşlem geçmişinde bağlı nakit hareketi görünüyor

---

### Phase 3: Otomatik Temettü Kaydı (2 saat)
**Priority**: HIGH
**Dependencies**: Phase 1, Phase 2

#### Dosya Listesi:
| Dosya | Tip | Açıklama |
|-------|-----|----------|
| `lib/services/auto-dividend-service.ts` | Yeni | Otomatik temettü servisi |
| `app/api/dividends/auto-record/route.ts` | Yeni | Otomatik kayıt endpoint |

#### Tasks:
10. **T010**: Auto-dividend service oluştur
    - `checkAndRecordDividends(portfolioId)` fonksiyonu
    - Yahoo'dan çekilen temettüler ile DB karşılaştır
    - Ex-dividend tarihi ≤ bugün && kayıt yoksa → oluştur

11. **T011**: Duplicate kontrolü
    - `yahoo_event_id` veya `(asset_id, payment_date)` unique check
    - Aynı temettü tekrar kaydedilmemeli

12. **T012**: Temettü → Nakit entegrasyonu
    - Temettü kaydı oluşunca `cash_transactions` INSERT
    - Type: `DIVIDEND`
    - Nakit bakiye güncelle

13. **T013**: Sayfa yüklemesinde otomatik kontrol
    - `cash/page.tsx` useEffect içinde `checkAndRecordDividends()` çağır
    - Loading state ile kullanıcı bilgilendir

#### Deliverables:
- [ ] Temettü tarihi gelince otomatik kayıt
- [ ] Duplicate kayıt önleniyor
- [ ] Nakit kasasına otomatik ekleniyor

---

### Phase 4: Nakit Akış Grafiği & UI (3 saat)
**Priority**: MEDIUM
**Dependencies**: Phase 2

#### Dosya Listesi:
| Dosya | Tip | Açıklama |
|-------|-----|----------|
| `app/api/portfolios/[id]/cash/flow/route.ts` | Yeni | Nakit akış API |
| `components/cash/cash-flow-chart.tsx` | Yeni | Akış grafiği |
| `components/cash/cash-transactions-list.tsx` | Güncelleme | Detaylı liste |
| `lib/hooks/use-cash-flow.ts` | Yeni | Cash flow hook |

#### Tasks:
14. **T014**: Cash flow API
    - GET `/api/portfolios/[id]/cash/flow?period=30d`
    - Günlük kümülatif bakiye hesapla
    - Kategori bazlı breakdown

15. **T015**: Cash flow hook
    ```typescript
    interface CashFlowData {
      date: string;
      balance: number;
      change: number;
      deposits: number;
      withdrawals: number;
      dividends: number;
      purchases: number;
      sales: number;
    }
    ```

16. **T016**: Cash flow chart component
    - Recharts AreaChart
    - Hover tooltip: o günün detayları
    - Period selector entegrasyonu

17. **T017**: Transactions list güncelle
    - Kategori badge'leri (renkli)
    - İlgili hisse gösterimi
    - Running balance kolonu

18. **T018**: Kategori filtreleme
    - Tüm, Temettü, Alış, Satış, Deposit, Withdraw
    - Filter butonları

#### Deliverables:
- [ ] Nakit akış grafiği çalışıyor
- [ ] Günlük bakiye değişimi görünüyor
- [ ] Kategori filtreleme çalışıyor

---

### Phase 5: Temettü Takvimi UI (2.5 saat)
**Priority**: MEDIUM
**Dependencies**: Phase 1

#### Dosya Listesi:
| Dosya | Tip | Açıklama |
|-------|-----|----------|
| `components/dividends/upcoming-dividends.tsx` | Yeni | Yaklaşan temettüler |
| `components/dividends/dividend-calendar-view.tsx` | Yeni | Takvim görünümü |
| `lib/hooks/use-dividend-calendar.ts` | Yeni | Temettü takvimi hook |

#### Tasks:
19. **T019**: useDividendCalendar hook
    - Portföy hisseleri için temettü bilgisi fetch
    - Loading, error states
    - Auto-refresh

20. **T020**: Upcoming dividends component
    - Liste görünümü
    - Hisse, tarih, beklenen tutar
    - Sıralama: en yakın önce

21. **T021**: Calendar view component
    - Aylık takvim grid
    - Temettü günleri işaretli
    - Tıklayınca detay popup

22. **T022**: Summary card güncelle
    - "Beklenen Temettü" kartı ekle
    - Önümüzdeki 90 gün toplam

#### Deliverables:
- [ ] Yaklaşan temettüler listesi
- [ ] Aylık takvim görünümü
- [ ] Beklenen gelir kartı

---

### Phase 6: Sayfa Entegrasyonu & Polish (1.5 saat)
**Priority**: MEDIUM
**Dependencies**: Phase 4, Phase 5

#### Dosya Listesi:
| Dosya | Tip | Açıklama |
|-------|-----|----------|
| `app/(protected)/p/[slug]/cash/page.tsx` | Güncelleme | Tam entegrasyon |

#### Tasks:
23. **T023**: Cash page tam entegrasyon
    - Tüm yeni componentleri entegre et
    - Layout düzenle (spec'teki UI'a göre)
    - Responsive kontrol

24. **T024**: Error handling
    - Yahoo API fail durumu
    - Fallback UI göster
    - Retry mekanizması

25. **T025**: Empty states
    - Temettü yoksa mesaj
    - Nakit hareketi yoksa mesaj

26. **T026**: TypeScript check
    - `npx tsc --noEmit`
    - Tüm hatalar düzelt

#### Deliverables:
- [ ] Sayfa tam çalışıyor
- [ ] Error handling robust
- [ ] TypeScript hatasız

---

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Yahoo Finance API değişikliği | Medium | High | Fallback endpoint, cache |
| BIST temettü verisi eksik | High | Medium | Manuel giriş fallback |
| Rate limiting | Medium | Medium | Cache, debounce |
| Transaction atomicity | Low | High | Database transaction kullan |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| Yahoo Finance API | Medium | Alternative API (Alpha Vantage) |
| Supabase RLS | Low | Test coverage |
| Recharts | Low | Mevcut, stabil |

## File Summary

### Yeni Dosyalar (12):
1. `lib/services/dividend-service.ts`
2. `lib/services/auto-dividend-service.ts`
3. `lib/services/cash-service.ts`
4. `app/api/dividends/calendar/route.ts`
5. `app/api/dividends/upcoming/route.ts`
6. `app/api/dividends/auto-record/route.ts`
7. `app/api/portfolios/[id]/cash/flow/route.ts`
8. `components/cash/cash-flow-chart.tsx`
9. `components/dividends/upcoming-dividends.tsx`
10. `components/dividends/dividend-calendar-view.tsx`
11. `lib/hooks/use-cash-flow.ts`
12. `lib/hooks/use-dividend-calendar.ts`
13. `supabase/migrations/20260103_cash_dividend_enhancement.sql`

### Güncellenen Dosyalar (5):
1. `lib/types/dividend.ts` - Yeni tipler
2. `lib/types/cash.ts` - Yeni alanlar
3. `app/api/assets/[id]/transactions/route.ts` - Cash entegrasyonu
4. `app/(protected)/p/[slug]/cash/page.tsx` - Tam entegrasyon
5. `components/cash/cash-transactions-list.tsx` - Detaylı liste

## Success Metrics
- **Performance**: Temettü API < 2s response time
- **Accuracy**: Otomatik temettü kayıtları %100 doğru
- **UX**: Nakit-transaction entegrasyonu seamless
- **Reliability**: Yahoo API fail durumunda graceful degradation

## Definition of Done
- [ ] Yahoo Finance'den temettü takvimi çekiliyor
- [ ] Portföydeki hisse adedi ile beklenen temettü hesaplanıyor
- [ ] Temettü tarihi gelince otomatik kayıt oluşuyor
- [ ] Hisse alımında nakit otomatik düşüyor
- [ ] Hisse satışında nakit otomatik ekleniyor
- [ ] Nakit akış grafiği çalışıyor
- [ ] Kategori filtreleme çalışıyor
- [ ] Temettü takvimi takvim formatında gösteriliyor
- [ ] TypeScript hatasız
- [ ] Mobile responsive

## Estimated Duration

| Phase | Süre | Kümülatif |
|-------|------|-----------|
| Phase 1: Temettü API | 3 saat | 3 saat |
| Phase 2: DB & Transaction Entegrasyonu | 2.5 saat | 5.5 saat |
| Phase 3: Otomatik Temettü | 2 saat | 7.5 saat |
| Phase 4: Nakit Akış UI | 3 saat | 10.5 saat |
| Phase 5: Temettü Takvimi UI | 2.5 saat | 13 saat |
| Phase 6: Entegrasyon & Polish | 1.5 saat | 14.5 saat |

**Toplam**: ~14.5 saat
