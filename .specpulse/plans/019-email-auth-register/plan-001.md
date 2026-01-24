# Implementation Plan: Email/Password Authentication & Register Page

<!-- FEATURE_DIR: 019-email-auth-register -->
<!-- FEATURE_ID: 019 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2026-01-23 -->

## Specification Reference
- **Spec ID**: SPEC-019
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2026-01-23

## Architecture Overview

### High-Level Design
Mevcut OAuth-only authentication sistemine email/password desteği eklenmesi ve Catalyst UI ile modern auth sayfaları oluşturulması.

```
┌─────────────────────────────────────────────────────────────┐
│                      Auth Pages                              │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   /login    │  /register  │ /forgot-pw  │  /reset-pw       │
├─────────────┴─────────────┴─────────────┴──────────────────┤
│                    Auth Components                           │
│  ┌──────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │LoginForm │ │RegisterForm│ │ForgotPwForm│ │SocialLogin │ │
│  └──────────┘ └────────────┘ └────────────┘ └────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Auth Actions (Server)                     │
│  signInWithEmail() | signUpWithEmail() | resetPassword()    │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Auth                             │
│  Email/Password | OAuth (Google) | Password Reset           │
└─────────────────────────────────────────────────────────────┘
```

### Technical Stack
- **Frontend**: Next.js 16 App Router, React 19, Catalyst UI Kit, Tailwind CSS v4
- **Backend**: Next.js Server Actions, Supabase Auth
- **Database**: Supabase PostgreSQL (Auth tables managed by Supabase)
- **Styling**: Tailwind CSS with dark: prefix for theme support

## Implementation Phases

### Phase 1: Auth Actions & Supabase Setup [Priority: HIGH]
**Dependencies**: None

#### Objective
Supabase Auth email/password fonksiyonlarını eklemek ve mevcut auth actions dosyasını genişletmek.

#### Tasks
1. [ ] T001: Supabase Dashboard'da email auth'u aktifleştir
2. [ ] T002: lib/auth/actions.ts'e signInWithEmail fonksiyonu ekle
3. [ ] T003: lib/auth/actions.ts'e signUpWithEmail fonksiyonu ekle
4. [ ] T004: lib/auth/actions.ts'e resetPassword fonksiyonu ekle
5. [ ] T005: lib/auth/actions.ts'e updatePassword fonksiyonu ekle
6. [ ] T006: Auth error handling utility oluştur

#### Deliverables
- [ ] Email authentication Supabase'de aktif
- [ ] Tüm auth action fonksiyonları çalışır durumda
- [ ] Error handling utility hazır

#### Files to Create/Modify
```
lib/auth/
├── actions.ts          # MODIFY - Add new functions
└── errors.ts           # CREATE - Error handling utility
```

---

### Phase 2: Shared Auth Components [Priority: HIGH]
**Dependencies**: Phase 1

#### Objective
Auth sayfaları için paylaşılan layout ve UI component'lerini oluşturmak.

#### Tasks
1. [ ] T007: AuthLayout component oluştur (shared wrapper)
2. [ ] T008: SocialLoginButtons component oluştur (Google OAuth)
3. [ ] T009: AuthDivider component oluştur ("or" separator)
4. [ ] T010: PasswordInput component oluştur (show/hide toggle)

#### Deliverables
- [ ] Reusable auth layout component
- [ ] Social login buttons (Google)
- [ ] Password input with visibility toggle
- [ ] Consistent styling across all auth pages

#### Files to Create
```
components/auth/
├── auth-layout.tsx           # CREATE - Shared layout wrapper
├── social-login-buttons.tsx  # CREATE - OAuth buttons
├── auth-divider.tsx          # CREATE - "or" separator
└── password-input.tsx        # CREATE - Password with toggle
```

#### AuthLayout Design
```tsx
// Centered card layout with logo
<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
  <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg">
    <Logo />
    <Heading>{title}</Heading>
    {children}
    {footer}
  </div>
</div>
```

---

### Phase 3: Login Page Redesign [Priority: HIGH]
**Dependencies**: Phase 2

#### Objective
Mevcut login sayfasını Catalyst UI ile yeniden tasarlamak ve email/password desteği eklemek.

