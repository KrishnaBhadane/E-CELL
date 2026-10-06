import { expect, test } from '@playwright/test';

test('glass navigation adapts its colors without changing shape', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  const header = page.locator('.header');
  const glass = page.locator('.pill-navigation .nav-glass');
  await expect(header).toHaveAttribute('data-tone', 'dark');
  const radius = await glass.evaluate(el => getComputedStyle(el).borderRadius);
  for (const [selector, tone] of [['#ideas', 'light'], ['#gallery', 'dark'], ['#impact', 'violet'], ['#members', 'light']]) {
    await page.evaluate(selector => {
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo(0, document.querySelector(selector)!.getBoundingClientRect().top + scrollY);
    }, selector);
    await expect(header).toHaveAttribute('data-tone', tone);
    await expect(glass).toHaveCSS('border-radius', radius);
    expect(await glass.evaluate(el => getComputedStyle(el).backdropFilter)).toContain('blur');
  }
  await page.evaluate(() => scrollTo(0, 0));
  await expect(header).toHaveAttribute('data-tone', 'dark');
});
