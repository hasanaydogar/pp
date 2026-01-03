# Adım 2: Google OAuth2 Yapılandırması

## Adım 2.1: Google Cloud Console'da Proje Oluşturma

1. **Google Cloud Console'a gidin:**
   - https://console.cloud.google.com adresine gidin
   - Google hesabınızla giriş yapın

2. **Yeni proje oluşturun:**
   - Üst kısımdaki proje seçiciye tıklayın
   - "New Project" butonuna tıklayın
   - **Project name**: `personal-portfoy` (veya istediğiniz bir isim)
   - **Location**: "No organization" seçin (veya organizasyonunuz varsa onu seçin)
   - "Create" butonuna tıklayın
   - ⏳ Projenin oluşturulması birkaç saniye sürebilir

3. **OAuth Consent Screen'i yapılandırın:**
   - Sol menüden **APIs & Services** → **OAuth consent screen** seçin
   - **User Type** seçin:
     - **External** seçin (genel kullanım için)
     - "Create" butonuna tıklayın
   - **App information** doldurun:
     - **App name**: `Personal Portfoy` (veya istediğiniz isim)
     - **User support email**: Email adresinizi seçin
     - **Developer contact information**: Email adresinizi girin
     - "Save and Continue" butonuna tıklayın
   - **Scopes** sayfasında:
     - "Add or Remove Scopes" butonuna tıklayın
     - Şu scope'ları ekleyin:
       - `.../auth/userinfo.email`
       - `.../auth/userinfo.profile`
     - "Update" butonuna tıklayın
     - "Save and Continue" butonuna tıklayın
   - **Test users** sayfasında (isteğe bağlı):
     - Test için kendi email adresinizi ekleyebilirsiniz
     - "Save and Continue" butonuna tıklayın
   - **Summary** sayfasında:
     - Bilgileri kontrol edin
     - "Back to Dashboard" butonuna tıklayın

4. **OAuth2 Credentials oluşturun:**
   - Sol menüden **APIs & Services** → **Credentials** seçin
   - Üst kısımdan "+ CREATE CREDENTIALS" butonuna tıklayın
   - "OAuth client ID" seçin
   - **Application type**: "Web application" seçin
   - **Name**: `Personal Portfoy Web Client` (veya istediğiniz isim)
   - **Authorized JavaScript origins**:
     - "ADD URI" butonuna tıklayın
     - `http://localhost:3000` ekleyin
     - (Production için daha sonra production URL'inizi ekleyebilirsiniz)
   - **Authorized redirect URIs**:
     - "ADD URI" butonuna tıklayın
     - Şu URL'yi ekleyin: `https://pnmisbgmzdceaoysmdbdc.supabase.co/auth/v1/callback`
     - ⚠️ Bu URL'deki `pnmisbgmzdceaoysmdbdc` kısmını kendi Supabase Project URL'inizle değiştirin!
   - "Create" butonuna tıklayın
   - ⚠️ **ÖNEMLİ**: Açılan pencerede **Client ID** ve **Client Secret** değerlerini kopyalayın ve güvenli bir yere kaydedin!

5. **Client ID ve Client Secret'ı not edin:**
   - **Client ID**: `xxxxx.apps.googleusercontent.com` formatında
   - **Client Secret**: `GOCSPX-xxxxx` formatında
   - Bu değerleri bir sonraki adımda kullanacağız

---

## ✅ Adım 2.1 Tamamlandı mı?

Bu adımı tamamladığınızda:
- ✅ Google Cloud Console'da proje oluşturuldu
- ✅ OAuth Consent Screen yapılandırıldı
- ✅ OAuth2 Credentials oluşturuldu
- ✅ Client ID ve Client Secret alındı

"tamamladım" yazın, bir sonraki adıma (Supabase'e Google OAuth2 ekleme) geçelim.

