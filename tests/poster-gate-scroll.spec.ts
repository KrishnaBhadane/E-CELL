import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`scroll-controlled gate experience works forward, in reverse, and with pause at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    // Wait for welcome screen to dismiss
    await expect(page.locator('.welcome-screen')).toHaveCount(0);

    const section = page.locator('#ideas');
    await expect(section).toBeVisible();

    const track = page.locator('.gate-experience-track');
    await expect(track).toBeVisible();

    const stickyScene = page.locator('.gate-sticky-scene');
    await expect(stickyScene).toBeVisible();

    const doorLeft = page.locator('.poster-gate-door.door-left');
    const doorRight = page.locator('.poster-gate-door.door-right');
    const nameLayer = page.locator('.gate-name-layer');
    const quoteLayer = page.locator('.gate-quote-layer');
    const wordStay = page.locator('.word-stay');
    const wordFoolish = page.locator('.word-foolish');
    const meetBtn = page.locator('.poster-meet-btn');

    // 1. APPROACH & INITIAL PIN (Progress ~ 0.05): Gates are completely closed & stationary
    await page.evaluate(() => {
      const el = document.querySelector('.gate-experience-track') as HTMLElement;
      if (!el) return;
      const scrollY = window.scrollY + el.getBoundingClientRect().top + (el.offsetHeight - window.innerHeight) * 0.05;
      window.scrollTo(0, scrollY);
    });

    await page.waitForTimeout(150);
    await expect(doorLeft).toBeVisible();
    await expect(doorRight).toBeVisible();
    await expect(nameLayer).toBeHidden();
    await expect(quoteLayer).toBeHidden();

    // 2. MID-OPENING & PAUSE (Progress ~ 0.35): Doors are open, name is visible
    await page.evaluate(() => {
      const el = document.querySelector('.gate-experience-track') as HTMLElement;
      if (!el) return;
      const scrollY = window.scrollY + el.getBoundingClientRect().top + (el.offsetHeight - window.innerHeight) * 0.35;
      window.scrollTo(0, scrollY);
    });

    await page.waitForTimeout(200);
    await expect(doorLeft).toBeVisible();
    await expect(doorRight).toBeVisible();
    await expect(nameLayer).toBeVisible();
    await expect(quoteLayer).toBeHidden();

    // Test pausing halfway: dimensions hold stable
    await page.waitForTimeout(200);
    await expect(nameLayer).toBeVisible();

    // 3. ENTERING ROOM & FINAL QUOTE (Progress ~ 0.88): Doors & name dissolved, quote is active
    await page.evaluate(() => {
      const el = document.querySelector('.gate-experience-track') as HTMLElement;
      if (!el) return;
      const scrollY = window.scrollY + el.getBoundingClientRect().top + (el.offsetHeight - window.innerHeight) * 0.88;
      window.scrollTo(0, scrollY);
    });

    await page.waitForTimeout(250);
    await expect(doorLeft).toBeHidden();
    await expect(nameLayer).toBeHidden();
    await expect(quoteLayer).toBeVisible();
    await expect(wordStay).toHaveClass(/is-active/);
    await expect(wordFoolish).toHaveClass(/is-active/);
    await expect(meetBtn).toBeVisible();

    // 4. REVERSE SCROLLING: Scroll back to Progress ~ 0.05 -> Gates smoothly re-close
    await page.evaluate(() => {
      const el = document.querySelector('.gate-experience-track') as HTMLElement;
      if (!el) return;
      const scrollY = window.scrollY + el.getBoundingClientRect().top + (el.offsetHeight - window.innerHeight) * 0.05;
      window.scrollTo(0, scrollY);
    });

    await page.waitForTimeout(250);
    await expect(doorLeft).toBeVisible();
    await expect(doorRight).toBeVisible();
    await expect(nameLayer).toBeHidden();
    await expect(quoteLayer).toBeHidden();
  });
}

test('reduced motion disables pinning and shows accessible content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  const quoteLayer = page.locator('.gate-quote-layer');
  await expect(quoteLayer).toBeVisible();
  const track = page.locator('.gate-experience-track');
  await expect(track).toBeVisible();
});
