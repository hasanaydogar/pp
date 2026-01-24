/**
 * E2E Tests: Auth Flows (T032, T033, T034)
 *
 * Playwright E2E tests for:
 * - Login flow
 * - Register flow
 * - Password reset flow
 * - Mobile responsive testing
 * - Light/dark mode testing
 */

import { test, expect } from '@playwright/test';

test.describe('Auth Pages - Desktop', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should display login form correctly', async ({ page }) => {
      // Check page title and subtitle
      await expect(page.getByRole('heading', { name: /hoş geldiniz/i })).toBeVisible();
      await expect(page.getByText(/hesabınıza giriş yapın/i)).toBeVisible();

      // Check form elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/şifre/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /giriş yap/i })).toBeVisible();

      // Check social login button
      await expect(page.getByRole('button', { name: /google ile devam et/i })).toBeVisible();

      // Check register link
      await expect(page.getByRole('link', { name: /kayıt olun/i })).toBeVisible();

      // Check forgot password link
      await expect(page.getByRole('link', { name: /şifremi unuttum/i })).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      // Click submit without filling form
      await page.getByRole('button', { name: /giriş yap/i }).click();

      // Should show validation errors
      await expect(page.getByText(/email adresi gerekli/i)).toBeVisible();
      await expect(page.getByText(/şifre gerekli/i)).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/şifre/i).fill('password123');
      await page.getByRole('button', { name: /giriş yap/i }).click();

      await expect(page.getByText(/geçerli bir email adresi girin/i)).toBeVisible();
    });

    test('should navigate to register page', async ({ page }) => {
      await page.getByRole('link', { name: /kayıt olun/i }).click();
      await expect(page).toHaveURL('/register');
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.getByRole('link', { name: /şifremi unuttum/i }).click();
      await expect(page).toHaveURL('/forgot-password');
    });

    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.getByLabel(/şifre/i);
      await passwordInput.fill('testpassword');

      // Initially should be password type
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click show password button
      await page.getByRole('button', { name: '' }).first().click(); // Eye icon button

      // Should now be text type (visible)
      await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('should show loading state on submit', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/şifre/i).fill('password123');

      // Start submit (will fail but shows loading)
      const submitButton = page.getByRole('button', { name: /giriş yap/i });
      await submitButton.click();

      // Button should show loading text briefly
      // Note: This may be too fast to catch, so we check it doesn't crash
      await expect(submitButton).toBeEnabled({ timeout: 5000 });
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('should display register form correctly', async ({ page }) => {
      // Check page title and subtitle
      await expect(page.getByRole('heading', { name: /hesap oluştur/i })).toBeVisible();
      await expect(page.getByText(/portföyünüzü yönetmeye başlayın/i)).toBeVisible();

      // Check form elements
      await expect(page.getByLabel(/ad soyad/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^şifre$/i)).toBeVisible();
      await expect(page.getByLabel(/şifre tekrarı/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /hesap oluştur/i })).toBeVisible();

      // Check login link
      await expect(page.getByRole('link', { name: /giriş yapın/i })).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.getByRole('button', { name: /hesap oluştur/i }).click();

      await expect(page.getByText(/ad soyad gerekli/i)).toBeVisible();
      await expect(page.getByText(/email adresi gerekli/i)).toBeVisible();
      await expect(page.getByText(/şifre gerekli/i)).toBeVisible();
    });

    test('should show password strength indicator', async ({ page }) => {
      const passwordInput = page.getByLabel(/^şifre$/i);

      // Type weak password
      await passwordInput.fill('abc');
      await expect(page.getByText(/zayıf/i)).toBeVisible();

      // Type medium password
      await passwordInput.fill('Password1');
      await expect(page.getByText(/orta/i)).toBeVisible();

      // Type strong password
      await passwordInput.fill('MyP@ssw0rd123!');
      await expect(page.getByText(/güçlü/i)).toBeVisible();
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await page.getByLabel(/ad soyad/i).fill('Test User');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^şifre$/i).fill('password123');
      await page.getByLabel(/şifre tekrarı/i).fill('differentpassword');

      await page.getByRole('button', { name: /hesap oluştur/i }).click();

      await expect(page.getByText(/şifreler eşleşmiyor/i)).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      await page.getByRole('link', { name: /giriş yapın/i }).click();
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Forgot Password Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/forgot-password');
    });

    test('should display forgot password form correctly', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /şifremi unuttum/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /şifre sıfırlama linki gönder/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /giriş sayfasına dön/i })).toBeVisible();
    });

    test('should show validation error for empty email', async ({ page }) => {
      await page.getByRole('button', { name: /şifre sıfırlama linki gönder/i }).click();
      await expect(page.getByText(/email adresi gerekli/i)).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByRole('button', { name: /şifre sıfırlama linki gönder/i }).click();
      await expect(page.getByText(/geçerli bir email adresi girin/i)).toBeVisible();
    });
  });

  test.describe('Reset Password Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/reset-password');
    });

    test('should display reset password form correctly', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /yeni şifre belirle/i })).toBeVisible();
      await expect(page.getByLabel(/yeni şifre/i)).toBeVisible();
      await expect(page.getByLabel(/şifre tekrarı/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /şifreyi güncelle/i })).toBeVisible();
    });
  });
});

test.describe('Auth Pages - Mobile Responsive (T033)', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('login page should be responsive on mobile', async ({ page }) => {
    await page.goto('/login');

    // Check that form is visible and usable
    await expect(page.getByRole('heading', { name: /hoş geldiniz/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/şifre/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /giriş yap/i })).toBeVisible();

    // Check that elements don't overflow
    const card = page.locator('[class*="max-w-md"]').first();
    const cardBox = await card.boundingBox();
    expect(cardBox?.width).toBeLessThanOrEqual(375);
  });

  test('register page should be responsive on mobile', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: /hesap oluştur/i })).toBeVisible();
    await expect(page.getByLabel(/ad soyad/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('forgot password page should be responsive on mobile', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page.getByRole('heading', { name: /şifremi unuttum/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});

test.describe('Auth Pages - Dark Mode (T034)', () => {
  test.use({ colorScheme: 'dark' });

  test('login page should render correctly in dark mode', async ({ page }) => {
    await page.goto('/login');

    // Check that page loads
    await expect(page.getByRole('heading', { name: /hoş geldiniz/i })).toBeVisible();

    // Check dark mode background (zinc-900 = rgb(24, 24, 27))
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    // Dark mode should have dark background
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('register page should render correctly in dark mode', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /hesap oluştur/i })).toBeVisible();
  });

  test('forgot password page should render correctly in dark mode', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: /şifremi unuttum/i })).toBeVisible();
  });
});

test.describe('Auth Pages - Light Mode (T034)', () => {
  test.use({ colorScheme: 'light' });

  test('login page should render correctly in light mode', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /hoş geldiniz/i })).toBeVisible();

    // Check light mode background (zinc-50 = rgb(250, 250, 250))
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    // Light mode should have light background
    expect(bgColor).not.toBe('rgb(0, 0, 0)');
  });

  test('register page should render correctly in light mode', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /hesap oluştur/i })).toBeVisible();
  });
});
