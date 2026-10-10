import { expect, test } from '@playwright/test';

for (const width of [320, 390, 1440]) {
  test(`white directories and poster work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/blog.html');
    await expect(page.locator('.blog-card')).toHaveCount(12);
    await expect(page.locator('.latest-post')).toHaveCount(1);
    expect(await page.locator('.blog-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(4);
    await expect(page.locator('.blog-card img').first()).toHaveCSS('object-fit', 'contain');
    await expect(page.locator('.latest-post img')).toHaveCSS('object-fit', 'contain');
    const title = await page.locator('.latest-post h3').innerText();
    await page.locator('.latest-post a').click();
    await expect(page.locator('.blog-reader h1')).toHaveText(title);
    await page.goto('/members.html');
    await expect(page.locator('.team-card')).toHaveCount(38);
    expect(await page.locator('.team-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `/private/tmp/members-grid-${width}.png` });
    await page.goto('/');
    await expect(page.locator('.idea-strip')).toHaveCount(0);
    await expect(page.locator('.community-poster')).toHaveCount(1);
    await expect(page.locator('.welcome-screen')).toHaveCount(0);
    await page.locator('.community-poster').scrollIntoViewIfNeeded();
    await expect(page.locator('.community-poster h2')).toBeVisible();
  });
}
