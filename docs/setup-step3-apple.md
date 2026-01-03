# Adım 3: Apple Sign In Yapılandırması

## Adım 3.1: Apple Developer Hesabı ve App ID Oluşturma

**Not:** Apple Sign In için Apple Developer Program üyeliği gereklidir (yıllık $99). Eğer Apple Developer hesabınız yoksa, bu adımı şimdilik atlayıp GitHub OAuth2'ye geçebiliriz.

1. **Apple Developer hesabınız varsa devam edin:**
   - https://developer.apple.com/account adresine gidin
   - Apple ID'nizle giriş yapın

2. **App ID oluşturun:**
   - **Certificates, Identifiers & Profiles** → **Identifiers** seçin
   - "+" butonuna tıklayın
   - **App IDs** seçin → "Continue"
   - **Description**: `Personal Portfoy` (veya istediğiniz isim)
   - **Bundle ID**: `com.yourname.personalportfoy` (ters domain formatında, örn: `com.hasan.personalportfoy`)
   - **Capabilities** altında **Sign In with Apple** seçeneğini işaretleyin
   - "Continue" → "Register" butonuna tıklayın

3. **Service ID oluşturun:**
   - **Identifiers** sayfasında **Services IDs** seçin
   - "+" butonuna tıklayın
   - **Description**: `Personal Portfoy Web`
   - **Identifier**: `com.yourname.personalportfoy.web` (veya benzer)
   - "Continue" → "Register"
   - Oluşturulan Service ID'yi tıklayın
   - **Sign In with Apple** seçeneğini işaretleyin → "Configure"
   - **Primary App ID**: Az önce oluşturduğunuz App ID'yi seçin
   - **Website URLs**:
     - **Domains and Subdomains**: `supabase.co` (veya kendi domain'iniz)
     - **Return URLs**: `https://pnmisbgmzdceaoysmdbdc.supabase.co/auth/v1/callback`
       - ⚠️ Bu URL'deki `pnmisbgmzdceaoysmdbdc` kısmını kendi Supabase Project URL'inizle değiştirin!
   - "Save" → "Continue" → "Save"

4. **Key oluşturun:**
   - **Keys** → "+" butonuna tıklayın
   - **Key Name**: `Personal Portfoy Apple Sign In`
   - **Sign In with Apple** seçeneğini işaretleyin → "Configure"
   - **Primary App ID**: App ID'nizi seçin
   - "Save" → "Continue" → "Register"
   - ⚠️ **ÖNEMLİ**: Key ID'yi not edin ve Key dosyasını (.p8) indirin! (Sadece bir kez gösterilir)

---

## Adım 3.2: Supabase'e Apple Sign In Ekleme

1. **Supabase Dashboard'a gidin:**
   - Authentication → Providers → **Apple** seçin

2. **Apple bilgilerini girin:**
   - **Enable Apple provider**: Toggle'ı açın
   - **Service ID**: Apple Developer'dan aldığınız Service ID'yi girin
   - **Secret Key**: İndirdiğiniz .p8 dosyasının içeriğini yapıştırın
   - **Key ID**: Apple Developer'dan aldığınız Key ID'yi girin
   - **Team ID**: Apple Developer hesabınızın Team ID'sini girin (Apple Developer sayfasının üst kısmında görünür)

3. **Kaydedin:**
   - "Save" butonuna tıklayın

---

## ⚠️ Apple Sign In Notları:

- Apple Sign In için Apple Developer Program üyeliği gereklidir ($99/yıl)
- Eğer Apple Developer hesabınız yoksa, bu adımı atlayabilirsiniz
- Google ve GitHub OAuth2 ile devam edebiliriz

---

## ✅ Adım 3 Tamamlandı mı?

Apple Developer hesabınız varsa ve yapılandırmayı tamamladıysanız "tamamladım" yazın.

**Eğer Apple Developer hesabınız yoksa veya şimdilik atlamak istiyorsanız**, "atlayalım" yazın, GitHub OAuth2'ye geçelim.

