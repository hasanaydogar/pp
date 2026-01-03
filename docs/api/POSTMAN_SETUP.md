# Postman Collection Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. Collection ve Environment Import

1. **Postman'i açın**
2. **Import** butonuna tıklayın
3. **File** sekmesini seçin
4. Şu 2 dosyayı import edin:
   - `Portfolio-Tracker-API.postman_collection.json` (Collection)
   - `Portfolio-Tracker-Local.postman_environment.json` (Environment)

### 2. Environment Seçimi

1. Sağ üst köşede **Environment** dropdown'ını açın
2. **Portfolio Tracker Local** seçin

### 3. Authentication Setup (Cookie Alma)

#### Yöntem 1: Browser'dan Cookie Kopyalama (Önerilen)

1. **Browser'da Login:**
   ```
   http://localhost:3000/login
   ```
   Google ile giriş yapın

2. **Cookie'leri Kopyalayın:**
   - F12 → **Application** → **Cookies** → `http://localhost:3000`
   - Supabase cookie'lerini bulun (şu formatta):
     - `sb-<project-ref>-auth-token.0` (örn: `sb-pnmisbgmzdceaoysmbdc-auth-token.0`)
     - `sb-<project-ref>-auth-token.1` (örn: `sb-pnmisbgmzdceaoysmbdc-auth-token.1`)
   - **Her iki cookie'nin de Value kısmını kopyalayın**

3. **Postman'de Cookie Ekleyin:**
   - Postman'de herhangi bir request'e gidin
   - Request'in altında **Cookies** linkine tıklayın
   - `http://localhost:3000` için **her iki cookie'yi de** ekleyin:
     
     **Cookie 1:**
     - **Name:** `sb-pnmisbgmzdceaoysmbdc-auth-token.0` (kendi project ref'inizle değiştirin)
     - **Value:** (browser'dan kopyaladığınız `.0` cookie'sinin value'su)
     - **Domain:** `localhost`
     - **Path:** `/`
     
     **Cookie 2:**
     - **Name:** `sb-pnmisbgmzdceaoysmbdc-auth-token.1` (kendi project ref'inizle değiştirin)
     - **Value:** (browser'dan kopyaladığınız `.1` cookie'sinin value'su)
     - **Domain:** `localhost`
     - **Path:** `/`

   **Önemli:** Supabase SSR iki cookie kullanır (`.0` ve `.1`), **her ikisini de** eklemeniz gerekir!

### 4. Uygulamayı Başlatın

```bash
cd personal-portfoy
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışmalı.

---

## 📋 Collection İçeriği

### 01. Authentication (1 request)
- ✅ Test Auth Status

### 02. Portfolios (5 requests)
- ✅ List Portfolios
- ✅ Create Portfolio
- ✅ Get Portfolio by ID
- ✅ Update Portfolio
- ✅ Delete Portfolio

### 03. Assets (5 requests)
- ✅ List Assets in Portfolio
- ✅ Create Asset
- ✅ Get Asset by ID
- ✅ Update Asset
- ✅ Delete Asset

### 04. Transactions (6 requests)
- ✅ List Transactions
- ✅ Create BUY Transaction
- ✅ Create SELL Transaction
- ✅ Get Transaction by ID
- ✅ Update Transaction
- ✅ Delete Transaction

**Toplam: 17 requests**

---

## 🧪 Test Senaryosu

### Senaryo: Tam Portfolio Flow

1. **Test Auth Status**
   - GET `/api/test-auth`
   - ✅ 200 OK beklenir

2. **Create Portfolio**
   - POST `/api/portfolios`
   - Body: `{"name": "My Portfolio"}`
   - ✅ `portfolio_id` otomatik kaydedilir

3. **Create Asset**
   - POST `/api/portfolios/{{portfolio_id}}/assets`
   - Body: `{"portfolio_id": "{{portfolio_id}}", "symbol": "AAPL", "quantity": 10, "average_buy_price": 150.50, "type": "STOCK"}`
   - ✅ `asset_id` otomatik kaydedilir

4. **Create BUY Transaction**
   - POST `/api/assets/{{asset_id}}/transactions`
   - Body: `{"asset_id": "{{asset_id}}", "type": "BUY", "amount": 5, "price": 155.00, "date": "2025-01-01T00:00:00Z"}`
   - ✅ `transaction_id` otomatik kaydedilir
   - ✅ Asset otomatik güncellenir (quantity: 15)

5. **Verify Asset Updated**
   - GET `/api/assets/{{asset_id}}`
   - ✅ Kontrol: `quantity` = 15 olmalı

6. **Get Portfolio with Nested Data**
   - GET `/api/portfolios/{{portfolio_id}}`
   - ✅ Portfolio içinde asset ve transaction'lar görünmeli

---

## 🔧 Özellikler

### Otomatik ID Kaydetme

Collection'daki test scriptleri otomatik olarak ID'leri environment'a kaydeder:
- `portfolio_id` → Create Portfolio sonrası
- `asset_id` → Create Asset sonrası
- `transaction_id` → Create Transaction sonrası

### Test Scripts

Her request'te test scriptleri var:
- ✅ Status code kontrolü
- ✅ Response validation
- ✅ ID kaydetme
- ✅ Response time kontrolü

### Pre-request Script

Collection seviyesinde Pre-request Script:
- Environment'daki `access_token` varsa otomatik cookie ekler
- Her request'te çalışır

---

## 🐛 Sorun Giderme

### 401 Unauthorized

**Sorun:** Cookie geçersiz veya eksik

**Çözüm:**
1. Browser'da tekrar login olun
2. Cookie'yi yeniden kopyalayın
3. Postman'de cookie'yi güncelleyin
4. VEYA Environment'daki `access_token` variable'ını güncelleyin

### 400 Bad Request

**Sorun:** Validation hatası

**Çözüm:**
1. Request body'yi kontrol edin
2. UUID formatını kontrol edin (`{{portfolio_id}}` gibi)
3. Required field'ları kontrol edin
4. Response'daki `details` field'ına bakın

### 404 Not Found

**Sorun:** Resource bulunamadı

**Çözüm:**
1. UUID'nin doğru olduğundan emin olun
2. Environment variable'ların set edildiğini kontrol edin
3. Resource'un size ait olduğundan emin olun

### Cookie Expire

**Sorun:** Cookie expire oldu (1 saat)

**Çözüm:**
1. Browser'da tekrar login olun
2. Yeni cookie'yi kopyalayın
3. Postman'de cookie'yi güncelleyin

---

## 💡 İpuçları

1. **Collection Runner:** Tüm request'leri sırayla çalıştırmak için Collection Runner kullanın
2. **Environment Variables:** Test sırasında ID'ler otomatik kaydedilir
3. **Test Scripts:** Her request'te test sonuçlarını kontrol edin
4. **Cookie Management:** Cookie expire olursa yenileyin
5. **Variables:** `{{base_url}}`, `{{portfolio_id}}` gibi variable'ları kullanın

---

## 📁 Dosya Konumları

- **Collection:** `docs/api/Portfolio-Tracker-API.postman_collection.json`
- **Environment:** `docs/api/Portfolio-Tracker-Local.postman_environment.json`
- **Detaylı Rehber:** `docs/api/POSTMAN_GUIDE.md`

---

## ✅ Hazır!

Collection ve Environment import edildikten sonra:

1. ✅ Environment'ı seçin
2. ✅ Cookie'yi ekleyin
3. ✅ Uygulamayı başlatın (`npm run dev`)
4. ✅ Request'leri test edin!

**İyi testler! 🚀**

