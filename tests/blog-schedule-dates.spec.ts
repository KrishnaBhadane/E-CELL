import { expect, test } from '@playwright/test';

test.describe('Blog schedule dates and content enhancements verification', () => {
  test('all 9 blogs are displayed with exact scheduled dates, people-behind-the-ideas is excluded, and proper headings exist', async ({ page }) => {
    await page.goto('/blog.html');

    // Wait for blogs to load
    await expect(page.locator('.blog-grid')).toBeVisible();

    // Verify people-behind-the-ideas is NOT present
    const prose = await page.locator('.blog-grid').innerText();
    expect(prose).not.toContain('The people behind the ideas.');
    expect(prose).not.toContain('A space for the conversations, teamwork, and small moments');

    // Verify 9 articles in grid
    const cards = page.locator('.blog-card');
    await expect(cards).toHaveCount(9);

    // Verify order and dates
    const expectedSchedule = [
      { date: '14 Oct 2026', titleFragment: 'Pitch Your Startup Idea in 60 Seconds' },
      { date: '7 Oct 2026', titleFragment: 'Beyond the Campus Gates' },
      { date: '28 Sept 2026', titleFragment: 'The 7-Day Campus Startup Sprint' },
      { date: '21 Sept 2026', titleFragment: 'From Prototype to Product' },
      { date: '14 Sept 2026', titleFragment: 'Why Networking and Mentorship Matter' },
      { date: '7 Sept 2026', titleFragment: 'How to Start a Business With Almost Zero Capital' },
      { date: '24 Aug 2026', titleFragment: 'How to Validate a Startup Idea Before Spending Money' },
      { date: '17 Aug 2026', titleFragment: '5 Mistakes Every First-Time Entrepreneur Should Avoid' },
      { date: '10 Aug 2026', titleFragment: "From Idea to Startup: A Student Founder's First Steps" },
    ];

    for (let i = 0; i < expectedSchedule.length; i++) {
      const card = cards.nth(i);
      await expect(card.locator('.blog-card-title')).toContainText(expectedSchedule[i].titleFragment);
      await expect(card.locator('time')).toContainText(expectedSchedule[i].date);
    }

    // Verify enhanced article reader on 'validate-startup-idea-before-spending'
    await page.goto('/blog.html?post=validate-startup-idea-before-spending');
    await expect(page.locator('.blog-article-title')).toContainText('How to Validate a Startup Idea Before Spending Money');
    await expect(page.locator('.blog-article-meta time')).toContainText('24 Aug 2026');
    await expect(page.locator('.blog-prose h2.markdown-h2').first()).toBeVisible();
    await expect(page.locator('.blog-prose .markdown-table')).toBeVisible();
    await expect(page.locator('.blog-prose h2', { hasText: 'References & Further Reading' })).toBeVisible();

    // Verify enhanced article reader on 'from-idea-to-startup-student-founder'
    await page.goto('/blog.html?post=from-idea-to-startup-student-founder');
    await expect(page.locator('.blog-article-title')).toContainText("From Idea to Startup: A Student Founder's First Steps");
    await expect(page.locator('.blog-article-meta time')).toContainText('10 Aug 2026');
    await expect(page.locator('.blog-prose h2.markdown-h2').first()).toBeVisible();
    await expect(page.locator('.blog-prose h2', { hasText: 'References & Further Reading' })).toBeVisible();

    // Verify enhanced article reader on 'five-mistakes-first-time-entrepreneurs'
    await page.goto('/blog.html?post=five-mistakes-first-time-entrepreneurs');
    await expect(page.locator('.blog-article-title')).toContainText('5 Mistakes Every First-Time Entrepreneur Should Avoid');
    await expect(page.locator('.blog-article-meta time')).toContainText('17 Aug 2026');
    await expect(page.locator('.blog-prose h2.markdown-h2').first()).toBeVisible();
    await expect(page.locator('.blog-prose h2', { hasText: 'References & Further Reading' })).toBeVisible();
  });
});
