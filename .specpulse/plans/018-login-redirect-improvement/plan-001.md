# Implementation Plan: Login Sonrası Son Açılan Portföye Yönlendirme

<!-- FEATURE_DIR: 018-login-redirect-improvement -->
<!-- FEATURE_ID: 018 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-21 -->

## Specification Reference
- **Spec ID**: SPEC-018
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-21

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        Login Flow                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐     ┌───────────────┐     ┌─────────────────┐   │
│   │  Login   │────▶│  OAuth Flow   │────▶│  /auth-redirect │   │
│   │  Page    │     │  (Supabase)   │     │  (New Page)     │   │
│   └──────────┘     └───────────────┘     └────────┬────────┘   │
│                                                    │            │
│                                    ┌───────────────┴───────────┐│
│                                    ▼                           ▼│
│                          ┌─────────────────┐       ┌───────────┐│
│                          │  localStorage   │       │ API Call  ││
│                          │  lastPortfolio  │       │ /api/port ││
│                          └────────┬────────┘       └─────┬─────┘│
│                                   │                      │      │
│                          ┌────────┴──────────────────────┴────┐ │
│                          ▼                                    ▼ │
│                 ┌─────────────────┐              ┌────────────┐ │
│                 │  Son Portföy    │              │ İlk Portföy│ │
│                 │  /p/[slug]      │              │ veya /port │ │
│                 └─────────────────┘              └────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Portföy Ziyaret Kaydı                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐     ┌─────────────────────┐                  │
│   │  /p/[slug]   │────▶│ useLastVisitedPort  │                  │
│   │  sayfası     │     │ hook (useEffect)    │                  │
│   └──────────────┘     └──────────┬──────────┘                  │
│                                   │                              │
│                                   ▼                              │
│                        ┌─────────────────────┐                  │
│                        │    localStorage     │                  │
│                        │ "lastPortfolio"     │                  │
│                        │ = "/p/my-slug"      │                  │
│                        └─────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Technical Stack
- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **State**: localStorage (client-side)
- **Auth**: Supabase OAuth
- **Routing**: Next.js App Router

## Implementation Phases

### Phase 1: Son Ziyaret Takibi Hook'u [Priority: HIGH]
**Dependencies**: None

#### Tasks
1. [ ] `lib/hooks/use-last-visited-portfolio.ts` oluştur
2. [ ] Hook'u portföy sayfalarına entegre et (`app/(protected)/p/[slug]/page.tsx`)
3. [ ] Alt sayfalara da entegre et (cash, analysis, settings, goals, projection)

#### Deliverables
- [ ] `useLastVisitedPortfolio` hook çalışıyor
- [ ] Portföy sayfaları ziyaret edildiğinde localStorage güncelleniyor

#### Detaylı Implementasyon

```typescript
// lib/hooks/use-last-visited-portfolio.ts
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'lastVisitedPortfolio';

export function useLastVisitedPortfolio() {
  const pathname = usePathname();

  useEffect(() => {
    // Sadece /p/ ile başlayan sayfaları kaydet
    if (pathname?.startsWith('/p/')) {
      localStorage.setItem(STORAGE_KEY, pathname);
    }
  }, [pathname]);
}

export function getLastVisitedPortfolio(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}
```

---

### Phase 2: Auth Redirect Sayfası [Priority: HIGH]
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] `app/(protected)/auth-redirect/page.tsx` oluştur
2. [ ] Yönlendirme mantığını implement et:
   - localStorage'dan son portföy oku
   - Yoksa API'den kullanıcının portföylerini al
   - İlk portföye veya `/portfolios`'a yönlendir
3. [ ] Loading state ekle (kısa süre görünecek)

#### Deliverables
- [ ] Auth redirect sayfası çalışıyor
- [ ] Doğru yönlendirme mantığı implement edildi

#### Detaylı Implementasyon

```typescript
// app/(protected)/auth-redirect/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLastVisitedPortfolio } from '@/lib/hooks/use-last-visited-portfolio';

export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      // 1. localStorage'dan son ziyaret edilen portföyü kontrol et
      const lastVisited = getLastVisitedPortfolio();
      if (lastVisited) {
        router.replace(lastVisited);
        return;
      }

      // 2. API'den kullanıcının portföylerini al
      try {
        const response = await fetch('/api/portfolios');
        const portfolios = await response.json();

        if (portfolios && portfolios.length > 0) {
          // İlk portföye git
          router.replace(`/p/${portfolios[0].slug}`);
        } else {
          // Portföy yok, listeye git
          router.replace('/portfolios');
        }
      } catch (error) {
        // Hata durumunda portföy listesine git
        router.replace('/portfolios');
      }
    }

    redirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}
```

---

### Phase 3: Auth Flow Güncellemesi [Priority: HIGH]
**Dependencies**: Phase 2 complete

#### Tasks
1. [ ] `lib/auth/actions.ts` - redirectTo URL'ini `/auth-redirect` olarak değiştir
2. [ ] `app/api/auth/callback/route.ts` - default redirect'i `/auth-redirect` yap
3. [ ] `app/login/page.tsx` - zaten giriş yapmış kullanıcıyı `/auth-redirect`'e yönlendir

