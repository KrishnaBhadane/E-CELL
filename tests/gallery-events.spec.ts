import { expect, test } from '@playwright/test';

test('memories tabs switch between collections and upcoming panels', async ({ page }) => {
  await page.goto('/');
  const allTab = page.getByRole('tab', { name: 'All Memories' });
  const eureka = page.getByRole('tab', { name: 'Eureka 2026' });
  const upcoming = page.getByRole('tab', { name: 'illuminate 2026' });

  await expect(allTab).toHaveAttribute('aria-selected', 'true');
  await eureka.click();
  await expect(eureka).toHaveAttribute('aria-selected', 'true');

  await upcoming.click();
  await expect(upcoming).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Edition in progress');

  await upcoming.press('ArrowLeft');
  await expect(eureka).toBeFocused();
  await expect(eureka).toHaveAttribute('aria-selected', 'true');
});
