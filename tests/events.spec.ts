import { expect, test } from '@playwright/test';

test('event wheel follows the hero and supports direct selection and keyboard', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('.tear-hero').evaluate(el => el.nextElementSibling?.id)).toBe('events');
  await page.locator('#events').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'DevSpark', exact: true }).click();
  await expect(page.locator('.works-title')).toHaveText('DevSpark');
  await page.locator('.works-stage').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.works-title')).toHaveText('Eureka — together');
});

test('mobile events scroll horizontally without overflowing the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('#events').scrollIntoViewIfNeeded();
  const cards = page.locator('.works-cards');
  await expect(page.locator('.works-card').first()).toBeVisible();
  await cards.evaluate(el => { el.scrollLeft = el.clientWidth; });
  await expect.poll(() => cards.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
