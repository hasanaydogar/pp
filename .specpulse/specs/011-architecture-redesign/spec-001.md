# Specification: Portfolio Architecture Redesign

## Feature ID: 011-architecture-redesign
## Version: 1.1
## Status: APPROVED

---

## 1. Executive Summary

### 1.1 Problem Statement
Mevcut yapı temel portfolio takibi için yeterli, ancak gerçek dünya senaryolarını karşılamıyor:
- Bir kullanıcının birden fazla farklı amaçlı portfolyo takibi
- Portfolio bazlı yatırım politikaları (ağırlık limitleri, sektör dağılımı)
- Nakit/Cash pozisyon takibi
- Stock dışı varlıklar (Altın, Tahvil, Gayrimenkul)
- Rebalancing ihtiyaçlarının tespiti
- **Tüm portfolyolerin toplam özeti görüntüleme**

### 1.2 Proposed Solution
Kapsamlı bir portfolio yönetim sistemi:
- **Multi-Portfolio**: Amaç bazlı portfolyo grupları
- **Policy Engine**: Her portfolyo için özelleştirilebilir kurallar
- **Cash Management**: Nakit pozisyon takibi ve hedefleri
- **Extended Asset Types**: Tüm varlık türlerini destekleme
- **Position Categories**: Core, Satellite, New Position sınıflandırması
- **All Portfolios Summary**: Hesap sahibinin tüm portfolyolarının toplam özeti

---

## 2. Mevcut Durum Analizi

### 2.1 Mevcut Veritabanı Yapısı
```
portfolios
├── id, user_id, name
├── base_currency, benchmark_symbol
└── created_at, updated_at

assets
├── id, portfolio_id, symbol
├── quantity, average_buy_price, type
├── currency, notes
└── created_at, updated_at

transactions
├── id, asset_id, type (BUY/SELL)
├── amount, price, date
├── transaction_cost, currency
└── realized_gain_loss, notes
```

### 2.2 Eksikler
1. **Portfolio Politikaları**: Ağırlık limitleri, sektör dağılımı yok
2. **Nakit Takibi**: Cash pozisyonu asset olarak takip edilemez (fiyat = 1, değişmez)
3. **Position Kategorileri**: Core/Satellite/New position ayrımı yok
4. **Sektör Bilgisi**: Asset'lerin hangi sektörde olduğu bilinmiyor
5. **Toplam Özet**: Tüm portfolyoların birleşik görünümü yok

---

## 3. Kararlar (Onaylandı)

### 3.1 Cash Yönetimi
**KARAR**: Ayrı `cash_positions` tablosunda tutulacak
- Nakit, asset'ten farklı davranışa sahip (fiyat = 1, değişmez)
- Para birimi bazlı ayrı takip gerekli
- Deposit/Withdraw/Dividend gibi özel işlem türleri var

### 3.2 Sektör Bilgisi
**KARAR**: Hibrit yaklaşım (API + Manual Override)
- Yahoo Finance API'den otomatik çekilecek
- Kullanıcı isterse manuel düzenleyebilecek
- `manual_sector` alanı API verisini override edecek

### 3.3 Position Category
**KARAR**: Hibrit yaklaşım (Otomatik + Manuel)
- Varsayılan: Ağırlığa göre otomatik hesaplama
- Kullanıcı isterse manuel override edebilir
- `manual_category` alanı otomatik hesaplamayı override edecek

### 3.4 Portfolio Types
**KARAR**: Dinamik (Kullanıcı Tanımlı)
- Kullanıcı kendi portfolyo türlerini oluşturabilir
- Varsayılan türler seed olarak eklenecek: Investment, Education, Hobby, Retirement
- `portfolio_types` tablosu kullanıcı bazlı (`user_id` ile)

---

## 4. Yeni Mimari

### 4.1 Üst Düzey Yapı

