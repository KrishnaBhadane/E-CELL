import { expect, test } from '@playwright/test';

test('gallery pins while photos rise and releases after the last photo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  const gallery = page.locator('#gallery');
  const top = await gallery.evaluate(el => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(top => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, top); }, top);
  const card = gallery.locator('figure').first();
  const start = (await card.boundingBox())!.y;
  await page.evaluate(top => scrollTo(0, top + innerHeight), top);
  await expect.poll(async () => (await card.boundingBox())!.y).toBeLessThan(start - 100);
  expect(Math.abs((await page.locator('.gallery-stage').boundingBox())!.y)).toBeLessThan(2);
  await page.locator('#testimonials').scrollIntoViewIfNeeded();
  expect((await page.locator('.gallery-stage').boundingBox())!.y).toBeLessThan(0);
});

test('initiatives advances, loops, and can be paused', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  await page.locator('#events').scrollIntoViewIfNeeded();
  const rail = page.locator('.events-gallery');
  await expect.poll(() => rail.evaluate(el => el.scrollLeft), { timeout: 6000 }).toBeGreaterThan(100);
  await rail.evaluate(el => {
    const cards = el.querySelectorAll<HTMLElement>('figure');
    el.scrollLeft = cards[4].offsetLeft - cards[0].offsetLeft;
  });
  await expect.poll(() => rail.evaluate(el => {
    const cards = el.querySelectorAll<HTMLElement>('figure');
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    return Math.abs(el.scrollLeft - step) < 5;
  }), { timeout: 6500 }).toBe(true);
  await page.getByRole('button', { name: 'Pause slideshow' }).click();
  await expect(page.getByRole('button', { name: 'Play slideshow' })).toBeVisible();
});

test('reduced motion displays all photos without pinning or autoplay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.gallery-stage')).toHaveCSS('position', 'relative');
  await expect(page.getByRole('button', { name: 'Pause slideshow' })).toHaveCount(0);
  await expect(page.locator('.events-gallery figure')).toHaveCount(4);
});
