import { expect, test } from '@playwright/test';
for (const reduced of [false, true]) {
  test(`loader clears on mount without advancing a fixed timer (${reduced})`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:00Z'));
    if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('status', { name: 'Loading page' })).toHaveCount(0);
    await expect(page.locator('.tiger-stage')).toBeVisible();
  });
}
