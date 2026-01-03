# Supabase API Keys Nerede Bulunur?

## Supabase Dashboard'da API Keys'i Bulma

1. **Settings → API** sayfasına gidin
   - Sol menüden **Settings** (⚙️) tıklayın
   - **API** sekmesine tıklayın

2. **Project URL** (Zaten buldunuz ✅)
   - Sayfanın üstünde "Project URL" olarak görünür
   - Örnek: `https://xxxxx.supabase.co`

3. **Project API keys** bölümüne bakın
   - Sayfada "Project API keys" veya "API Keys" başlığı altında:
   
   **anon/public key:**
   - "anon" veya "public" etiketiyle görünür
   - Bazen "Project API keys" altında "anon" veya "public" olarak listelenir
   - Bu key'i kopyalayın → `.env.local` dosyasındaki `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerine yapıştırın

   **service_role key:**
   - "service_role" etiketiyle görünür
   - ⚠️ Genellikle gizlidir ve "Reveal" veya "Show" butonuyla gösterilir
   - "Reveal" butonuna tıklayın
   - Bu key'i kopyalayın → `.env.local` dosyasındaki `SUPABASE_SERVICE_ROLE_KEY` değerine yapıştırın

## Alternatif: Eğer "anon" ve "service_role" görmüyorsanız

Bazı Supabase versiyonlarında:
- **anon key** = "Project API keys" altındaki ilk key (public key)
- **service_role key** = "Project API keys" altındaki ikinci key (service role key)

Veya:
- **anon key** = "public" veya "anon" yazan key
- **service_role key** = "service_role" yazan key (genellikle gizli)

## Görsel Yardım

Supabase API sayfasında şöyle görünmelidir:

```
Project URL: https://xxxxx.supabase.co

Project API keys:
┌─────────────────────────────────────────┐
│ anon / public                          │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...│ ← Bu anon key
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ service_role                            │
│ [Reveal] ← Bu butona tıklayın          │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...│ ← Bu service_role key
└─────────────────────────────────────────┘
```

## Hala Bulamıyorsanız

Eğer hala bulamıyorsanız, Supabase dashboard'da gördüğünüz ekran görüntüsünü paylaşabilirsiniz veya şunları kontrol edin:

1. **Settings → API** sayfasında mısınız?
2. Sayfayı aşağı kaydırdınız mı? (Keys bazen sayfanın altında olabilir)
3. "Project API keys" başlığını görüyor musunuz?

