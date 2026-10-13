import { expect, test } from '@playwright/test';

const mockBlogs = [
  {
    id: 'post-1',
    slug: 'ecell-rcpit-illuminate-campus-outreach-2026',
    title: 'Beyond the Campus Gates: How E-Cell RCPIT Took Illuminate to the Student Community',
    category: 'Campus Stories',
    excerpt: 'Great campus events begin long before the stage lights turn on. Discover how E-Cell RCPIT stepped beyond its campus to spread awareness about Illuminate 2026.',
    paragraphs: [
      '# Beyond the Campus Gates\n\nEvery memorable campus event has a story that begins before the audience arrives.\n\n## The Journey to Outreach\n\nReaching out to students across different colleges requires thoughtful coordination and genuine enthusiasm.\n\n> Innovation flourishes when students connect beyond classroom walls.\n\nVisit [E-Cell RCPIT](https://ecell-tan.vercel.app) for more details.',
    ],
    cover_image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
    status: 'published',
    published_at: '2026-10-14T06:00:00Z',
    created_at: '2026-10-14T06:00:00Z',
  },
  {
    id: 'post-2',
    slug: 'validate-startup-idea-before-spending',
    title: 'How to Validate a Startup Idea Before Spending Money',
    category: 'Startup Basics',
    excerpt: 'Testing assumptions with customer discovery interviews before writing code or investing capital.',
    paragraphs: ['Customer interviews save months of wasted development.'],
    cover_image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800',
    status: 'published',
    published_at: '2026-10-12T08:00:00Z',
    created_at: '2026-10-12T08:00:00Z',
  },
  {
    id: 'post-3',
    slug: 'building-minimum-viable-products',
    title: 'Building Minimum Viable Products That Actually Test Assumptions',
    category: 'Skills',
    excerpt: 'How student engineers can launch functional prototypes in days instead of months.',
    paragraphs: ['Focus strictly on core hypotheses.'],
    cover_image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800',
    status: 'published',
    published_at: '2026-10-10T10:00:00Z',
    created_at: '2026-10-10T10:00:00Z',
  },
  {
    id: 'post-4',
    slug: 'campus-pitch-guide',
    title: 'Pitch Your Startup Idea in 60 Seconds: A Guide for Student Entrepreneurs',
    category: 'Skills',
    excerpt: 'Distilling complex vision into a crisp, compelling elevator pitch for hackathons and demo days.',
    paragraphs: ['Structure: Problem, Solution, Traction, Ask.'],
    cover_image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    status: 'published',
    published_at: '2026-10-08T12:00:00Z',
    created_at: '2026-10-08T12:00:00Z',
  },
];

