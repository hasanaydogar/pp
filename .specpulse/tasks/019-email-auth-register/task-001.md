# Task Breakdown: Email/Password Authentication & Register Page

<!-- FEATURE_DIR: 019-email-auth-register -->
<!-- FEATURE_ID: 019 -->
<!-- TASK_LIST_ID: 001 -->
<!-- STATUS: completed -->
<!-- CREATED: 2026-01-23 -->
<!-- LAST_UPDATED: 2026-01-24 -->

## Progress Overview
- **Total Tasks**: 35
- **Completed Tasks**: 33 (94%)
- **In Progress Tasks**: 0
- **Blocked Tasks**: 2 (T001, T027 - requires manual Supabase setup - USER COMPLETED)
- **Estimated Total Time**: 16-20 hours

## Quick Start

**Başlamak için ilk task'ı çalıştır:**
```
/sp-execute T001
```

---

## Task Summary

| ID | Task | Size | Phase | Dependencies | Status |
|----|------|------|-------|--------------|--------|
| T001 | Supabase email auth aktifleştir | S | 1 | - | [!] |
| T002 | signInWithEmail fonksiyonu | M | 1 | T001 | [x] |
| T003 | signUpWithEmail fonksiyonu | M | 1 | T001 | [x] |
| T004 | resetPassword fonksiyonu | S | 1 | T001 | [x] |
| T005 | updatePassword fonksiyonu | S | 1 | T001 | [x] |
| T006 | Auth error handling utility | M | 1 | - | [x] |
| T007 | AuthLayout component | M | 2 | T006 | [x] |
| T008 | SocialLoginButtons component | M | 2 | - | [x] |
| T009 | AuthDivider component | S | 2 | - | [x] |
| T010 | PasswordInput component | M | 2 | - | [x] |
| T011 | LoginForm component | L | 3 | T002,T006,T010 | [x] |
| T012 | Login page redesign | M | 3 | T007,T008,T009,T011 | [x] |
| T013 | Login form validation | M | 3 | T011 | [x] |
| T014 | Login error states | S | 3 | T011 | [x] |
| T015 | Login loading state | S | 3 | T011 | [x] |
| T016 | Remember me functionality | S | 3 | T011 | [x] |
| T017 | RegisterForm component | L | 4 | T003,T006,T010 | [x] |
| T018 | Register page oluştur | M | 4 | T007,T017 | [x] |
| T019 | Password strength validation | M | 4 | T017 | [x] |
| T020 | Password match validation | S | 4 | T017 | [x] |
| T021 | Email verification flow | M | 4 | T017 | [x] |
| T022 | Register success state | S | 4 | T017 | [x] |
| T023 | ForgotPasswordForm component | M | 5 | T004,T006 | [x] |
| T024 | Forgot password page | M | 5 | T007,T023 | [x] |
| T025 | ResetPasswordForm component | M | 5 | T005,T006,T010 | [x] |
| T026 | Reset password page | M | 5 | T007,T025 | [x] |
| T027 | Supabase redirect URL config | S | 5 | T001 | [!] |
| T028 | Password flow success states | S | 5 | T024,T026 | [x] |
| T029 | Unit tests: auth actions | M | 6 | T002-T005 | [x] |
| T030 | Unit tests: form validation | M | 6 | T013,T019,T020 | [x] |
| T031 | Integration tests: auth flows | L | 6 | T012,T018,T024,T026 | [x] |
| T032 | E2E manual testing | M | 6 | T031 | [x] |
| T033 | Mobile responsive testing | S | 6 | T012,T018,T024,T026 | [x] |
| T034 | Light/dark mode testing | S | 6 | T012,T018,T024,T026 | [x] |
| T035 | Error message localization | M | 6 | T006 | [x] |

---

## Phase 1: Auth Actions & Supabase Setup [Priority: HIGH]

### T001: Supabase Dashboard'da email auth'u aktifleştir
```yaml
id: task-001
status: todo
title: "Supabase email auth aktivasyonu"
priority: HIGH
size: S
estimate: 15 dakika
phase: 1
dependencies: []
parallel: true
```

**Description:**
- **What**: Supabase Dashboard'da email/password authentication'ı aktifleştir
- **Why**: Email ile giriş yapılabilmesi için gerekli
- **How**: Supabase Dashboard > Authentication > Providers > Email
- **Done when**: Email provider aktif ve test edilebilir durumda

