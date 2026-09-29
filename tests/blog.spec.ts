import { expect, test } from '@playwright/test';

for (const width of [360, 1440]) {
  test(`blog filtering and reading at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/blog.html');
    await expect(page.getByRole('heading', { name: 'BLOG', exact: true })).toBeVisible();
    await expect(page.locator('.blog-card')).toHaveCount(7);
    await page.getByRole('tab', { name: 'Skills', exact: true }).click();
    await expect(page.locator('.blog-card')).toHaveCount(2);
    await page.getByRole('tab', { name: 'Skills', exact: true }).press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Campus Stories' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.blog-card')).toHaveCount(2);
    await page.locator('.blog-card a').first().click();
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
  await expect(page.locator('.blog-card')).toHaveCount(7);
});

test('mouse wheel explores articles horizontally and releases at the end', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/blog.html');
  const rail = page.locator('.blog-grid');
  const section = page.locator('.blog-library');
  await expect(section).toHaveAttribute('data-pinned', 'true');
  await section.evaluate(el => window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - 90, behavior: 'instant' }));
  await rail.hover();
  await page.mouse.wheel(0, 420);
  await expect.poll(() => rail.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
  expect(await page.locator('.blog-stage').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(90);
  await page.getByRole('tab', { name: 'Skills', exact: true }).click();
  await expect.poll(() => rail.evaluate(el => el.scrollLeft)).toBe(0);
  await section.evaluate(el => window.scrollTo({ top: scrollY + el.getBoundingClientRect().bottom, behavior: 'instant' }));
  await expect(page.locator('footer')).toBeInViewport();
});

test('reduced motion keeps text visible and cards unpinned', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/blog.html');
  await expect(page.locator('.blog-library')).toHaveAttribute('data-pinned', 'false');
  await expect(page.locator('.blog-letter-mask > span').first()).toHaveCSS('animation-name', 'none');
});
