# Postman ile API Test Rehberi

Bu rehber, Portfolio Tracker API'yi Postman ile test etmek için adım adım talimatlar içerir.

## 📋 İçindekiler

1. [Ön Hazırlık](#ön-hazırlık)
2. [Postman Collection Kurulumu](#postman-collection-kurulumu)
3. [Authentication Setup](#authentication-setup)
4. [Environment Variables](#environment-variables)
5. [Endpoint Testleri](#endpoint-testleri)
6. [Test Scripts](#test-scripts)

---

## Ön Hazırlık

### 1. Gerekli Bilgiler

- **Base URL:** `http://localhost:3000` (development için)
- **Supabase URL:** `.env.local` dosyasından `NEXT_PUBLIC_SUPABASE_URL`
- **Supabase Anon Key:** `.env.local` dosyasından `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Uygulamayı Başlatın

```bash
cd personal-portfoy
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışmalı.

---

## Postman Collection Kurulumu

### 1. Yeni Collection Oluşturun

1. Postman'i açın
2. **New** → **Collection** seçin
3. Collection adı: `Portfolio Tracker API`

### 2. Collection'a Folder'lar Ekleyin

Şu folder'ları oluşturun:
- `01. Authentication`
- `02. Portfolios`
- `03. Assets`
- `04. Transactions`

---

## Authentication Setup

### Yöntem 1: Browser'dan Cookie Kopyalama (Önerilen)

1. **Browser'da Login Olun:**
   - `http://localhost:3000/login` adresine gidin
   - Google ile giriş yapın
   - Başarılı login sonrası bir sayfaya yönlendirileceksiniz

2. **Cookie'leri Kopyalayın:**
   - Browser DevTools'u açın (F12)
   - **Application** tab → **Cookies** → `http://localhost:3000`
   - Supabase cookie'lerini bulun (şu formatta):
     - `sb-<project-ref>-auth-token.0` (örn: `sb-pnmisbgmzdceaoysmbdc-auth-token.0`)
     - `sb-<project-ref>-auth-token.1` (örn: `sb-pnmisbgmzdceaoysmbdc-auth-token.1`)
   - **Her iki cookie'nin de Value kısmını kopyalayın**

3. **Postman'de Cookie Ekleyin:**
   - Postman'de request'in altında **Cookies** linkine tıklayın
   - `http://localhost:3000` için **her iki cookie'yi de** ekleyin:
     
     **Cookie 1:**
     - Name: `sb-pnmisbgmzdceaoysmbdc-auth-token.0` (kendi project ref'inizle değiştirin)
     - Value: (browser'dan kopyaladığınız `.0` cookie'sinin value'su)
     - Domain: `localhost`
     - Path: `/`
     
     **Cookie 2:**
     - Name: `sb-pnmisbgmzdceaoysmbdc-auth-token.1` (kendi project ref'inizle değiştirin)
     - Value: (browser'dan kopyaladığınız `.1` cookie'sinin value'su)
     - Domain: `localhost`
     - Path: `/`

   **Önemli:** Supabase SSR iki cookie kullanır (`.0` ve `.1`), **her ikisini de** eklemeniz gerekir!

### Yöntem 2: Postman'de OAuth2 Flow (Alternatif)

1. **Pre-request Script ile Token Alma:**
   - Collection → **Pre-request Script** tab'ına gidin
   - Aşağıdaki script'i ekleyin (Supabase OAuth2 için)

---

## Environment Variables

### Environment Oluşturun

1. Postman'de **Environments** → **+** tıklayın
2. Environment adı: `Portfolio Tracker Local`
3. Şu variables'ları ekleyin:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `access_token` | (boş bırakın) | (cookie'den alınacak) |
| `portfolio_id` | (boş bırakın) | (test sırasında set edilecek) |
| `asset_id` | (boş bırakın) | (test sırasında set edilecek) |
| `transaction_id` | (boş bırakın) | (test sırasında set edilecek) |

---

## Endpoint Testleri

### 01. Authentication

#### Test Auth Status
- **Method:** GET
- **URL:** `{{base_url}}/api/test-auth`
- **Headers:** (Cookie otomatik gönderilir)
- **Expected:** 200 OK, user bilgileri

---

### 02. Portfolios

#### 1. List Portfolios
- **Method:** GET
- **URL:** `{{base_url}}/api/portfolios`
- **Headers:** 
  - Cookie: `sb-access-token={{access_token}}`
- **Expected:** 200 OK, portfolios array

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has data array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.be.an('array');
});
```

#### 2. Create Portfolio
- **Method:** POST
- **URL:** `{{base_url}}/api/portfolios`
- **Headers:**
  - `Content-Type: application/json`
  - Cookie: `sb-access-token={{access_token}}`
- **Body (JSON):**
```json
{
  "name": "Test Portfolio"
}
```

**Test Script:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Portfolio created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data.name).to.eql("Test Portfolio");
    
    // Save portfolio_id for next requests
    pm.environment.set("portfolio_id", jsonData.data.id);
});
```

#### 3. Get Portfolio by ID
- **Method:** GET
- **URL:** `{{base_url}}/api/portfolios/{{portfolio_id}}`
- **Headers:**
  - Cookie: `sb-access-token={{access_token}}`
- **Expected:** 200 OK, portfolio with nested assets and transactions

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Portfolio has nested assets", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('assets');
    pm.expect(jsonData.data.assets).to.be.an('array');
});
```

#### 4. Update Portfolio
- **Method:** PUT
- **URL:** `{{base_url}}/api/portfolios/{{portfolio_id}}`
- **Headers:**
  - `Content-Type: application/json`
  - Cookie: `sb-access-token={{access_token}}`
- **Body (JSON):**
```json
{
  "name": "Updated Portfolio Name"
}
```

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Portfolio name updated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.name).to.eql("Updated Portfolio Name");
});
```

#### 5. Delete Portfolio
- **Method:** DELETE
- **URL:** `{{base_url}}/api/portfolios/{{portfolio_id}}`
- **Headers:**
  - Cookie: `sb-access-token={{access_token}}`
- **Expected:** 200 OK, success message

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Portfolio deleted", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
});
```

---

### 03. Assets

#### 1. List Assets in Portfolio
- **Method:** GET
- **URL:** `{{base_url}}/api/portfolios/{{portfolio_id}}/assets`
- **Headers:**
  - Cookie: `sb-access-token={{access_token}}`
- **Expected:** 200 OK, assets array

#### 2. Create Asset
- **Method:** POST
- **URL:** `{{base_url}}/api/portfolios/{{portfolio_id}}/assets`
- **Headers:**
  - `Content-Type: application/json`
  - Cookie: `sb-access-token={{access_token}}`
- **Body (JSON):**
```json
{
  "portfolio_id": "{{portfolio_id}}",
  "symbol": "AAPL",
  "quantity": 10,
  "average_buy_price": 150.50,
  "type": "STOCK"
}
```

**Test Script:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Asset created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data.symbol).to.eql("AAPL");
    
    // Save asset_id for next requests
    pm.environment.set("asset_id", jsonData.data.id);
});
```

#### 3. Get Asset by ID
- **Method:** GET
- **URL:** `{{base_url}}/api/assets/{{asset_id}}`
- **Headers:**
  - Cookie: `sb-access-token={{access_token}}`
- **Expected:** 200 OK, asset with nested transactions

#### 4. Update Asset
- **Method:** PUT
- **URL:** `{{base_url}}/api/assets/{{asset_id}}`
- **Headers:**
  - `Content-Type: application/json`
  - Cookie: `sb-access-token={{access_token}}`
- **Body (JSON):**
```json
{
  "quantity": 15,
  "average_buy_price": 155.00
}
```

#### 5. Delete Asset
- **Method:** DELETE
- **URL:** `{{base_url}}/api/assets/{{asset_id}}`
- **Headers:**
  - Cookie: `sb-access-token={{access_token}}`

---

### 04. Transactions

#### 1. List Transactions
- **Method:** GET
- **URL:** `{{base_url}}/api/assets/{{asset_id}}/transactions?limit=10&offset=0&order=desc`
- **Headers:**
  - Cookie: `sb-access-token={{access_token}}`
- **Expected:** 200 OK, transactions array with count

#### 2. Create BUY Transaction
- **Method:** POST
- **URL:** `{{base_url}}/api/assets/{{asset_id}}/transactions`
- **Headers:**
  - `Content-Type: application/json`
  - Cookie: `sb-access-token={{access_token}}`
- **Body (JSON):**
```json
{
  "asset_id": "{{asset_id}}",
  "type": "BUY",
  "amount": 5,
  "price": 155.00,
  "date": "2025-01-01T00:00:00Z",
  "transaction_cost": 1.50
}
```

**Test Script:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("BUY transaction created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.type).to.eql("BUY");
    
    // Save transaction_id
    pm.environment.set("transaction_id", jsonData.data.id);
    
    // Verify asset was updated (check asset endpoint)
    // Note: This requires a separate request to GET /api/assets/{{asset_id}}
});
```

**Önemli:** BUY transaction sonrası asset'in `quantity` ve `average_buy_price` değerleri otomatik güncellenir. Bunu doğrulamak için asset'i tekrar GET edin.

#### 3. Create SELL Transaction
- **Method:** POST
- **URL:** `{{base_url}}/api/assets/{{asset_id}}/transactions`
- **Headers:**
  - `Content-Type: application/json`
  - Cookie: `sb-access-token={{access_token}}`
- **Body (JSON):**
```json
{
  "asset_id": "{{asset_id}}",
  "type": "SELL",
  "amount": 3,
  "price": 160.00,
  "date": "2025-01-02T00:00:00Z",
  "transaction_cost": 1.00
}
```

**Not:** SELL transaction asset'i güncellemez, sadece transaction kaydı oluşturur.

#### 4. Get Transaction by ID
- **Method:** GET
- **URL:** `{{base_url}}/api/transactions/{{transaction_id}}`
- **Headers:**
  - Cookie: `sb-access-token={{access_token}}`

#### 5. Update Transaction
- **Method:** PUT
- **URL:** `{{base_url}}/api/transactions/{{transaction_id}}`
- **Headers:**
  - `Content-Type: application/json`
  - Cookie: `sb-access-token={{access_token}}`
- **Body (JSON):**
```json
{
  "price": 165.00,
  "transaction_cost": 2.00
}
```

#### 6. Delete Transaction
- **Method:** DELETE
- **URL:** `{{base_url}}/api/transactions/{{transaction_id}}`
- **Headers:**
  - Cookie: `sb-access-token={{access_token}}`

---

## Test Scripts

### Collection Pre-request Script

Collection seviyesinde cookie'leri otomatik eklemek için:

```javascript
// Collection Pre-request Script
// Cookie'leri otomatik ekle
const accessToken = pm.environment.get("access_token");
if (accessToken) {
    pm.request.headers.add({
        key: 'Cookie',
        value: `sb-access-token=${accessToken}`
    });
}
```

### Common Test Scripts

Her request için kullanabileceğiniz ortak test scriptleri:

```javascript
// Authentication check
pm.test("Not unauthorized", function () {
    pm.expect(pm.response.code).to.not.equal(401);
});

// Response time check
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// JSON response check
pm.test("Response is JSON", function () {
    pm.response.to.be.json;
});
```

---

## Hızlı Test Senaryosu

### Senaryo: Portfolio Oluştur → Asset Ekle → Transaction Kaydet

1. **Create Portfolio**
   - POST `/api/portfolios`
   - Body: `{"name": "My Test Portfolio"}`
   - `portfolio_id` environment'a kaydedilir

2. **Create Asset**
   - POST `/api/portfolios/{{portfolio_id}}/assets`
   - Body: `{"portfolio_id": "{{portfolio_id}}", "symbol": "AAPL", "quantity": 10, "average_buy_price": 150.50, "type": "STOCK"}`
   - `asset_id` environment'a kaydedilir

3. **Create BUY Transaction**
   - POST `/api/assets/{{asset_id}}/transactions`
   - Body: `{"asset_id": "{{asset_id}}", "type": "BUY", "amount": 5, "price": 155.00, "date": "2025-01-01T00:00:00Z"}`
   - `transaction_id` environment'a kaydedilir

4. **Verify Asset Updated**
   - GET `/api/assets/{{asset_id}}`
   - Kontrol: `quantity` = 15, `average_buy_price` güncellenmiş olmalı

5. **Get Portfolio with Nested Data**
   - GET `/api/portfolios/{{portfolio_id}}`
   - Kontrol: Portfolio içinde asset ve transaction'lar görünmeli

---

## Sorun Giderme

### 401 Unauthorized Hatası

**Sorun:** Cookie geçersiz veya eksik

**Çözüm:**
1. Browser'da tekrar login olun
2. Cookie'leri yeniden kopyalayın
3. Postman'de cookie'leri güncelleyin

### 400 Bad Request Hatası

**Sorun:** Validation hatası

**Çözüm:**
1. Request body'yi kontrol edin
2. UUID formatını kontrol edin
3. Required field'ları kontrol edin
4. Response'daki `details` field'ına bakın

### 404 Not Found Hatası

**Sorun:** Resource bulunamadı veya başka kullanıcıya ait

**Çözüm:**
1. UUID'nin doğru olduğundan emin olun
2. Resource'un sizin kullanıcınıza ait olduğundan emin olun
3. RLS policy'lerin çalıştığını kontrol edin

---

## Postman Collection Export

Collection'ı export edip paylaşmak için:

1. Collection'a sağ tıklayın
2. **Export** seçin
3. **Collection v2.1** formatını seçin
4. Dosyayı kaydedin

Collection dosyası: `docs/api/postman-collection.json` (opsiyonel)

---

## Örnek Request'ler

### Tam Örnek: Portfolio Oluşturma

```
POST http://localhost:3000/api/portfolios
Content-Type: application/json
Cookie: sb-access-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "name": "My Investment Portfolio"
}
```

### Tam Örnek: Asset Oluşturma

```
POST http://localhost:3000/api/portfolios/123e4567-e89b-12d3-a456-426614174000/assets
Content-Type: application/json
Cookie: sb-access-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "portfolio_id": "123e4567-e89b-12d3-a456-426614174000",
  "symbol": "BTC",
  "quantity": 0.5,
  "average_buy_price": 45000.00,
  "type": "CRYPTO"
}
```

---

## İpuçları

1. **Cookie Management:** Cookie'ler expire olabilir, düzenli kontrol edin
2. **Environment Variables:** Test sırasında ID'leri environment'a kaydedin
3. **Test Scripts:** Her request için test scriptleri yazın
4. **Collection Runner:** Tüm request'leri sırayla çalıştırmak için Collection Runner kullanın
5. **Variables:** Dynamic değerler için environment variables kullanın

---

**Son Güncelleme:** 2025-11-30