**Steps:**
1. Supabase Dashboard'a git
2. Authentication > Providers > Email
3. "Enable Email Signup" aktifleştir
4. Email confirmation ayarlarını kontrol et
5. Site URL ve Redirect URLs'i ayarla

**Acceptance Criteria:**
- [ ] Email provider enabled
- [ ] Confirmation email enabled/disabled (proje ihtiyacına göre)
- [ ] Site URL doğru ayarlanmış

---

### T002: signInWithEmail fonksiyonu
```yaml
id: task-002
status: todo
title: "signInWithEmail server action"
priority: HIGH
size: M
estimate: 45 dakika
phase: 1
dependencies: [T001]
parallel: false
```

**Description:**
- **What**: Email ve password ile giriş yapma fonksiyonu
- **Why**: Kullanıcıların email ile giriş yapabilmesi için
- **How**: Supabase signInWithPassword API'sini kullan
- **Done when**: Fonksiyon çalışıyor ve hata durumlarını yönetiyor

**Files to Modify:**
- `lib/auth/actions.ts`

**Implementation:**
```typescript
export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}
```

**Acceptance Criteria:**
- [ ] Geçerli credentials ile giriş başarılı
- [ ] Hatalı credentials ile uygun hata dönüyor
- [ ] Session oluşturuluyor

---

### T003: signUpWithEmail fonksiyonu
```yaml
id: task-003
status: todo
title: "signUpWithEmail server action"
priority: HIGH
size: M
estimate: 45 dakika
phase: 1
dependencies: [T001]
parallel: true
```

**Description:**
- **What**: Yeni kullanıcı kaydı fonksiyonu
- **Why**: Yeni kullanıcıların sisteme kayıt olabilmesi için
- **How**: Supabase signUp API'sini kullan
- **Done when**: Fonksiyon çalışıyor ve email doğrulama tetikleniyor

**Files to Modify:**
- `lib/auth/actions.ts`

**Implementation:**
```typescript
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth-redirect`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}
```

**Acceptance Criteria:**
- [ ] Yeni kullanıcı kaydedilebiliyor
- [ ] full_name metadata'da saklanıyor
- [ ] Email doğrulama gönderiliyor (eğer aktifse)
- [ ] Duplicate email hatası döndürülüyor

---

### T004: resetPassword fonksiyonu
```yaml
id: task-004
status: todo
title: "resetPassword server action"
priority: HIGH
size: S
estimate: 30 dakika
phase: 1
dependencies: [T001]
parallel: true
```

**Description:**
- **What**: Şifre sıfırlama email'i gönderme fonksiyonu
- **Why**: Kullanıcıların şifrelerini sıfırlayabilmesi için
- **How**: Supabase resetPasswordForEmail API'sini kullan
- **Done when**: Email gönderimi çalışıyor

**Files to Modify:**
- `lib/auth/actions.ts`

**Implementation:**
```typescript
export async function resetPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Güvenlik: Her zaman başarı dön (email var/yok bilgisi verme)
  return { success: true };
}
```

**Acceptance Criteria:**
- [ ] Email gönderimi çalışıyor
- [ ] Redirect URL doğru
- [ ] Güvenlik için her zaman success dönüyor

---

### T005: updatePassword fonksiyonu
```yaml
id: task-005
status: todo
title: "updatePassword server action"
priority: HIGH
size: S
estimate: 30 dakika
phase: 1
dependencies: [T001]
parallel: true
```

**Description:**
- **What**: Yeni şifre belirleme fonksiyonu
- **Why**: Reset link'ten gelen kullanıcıların şifre belirlemesi için
- **How**: Supabase updateUser API'sini kullan
- **Done when**: Şifre güncellemesi çalışıyor

**Files to Modify:**
- `lib/auth/actions.ts`

**Implementation:**
```typescript
export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
```

**Acceptance Criteria:**
- [ ] Şifre başarıyla güncelleniyor
- [ ] Hata durumları yönetiliyor

---

### T006: Auth error handling utility
```yaml
id: task-006
status: todo
title: "Auth error handling utility"
priority: HIGH
size: M
estimate: 45 dakika
phase: 1
dependencies: []
parallel: true
```

**Description:**
- **What**: Supabase Auth hatalarını kullanıcı dostu mesajlara çeviren utility
- **Why**: Kullanıcılara anlaşılır hata mesajları göstermek için
- **How**: Error code mapping ve i18n desteği
- **Done when**: Tüm auth hataları için Türkçe mesajlar var

**Files to Create:**
- `lib/auth/errors.ts`

**Implementation:**
```typescript
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_taken'
  | 'weak_password'
  | 'email_not_confirmed'
  | 'rate_limit'
  | 'network_error'
  | 'unknown';

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: 'Email veya şifre hatalı',
  email_taken: 'Bu email adresi zaten kayıtlı',
  weak_password: 'Şifre en az 8 karakter olmalı',
  email_not_confirmed: 'Lütfen email adresinizi doğrulayın',
  rate_limit: 'Çok fazla deneme yaptınız. Lütfen bekleyin.',
  network_error: 'Bağlantı hatası. Lütfen tekrar deneyin.',
  unknown: 'Bir hata oluştu. Lütfen tekrar deneyin.',
};