```
Hesap Sahibi (User)
│
├── 📊 TOPLAM ÖZET (All Portfolios Summary)
│   ├── Toplam Değer: ₺2,500,000 (tüm para birimleri TRY'ye çevrilmiş)
│   ├── Toplam Nakit: ₺150,000
│   ├── Toplam Varlık: ₺2,350,000
│   ├── Portfolio Dağılımı (pie chart)
│   ├── Varlık Türü Dağılımı (Stock, ETF, Gold, Cash...)
│   └── Genel Performans (günlük/haftalık/aylık)
│
├── 💼 Portfolio: Borsa İstanbul
│   ├── Policy: max_stock=12%, max_sector=25%, cash_target=7%
│   ├── Cash: 50,000 TRY
│   └── Assets: DOAS, THYAO, TUPRS...
│
├── 💼 Portfolio: ABD Borsaları
│   ├── Policy: max_stock=10%, max_sector=20%, cash_target=5%
│   ├── Cash: 5,000 USD
│   └── Assets: AAPL, MSFT, GOOGL...
│
├── 💼 Portfolio: Çocuk Eğitim Fonu
│   ├── Policy: max_stock=15%, max_sector=30%, cash_target=10%
│   ├── Cash: 10,000 TRY
│   └── Assets: ETF, BOND...
│
└── 💼 Portfolio: Altın & Güvenli Liman
    ├── Policy: N/A
    ├── Cash: 2,000 TRY
    └── Assets: GOLD, SILVER, USD...
```

### 4.2 Database Schema

