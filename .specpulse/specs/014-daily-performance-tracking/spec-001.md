# Specification: Günlük Performans Takibi ve Hisse Bazlı Değişimler

<!-- FEATURE_DIR: 014-daily-performance-tracking -->
<!-- FEATURE_ID: 014 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-03 -->

## Özet

Bu özellik, portföy dashboard sayfasındaki varlık tablosuna hisse bazlı anlık değişim ve günlük kar/zarar bilgilerini ekler. Ayrıca portföyün gün gün performansını takip edebileceğimiz bir grafik alanı oluşturur.

---

## 🎯 Hedefler

1. **Hisse Bazlı Günlük Değişim**: Her varlık için günlük fiyat değişimi (%) ve tutar
2. **Hisse Bazlı Kar/Zarar**: Her varlık için günlük ne kadar artıda/eksideyiz
3. **Portföy Performans Grafiği**: Gün gün toplam portföy değeri değişimi
4. **Tarihsel Veri**: Günlük portföy değerlerinin kaydedilmesi

---

## 📋 Fonksiyonel Gereksinimler

### A. Hisse Bazlı Günlük Değişim (Asset Table Enhancement)

#### A1. Tablo Sütunları (Yeni)
| Sütun | Açıklama | Format |
|-------|----------|--------|
| Günlük Değişim (%) | Önceki kapanışa göre % değişim | +2.45% / -1.20% |
| Günlük Değişim (₺) | Pozisyon bazında günlük kar/zarar | +₺1.234 / -₺567 |
| Son Fiyat | Anlık fiyat | ₺42.50 |

#### A2. Değişim Hesaplama
```typescript
// Günlük Değişim Yüzdesi
dailyChangePercent = ((currentPrice - previousClose) / previousClose) * 100

// Günlük Değişim Tutarı (pozisyon bazında)
dailyChangeAmount = (currentPrice - previousClose) * quantity
```

#### A3. Renk Kodlaması
- **Yeşil**: Pozitif değişim (+)
- **Kırmızı**: Negatif değişim (-)
- **Gri**: Değişim yok (0)

### B. Portföy Performans Grafiği

#### B1. Grafik Türü
- **Line Chart** veya **Area Chart**
- X ekseni: Tarih (son 30 gün, 90 gün, 1 yıl seçenekleri)
- Y ekseni: Portföy toplam değeri

#### B2. Veri Noktaları
- Günlük kapanış değerleri
- Tooltip ile detaylı bilgi (tarih, değer, değişim)

#### B3. Zaman Aralığı Seçenekleri
| Periyot | Görüntülenen Veri |
|---------|-------------------|
| 1 Hafta | Son 7 gün |
| 1 Ay | Son 30 gün |
| 3 Ay | Son 90 gün |
| 1 Yıl | Son 365 gün |
| Tümü | Tüm tarihsel veri |

### C. Tarihsel Veri Yönetimi

#### C1. Günlük Snapshot
- Her gün sonunda portföy değerini kaydet
- Varlık bazlı kapanış fiyatlarını sakla

#### C2. Veri Yapısı
```typescript
interface PortfolioSnapshot {
  id: string;
  portfolio_id: string;
  date: string; // YYYY-MM-DD
  total_value: number;
  assets_value: number;
  cash_value: number;
  daily_change: number;
  daily_change_percent: number;
  created_at: string;
}

interface AssetPriceHistory {
  id: string;
  asset_id: string;
  date: string;
  open_price: number;
  close_price: number;
  high_price: number;
  low_price: number;
  created_at: string;
}
```

---

## 🖥️ UI Tasarımı

### Asset Table (Güncellenmiş)

```
┌──────────┬────────┬────────────┬───────────────┬───────────────┬─────────┐
│ Sembol   │ Adet   │ Mevcut Fiy.│ Günlük Değ.   │ Günlük K/Z    │ Ağırlık │
├──────────┼────────┼────────────┼───────────────┼───────────────┼─────────┤
│ THYAO    │ 1000   │ ₺245.50    │ 🟢 +2.45%     │ +₺5.850       │ 12.5%   │
│ GARAN    │ 500    │ ₺78.20     │ 🔴 -1.20%     │ -₺476         │ 8.2%    │
│ SISE     │ 2000   │ ₺42.80     │ 🟢 +0.85%     │ +₺720         │ 6.1%    │
└──────────┴────────┴────────────┴───────────────┴───────────────┴─────────┘
```

### Portföy Performans Kartı

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 Portföy Performansı                          [1H] [1A] [3A] [1Y]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ₺12.500.000 ─────────────────────────────●                            │
│                                      ●───●                              │
│  ₺12.000.000 ────────────────●───●                                     │
│                         ●───●                                           │
│  ₺11.500.000 ─────●────●                                               │
│              ●───●                                                      │
│  ₺11.000.000 ●                                                         │
│              ├───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┤    │
│             1/1  5/1  10/1 15/1 20/1 25/1 30/1                          │
│                                                                         │
│  Bugün: 🟢 +₺125.430 (+1.02%)    Bu Ay: 🟢 +₺1.250.000 (+10.5%)       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Veritabanı Değişiklikleri

### Yeni Tablolar

