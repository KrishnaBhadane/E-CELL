import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`poster gate scroll animation is smooth, delayed, and reveals words sequentially at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    // Wait for welcome screen to dismiss if present
    await expect(page.locator('.welcome-screen')).toHaveCount(0);

    const poster = page.locator('#ideas');
    await expect(poster).toBeVisible();

    // Scroll to just when poster enters view (scroll progress ~ 0.05)
    await page.evaluate(() => {
      const el = document.getElementById('ideas');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY + rect.top - window.innerHeight + (el.offsetHeight * 0.05);
      window.scrollTo(0, scrollY);
    });

    // Wait for RAF lerp loop to tick
    await page.waitForTimeout(300);

    // Gate doors should be closed or virtually closed
    const doorLeft = page.locator('.poster-gate-door.door-left');
    const doorRight = page.locator('.poster-gate-door.door-right');
    await expect(doorLeft).toBeVisible();
    await expect(doorRight).toBeVisible();

    // Now scroll further until gate is in the opening window (progress ~ 0.22)
    await page.evaluate(() => {
      const el = document.getElementById('ideas');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY + rect.top - (window.innerHeight - el.offsetHeight) / 2;
      window.scrollTo(0, scrollY);
    });

    await page.waitForTimeout(400);

    // Word 1 & 2 should be active/illuminating
    const wordStay = page.locator('.word-stay');
    const wordHungry = page.locator('.word-hungry');
    await expect(wordStay).toHaveClass(/is-active/);
    await expect(wordHungry).toHaveClass(/is-active/);

    // Scroll until gate is completely open and past center (progress ~ 0.75)
    await page.evaluate(() => {
      const el = document.getElementById('ideas');
      if (!el) return;
      const totalDistance = window.innerHeight + el.offsetHeight;
      const targetPos = 0.75 * totalDistance;
      const targetTop = window.innerHeight - targetPos;
      const currentTop = el.getBoundingClientRect().top;
      window.scrollBy(0, currentTop - targetTop);
    });

    await page.waitForTimeout(500);

    // All words and CTA must be active and visible
    const wordStay2 = page.locator('.word-stay-2');
    const wordFoolish = page.locator('.word-foolish');
    const meetBtn = page.locator('.poster-meet-btn');

    await expect(wordStay2).toHaveClass(/is-active/);
    await expect(wordFoolish).toHaveClass(/is-active/);
    await expect(meetBtn).toBeVisible();

    await expect(page.locator('.poster-gate-wrap')).toBeHidden();
    await expect(poster).not.toHaveClass(/is-revealing/);
    const idleMutations = await poster.evaluate(async element => {
      let changes = 0;
      const observer = new MutationObserver(records => { changes += records.length; });
      observer.observe(element, { attributes: true, subtree: true });
      for (let i = 0; i < 20; i++) window.dispatchEvent(new Event('scroll'));
      await new Promise(resolve => setTimeout(resolve, 200));
      observer.disconnect();
      return changes;
    });
    expect(idleMutations).toBe(0);

    // Now test REVERSE scroll: scroll back up to progress ~ 0.05
    await page.evaluate(() => {
      const el = document.getElementById('ideas');
      if (!el) return;
      const totalDistance = window.innerHeight + el.offsetHeight;
      const targetPos = 0.05 * totalDistance;
      const targetTop = window.innerHeight - targetPos;
      const currentTop = el.getBoundingClientRect().top;
      window.scrollBy(0, currentTop - targetTop);
    });

    await page.waitForTimeout(400);

    // Once opened, gate remains open and words remain active (no annoying reclosing)
    await expect(page.locator('.poster-gate-wrap')).toBeHidden();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('.poster-gate-wrap')).toBeHidden();
    await expect(wordStay).toHaveClass(/is-active/);
    await expect(wordFoolish).toHaveClass(/is-active/);
    await expect(meetBtn).toBeVisible();
  });
}
