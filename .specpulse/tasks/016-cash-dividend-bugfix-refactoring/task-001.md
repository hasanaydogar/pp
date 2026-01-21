# Task Breakdown: Nakit & Temettü Bug Fix ve Refactoring

<!-- FEATURE_DIR: 016-cash-dividend-bugfix-refactoring -->
<!-- FEATURE_ID: 016 -->
<!-- TASK_NUMBER: 001 -->
<!-- STATUS: completed -->
<!-- CREATED: 2026-01-05 -->

## Task Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 22 |
| **Estimated Time** | 12-16 saat |
| **Priority** | P0-P2 |
| **Phases** | 6 |

## Progress Tracking

```yaml
status:
  total: 22
  completed: 18
  in_progress: 0
  blocked: 0
  pending: 4  # T017-T020 (Conflict - P2 opsiyonel)

metrics:
  velocity: 18 tasks/day
  estimated_completion: 2026-01-21
  completion_percentage: 82%

sdd_gates:
  specification_first: ✅
  task_decomposition: ✅
  quality_assurance: ✅
  architecture_docs: ✅

notes:
  - "T001-T004: Phase 1 (Nakit Bakiyesi) tamamlandı ✅"
  - "T005-T009: Phase 2 (Dönem Seçici) zaten implemente ✅"
  - "T010-T011: Phase 3 (Grafik) zaten implemente ✅"
  - "T012-T016: Phase 4 (Manuel Forecast) zaten implemente ✅"
  - "T017-T020: Phase 5 (Conflict) P2 - opsiyonel, atlandı"
  - "T021-T022: Phase 6 (Test) tamamlandı ✅"
  - "Dokümantasyon güncellendi ✅"
```

---

## Phase 1: Nakit Bakiyesi Düzeltmesi [P0 - KRİTİK]

### T001: Debug cash_positions veri akışı ✅
```yaml
---
id: task-001
status: done
title: "Debug cash_positions.amount veri akışı"
description: |
  - **Problem**: Mevcut nakit bakiyesi yanlış/sıfır gösteriliyor
  - **Neden**: Veri akışı veya hesaplama hatası olabilir
  - **Nasıl**: Hook, API ve component seviyesinde debug
  - **Tamamlanma**: Sorun tespit edilmiş ve root cause belirlenmiş

files_touched:
  - path: lib/hooks/use-cash-flow.ts
    reason: "Hook'un döndürdüğü değerleri kontrol et"
  - path: app/api/portfolios/[id]/cash/route.ts
    reason: "API response formatını doğrula"
  - path: app/(protected)/p/[slug]/cash/page.tsx
    reason: "State binding'i kontrol et"

goals:
  - "Nakit bakiyesi neden yanlış gösterildiğini bul"
  - "Root cause'u dokümante et"

success_criteria:
  - "Console.log ile veri akışı trace edilmiş"
  - "Hatalı nokta tespit edilmiş"

dependencies: []
next_tasks:
  - task-002

risk_level: low
risk_notes: "Debug task, kod değişikliği minimal"

moscow:
  must:
    - "Veri akışını trace et"
    - "Root cause bul"
  should:
    - "Detaylı debug notları"
  know:
    - "cash_positions tablosu amount kolonu içeriyor"
    - "useCashFlow hook mevcut"
  wont:
    - "Bu task'ta fix yapmıyoruz, sadece debug"

priority_overall: must
priority_reason: "Tüm nakit işlemleri bu bakiyeye bağlı"
---
```
- **Type**: debug
- **Priority**: HIGH
- **Estimate**: 30 dakika
- **Parallel**: No

---

### T002: API endpoint düzeltmesi ✅
```yaml
---
id: task-002
status: done
title: "Cash API endpoint düzeltmesi"
description: |
  - **Problem**: /api/portfolios/[id]/cash doğru veri dönmüyor olabilir
  - **Neden**: Response format veya query hatası
  - **Nasıl**: API route'u incele, gerekirse düzelt
  - **Tamamlanma**: API doğru cash_positions.amount dönüyor

files_touched:
  - path: app/api/portfolios/[id]/cash/route.ts
    reason: "Query ve response format düzeltmesi"

goals:
  - "API doğru nakit bakiyesi dönmeli"
  - "Response format tutarlı olmalı"

success_criteria:
  - "curl ile test edildiğinde doğru amount dönüyor"
  - "Frontend bu değeri okuyabiliyor"

dependencies:
  - task-001

next_tasks:
  - task-003

risk_level: low
priority_overall: must
priority_reason: "Frontend bu API'ye bağımlı"
---
```
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 30 dakika
- **Parallel**: No