```sql
-- ============================================================================
-- YENI TABLOLAR
-- ============================================================================

-- Portfolio Types (Portfolyo Türleri) - Kullanıcı Tanımlı
CREATE TABLE portfolio_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,          -- 'investment', 'education', 'hobby', 'retirement'
  display_name TEXT NOT NULL,  -- 'Yatırım', 'Eğitim Fonu', 'Hobi', 'Emeklilik'
  icon TEXT,                   -- Emoji veya icon class
  color TEXT,                  -- Hex renk kodu
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- Portfolio Policies (Yatırım Kuralları)
CREATE TABLE portfolio_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- Per Stock Limits
  max_weight_per_stock NUMERIC(5, 4) DEFAULT 0.12,    -- Max 12%
  
  -- Position Categories
  core_min_weight NUMERIC(5, 4) DEFAULT 0.08,         -- Core: 8-12%
  core_max_weight NUMERIC(5, 4) DEFAULT 0.12,
  satellite_min_weight NUMERIC(5, 4) DEFAULT 0.01,    -- Satellite: 1-5%
  satellite_max_weight NUMERIC(5, 4) DEFAULT 0.05,
  new_position_min_weight NUMERIC(5, 4) DEFAULT 0.005,-- New: 0.5-2%
  new_position_max_weight NUMERIC(5, 4) DEFAULT 0.02,
  
  -- Sector Limits
  max_weight_per_sector NUMERIC(5, 4) DEFAULT 0.25,   -- Max 25%
  
  -- Cash Management
  cash_min_percent NUMERIC(5, 4) DEFAULT 0.05,        -- Min 5%
  cash_max_percent NUMERIC(5, 4) DEFAULT 0.10,        -- Max 10%
  cash_target_percent NUMERIC(5, 4) DEFAULT 0.07,     -- Target 7%
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(portfolio_id)
);

-- Cash Positions (Nakit Takibi)
CREATE TABLE cash_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  
  currency TEXT NOT NULL DEFAULT 'TRY',
  amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  
  -- Tracking
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  
  UNIQUE(portfolio_id, currency)
);

-- Cash Transactions (Nakit Hareketleri)
CREATE TABLE cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_position_id UUID NOT NULL REFERENCES cash_positions(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAW', 'BUY_ASSET', 'SELL_ASSET', 'DIVIDEND', 'FEE')),
  amount NUMERIC(18, 2) NOT NULL,
  
  -- Optional: Link to asset transaction
  related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sectors (Sektör Tanımları) - Global
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,       -- 'technology', 'finance', 'healthcare'
  display_name TEXT NOT NULL,      -- 'Teknoloji', 'Finans', 'Sağlık'
  color TEXT,                      -- UI için renk kodu
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asset Metadata (Varlık Ek Bilgileri)
CREATE TABLE asset_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  
  -- Sector Info (from API)
  sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  api_sector TEXT,                 -- Yahoo Finance'ten gelen ham veri
  
  -- Manual Overrides
  manual_sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  manual_name TEXT,
  
  -- Position Category
  auto_category TEXT CHECK (auto_category IN ('CORE', 'SATELLITE', 'NEW')),
  manual_category TEXT CHECK (manual_category IN ('CORE', 'SATELLITE', 'NEW')),
  
  -- Additional Info
  isin TEXT,
  exchange TEXT,
  country TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(asset_id)
);

-- ============================================================================
-- PORTFOLIOS TABLOSU GÜNCELLEMELERİ
-- ============================================================================

ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS
  portfolio_type_id UUID REFERENCES portfolio_types(id) ON DELETE SET NULL;

ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS
  description TEXT;

ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS
  target_value NUMERIC(18, 2); -- Hedef portföy değeri

-- ============================================================================
-- RLS POLİTİKALARI
-- ============================================================================

-- Portfolio Types RLS
ALTER TABLE portfolio_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolio types"
  ON portfolio_types FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio types"
  ON portfolio_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio types"
  ON portfolio_types FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio types"
  ON portfolio_types FOR DELETE
  USING (auth.uid() = user_id);

-- Portfolio Policies RLS
ALTER TABLE portfolio_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view policies for their portfolios"
  ON portfolio_policies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_policies.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create policies for their portfolios"
  ON portfolio_policies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_policies.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update policies for their portfolios"
  ON portfolio_policies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_policies.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete policies for their portfolios"
  ON portfolio_policies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_policies.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Cash Positions RLS
ALTER TABLE cash_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cash positions for their portfolios"
  ON cash_positions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = cash_positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cash positions for their portfolios"
  ON cash_positions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = cash_positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cash positions for their portfolios"
  ON cash_positions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = cash_positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cash positions for their portfolios"
  ON cash_positions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = cash_positions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Cash Transactions RLS
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cash transactions for their portfolios"
  ON cash_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cash_positions
      JOIN portfolios ON portfolios.id = cash_positions.portfolio_id
      WHERE cash_positions.id = cash_transactions.cash_position_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cash transactions for their portfolios"
  ON cash_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cash_positions
      JOIN portfolios ON portfolios.id = cash_positions.portfolio_id
      WHERE cash_positions.id = cash_transactions.cash_position_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cash transactions for their portfolios"
  ON cash_transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM cash_positions
      JOIN portfolios ON portfolios.id = cash_positions.portfolio_id
      WHERE cash_positions.id = cash_transactions.cash_position_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cash transactions for their portfolios"
  ON cash_transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM cash_positions
      JOIN portfolios ON portfolios.id = cash_positions.portfolio_id
      WHERE cash_positions.id = cash_transactions.cash_position_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Sectors RLS (Global, everyone can read)
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view sectors"
  ON sectors FOR SELECT
  USING (true);

-- Asset Metadata RLS
ALTER TABLE asset_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metadata for their assets"
  ON asset_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = asset_metadata.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create metadata for their assets"
  ON asset_metadata FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = asset_metadata.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update metadata for their assets"
  ON asset_metadata FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = asset_metadata.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete metadata for their assets"
  ON asset_metadata FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = asset_metadata.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SEED DATA (Varsayılan Sektörler)
-- ============================================================================

INSERT INTO sectors (name, display_name, color) VALUES
  ('technology', 'Teknoloji', '#3B82F6'),
  ('finance', 'Finans', '#10B981'),
  ('healthcare', 'Sağlık', '#EF4444'),
  ('energy', 'Enerji', '#F59E0B'),
  ('consumer', 'Tüketici', '#8B5CF6'),
  ('industrial', 'Sanayi', '#6B7280'),
  ('materials', 'Hammadde', '#EC4899'),
  ('utilities', 'Kamu Hizmetleri', '#14B8A6'),
  ('real_estate', 'Gayrimenkul', '#F97316'),
  ('communication', 'İletişim', '#06B6D4')
ON CONFLICT (name) DO NOTHING;
```

