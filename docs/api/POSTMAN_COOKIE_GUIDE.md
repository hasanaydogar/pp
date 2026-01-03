# Postman Cookie Setup Rehberi

## 🔍 Supabase Cookie'leri Nasıl Bulunur?

Browser'da görünen cookie'ler Supabase SSR tarafından otomatik oluşturulur. İki cookie vardır:

1. `sb-<project-ref>-auth-token.0` - İlk cookie (büyük data)
2. `sb-<project-ref>-auth-token.1` - İkinci cookie (devam eden data)

**Örnek:** `sb-pnmisbgmzdceaoysmbdc-auth-token.0` ve `.1`

## 📋 Adım Adım Cookie Kopyalama

### 1. Browser'da Login Olun

```
http://localhost:3000/login
```

Google ile giriş yapın.

### 2. DevTools'u Açın

- **F12** tuşuna basın
- **Application** tab'ına gidin
- Sol menüden **Cookies** → `http://localhost:3000` seçin

### 3. Cookie'leri Bulun

Cookie listesinde şu formatta cookie'leri arayın:
- `sb-<project-ref>-auth-token.0`
- `sb-<project-ref>-auth-token.1`

**Not:** `<project-ref>` kısmı Supabase project referansınızdır (örn: `pnmisbgmzdceaoysmbdc`)

### 4. Cookie Value'larını Kopyalayın

Her iki cookie için:
1. Cookie'ye tıklayın
2. **Cookie Value** alanındaki tüm değeri kopyalayın
3. Bu değer çok uzun bir Base64 string olacak

### 5. Postman'de Cookie Ekleyin

#### Yöntem A: Postman Cookie Manager

1. Postman'de herhangi bir request'e gidin
2. Request'in altında **Cookies** linkine tıklayın
3. `http://localhost:3000` için **iki cookie ekleyin:**

   **Cookie 1:**
   ```
   Name: sb-pnmisbgmzdceaoysmbdc-auth-token.0
   Value: [.0 cookie'sinin tam value'su - çok uzun string]
   Domain: localhost
   Path: /
   ```

   **Cookie 2:**
   ```
   Name: sb-pnmisbgmzdceaoysmbdc-auth-token.1
   Value: [.1 cookie'sinin tam value'su - çok uzun string]
   Domain: localhost
   Path: /
   ```

4. **Save** butonuna tıklayın

#### Yöntem B: Request Headers (Alternatif)

Eğer cookie manager çalışmazsa, request header'ına ekleyebilirsiniz:

1. Request → **Headers** tab'ına gidin
2. Şu header'ı ekleyin:
   ```
   Cookie: sb-pnmisbgmzdceaoysmbdc-auth-token.0=<value-0>; sb-pnmisbgmzdceaoysmbdc-auth-token.1=<value-1>
   ```

## ✅ Doğrulama

Cookie'leri ekledikten sonra:

1. **Test Auth Status** request'ini çalıştırın:
   ```
   GET {{base_url}}/api/test-auth
   ```

2. **200 OK** almalısınız ve response'da user bilgileri görünmeli

3. Eğer **401 Unauthorized** alırsanız:
   - Cookie'lerin doğru kopyalandığından emin olun
   - Her iki cookie'nin de eklendiğinden emin olun
   - Cookie'lerin expire olmadığından emin olun (yeniden login gerekebilir)

## 🔄 Cookie Expire Olursa

Cookie'ler expire olabilir. Yenilemek için:

1. Browser'da tekrar login olun
2. Yeni cookie'leri kopyalayın
3. Postman'de cookie'leri güncelleyin

## 💡 İpuçları

1. **Cookie Value Çok Uzun:** Normal! Supabase cookie'leri Base64 encoded JSON içerir, çok uzun olabilir.

2. **Her İki Cookie Gerekli:** Supabase SSR iki cookie kullanır, her ikisini de eklemelisiniz.

3. **Project Ref Bulma:** Cookie ismindeki `<project-ref>` kısmını Supabase dashboard'dan veya `.env.local` dosyasındaki URL'den bulabilirsiniz:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   ```

4. **Cookie Manager Kullanın:** Postman'in Cookie Manager'ı cookie'leri otomatik yönetir, header'a manuel eklemekten daha kolaydır.

## 🐛 Sorun Giderme

### Cookie'ler Görünmüyor

- Browser'da login olduğunuzdan emin olun
- DevTools'da **Application** → **Cookies** → `http://localhost:3000` yolunu takip edin
- Cookie'ler `sb-` ile başlamalı

### 401 Unauthorized

- Her iki cookie'nin de eklendiğinden emin olun (`.0` ve `.1`)
- Cookie value'larının tam kopyalandığından emin olun
- Cookie'lerin expire olmadığından emin olun
- Domain'in `localhost` olduğundan emin olun

### Cookie Value Çok Uzun

- Normal! Tüm value'yu kopyalayın, kısaltmayın
- Base64 encoded string çok uzun olabilir

---

**Son Güncelleme:** 2025-11-30

