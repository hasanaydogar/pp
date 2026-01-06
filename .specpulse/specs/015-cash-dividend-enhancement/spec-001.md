# Specification: Nakit ve Temettü Modülü Geliştirmesi

<!-- FEATURE_DIR: 015-cash-dividend-enhancement -->
<!-- FEATURE_ID: 015 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-03 -->

## Description

Nakit ve Temettü modülünün kapsamlı geliştirmesi. Portföydeki hisseler için Yahoo Finance'den temettü takvimi çekilerek görselleştirilecek, otomatik temettü kaydı yapılacak, nakit kasası ile hisse alım/satım işlemleri entegre edilecek.

### Ana Hedefler:
1. **Temettü Takvimi**: yfinance'den portföydeki hisselerin temettü tarihlerini çek ve göster
2. **Net Temettü Hesaplama**: Hisse adedi × temettü = Net gelecek temettü değeri
3. **Otomatik Temettü Kaydı**: Temettü tarihi geldiğinde portföyde hisse varsa otomatik kayıt
4. **Nakit Kasası Entegrasyonu**: Alım → nakit düş, satım → nakit ekle
5. **Detaylı Nakit Akış Takvimi**: Günlük nakit durumu, kategoriler, işlem detayları

## Requirements

### Functional Requirements

#### FR-1: Temettü Takvimi (Yahoo Finance Entegrasyonu)
- [ ] FR-1.1: Portföydeki her hisse için Yahoo Finance'den temettü takvimi çek
- [ ] FR-1.2: Ex-Dividend Date (Temettü Hakediş Tarihi) göster
- [ ] FR-1.3: Payment Date (Ödeme Tarihi) göster
- [ ] FR-1.4: Temettü miktarı (per share) göster
- [ ] FR-1.5: Portföydeki hisse adedi ile çarparak toplam beklenen temettü hesapla
- [ ] FR-1.6: Aylık/yıllık beklenen temettü özeti göster
- [ ] FR-1.7: Temettü takvimini takvim formatında görselleştir

#### FR-2: Otomatik Temettü Kaydı
- [ ] FR-2.1: Temettü tarihi geldiğinde sistem otomatik kontrol yapsın
- [ ] FR-2.2: Portföyde hisse varsa dividend kaydı oluştur
- [ ] FR-2.3: Brüt/net temettü hesapla (vergi kesintisi)
- [ ] FR-2.4: Nakit kasasına otomatik ekle
- [ ] FR-2.5: Kullanıcıya bildirim göster (opsiyonel)
- [ ] FR-2.6: Manuel override imkanı (otomatik kaydı düzelt/sil)

#### FR-3: Nakit Kasası - Hisse Entegrasyonu
- [ ] FR-3.1: Hisse alımında nakit kasasından otomatik düş
- [ ] FR-3.2: Hisse satışında nakit kasasına otomatik ekle
- [ ] FR-3.3: Yetersiz nakit kontrolü (uyarı ver ama engelleme)
- [ ] FR-3.4: İşlem geçmişinde nakit hareketi göster
- [ ] FR-3.5: Nakit pozisyonu negatife düşebilir (margin/kredi)

#### FR-4: Nakit Akış Takvimi
- [ ] FR-4.1: Günlük nakit durumu grafiği (line/area chart)
- [ ] FR-4.2: Kategorilere göre filtreleme (Temettü, Alış, Satış, Deposit, Withdraw)
- [ ] FR-4.3: Tarih bazlı detaylı liste
- [ ] FR-4.4: Hangi hisseye alım/satım yapıldı göster
- [ ] FR-4.5: Aylık/haftalık özet istatistikler
- [ ] FR-4.6: Running balance (kümülatif bakiye) göster
- [ ] FR-4.7: Gelecek temettü tarihlerini takvimde işaretle

#### FR-5: Temettü Takvimi UI
- [ ] FR-5.1: Aylık takvim görünümü
- [ ] FR-5.2: Liste görünümü (upcoming dividends)
- [ ] FR-5.3: Hisse bazlı gruplama
- [ ] FR-5.4: Tarih bazlı gruplama
- [ ] FR-5.5: Toplam beklenen gelir kartı