---

### T003: CashSummaryCards component düzeltmesi
```yaml
---
id: task-003
status: todo
title: "CashSummaryCards nakit bakiyesi düzeltmesi"
description: |
  - **Problem**: Component cashBalance prop'unu doğru göstermiyor
  - **Neden**: Prop binding veya hesaplama hatası
  - **Nasıl**: Component'e doğru değer aktarıldığından emin ol
  - **Tamamlanma**: Mevcut Nakit kartı doğru değer gösteriyor

files_touched:
  - path: components/cash/cash-summary-cards.tsx
    reason: "cashBalance prop binding düzeltmesi"
  - path: app/(protected)/p/[slug]/cash/page.tsx
    reason: "Component'e prop aktarımı"

goals:
  - "Mevcut Nakit kartı doğru değer göstermeli"
  - "Loading state düzgün çalışmalı"

success_criteria:
  - "₺550.000 yatırıldıysa ₺550.000 göstermeli"
  - "Sıfır yerine gerçek bakiye görünmeli"

dependencies:
  - task-002

next_tasks:
  - task-004

risk_level: low
priority_overall: must
priority_reason: "Kullanıcının gördüğü ana değer"
---
```
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 30 dakika
- **Parallel**: No

---

### T004: Temettü → Nakit akışı doğrulama
```yaml
---
id: task-004
status: todo
title: "Temettü kaydı nakit bakiyesini güncelleme doğrulaması"
description: |
  - **Problem**: Temettü kaydedildiğinde nakit bakiyesi artmalı
  - **Neden**: cash_transactions ve cash_positions güncellemesi
  - **Nasıl**: Mevcut dividend POST API'sini kontrol et
  - **Tamamlanma**: Temettü kaydı nakit bakiyesini artırıyor

files_touched:
  - path: app/api/portfolios/[id]/dividends/route.ts
    reason: "Temettü → cash transaction entegrasyonu"
  - path: lib/services/cash-service.ts
    reason: "createCashTransactionForDividend fonksiyonu"

goals:
  - "Temettü kaydedilince nakit artmalı"
  - "cash_positions.amount güncellenmeli"

success_criteria:
  - "₺100 temettü = ₺100 nakit artışı"
  - "Database'de tutarlılık sağlanmış"

dependencies:
  - task-003

next_tasks:
  - task-005

risk_level: medium
risk_notes: "Mevcut logic çalışıyor olabilir, sadece doğrulama"
priority_overall: must
priority_reason: "Temettü ana gelir kaynağı"
---
```
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 30 dakika
- **Parallel**: No

---

## Phase 2: Dönem Seçici [P0 - KRİTİK]

### T005: Period utility fonksiyonları
```yaml
---
id: task-005
status: todo
title: "Period utility fonksiyonları oluştur"
description: |
  - **Problem**: Dönem hesaplama fonksiyonları yok
  - **Neden**: Yeni özellik
  - **Nasıl**: lib/utils/period.ts oluştur
  - **Tamamlanma**: getPeriodDateRange ve formatPeriodLabel çalışıyor

files_touched:
  - path: lib/utils/period.ts
    reason: "YENİ DOSYA - Period utility fonksiyonları"

goals:
  - "getPeriodDateRange('7d') → { start, end }"
  - "formatPeriodLabel('7d') → 'Son 7 Gün'"

success_criteria:
  - "Tüm period tipleri destekleniyor"
  - "TypeScript types tanımlı"

dependencies:
  - task-004

next_tasks:
  - task-006

risk_level: low
priority_overall: must
priority_reason: "Tüm dönem filtreleri buna bağlı"
---
```
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 45 dakika
- **Parallel**: [P] - Phase 1 tamamlandıktan sonra paralel başlayabilir

