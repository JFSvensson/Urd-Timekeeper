import { expect, test } from '@playwright/test';

test.describe('Urd Timekeeper browser smoke tests', () => {
  test('starts, pauses, resets, and persists settings', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText('Urd Timekeeper');
    const startStopButton = page.locator('#start-stop');
    await expect(startStopButton).toHaveText('Start');

    await startStopButton.click();
    await expect(startStopButton).toHaveText('Paus');

    await page.locator('#reset').click();
    await expect(startStopButton).toHaveText('Start');

    await page.locator('#work-duration').fill('30');
    await page.locator('#save-settings').click();
    await page.reload();
    await expect(page.locator('#work-duration')).toHaveValue('30');
  });

  test('exports and imports a JSON backup', async ({ page }) => {
    await page.goto('/');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('#export-data').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^urd-timekeeper-backup-\d{4}-\d{2}-\d{2}\.json$/);

    const backup = {
      version: 1,
      exportedAt: '2026-09-30T12:00:00.000Z',
      settings: {
        workDuration: 45,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        shortBreaksBeforeLong: 3,
        soundEnabled: true,
        volume: 0.8,
      },
      sessions: [],
    };

    await page.locator('#import-data-file').setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(backup)),
    });

    await expect(page.locator('#settings-status')).toHaveText('Data importerades.');
    await expect(page.locator('#work-duration')).toHaveValue('45');
  });

  test('renders overlay mode with query parameter settings', async ({ page }) => {
    await page.goto('/overlay.html?work=1&break=1');

    await expect(page.locator('#timer-container')).toHaveClass(/overlay-mode/);
    await expect(page.locator('#time-display')).toBeHidden();
    await expect(page.locator('.progress-ring__circle')).toBeVisible();
  });

  test('loads the app shell after going offline', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();

    await context.setOffline(true);
    await page.reload();

    await expect(page.locator('h1')).toHaveText('Urd Timekeeper');
  });
});
