import { expect, test } from '@playwright/test';

test('memories tabs switch between collections and upcoming panels', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
  await page.goto('/');
  const allTab = page.getByRole('tab', { name: 'All Memories' });
  const eureka = page.getByRole('tab', { name: 'Eureka 2026' });
  const upcoming = page.getByRole('tab', { name: 'illuminate 2026' });

  await expect(allTab).toHaveAttribute('aria-selected', 'true');
  await eureka.click();
  await expect(eureka).toHaveAttribute('aria-selected', 'true');

  await upcoming.click();
  await expect(upcoming).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Edition in progress');

  await upcoming.press('ArrowLeft');
  const previous = page.getByRole('tab', { name: 'Eureka 2026' });
  await expect(previous).toBeFocused();
  await expect(previous).toHaveAttribute('aria-selected', 'true');
});

test('empty collections display the editorial empty state without dummy or broken assets', async ({ page }) => {
  await page.route('**/rest/v1/gallery_events*', route =>
    route.fulfill({
      json: [
        { id: '1', name: 'HackSprint 2026', upcoming: false, photos: [] },
      ],
    })
  );
  await page.goto('/');
  const emptyTab = page.getByRole('tab', { name: 'HackSprint 2026' });
  await emptyTab.click();
  await expect(page.locator('.gallery-empty-state')).toBeVisible();
  await expect(page.locator('.gallery-empty-title')).toHaveText('HackSprint 2026');
  await expect(page.locator('.gallery-empty-desc')).toContainText('Photographs from this collection are currently being curated');
  await expect(page.locator('.memories-carousel-container')).toHaveCount(0);
});

test('carousel produces zero animation frames when completely idle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const carousel = page.locator('.pl-root');
  await carousel.scrollIntoViewIfNeeded();

  // Wait for initial spring settlement (1.5s)
  await page.waitForTimeout(1600);

  // Measure requestAnimationFrame calls over 600ms while idle
  const rafCount = await page.evaluate(async () => {
    return new Promise<number>(resolve => {
      let count = 0;
      const originalRaf = window.requestAnimationFrame;
      window.requestAnimationFrame = callback => {
        count++;
        return originalRaf(callback);
      };
      setTimeout(() => {
        window.requestAnimationFrame = originalRaf;
        resolve(count);
      }, 600);
    });
  });

  expect(rafCount).toBe(0);
});

for (const width of [320, 390, 768, 1440]) {
  test(`gallery layout maintains zero horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.goto('/');
    await page.locator('#gallery').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
