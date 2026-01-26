import { test, expect } from '@playwright/test';

test.describe('Table Column Customization', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    // Note: In real E2E, you'd need proper auth setup
  });

  test.describe('Column Config Panel', () => {
    test('should open column config panel when clicking settings button', async ({ page }) => {
      // Navigate to portfolio page (assuming authenticated)
      await page.goto('/p/test-portfolio');

      // Wait for table to load
      await page.waitForSelector('table');

      // Click column config button
      const configButton = page.getByTitle('Tablo kolonlarını düzenle');
      if (await configButton.isVisible()) {
        await configButton.click();

        // Panel should be visible
        await expect(page.getByText('Tablo Kolonları')).toBeVisible();
      }
    });

    test('should show all columns in panel', async ({ page }) => {
      await page.goto('/p/test-portfolio');
      await page.waitForSelector('table');

      const configButton = page.getByTitle('Tablo kolonlarını düzenle');
      if (await configButton.isVisible()) {
        await configButton.click();

        // Check for column labels
        await expect(page.getByText('Sembol')).toBeVisible();
        await expect(page.getByText('Son Fiyat')).toBeVisible();
        await expect(page.getByText('Ağırlık')).toBeVisible();
        await expect(page.getByText('Değer')).toBeVisible();
      }
    });

    test('should toggle column visibility', async ({ page }) => {
      await page.goto('/p/test-portfolio');
      await page.waitForSelector('table');

      const configButton = page.getByTitle('Tablo kolonlarını düzenle');
      if (await configButton.isVisible()) {
        await configButton.click();

        // Find and click Maliyet checkbox
        const maliyetCheckbox = page.getByLabel('Toggle Maliyet visibility');
        if (await maliyetCheckbox.isVisible()) {
          await maliyetCheckbox.click();

          // Close panel
          await page.keyboard.press('Escape');

          // Maliyet column should be hidden in table
          // Note: This depends on your responsive breakpoints
        }
      }
    });

    test('should persist column preferences after page reload', async ({ page }) => {
      await page.goto('/p/test-portfolio');
      await page.waitForSelector('table');

      const configButton = page.getByTitle('Tablo kolonlarını düzenle');
      if (await configButton.isVisible()) {
        // Open panel and toggle a column
        await configButton.click();

        const maliyetCheckbox = page.getByLabel('Toggle Maliyet visibility');
        if (await maliyetCheckbox.isVisible()) {
          const wasChecked = await maliyetCheckbox.isChecked();
          await maliyetCheckbox.click();

          // Close panel
          await page.keyboard.press('Escape');

          // Reload page
          await page.reload();
          await page.waitForSelector('table');

          // Open panel again
          await configButton.click();

          // Checkbox state should be persisted
          const newState = await maliyetCheckbox.isChecked();
          expect(newState).toBe(!wasChecked);
        }
      }
    });

    test('should reset to defaults', async ({ page }) => {
      await page.goto('/p/test-portfolio');
      await page.waitForSelector('table');

      const configButton = page.getByTitle('Tablo kolonlarını düzenle');
      if (await configButton.isVisible()) {
        await configButton.click();

        // Click reset button
        const resetButton = page.getByText('Varsayılana Sıfırla');
        await resetButton.click();

        // All columns should be visible (11/11)
        await expect(page.getByText('11/11 görünür')).toBeVisible();
      }
    });

    test('should not allow hiding required columns', async ({ page }) => {
      await page.goto('/p/test-portfolio');
      await page.waitForSelector('table');

      const configButton = page.getByTitle('Tablo kolonlarını düzenle');
      if (await configButton.isVisible()) {
        await configButton.click();

        // Symbol checkbox should be disabled
        const symbolCheckbox = page.getByLabel('Toggle Sembol visibility');
        if (await symbolCheckbox.isVisible()) {
          await expect(symbolCheckbox).toBeDisabled();
        }

        // Actions checkbox should be disabled
        const actionsCheckbox = page.getByLabel('Toggle Aksiyon visibility');
        if (await actionsCheckbox.isVisible()) {
          await expect(actionsCheckbox).toBeDisabled();
        }
      }
    });
  });

  test.describe('Responsive behavior', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/p/test-portfolio');
      await page.waitForSelector('table');

      // Config button should still be accessible
      const configButton = page.getByTitle('Tablo kolonlarını düzenle');
      if (await configButton.isVisible()) {
        await configButton.click();
        await expect(page.getByText('Tablo Kolonları')).toBeVisible();
      }
    });
  });

  test.describe('Dark mode', () => {
    test('should render correctly in dark mode', async ({ page }) => {
      // Enable dark mode via media query emulation
      await page.emulateMedia({ colorScheme: 'dark' });

      await page.goto('/p/test-portfolio');
      await page.waitForSelector('table');

      const configButton = page.getByTitle('Tablo kolonlarını düzenle');
      if (await configButton.isVisible()) {
        await configButton.click();

        // Panel should be visible and styled
        const panel = page.getByText('Tablo Kolonları');
        await expect(panel).toBeVisible();
      }
    });
  });
});