### 4.3 TypeScript Types

```typescript
// ============================================================================
// ENUMS
// ============================================================================

export enum AssetType {
  // Mevcut
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  FOREX = 'FOREX',
  MUTUAL_FUND = 'MUTUAL_FUND',
  ETF = 'ETF',
  BOND = 'BOND',
  COMMODITY = 'COMMODITY',
  REAL_ESTATE = 'REAL_ESTATE',
  DERIVATIVE = 'DERIVATIVE',
  OTHER = 'OTHER',
  
  // Yeni
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  FIXED_DEPOSIT = 'FIXED_DEPOSIT',
  SAVINGS = 'SAVINGS',
  PENSION = 'PENSION',
}

export enum PositionCategory {
  CORE = 'CORE',
  SATELLITE = 'SATELLITE',
  NEW = 'NEW',
}

export enum CashTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  BUY_ASSET = 'BUY_ASSET',
  SELL_ASSET = 'SELL_ASSET',
  DIVIDEND = 'DIVIDEND',
  FEE = 'FEE',
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface PortfolioType {
  id: string;
  user_id: string;
  name: string;
  display_name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface PortfolioPolicy {
  id: string;
  portfolio_id: string;
  
  // Stock Limits
  max_weight_per_stock: number;
  
  // Position Categories
  core_min_weight: number;
  core_max_weight: number;
  satellite_min_weight: number;
  satellite_max_weight: number;
  new_position_min_weight: number;
  new_position_max_weight: number;
  
  // Sector Limits
  max_weight_per_sector: number;
  
  // Cash Management
  cash_min_percent: number;
  cash_max_percent: number;
  cash_target_percent: number;
  
  created_at: string;
  updated_at?: string;
}

export interface CashPosition {
  id: string;
  portfolio_id: string;
  currency: string;
  amount: number;
  last_updated: string;
  notes?: string;
}

export interface CashTransaction {
  id: string;
  cash_position_id: string;
  type: CashTransactionType;
  amount: number;
  related_transaction_id?: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface Sector {
  id: string;
  name: string;
  display_name: string;
  color?: string;
  created_at: string;
}

export interface AssetMetadata {
  id: string;
  asset_id: string;
  
  // Sector
  sector_id?: string;
  api_sector?: string;
  manual_sector_id?: string;
  manual_name?: string;
  
  // Position Category
  auto_category?: PositionCategory;
  manual_category?: PositionCategory;
  
  // Additional Info
  isin?: string;
  exchange?: string;
  country?: string;
  
  created_at: string;
  updated_at?: string;
  
  // Computed (from joins)
  sector?: Sector;
  effective_sector?: Sector; // manual || api
  effective_category?: PositionCategory; // manual || auto
}

// ============================================================================
// AGGREGATES (For Summary Views)
// ============================================================================

export interface PortfolioSummary {
  portfolio: Portfolio;
  total_value: number;           // Varlıkların toplam değeri
  total_cash: number;            // Nakit toplamı
  total_assets_value: number;    // Sadece varlıklar
  cash_percentage: number;       // Nakit yüzdesi
  asset_count: number;           // Varlık sayısı
  daily_change: number;          // Günlük değişim
  daily_change_percent: number;
  policy_violations: PolicyViolation[];
}

export interface AllPortfoliosSummary {
  user_id: string;
  
  // Totals (converted to display currency)
  display_currency: string;      // Kullanıcının tercih ettiği para birimi
  total_value: number;           // Tüm portfolyoların toplam değeri
  total_cash: number;            // Tüm nakit
  total_assets_value: number;    // Tüm varlıklar
  
  // Counts
  portfolio_count: number;
  total_asset_count: number;
  
  // Performance
  daily_change: number;
  daily_change_percent: number;
  weekly_change: number;
  weekly_change_percent: number;
  monthly_change: number;
  monthly_change_percent: number;
  
  // Breakdowns
  by_portfolio: PortfolioSummary[];
  by_asset_type: { type: AssetType; value: number; percentage: number }[];
  by_currency: { currency: string; value: number; percentage: number }[];
  by_sector: { sector: Sector; value: number; percentage: number }[];
  
  // Alerts
  all_policy_violations: PolicyViolation[];
}

export interface PolicyViolation {
  portfolio_id: string;
  type: 'OVER_WEIGHT' | 'UNDER_WEIGHT' | 'UNDER_CASH' | 'OVER_CASH' | 'SECTOR_CONCENTRATION';
  severity: 'warning' | 'critical';
  asset?: Asset;
  sector?: Sector;
  current_value: number;
  limit_value: number;
  recommendation: string;
}
```

