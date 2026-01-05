# Specification: Nakit Yönetimi, Temettü Takibi ve Performans Projeksiyonu

<!-- FEATURE_DIR: 013-cash-dividends-performance -->
<!-- FEATURE_ID: 013 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-03 -->

## Özet

Bu özellik, portföy bazlı nakit yönetimi (alımlarda kullanılacak nakit, aylık nakit eklemeleri), temettü takibi ve uzun vadeli performans projeksiyonu sağlayan 2 yeni menü komponenti içerir.

---

## 🎯 Hedefler

1. **Nakit Yönetimi**: Portföy bazlı nakit akışı takibi
2. **Temettü Takibi**: Varlık bazlı temettü gelirleri ve reinvest seçenekleri
3. **Performans Projeksiyonu**: 5, 10, 15, 20 yıllık getiri tahminleri
4. **Gelir Simülasyonu**: Aylık pasif gelir projeksiyonu

---

## 📋 Fonksiyonel Gereksinimler

### A. Nakit Yönetimi (Cash Management)

#### A1. Nakit Hareketleri
- [ ] **Nakit Ekleme**: Aylık düzenli veya tek seferlik nakit ekleme
- [ ] **Nakit Çekme**: Portföyden nakit çekimi
- [ ] **Transfer**: Portföyler arası nakit transferi
- [ ] **Otomatik Düşüm**: Varlık alımında otomatik nakit düşümü
- [ ] **Hareket Geçmişi**: Tüm nakit hareketlerinin listesi

#### A2. Nakit Akış Tipleri
```typescript
enum CashFlowType {
  DEPOSIT = 'DEPOSIT',           // Nakit yatırma
  WITHDRAWAL = 'WITHDRAWAL',     // Nakit çekme
  DIVIDEND = 'DIVIDEND',         // Temettü geliri
  INTEREST = 'INTEREST',         // Faiz geliri
  TRANSFER_IN = 'TRANSFER_IN',   // Transfer gelen
  TRANSFER_OUT = 'TRANSFER_OUT', // Transfer giden
  ASSET_PURCHASE = 'ASSET_PURCHASE', // Varlık alımı
  ASSET_SALE = 'ASSET_SALE',     // Varlık satışı
}
```

#### A3. Düzenli Yatırım Planı
- [ ] Aylık düzenli yatırım miktarı belirleme
- [ ] Hatırlatıcı/bildirim (opsiyonel)
- [ ] Hedef nakit seviyesi belirleme

### B. Temettü Takibi (Dividend Tracking)

#### B1. Temettü Kayıtları
- [ ] Varlık bazlı temettü kaydı ekleme
- [ ] Temettü tarihi ve tutarı
- [ ] Brüt/Net temettü ayrımı (stopaj)
- [ ] Temettü para birimi

#### B2. Temettü Özeti
- [ ] Toplam yıllık temettü geliri
- [ ] Aylık ortalama temettü
- [ ] Temettü verimi (yield) hesaplaması
- [ ] Varlık bazlı temettü dağılımı

#### B3. Temettü Stratejisi
- [ ] **Reinvest**: Temettüyü aynı varlığa yeniden yatır
- [ ] **Cash**: Nakit olarak tut
- [ ] **Custom**: Başka varlığa yatır

### C. Performans Projeksiyonu

#### C1. Büyüme Simülasyonu
- [ ] Mevcut portföy değeri baz alınarak projeksiyon
- [ ] Yıllık beklenen getiri oranı (kullanıcı tanımlı, varsayılan: %10)
- [ ] Aylık düzenli yatırım dahil
- [ ] Temettü reinvest dahil/hariç seçeneği

#### C2. Projeksiyon Periyotları
| Periyot | Gösterilecek Değerler |
|---------|----------------------|
| 1 Yıl | Tahmini değer, eklenen toplam |
| 5 Yıl | Tahmini değer, toplam getiri |
| 10 Yıl | Tahmini değer, aylık gelir |
| 15 Yıl | Tahmini değer, aylık gelir |
| 20 Yıl | Tahmini değer, aylık gelir |
| 25 Yıl | Tahmini değer, aylık gelir |

#### C3. Aylık Gelir Projeksiyonu
- [ ] "4% kuralı" ile aylık çekilebilir gelir
- [ ] Sadece temettü geliri projeksiyonu
- [ ] Hibrit (temettü + sermaye çekimi)

#### C4. Senaryo Analizi
- [ ] **İyimser**: +2% ek getiri
- [ ] **Baz**: Varsayılan getiri
- [ ] **Kötümser**: -2% getiri
- [ ] Enflasyon ayarlaması (opsiyonel)

---

## 🖥️ UI Komponentleri

### Menü 1: Nakit ve Temettü (`/p/[slug]/cash`)

