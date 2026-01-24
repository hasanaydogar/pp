# Specification: Email/Password Authentication & Register Page

<!-- FEATURE_DIR: 019-email-auth-register -->
<!-- FEATURE_ID: 019 -->
<!-- SPEC_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-23 -->

## Description

Mevcut login sayfasını Catalyst UI template'ine uygun olarak yeniden tasarlamak ve email/password ile giriş yapma özelliği eklemek. Ayrıca yeni kullanıcılar için register (kayıt) sayfası oluşturmak.

**Mevcut Durum:**
- Sadece Google OAuth ile giriş yapılabiliyor
- Login sayfası inline CSS ile basit tasarıma sahip
- Register sayfası yok

**Hedef:**
- Catalyst UI Kit ile uyumlu modern login sayfası
- Email/password ile giriş imkanı
- Google OAuth seçeneği korunacak
- Yeni kullanıcılar için register sayfası
- Şifre sıfırlama (forgot password) özelliği

## Requirements

### Functional Requirements

#### Login Sayfası
- [ ] FR-001: Email ve password alanları ile giriş yapılabilmeli
- [ ] FR-002: Google OAuth ile giriş seçeneği korunmalı
- [ ] FR-003: "Remember me" checkbox ile oturum kalıcılığı
- [ ] FR-004: "Forgot password?" linki ile şifre sıfırlama sayfasına yönlendirme
- [ ] FR-005: "Don't have an account? Sign up" linki ile register sayfasına yönlendirme
- [ ] FR-006: Form validation (email formatı, boş alan kontrolü)
- [ ] FR-007: Hatalı giriş durumunda kullanıcıya hata mesajı gösterme
- [ ] FR-008: Başarılı giriş sonrası auth-redirect'e yönlendirme

#### Register Sayfası
- [ ] FR-009: Email, full name, password alanları ile kayıt
- [ ] FR-010: Password confirmation (şifre tekrarı) alanı
- [ ] FR-011: Form validation (email formatı, password strength, eşleşme kontrolü)
- [ ] FR-012: "Already have an account? Sign in" linki
- [ ] FR-013: Başarılı kayıt sonrası email doğrulama akışı
- [ ] FR-014: Kayıt sonrası otomatik giriş ve yönlendirme

#### Forgot Password Sayfası
- [ ] FR-015: Email alanı ile şifre sıfırlama isteği
- [ ] FR-016: Başarılı istek sonrası bilgilendirme mesajı
- [ ] FR-017: Email ile şifre sıfırlama linki gönderimi

### Non-Functional Requirements
- **Performance**: Form submit 2 saniyeden kısa sürmeli
- **Security**:
  - Password minimum 8 karakter
  - CSRF koruması
  - Rate limiting (5 başarısız deneme sonrası geçici engelleme)
  - Şifreler hash'lenmiş olarak saklanmalı (Supabase Auth)
- **UX**:
  - Loading state'ler gösterilmeli
  - Keyboard navigation desteği
  - Mobile responsive tasarım
  - Light mode ve dark mode desteği (sistem tercihine göre)

## Acceptance Criteria

### Login Sayfası
- [ ] Given kullanıcı login sayfasında, when geçerli email ve password girip submit ederse, then başarıyla giriş yapıp auth-redirect'e yönlendirilmeli
- [ ] Given kullanıcı login sayfasında, when Google ile giriş butonuna tıklarsa, then Google OAuth akışı başlamalı
- [ ] Given kullanıcı hatalı credentials girerse, when submit ederse, then "Invalid credentials" hatası gösterilmeli
- [ ] Given kullanıcının hesabı yoksa, when "Sign up" linkine tıklarsa, then register sayfasına yönlendirilmeli

### Register Sayfası
- [ ] Given kullanıcı register sayfasında, when geçerli bilgilerle form doldurursa, then hesap oluşturulup email doğrulama gönderilmeli
- [ ] Given kullanıcı zayıf şifre girerse, when submit ederse, then password strength hatası gösterilmeli
- [ ] Given şifreler eşleşmezse, when submit ederse, then "Passwords don't match" hatası gösterilmeli
- [ ] Given email zaten kayıtlıysa, when submit ederse, then "Email already registered" hatası gösterilmeli

### Forgot Password
- [ ] Given kullanıcı forgot password sayfasında, when geçerli email girerse, then şifre sıfırlama emaili gönderilmeli
- [ ] Given email sistemde yoksa, when submit ederse, then güvenlik nedeniyle aynı başarı mesajı gösterilmeli

## Technical Considerations

### Dependencies
- **External APIs**: Supabase Auth (email/password, OAuth)
- **Database Changes**: Supabase Auth tabloları (otomatik yönetilir)
- **Third-party Libraries**:
  - Mevcut Catalyst UI components kullanılacak
  - @supabase/supabase-js (mevcut)

