import { expect, test } from '@playwright/test';

for (const width of [360, 1440]) {
  test(`blog filtering and reading at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/blog.html');
    await expect(page.getByRole('heading', { name: 'BLOG', exact: true })).toBeVisible();
    await expect(page.locator('.blog-card')).toHaveCount(5);
    await page.getByRole('tab', { name: 'Skills', exact: true }).click();
    await expect(page.locator('.blog-card')).toHaveCount(1);
    await page.getByRole('tab', { name: 'Skills', exact: true }).press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Campus Stories' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.blog-card')).toHaveCount(1);
    await page.locator('.blog-card a').click();
    await expect(page.locator('.blog-reader article h1')).toBeVisible();
    await page.reload();
    await expect(page.locator('.blog-prose p')).not.toHaveCount(0);
    await page.getByRole('link', { name: 'Back to articles' }).click();
    await expect(page.getByRole('tab', { name: 'Campus Stories' })).toHaveAttribute('aria-selected', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('footer').getByRole('link', { name: 'About us' })).toHaveAttribute('href', '/#about');
  });
}

test('missing blog article has a return link', async ({ page }) => {
  await page.goto('/blog.html?post=missing');
  await expect(page.getByRole('heading', { name: 'Article not found.' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to articles' }).click();
  await expect(page.locator('.blog-card')).toHaveCount(5);
});