export function getAuthErrorMessage(error: string): string {
  // Supabase error message'larını code'a çevir
  if (error.includes('Invalid login credentials')) {
    return ERROR_MESSAGES.invalid_credentials;
  }
  if (error.includes('already registered')) {
    return ERROR_MESSAGES.email_taken;
  }
  if (error.includes('Password should be')) {
    return ERROR_MESSAGES.weak_password;
  }
  // ... diğer mapping'ler

  return ERROR_MESSAGES.unknown;
}
```

**Acceptance Criteria:**
- [ ] Tüm yaygın hatalar için Türkçe mesajlar
- [ ] Export edilmiş utility fonksiyonu
- [ ] Type-safe error codes

---

## Phase 2: Shared Auth Components [Priority: HIGH]

### T007: AuthLayout component
```yaml
id: task-007
status: todo
title: "AuthLayout shared component"
priority: HIGH
size: M
estimate: 1 saat
phase: 2
dependencies: [T006]
parallel: false
```

**Description:**
- **What**: Tüm auth sayfaları için paylaşılan layout wrapper
- **Why**: Tutarlı görünüm ve kod tekrarını önlemek için
- **How**: Catalyst UI ile centered card layout
- **Done when**: Layout component tüm auth sayfalarında kullanılabilir

**Files to Create:**
- `components/auth/auth-layout.tsx`

**Implementation:**
```typescript
interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo className="h-10" />
          </div>

          {/* Title */}
          <Heading className="text-center mb-2">{title}</Heading>
          {subtitle && (
            <Text className="text-center text-zinc-500 dark:text-zinc-400 mb-8">
              {subtitle}
            </Text>
          )}

          {/* Content */}
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-6 text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Centered card layout
- [ ] Logo gösterimi
- [ ] Title ve subtitle desteği
- [ ] Footer slot
- [ ] Light/dark mode desteği
- [ ] Mobile responsive

---

### T008: SocialLoginButtons component
```yaml
id: task-008
status: todo
title: "SocialLoginButtons component"
priority: HIGH
size: M
estimate: 45 dakika
phase: 2
dependencies: []
parallel: true
```