---

## 5. UI Tasarımı

### 5.1 Sidebar Navigation

```
┌────────────────────────────────┐
│  [Avatar] Hasan                │
│  ────────────────────────────  │
│                                │
│  📊 Toplam Özet         (ALL)  │  ← YENİ: Tüm portfolyoların özeti
│  ────────────────────────────  │
│                                │
│  💼 Portfolyolar               │
│    ├── Borsa İstanbul          │
│    ├── ABD Borsaları           │
│    ├── Çocuk Eğitim Fonu       │
│    └── + Yeni Portfolio        │
│                                │
│  ────────────────────────────  │
│  ⚙️ Ayarlar                    │
│  🚪 Çıkış                      │
└────────────────────────────────┘
```

### 5.2 Toplam Özet Sayfası (`/summary` veya `/p/all`)

```
┌──────────────────────────────────────────────────────────────┐
│  📊 Toplam Özet                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Toplam Değer │  │ Toplam Nakit │  │ Günlük P/L   │       │
│  │ ₺2,500,000   │  │ ₺150,000     │  │ +₺25,000     │       │
│  │              │  │ (%6)         │  │ (+1.02%)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Portfolio Dağılımı (Pie Chart)                      │    │
│  │                                                       │    │
│  │   [Borsa İstanbul 60%] [ABD 25%] [Diğer 15%]         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Portfolio Listesi                                   │    │
│  │  ─────────────────────────────────────────────────── │    │
│  │  💼 Borsa İstanbul    ₺1,500,000  +₺15,000  (+1.0%)  │    │
│  │  💼 ABD Borsaları      $15,000    -$50     (-0.3%)  │    │
│  │  💼 Çocuk Eğitim       ₺200,000   +₺2,000  (+1.0%)  │    │
│  │  💼 Altın Portföy      ₺100,000   +₺500   (+0.5%)  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ⚠️ Uyarılar (Policy Violations)                      │    │
│  │  ─────────────────────────────────────────────────── │    │
│  │  🔴 DOAS %15 ağırlığa ulaştı (max %12)               │    │
│  │  🟡 Borsa İstanbul nakit %4 (hedef %7)               │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Portfolio Dashboard (Mevcut + Güncellemeler)

```
┌──────────────────────────────────────────────────────────────┐
│  💼 Borsa İstanbul                              [⚙️ Ayarlar] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Toplam Değer │  │ Nakit        │  │ Günlük P/L   │       │
│  │ ₺1,500,000   │  │ ₺105,000     │  │ +₺15,000     │       │
│  │              │  │ 7% ✅        │  │ (+1.02%)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  💵 Nakit Pozisyonları                               │    │
│  │  ─────────────────────────────────────────────────── │    │
│  │  TRY: ₺100,000  |  USD: $500  |  EUR: €200          │    │
│  │                                    [+ Nakit Ekle]    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📈 Varlıklar                           [+ Varlık]   │    │
│  │  ─────────────────────────────────────────────────── │    │
│  │  Symbol  | Type  | Category | Weight | Value        │    │
│  │  ─────────────────────────────────────────────────── │    │
│  │  DOAS    | STOCK | CORE 🔴  | 15%    | ₺225,000    │    │
│  │  THYAO   | STOCK | CORE     | 10%    | ₺150,000    │    │
│  │  TUPRS   | STOCK | SATELLITE| 4%     | ₺60,000     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📊 Sektör Dağılımı (Pie Chart)                      │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Portfolio Ayarları (Policy Form)

