import { expect, test } from '@playwright/test';

test('archive filters and opens a readable article', async ({ page }) => {
  await page.goto('/blog.html');
  await page.getByRole('button', { name: 'Skills', exact: true }).click();
  await expect(page.locator('.blog-card')).toHaveCount(2);
  await page.locator('.blog-card a').first().click();
  await expect(page.locator('.blog-reader h1')).toBeVisible();
  await page.reload();
  await expect(page.locator('.blog-prose p')).not.toHaveCount(0);
  await page.getByRole('link', { name: 'Back to articles' }).click();
  await expect(page.locator('.blog-card')).toHaveCount(12);
});

test('missing article offers a return link', async ({ page }) => {
  await page.goto('/blog.html?post=missing');
  await expect(page.getByRole('heading', { name: 'Article not found.' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to articles' }).click();
  await expect(page.locator('.latest-post')).toHaveCount(1);
});
