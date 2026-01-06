# Specification: Nakit & Temettü Bug Fix ve Refactoring

<!-- FEATURE_DIR: 016-cash-dividend-bugfix-refactoring -->
<!-- FEATURE_ID: 016 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-05 -->

## Description

Nakit ve Temettü modülündeki mevcut hataların düzeltilmesi ve kullanıcı deneyiminin iyileştirilmesi. Bu çalışma 015-cash-dividend-enhancement üzerine inşa edilmiş özelliklerin sorunlarını giderir ve eksik fonksiyonları tamamlar.

## Problem Analizi

### Mevcut Sorunlar (Ekran Görüntüsünden):
1. **Mevcut Nakit**: Değer tutarsız görünüyor (₺0,00 veya yanlış hesaplama)
2. **Dönem Seçimi**: Hangi tarih aralığına göre hesaplandığı belirsiz, kullanıcı seçimi yok
3. **Dönem Temettü Tutarı**: ₺0,00 gösteriyor - dönem belirsiz ve hesaplama hatalı
4. **Temettü Takvimi**: "90 günde temettü beklenmiyor" mesajı - manuel kayıtlar görünmüyor
5. **Grafik Tarihi**: İleri tarihli işlemler grafikte gösterilmiyor

## Requirements

### Functional Requirements

#### 1. Nakit Bakiyesi Düzeltmesi
- [ ] Mevcut nakit bakiyesi `cash_positions.amount` tablosundan doğru çekilmeli
- [ ] Tüm nakit hareketleri (temettü, para yatırma/çekme, alış/satış) bakiyeye yansımalı
- [ ] Bakiye hesaplaması: `başlangıç + girişler - çıkışlar = güncel bakiye`

#### 2. Dönem Seçici Eklenmesi
- [ ] Kullanıcının tarih aralığı seçebileceği bir dropdown/picker eklenmeli
- [ ] Preset dönemler: Son 7 gün, Son 30 gün, Son 90 gün, Bu Ay, Bu Yıl, Özel Aralık
- [ ] Seçilen dönem tüm istatistikleri etkilemeli (temettü, nakit akışı, grafik)
- [ ] Varsayılan dönem: "Son 30 gün"

#### 3. Dönem Temettü Tutarı Düzeltmesi
- [ ] Seçilen dönem içindeki toplam temettü geliri hesaplanmalı
- [ ] `dividends` tablosundan `payment_date` aralığına göre SUM(net_amount) çekilmeli
- [ ] Dönem etiketi açıkça gösterilmeli (örn: "Son 30 Gün Temettü: ₺1.250,00")

#### 4. Temettü Takvimi Manuel Kayıt
- [ ] Kullanıcı gelecek tarihli temettü bekleyişi ekleyebilmeli
- [ ] Kayıt formu: Varlık, Beklenen Tarih, Tahmini Tutar (hisse başı veya toplam)
- [ ] Manuel kayıtlar `dividends` tablosunda `source: 'MANUAL_FORECAST'` ile işaretlenmeli
- [ ] Takvimde hem API verisi hem manuel kayıtlar görünmeli

#### 5. Temettü Merge/Conflict Yönetimi
- [ ] API'den gelen temettü ile manuel kayıt karşılaştırması:
  - Aynı varlık + aynı tarih (±3 gün tolerans) → Eşleşme kontrolü
  - Tutar farkı ≤ %5 → Otomatik merge (API değerini kullan)
  - Tutar farkı > %5 → Conflict göster, kullanıcı seçsin
- [ ] Conflict UI: "API: ₺100, Sizin: ₺120 - Hangisini kullanmak istersiniz?"
- [ ] Merge sonrası manuel kayıt `source: 'MERGED'` olarak güncellenmeli

#### 6. Grafik Tarih Aralığı İyileştirmesi
- [ ] İleri tarihli işlemler varsa grafik o tarihe kadar uzamalı
- [ ] X ekseni: min(bugün - dönem başı, en eski işlem) ile max(bugün, en ileri tarihli işlem)
- [ ] Filtrelerde seçilen dönem, görüntülenen tarih aralığını belirlemeli
- [ ] Gelecek tarihli işlemler farklı renk/stil ile gösterilmeli (kesik çizgi?)

### Non-Functional Requirements
- **Performance**: Sayfa yüklemesi < 2 saniye, dönem değişikliği < 500ms
- **UX**: Dönem seçici her zaman görünür, kolay erişilebilir konumda
- **Responsiveness**: Mobil cihazlarda da kullanılabilir dönem seçici

## Acceptance Criteria

### Nakit Bakiyesi
- [ ] Given bir kullanıcı 550.000 TL para yatırdığında, when nakit sayfasını açtığında, then mevcut nakit ₺550.000 gösterilmeli
- [ ] Given bir temettü kaydedildiğinde (net ₺0,71), when sayfa yenilendiğinde, then mevcut nakit ₺550.000,71 olmalı

### Dönem Seçici
- [ ] Given kullanıcı "Son 30 Gün" seçtiğinde, when istatistikler yüklendiğinde, then sadece son 30 günün verileri gösterilmeli
- [ ] Given kullanıcı "Bu Yıl" seçtiğinde, when temettü tutarı hesaplandığında, then 2026 yılı başından bugüne kadar olan toplam görünmeli

### Temettü Takvimi
- [ ] Given kullanıcı ENKAI için 16 Ocak 2026'da temettü beklediğini eklediğinde, when takvim görüntülendiğinde, then bu kayıt listede görünmeli
- [ ] Given API THYAO için 20 Ocak 2026 temettüsü döndürdüğünde ve kullanıcı da aynı tarihte kayıt eklediğinde, when tutarlar uyuşuyorsa, then tek kayıt gösterilmeli

