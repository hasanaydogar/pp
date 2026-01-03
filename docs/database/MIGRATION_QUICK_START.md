# 🚀 Hızlı Migration Rehberi

## Sorun
API'de `base_currency` kolonu bulunamıyor hatası alıyorsunuz. Bu, migration'ların henüz çalıştırılmadığı anlamına gelir.

## Çözüm: Migration'ları Çalıştırın

### Adım 1: Supabase Dashboard'a Giriş Yapın
1. [Supabase Dashboard](https://app.supabase.com) → Projenizi seçin
2. Sol menüden **SQL Editor**'a tıklayın

### Adım 2: Migration Dosyalarını Sırayla Çalıştırın

**Migration 1: Currency Support** (ZORUNLU)
```sql
-- Bu dosyanın içeriğini kopyalayın:
-- supabase/migrations/20251130120000_add_currency_support.sql
```

**Migration 2: Benchmark Support** (OPSIYONEL - şimdilik atlayabilirsiniz)
```sql
-- supabase/migrations/20251130120001_add_benchmark_support.sql
```

**Migration 3: Cost Basis Tracking** (OPSIYONEL - şimdilik atlayabilirsiniz)
```sql
-- supabase/migrations/20251130120002_add_cost_basis_tracking.sql
```

### Adım 3: Migration 1'i Çalıştırın

1. SQL Editor'da **New Query** butonuna tıklayın
2. Aşağıdaki SQL'i yapıştırın:

```sql
-- Enhanced Portfolio Tracker: Currency Support Migration
-- Created: 2025-11-30
-- Description: Adds currency support, initial purchase date, notes fields, and realized gain/loss tracking

-- ============================================================================
-- ADD CURRENCY FIELDS
-- ============================================================================

-- Add currency to assets table
ALTER TABLE assets 
ADD COLUMN currency TEXT DEFAULT 'USD' NOT NULL;

-- Add currency to transactions table (nullable, can inherit from asset)
ALTER TABLE transactions 
ADD COLUMN currency TEXT;

-- Add base_currency to portfolios table
ALTER TABLE portfolios 
ADD COLUMN base_currency TEXT DEFAULT 'USD' NOT NULL;

-- ============================================================================
-- ADD INITIAL PURCHASE DATE
-- ============================================================================

-- Add initial_purchase_date to assets table for historical tracking
ALTER TABLE assets 
ADD COLUMN initial_purchase_date TIMESTAMPTZ;

-- ============================================================================
-- ADD NOTES FIELDS
-- ============================================================================

-- Add notes field to assets table for user annotations
ALTER TABLE assets 
ADD COLUMN notes TEXT;

-- Add notes field to transactions table for user annotations
ALTER TABLE transactions 
ADD COLUMN notes TEXT;

-- ============================================================================
-- ADD REALIZED GAIN/LOSS TRACKING
-- ============================================================================

-- Add realized_gain_loss to transactions table for SELL transaction tracking
ALTER TABLE transactions 
ADD COLUMN realized_gain_loss NUMERIC(18, 8);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN assets.currency IS 'Currency code for the asset (e.g., USD, TRY, EUR)';
COMMENT ON COLUMN assets.initial_purchase_date IS 'Date when the asset was first purchased (for historical tracking)';
COMMENT ON COLUMN assets.notes IS 'User notes/annotations for the asset';
COMMENT ON COLUMN transactions.currency IS 'Currency code for the transaction (can differ from asset currency)';
COMMENT ON COLUMN transactions.realized_gain_loss IS 'Realized gain (positive) or loss (negative) for SELL transactions';
COMMENT ON COLUMN transactions.notes IS 'User notes/annotations for the transaction';
COMMENT ON COLUMN portfolios.base_currency IS 'Base currency for the portfolio (default: USD)';
```

3. **Run** butonuna tıklayın (veya `Cmd+Enter` / `Ctrl+Enter`)
4. ✅ Başarılı mesajını görmelisiniz

### Adım 4: Doğrulama

Migration'ın başarılı olduğunu kontrol edin:

```sql
-- Portfolios tablosunda base_currency kolonunu kontrol edin
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'portfolios'
AND column_name = 'base_currency';
```

**Beklenen Sonuç:**
```
column_name    | data_type | column_default | is_nullable
---------------|-----------|----------------|-------------
base_currency  | text      | 'USD'::text    | NO
```

### Adım 5: API'yi Tekrar Test Edin

Postman'de tekrar deneyin:
```json
POST /api/portfolios
{
  "name": "My Investment Portfolio"
}
```

Artık başarılı olmalı! 🎉

## Sorun Giderme

### Hata: "column already exists"
Migration zaten çalıştırılmış. Devam edebilirsiniz.

### Hata: "relation does not exist"
Önce temel schema migration'ını çalıştırmanız gerekiyor:
```sql
-- supabase/migrations/20251130111500_create_portfolio_schema.sql
```

### Migration'ı Geri Almak İsterseniz
```sql
-- Rollback script (dikkatli kullanın!)
ALTER TABLE portfolios DROP COLUMN IF EXISTS base_currency;
ALTER TABLE assets DROP COLUMN IF EXISTS currency;
ALTER TABLE assets DROP COLUMN IF EXISTS initial_purchase_date;
ALTER TABLE assets DROP COLUMN IF EXISTS notes;
ALTER TABLE transactions DROP COLUMN IF EXISTS currency;
ALTER TABLE transactions DROP COLUMN IF EXISTS realized_gain_loss;
ALTER TABLE transactions DROP COLUMN IF EXISTS notes;
```

## Sonraki Adımlar

Migration başarılı olduktan sonra:
1. ✅ API endpoint'lerini test edin
2. ✅ Postman collection'ı kullanarak tüm endpoint'leri deneyin
3. ✅ İsterseniz diğer migration'ları da çalıştırabilirsiniz (benchmark, cost basis)

