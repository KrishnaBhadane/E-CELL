import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`only two portrait leader cards remain at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.welcome-screen')).toHaveCount(0);
    await expect(page.locator('.leader-card')).toHaveCount(2);
    await expect(page.locator('.member-card, .members-track, .members-band, .members-grid')).toHaveCount(0);
    await page.locator('#members').scrollIntoViewIfNeeded();
    await expect(page.locator('#member-1')).toContainText('Head');
    await expect(page.locator('#member-2')).toContainText('Co-head');
    for (const card of await page.locator('.leader-card').all()) {
      const box = await card.boundingBox();
      expect(box!.height).toBeGreaterThan(box!.width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const footer = await page.locator('footer').boundingBox();
    const section = await page.locator('#members').boundingBox();
    expect(Math.abs(footer!.y - section!.y - section!.height)).toBeLessThan(2);
  });
}
