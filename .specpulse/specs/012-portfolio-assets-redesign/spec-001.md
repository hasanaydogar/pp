# Spec: Portföy Varlıkları Sayfası Redesign

**Feature ID**: 012-portfolio-assets-redesign
**Version**: 1.0
**Status**: DRAFT
**Created**: 2026-01-03

---

## 📋 Özet

Portföy Varlıkları sayfasını profesyonel bir tasarıma çeviriyoruz. Tailwind UI "With condensed content" tablo stili, sortable kolonlar, özet kartlar ve policy uyum göstergeleri içeren, uygulamanın en faydalı sayfası olacak.

## 🎯 Hedefler

1. **Profesyonel Tablo Tasarımı**: Condensed, sortable, responsive
2. **Özet Kartları**: Toplam değer, günlük değişim, nakit durumu, policy uyumları
3. **Yüzdesel Dağılım**: Her varlığın portföy içindeki ağırlığı
4. **Policy Uyum Göstergeleri**: Aşım uyarıları, kategori etiketleri
5. **Hızlı Aksiyonlar**: Al/Sat butonları, detay linki

---

## 🖼️ Tasarım Referansı

**Tablo Stili**: [Tailwind UI Tables - With condensed content](https://tailwindcss.com/plus/ui-blocks/application-ui/lists/tables)

### Özet Kartları (Üst Bölüm)

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Toplam Değer    │ Günlük Değişim  │ Nakit Durumu    │ Policy Uyumu    │
│ ₺1,234,567      │ +₺12,345 (+1.2%)│ ₺50,000 (%5.2)  │ ⚠️ 2 Uyarı      │
│                 │ ↑               │ Hedef: %7       │ ✓ 15 OK         │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Varlık Dağılım Barı

```
┌──────────────────────────────────────────────────────────────────────┐
│ █████████ THYAO 12% │ ██████ AKBNK 8% │ █████ GARAN 7% │ ▒▒▒ Diğer 73%│
└──────────────────────────────────────────────────────────────────────┘
```

### Tablo Header (Başlık + Buton)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Varlıklar (15)                                    [+ Varlık Ekle]  │
└─────────────────────────────────────────────────────────────────────┘
```

### Condensed Tablo (Sortable)

```
┌─────┬────────┬────────┬─────────┬─────────┬────────┬────────┬──────────┬─────────┐
│ #   │ Sembol │ Ağırlık│ Değer   │ Maliyet │ G/Z    │ G/Z %  │ Kategori │ Aksiyon │
├─────┼────────┼────────┼─────────┼─────────┼────────┼────────┼──────────┼─────────┤
│ 1   │ THYAO  │ 12.5%▲ │ ₺154K   │ ₺140K   │ +₺14K  │ +10.0% │ 🟢 CORE  │ Al│Sat  │
│ 2   │ AKBNK  │ 8.2%   │ ₺101K   │ ₺95K    │ +₺6K   │ +6.3%  │ 🟢 CORE  │ Al│Sat  │
│ 3   │ GARAN  │ 7.8%   │ ₺96K    │ ₺100K   │ -₺4K   │ -4.0%  │ 🔵 SAT   │ Al│Sat  │
│ ... │        │        │         │         │        │        │          │         │
└─────┴────────┴────────┴─────────┴─────────┴────────┴────────┴──────────┴─────────┘
                    ↑ Sortable kolonlar (tıkla sırala)
```

---

## 📐 Komponentler

### 1. PortfolioSummaryCards

```typescript
interface PortfolioSummaryCardsProps {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  cashAmount: number;
  cashPercent: number;
  cashTarget: number;
  policyViolations: PolicyViolation[];
  displayCurrency: string;
}
```

**İçerik:**
- Toplam Değer (büyük font)
- Günlük Değişim (yeşil/kırmızı, yüzde)
- Nakit Durumu (miktar, yüzde, hedef karşılaştırma)
- Policy Özeti (uyarı sayısı, OK sayısı)

### 2. AssetDistributionBar

```typescript
interface AssetDistributionBarProps {
  assets: {
    symbol: string;
    weight: number;
    color: string;
  }[];
}
```

**Özellikler:**
- Top 5-7 varlık renkli segmentler
- Hover ile detay tooltip
- "Diğer" kategorisi
- Click ile filtreleme

### 3. SortableAssetsTable

```typescript
interface SortableAssetsTableProps {
  assets: AssetWithMetrics[];
  sortColumn: SortColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: SortColumn) => void;
  policy: PortfolioPolicy;
}

