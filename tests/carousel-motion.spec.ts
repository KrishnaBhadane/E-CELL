import { expect, test } from '@playwright/test';

for (const reduced of [false, true]) {
  test(`carousel wakes for keyboard, dragging and autoplay; reduced=${reduced}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
    await page.goto('/');
    const carousel = page.locator('.pl-root');
    await carousel.scrollIntoViewIfNeeded();
    await carousel.focus();
    await carousel.press('ArrowRight');
    await expect(carousel.locator('.pl-card[data-on="1"]')).toHaveAttribute('data-i', '1');
    await carousel.getByRole('button', { name: 'Previous', exact: true }).click();
    await expect(carousel.locator('.pl-card[data-on="1"]')).toHaveAttribute('data-i', '0');
    const bounds = (await carousel.boundingBox())!;
    await page.mouse.move(bounds.x + 290, bounds.y + 210);
    await page.mouse.down();
    await page.mouse.move(bounds.x + 50, bounds.y + 210, { steps: 15 });
    await page.mouse.up();
    await expect(carousel.locator('.pl-card[data-on="1"]')).not.toHaveAttribute('data-i', '0');
    const active = await carousel.locator('.pl-card[data-on="1"]').getAttribute('data-i');
    await expect(carousel.locator('.pl-card[data-on="1"]')).not.toHaveAttribute('data-i', active!, { timeout: 10000 });
    if (reduced) await expect(carousel.locator('.pl-card').first()).toHaveCSS('animation-name', 'none');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(carousel).toHaveAttribute('data-running', '0');
  });
}

test('reduced-motion hero remains explicitly controllable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const poster = page.locator('[data-tear-progress]');
  await page.getByRole('button', { name: /Reveal upcoming event/ }).click();
  await expect(poster).toHaveAttribute('data-tear-progress', '1.000');
  await page.getByRole('button', { name: /Close the poster/ }).click();
  await expect(poster).toHaveAttribute('data-tear-progress', '0.000');
});
