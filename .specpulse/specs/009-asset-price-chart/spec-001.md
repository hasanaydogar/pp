# Specification: Asset Price Chart with Lightweight Charts

## Feature ID: 009-asset-price-chart
## Version: 1.0
## Status: DRAFT

---

## 1. Overview

### 1.1 Summary
Asset detay sayfasına TradingView Lightweight Charts kütüphanesi kullanılarak profesyonel düzeyde interaktif fiyat grafiği eklenmesi.

### 1.2 Goals
- Yahoo Finance'den geçmiş fiyat verisi çekme
- Candlestick (mum) grafiği gösterimi
- Volume (hacim) barları
- Moving Average (hareketli ortalama) göstergeleri
- Zaman aralığı seçimi (1G, 1H, 1A, 3A, 5Y, MAX)
- Dark/Light mode desteği
- Responsive tasarım

### 1.3 Non-Goals
- RSI, MACD, Bollinger Bands gibi advanced indicators (ileride eklenebilir)
- Real-time streaming (5 dakika cache ile çalışacak)
- Çoklu hisse karşılaştırma

---

## 2. Technical Specification

### 2.1 Dependencies
```json
{
  "lightweight-charts": "^4.2.0"
}
```

### 2.2 Data Source
Yahoo Finance API ile geçmiş veri:
```
GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
  ?interval={interval}
  &range={range}
```

**Interval Options:**
- `1d` - günlük (1H, 1A, 3A, 5Y, MAX için)
- `1h` - saatlik (1G için)
- `5m` - 5 dakikalık (intraday için)

**Range Options:**
- `1d` - 1 gün
- `1wk` - 1 hafta  
- `1mo` - 1 ay
- `3mo` - 3 ay
- `1y` - 1 yıl
- `5y` - 5 yıl
- `max` - tüm geçmiş

### 2.3 Data Structure

```typescript
// Yahoo Finance Response
interface YahooChartData {
  timestamp: number[];
  indicators: {
    quote: [{
      open: number[];
      high: number[];
      low: number[];
      close: number[];
      volume: number[];
    }];
  };
}

// Transformed for Lightweight Charts
interface CandlestickData {
  time: string; // 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
}

interface VolumeData {
  time: string;
  value: number;
  color: string; // green/red based on close vs open
}
```

### 2.4 Chart Features

| Feature | Description |
|---------|-------------|
| **Candlestick Chart** | OHLC mum grafiği - yeşil (yükseliş), kırmızı (düşüş) |
| **Volume Histogram** | Alt panelde hacim barları |
| **SMA 20** | 20 günlük basit hareketli ortalama (mavi çizgi) |
| **SMA 50** | 50 günlük basit hareketli ortalama (turuncu çizgi) |
| **EMA 12** | 12 günlük üssel hareketli ortalama (mor çizgi, opsiyonel) |
| **Crosshair** | Mouse takibi ile fiyat/tarih gösterimi |
| **Tooltip** | Hover'da OHLCV detayları |
| **Time Scale** | Zaman aralığı zoom/pan |
| **Price Scale** | Fiyat ölçeği auto-fit |

### 2.5 UI Components

```
┌─────────────────────────────────────────────────────────────────┐
│  Price Chart                        [1G] [1H] [1A] [3A] [5Y] [MAX] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌───┐                                        │
│              ┌─┐   │   │  ┌─┐                                   │
│         ┌─┐  │ │ ┌─┤   ├──┤ │                                   │
│    ─────────SMA20─────────────────────                          │
│  ───────────────SMA50───────────────────                        │
│    ┌─┐  │ │  │ │ │ │   │  │ │  ┌─┐                              │
│    │ │  └─┘  └─┘ └─┘   └──┘ └──┤ │                              │
│    └─┘                         └─┘                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ▐█▌ ▐██▌  ▐█▌ ▐███▌ ▐██▌  ▐█▌ ▐██▌  ▐█▌  <- Volume bars        │
└─────────────────────────────────────────────────────────────────┘
   Jan  Feb   Mar  Apr   May  Jun  Jul  Aug
```