#### Tasks
1. [ ] T011: LoginForm component oluştur
2. [ ] T012: app/login/page.tsx'i yeniden tasarla
3. [ ] T013: Form validation ekle (client-side)
4. [ ] T014: Error state ve mesajları ekle
5. [ ] T015: Loading state ekle
6. [ ] T016: Remember me functionality (opsiyonel)

#### Deliverables
- [ ] Modern login page with Catalyst UI
- [ ] Email/password login working
- [ ] Google OAuth preserved
- [ ] Form validation
- [ ] Error messages
- [ ] Loading states

#### Files to Create/Modify
```
components/auth/
└── login-form.tsx      # CREATE - Login form component

app/login/
└── page.tsx            # MODIFY - Redesign with Catalyst UI
```

#### Login Page Layout
```
┌─────────────────────────────────────┐
│         [Personal Portfoy Logo]      │
│                                      │
│      Sign in to your account         │
│                                      │
│  Email                               │
│  ┌─────────────────────────────┐    │
│  │ email@example.com            │    │
│  └─────────────────────────────┘    │
│                                      │
│  Password                            │
│  ┌─────────────────────────────┐    │
│  │ ••••••••           [👁]     │    │
│  └─────────────────────────────┘    │
│                                      │
│  ☐ Remember me    Forgot password?  │
│                                      │
│  ┌─────────────────────────────┐    │
│  │         Sign in              │    │
│  └─────────────────────────────┘    │
│                                      │
│  ──────────── or ────────────       │
│                                      │
│  ┌─────────────────────────────┐    │
│  │  [G] Continue with Google    │    │
│  └─────────────────────────────┘    │
│                                      │
│  Don't have an account? Sign up      │
└─────────────────────────────────────┘
```

---

### Phase 4: Register Page [Priority: HIGH]
**Dependencies**: Phase 2

#### Objective
Yeni kullanıcılar için kayıt sayfası oluşturmak.

#### Tasks
1. [ ] T017: RegisterForm component oluştur
2. [ ] T018: app/register/page.tsx oluştur
3. [ ] T019: Password strength validation ekle
4. [ ] T020: Password match validation ekle
5. [ ] T021: Email verification flow entegrasyonu
6. [ ] T022: Success state ve yönlendirme

#### Deliverables
- [ ] Register page with Catalyst UI
- [ ] Full name, email, password, confirm password fields
- [ ] Password strength indicator
- [ ] Form validation
- [ ] Email verification trigger
- [ ] Success message and redirect

#### Files to Create
```
components/auth/
└── register-form.tsx   # CREATE - Register form component

app/register/
└── page.tsx            # CREATE - Register page
```

#### Register Page Layout
```
┌─────────────────────────────────────┐
│         [Personal Portfoy Logo]      │
│                                      │
│        Create your account           │
│                                      │
│  Full Name                           │
│  ┌─────────────────────────────┐    │
│  │ John Doe                     │    │
│  └─────────────────────────────┘    │
│                                      │
│  Email                               │
│  ┌─────────────────────────────┐    │
│  │ email@example.com            │    │
│  └─────────────────────────────┘    │
│                                      │
│  Password                            │
│  ┌─────────────────────────────┐    │
│  │ ••••••••           [👁]     │    │
│  └─────────────────────────────┘    │
│  [████████░░] Strong                 │
│                                      │
│  Confirm Password                    │
│  ┌─────────────────────────────┐    │
│  │ ••••••••           [👁]     │    │
│  └─────────────────────────────┘    │
│                                      │
│  ┌─────────────────────────────┐    │
│  │       Create account         │    │
│  └─────────────────────────────┘    │
│                                      │
│  Already have an account? Sign in    │
└─────────────────────────────────────┘
```

---

### Phase 5: Forgot & Reset Password [Priority: MEDIUM]
**Dependencies**: Phase 1

#### Objective
Şifre sıfırlama akışını implement etmek.

#### Tasks
1. [ ] T023: ForgotPasswordForm component oluştur
2. [ ] T024: app/forgot-password/page.tsx oluştur
3. [ ] T025: ResetPasswordForm component oluştur
4. [ ] T026: app/reset-password/page.tsx oluştur
5. [ ] T027: Supabase redirect URL konfigürasyonu
6. [ ] T028: Success/error states

