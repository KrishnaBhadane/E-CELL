import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`replacement section and testimonials work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    await expect(page.locator('.welcome-screen')).toHaveCount(0);
    await expect(page.locator('#events')).toHaveCount(0);
    await expect(page.locator('#gallery canvas')).toHaveCount(0);
    await page.locator('.idea-lines').evaluate(el => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * .3); });
    await expect.poll(() => page.locator('.word-lit').count()).toBeGreaterThan(8);
    await page.locator('#testimonials').scrollIntoViewIfNeeded();
    const active = page.locator('.testimonial-story[aria-hidden="false"]');
    await expect(active).toContainText('Krushna');
    await page.getByRole('button', { name: 'Next testimonial' }).click();
    await expect(active).toContainText('Aditi');
    await page.getByRole('button', { name: 'Previous testimonial' }).click();
    await expect(active).toContainText('Krushna');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('testimonial autoplay waits five seconds and pause holds the slide', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  await page.locator('#testimonials').scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  const active = page.locator('.testimonial-story[aria-hidden="false"]');
  await expect(active).toContainText('Krushna');
  await expect(active).toContainText('Aditi', { timeout: 7000 });
  await page.getByRole('button', { name: 'Pause testimonials', exact: true }).click();
  await page.getByRole('button', { name: 'Play testimonials', exact: true }).evaluate(el => (el as HTMLElement).blur());
  await page.mouse.move(1, 1);
  await page.waitForTimeout(5200);
  await expect(active).toContainText('Aditi');
});