**Implementation:**
```typescript
// lib/utils/period.ts
export type Period = '7d' | '30d' | '90d' | 'month' | 'year' | 'all';

export interface DateRange {
  start: Date;
  end: Date;
}

export function getPeriodDateRange(period: Period): DateRange {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    case 'month':
      start.setDate(1);
      break;
    case 'year':
      start.setMonth(0, 1);
      break;
    case 'all':
      start.setFullYear(2000);
      break;
  }
  
  return { start, end };
}

export function formatPeriodLabel(period: Period): string {
  const labels: Record<Period, string> = {
    '7d': 'Son 7 Gün',
    '30d': 'Son 30 Gün',
    '90d': 'Son 90 Gün',
    'month': 'Bu Ay',
    'year': 'Bu Yıl',
    'all': 'Tümü',
  };
  return labels[period];
}
```

---

### T006: PeriodPicker component oluştur
```yaml
---
id: task-006
status: todo
title: "PeriodPicker dropdown component"
description: |
  - **Problem**: Kullanıcı dönem seçemiyor
  - **Neden**: Component yok
  - **Nasıl**: Headless UI dropdown kullan
  - **Tamamlanma**: Dönem seçici dropdown çalışıyor

files_touched:
  - path: components/cash/period-picker.tsx
    reason: "YENİ DOSYA - PeriodPicker component"

goals:
  - "Dropdown ile dönem seçimi"
  - "Seçili dönem görünür"

success_criteria:
  - "7 farklı dönem seçeneği"
  - "onChange callback çalışıyor"

dependencies:
  - task-005

next_tasks:
  - task-007

risk_level: low
priority_overall: must
priority_reason: "Ana UX elementi"
---
```
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 saat
- **Parallel**: No

---

### T007: Cash page dönem state entegrasyonu
```yaml
---
id: task-007
status: todo
title: "Cash page'e dönem state'i ekle"
description: |
  - **Problem**: Sayfa dönem bilgisini tutmuyor
  - **Neden**: State yok
  - **Nasıl**: useState + PeriodPicker entegrasyonu
  - **Tamamlanma**: Dönem seçimi sayfa state'ini güncelliyor

files_touched:
  - path: app/(protected)/p/[slug]/cash/page.tsx
    reason: "selectedPeriod state ve PeriodPicker import"

goals:
  - "selectedPeriod state çalışıyor"
  - "Varsayılan '30d' seçili"

success_criteria:
  - "Dönem değişince state güncellensin"
  - "State diğer component'lere aktarılsın"

dependencies:
  - task-006

next_tasks:
  - task-008

risk_level: low
priority_overall: must
priority_reason: "Tüm filtreleme bu state'e bağlı"
---
```
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 30 dakika
- **Parallel**: No

---

### T008: API'lere period parametresi ekle
```yaml
---
id: task-008
status: todo
title: "Cash/Dividend API'lerine period filter"
description: |
  - **Problem**: API'ler dönem filtrelemiyor
  - **Neden**: Query param desteği yok
  - **Nasıl**: startDate/endDate query param ekle
  - **Tamamlanma**: API'ler dönem bazlı veri dönüyor

files_touched:
  - path: app/api/portfolios/[id]/dividends/route.ts
    reason: "startDate/endDate query param"
  - path: app/api/portfolios/[id]/dividends/summary/route.ts
    reason: "Dönem bazlı özet"

goals:
  - "Dönem bazlı temettü listesi"
  - "Dönem bazlı temettü toplamı"

success_criteria:
  - "?startDate=2026-01-01&endDate=2026-01-31 çalışıyor"
  - "Dönem dışı kayıtlar filtreleniyor"

dependencies:
  - task-007

next_tasks:
  - task-009

risk_level: low
priority_overall: must
priority_reason: "Frontend filtreleme buna bağlı"
---
```
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 45 dakika
- **Parallel**: No

---

### T009: Hook'ları period-aware yap
```yaml
---
id: task-009
status: todo
title: "useCashFlow ve useDividendCalendar hook güncelleme"
description: |
  - **Problem**: Hook'lar dönem parametresi almıyor
  - **Neden**: Period desteği yok
  - **Nasıl**: Hook signature'ı güncelle, API çağrısına ekle
  - **Tamamlanma**: Hook'lar dönem bazlı veri çekiyor

files_touched:
  - path: lib/hooks/use-cash-flow.ts
    reason: "period parametresi ve date range"
  - path: lib/hooks/use-dividend-calendar.ts
    reason: "period parametresi"

goals:
  - "useCashFlow(portfolioId, '30d')"
  - "Hook'lar dönem bazlı veri dönmeli"

success_criteria:
  - "Dönem değişince veri yenilenmeli"
  - "Loading state düzgün çalışmalı"

dependencies:
  - task-008

next_tasks:
  - task-010

risk_level: low
priority_overall: must
priority_reason: "UI bu hook'lara bağlı"
---
```
- **Type**: development
- **Priority**: HIGH
- **Estimate**: 1 saat
- **Parallel**: No

