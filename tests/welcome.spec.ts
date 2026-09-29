import { expect, test } from '@playwright/test';

for (const reduced of [false, true]) {
  test(`plain loader waits for resources and clears when ready (reduced motion: ${reduced})`, async ({ page }) => {
    if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/assets/brand/club-logo-round.svg', async route => { await gate; await route.continue(); });
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const loader = page.getByRole('status', { name: 'Loading page' });
      await expect(loader).toBeVisible();
      await expect(loader).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(loader.locator('img, button')).toHaveCount(0);
      if (reduced) await expect(loader.locator('.welcome-spinner')).toHaveCSS('animation-name', 'none');
      release();
      await expect(loader).toHaveCount(0);
      await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
      await expect(page).toHaveURL(/#about$/);
    } finally { release(); }
  });
}