**Description:**
- **What**: Google OAuth butonu (mevcut login-buttons.tsx'ten refactor)
- **Why**: Reusable social login butonları için
- **How**: Mevcut kodu Catalyst UI ile yeniden yaz
- **Done when**: Google butonu çalışıyor ve stillendirilmiş

**Files to Create:**
- `components/auth/social-login-buttons.tsx`

**Implementation:**
```typescript
'use client';

import { Button } from '@/components/ui/button';
import { signInWithProvider } from '@/lib/auth/actions';
import { useState } from 'react';

export function SocialLoginButtons() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithProvider('google');
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      color="white"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <GoogleIcon className="w-5 h-5 mr-2" />
      {isLoading ? 'Yükleniyor...' : 'Google ile devam et'}
    </Button>
  );
}
```

**Acceptance Criteria:**
- [ ] Google OAuth çalışıyor
- [ ] Loading state
- [ ] Catalyst Button kullanımı
- [ ] Google icon

---

### T009: AuthDivider component
```yaml
id: task-009
status: todo
title: "AuthDivider component"
priority: MEDIUM
size: S
estimate: 15 dakika
phase: 2
dependencies: []
parallel: true
```

**Description:**
- **What**: "veya" separator component
- **Why**: Form ile social login arasında ayırıcı için
- **How**: Basit div ile çizgi ve text
- **Done when**: Divider stillendirilmiş ve kullanılabilir

**Files to Create:**
- `components/auth/auth-divider.tsx`

**Implementation:**
```typescript
export function AuthDivider({ text = 'veya' }: { text?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
          {text}
        </span>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Çizgi ve text gösterimi
- [ ] Light/dark mode
- [ ] Özelleştirilebilir text

---

### T010: PasswordInput component
```yaml
id: task-010
status: todo
title: "PasswordInput with visibility toggle"
priority: HIGH
size: M
estimate: 45 dakika
phase: 2
dependencies: []
parallel: true
```

**Description:**
- **What**: Şifre göster/gizle toggle'lı input
- **Why**: UX için şifre görünürlük kontrolü
- **How**: Catalyst Input + eye icon toggle
- **Done when**: Toggle çalışıyor ve stillendirilmiş

**Files to Create:**
- `components/auth/password-input.tsx`

**Implementation:**
```typescript
'use client';

import { Input } from '@/components/ui/input';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState, forwardRef } from 'react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Additional props if needed
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
```

**Acceptance Criteria:**
- [ ] Show/hide toggle çalışıyor
- [ ] Erişilebilir buton
- [ ] forwardRef desteği
- [ ] Catalyst Input stillemesi

---

## Phase 3: Login Page Redesign [Priority: HIGH]

### T011: LoginForm component
```yaml
id: task-011
status: todo
title: "LoginForm component"
priority: HIGH
size: L
estimate: 1.5 saat
phase: 3
dependencies: [T002, T006, T010]
parallel: false
```

**Description:**
- **What**: Email/password login form component
- **Why**: Login sayfasının ana formu
- **How**: Catalyst Field/Input + state management
- **Done when**: Form çalışıyor, validation ve error handling var

**Files to Create:**
- `components/auth/login-form.tsx`

**Acceptance Criteria:**
- [ ] Email ve password input'ları
- [ ] Client-side validation
- [ ] Loading state
- [ ] Error message gösterimi
- [ ] Forgot password linki
- [ ] Remember me checkbox

---

### T012: Login page redesign
```yaml
id: task-012
status: todo
title: "app/login/page.tsx redesign"
priority: HIGH
size: M
estimate: 1 saat
phase: 3
dependencies: [T007, T008, T009, T011]
parallel: false
```

**Description:**
- **What**: Login sayfasını Catalyst UI ile yeniden tasarla
- **Why**: Modern ve tutarlı görünüm için
- **How**: AuthLayout + LoginForm + SocialLoginButtons
- **Done when**: Sayfa tam çalışır durumda

**Files to Modify:**
- `app/login/page.tsx`

**Acceptance Criteria:**
- [ ] AuthLayout kullanımı
- [ ] LoginForm entegrasyonu
- [ ] Google OAuth çalışıyor
- [ ] Register linki
- [ ] Light/dark mode

---

### T013: Login form validation
```yaml
id: task-013
status: todo
title: "Login form client-side validation"
priority: HIGH
size: M
estimate: 45 dakika
phase: 3
dependencies: [T011]
parallel: false
```

**Description:**
- **What**: Email formatı ve boş alan kontrolü
- **Why**: Kullanıcı hatalarını erken yakalamak için
- **How**: HTML5 validation + custom logic
- **Done when**: Tüm validation kuralları çalışıyor

**Acceptance Criteria:**
- [ ] Email format kontrolü
- [ ] Boş alan kontrolü
- [ ] Hata mesajları gösterimi
- [ ] Submit engelleme

---

### T014: Login error states
```yaml
id: task-014
status: todo
title: "Login error state handling"
priority: HIGH
size: S
estimate: 30 dakika
phase: 3
dependencies: [T011]
parallel: true
```

**Description:**
- **What**: API hatalarını kullanıcıya gösterme
- **Why**: Kullanıcının ne yanlış gittiğini anlaması için
- **How**: Error state + getAuthErrorMessage utility
- **Done when**: Tüm hata durumları ele alınmış

**Acceptance Criteria:**
- [ ] Invalid credentials hatası
- [ ] Network error hatası
- [ ] Rate limit hatası
- [ ] Türkçe hata mesajları

---

### T015: Login loading state
```yaml
id: task-015
status: todo
title: "Login loading state"
priority: MEDIUM
size: S
estimate: 15 dakika
phase: 3
dependencies: [T011]
parallel: true
```

**Description:**
- **What**: Form submit sırasında loading gösterimi
- **Why**: Kullanıcıya feedback vermek için
- **How**: isLoading state + disabled inputs
- **Done when**: Loading state görsel olarak çalışıyor

**Acceptance Criteria:**
- [ ] Submit butonunda loading text/spinner
- [ ] Input'lar disabled
- [ ] Çift submit engellendi

---

### T016: Remember me functionality
```yaml
id: task-016
status: todo
title: "Remember me checkbox"
priority: LOW
size: S
estimate: 30 dakika
phase: 3
dependencies: [T011]
parallel: true
```

**Description:**
- **What**: Remember me checkbox ile uzun session
- **Why**: Kullanıcı kolaylığı için
- **How**: Supabase session options
- **Done when**: Checkbox çalışıyor (opsiyonel özellik)

**Note:** Bu özellik Supabase'in session yönetimi ile otomatik gelir. İhtiyaç yoksa atlanabilir.

**Acceptance Criteria:**
- [ ] Checkbox görünür
- [ ] Session süresini etkiliyor (opsiyonel)

---

## Phase 4: Register Page [Priority: HIGH]

### T017: RegisterForm component
```yaml
id: task-017
status: todo
title: "RegisterForm component"
priority: HIGH
size: L
estimate: 1.5 saat
phase: 4
dependencies: [T003, T006, T010]
parallel: false
```

**Description:**
- **What**: Kayıt formu component'i
- **Why**: Yeni kullanıcı kaydı için
- **How**: Full name, email, password, confirm password fields
- **Done when**: Form çalışıyor ve tüm validation'lar var

**Files to Create:**
- `components/auth/register-form.tsx`

**Acceptance Criteria:**
- [ ] 4 alan: name, email, password, confirm
- [ ] Password strength indicator
- [ ] Password match kontrolü
- [ ] Loading ve error states

---

### T018: Register page oluştur
```yaml
id: task-018
status: todo
title: "app/register/page.tsx oluştur"
priority: HIGH
size: M
estimate: 45 dakika
phase: 4
dependencies: [T007, T017]
parallel: false
```

**Description:**
- **What**: Register sayfasını oluştur
- **Why**: Yeni kullanıcı kaydı için sayfa
- **How**: AuthLayout + RegisterForm
- **Done when**: Sayfa tam çalışır durumda

**Files to Create:**
- `app/register/page.tsx`

**Acceptance Criteria:**
- [ ] AuthLayout kullanımı
- [ ] RegisterForm entegrasyonu
- [ ] Login linki
- [ ] Light/dark mode

---

### T019: Password strength validation
```yaml
id: task-019
status: todo
title: "Password strength indicator"
priority: MEDIUM
size: M
estimate: 45 dakika
phase: 4
dependencies: [T017]
parallel: false
```

**Description:**
- **What**: Şifre güçlülük göstergesi
- **Why**: Kullanıcıya güçlü şifre seçmesinde yardım için
- **How**: Regex patterns + visual indicator
- **Done when**: Strength bar ve feedback çalışıyor

**Acceptance Criteria:**
- [ ] Min 8 karakter kontrolü
- [ ] Güçlülük seviyesi gösterimi (zayıf/orta/güçlü)
- [ ] Görsel progress bar
- [ ] Renk kodlaması

---

### T020: Password match validation
```yaml
id: task-020
status: todo
title: "Password match validation"
priority: HIGH
size: S
estimate: 20 dakika
phase: 4
dependencies: [T017]
parallel: true
```

**Description:**
- **What**: Şifre eşleşme kontrolü
- **Why**: Kullanıcının şifresini doğru girdiğinden emin olmak için
- **How**: Real-time comparison
- **Done when**: Eşleşme kontrolü çalışıyor

**Acceptance Criteria:**
- [ ] Real-time comparison
- [ ] Eşleşmezse hata mesajı
- [ ] Submit engelleme

---

### T021: Email verification flow
```yaml
id: task-021
status: todo
title: "Email verification entegrasyonu"
priority: MEDIUM
size: M
estimate: 45 dakika
phase: 4
dependencies: [T017]
parallel: false
```

**Description:**
- **What**: Kayıt sonrası email doğrulama akışı
- **Why**: Email adresinin gerçek olduğundan emin olmak için
- **How**: Supabase email confirmation
- **Done when**: Email gönderimi ve doğrulama çalışıyor

**Acceptance Criteria:**
- [ ] Kayıt sonrası email gönderimi
- [ ] Doğrulama linki çalışıyor
- [ ] Kullanıcıya bilgi mesajı

---

### T022: Register success state
```yaml
id: task-022
status: todo
title: "Register success state ve yönlendirme"
priority: MEDIUM
size: S
estimate: 30 dakika
phase: 4
dependencies: [T017]
parallel: true
```

**Description:**
- **What**: Başarılı kayıt sonrası kullanıcıya bilgi verme
- **Why**: Kullanıcının sonraki adımları bilmesi için
- **How**: Success message + redirect veya email check prompt
- **Done when**: Success flow tamamlanmış

**Acceptance Criteria:**
- [ ] Success message gösterimi
- [ ] Email doğrulama hatırlatması
- [ ] Login'e yönlendirme (veya auto-login)

---

## Phase 5: Forgot & Reset Password [Priority: MEDIUM]

### T023: ForgotPasswordForm component
```yaml
id: task-023
status: todo
title: "ForgotPasswordForm component"
priority: MEDIUM
size: M
estimate: 45 dakika
phase: 5
dependencies: [T004, T006]
parallel: false
```

**Description:**
- **What**: Şifre sıfırlama isteği formu
- **Why**: Kullanıcıların şifrelerini sıfırlayabilmesi için
- **How**: Email input + submit
- **Done when**: Form çalışıyor ve email gönderiliyor

**Files to Create:**
- `components/auth/forgot-password-form.tsx`

**Acceptance Criteria:**
- [ ] Email input
- [ ] Submit ve loading state
- [ ] Success message
- [ ] Back to login link

---

### T024: Forgot password page
```yaml
id: task-024
status: todo
title: "app/forgot-password/page.tsx"
priority: MEDIUM
size: M
estimate: 30 dakika
phase: 5
dependencies: [T007, T023]
parallel: false
```

**Description:**
- **What**: Şifre sıfırlama isteği sayfası
- **Why**: Kullanıcıların şifre sıfırlama akışına erişimi için
- **How**: AuthLayout + ForgotPasswordForm
- **Done when**: Sayfa tam çalışır durumda

**Files to Create:**
- `app/forgot-password/page.tsx`

**Acceptance Criteria:**
- [ ] AuthLayout kullanımı
- [ ] Form entegrasyonu
- [ ] Login linki

---

### T025: ResetPasswordForm component
```yaml
id: task-025
status: todo
title: "ResetPasswordForm component"
priority: MEDIUM
size: M
estimate: 45 dakika
phase: 5
dependencies: [T005, T006, T010]
parallel: false
```

**Description:**
- **What**: Yeni şifre belirleme formu
- **Why**: Reset linkinden gelen kullanıcılar için
- **How**: New password + confirm password
- **Done when**: Form çalışıyor ve şifre güncelleniyor

**Files to Create:**
- `components/auth/reset-password-form.tsx`

**Acceptance Criteria:**
- [ ] Password ve confirm inputs
- [ ] Strength validation
- [ ] Match validation
- [ ] Success redirect

---

### T026: Reset password page
```yaml
id: task-026
status: todo
title: "app/reset-password/page.tsx"
priority: MEDIUM
size: M
estimate: 30 dakika
phase: 5
dependencies: [T007, T025]
parallel: false
```

**Description:**
- **What**: Yeni şifre belirleme sayfası
- **Why**: Email linkinden yönlendirme için
- **How**: AuthLayout + ResetPasswordForm
- **Done when**: Sayfa tam çalışır durumda

**Files to Create:**
- `app/reset-password/page.tsx`

**Acceptance Criteria:**
- [ ] Token handling (URL'den)
- [ ] AuthLayout kullanımı
- [ ] Form entegrasyonu
- [ ] Success sonrası login'e yönlendirme

---

### T027: Supabase redirect URL konfigürasyonu
```yaml
id: task-027
status: todo
title: "Supabase redirect URLs setup"
priority: HIGH
size: S
estimate: 15 dakika
phase: 5
dependencies: [T001]
parallel: true
```

**Description:**
- **What**: Reset password için redirect URL'lerini ayarla
- **Why**: Email linklerinin doğru çalışması için
- **How**: Supabase Dashboard configuration
- **Done when**: Redirect'ler doğru çalışıyor

**Acceptance Criteria:**
- [ ] Site URL ayarlanmış
- [ ] Redirect URLs listesine /reset-password eklenmiş
- [ ] Local ve production URL'ler

---

### T028: Password flow success states
```yaml
id: task-028
status: todo
title: "Forgot/Reset success states"
priority: MEDIUM
size: S
estimate: 20 dakika
phase: 5
dependencies: [T024, T026]
parallel: false
```

**Description:**
- **What**: Başarı durumlarında kullanıcı feedback'i
- **Why**: Kullanıcının ne yapması gerektiğini bilmesi için
- **How**: Success messages ve redirects
- **Done when**: Tüm success state'ler ele alınmış

**Acceptance Criteria:**
- [ ] Forgot: "Email gönderildi" mesajı
- [ ] Reset: "Şifre güncellendi" + login redirect

---

## Phase 6: Testing & Polish [Priority: MEDIUM]

### T029: Unit tests for auth actions
```yaml
id: task-029
status: todo
title: "Auth actions unit testleri"
priority: MEDIUM
size: M
estimate: 1 saat
phase: 6
dependencies: [T002, T003, T004, T005]
parallel: false
```

**Description:**
- **What**: Auth fonksiyonları için unit testler
- **Why**: Kod kalitesi ve güvenilirlik için
- **How**: Jest ile mock testler
- **Done when**: Tüm fonksiyonlar test edilmiş

**Acceptance Criteria:**
- [ ] signInWithEmail testleri
- [ ] signUpWithEmail testleri
- [ ] resetPassword testleri
- [ ] updatePassword testleri
- [ ] Error handling testleri

---

### T030: Unit tests for form validation
```yaml
id: task-030
status: todo
title: "Form validation unit testleri"
priority: MEDIUM
size: M
estimate: 45 dakika
phase: 6
dependencies: [T013, T019, T020]
parallel: true
```

**Description:**
- **What**: Validation logic için unit testler
- **Why**: Validation kurallarının doğruluğu için
- **How**: Jest testleri
- **Done when**: Tüm validation kuralları test edilmiş

**Acceptance Criteria:**
- [ ] Email validation testleri
- [ ] Password strength testleri
- [ ] Password match testleri

---

### T031: Integration tests for auth flows
```yaml
id: task-031
status: todo
title: "Auth flow integration testleri"
priority: MEDIUM
size: L
estimate: 1.5 saat
phase: 6
dependencies: [T012, T018, T024, T026]
parallel: false
```

**Description:**
- **What**: Tam auth akışları için integration testler
- **Why**: End-to-end işleyişin doğrulanması için
- **How**: Jest + Testing Library veya Playwright
- **Done when**: Tüm akışlar test edilmiş

**Acceptance Criteria:**
- [ ] Login flow testi
- [ ] Register flow testi
- [ ] Password reset flow testi
- [ ] Error scenarios

---

### T032: E2E manual testing
```yaml
id: task-032
status: todo
title: "E2E manuel test"
priority: HIGH
size: M
estimate: 1 saat
phase: 6
dependencies: [T031]
parallel: false
```

**Description:**
- **What**: Tüm auth akışlarının manuel testi
- **Why**: Gerçek kullanıcı deneyiminin doğrulanması için
- **How**: Test checklist ile manuel test
- **Done when**: Tüm senaryolar başarıyla test edilmiş

**Test Checklist:**
- [ ] Email ile giriş (başarılı)
- [ ] Email ile giriş (hatalı credentials)
- [ ] Google ile giriş
- [ ] Yeni hesap oluşturma
- [ ] Şifre sıfırlama email'i
- [ ] Yeni şifre belirleme
- [ ] Form validation hataları
- [ ] Loading states
- [ ] Mobile görünüm

---

### T033: Mobile responsive testing
```yaml
id: task-033
status: todo
title: "Mobile responsive test"
priority: MEDIUM
size: S
estimate: 30 dakika
phase: 6
dependencies: [T012, T018, T024, T026]
parallel: true
```

**Description:**
- **What**: Mobile cihazlarda görünüm testi
- **Why**: Tüm kullanıcılar için erişilebilirlik
- **How**: Browser DevTools + gerçek cihaz
- **Done when**: Tüm sayfalar mobile'da düzgün görünüyor

**Acceptance Criteria:**
- [ ] Login page responsive
- [ ] Register page responsive
- [ ] Forgot password responsive
- [ ] Reset password responsive
- [ ] Form elemanları dokunmatik uyumlu

---

### T034: Light/dark mode testing
```yaml
id: task-034
status: todo
title: "Light/dark mode test"
priority: MEDIUM
size: S
estimate: 20 dakika
phase: 6
dependencies: [T012, T018, T024, T026]
parallel: true
```

**Description:**
- **What**: Her iki temada görünüm testi
- **Why**: Tema tutarlılığı için
- **How**: Browser/OS tema değiştirme
- **Done when**: Her iki temada düzgün görünüm

**Acceptance Criteria:**
- [ ] Light mode tüm sayfalarda ok
- [ ] Dark mode tüm sayfalarda ok
- [ ] Contrast ratios ok
- [ ] Icon görünürlüğü ok

---

### T035: Error message localization
```yaml
id: task-035
status: todo
title: "Hata mesajları Türkçe"
priority: MEDIUM
size: M
estimate: 30 dakika
phase: 6
dependencies: [T006]
parallel: true
```

**Description:**
- **What**: Tüm hata mesajlarının Türkçe kontrolü
- **Why**: Türk kullanıcılar için anlaşılırlık
- **How**: Error messages review ve güncelleme
- **Done when**: Tüm mesajlar Türkçe

**Acceptance Criteria:**
- [ ] Auth error mesajları Türkçe
- [ ] Validation mesajları Türkçe
- [ ] Success mesajları Türkçe
- [ ] Tutarlı dil kullanımı

---

## Execution Strategy

### Parallel Execution Groups

**Group A (Başlangıçta paralel):**
- T001: Supabase setup
- T006: Error handling utility
- T008: SocialLoginButtons
- T009: AuthDivider
- T010: PasswordInput

**Group B (T001 sonrası paralel):**
- T002, T003, T004, T005: Auth actions (birbirine bağımlı değil)
- T027: Redirect URL config

**Group C (Phase 2 sonrası):**
- T011 → T012 → T013-T016 (Login flow)
- T017 → T018 → T019-T022 (Register flow)

**Group D (Phase 3-4 sonrası):**
- T023 → T024 (Forgot password)
- T025 → T026 (Reset password)

**Group E (Son - paralel):**
- T029, T030: Unit tests
- T033, T034, T035: Polish tests

### Critical Path
```
T001 → T002 → T011 → T012 → T032
   ↘ T003 → T017 → T018 ↗
