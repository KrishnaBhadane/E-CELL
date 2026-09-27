import { expect, test } from '@playwright/test';

test('welcome dismisses automatically and leaves navigation interactive', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.locator('.welcome-screen')).toHaveCount(0, { timeout: 4000 });
  await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/#about$/);
});

test('welcome can be skipped immediately', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter site' }).click();
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
});