### 2.6 Time Range Selector

| Button | Yahoo Range | Yahoo Interval | Description |
|--------|-------------|----------------|-------------|
| 1G | 1d | 5m | Son 1 gün (5 dakikalık) |
| 1H | 1wk | 1h | Son 1 hafta (saatlik) |
| 1A | 1mo | 1d | Son 1 ay (günlük) |
| 3A | 3mo | 1d | Son 3 ay (günlük) |
| 1Y | 1y | 1d | Son 1 yıl (günlük) |
| 5Y | 5y | 1wk | Son 5 yıl (haftalık) |
| MAX | max | 1mo | Tüm geçmiş (aylık) |

---

## 3. Implementation Details

### 3.1 File Structure
```
lib/
  services/
    chart-data-service.ts     # Yahoo Finance historical data
  types/
    chart.ts                   # Chart data types
  utils/
    chart-utils.ts            # SMA/EMA calculations

components/
  charts/
    price-chart.tsx           # Main chart component
    chart-controls.tsx        # Time range buttons
    
app/api/
  chart/
    [symbol]/
      route.ts                # Chart data API endpoint
```

### 3.2 API Endpoint

```typescript
// GET /api/chart/[symbol]?range=1mo&interval=1d&currency=TRY
{
  success: true,
  data: {
    symbol: "THYAO.IS",
    candles: CandlestickData[],
    volume: VolumeData[],
    sma20: LineData[],
    sma50: LineData[],
    meta: {
      currency: "TRY",
      exchangeName: "IST",
      regularMarketPrice: 215.50,
      previousClose: 221.20
    }
  }
}
```

### 3.3 Chart Component Props

```typescript
interface PriceChartProps {
  symbol: string;
  currency: string;
  height?: number;        // default: 400
  showVolume?: boolean;   // default: true
  showSMA20?: boolean;    // default: true
  showSMA50?: boolean;    // default: true
  defaultRange?: TimeRange; // default: '1A'
}
```

### 3.4 Dark Mode Support

```typescript
const darkTheme = {
  layout: {
    background: { color: '#18181b' },
    textColor: '#a1a1aa',
  },
  grid: {
    vertLines: { color: '#27272a' },
    horzLines: { color: '#27272a' },
  },
};

const lightTheme = {
  layout: {
    background: { color: '#ffffff' },
    textColor: '#71717a',
  },
  grid: {
    vertLines: { color: '#f4f4f5' },
    horzLines: { color: '#f4f4f5' },
  },
};
```

---

## 4. Acceptance Criteria

### 4.1 Functional
- [ ] Candlestick grafiği doğru OHLC değerleri göstermeli
- [ ] Volume barları yeşil/kırmızı renklenmeli
- [ ] SMA 20/50 çizgileri smooth olmalı
- [ ] Tüm time range butonları çalışmalı
- [ ] Crosshair tooltip'te tarih ve fiyat görünmeli
- [ ] Mouse wheel ile zoom yapılabilmeli
- [ ] Drag ile pan yapılabilmeli

### 4.2 Non-Functional
- [ ] Grafik 2 saniye içinde yüklenmeli
- [ ] Mobile responsive olmalı (min-width: 320px)
- [ ] Dark/Light mode otomatik geçiş
- [ ] Veri yoksa graceful error state

---

## 5. Estimates

| Task | Time |
|------|------|
| Chart types & utils | 30 min |
| Chart data service | 45 min |
| API endpoint | 30 min |
| PriceChart component | 60 min |
| ChartControls component | 20 min |
| Asset page integration | 20 min |
| Styling & polish | 30 min |
| Testing | 30 min |
| **Total** | **~4-5 hours** |

---

## 6. Dependencies

- Mevcut `symbol-mapper.ts` kullanılacak
- Mevcut `price-service.ts` cache mekanizması referans alınacak
- Asset page'deki mevcut loading/error states pattern'ı kullanılacak
