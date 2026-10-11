import { expect, test } from '@playwright/test';

test('blog shares pending reads and fetches fresh data afterward', async ({ page }) => {
  let blogs = 0;
  let settings = 0;
  await page.route('**/rest/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/blogs')) blogs++;
    if (path.endsWith('/site_settings')) settings++;
    await new Promise(resolve => setTimeout(resolve, 100));
    await route.fulfill({ json: path.endsWith('/site_settings') ? null : [] });
  });
  await page.goto('/blog.html');
  await expect.poll(() => blogs).toBe(1);
  await expect.poll(() => settings).toBe(1);
  await page.waitForTimeout(200);
  await page.evaluate(async () => {
    const path = '/src/lib/supabase.ts';
    const { fetchBlogs } = await import(/* @vite-ignore */ path);
    await Promise.all([fetchBlogs(false), fetchBlogs(false)]);
  });
  expect(blogs).toBe(2);
});

for (const width of [390, 1440]) {
  test(`public routes and admin login render without runtime errors (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    const editors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (/\/src\/admin\/Manage/.test(request.url())) editors.push(request.url());
    });
    await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
    for (const path of ['/', '/members.html', '/blog.html']) {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('.welcome-screen')).toHaveCount(0);
    }
    await page.goto('/admin');
    await expect(page.locator('input[type="password"]')).toBeVisible();
    expect(editors).toEqual([]);
    expect(errors).toEqual([]);
  });
}
