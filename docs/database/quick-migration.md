# Hızlı Migration Rehberi

## 🚀 En Hızlı Yöntem (3 Adım)

### 1. Supabase Dashboard'a Git
👉 [https://app.supabase.com](https://app.supabase.com) → Projenizi seçin

### 2. SQL Editor'ü Aç
👉 Sol menüden **SQL Editor** → **New query**

### 3. Migration'ı Çalıştır
👉 Aşağıdaki SQL'i kopyalayıp yapıştırın ve **Run** butonuna tıklayın:

```sql
-- Portfolio Tracker Database Schema Migration
-- Created: 2025-11-30

-- ENUM TYPES
CREATE TYPE asset_type AS ENUM (
  'STOCK', 'CRYPTO', 'FOREX', 'MUTUAL_FUND', 'ETF', 
  'BOND', 'COMMODITY', 'REAL_ESTATE', 'DERIVATIVE', 'OTHER'
);

CREATE TYPE transaction_type AS ENUM ('BUY', 'SELL');

-- TABLES
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity NUMERIC(18, 8) NOT NULL CHECK (quantity > 0),
  average_buy_price NUMERIC(18, 8) NOT NULL CHECK (average_buy_price > 0),
  type asset_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portfolio_id, symbol, type)
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount NUMERIC(18, 8) NOT NULL CHECK (amount > 0),
  price NUMERIC(18, 8) NOT NULL CHECK (price > 0),
  date TIMESTAMPTZ NOT NULL,
  transaction_cost NUMERIC(18, 8) DEFAULT 0 CHECK (transaction_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_assets_portfolio_id ON assets(portfolio_id);
CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- ROW LEVEL SECURITY
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Portfolios Policies
CREATE POLICY "Users can view their own portfolios" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own portfolios" ON portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolios" ON portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolios" ON portfolios FOR DELETE USING (auth.uid() = user_id);

-- Assets Policies
CREATE POLICY "Users can view assets in their portfolios" ON assets FOR SELECT USING (
  EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = assets.portfolio_id AND portfolios.user_id = auth.uid())
);
CREATE POLICY "Users can create assets in their portfolios" ON assets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = assets.portfolio_id AND portfolios.user_id = auth.uid())
);
CREATE POLICY "Users can update assets in their portfolios" ON assets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = assets.portfolio_id AND portfolios.user_id = auth.uid())
);
CREATE POLICY "Users can delete assets in their portfolios" ON assets FOR DELETE USING (
  EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = assets.portfolio_id AND portfolios.user_id = auth.uid())
);

-- Transactions Policies
CREATE POLICY "Users can view transactions for their assets" ON transactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM assets
    JOIN portfolios ON portfolios.id = assets.portfolio_id
    WHERE assets.id = transactions.asset_id AND portfolios.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create transactions for their assets" ON transactions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM assets
    JOIN portfolios ON portfolios.id = assets.portfolio_id
    WHERE assets.id = transactions.asset_id AND portfolios.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update transactions for their assets" ON transactions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM assets
    JOIN portfolios ON portfolios.id = assets.portfolio_id
    WHERE assets.id = transactions.asset_id AND portfolios.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete transactions for their assets" ON transactions FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM assets
    JOIN portfolios ON portfolios.id = assets.portfolio_id
    WHERE assets.id = transactions.asset_id AND portfolios.user_id = auth.uid()
  )
);
```

## ✅ Başarı Kontrolü

Migration başarılı olduysa:

1. **Table Editor**'da şu tabloları görmelisiniz:
   - ✅ portfolios
   - ✅ assets  
   - ✅ transactions

2. **Database → Types** bölümünde:
   - ✅ asset_type
   - ✅ transaction_type

## 🧪 Hızlı Test

Migration sonrası test verisi eklemek için:

```sql
-- 1. Kendi user_id'nizi alın
SELECT id FROM auth.users LIMIT 1;

-- 2. Portfolio oluşturun (yukarıdaki id'yi kullanın)
INSERT INTO portfolios (user_id, name) 
VALUES ('YOUR_USER_ID_HERE', 'My Portfolio');

-- 3. Asset ekleyin
INSERT INTO assets (portfolio_id, symbol, quantity, average_buy_price, type)
VALUES (
  (SELECT id FROM portfolios LIMIT 1),
  'AAPL',
  10,
  150.00,
  'STOCK'
);

-- 4. Transaction ekleyin
INSERT INTO transactions (asset_id, type, amount, price, date)
VALUES (
  (SELECT id FROM assets LIMIT 1),
  'BUY',
  10,
  150.00,
  NOW()
);

-- 5. Verileri kontrol edin
SELECT * FROM portfolios;
SELECT * FROM assets;
SELECT * FROM transactions;
```

## ❌ Sorun mu var?

- **"relation already exists"** → Tablolar zaten var, sorun yok!
- **"permission denied"** → SQL Editor kullanın (Dashboard'dan)
- **"type already exists"** → ENUM'lar zaten var, sorun yok!

## 📚 Detaylı Rehber

Daha detaylı bilgi için: [Migration Guide](./migration-guide.md)

