import { expect, test } from '@playwright/test';

test('decorative animations pause offscreen and honor reduced motion', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  const globe = page.locator('.india-globe');
  await expect(globe).toHaveCSS('animation-play-state', 'paused');
  await globe.scrollIntoViewIfNeeded();
  await expect(globe).toHaveCSS('animation-play-state', 'running');
  const sculpture = page.locator('.chrome-sculpture');
  await sculpture.scrollIntoViewIfNeeded();
  await expect(sculpture).toHaveCSS('animation-play-state', 'running');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(sculpture).toHaveCSS('animation-play-state', 'paused');
  await expect(globe).toHaveCSS('animation-play-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(sculpture).toHaveCSS('animation-name', 'none');
});
