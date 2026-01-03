import { test, expect } from '@playwright/test';

test.describe('OAuth2 Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /sign in with google/i })
    ).toBeVisible();
  });

  test('should redirect authenticated users away from login', async ({
    page,
  }) => {
    // This test assumes user is already authenticated
    // In a real scenario, you would set up auth state first
    await page.goto('/login');
    // If authenticated, should redirect to /test
    // This is a placeholder - actual implementation depends on auth state
  });

  test('should protect routes requiring authentication', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto('/test');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