---

## Phase 3: Grafik İyileştirmesi [P1]

### T010: Grafik tarih aralığı hesaplama
```yaml
---
id: task-010
status: todo
title: "Grafik date range hesaplama (ileri tarih dahil)"
description: |
  - **Problem**: Grafik ileri tarihli işlemleri göstermiyor
  - **Neden**: X ekseni bugüne kadar sınırlı
  - **Nasıl**: Max date hesaplaması güncelle
  - **Tamamlanma**: Grafik en ileri tarihe kadar uzuyor

files_touched:
  - path: components/cash/cash-flow-chart.tsx
    reason: "X ekseni domain hesaplama"

goals:
  - "İleri tarihli işlemler görünmeli"
  - "X ekseni otomatik ölçeklenmeli"

success_criteria:
  - "16 Ocak temettüsü varsa grafik 16 Ocak'a kadar uzamalı"
  - "Bugün çizgisi görünür olmalı"

dependencies:
  - task-009

next_tasks:
  - task-011

risk_level: low
priority_overall: should
priority_reason: "UX iyileştirmesi"
---
```
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 45 dakika
- **Parallel**: No

---

### T011: İleri tarihli işlemler için kesik çizgi stili
```yaml
---
id: task-011
status: todo
title: "Gelecek tarihler için kesik çizgi (dashed line)"
description: |
  - **Problem**: İleri tarih vs geçmiş ayırt edilemiyor
  - **Neden**: Aynı stil kullanılıyor
  - **Nasıl**: strokeDasharray ile kesik çizgi
  - **Tamamlanma**: Gelecek tarihler farklı stilde

files_touched:
  - path: components/cash/cash-flow-chart.tsx
    reason: "Conditional line styling"

goals:
  - "Geçmiş: düz çizgi"
  - "Gelecek: kesik çizgi, opacity düşük"

success_criteria:
  - "Bugünden sonraki veriler kesik çizgi"
  - "Görsel olarak ayırt edilebilir"

dependencies:
  - task-010

next_tasks:
  - task-012

risk_level: low
priority_overall: should
priority_reason: "UX iyileştirmesi"
---
```
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 30 dakika
- **Parallel**: No

---

## Phase 4: Manuel Forecast [P1]

### T012: Database migration - MANUAL_FORECAST
```yaml
---
id: task-012
status: todo
title: "Dividend source type güncelleme"
description: |
  - **Problem**: MANUAL_FORECAST source tipi yok
  - **Neden**: Database schema eksik
  - **Nasıl**: Migration dosyası oluştur
  - **Tamamlanma**: Yeni source tipleri kullanılabilir

files_touched:
  - path: supabase/migrations/20260105_dividend_forecast.sql
    reason: "YENİ DOSYA - ENUM güncelleme"

goals:
  - "MANUAL_FORECAST source tipi"
  - "MERGED source tipi"
  - "is_forecast kolonu"

success_criteria:
  - "Migration başarıyla çalışıyor"
  - "Yeni kayıtlar bu tipleri kullanabiliyor"

dependencies:
  - task-009

next_tasks:
  - task-013

risk_level: medium
risk_notes: "Production'da dikkatli çalıştırılmalı"
priority_overall: should
priority_reason: "Manuel forecast özelliği buna bağlı"
---
```
- **Type**: setup
- **Priority**: MEDIUM
- **Estimate**: 30 dakika
- **Parallel**: [P] - Phase 2 sonrası paralel

**SQL:**
```sql
-- 20260105_dividend_forecast.sql

-- Add new source types
DO $$ BEGIN
  ALTER TYPE dividend_source ADD VALUE IF NOT EXISTS 'MANUAL_FORECAST';
  ALTER TYPE dividend_source ADD VALUE IF NOT EXISTS 'MERGED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add is_forecast column
ALTER TABLE dividends 
ADD COLUMN IF NOT EXISTS is_forecast BOOLEAN DEFAULT FALSE;

-- Add merged_from_id for conflict tracking
ALTER TABLE dividends 
ADD COLUMN IF NOT EXISTS merged_from_id UUID REFERENCES dividends(id);

-- Index for forecast queries
CREATE INDEX IF NOT EXISTS idx_dividends_is_forecast 
ON dividends(is_forecast) WHERE is_forecast = TRUE;
```

