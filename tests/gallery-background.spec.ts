import { expect, test } from '@playwright/test';

test('gallery renders the themed shader without page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  await page.locator('#gallery').scrollIntoViewIfNeeded();
  const canvas = page.locator('.gallery-shader');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveCSS('position', 'absolute');
  await expect(page.locator('#gallery img').first()).toBeInViewport();
  await expect.poll(() => canvas.evaluate(el => (el as HTMLCanvasElement).width)).toBeGreaterThan(1);
  expect(await canvas.evaluate(el => {
    const gl = (el as HTMLCanvasElement).getContext('webgl');
    return gl ? !!gl.getParameter(gl.CURRENT_PROGRAM) : true;
  })).toBe(true);
  await expect.poll(() => page.locator('#gallery img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await expect(page.locator('#gallery-title')).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});
