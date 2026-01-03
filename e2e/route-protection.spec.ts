import { test, expect } from '@playwright/test';

test.describe('Route Protection', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/test');

    // Should redirect to login with redirect parameter
    await expect(page).toHaveURL(/\/login/);
    // Optionally check for redirect parameter
    // const url = new URL(page.url());
    // expect(url.searchParams.get('redirect')).toBe('/test');
  });

  test('should allow access to public routes', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });

  test('should protect profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });
});

