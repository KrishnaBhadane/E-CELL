import { expect, test } from '@playwright/test';

test('community sections follow the requested order and text reveals on scroll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  const ids = await page.locator('main > div > section[id]').evaluateAll(nodes => nodes.map(node => node.id));
  expect(ids).toEqual(['about', 'events', 'gallery', 'testimonials', 'members']);
  const title = page.locator('#gallery-title');
  await title.scrollIntoViewIfNeeded();
  await expect(title).toHaveClass(/text-visible/);
  await expect(page.locator('#gallery img')).toHaveCount(3);
  await expect(page.locator('.header .social-icon')).toHaveCount(3);
  await expect(page.locator('#testimonials')).toContainText('Krushna Bhadane');
  await expect(page.locator('#testimonials')).toContainText('DEMO TESTIMONIAL');
});

test('mobile header socials and gallery fit the screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  await page.locator('#gallery').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const social = await page.locator('.header .social-links').boundingBox();
  expect(social!.x).toBeGreaterThanOrEqual(0);
  expect(social!.x + social!.width).toBeLessThanOrEqual(360);
});