#### Deliverables
- [ ] OAuth callback `/auth-redirect`'e yönlendiriyor
- [ ] Login sayfası doğru yönlendirme yapıyor

#### Değişiklikler

**lib/auth/actions.ts:13**
```diff
- redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/dashboard`,
+ redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/auth-redirect`,
```

**app/api/auth/callback/route.ts:8**
```diff
- const next = requestUrl.searchParams.get('next') || '/dashboard';
+ const next = requestUrl.searchParams.get('next') || '/auth-redirect';
```

**app/login/page.tsx:10**
```diff
- redirect('/dashboard');
+ redirect('/auth-redirect');
```

---

### Phase 4: Dashboard Sayfası Kaldırma [Priority: HIGH]
**Dependencies**: Phase 3 complete

#### Tasks
1. [ ] `app/(protected)/dashboard/` klasörünü tamamen sil
   - `page.tsx`
   - `loading.tsx`
   - `dashboard-content.tsx`
   - `dashboard-content-client.tsx`
2. [ ] `components/layout/sidebar.tsx:20` - Dashboard linkini kaldır
3. [ ] `components/layout/application-layout.tsx:150` - Dashboard linkini kaldır

#### Deliverables
- [ ] Dashboard sayfası ve tüm bileşenleri silindi
- [ ] Sidebar'dan dashboard linki kaldırıldı
- [ ] `/dashboard` URL'i 404 dönüyor

---

### Phase 5: Test ve Doğrulama [Priority: MEDIUM]
**Dependencies**: Phase 4 complete

#### Tasks
1. [ ] Manuel test: Login → Son portföye yönlendirme
2. [ ] Manuel test: İlk giriş → İlk portföye yönlendirme
3. [ ] Manuel test: Portföy yok → `/portfolios` yönlendirmesi
4. [ ] Manuel test: `/dashboard` 404 dönüyor
5. [ ] Unit test: `useLastVisitedPortfolio` hook'u
6. [ ] Mevcut testlerin geçtiğini doğrula

#### Deliverables
- [ ] Tüm acceptance criteria'lar karşılandı
- [ ] Mevcut testler geçiyor
- [ ] Yeni testler yazıldı

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| localStorage erişim sorunu (SSR) | Low | Medium | Client component olarak implement, typeof window kontrolü |
| Race condition (redirect sırasında) | Low | Low | router.replace() kullanımı, loading state |
| Geçersiz portföy slug'ı localStorage'da | Medium | Low | API'den portföy kontrolü, 404 fallback |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| Supabase Auth | Low | Mevcut sistem zaten çalışıyor |
| Next.js App Router | Low | Standart routing kullanılıyor |

## Files to Modify/Create

### Yeni Dosyalar
| Dosya | Açıklama |
|-------|----------|
| `lib/hooks/use-last-visited-portfolio.ts` | Son ziyaret takip hook'u |
| `app/(protected)/auth-redirect/page.tsx` | Yönlendirme sayfası |

### Değiştirilecek Dosyalar
| Dosya | Satır | Değişiklik |
|-------|-------|------------|
| `lib/auth/actions.ts` | 13 | redirectTo → `/auth-redirect` |
| `app/api/auth/callback/route.ts` | 8 | default next → `/auth-redirect` |
| `app/login/page.tsx` | 10 | redirect → `/auth-redirect` |
| `components/layout/sidebar.tsx` | 20 | Dashboard linki kaldır |
| `components/layout/application-layout.tsx` | 150 | Dashboard linki kaldır |
| `app/(protected)/p/[slug]/page.tsx` | - | Hook entegrasyonu |

### Silinecek Dosyalar
| Dosya |
|-------|
| `app/(protected)/dashboard/page.tsx` |
| `app/(protected)/dashboard/loading.tsx` |
| `app/(protected)/dashboard/dashboard-content.tsx` |
| `app/(protected)/dashboard/dashboard-content-client.tsx` |

## Success Metrics
- **Performance**: Yönlendirme < 100ms (localStorage okuma anlık)
- **UX**: Kullanıcı doğru sayfaya sorunsuz ulaşıyor
- **Reliability**: %100 doğru yönlendirme (fallback mekanizmaları ile)

## Definition of Done
- [ ] Phase 1-4 tamamlandı
- [ ] Tüm acceptance criteria (AC-001 - AC-005) karşılandı
- [ ] Dashboard tamamen kaldırıldı
- [ ] Mevcut testler geçiyor
- [ ] Code review tamamlandı

## Additional Notes

### Alternatif Düşünceler
- Cookie yerine localStorage tercih edildi çünkü:
  - Server-side'da cookie okumak middleware gerektirir
  - localStorage daha basit ve yeterli
  - Cihazlar arası senkron scope dışında

### Edge Cases
1. **localStorage disabled**: Fallback olarak API'den portföy al
2. **Geçersiz slug**: 404 sayfası gösterilir (mevcut davranış)
3. **Concurrent login**: Son localStorage değeri kullanılır