### Non-Functional Requirements
- **Performance**: Temettü verisi 5 dakika cache'lenmeli
- **Security**: Sadece kullanıcının kendi portföy verileri erişilebilir (RLS)
- **Scalability**: 100+ hisse için performanslı çalışmalı
- **UX**: Otomatik kayıtlar kullanıcıyı rahatsız etmemeli

## Acceptance Criteria

### Temettü Takvimi
- [ ] Given kullanıcı Nakit & Temettü sayfasına gittiğinde, when portföyde hisse varsa, then her hisse için upcoming dividends listesi görünür
- [ ] Given THYAO hissesi portföyde 100 adet varken, when temettü takvimi görüntülendiğinde, then 100 × temettü tutarı = beklenen toplam görünür
- [ ] Given bir hissenin ex-dividend tarihi bugün veya geçmişse, then otomatik olarak dividend kaydı oluşturulmuş olmalı

### Nakit Entegrasyonu
- [ ] Given nakit kasasında 10.000₺ varken, when 5.000₺ değerinde hisse alındığında, then nakit kasası 5.000₺ olmalı
- [ ] Given nakit kasasında 5.000₺ varken, when 3.000₺ değerinde hisse satıldığında, then nakit kasası 8.000₺ olmalı
- [ ] Given bir işlem yapıldığında, when nakit akış takvimi görüntülendiğinde, then işlem kategorisiyle birlikte görünür

### Nakit Akış Grafiği
- [ ] Given kullanıcı nakit takvimini görüntülediğinde, when son 30 gün seçildiğinde, then günlük bakiye değişimi grafikte görünür
- [ ] Given grafikte bir güne tıklandığında, then o günün tüm işlemleri detaylı listelenir

## Technical Considerations

### Dependencies

#### External APIs
- **Yahoo Finance**: Temettü takvimi için `calendar` endpoint
  - `/v8/finance/chart/{symbol}?events=div` veya
  - `/v10/finance/quoteSummary/{symbol}?modules=calendarEvents`

#### Database Changes
- `dividends` tablosu zaten var, ek alan gerekebilir:
  - `source: 'MANUAL' | 'AUTO'` - Kaydın kaynağı
  - `ex_dividend_date` - Temettü hakediş tarihi
  - `yahoo_event_id` - Yahoo'dan gelen event ID (duplicate önleme)

- `cash_transactions` tablosuna ek alanlar:
  - `related_transaction_id` - Bağlı asset transaction ID
  - `related_asset_id` - İlgili hisse

#### Third-party Libraries
- Mevcut: `recharts` (grafikler için)
- Yeni: Gerek yok, Yahoo Finance REST API kullanılacak

### Implementation Notes

1. **Yahoo Finance Dividend API**:
   ```
   GET https://query1.finance.yahoo.com/v10/finance/quoteSummary/{symbol}?modules=calendarEvents,summaryDetail
   ```
   Response içerir:
   - `calendarEvents.dividendDate` - Sonraki temettü tarihi
   - `calendarEvents.exDividendDate` - Ex-dividend tarihi
   - `summaryDetail.dividendRate` - Yıllık temettü
   - `summaryDetail.dividendYield` - Temettü verimi

2. **Otomatik Temettü Kaydı**:
   - Sayfa yüklendiğinde check edilebilir
   - Veya cron job ile (Supabase Edge Functions)
   - İlk aşamada sayfa yüklemesi yeterli

3. **Nakit-Transaction Entegrasyonu**:
   - `transactions` tablosuna INSERT hook → `cash_transactions` INSERT
   - Supabase trigger veya API seviyesinde

4. **BIST Hisseler için Temettü**:
   - THYAO.IS formatı kullan
   - Türkiye temettüleri genelde yıllık (Mart-Haziran)

## UI/UX Design

### Nakit & Temettü Sayfası Yapısı