```
┌─────────────────────────────────────────────────────────────┐
│  💰 Nakit ve Temettü                                        │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Nakit      │  │ Aylık      │  │ Yıllık     │            │
│  │ ₺125.000   │  │ Temettü    │  │ Temettü    │            │
│  │            │  │ ₺2.450     │  │ ₺29.400    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                             │
│  [Nakit Ekle] [Temettü Kaydet]                             │
│                                                             │
│  ── Son Nakit Hareketleri ──                               │
│  📅 03/01 | DEPOSIT    | +₺10.000 | Aylık yatırım          │
│  📅 02/01 | DIVIDEND   | +₺850    | THYAO temettü          │
│  📅 01/01 | PURCHASE   | -₺5.000  | GARAN alım             │
│                                                             │
│  ── Temettü Takvimi ──                                     │
│  🗓️ Ocak: ₺2.450 (THYAO, GARAN, TUPRS)                     │
│  🗓️ Şubat: ₺1.200 (SISE)                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Menü 2: Projeksiyon (`/p/[slug]/projection`)

```
┌─────────────────────────────────────────────────────────────┐
│  📈 Performans Projeksiyonu                                 │
├─────────────────────────────────────────────────────────────┤
│  Mevcut Değer: ₺10.329.501                                 │
│  Aylık Yatırım: ₺10.000                                    │
│  Beklenen Getiri: [  10  ]%                                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    📊 Büyüme Grafiği                 │  │
│  │                                         ___          │  │
│  │                                    ___/             │  │
│  │                               ___/                   │  │
│  │                          ___/                        │  │
│  │                     ___/                             │  │
│  │                ___/                                  │  │
│  │  ─────────────/                                      │  │
│  │  Şimdi   5Y      10Y      15Y      20Y     25Y       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ── Projeksiyon Tablosu ──                                 │
│  ┌─────────┬──────────────┬──────────────┬──────────────┐ │
│  │ Süre    │ Tahmini Değer│ Aylık Gelir* │ Toplam Yatırım│ │
│  ├─────────┼──────────────┼──────────────┼──────────────┤ │
│  │ 5 Yıl   │ ₺25.450.000  │ ₺84.833      │ ₺600.000     │ │
│  │ 10 Yıl  │ ₺52.800.000  │ ₺176.000     │ ₺1.200.000   │ │
│  │ 15 Yıl  │ ₺98.500.000  │ ₺328.333     │ ₺1.800.000   │ │
│  │ 20 Yıl  │ ₺175.000.000 │ ₺583.333     │ ₺2.400.000   │ │
│  └─────────┴──────────────┴──────────────┴──────────────┘ │
│  * %4 çekim oranı ile                                      │
│                                                             │
│  ── Senaryo Karşılaştırma ──                               │
│  🟢 İyimser (+12%): ₺210.000.000 (20Y)                     │
│  🟡 Baz (%10): ₺175.000.000 (20Y)                          │
│  🔴 Kötümser (%8): ₺145.000.000 (20Y)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Veritabanı Değişiklikleri

### Yeni Tablolar

#### `cash_transactions` (Mevcut - Güncelleme)
```sql
-- Mevcut tablo yeterli, tip eklentileri:
ALTER TYPE cash_transaction_type ADD VALUE IF NOT EXISTS 'DIVIDEND';
ALTER TYPE cash_transaction_type ADD VALUE IF NOT EXISTS 'INTEREST';
ALTER TYPE cash_transaction_type ADD VALUE IF NOT EXISTS 'TRANSFER_IN';
ALTER TYPE cash_transaction_type ADD VALUE IF NOT EXISTS 'TRANSFER_OUT';
ALTER TYPE cash_transaction_type ADD VALUE IF NOT EXISTS 'ASSET_PURCHASE';
ALTER TYPE cash_transaction_type ADD VALUE IF NOT EXISTS 'ASSET_SALE';
```

#### `dividends` (Yeni)
```sql
CREATE TABLE dividends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- Temettü Bilgileri
  gross_amount DECIMAL(18,4) NOT NULL,
  tax_amount DECIMAL(18,4) DEFAULT 0,
  net_amount DECIMAL(18,4) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  
  -- Tarihler
  ex_dividend_date DATE,
  payment_date DATE NOT NULL,
  
  -- Strateji
  reinvest_strategy VARCHAR(20) DEFAULT 'CASH', -- CASH, REINVEST, CUSTOM
  reinvested_to_asset_id UUID REFERENCES assets(id),
  
  -- Meta
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dividends_asset ON dividends(asset_id);
CREATE INDEX idx_dividends_portfolio ON dividends(portfolio_id);
CREATE INDEX idx_dividends_payment_date ON dividends(payment_date);
```

