import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`illuminate appears inside the tear at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.welcome-screen')).toHaveCount(0);
    await page.locator('[data-tear-progress]').evaluate(element => {
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo(0, (element as HTMLElement).offsetHeight - element.querySelector<HTMLElement>('.tiger-stage')!.offsetHeight);
    });
    await expect(page.locator('[data-tear-progress]')).toHaveAttribute('data-tear-progress', '1.000');
    await expect(page.getByRole('img', { name: 'illuminate', exact: true })).toBeVisible();
    await expect(page.locator('.event-outline')).toHaveCSS('fill-opacity', '1');
    await expect(page.locator('.event-ship')).toBeVisible();
    const title = await page.locator('.event-announcement').boundingBox();
    expect(title!.x + title!.width / 2).toBeGreaterThan(width / 2);
    await expect(page.locator('.event-character')).toBeVisible();
    await expect.poll(() => page.locator('.event-character').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  });
}
