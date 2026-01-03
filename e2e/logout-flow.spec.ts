import { test, expect } from '@playwright/test';

test.describe('Logout Flow', () => {
  test('should logout user and clear session', async ({ page, context }) => {
    // Navigate to profile or test page (assuming authenticated)
    await page.goto('/test');

    // Click logout button
    const logoutButton = page.getByRole('button', { name: /sign out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Verify cookies are cleared
      const cookies = await context.cookies();
      const authCookies = cookies.filter((cookie) =>
        cookie.name.startsWith('sb-')
      );
      // After logout, auth cookies should be cleared
      expect(authCookies.length).toBe(0);
    }
  });
});

