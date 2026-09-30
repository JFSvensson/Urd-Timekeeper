import { expect, test } from '@playwright/test';

test.describe('Urd Timekeeper visual regression', () => {
  test('matches the main timer baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    await expect(page).toHaveScreenshot('main-timer.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('matches the overlay baseline', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto('/overlay.html?work=1&break=1');

    await expect(page).toHaveScreenshot('overlay.png', {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});