```

### Recommended Execution Order

```
Day 1 (6-8 saat):
├── T001: Supabase setup (15 dk)
├── T006: Error handling (45 dk) [parallel]
├── T008, T009, T010: Components (1.5 saat) [parallel]
├── T002-T005: Auth actions (2 saat)
├── T007: AuthLayout (1 saat)
└── T011: LoginForm başlangıç (1 saat)

Day 2 (6-8 saat):
├── T011: LoginForm tamamlama
├── T012-T016: Login page (2 saat)
├── T017: RegisterForm (1.5 saat)
├── T018-T022: Register page (2 saat)
└── T027: Redirect URLs (15 dk)

Day 3 (4-6 saat):
├── T023-T024: Forgot password (1.5 saat)
├── T025-T026, T028: Reset password (1.5 saat)
├── T029-T031: Tests (2-3 saat)
└── T032-T035: Final testing (1.5 saat)
```

---

## Progress Tracking

```yaml
status:
  total: 35
  completed: 33
  in_progress: 0
  blocked: 2  # T001, T027 - Supabase manual setup (user completed)

phases:
  phase_1: 5/6 (83%)  # T001 manual
  phase_2: 4/4 (100%)
  phase_3: 6/6 (100%)
  phase_4: 6/6 (100%)
  phase_5: 5/6 (83%)  # T027 manual
  phase_6: 7/7 (100%)

metrics:
  estimated_total: 16-20 hours
  velocity: COMPLETED
  estimated_completion: 2026-01-24
```

---

## Definition of Done

### Per Task
- [ ] Code implemented
- [ ] TypeScript errors yok
- [ ] Linter errors yok
- [ ] Acceptance criteria karşılanmış

### Feature Complete
- [ ] Tüm 35 task tamamlanmış
- [ ] Tüm sayfalar çalışıyor
- [ ] Light/dark mode ok
- [ ] Mobile responsive ok
- [ ] Testler geçiyor
- [ ] PR oluşturulmuş ve onaylanmış
- [ ] Main branch'e merge edilmiş

---

**Legend:**
- [S] = Small (< 30 dk), [M] = Medium (30-60 dk), [L] = Large (> 60 dk)
- **Status**: [ ] Pending, [>] In Progress, [x] Completed, [!] Blocked
