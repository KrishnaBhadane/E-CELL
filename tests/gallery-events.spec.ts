import { expect, test } from '@playwright/test';

test('event tabs switch between Eureka photos and the coming-soon panel', async ({ page }) => {
  await page.goto('/');
  const eureka = page.getByRole('tab', { name: 'Eureka 2026' });
  const upcoming = page.getByRole('tab', { name: 'illuminate 2026' });
  await expect(eureka).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.gallery-photos img')).toHaveCount(3);
  await upcoming.click();
  await expect(page.getByRole('tabpanel')).toContainText('Coming soon');
  await expect(page.getByRole('tabpanel').locator('img')).toHaveCount(0);
  await upcoming.press('ArrowLeft');
  await expect(eureka).toBeFocused();
  await expect(eureka).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.gallery-photos img')).toHaveCount(3);
});
