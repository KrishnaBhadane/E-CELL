import { expect, test } from '@playwright/test';

test('mobile hero reveals and reverses under CPU throttling without idle redraws', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  const stage = page.locator('.hero-lite');
  await expect(stage).toBeVisible();
  await expect(stage.locator('foreignObject')).toHaveCount(0);
  const poster = page.locator('[data-tear-progress]');
  await poster.evaluate(element => {
    document.documentElement.style.scrollBehavior = 'auto';
    const stage = element.querySelector<HTMLElement>('.tiger-stage')!;
    scrollTo(0, (element as HTMLElement).offsetHeight - stage.offsetHeight + 1);
  });
  await expect.poll(() => poster.getAttribute('data-tear-progress')).toBe('1.000');
  await expect(stage.locator('[filter]').first()).toHaveCSS('filter', 'none');
  const mutations = await stage.evaluate(async element => {
    let count = 0;
    const observer = new MutationObserver(records => { count += records.length; });
    observer.observe(element, { attributes: true, subtree: true, childList: true });
    await new Promise(resolve => setTimeout(resolve, 400));
    observer.disconnect();
    return count;
  });
  expect(mutations).toBe(0);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(poster).toHaveAttribute('data-tear-progress', '0.000');
});
