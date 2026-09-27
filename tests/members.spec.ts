import { expect, test } from '@playwright/test';

test('40 member cards include two leaders and reveal on page scroll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  await expect(page.locator('.member-card')).toHaveCount(40);
  await expect(page.locator('.member-leader')).toHaveCount(2);
  const card = page.locator('#member-1');
  await expect(page.locator('#members [data-gp-pin]')).toHaveCount(1);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const section = document.querySelector('#members')!;
    window.scrollTo(0, section.getBoundingClientRect().top + scrollY - 80 + 320);
  });
  await expect(page.locator('#members [data-gp-entered]')).toHaveAttribute('data-gp-entered', 'true');
  await expect(card.getByRole('heading', { name: 'Luffy' })).toBeVisible();
  await expect(card.getByText('Head', { exact: true })).toBeVisible();
  await expect(page.locator('.members-backdrop')).toHaveCSS('position', 'sticky');
  const backdrop = page.locator('.members-backdrop');
  const before = (await backdrop.boundingBox())!.y;
  const cardBefore = (await card.boundingBox())!.y;
  await page.evaluate(() => scrollBy(0, 300));
  expect((await backdrop.boundingBox())!.y).toBeCloseTo(before, 0);
  expect((await card.boundingBox())!.y).toBeLessThan(cardBefore - 250);
});

test('members remain readable with reduced motion on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#members');
  await expect(page.locator('#member-1 h3')).toHaveText('Luffy');
  await expect(page.locator('#member-40 h3')).toHaveText('Bartolomeo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.members-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(4);
});

test('desktop uses six columns and only navigation stays fixed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  await expect(page.locator('#members [data-gp-ready]')).toHaveAttribute('data-gp-ready', 'true');
  await page.locator('.members-grid').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.members-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(6);
  await expect(page.locator('.header .brand-link')).toHaveCount(0);
  await expect(page.locator('.header')).toHaveCSS('position', 'fixed');
  await expect(page.locator('.hero-club-logo')).toHaveCSS('position', 'absolute');
});