### Conflict Çözümü
- [ ] Given API ₺100, manuel kayıt ₺150 olduğunda, when conflict tespit edildiğinde, then kullanıcıya seçenek sunulmalı
- [ ] Given kullanıcı API değerini seçtiğinde, when kayıt güncellendiğinde, then manuel kayıt merged olarak işaretlenmeli

### Grafik
- [ ] Given 16 Ocak 2026'da temettü bekleniyorsa, when bugün 5 Ocak ise, then grafik en az 16 Ocak'a kadar uzamalı
- [ ] Given ileri tarihli işlemler varsa, when grafikte gösterildiğinde, then farklı stil ile (kesik çizgi) gösterilmeli

## Technical Considerations

### Database Changes
```sql
-- Mevcut dividends tablosuna yeni source değeri eklenmeli
-- source ENUM güncelleme: 'MANUAL', 'YAHOO', 'MANUAL_FORECAST', 'MERGED'

-- Dividend forecasts için:
ALTER TYPE dividend_source ADD VALUE IF NOT EXISTS 'MANUAL_FORECAST';
ALTER TYPE dividend_source ADD VALUE IF NOT EXISTS 'MERGED';

-- Conflict tracking için yeni kolon (opsiyonel):
ALTER TABLE dividends ADD COLUMN IF NOT EXISTS merged_from_id UUID REFERENCES dividends(id);
```

### API Changes
- `GET /api/portfolios/[id]/cash/summary` → Dönem parametresi ekle
- `GET /api/dividends/calendar` → Manuel forecasts dahil et
- `POST /api/dividends/forecast` → Yeni endpoint: manuel beklenti ekle
- `PUT /api/dividends/[id]/resolve-conflict` → Conflict çözümü

### Component Changes
- `CashSummaryCards` → Dönem seçici prop'u ekle
- `CashFlowChart` → İleri tarih desteği, kesik çizgi stili
- `DividendCalendarView` → Merge/conflict UI
- `DividendDialog` → Forecast mode eklentisi

### State Management
- Dönem seçimi global state'de tutulmalı (context veya URL param)
- Conflict listesi local state'de yönetilmeli

## UI/UX Tasarım Notları

### Dönem Seçici Konumu
```
┌─────────────────────────────────────────────────┐
│ Nakit ve Temettü                                │
│ ┌─────────────────┐                             │
│ │ Son 30 Gün    ▼ │  [Nakit Ekle] [Temettü Ekle]│
│ └─────────────────┘                             │
├─────────────────────────────────────────────────┤
│ [Mevcut Nakit] [Dönem Geliri] [Beklenen Temettü]│
└─────────────────────────────────────────────────┘
```

### Conflict UI
```
┌─────────────────────────────────────────────────┐
│ ⚠️ Temettü Çakışması Tespit Edildi              │
│                                                 │
│ THYAO - 20 Ocak 2026                            │
│ ─────────────────────────────────────           │
│ 📊 API Verisi:    ₺2,50 × 1000 = ₺2.500        │
│ 📝 Sizin Kaydınız: ₺2,80 × 1000 = ₺2.800       │
│                                                 │
│ [API Verisini Kullan] [Kendi Kaydımı Kullan]   │
│                       [İptal]                   │
└─────────────────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests
- Dönem hesaplama fonksiyonları
- Merge logic (eşleşme, conflict tespiti)
- Nakit bakiyesi hesaplaması

### Integration Tests
- API endpoint'leri dönem parametresi ile
- Conflict resolution workflow

### E2E Tests
- Kullanıcı dönem seçer → istatistikler güncellenir
- Kullanıcı manuel forecast ekler → takvimde görünür
- Conflict çözümü flow'u

## Implementation Priority

1. **P0 - Kritik**: Nakit bakiyesi düzeltmesi (#1)
2. **P0 - Kritik**: Dönem seçici eklenmesi (#2, #3)
3. **P1 - Yüksek**: Grafik tarih aralığı (#6)
4. **P1 - Yüksek**: Temettü takvimi manuel kayıt (#4)
5. **P2 - Orta**: Merge/Conflict yönetimi (#5)

## Definition of Done

- [ ] Tüm 6 madde uygulandı
- [ ] Nakit bakiyesi doğru hesaplanıyor
- [ ] Dönem seçici çalışıyor ve tüm istatistikleri etkiliyor
- [ ] Manuel temettü forecast'ları takvimde görünüyor
- [ ] Conflict durumları kullanıcıya gösterilip çözülebiliyor
- [ ] Grafik ileri tarihli işlemleri gösteriyor
- [ ] Testler yazıldı ve geçiyor
- [ ] Code review tamamlandı

## Out of Scope

- Yahoo Finance API alternatifi arama (ayrı feature)
- Otomatik temettü tahmin algoritması (ayrı feature)
- Multi-currency temettü birleştirme (mevcut sistemde zaten var)

## Related Features

- **015-cash-dividend-enhancement**: Bu spec'in üzerine inşa ediyor
- **013-cash-dividends-performance**: Orijinal cash/dividend implementasyonu

## Additional Notes

- Yahoo Finance API'si unreliable, 401/rate limit hataları veriyor
- Manuel kayıt özelliği bu güvenilmezliği kompanse edecek
- Merge logic dikkatli tasarlanmalı - yanlış eşleşme kullanıcı deneyimini bozar
