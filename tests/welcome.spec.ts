import { expect, test } from '@playwright/test';
for (const reduced of [false, true]) {
  test(`one-second loader clears without waiting for resources (${reduced})`, async ({ page }) => {
    await page.clock.install();
    if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const loader = page.getByRole('status', { name: 'Loading page' });
    await expect(loader).toBeVisible();
    await expect(loader.locator('img')).toHaveCount(1);
    await page.clock.fastForward(1000);
    await expect(loader).toHaveCount(0);
  });
}
