# Specification: Login Sonrası Son Açılan Portföye Yönlendirme

<!-- FEATURE_DIR: 018-login-redirect-improvement -->
<!-- FEATURE_ID: 018 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-21 -->

## Description

Şu an login olunca kullanıcı `/dashboard` sayfasına yönlendiriliyor. Bu sayfayı kaldırıp, login sonrası kullanıcının en son açmış olduğu portföy sayfasına yönlendirme yapılacak.

### Mevcut Durum
- OAuth login sonrası `/api/auth/callback?next=/dashboard` ile `/dashboard`'a yönlendiriliyor
- Login sayfasında zaten giriş yapmış kullanıcı `/dashboard`'a yönlendiriliyor
- `/dashboard` sayfası ayrı bir sayfa olarak mevcut

### Hedef Durum
- `/dashboard` sayfası kaldırılacak
- Kullanıcının son ziyaret ettiği portföy sayfası localStorage/cookie'de saklanacak
- Login sonrası bu saklanan sayfaya yönlendirme yapılacak
- İlk kez giriş yapan veya kayıtlı portföyü olmayan kullanıcılar için varsayılan davranış belirlenecek

## Requirements

### Functional Requirements
- [ ] FR-001: Login sonrası kullanıcı `/dashboard` yerine son açtığı portföy sayfasına yönlendirilmeli
- [ ] FR-002: Kullanıcının son ziyaret ettiği portföy URL'i localStorage'da saklanmalı
- [ ] FR-003: `/dashboard` sayfası ve route'u kaldırılmalı
- [ ] FR-004: Sidebar ve diğer bileşenlerden `/dashboard` linklerinin kaldırılması/güncellenmesi
- [ ] FR-005: İlk kez giriş yapan kullanıcı için varsayılan yönlendirme (ilk portföy veya portföy oluşturma sayfası)
- [ ] FR-006: Portföyü olmayan kullanıcı için yönlendirme mantığı

### Non-Functional Requirements
- **Performance**: Yönlendirme işlemi 100ms altında tamamlanmalı
- **Security**: localStorage'da hassas veri saklanmamalı (sadece URL path)
- **UX**: Kullanıcı login sonrası beklemeden doğru sayfaya ulaşmalı

## Acceptance Criteria

- [ ] AC-001: Given kullanıcı daha önce `/p/my-portfolio` sayfasını ziyaret etmiş, when login olduğunda, then `/p/my-portfolio` sayfasına yönlendirilmeli
- [ ] AC-002: Given kullanıcı ilk kez giriş yapıyor ve portföyü yok, when login olduğunda, then portföy listesi sayfasına yönlendirilmeli (orada portföy oluşturma teşviki var)
- [ ] AC-003: Given localStorage'da son ziyaret kaydı yok ama kullanıcının portföyleri var, when login olduğunda, then ilk portföy sayfasına yönlendirilmeli
- [ ] AC-004: Given `/dashboard` URL'ine erişim denendiğinde, when sayfa yüklendiğinde, then 404 dönmeli (sayfa tamamen silinmiş olacak)
- [ ] AC-005: Given kullanıcı farklı portföyler arasında gezindiğinde, when her portföy ziyaret edildiğinde, then son ziyaret edilen URL güncellenmeli

## Technical Considerations

### Dependencies
- **External APIs**: Yok
- **Database Changes**: Opsiyonel - `user_preferences` tablosuna `last_visited_portfolio` kolonu eklenebilir (alternatif: localStorage)
- **Third-party Libraries**: Yok

### Implementation Notes

#### Değiştirilecek Dosyalar
1. `lib/auth/actions.ts` - `signInWithProvider()` içindeki redirect URL
2. `app/api/auth/callback/route.ts` - Default redirect URL ve dinamik yönlendirme mantığı
3. `app/login/page.tsx` - Zaten giriş yapmış kullanıcı yönlendirmesi
4. `app/(protected)/dashboard/` - Silinecek veya redirect edilecek
5. `components/layout/sidebar.tsx` (veya ilgili) - Dashboard linkinin kaldırılması
6. Portföy sayfaları - Son ziyaret edilen URL'i kaydetme mantığı

#### Yaklaşım Alternatifleri

**Alternatif 1: localStorage (Önerilen)**
- Client-side storage, sunucu yükü yok
- Portföy sayfalarında `useEffect` ile kayıt
- Login callback'te önce client'a redirect, sonra localStorage okuma

**Alternatif 2: Database (user_preferences)**
- Server-side, cihazlar arası senkron
- Extra DB sorgusu gerektirir
- Daha güvenilir ama kompleks

**Alternatif 3: Cookie**
- Server-side erişilebilir
- Middleware'de okunabilir
- httpOnly olmayan cookie güvenlik riski

### Önerilen Implementasyon Akışı

```
1. Portföy sayfası ziyaret edilir
2. useLastVisitedPortfolio hook çalışır → localStorage'a yazar
3. Kullanıcı çıkış yapar
4. Yeniden login olur
5. /api/auth/callback redirect yapar → /redirect-handler (yeni)
6. /redirect-handler localStorage'dan son URL'i okur
7. Son URL'e veya varsayılana yönlendirir
```

## Testing Strategy
- **Unit Tests**:
  - `useLastVisitedPortfolio` hook testi
  - Redirect mantığı unit testleri
- **Integration Tests**:
  - Login flow ile son portföy yönlendirmesi
  - İlk giriş senaryosu
- **End-to-End Tests**:
  - Tam login → portföy ziyareti → logout → login → aynı portföy akışı

## Definition of Done
- [ ] `/dashboard` sayfası kaldırıldı veya redirect edildi
- [ ] Login sonrası son ziyaret edilen portföye yönlendirme çalışıyor
- [ ] İlk giriş senaryosu düzgün çalışıyor
- [ ] Mevcut testler geçiyor
- [ ] Yeni testler yazıldı
- [ ] Code review tamamlandı

## Additional Notes

### Scope Dışı
- Kullanıcı tercihleri için kapsamlı bir ayarlar sayfası
- Cihazlar arası senkronizasyon (localStorage kullanıldığı için)

### Kararlar
- **İlk giriş / Son ziyaret yok**: Kullanıcının daha önce açmış olduğu portföy sayfasına yönlendirilecek. localStorage'da kayıtlı son ziyaret yoksa, kullanıcının ilk portföyüne yönlendirilecek. Portföyü yoksa portföy listesi sayfasına (portföy oluşturma için yönlendirme ile) gidecek.
- **/dashboard sayfası**: Tamamen silinecek (404 dönecek)
