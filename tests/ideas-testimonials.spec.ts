import { expect, test } from '@playwright/test';
import { testimonials } from '../src/data/testimonials';

for (const width of [390, 1440]) {
  test(`replacement section and testimonials work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    await expect(page.locator('.welcome-screen')).toHaveCount(0);
    await expect(page.locator('#events')).toHaveCount(0);
    await expect(page.locator('#gallery canvas')).toHaveCount(0);
    const reveal = page.locator('.idea-reveal-track');
    await reveal.evaluate(el => { document.documentElement.style.scrollBehavior = 'auto'; const stage = el.firstElementChild!; scrollTo(0, scrollY + el.getBoundingClientRect().top - parseFloat(getComputedStyle(stage).top)); });
    await expect.poll(() => page.locator('.word-lit').count()).toBe(0);
    await expect(page.locator('.idea-lines p').first()).not.toHaveClass(/text-reveal/);
    const pinnedTop = await page.locator('.idea-lines').evaluate(el => el.getBoundingClientRect().top);
    await page.evaluate(() => scrollBy(0, innerHeight * .4));
    await expect.poll(() => page.locator('.word-lit').count()).toBeGreaterThan(3);
    expect(await page.locator('.idea-lines').evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(pinnedTop, 0);
    await page.evaluate(() => scrollBy(0, innerHeight * .45));
    await expect.poll(() => page.locator('.word-lit').count()).toBe(await page.locator('[data-word]').count());
    await page.evaluate(() => scrollBy(0, 100));
    expect(await page.locator('.idea-lines').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(pinnedTop);
    await page.locator('#testimonials').scrollIntoViewIfNeeded();
    const active = page.locator('.testimonial-story[aria-hidden="false"]');
    await expect(active).toContainText(testimonials[0].name);
    await page.getByRole('button', { name: 'Next testimonial' }).click();
    await expect(active).toContainText(testimonials[1].name);
    await page.getByRole('button', { name: 'Previous testimonial' }).click();
    await expect(active).toContainText(testimonials[0].name);
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
  await expect(active).toContainText(testimonials[0].name);
  await expect(active).toContainText(testimonials[1].name, { timeout: 7000 });
  await page.getByRole('button', { name: 'Pause testimonials', exact: true }).click();
  await page.getByRole('button', { name: 'Play testimonials', exact: true }).evaluate(el => (el as HTMLElement).blur());
  await page.mouse.move(1, 1);
  await page.waitForTimeout(5200);
  await expect(active).toContainText(testimonials[1].name);
});
