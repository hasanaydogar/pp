# Specification: URL Structure Redesign

## Feature ID: 010-url-structure
## Version: 1.0
## Status: DRAFT

---

## 1. Overview

### 1.1 Summary
URL yapısını daha okunabilir ve SEO-friendly hale getirme. Portfolio seçildiğinde o portfolyonun dashboard'una yönlendirme ve URL'de portfolio/asset bilgisini gösterme.

### 1.2 Goals
- Portföy seçildiğinde `/p/[slug]` formatında URL
- Asset detayında `/p/[slug]/[symbol]` formatında URL  
- UUID yerine okunabilir slug/sembol kullanımı
- Sidebar'dan portföy seçince ilgili dashboard'a yönlendirme
- URL'den hangi portföyde olduğumuz anlaşılabilmeli

### 1.3 Non-Goals
- Mevcut UUID bazlı URL'leri tamamen kaldırma (geriye uyumluluk)
- Portfolio slug'larının benzersizlik validasyonu (ileride)

---

## 2. URL Yapısı

### 2.1 Mevcut Yapı
```
/dashboard                              → Genel dashboard
/portfolios                             → Portfolio listesi
/portfolios/[uuid]                      → Portfolio detayı
/assets/[uuid]                          → Asset detayı
/assets/[uuid]/transactions/new         → Yeni transaction
```

### 2.2 Yeni Yapı
```
/p/[slug]                               → Portfolio dashboard
/p/[slug]/[symbol]                      → Asset detayı
/p/[slug]/[symbol]/transactions/new     → Yeni transaction
/p/[slug]/[symbol]/edit                 → Asset düzenleme
/p/[slug]/settings                      → Portfolio ayarları (opsiyonel)
```

### 2.3 Slug Oluşturma

**Portfolio Slug:**
- Kullanıcı tarafından manuel olarak girilebilir (custom slug)
- Eğer kullanıcı girmezse, otomatik olarak isimden türetilir
- Slug düzenlenebilir (portfolio edit sayfasında)
- Benzersiz olmalı (user bazında)

```typescript
// Kullanıcı custom slug girebilir:
"Borsa İstanbul" → kullanıcı girer: "bist" veya "borsam"

// Otomatik türetme (fallback):
"Borsa İstanbul" → "borsa-istanbul"
"ABD Borsaları"  → "abd-borsalari"
"My Portfolio"   → "my-portfolio"

// Asset: sembol kullanılır (zaten unique per portfolio)
"DOAS"  → "doas"
"THYAO" → "thyao"
"AAPL"  → "aapl"
```

**Slug Düzenleme:**
- Portfolio oluşturma formunda slug alanı
- Portfolio düzenleme sayfasında slug değiştirilebilir
- Slug değiştiğinde eski URL'den yeniye redirect (opsiyonel)

---

## 3. Technical Specification

### 3.1 Database Değişikliği
```sql
-- portfolios tablosuna slug kolonu ekle (user bazında unique)
ALTER TABLE portfolios ADD COLUMN slug TEXT;

-- Unique constraint: user_id + slug kombinasyonu unique olmalı
CREATE UNIQUE INDEX portfolios_user_slug_unique ON portfolios(user_id, slug);

-- Mevcut portfolyolar için otomatik slug oluştur
UPDATE portfolios SET slug = lower(replace(name, ' ', '-'));
```

### 3.1.1 Form Değişiklikleri

**Portfolio Oluşturma Formu:**
```typescript
// Yeni alan: slug (opsiyonel)
interface CreatePortfolioForm {
  name: string;
  slug?: string;  // Kullanıcı girebilir, boşsa otomatik türetilir
  currency: string;
  description?: string;
}
```

**Portfolio Düzenleme Formu:**
```typescript
// Slug düzenlenebilir
interface EditPortfolioForm {
  name: string;
  slug: string;  // Değiştirilebilir
  currency: string;
  description?: string;
}
```

### 3.2 Route Yapısı
```
app/
  (protected)/
    p/
      [slug]/
        page.tsx                    → Portfolio dashboard
        settings/
          page.tsx                  → Portfolio ayarları
        [symbol]/
          page.tsx                  → Asset detayı
          edit/
            page.tsx                → Asset düzenleme
          transactions/
            new/
              page.tsx              → Yeni transaction
            [transactionId]/
              edit/
                page.tsx            → Transaction düzenleme
```

### 3.3 Slug Utility
```typescript
// lib/utils/slug.ts
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function symbolToUrl(symbol: string): string {
  return symbol.toLowerCase();
}

export function urlToSymbol(url: string): string {
  return url.toUpperCase();
}
```

### 3.4 Sidebar Değişikliği
```typescript
// Portfolio seçildiğinde:
// Mevcut: setActivePortfolio(id) + /dashboard
// Yeni: setActivePortfolio(id) + router.push(`/p/${slug}`)
```

### 3.5 API Endpoints
```typescript
// Yeni endpoint: slug ile portfolio getir
GET /api/portfolios/by-slug/[slug]

// Asset: portfolio slug + symbol ile getir  
GET /api/portfolios/by-slug/[slug]/assets/[symbol]
```

---

## 4. Migration Strategy

### 4.1 Aşama 1: Yeni Route'ları Ekle
- `/p/[slug]` route'unu oluştur
- `/p/[slug]/[symbol]` route'unu oluştur
- Eski route'lar çalışmaya devam etsin

### 4.2 Aşama 2: Sidebar Güncelle
- Portfolio seçildiğinde yeni URL'e yönlendir
- Asset linklerini güncelle

### 4.3 Aşama 3: Redirect'ler (Opsiyonel)
- Eski URL'lerden yenilere redirect

---

## 5. Acceptance Criteria

### 5.1 Functional
- [ ] Portfolio seçildiğinde `/p/[slug]` URL'ine gitmeli
- [ ] Asset tıklandığında `/p/[slug]/[symbol]` URL'ine gitmeli
- [ ] URL'den portfolio ve asset anlaşılabilmeli
- [ ] Sayfa yenilendiğinde doğru içerik yüklenmeli
- [ ] Breadcrumb doğru görünmeli
- [ ] Portfolio oluştururken custom slug girilebilmeli
- [ ] Portfolio düzenlerken slug değiştirilebilmeli
- [ ] Slug benzersizlik kontrolü yapılmalı (aynı kullanıcıda)

### 5.2 Non-Functional
- [ ] Mevcut linkler çalışmaya devam etmeli (backward compatibility)
- [ ] SEO-friendly URL'ler
- [ ] Performance etkilenmemeli

---

## 6. Estimates

| Task | Time |
|------|------|
| Slug utility | 15 min |
| Database migration | 15 min |
| API endpoints | 30 min |
| Route pages | 45 min |
| Sidebar update | 20 min |
| Link updates | 30 min |
| Portfolio create form (slug field) | 20 min |
| Portfolio edit form (slug field) | 20 min |
| Slug validation API | 15 min |
| Testing | 20 min |
| **Total** | **~4 hours** |
