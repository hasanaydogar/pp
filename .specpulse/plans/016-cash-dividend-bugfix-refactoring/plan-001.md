# Implementation Plan: Nakit & Temettü Bug Fix ve Refactoring

<!-- FEATURE_DIR: 016-cash-dividend-bugfix-refactoring -->
<!-- FEATURE_ID: 016 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-05 -->

## Specification Reference
- **Spec ID**: SPEC-016
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-05

## Architecture Overview

### High-Level Design
Bu plan, mevcut Nakit & Temettü modülündeki 6 kritik sorunu çözmek için tasarlanmıştır. Mevcut mimari korunarak, bug fix'ler ve yeni özellikler aşamalı olarak eklenecektir.

```
┌─────────────────────────────────────────────────────────────┐
│                    Cash Page (page.tsx)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ PeriodPicker│  │ CashSummary  │  │ DividendCalendar   │  │
│  │ (YENİ)      │  │ Cards        │  │ View + Forecast    │  │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬──────────┘  │
│         │                │                    │              │
│         v                v                    v              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Period Context (YENİ)                    │   │
│  │  - selectedPeriod: '7d' | '30d' | '90d' | 'month'... │   │
│  │  - dateRange: { start, end }                          │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                │                    │              │
│         v                v                    v              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 API Layer                             │   │
│  │  GET /cash/summary?period=30d                        │   │
│  │  GET /dividends/calendar?includeForecast=true        │   │
│  │  POST /dividends/forecast                            │   │
│  │  PUT /dividends/:id/resolve-conflict                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technical Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase Client
- **Database**: PostgreSQL (Supabase)
- **State Management**: React Context + URL Params
- **Charts**: Recharts (mevcut)

## Implementation Phases

### Phase 1: Nakit Bakiyesi Düzeltmesi [Priority: P0 - KRİTİK]
**Timeline**: 1-2 saat
**Dependencies**: Mevcut cash_positions tablosu

#### Problem Analizi
Mevcut nakit bakiyesi yanlış gösteriliyor. `CashSummaryCards` component'i doğru veriyi almıyor veya hesaplama hatalı.

#### Tasks
1. [ ] **Task 1.1**: `cash_positions.amount` veri akışını debug et
   - `useCashFlow` hook'unu incele
   - API response'larını kontrol et
   - Frontend state binding'i doğrula

2. [ ] **Task 1.2**: API endpoint'lerini düzelt
   - `GET /api/portfolios/[id]/cash` response formatını kontrol et
   - `cash_positions.amount` doğru dönüyor mu?

3. [ ] **Task 1.3**: `CashSummaryCards` component'ini güncelle
   - `cashBalance` prop'unun doğru aktarıldığını doğrula
   - Fallback değer ekle (0 yerine loading state)

4. [ ] **Task 1.4**: Temettü → nakit akışını doğrula
   - Temettü kaydedildiğinde `cash_transactions` tablosuna ekleniyor mu?
   - `cash_positions.amount` güncelleniyor mu?

#### Deliverables
- [ ] Mevcut nakit bakiyesi doğru gösteriliyor
- [ ] Temettü geliri nakit bakiyesine yansıyor
- [ ] Para yatırma/çekme işlemleri doğru çalışıyor

#### Dosyalar
```
lib/hooks/use-cash-flow.ts          → Hook düzeltmesi
app/api/portfolios/[id]/cash/route.ts → API düzeltmesi
components/cash/cash-summary-cards.tsx → UI düzeltmesi
app/(protected)/p/[slug]/cash/page.tsx → Veri binding
```

---

### Phase 2: Dönem Seçici Eklenmesi [Priority: P0 - KRİTİK]
**Timeline**: 2-3 saat
**Dependencies**: Phase 1 tamamlanmalı

#### Tasarım
```
┌────────────────────────────────────────────────────────────┐
│ Nakit ve Temettü                                           │
│ ┌─────────────────┐                                        │
│ │ Son 30 Gün    ▼ │    [+ Nakit Ekle]  [+ Temettü Kaydet] │
│ └─────────────────┘                                        │
│   ├── Son 7 Gün                                            │
│   ├── Son 30 Gün ✓                                         │
│   ├── Son 90 Gün                                           │
│   ├── Bu Ay                                                │
│   ├── Bu Yıl                                               │
│   └── Özel Aralık...                                       │
└────────────────────────────────────────────────────────────┘
```

#### Tasks
1. [ ] **Task 2.1**: `PeriodPicker` component oluştur
   ```typescript
   // components/cash/period-picker.tsx
   type Period = '7d' | '30d' | '90d' | 'month' | 'year' | 'custom';
   
   interface PeriodPickerProps {
     value: Period;
     onChange: (period: Period, range?: DateRange) => void;
   }
   ```

2. [ ] **Task 2.2**: Period utility fonksiyonları
   ```typescript
   // lib/utils/period.ts
   export function getPeriodDateRange(period: Period): { start: Date; end: Date };
   export function formatPeriodLabel(period: Period): string;
   ```

3. [ ] **Task 2.3**: Cash page'e dönem state'i ekle
   - `selectedPeriod` state
   - URL param sync (opsiyonel): `?period=30d`

4. [ ] **Task 2.4**: API'lere period parametresi ekle
   - `GET /api/portfolios/[id]/cash/summary?startDate=...&endDate=...`
   - `GET /api/portfolios/[id]/dividends?startDate=...&endDate=...`

5. [ ] **Task 2.5**: Hook'ları period-aware yap
   - `useCashFlow(portfolioId, period)` → date range desteği
   - `useDividendCalendar(portfolioId, period)` → filtreleme

#### Deliverables
- [ ] Dönem seçici dropdown çalışıyor
- [ ] Seçilen dönem tüm istatistikleri etkiliyor
- [ ] "Dönem Temettü Tutarı" doğru hesaplanıyor
- [ ] Varsayılan "Son 30 Gün" seçili

#### Dosyalar
```
components/cash/period-picker.tsx      → YENİ component
lib/utils/period.ts                    → YENİ utility
lib/hooks/use-cash-flow.ts             → Period desteği
lib/hooks/use-dividend-calendar.ts     → Period desteği
app/(protected)/p/[slug]/cash/page.tsx → State entegrasyonu
```

---

### Phase 3: Grafik Tarih Aralığı İyileştirmesi [Priority: P1]
**Timeline**: 1-2 saat
**Dependencies**: Phase 2 tamamlanmalı

#### Tasks
1. [ ] **Task 3.1**: Grafik veri aralığı hesaplaması
   ```typescript
   // Mevcut: Sadece geçmiş verileri gösteriyor
   // Yeni: İleri tarihli işlemler varsa onları da dahil et
   
   const chartDateRange = useMemo(() => {
     const today = new Date();
     const periodStart = getPeriodStart(period);
     
     // En ileri tarihli işlemi bul
     const maxFutureDate = Math.max(
       ...transactions.map(t => new Date(t.date).getTime()),
       ...upcomingDividends.map(d => new Date(d.payment_date).getTime())
     );
     
     return {
       start: periodStart,
       end: Math.max(today, new Date(maxFutureDate))
     };
   }, [period, transactions, upcomingDividends]);
   ```

2. [ ] **Task 3.2**: İleri tarihli işlemler için stil
   ```typescript
   // Kesik çizgi stili (dashed line) for future data
   <Line 
     strokeDasharray={isFuture ? "5 5" : undefined}
     opacity={isFuture ? 0.6 : 1}
   />
   ```

3. [ ] **Task 3.3**: X ekseni adaptif ayarla
   - Minimum 7 gün, maksimum en uzak tarihli işlem
   - Tick formatı: Ay kısa ismi + Gün

#### Deliverables
- [ ] Grafik ileri tarihli işlemleri gösteriyor
- [ ] Gelecek tarihler kesik çizgi ile gösteriliyor
- [ ] X ekseni otomatik ölçekleniyor

#### Dosyalar
```
components/cash/cash-flow-chart.tsx → Grafik güncelleme
lib/hooks/use-cash-flow.ts          → Data range hesaplama
```

---

### Phase 4: Temettü Takvimi Manuel Kayıt [Priority: P1]
**Timeline**: 2-3 saat
**Dependencies**: Phase 2 tamamlanmalı

#### Tasarım - Forecast Dialog
```
┌─────────────────────────────────────────────────────────┐
│ Temettü Beklentisi Ekle                                 │
│                                                         │
│ Varlık                                                  │
│ ┌─────────────────────────────────────────┐            │
│ │ THYAO                                 ▼ │            │
│ └─────────────────────────────────────────┘            │
│                                                         │
│ Beklenen Tarih           Hisse Başı Tutar (TRY)        │
│ ┌─────────────────┐      ┌─────────────────┐           │
│ │ 20.01.2026    📅│      │ 2.50            │           │
│ └─────────────────┘      └─────────────────┘           │
│                                                         │
│ Portföyde 1.000 adet THYAO                             │
│ Tahmini Toplam: ₺2.500,00 (stopaj öncesi)              │
│                                                         │
│              [İptal]  [Beklenti Ekle]                  │
└─────────────────────────────────────────────────────────┘
```

#### Tasks
1. [ ] **Task 4.1**: Database migration - MANUAL_FORECAST source ekle
   ```sql
   -- 20260105_dividend_forecast.sql
   ALTER TYPE dividend_source ADD VALUE IF NOT EXISTS 'MANUAL_FORECAST';
   ALTER TYPE dividend_source ADD VALUE IF NOT EXISTS 'MERGED';
   
   -- forecast için is_forecast kolonu
   ALTER TABLE dividends ADD COLUMN IF NOT EXISTS is_forecast BOOLEAN DEFAULT FALSE;
   ```

2. [ ] **Task 4.2**: `DividendForecastDialog` component oluştur
   - Mevcut `DividendDialog`'dan fork
   - `is_forecast: true` flag'i
   - Basitleştirilmiş form (stopaj yok, sadece beklenti)

3. [ ] **Task 4.3**: `POST /api/dividends/forecast` endpoint
   ```typescript
   // Body: { asset_id, payment_date, per_share_amount }
   // Response: Created dividend with source='MANUAL_FORECAST', is_forecast=true
   ```

4. [ ] **Task 4.4**: Takvim görünümünde forecast'ları göster
   - Farklı ikon: 📅 (takvim) vs 💰 (gerçekleşmiş)
   - Farklı renk: Mavi (beklenti) vs Yeşil (gerçekleşmiş)

5. [ ] **Task 4.5**: UI'a "Beklenti Ekle" butonu
   - "Temettü Kaydet" yanına veya ayrı bölüme

#### Deliverables
- [ ] Forecast dialog çalışıyor
- [ ] Manuel beklentiler database'e kaydediliyor
- [ ] Takvimde forecast'lar görünüyor
- [ ] Forecast'lar farklı stil ile ayırt ediliyor

#### Dosyalar
```
supabase/migrations/20260105_dividend_forecast.sql  → YENİ migration
components/dividends/dividend-forecast-dialog.tsx   → YENİ dialog
app/api/dividends/forecast/route.ts                 → YENİ endpoint
components/cash/dividend-calendar-view.tsx          → Forecast gösterimi
components/cash/upcoming-dividends.tsx              → Forecast listesi
```

---

### Phase 5: Temettü Merge/Conflict Yönetimi [Priority: P2]
**Timeline**: 3-4 saat
**Dependencies**: Phase 4 tamamlanmalı

#### Conflict Detection Logic
```typescript
interface ConflictDetection {
  // Eşleşme kriterleri
  sameAsset: boolean;           // Aynı asset_id
  dateProximity: boolean;       // ±3 gün tolerans
  
