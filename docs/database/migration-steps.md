# Migration Çalıştırma Adımları

## Yöntem 1: Supabase Dashboard (Önerilen - En Kolay)

### Adım 1: Supabase Dashboard'a Giriş
1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenizi seçin (personal-portfoy projesi)

### Adım 2: SQL Editor'ü Açın
1. Sol menüden **SQL Editor** seçeneğine tıklayın
2. **New query** butonuna tıklayın

### Adım 3: Migration Dosyasını Kopyalayın
1. Projenizdeki dosyayı açın:
   ```
   supabase/migrations/20251130111500_create_portfolio_schema.sql
   ```
2. Tüm içeriği kopyalayın (Ctrl+A, Ctrl+C veya Cmd+A, Cmd+C)

### Adım 4: SQL'i Çalıştırın
1. Supabase SQL Editor'e yapıştırın
2. **Run** butonuna tıklayın (veya Ctrl+Enter / Cmd+Enter)
3. Migration çalışacak ve sonuçları göreceksiniz

### Adım 5: Doğrulama
1. Sol menüden **Table Editor** seçeneğine tıklayın
2. Şu tabloları görmelisiniz:
   - ✅ `portfolios`
   - ✅ `assets`
   - ✅ `transactions`

3. **Database** → **Types** bölümünde şu ENUM'ları görmelisiniz:
   - ✅ `asset_type`
   - ✅ `transaction_type`

## Yöntem 2: Supabase CLI (Gelişmiş)

### Adım 1: Supabase CLI Kurulumu
```bash
npm install -g supabase
```

### Adım 2: Supabase'e Giriş
```bash
supabase login
```
Tarayıcı açılacak, giriş yapın.

### Adım 3: Projeyi Linkle
```bash
cd /Users/hasan/Projects/pp/personal-portfoy
supabase link --project-ref your-project-ref
```

Project ref'i bulmak için:
1. Supabase Dashboard → Project Settings → General
2. "Reference ID" değerini kopyalayın

### Adım 4: Migration'ı Push Et
```bash
supabase db push
```

Bu komut `supabase/migrations/` klasöründeki tüm migration'ları çalıştırır.

## Yöntem 3: Manuel SQL (Alternatif)

Eğer yukarıdaki yöntemler çalışmazsa:

1. Supabase Dashboard → SQL Editor
2. Migration dosyasının içeriğini kopyala-yapıştır
3. Run butonuna tıkla

## Migration Sonrası Kontroller

### 1. Tabloları Kontrol Et
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('portfolios', 'assets', 'transactions');
```

### 2. ENUM'ları Kontrol Et
```sql
SELECT typname 
FROM pg_type 
WHERE typname IN ('asset_type', 'transaction_type');
```

### 3. Index'leri Kontrol Et
```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('portfolios', 'assets', 'transactions');
```

### 4. RLS Politikalarını Kontrol Et
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('portfolios', 'assets', 'transactions');
```

## Test Verisi Ekleme

Migration başarılı olduktan sonra test verisi ekleyebilirsiniz:

```sql
-- Önce kendi user_id'nizi alın
SELECT id FROM auth.users LIMIT 1;

-- Test portfolio oluşturun (user_id'yi değiştirin)
INSERT INTO portfolios (user_id, name) 
VALUES ('your-user-id-here', 'Test Portfolio');

-- Test asset ekleyin (portfolio_id'yi değiştirin)
INSERT INTO assets (portfolio_id, symbol, quantity, average_buy_price, type)
VALUES (
  (SELECT id FROM portfolios LIMIT 1),
  'AAPL',
  10.5,
  150.00,
  'STOCK'
);

-- Test transaction ekleyin (asset_id'yi değiştirin)
INSERT INTO transactions (asset_id, type, amount, price, date, transaction_cost)
VALUES (
  (SELECT id FROM assets LIMIT 1),
  'BUY',
  10,
  150.00,
  NOW(),
  1.50
);
```

## Sorun Giderme

### Hata: "relation already exists"
- Tablolar zaten oluşturulmuş demektir
- Migration'ı tekrar çalıştırmaya gerek yok
- Veya rollback script'i çalıştırıp tekrar deneyin

### Hata: "permission denied"
- Supabase Dashboard'da SQL Editor kullanın (service_role yetkisiyle çalışır)
- Veya Supabase CLI ile link yapın

### Hata: "type already exists"
- ENUM'lar zaten oluşturulmuş demektir
- Migration'ın ENUM kısmını atlayıp sadece tabloları oluşturabilirsiniz

## Rollback (Geri Alma)

Eğer migration'ı geri almak isterseniz:

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/20251130111501_rollback_portfolio_schema.sql` dosyasını açın
3. İçeriği kopyalayıp SQL Editor'e yapıştırın
4. Run butonuna tıklayın

Bu işlem tüm tabloları, index'leri, policy'leri ve ENUM'ları silecektir.

