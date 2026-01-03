# Adım 1: Supabase Projesi Oluşturma ve API Keys Alma

## Yapılacaklar:

1. **Supabase hesabına giriş yapın:**
   - https://supabase.com adresine gidin
   - Hesabınız yoksa "Start your project" ile ücretsiz hesap oluşturun
   - Giriş yapın

2. **Yeni proje oluşturun:**
   - Dashboard'da "New Project" butonuna tıklayın
   - **Project Name**: `personal-portfoy` (veya istediğiniz bir isim)
   - **Database Password**: Güçlü bir şifre belirleyin (⚠️ KAYDEDİN!)
   - **Region**: Size en yakın bölgeyi seçin (örn: `West US`, `Europe West`)
   - "Create new project" butonuna tıklayın
   - ⏳ Projenin hazır olması 1-2 dakika sürebilir

3. **API Keys'i alın:**
   - Proje hazır olduğunda, sol menüden **Settings** → **API** seçin
   - **Project URL** değerini kopyalayın (örn: `https://xxxxx.supabase.co`)
   - **anon/public key** değerini kopyalayın (JWT Secret'ın altında, "anon" veya "public" yazan)
   - **service_role key** değerini kopyalayın (⚠️ Bu key'i güvenli tutun, public'e açmayın!)

4. **Environment variables'ı güncelleyin:**
   - Proje klasöründe `.env.local` dosyasını açın
   - Aşağıdaki değerleri Supabase'den aldığınız değerlerle değiştirin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. **Doğrulama:**
   - `.env.local` dosyasını kaydedin
   - Terminal'de şu komutu çalıştırın: `npm run dev`
   - Hata olmadan çalışıyorsa Adım 1 tamamlandı! ✅

---

## ⚠️ Önemli Notlar:

- **Database Password**: Bu şifreyi kaydedin, unutursanız projeye erişemezsiniz
- **service_role key**: Bu key'e sahip olanlar veritabanınıza tam erişim sağlar, asla public'e açmayın
- **anon key**: Bu key public olabilir, frontend'de kullanılır

---

## ✅ Adım 1 Tamamlandı mı?

Bu adımı tamamladığınızda, `.env.local` dosyasını güncelledikten sonra bana "tamamladım" yazın, bir sonraki adıma geçelim.

