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
    await expect(page.locator('.team-card')).toHaveCount(40);
    await expect(page.getByRole('region', { name: 'Contact details' })).toContainText('For Sponsorship Queries');
    await expect(page.locator('.member-links')).toHaveCount(40);
    await expect(page.locator('.member-links [aria-label*="LinkedIn"]')).toHaveCount(40);
    await expect(page.locator('.member-links [aria-label*="GitHub"]')).toHaveCount(40);
    await expect.poll(() => page.locator('.crowd-canvas').evaluate(el => (el as HTMLCanvasElement).width)).toBeGreaterThan(1);
    expect(await page.locator('.team-roster').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(width < 760 ? 4 : 6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/#about$/);
  });
}

test('crowd paints, animates, and stops drawing offscreen', async ({ page }) => {
  await page.goto('/members.html');
  const canvas = page.locator('.crowd-canvas');
  await expect.poll(() => canvas.evaluate(el => {
    const c = el as HTMLCanvasElement;
    return c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data.some((value, index) => index % 4 === 3 && value > 0);
  })).toBe(true);
  const before = await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL());
  await expect.poll(() => canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL())).not.toBe(before);
  await page.locator('footer').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await expect(canvas).not.toBeInViewport();
  await page.waitForTimeout(100);
  const paused = await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL());
  await page.waitForTimeout(300);
  expect(await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL())).toBe(paused);
});
