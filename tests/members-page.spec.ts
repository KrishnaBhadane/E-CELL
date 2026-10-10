import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`member page opens directly and shows the complete roster at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.welcome-screen')).toHaveCount(0);
    await page.getByRole('navigation').getByRole('link', { name: 'Members' }).click();
    await expect(page).toHaveURL(/members\.html$/);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'MEMBERS', exact: true })).toBeVisible();
    await expect(page.locator('.leader-card')).toHaveCount(0);
    await expect(page.locator('.team-card')).toHaveCount(38);
    await expect(page.getByRole('region', { name: 'Contact details' })).toContainText('For Sponsorship Queries');
    await expect(page.locator('#team-roster .member-links')).toHaveCount(38);
    await expect(page.locator('#team-roster .member-links [aria-label*="LinkedIn"]')).toHaveCount(38);
    await expect(page.locator('#team-roster .member-links [aria-label*="GitHub"]')).toHaveCount(38);
    expect(await page.locator('.team-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/#about$/);
  });
}

test('members scroll vertically and respect reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/members.html');
  const section = page.locator('#team-roster');
  await expect(section).not.toHaveAttribute('data-pinned');
  await section.evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 90, behavior: 'instant' }));
  await page.locator('.team-card').first().hover();
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  expect(await section.evaluate(el => el.scrollLeft)).toBe(0);
  await page.locator('.team-card').last().scrollIntoViewIfNeeded();
  await expect(page.locator('.team-card').last()).toBeInViewport();
  await section.evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().bottom, behavior: 'instant' }));
  await expect(page.locator('footer')).toBeInViewport();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.team-grid')).toBeVisible();
});
