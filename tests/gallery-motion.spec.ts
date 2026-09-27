import { expect, test } from '@playwright/test';

test('gallery restores the original static three-photo layout', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#gallery figure')).toHaveCount(3);
  await expect(page.locator('.gallery-stage, .gallery-batch, .space-drift')).toHaveCount(0);
  await expect(page.locator('.gallery-photos')).toHaveCSS('display', 'grid');
});

test('initiatives advances and loops without a pause button', async ({ page }) => {
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
  await expect(page.getByRole('button', { name: 'Pause slideshow' })).toHaveCount(0);
});

test('reduced motion displays all photos without pinning or autoplay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#gallery figure')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Pause slideshow' })).toHaveCount(0);
  await expect(page.locator('.events-gallery figure')).toHaveCount(4);
});
