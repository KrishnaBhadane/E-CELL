import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`events use a native horizontal gallery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.welcome-screen')).toHaveCount(0);
    expect(await page.locator('.tear-hero').evaluate(el => el.nextElementSibling?.id)).toBe('events');
    await page.locator('#events').scrollIntoViewIfNeeded();
    const gallery = page.getByRole('region', { name: 'Our events' });
    await expect(gallery.locator('figure')).toHaveCount(4);
    await expect(gallery.locator('figure').first()).toBeVisible();
    await expect(gallery.locator('figure').first()).toHaveCSS('transform', 'none');
    await gallery.evaluate(el => { el.scrollLeft = el.clientWidth; });
    await expect.poll(() => gallery.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await gallery.focus();
    const before = await page.evaluate(() => scrollY);
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  });
}