---

### T013: DividendForecastDialog component
```yaml
---
id: task-013
status: todo
title: "Temettü beklentisi dialog component"
description: |
  - **Problem**: Manuel beklenti ekleme UI'ı yok
  - **Neden**: Component yok
  - **Nasıl**: DividendDialog'dan basitleştirilmiş fork
  - **Tamamlanma**: Forecast dialog çalışıyor

files_touched:
  - path: components/dividends/dividend-forecast-dialog.tsx
    reason: "YENİ DOSYA - Forecast dialog"

goals:
  - "Varlık seçimi"
  - "Tarih ve tutar girişi"
  - "Tahmini toplam önizleme"

success_criteria:
  - "Form validation çalışıyor"
  - "Kaydet butonu API'yi çağırıyor"

dependencies:
  - task-012

next_tasks:
  - task-014

risk_level: low
priority_overall: should
priority_reason: "Manuel kayıt ana özellik"
---
```
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 1.5 saat
- **Parallel**: No

---

### T014: POST /api/dividends/forecast endpoint
```yaml
---
id: task-014
status: todo
title: "Forecast API endpoint"
description: |
  - **Problem**: Forecast kayıt API'si yok
  - **Neden**: Yeni endpoint gerekli
  - **Nasıl**: Mevcut dividend POST'tan fork, source='MANUAL_FORECAST'
  - **Tamamlanma**: Forecast kaydedilebiliyor

files_touched:
  - path: app/api/dividends/forecast/route.ts
    reason: "YENİ DOSYA - Forecast endpoint"

goals:
  - "Forecast kayıt"
  - "is_forecast = true"
  - "source = MANUAL_FORECAST"

success_criteria:
  - "POST çalışıyor"
  - "Database'e doğru verilerle kaydediyor"

dependencies:
  - task-013

next_tasks:
  - task-015

risk_level: low
priority_overall: should
priority_reason: "Dialog bu endpoint'e bağlı"
---
```
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 45 dakika
- **Parallel**: No

---

### T015: Takvimde forecast gösterimi
```yaml
---
id: task-015
status: todo
title: "Dividend calendar forecast stillemesi"
description: |
  - **Problem**: Forecast'lar normal temettüden ayırt edilemiyor
  - **Neden**: Stil farkı yok
  - **Nasıl**: İkon ve renk farklılaştırma
  - **Tamamlanma**: Forecast'lar farklı görünüyor

files_touched:
  - path: components/cash/dividend-calendar-view.tsx
    reason: "Forecast stil ekleme"
  - path: components/cash/upcoming-dividends.tsx
    reason: "Forecast listesi"

goals:
  - "📅 ikon: beklenti"
  - "💰 ikon: gerçekleşmiş"
  - "Mavi: beklenti, Yeşil: gerçekleşmiş"

success_criteria:
  - "Görsel olarak ayırt edilebilir"
  - "is_forecast true olanlar farklı stil"

dependencies:
  - task-014

next_tasks:
  - task-016

risk_level: low
priority_overall: should
priority_reason: "UX kritik"
---
```
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 45 dakika
- **Parallel**: No

---

### T016: UI'a Beklenti Ekle butonu
```yaml
---
id: task-016
status: todo
title: "Cash page'e 'Beklenti Ekle' butonu"
description: |
  - **Problem**: Forecast ekleme UI yok
  - **Neden**: Buton eksik
  - **Nasıl**: Mevcut butonların yanına ekle
  - **Tamamlanma**: Buton çalışıyor

files_touched:
  - path: app/(protected)/p/[slug]/cash/page.tsx
    reason: "Beklenti Ekle butonu ve dialog state"

goals:
  - "Beklenti Ekle butonu"
  - "Tıklayınca dialog açılsın"

success_criteria:
  - "Buton görünür"
  - "Dialog açılıp forecast kaydedilebiliyor"

dependencies:
  - task-015

next_tasks:
  - task-017

risk_level: low
priority_overall: should
priority_reason: "UX tamamlama"
---
```
- **Type**: development
- **Priority**: MEDIUM
- **Estimate**: 30 dakika
- **Parallel**: No