#### Deliverables
- [ ] Forgot password page
- [ ] Reset password page (from email link)
- [ ] Email sending integration
- [ ] Password update functionality
- [ ] Success messages

#### Files to Create
```
components/auth/
├── forgot-password-form.tsx  # CREATE
└── reset-password-form.tsx   # CREATE

app/forgot-password/
└── page.tsx                  # CREATE

app/reset-password/
└── page.tsx                  # CREATE
```

#### Forgot Password Flow
```
1. User enters email on /forgot-password
2. Supabase sends reset email with magic link
3. User clicks link → redirected to /reset-password?token=xxx
4. User enters new password
5. Password updated → redirect to /login
```

---

### Phase 6: Testing & Polish [Priority: MEDIUM]
**Dependencies**: All previous phases

#### Objective
Test coverage ve UX polish.

#### Tasks
1. [ ] T029: Unit tests for auth actions
2. [ ] T030: Unit tests for form validation
3. [ ] T031: Integration tests for auth flows
4. [ ] T032: E2E manual testing
5. [ ] T033: Mobile responsive testing
6. [ ] T034: Light/dark mode testing
7. [ ] T035: Error message localization (TR)

#### Deliverables
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] All auth flows tested manually
- [ ] Mobile responsive verified
- [ ] Theme support verified
- [ ] Turkish error messages

---

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Supabase email sending limits | Low | Medium | Monitor usage, upgrade plan if needed |
| Email deliverability issues | Medium | High | Test with multiple email providers |
| OAuth redirect issues | Low | Medium | Test thoroughly, configure URLs correctly |

### Dependencies
| Dependency | Risk | Contingency |
|------------|------|-------------|
| Supabase Auth | Low | Well-documented, stable service |
| Catalyst UI Kit | Low | Already using in project |

## Resource Requirements

### Development
- **Developer**: 1 (Full-stack)
- **Effort**: ~2-3 days for core implementation

### Infrastructure
- **Supabase**: Email auth enabled (included in free tier)
- **Email**: Supabase built-in email (or custom SMTP for production)

## Success Metrics
- **Performance**: Auth forms submit < 2 seconds
- **UX**: All forms mobile responsive, theme-aware
- **Security**: Password requirements enforced, rate limiting active
- **Reliability**: Email delivery > 95%

## Rollout Plan

### Strategy
1. **Development**: Implement all phases
2. **Testing**: Full test coverage
3. **Staging**: Test with real emails
4. **Production**: Deploy with feature flag (optional)

### Monitoring
- Auth success/failure rates
- Email delivery rates
- Form validation errors
- Page load times

## Definition of Done
- [ ] All 6 phases complete
- [ ] All acceptance criteria from spec met
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual E2E testing completed
- [ ] Mobile responsive verified
- [ ] Light/dark mode working
- [ ] Code reviewed
- [ ] Merged to main

## Task Summary

| Phase | Tasks | Priority |
|-------|-------|----------|
| Phase 1: Auth Actions | T001-T006 (6 tasks) | HIGH |
| Phase 2: Shared Components | T007-T010 (4 tasks) | HIGH |
| Phase 3: Login Page | T011-T016 (6 tasks) | HIGH |
| Phase 4: Register Page | T017-T022 (6 tasks) | HIGH |
| Phase 5: Password Reset | T023-T028 (6 tasks) | MEDIUM |
| Phase 6: Testing | T029-T035 (7 tasks) | MEDIUM |
| **Total** | **35 tasks** | |

## Additional Notes

### Supabase Configuration Checklist
- [ ] Authentication > Providers > Email enabled
- [ ] Authentication > Email Templates customized (optional)
- [ ] Authentication > URL Configuration > Site URL set
- [ ] Authentication > URL Configuration > Redirect URLs added

### Catalyst Components to Use
- `Input`, `Field`, `Label`, `ErrorMessage` - Form fields
- `Button` - Submit buttons
- `Checkbox` - Remember me
- `Link`, `Text` - Navigation and text
- `Heading` - Page titles

### Color Palette (Zinc)
```css
/* Light Mode */
background: white
text: zinc-950
border: zinc-950/10

/* Dark Mode */
background: zinc-900
text: white
border: white/10
```
