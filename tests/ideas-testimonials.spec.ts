import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`replacement section and testimonials work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    await expect(page.locator('.welcome-screen')).toHaveCount(0);
    await expect(page.locator('#events')).toHaveCount(0);
    await expect(page.locator('#gallery canvas')).toHaveCount(0);
    await expect(page.locator('.community-poster')).toHaveCount(1);
    await page.locator('#testimonials').scrollIntoViewIfNeeded();
    await expect(page.locator('.testimonial-empty-state')).toBeVisible();
    await expect(page.locator('#testimonials')).not.toContainText('Demo profile');
    await expect(page.locator('#testimonials')).not.toContainText('Miya Magic');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('testimonial carousel functions when verified stories are loaded', async ({ page }) => {
  const sampleTestimonials = [
    { name: 'Student Founder A', initials: 'SA', role: 'Hackathon Finalist', quote: 'Building with E-Cell provided the practical mentorship we needed.' },
    { name: 'Student Founder B', initials: 'SB', role: 'Workshop Attendee', quote: 'The ideation sessions completely transformed how we approached our problem.' },
  ];
  await page.route('**/rest/v1/testimonials*', route => route.fulfill({ json: sampleTestimonials }));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.welcome-screen')).toHaveCount(0);
  await page.locator('#testimonials').scrollIntoViewIfNeeded();
  const active = page.locator('.testimonial-story[aria-hidden="false"]');
  await expect(active).toContainText(sampleTestimonials[0].name);
  await page.getByRole('button', { name: 'Next testimonial' }).click();
  await expect(active).toContainText(sampleTestimonials[1].name);
  await page.getByRole('button', { name: 'Previous testimonial' }).click();
  await expect(active).toContainText(sampleTestimonials[0].name);

  // Test pause holds
  await page.mouse.move(1, 1);
  await page.getByRole('button', { name: 'Pause testimonials', exact: true }).click();
  await page.getByRole('button', { name: 'Play testimonials', exact: true }).evaluate(el => (el as HTMLElement).blur());
  await page.waitForTimeout(1000);
  await expect(active).toContainText(sampleTestimonials[0].name);
});