#### `portfolio_settings` (Yeni veya Güncelleme)
```sql
CREATE TABLE IF NOT EXISTS portfolio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL UNIQUE REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- Düzenli Yatırım
  monthly_investment DECIMAL(18,2) DEFAULT 0,
  investment_day_of_month INTEGER DEFAULT 1,
  
  -- Projeksiyon Ayarları
  expected_return_rate DECIMAL(5,4) DEFAULT 0.10, -- %10
  withdrawal_rate DECIMAL(5,4) DEFAULT 0.04, -- %4
  include_dividends_in_projection BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### Nakit
```
GET    /api/portfolios/[id]/cash/transactions   # Nakit hareketleri
POST   /api/portfolios/[id]/cash/transactions   # Yeni hareket ekle
GET    /api/portfolios/[id]/cash/summary        # Nakit özeti
```

### Temettü
```
GET    /api/portfolios/[id]/dividends           # Temettü listesi
POST   /api/portfolios/[id]/dividends           # Temettü kaydet
GET    /api/portfolios/[id]/dividends/summary   # Temettü özeti
GET    /api/assets/[id]/dividends               # Varlık temettüleri
```

### Projeksiyon
```
GET    /api/portfolios/[id]/projection          # Projeksiyon hesapla
PUT    /api/portfolios/[id]/settings            # Ayarları güncelle
GET    /api/portfolios/[id]/settings            # Ayarları getir
```

---

## 📐 Hesaplama Formülleri

### Bileşik Getiri (Compound Growth)
```
FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]

FV = Gelecek değer
PV = Mevcut değer
r = Aylık getiri oranı (yıllık / 12)
n = Ay sayısı
PMT = Aylık yatırım
```

### Aylık Çekilebilir Gelir
```
Aylık Gelir = (Portföy Değeri × Çekim Oranı) / 12
Varsayılan çekim oranı: %4 (4% rule)
```

### Temettü Verimi
```
Temettü Verimi = (Yıllık Temettü / Mevcut Değer) × 100
```

---

## ✅ Kabul Kriterleri

### Nakit Yönetimi
- [ ] Given kullanıcı nakit ekler, when işlem kaydedilir, then nakit bakiyesi güncellenir
- [ ] Given varlık alınır, when işlem tamamlanır, then nakit otomatik düşer
- [ ] Given hareket geçmişi görüntülenir, when sayfa yüklenir, then son 50 hareket listelenir

### Temettü
- [ ] Given temettü kaydedilir, when tutar girilir, then net tutar stopaj düşülerek hesaplanır
- [ ] Given reinvest seçilir, when temettü ödenir, then aynı varlıktan alım simüle edilir
- [ ] Given temettü özeti görüntülenir, when ay seçilir, then o aya ait temettüler listelenir

### Projeksiyon
- [ ] Given ayarlar değiştirilir, when projeksiyon hesaplanır, then yeni değerler gösterilir
- [ ] Given grafik görüntülenir, when periyot seçilir, then ilgili zaman aralığı gösterilir
- [ ] Given senaryo karşılaştırma aktif, when hesaplama yapılır, then 3 senaryo gösterilir

---

## 🎨 UI/UX Gereksinimleri

### Nakit ve Temettü Sayfası
- Summary kartları (Nakit, Aylık Temettü, Yıllık Temettü)
- Quick action butonları (Nakit Ekle, Temettü Kaydet)
- Hareket listesi (filtreleme, sıralama)
- Temettü takvimi görünümü

### Projeksiyon Sayfası
- Interaktif büyüme grafiği (Recharts veya Chart.js)
- Ayarlanabilir parametreler (slider veya input)
- Projeksiyon tablosu
- Senaryo toggle'ları

### Responsive
- Mobile: Tek kolon, collapse edilebilir bölümler
- Tablet: 2 kolon grid
- Desktop: Full layout

---

## 🔗 Bağımlılıklar

### Mevcut Komponentler
- `useCashPositions` hook (güncelleme gerekebilir)
- `formatCurrency` utility
- `Button`, `Table`, `Badge` UI komponentleri

### Yeni Bağımlılıklar
- Chart kütüphanesi: `recharts` veya `chart.js`
- Date picker: Mevcut veya yeni

---

## 📅 Tahmini Süre

| Faz | Süre |
|-----|------|
| Database & API | 3 saat |
| Nakit UI | 2 saat |
| Temettü UI | 2 saat |
| Projeksiyon Hesaplama | 2 saat |
| Projeksiyon UI + Grafik | 3 saat |
| Testing & Polish | 2 saat |
| **Toplam** | **14 saat** |

---

## Definition of Done

- [ ] Tüm veritabanı tabloları oluşturuldu
- [ ] API endpointleri çalışıyor
- [ ] Nakit yönetimi UI tamamlandı
- [ ] Temettü takibi UI tamamlandı
- [ ] Projeksiyon sayfası grafikli çalışıyor
- [ ] Responsive tasarım test edildi
- [ ] TypeScript hatasız
- [ ] Sidebar menüye eklendi

---

## Notlar

- İlk fazda basit projeksiyon, sonra gelişmiş senaryo analizi
- Temettü verisi manuel girilecek (API entegrasyonu ileride)
- Grafik için Recharts önerilir (Next.js uyumlu)
