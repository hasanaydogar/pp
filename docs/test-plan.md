# Test Plan: OAuth2 Authentication

## Şu Anda Test Edebileceğimiz Şeyler:

### ✅ Hazır Olanlar:
1. **Supabase Client Bağlantısı**
   - Server ve client Supabase instance'ları çalışıyor
   - Environment variables yüklü

2. **Auth Actions**
   - `signInWithProvider()` fonksiyonu hazır
   - `signOut()` fonksiyonu hazır
   - `getCurrentUser()` fonksiyonu hazır

### ❌ Eksik Olanlar (Test için gerekli):
1. **Login Sayfası** - Google ile giriş butonu
2. **Callback Route Handler** - OAuth2 redirect'i işleyecek endpoint
3. **Test Sayfası** - Kullanıcı bilgilerini gösterecek sayfa

## Test Senaryosu:

Eğer şimdi test edersek görebileceğimiz:

### Senaryo 1: Login Sayfası Olmadan
- ❌ Hiçbir şey göremeyiz çünkü login butonu yok
- ❌ OAuth2 flow'u başlatamayız

### Senaryo 2: Minimum Test Setup İle (5-10 dakika)
✅ **Görebileceğimiz:**
1. **Login Sayfası** (`/login`)
   - Google ile giriş butonu
   - Butona tıklayınca Google OAuth2 sayfasına yönlendirme

2. **OAuth2 Flow**
   - Google'a yönlendirme çalışıyor mu?
   - Google'dan geri dönüş çalışıyor mu?
   - Token'lar alınıyor mu?

3. **Callback İşleme**
   - `/auth/callback` route'una yönlendirme
   - Token'ların Supabase'e kaydedilmesi
   - Kullanıcı bilgilerinin alınması

4. **Kullanıcı Bilgileri**
   - Email, isim, avatar gibi bilgiler
   - Authentication durumu

### Senaryo 3: Tam Test Setup İle
✅ **Ek olarak görebileceğimiz:**
1. **Profile Sayfası**
   - Kullanıcı bilgilerinin gösterilmesi
   - Logout butonu

2. **Route Protection**
   - Giriş yapmamış kullanıcıların yönlendirilmesi
   - Giriş yapmış kullanıcıların erişimi

3. **Token Management**
   - Token refresh çalışıyor mu?
   - Token'lar cookie'lerde saklanıyor mu?

## Öneri:

**Minimum test setup'ı oluşturalım (5-10 dakika):**
1. Basit login sayfası (`/login`) - Google butonu
2. Callback route handler (`/auth/callback`) - OAuth2 redirect'i işle
3. Basit test sayfası (`/test`) - Kullanıcı bilgilerini göster

Bu şekilde:
- ✅ Google OAuth2 flow'unun çalışıp çalışmadığını görebiliriz
- ✅ Supabase yapılandırmasının doğru olup olmadığını test edebiliriz
- ✅ Token'ların alınıp alınmadığını kontrol edebiliriz

Sonra tam UI'ı (Phase 5) oluşturabiliriz.

---

## Seçenekler:

**A) Minimum test setup oluştur (5-10 dk)**
- Login sayfası + Callback handler + Test sayfası
- Hızlı test için yeterli

**B) Tam UI'ı oluştur (Phase 5 görevleri)**
- Daha uzun sürer ama production-ready olur

**C) Şimdilik kod yazmaya devam et**
- Phase 3 ve 4'ü tamamla, sonra test et

Hangisini tercih edersiniz?