```
┌─────────────────────────────────────────────────────────────┐
│ Nakit & Temettü                                    [Refresh]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │Nakit     │ │Aylık     │ │Yıllık    │ │Beklenen  │        │
│ │Bakiye    │ │Temettü   │ │Temettü   │ │Temettü   │        │
│ │₺125.000  │ │₺3.500    │ │₺42.000   │ │₺8.200    │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Nakit Akış Grafiği                    [1H][1A][3A][1Y] ││
│ │  ▲                                                      ││
│ │  │    ╱╲      ╱╲                                        ││
│ │  │   ╱  ╲    ╱  ╲    ╱╲                                 ││
│ │  │  ╱    ╲──╱    ╲──╱  ╲                                ││
│ │  └──────────────────────────────────────────▶           ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌───────────────────────┐ ┌───────────────────────────────┐│
│ │ Yaklaşan Temettüler   │ │ Nakit Hareketleri             ││
│ ├───────────────────────┤ ├───────────────────────────────┤│
│ │ 15 Oca - THYAO       ─│ │ 5 Oca  +₺3.500 Temettü GARAN ││
│ │ ₺1.25/hisse × 100    ─│ │ 4 Oca  -₺12.000 Alış SISE    ││
│ │ = ₺125 bekleniyor    ─│ │ 3 Oca  +₺8.000 Satış TUPRS   ││
│ │                       │ │ 2 Oca  +₺5.000 Deposit       ││
│ │ 22 Oca - GARAN       ─│ │ ...                          ││
│ │ ₺0.85/hisse × 200    ─│ │                               ││
│ │ = ₺170 bekleniyor    ─│ │ [Tümünü Gör]                  ││
│ └───────────────────────┘ └───────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Temettü Takvimi (Ocak 2026)                             ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Pzt  Sal  Çar  Per  Cum  Cmt  Paz                       ││
│ │           1    2    3    4    5                         ││
│ │ 6    7    8    9   10   11   12                         ││
│ │ 13  14  [15]  16   17   18   19   ← THYAO               ││
│ │ 20   21 [22]  23   24   25   26   ← GARAN               ││
│ │ 27   28   29   30   31                                  ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Testing Strategy

- **Unit Tests**: 
  - Temettü hesaplama fonksiyonları
  - Nakit bakiye hesaplamaları
  - Yahoo Finance response parsing

- **Integration Tests**: 
  - Hisse alım → nakit düşme
  - Hisse satım → nakit ekleme
  - Temettü kaydı → nakit ekleme

- **End-to-End Tests**: 
  - Temettü takvimi görüntüleme
  - Nakit akış grafiği etkileşimleri

## Definition of Done

- [ ] Yahoo Finance'den temettü takvimi çekiliyor
- [ ] Portföydeki hisse adedi ile beklenen temettü hesaplanıyor
- [ ] Temettü tarihi gelince otomatik kayıt oluşuyor
- [ ] Hisse alımında nakit düşüyor
- [ ] Hisse satışında nakit ekleniyor
- [ ] Nakit akış grafiği çalışıyor
- [ ] Nakit hareketleri kategorilere göre listeleniyor
- [ ] Temettü takvimi takvim formatında gösteriliyor
- [ ] TypeScript hatasız
- [ ] Mobile responsive

## Estimated Duration

- **Phase 1**: Temettü API & Takvim UI (4 saat)
- **Phase 2**: Otomatik Temettü Kaydı (2 saat)
- **Phase 3**: Nakit-Transaction Entegrasyonu (3 saat)
- **Phase 4**: Nakit Akış Grafiği (3 saat)
- **Phase 5**: Test & Polish (2 saat)

**Toplam**: ~14 saat

## Additional Notes

- İlk aşamada otomatik temettü kaydı sayfa yüklemesinde yapılacak
- İleride Supabase Edge Functions ile cron job eklenebilir
- BIST temettü verileri Yahoo'da sınırlı olabilir, fallback plan gerekebilir
- Vergi kesintisi default %10 (configurable)
