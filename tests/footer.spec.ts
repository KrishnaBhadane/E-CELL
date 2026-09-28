import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`shared footer fits and links correctly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/members.html');
    const footer = page.locator('footer');
    await footer.evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
    await expect(footer.locator('.footer-contact-card')).toHaveCount(3);
    await expect(footer.getByRole('heading', { name: 'For Website Queries' })).toBeVisible();
    await expect(footer.getByRole('heading', { name: 'For Other Updates' })).toBeVisible();
    await expect(footer.getByRole('heading', { name: 'For Sponsorship Queries' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await footer.getByRole('link', { name: 'About us' }).click();
    await expect(page).toHaveURL(/\/#about$/);
    await expect(page.locator('footer .footer-contact-card')).toHaveCount(3);
  });
}