#### `portfolio_snapshots`
```sql
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  
  -- Değerler
  total_value DECIMAL(18,2) NOT NULL,
  assets_value DECIMAL(18,2) NOT NULL,
  cash_value DECIMAL(18,2) NOT NULL,
  
  -- Değişimler
  daily_change DECIMAL(18,2) DEFAULT 0,
  daily_change_percent DECIMAL(8,4) DEFAULT 0,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: bir portföy için günde bir snapshot
  UNIQUE(portfolio_id, snapshot_date)
);

CREATE INDEX idx_portfolio_snapshots_date ON portfolio_snapshots(portfolio_id, snapshot_date DESC);
```

#### `asset_price_history`
```sql
CREATE TABLE asset_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) NOT NULL,
  price_date DATE NOT NULL,
  
  -- Fiyatlar
  open_price DECIMAL(18,4),
  close_price DECIMAL(18,4) NOT NULL,
  high_price DECIMAL(18,4),
  low_price DECIMAL(18,4),
  previous_close DECIMAL(18,4),
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(symbol, price_date)
);

CREATE INDEX idx_asset_price_history ON asset_price_history(symbol, price_date DESC);
```

---

## 🔌 API Endpoints

### Fiyat API (Mevcut Genişletme)
```
GET /api/prices/[symbol]
Response: {
  symbol: string,
  price: number,
  change: number,         // Günlük değişim tutarı
  changePercent: number,  // Günlük değişim yüzdesi
  previousClose: number,  // Önceki kapanış
  timestamp: string
}
```

### Snapshot API (Yeni)
```
GET  /api/portfolios/[id]/snapshots              # Tarihsel snapshot'lar
POST /api/portfolios/[id]/snapshots              # Manuel snapshot oluştur
GET  /api/portfolios/[id]/snapshots/today        # Bugünkü snapshot
```

### Performance API (Yeni)
```
GET /api/portfolios/[id]/performance
Query: period=7d|30d|90d|365d|all
Response: {
  snapshots: PortfolioSnapshot[],
  summary: {
    startValue: number,
    endValue: number,
    totalChange: number,
    totalChangePercent: number,
    bestDay: { date, change },
    worstDay: { date, change }
  }
}
```

---

## 📐 Hesaplama Formülleri

### Günlük Hisse Değişimi
```
Değişim % = ((Güncel Fiyat - Önceki Kapanış) / Önceki Kapanış) × 100
Değişim ₺ = (Güncel Fiyat - Önceki Kapanış) × Adet
```

### Portföy Günlük Değişimi
```
Toplam Günlük Değişim = Σ (Her hisse için Değişim ₺)
Toplam Günlük % = (Bugünkü Değer - Dünkü Değer) / Dünkü Değer × 100
```

---

## ✅ Kabul Kriterleri

### Hisse Tablosu
- [ ] Given bir hisse görüntülendiğinde, when fiyat değiştiğinde, then günlük değişim % görünür
- [ ] Given pozitif değişim olduğunda, when tablo render edildiğinde, then yeşil renk kullanılır
- [ ] Given negatif değişim olduğunda, when tablo render edildiğinde, then kırmızı renk kullanılır

### Performans Grafiği
- [ ] Given dashboard yüklendiğinde, when portföy verisi alındığında, then son 30 günlük grafik görünür
- [ ] Given periyot değiştirildiğinde, when kullanıcı 3A seçerse, then 90 günlük veri gösterilir
- [ ] Given grafiğe hover yapıldığında, when bir noktaya gelindiğinde, then tooltip ile detay görünür

### Snapshot
- [ ] Given gün sonu olduğunda, when snapshot alındığında, then portföy değeri kaydedilir
- [ ] Given tarihsel veri istendiğinde, when API çağrıldığında, then snapshot listesi döner

---

## 🎨 UI/UX Gereksinimleri

### Tablo Değişimleri
- Yeni sütunlar mevcut tabloya eklenmeli (responsive)
- Değişim renkleri açık/koyu mod uyumlu
- Tooltip ile ek detay (önceki kapanış, değişim zamanı)

### Performans Grafiği
- Recharts kullanılmalı (mevcut)
- Responsive tasarım
- Loading state için skeleton
- Zoom/pan özelliği (opsiyonel)

### Mobil
- Tablo yatay scroll
- Grafik küçük ekranda basitleştirilmiş

---

## 🔗 Bağımlılıklar

### Mevcut
- `useLivePrices` hook (fiyat verisi)
- `recharts` (grafik)
- `formatCurrency` utility

### Yeni Gereksinimler
- Fiyat API'den `previousClose` desteği
- Cron job veya scheduled function (günlük snapshot)

---

## 📅 Tahmini Süre

| Faz | Süre |
|-----|------|
| Database & Types | 1 saat |
| API Endpoints | 2 saat |
| Asset Table Enhancement | 2 saat |
| Performance Chart | 3 saat |
| Snapshot Logic | 2 saat |
| Testing & Polish | 2 saat |
| **Toplam** | **12 saat** |

---

## Definition of Done

- [ ] Asset tablosuna günlük değişim sütunları eklendi
- [ ] Renk kodlaması çalışıyor (yeşil/kırmızı)
- [ ] Performans grafiği görüntüleniyor
- [ ] Periyot seçimi çalışıyor (1H, 1A, 3A, 1Y)
- [ ] Snapshot tablosu oluşturuldu
- [ ] API'ler çalışıyor
- [ ] TypeScript hatasız
- [ ] Responsive tasarım

---

## Notlar

- İlk aşamada snapshot manuel veya sayfa yüklendiğinde alınabilir
- İleride cron job ile otomatik günlük snapshot
- Fiyat verisi API'den gelecek (Yahoo Finance, vb.)
- Borsa kapalıyken önceki kapanış kullanılacak