test.describe('Editorial Blog Upgrade Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/blogs*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBlogs),
      });
    });
  });

  test('listing page features Wikipedia-inspired typography, white background, and 3-column grid', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/blog.html');

    // 1. Color Palette: Pure white canvas, dark text
    const bgColor = await page.locator('.blog-page').evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(255, 255, 255)');

    // 2. Typography: Serif heading
    const titleFont = await page.locator('.blog-title').evaluate(el => getComputedStyle(el).fontFamily);
    expect(titleFont.toLowerCase()).toMatch(/georgia|libertine|times/);

    const titleWeight = await page.locator('.blog-title').evaluate(el => parseInt(getComputedStyle(el).fontWeight, 10));
    expect(titleWeight).toBeLessThanOrEqual(500);

    // 3. 3-column responsive grid on desktop
    const gridColumns = await page.locator('.blog-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(gridColumns).toBe(3);

    // 4. Article cards: 16:9 cover image, category, date, reading time
    const cards = page.locator('.blog-card');
    await expect(cards).toHaveCount(4);

    const firstCard = cards.first();
    await expect(firstCard.locator('.blog-card-category')).toHaveText('Campus Stories');
    await expect(firstCard.locator('.blog-card-category')).toHaveCSS('color', 'rgb(37, 99, 235)'); // #2563EB accent
    await expect(firstCard.locator('time')).toContainText('14 Oct 2026');
    await expect(firstCard.locator('.blog-card-body')).toContainText('min read');

    // 5. Category filtering
    await page.getByRole('button', { name: 'Skills', exact: true }).click();
    await expect(page.locator('.blog-card')).toHaveCount(2);

    await page.getByRole('button', { name: 'Startup Basics', exact: true }).click();
    await expect(page.locator('.blog-card')).toHaveCount(1);

    await page.getByRole('button', { name: 'All Articles', exact: true }).click();
    await expect(page.locator('.blog-card')).toHaveCount(4);

    // 6. Interactive search
    await page.locator('.blog-search-input').fill('pitch');
    await expect(page.locator('.blog-card')).toHaveCount(1);
    await expect(page.locator('.blog-card h2')).toContainText('Pitch Your Startup Idea');

    // Clear search
    await page.locator('.blog-search-clear').click();
    await expect(page.locator('.blog-card')).toHaveCount(4);
  });

  test('individual article page offers calm, Wikipedia-inspired reading layout', async ({ page }) => {
    await page.goto('/blog.html?post=ecell-rcpit-illuminate-campus-outreach-2026');

    // 1. White background
    const bgColor = await page.locator('.blog-page').evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe('rgb(255, 255, 255)');

    // 2. Article title in refined serif (400-500 weight)
    const title = page.locator('.blog-article-title');
    await expect(title).toContainText('Beyond the Campus Gates');
    const titleFont = await title.evaluate(el => getComputedStyle(el).fontFamily);
    expect(titleFont.toLowerCase()).toMatch(/georgia|libertine|times/);
    const weight = await title.evaluate(el => parseInt(getComputedStyle(el).fontWeight, 10));
    expect(weight).toBeLessThanOrEqual(500);

    // 3. Metadata: category pill, publication date, reading time
    await expect(page.locator('.blog-article-category')).toHaveText('Campus Stories');
    await expect(page.locator('.blog-article-meta time')).toContainText('14 Oct 2026');
    await expect(page.locator('.blog-article-meta')).toContainText('min read');

    // 4. Standfirst summary
    await expect(page.locator('.blog-standfirst')).toBeVisible();

    // 5. Prose width max around 720px
    const proseWidth = await page.locator('.blog-prose').evaluate(el => el.getBoundingClientRect().width);
    expect(proseWidth).toBeLessThanOrEqual(740);

    // 6. Markdown content renders formatted elements
    await expect(page.locator('.blog-prose h1.markdown-h1')).toHaveText('Beyond the Campus Gates');
    await expect(page.locator('.blog-prose h2.markdown-h2')).toHaveText('The Journey to Outreach');
    await expect(page.locator('.blog-prose blockquote.markdown-blockquote')).toBeVisible();
    await expect(page.locator('.blog-prose a.markdown-link')).toHaveAttribute('href', 'https://ecell-tan.vercel.app');

    // 7. Copy Article Link button
    const shareBtn = page.locator('.blog-share-btn');
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();
    await expect(shareBtn).toContainText('Link Copied');

    // 8. Back to articles navigation
    await page.locator('.blog-back-link').click();
    await expect(page.locator('.blog-grid')).toBeVisible();
  });

  test('responsive layout adapts gracefully across viewports (360px, 390px, 768px, 1440px)', async ({ page }) => {
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/blog.html');

      // Check no horizontal document overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);

      // Check grid columns
      const gridCols = await page.locator('.blog-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      if (width <= 640) {
        expect(gridCols).toBe(1);
      } else if (width <= 960) {
        expect(gridCols).toBe(2);
      } else {
        expect(gridCols).toBe(3);
      }

      // Visit article page
      await page.goto('/blog.html?post=ecell-rcpit-illuminate-campus-outreach-2026');
      const articleScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(articleScrollWidth).toBeLessThanOrEqual(width);
    }
  });
});