### Supabase Auth Configuration
```typescript
// Email/Password sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
    }
  }
})

// Email/Password sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// Password reset
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://example.com/reset-password',
})
```

### File Structure
```
app/
├── login/
│   └── page.tsx              # Redesigned login page
├── register/
│   └── page.tsx              # New register page
├── forgot-password/
│   └── page.tsx              # New forgot password page
├── reset-password/
│   └── page.tsx              # Password reset page (from email link)

components/auth/
├── login-form.tsx            # Email/password login form
├── register-form.tsx         # Registration form
├── forgot-password-form.tsx  # Password reset request form
├── social-login-buttons.tsx  # Google OAuth button (renamed)
├── auth-layout.tsx           # Shared layout for auth pages
```

### UI Design (Catalyst Template - Light/Dark Mode)
```
┌─────────────────────────────────────┐
│              [Logo]                  │
│                                      │
│     Sign in to your account          │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ Email                        │    │
│  └─────────────────────────────┘    │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ Password                     │    │
│  └─────────────────────────────┘    │
│                                      │
│  ☐ Remember me    Forgot password?  │
│                                      │
│  ┌─────────────────────────────┐    │
│  │         Sign in              │    │
│  └─────────────────────────────┘    │
│                                      │
│  ─────────── or ───────────         │
│                                      │
│  ┌─────────────────────────────┐    │
│  │  [G] Continue with Google    │    │
│  └─────────────────────────────┘    │
│                                      │
│  Don't have an account? Sign up      │
└─────────────────────────────────────┘
```

### Implementation Notes

1. **Catalyst Components Kullanımı:**
   - `Input` - Email ve password alanları için
   - `Button` - Submit ve social login butonları
   - `Checkbox` - Remember me
   - `Link` - Navigation linkleri
   - `Text` - Başlıklar ve açıklamalar
   - `Field`, `Label`, `ErrorMessage` - Form yapısı

2. **Light/Dark Mode:**
   - Tailwind CSS `dark:` prefix kullanılacak
   - Sistem tercihine göre otomatik geçiş
   - Catalyst zinc color palette (light: white bg, dark: zinc-900 bg)
   - Input borders: `border-zinc-950/10 dark:border-white/10`

3. **Supabase Auth Konfigürasyonu:**
   - Email confirmation enabled olmalı
   - Redirect URLs ayarlanmalı
   - Password policy tanımlanmalı

4. **Error Handling:**
   - Supabase Auth hata kodları Türkçe mesajlara çevrilmeli
   - Network hataları için fallback mesajlar

5. **State Management:**
   - Form state için React useState
   - Loading state için submit sırasında
   - Error state için validation ve API hataları

## Testing Strategy

### Unit Tests
- [ ] Login form validation (email format, empty fields)
- [ ] Register form validation (password strength, match)
- [ ] Error message display logic
- [ ] Form submission handlers

### Integration Tests
- [ ] Supabase Auth signUp flow
- [ ] Supabase Auth signInWithPassword flow
- [ ] Password reset email flow
- [ ] OAuth flow (existing)

### End-to-End Tests
- [ ] Complete login flow with email/password
- [ ] Complete registration flow
- [ ] Password reset flow
- [ ] Navigation between auth pages
- [ ] Error scenarios (invalid credentials, existing email)

## Definition of Done
- [ ] All functional requirements implemented
- [ ] All acceptance criteria met
- [ ] Catalyst UI components used consistently
- [ ] Light mode ve dark mode desteği
- [ ] Mobile responsive
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Manual E2E testing completed
- [ ] Code reviewed and approved
- [ ] Documentation updated

## Out of Scope
- Apple OAuth (gelecekte eklenebilir)
- GitHub OAuth (gelecekte eklenebilir)
- Two-factor authentication (2FA)
- Social account linking
- Account deletion

## Additional Notes

### Mevcut Auth Actions (lib/auth/actions.ts)
Mevcut `signInWithProvider` fonksiyonu sadece OAuth destekliyor. Yeni fonksiyonlar eklenecek:
- `signInWithEmail(email, password)`
- `signUpWithEmail(email, password, fullName)`
- `resetPassword(email)`
- `updatePassword(newPassword)`

### Supabase Dashboard Ayarları
1. Authentication > Providers > Email enabled
2. Authentication > URL Configuration > Redirect URLs
3. Authentication > Email Templates (opsiyonel özelleştirme)

### Referans Tasarımlar
- Login: https://catalyst-demo.tailwindui.com/login
- Register: https://catalyst-demo.tailwindui.com/register
