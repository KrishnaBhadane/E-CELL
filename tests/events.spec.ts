import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`initiatives use the restored native gallery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.welcome-screen')).toHaveCount(0);
    await page.locator('#events').scrollIntoViewIfNeeded();
    const gallery = page.getByRole('region', { name: 'Our events' });
    await expect(gallery.locator('figure:not([aria-hidden])')).toHaveCount(4);
    await expect(page.locator('.swiper')).toHaveCount(0);
    await gallery.evaluate(el => { el.scrollLeft = el.clientWidth; });
    await expect.poll(() => gallery.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('region', { name: 'Contact details' })).toContainText('ecell.website.demo@gmail.com');
  });
}

test('initiatives autoplay while visible and reduced motion disables duplicates', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  await page.locator('#events').scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const rail = page.locator('.events-gallery');
  await expect.poll(() => rail.evaluate(el => el.scrollLeft), { timeout: 6500 }).toBeGreaterThan(100);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(rail.locator('figure')).toHaveCount(4);
});