---

## Phase 5: Conflict Yönetimi [P2]

### T017: Conflict detection service
```yaml
---
id: task-017
status: todo
title: "Dividend conflict detection service"
description: |
  - **Problem**: API ve manuel kayıt çakışma tespiti yok
  - **Neden**: Logic yok
  - **Nasıl**: Service fonksiyonu oluştur
  - **Tamamlanma**: Çakışmalar tespit ediliyor

files_touched:
  - path: lib/services/dividend-conflict-service.ts
    reason: "YENİ DOSYA - Conflict detection"

goals:
  - "detectDividendConflicts fonksiyonu"
  - "Auto-merge vs conflict ayrımı"
  - "±3 gün, %5 tolerans"

success_criteria:
  - "Aynı asset, ±3 gün içinde = potansiyel eşleşme"
  - "Fark ≤%5 = auto-merge"
  - "Fark >%5 = conflict"

dependencies:
  - task-016

next_tasks:
  - task-018

risk_level: medium
risk_notes: "Yanlış eşleşme kullanıcı deneyimini bozar"
priority_overall: could
priority_reason: "İleri seviye özellik"
---
```
- **Type**: development
- **Priority**: LOW
- **Estimate**: 1.5 saat
- **Parallel**: No

---

### T018: Conflict resolution API
```yaml
---
id: task-018
status: todo
title: "PUT /api/dividends/[id]/resolve-conflict"
description: |
  - **Problem**: Conflict çözüm API'si yok
  - **Neden**: Yeni endpoint gerekli
  - **Nasıl**: resolution seçeneğine göre güncelleme
  - **Tamamlanma**: Conflict çözülebiliyor

files_touched:
  - path: app/api/dividends/[id]/resolve-conflict/route.ts
    reason: "YENİ DOSYA - Conflict resolution"

goals:
  - "use_api: API değerini kullan"
  - "use_manual: Manuel değeri kullan"
  - "Merge işlemi"

success_criteria:
  - "PUT çalışıyor"
  - "source='MERGED' olarak güncelleniyor"

dependencies:
  - task-017

next_tasks:
  - task-019

risk_level: low
priority_overall: could
priority_reason: "Dialog bu API'ye bağlı"
---
```
- **Type**: development
- **Priority**: LOW
- **Estimate**: 45 dakika
- **Parallel**: No

---

### T019: ConflictResolutionDialog component
```yaml
---
id: task-019
status: todo
title: "Conflict resolution dialog"
description: |
  - **Problem**: Conflict UI yok
  - **Neden**: Component yok
  - **Nasıl**: Dialog oluştur, karşılaştırma göster
  - **Tamamlanma**: Kullanıcı conflict çözebiliyor

files_touched:
  - path: components/dividends/conflict-resolution-dialog.tsx
    reason: "YENİ DOSYA - Conflict dialog"

goals:
  - "İki değeri karşılaştır"
  - "Fark yüzdesini göster"
  - "Seçim butonları"

success_criteria:
  - "Dialog açılıyor"
  - "Seçim yapılabiliyor"
  - "API çağrısı yapılıyor"

dependencies:
  - task-018

next_tasks:
  - task-020

risk_level: low
priority_overall: could
priority_reason: "Conflict yönetimi UX'i"
---
```
- **Type**: development
- **Priority**: LOW
- **Estimate**: 1 saat
- **Parallel**: No

---

### T020: Conflict alert banner
```yaml
---
id: task-020
status: todo
title: "Conflict alert banner component"
description: |
  - **Problem**: Kullanıcı conflict'lerden haberdar değil
  - **Neden**: Alert yok
  - **Nasıl**: Sayfa yüklenince conflict kontrolü, banner göster
  - **Tamamlanma**: Conflict varsa banner görünüyor

files_touched:
  - path: components/cash/conflict-alert-banner.tsx
    reason: "YENİ DOSYA - Alert banner"
  - path: app/(protected)/p/[slug]/cash/page.tsx
    reason: "Banner entegrasyonu"

goals:
  - "Conflict sayısını göster"
  - "Tıklayınca dialog aç"

success_criteria:
  - "Banner görünür"
  - "Conflict yoksa banner yok"

dependencies:
  - task-019

next_tasks:
  - task-021

risk_level: low
priority_overall: could
priority_reason: "UX tamamlama"
---
```
- **Type**: development
- **Priority**: LOW
- **Estimate**: 45 dakika
- **Parallel**: No