  // Conflict türü
  type: 'auto_merge' | 'conflict' | 'no_match';
  
  // auto_merge: tutar farkı ≤ %5
  // conflict: tutar farkı > %5
  // no_match: eşleşme yok
}

function detectConflict(
  apiForecast: Dividend,
  manualForecast: Dividend
): ConflictDetection {
  const daysDiff = Math.abs(
    differenceInDays(apiForecast.payment_date, manualForecast.payment_date)
  );
  
  if (apiForecast.asset_id !== manualForecast.asset_id) {
    return { type: 'no_match', ... };
  }
  
  if (daysDiff > 3) {
    return { type: 'no_match', ... };
  }
  
  const amountDiff = Math.abs(
    (apiForecast.gross_amount - manualForecast.gross_amount) / manualForecast.gross_amount
  );
  
  if (amountDiff <= 0.05) {
    return { type: 'auto_merge', ... };
  }
  
  return { type: 'conflict', ... };
}
```

#### Tasks
1. [ ] **Task 5.1**: Conflict detection service
   ```typescript
   // lib/services/dividend-conflict-service.ts
   export async function detectDividendConflicts(
     portfolioId: string,
     apiDividends: Dividend[],
     manualForecasts: Dividend[]
   ): Promise<DividendConflict[]>;
   ```

2. [ ] **Task 5.2**: Conflict resolution API
   ```typescript
   // PUT /api/dividends/[id]/resolve-conflict
   // Body: { resolution: 'use_api' | 'use_manual', apiDividendId?: string }
   ```

3. [ ] **Task 5.3**: `ConflictResolutionDialog` component
   ```
   ┌─────────────────────────────────────────────────────┐
   │ ⚠️ Temettü Çakışması                                │
   │                                                     │
   │ THYAO - 20 Ocak 2026                               │
   │                                                     │
   │ 📊 API Verisi                                      │
   │    Hisse başı: ₺2,50                               │
   │    Toplam: ₺2.500,00                               │
   │                                                     │
   │ 📝 Sizin Beklentiniz                               │
   │    Hisse başı: ₺2,80                               │
   │    Toplam: ₺2.800,00                               │
   │                                                     │
   │ Fark: +%12                                         │
   │                                                     │
   │ [API Verisini Kullan] [Kendi Kaydımı Kullan]       │
   └─────────────────────────────────────────────────────┘
   ```

4. [ ] **Task 5.4**: Auto-merge logic
   - Tutar farkı ≤ %5 → Otomatik olarak API değerini kullan
   - Manuel kaydı `source: 'MERGED'` olarak güncelle
   - `merged_from_id` ile API kaydını referansla

5. [ ] **Task 5.5**: Conflict listesi UI
   - Sayfa yüklendiğinde conflict kontrolü
   - Alert banner: "3 temettü beklentisinde çakışma var"
   - Conflict listesine tıklayınca dialog açılır

#### Deliverables
- [ ] Auto-merge çalışıyor (≤%5 fark)
- [ ] Conflict dialog açılıyor (>%5 fark)
- [ ] Kullanıcı resolution seçebiliyor
- [ ] Merge sonrası kayıtlar doğru güncelleniyor

#### Dosyalar
```
lib/services/dividend-conflict-service.ts            → YENİ service
app/api/dividends/[id]/resolve-conflict/route.ts     → YENİ endpoint
components/dividends/conflict-resolution-dialog.tsx  → YENİ dialog
components/cash/conflict-alert-banner.tsx            → YENİ banner
```

---

### Phase 6: Test ve Doğrulama [Priority: P1]
**Timeline**: 1-2 saat
**Dependencies**: Tüm fazlar

#### Tasks
1. [ ] **Task 6.1**: Unit test - Period utilities
   ```typescript
   describe('getPeriodDateRange', () => {
     it('should return correct range for 7d', ...);
     it('should return correct range for month', ...);
   });
   ```

2. [ ] **Task 6.2**: Unit test - Conflict detection
   ```typescript
   describe('detectDividendConflicts', () => {
     it('should auto-merge when diff <= 5%', ...);
     it('should detect conflict when diff > 5%', ...);
   });
   ```

3. [ ] **Task 6.3**: Integration test - API endpoints
   ```typescript
   describe('GET /api/portfolios/[id]/cash/summary', () => {
     it('should filter by period', ...);
   });
   ```

4. [ ] **Task 6.4**: E2E manual test checklist
   - [ ] Para yatır → Bakiye güncellensin
   - [ ] Dönem değiştir → İstatistikler güncellensin
   - [ ] Forecast ekle → Takvimde görünsün
   - [ ] Grafik ileri tarihe uzasın

#### Deliverables
- [ ] Unit testler yazıldı ve geçiyor
- [ ] Integration testler geçiyor
- [ ] Manuel test checklist tamamlandı

---

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Yahoo Finance API unreliable | Yüksek | Orta | Manuel forecast özelliği ile kompanse |
| Conflict detection yanlış eşleşme | Orta | Yüksek | ±3 gün ve %5 tolerans ile sınırla |
| Grafik performance (çok veri) | Düşük | Orta | Veri aggregation, limit 365 gün |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| Supabase database | Düşük | Mevcut altyapı stabil |
| Recharts library | Düşük | Mevcut sürüm çalışıyor |
| Yahoo Finance API | Yüksek | Manuel kayıt ile bypass |

## Resource Requirements

### Development
- **Frontend**: 1 developer (mevcut)
- **Backend**: Same developer
- **Timeline**: 1-2 gün toplam

### Infrastructure
- Yeni migration dosyası
- Mevcut Supabase altyapısı yeterli

## Success Metrics

| Metrik | Hedef |
|--------|-------|
| Nakit bakiyesi doğruluğu | %100 |
| Dönem seçimi response time | < 500ms |
| Conflict resolution success | %95 |
| Grafik ileri tarih gösterimi | Çalışıyor |

## Rollout Plan

### Aşamalı Deployment
1. **Phase 1-2**: Kritik bug fix'ler (öncelik)
2. **Phase 3**: Grafik iyileştirmesi
3. **Phase 4**: Manuel forecast
4. **Phase 5**: Conflict management (en son)

### Monitoring
- Console.log'lar development'ta
- Supabase dashboard'da database izleme
- Browser DevTools Network tab

## Definition of Done

- [ ] Tüm 6 madde uygulandı
- [ ] Nakit bakiyesi doğru hesaplanıyor
- [ ] Dönem seçici çalışıyor
- [ ] Manuel forecast'lar takvimde görünüyor
- [ ] Conflict durumları çözülebiliyor
- [ ] Grafik ileri tarihli işlemleri gösteriyor
- [ ] Testler geçiyor

## Implementation Order (Önerilen)

```
Day 1:
├── Phase 1: Nakit Bakiyesi (1-2 saat)
├── Phase 2: Dönem Seçici (2-3 saat)
└── Phase 3: Grafik Tarih (1-2 saat)

Day 2:
├── Phase 4: Manuel Forecast (2-3 saat)
├── Phase 5: Conflict Management (3-4 saat)
└── Phase 6: Test & Polish (1-2 saat)

Total: ~12-16 saat
```

## Additional Notes

- Phase 5 (Conflict) en karmaşık kısım - dikkatli test edilmeli
- Yahoo Finance API'si unreliable, manuel kayıt öncelikli
- URL param sync (dönem için) nice-to-have, zorunlu değil
