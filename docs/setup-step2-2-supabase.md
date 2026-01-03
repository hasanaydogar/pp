# Adım 2.2: Supabase'e Google OAuth2 Ekleme

## Yapılacaklar:

1. **Supabase Dashboard'a gidin:**
   - https://supabase.com/dashboard adresine gidin
   - Projenizi seçin (`personal-portfoy` veya oluşturduğunuz proje)

2. **Authentication → Providers sayfasına gidin:**
   - Sol menüden **Authentication** tıklayın
   - **Providers** sekmesine tıklayın
   - Sayfada birçok OAuth provider seçeneği göreceksiniz

3. **Google provider'ı bulun ve açın:**
   - Liste içinde **Google** provider'ını bulun
   - Google'ın yanındaki toggle'ı **açın** (Enable Google provider)

4. **Google OAuth2 bilgilerini girin:**
   - **Client ID (for OAuth)**: Google Cloud Console'dan aldığınız Client ID'yi yapıştırın
     - Format: `xxxxx.apps.googleusercontent.com`
   - **Client Secret (for OAuth)**: Google Cloud Console'dan aldığınız Client Secret'ı yapıştırın
     - Format: `GOCSPX-xxxxx`

5. **Redirect URL'leri kontrol edin:**
   - Supabase otomatik olarak redirect URL'i oluşturur
   - Format: `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Bu URL'in Google Cloud Console'da "Authorized redirect URIs" listesinde olduğundan emin olun
   - Eğer yoksa, Google Cloud Console'a gidip ekleyin

6. **Kaydedin:**
   - "Save" veya "Update" butonuna tıklayın
   - Başarılı mesajı görmelisiniz

7. **Test edin (isteğe bağlı):**
   - Supabase Dashboard'da **Authentication** → **Users** sayfasına gidin
   - "Add user" → "Sign in with OAuth" seçeneğini görebilirsiniz
   - (Şimdilik test etmeye gerek yok, kod yazdıktan sonra test edeceğiz)

---

## ⚠️ Önemli Kontroller:

- ✅ Google provider toggle'ı **açık** olmalı
- ✅ Client ID doğru girilmiş olmalı
- ✅ Client Secret doğru girilmiş olmalı
- ✅ Redirect URL Google Cloud Console'da kayıtlı olmalı

---

## ✅ Adım 2.2 Tamamlandı mı?

Bu adımı tamamladığınızda:
- ✅ Supabase'de Google provider açıldı
- ✅ Client ID ve Client Secret girildi
- ✅ Redirect URL'ler doğru yapılandırıldı

"tamamladım" yazın, Google OAuth2 yapılandırmasını test edelim ve sonra diğer provider'lara (Apple, GitHub) geçelim.