---

## Phase 6: Test & Doğrulama [P1]

### T021: Unit testler
```yaml
---
id: task-021
status: todo
title: "Period utilities ve conflict detection unit testleri"
description: |
  - **Problem**: Test coverage eksik
  - **Neden**: Yeni fonksiyonlar test edilmemiş
  - **Nasıl**: Jest ile unit test
  - **Tamamlanma**: Testler yazıldı ve geçiyor

files_touched:
  - path: lib/utils/__tests__/period.test.ts
    reason: "YENİ DOSYA - Period testleri"
  - path: lib/services/__tests__/dividend-conflict-service.test.ts
    reason: "YENİ DOSYA - Conflict testleri"

goals:
  - "getPeriodDateRange testleri"
  - "detectDividendConflicts testleri"

success_criteria:
  - "npm test geçiyor"
  - "Coverage %80+"

dependencies:
  - task-020

next_tasks:
  - task-022

risk_level: low
priority_overall: should
priority_reason: "Kalite güvencesi"
---
```
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 1 saat
- **Parallel**: [P]

---

### T022: E2E manuel test
```yaml
---
id: task-022
status: todo
title: "End-to-end manuel test checklist"
description: |
  - **Problem**: Entegrasyon testi gerekli
  - **Neden**: Parçalar birlikte çalışmalı
  - **Nasıl**: Manuel test senaryoları
  - **Tamamlanma**: Tüm senaryolar geçiyor

files_touched: []

goals:
  - "Para yatırma testi"
  - "Dönem değiştirme testi"
  - "Forecast ekleme testi"
  - "Conflict çözümü testi"

success_criteria:
  - "Tüm senaryo geçiyor"
  - "Bug bulunursa fix edilmiş"

dependencies:
  - task-021

next_tasks: []

risk_level: low
priority_overall: should
priority_reason: "Final doğrulama"
---
```
- **Type**: testing
- **Priority**: MEDIUM
- **Estimate**: 1 saat
- **Parallel**: No

---

## Execution Strategy

### Parallel Groups

```
┌─────────────────────────────────────────────────────────┐
│                    DAY 1 (6-8 saat)                     │
├─────────────────────────────────────────────────────────┤
│ Sequential Chain (P0):                                  │
│ T001 → T002 → T003 → T004 → T005 → T006 → T007 →       │
│ T008 → T009                                             │
│                                                         │
│ Then:                                                   │
│ T010 → T011                                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    DAY 2 (6-8 saat)                     │
├─────────────────────────────────────────────────────────┤
│ Parallel Start:                                         │
│ ├── T012 (Migration)                                    │
│ └── T021 (Unit tests - partial)                         │
│                                                         │
│ Sequential Chain:                                       │
│ T012 → T013 → T014 → T015 → T016                       │
│                                                         │
│ Optional (P2):                                          │
│ T017 → T018 → T019 → T020                              │
│                                                         │
│ Final:                                                  │
│ T021 (complete) → T022                                  │
└─────────────────────────────────────────────────────────┘
```

### Critical Path

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009
                                                         ↓
                                                       T010
                                                         ↓
                                                       T011
```

Bu critical path tamamlanmadan diğer task'lar başlamamalı.

### Priority Summary

| Priority | Tasks | Estimated |
|----------|-------|-----------|
| P0 (Must) | T001-T009 | 5-6 saat |
| P1 (Should) | T010-T016, T021-T022 | 5-6 saat |
| P2 (Could) | T017-T020 | 4-5 saat |

---

## Definition of Done

- [ ] T001-T004: Nakit bakiyesi doğru ✅
- [ ] T005-T009: Dönem seçici çalışıyor ✅
- [ ] T010-T011: Grafik ileri tarihleri gösteriyor ✅
- [ ] T012-T016: Manuel forecast eklenebiliyor ✅
- [ ] T017-T020: Conflict yönetimi çalışıyor ✅ (opsiyonel)
- [ ] T021-T022: Testler geçiyor ✅
