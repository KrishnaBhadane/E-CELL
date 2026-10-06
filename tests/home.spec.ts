import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Test the local map contract without making browser tests depend on Google.
  await page.route('https://maps.google.com/**', route => route.fulfill({ body: '<p>Map embed</p>', contentType: 'text/html' }));
});

test('page ends after impact with a footer and no campus section', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  await expect(page.locator('#campus')).toHaveCount(0);
  await expect(page.locator('.header-location')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Our Initiatives', exact: true })).toHaveCount(0);
  await expect(page.locator('#ideas .idea-lines p')).toHaveCount(2);
  await expect(page.locator('footer')).toContainText('E-Cell RCPIT');
  expect(errors).toEqual([]);
});

test('poster pins, tears on scroll, and closes when scrolling back', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  const poster = page.locator('[data-tear-progress]');
  await expect(poster).toHaveAttribute('data-tear-progress', '0.000');
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 1000); });
  await expect.poll(async () => Number(await poster.getAttribute('data-tear-progress'))).toBeGreaterThan(.8);
  expect((await page.locator('.tiger-stage').boundingBox())!.y).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(poster).toHaveAttribute('data-tear-progress', '0.000');
});

test('pill follows keyboard focus and all navigation destinations exist', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  const links = page.getByRole('navigation').getByRole('link');
  await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).focus();
  await expect(page.locator('.nav-cursor')).toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#about$/);
  for (const link of await links.all()) {
    const destination = await link.getAttribute('href');
    if (destination!.startsWith('#')) await expect(page.locator(destination!)).toHaveCount(1);
    else expect(['/members.html', '/blog.html']).toContain(destination);
  }
});

for (const width of [360, 390, 768]) {
  test(`navigation and poster fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('navigation')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const nav = await page.getByRole('navigation').boundingBox();
    expect(nav!.x).toBeGreaterThanOrEqual(0);
    expect(nav!.x + nav!.width).toBeLessThanOrEqual(width);
  });
}

test('reduced motion has a manual reveal without extra scroll distance', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  const poster = page.locator('[data-tear-progress]');
  const stage = page.locator('.tiger-stage');
  await expect(stage).toHaveCSS('position', 'relative');
  expect((await poster.boundingBox())!.height).toBe((await stage.boundingBox())!.height);
  await page.getByRole('button', { name: 'Reveal upcoming event' }).click();
  await expect(poster).toHaveAttribute('data-tear-progress', '1.000');
  await page.getByRole('button', { name: 'Close the poster' }).click();
  await expect(poster).toHaveAttribute('data-tear-progress', '0.000');
});

test('impact counters finish with plus signs and the geographic map renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  await page.locator('.impact-facts').scrollIntoViewIfNeeded();
  await expect(page.locator('.count-value').first()).toHaveText('1,200+');
  await expect(page.getByRole('img', { name: 'Glowing India map' })).toBeVisible();
  await expect(page.locator('.mission-grid p').first()).toHaveCSS('font-weight', '600');
});