```
┌──────────────────────────────────────────────────────────────┐
│  ⚙️ Portfolio Ayarları: Borsa İstanbul                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Genel                                                       │
│  ────────────────────────────────────────                    │
│  Adı:        [Borsa İstanbul          ]                     │
│  Tür:        [Yatırım              ▼]                       │
│  Açıklama:   [                        ]                     │
│  Hedef Değer:[₺2,000,000              ]                     │
│                                                              │
│  Yatırım Politikası                                         │
│  ────────────────────────────────────────                    │
│  Max Hisse Ağırlığı:      [12  ] %                          │
│  Max Sektör Ağırlığı:     [25  ] %                          │
│                                                              │
│  Position Kategorileri                                       │
│  ────────────────────────────────────────                    │
│  Core:      Min [8  ]% - Max [12 ]%                         │
│  Satellite: Min [1  ]% - Max [5  ]%                         │
│  New:       Min [0.5]% - Max [2  ]%                         │
│                                                              │
│  Nakit Hedefleri                                            │
│  ────────────────────────────────────────                    │
│  Minimum:   [5  ] %                                         │
│  Hedef:     [7  ] %                                         │
│  Maximum:   [10 ] %                                         │
│                                                              │
│  [Kaydet]  [İptal]                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. API Endpoints

### 6.1 Portfolio Types

```
GET    /api/portfolio-types              # Kullanıcının tüm türleri
POST   /api/portfolio-types              # Yeni tür oluştur
PUT    /api/portfolio-types/[id]         # Tür güncelle
DELETE /api/portfolio-types/[id]         # Tür sil
```

### 6.2 Portfolio Policies

```
GET    /api/portfolios/[id]/policy       # Portfolio politikası
PUT    /api/portfolios/[id]/policy       # Politika oluştur/güncelle
DELETE /api/portfolios/[id]/policy       # Politika sil (varsayılana dön)
```

### 6.3 Cash Management

```
GET    /api/portfolios/[id]/cash                  # Tüm cash pozisyonları
POST   /api/portfolios/[id]/cash                  # Yeni cash pozisyonu
PUT    /api/portfolios/[id]/cash/[currency]       # Cash güncelle
DELETE /api/portfolios/[id]/cash/[currency]       # Cash sil

