import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`home page shows members teaser and links to team directory at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.welcome-screen')).toHaveCount(0);
    // On home page, head and co-head cards are removed in favor of the teaser
    await expect(page.locator('#members .leader-card')).toHaveCount(0);
    await expect(page.locator('#members .team-page-link')).toBeVisible();
    await page.locator('#members').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