type SortColumn = 
  | 'symbol' 
  | 'weight' 
  | 'value' 
  | 'cost' 
  | 'gainLoss' 
  | 'gainLossPercent'
  | 'category';
```

**Condensed Stili:**
- Küçük padding (py-2 px-3)
- Compact font size (text-sm)
- Sortable header icons
- Sticky header
- Hover highlight

### 4. PolicyStatusBadge

```typescript
interface PolicyStatusBadgeProps {
  category: 'CORE' | 'SATELLITE' | 'NEW';
  isOverWeight: boolean;
  currentWeight: number;
  maxWeight: number;
}
```

**Gösterimler:**
- 🟢 CORE (yeşil badge)
- 🔵 SATELLITE (mavi badge)
- 🟡 NEW (sarı badge)
- ⚠️ OVER (kırmızı uyarı, aşım miktarı)

---

## 🔧 Teknik Gereksinimler

### State Management

```typescript
interface AssetsPageState {
  // Data
  assets: AssetWithMetrics[];
  policy: PortfolioPolicy | null;
  cashPositions: CashPosition[];
  
  // UI State
  sortColumn: SortColumn;
  sortDirection: 'asc' | 'desc';
  filterCategory: PositionCategory | 'ALL';
  searchQuery: string;
  
  // Computed
  totalValue: number;
  totalCash: number;
  policyViolations: PolicyViolation[];
}
```

### Sorting Logic

```typescript
function sortAssets(
  assets: AssetWithMetrics[], 
  column: SortColumn, 
  direction: 'asc' | 'desc'
): AssetWithMetrics[] {
  return [...assets].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    const modifier = direction === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal as string) * modifier;
    }
    return ((aVal as number) - (bVal as number)) * modifier;
  });
}
```

### Weight Calculation

```typescript
interface AssetWithMetrics extends Asset {
  currentValue: number;      // quantity * current_price
  costBasis: number;         // quantity * average_buy_price
  gainLoss: number;          // currentValue - costBasis
  gainLossPercent: number;   // (gainLoss / costBasis) * 100
  weight: number;            // currentValue / totalPortfolioValue
  category: PositionCategory;
  isOverWeight: boolean;
}
```

---

## 📱 Responsive Tasarım

### Desktop (lg+)
- Tüm kolonlar görünür
- Yan yana kartlar (4 kolon)
- Full width tablo

### Tablet (md)
- Kartlar 2x2 grid
- Bazı kolonlar gizli (maliyet)
- Scrollable tablo

### Mobile (sm)
- Kartlar stack (1 kolon)
- Sadece önemli kolonlar
- Card-based list view alternatifi

---

## ✅ Acceptance Criteria

1. [ ] Özet kartları doğru metrikleri gösteriyor
2. [ ] Dağılım barı top varlıkları gösteriyor
3. [ ] Tablo tüm kolonlarda sortable
4. [ ] Condensed stili uygulanmış
5. [ ] Policy uyum badge'leri doğru renklerde
6. [ ] Aşım uyarıları görünür
7. [ ] Responsive tasarım çalışıyor
8. [ ] Al/Sat butonları fonksiyonel
9. [ ] Sembol tıklanınca detay sayfasına gidiyor
10. [ ] Nakit durumu policy ile karşılaştırılıyor
11. [ ] "Varlık Ekle" butonu çalışıyor (asset ekleme sayfasına yönlendiriyor)

---

## 🎨 Renk Paleti

| Durum | Renk | Tailwind Class |
|-------|------|----------------|
| Pozitif G/Z | Yeşil | text-green-600 |
| Negatif G/Z | Kırmızı | text-red-600 |
| CORE | Yeşil | bg-green-100 text-green-800 |
| SATELLITE | Mavi | bg-blue-100 text-blue-800 |
| NEW | Sarı | bg-yellow-100 text-yellow-800 |
| Over Weight | Kırmızı | bg-red-100 text-red-800 |
| Nakit Düşük | Sarı | text-amber-600 |
| Nakit Hedefte | Yeşil | text-green-600 |

---

## ⏱️ Tahminler

| Faz | Süre |
|-----|------|
| Özet Kartları | 1 saat |
| Dağılım Barı | 1 saat |
| Sortable Tablo | 2 saat |
| Policy Badges | 1 saat |
| Responsive | 1 saat |
| Testing & Polish | 1 saat |
| **Toplam** | **7 saat** |

---

## 📝 Notlar

- Tailwind UI "With condensed content" referans alınacak
- Mevcut stock detay sayfası kartları referans
- useCashPositions hook kullanılacak
- Policy violations API entegrasyonu