GET    /api/portfolios/[id]/cash/[currency]/transactions  # Cash işlemleri
POST   /api/portfolios/[id]/cash/[currency]/transactions  # Yeni işlem
```

### 6.4 Sectors

```
GET    /api/sectors                      # Tüm sektörler (global)
```

### 6.5 Asset Metadata

```
GET    /api/assets/[id]/metadata         # Asset metadata
PUT    /api/assets/[id]/metadata         # Metadata oluştur/güncelle
```

### 6.6 Summary / Analytics

```
GET    /api/summary                      # Tüm portfolyoların toplam özeti
GET    /api/portfolios/[id]/summary      # Tek portfolio özeti
GET    /api/portfolios/[id]/violations   # Policy ihlalleri
```

---

## 7. Aşamalı Uygulama Planı

### Phase 1: Database Foundation (2 saat)
- [ ] Migration dosyaları oluştur
- [ ] TypeScript type'ları ve Zod schema'ları
- [ ] Seed data (varsayılan sektörler)

### Phase 2: Portfolio Types & Policies (2 saat)
- [ ] Portfolio types CRUD
- [ ] Portfolio policies CRUD
- [ ] Portfolios tablosu güncellemesi

### Phase 3: Cash Management (3 saat)
- [ ] Cash positions CRUD
- [ ] Cash transactions CRUD
- [ ] UI: Cash kartı ve işlem formu

### Phase 4: Sectors & Asset Metadata (2 saat)
- [ ] Asset metadata CRUD
- [ ] Sector API entegrasyonu (Yahoo Finance)
- [ ] UI: Sector badges, category badges

### Phase 5: Summary & Analytics (3 saat)
- [ ] All portfolios summary endpoint
- [ ] Policy violation detection
- [ ] UI: Toplam özet sayfası

### Phase 6: UI Polish & Testing (2 saat)
- [ ] Portfolio settings form
- [ ] Pie charts ve görselleştirmeler
- [ ] Integration tests

---

## 8. Öncelik Sırası (MoSCoW)

### Must Have (İlk Release)
- [x] Çoklu portfolyo (zaten var)
- [ ] Portfolio policies (temel)
- [ ] Cash position takibi
- [ ] Toplam özet sayfası
- [ ] UI: Cash kartı

### Should Have (İkinci Release)
- [ ] Position categories (otomatik + manuel)
- [ ] Sector dağılımı ve bilgisi
- [ ] Policy violation warnings
- [ ] Portfolio types (dinamik)

### Could Have (Üçüncü Release)
- [ ] Rebalancing önerileri
- [ ] Target value tracking
- [ ] Sector API entegrasyonu (Yahoo Finance)
- [ ] Advanced analytics

### Won't Have (Bu Scope Dışı)
- [ ] Otomatik rebalancing
- [ ] Portfolio sharing
- [ ] Multi-user portfolios
- [ ] Trading integration

---

## 9. Tahmini Süre

| Aşama | Açıklama | Süre |
|-------|----------|------|
| Phase 1 | Database Foundation | 2 saat |
| Phase 2 | Portfolio Types & Policies | 2 saat |
| Phase 3 | Cash Management | 3 saat |
| Phase 4 | Sectors & Metadata | 2 saat |
| Phase 5 | Summary & Analytics | 3 saat |
| Phase 6 | UI Polish & Testing | 2 saat |
| **Toplam** | | **~14 saat** |

---

## 10. Teknik Notlar

### 10.1 Para Birimi Dönüşümü
- Toplam özet için tüm değerler kullanıcının tercih ettiği para birimine çevrilecek
- Exchange rate'ler mevcut sistemden kullanılacak
- Real-time değil, son güncelleme zamanı gösterilecek

### 10.2 Position Category Hesaplama
```typescript
function calculateAutoCategory(weight: number, policy: PortfolioPolicy): PositionCategory {
  if (weight >= policy.core_min_weight) return 'CORE';
  if (weight >= policy.satellite_min_weight) return 'SATELLITE';
  return 'NEW';
}

function getEffectiveCategory(metadata: AssetMetadata, weight: number, policy: PortfolioPolicy): PositionCategory {
  return metadata.manual_category || calculateAutoCategory(weight, policy);
}
```

### 10.3 Sector Resolution
```typescript
function getEffectiveSector(metadata: AssetMetadata): Sector | null {
  return metadata.manual_sector_id 
    ? getSectorById(metadata.manual_sector_id)
    : metadata.sector_id
      ? getSectorById(metadata.sector_id)
      : null;
}
```

---

**Status**: APPROVED ✅
**Next Step**: `/sp-plan` ile implementasyon planı oluştur
