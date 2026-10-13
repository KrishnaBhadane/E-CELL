import { expect, test } from '@playwright/test';

test.describe('Markdown formatting support in Blog', () => {
  test('renders comprehensive markdown formatting cleanly', async ({ page }) => {
    // Intercept Supabase blogs query to return a rich markdown post and a legacy post
    await page.route('**/rest/v1/blogs*', async route => {
      const markdownContent = [
        '# Introduction to AI',
        'Artificial Intelligence is **changing the world** with *impressive precision* and ***bold italic emphasis***. Also ~~deprecated methods~~ are gone.',
        '## Key Benefits',
        '- Faster automation\n- *Improved productivity*\n- Better decision-making\n  - Nested benefit item',
        '### Ordered Steps',
        '1. Collect data\n2. Train neural network\n3. Deploy model',
        '### Task List',
        '- [x] Complete architecture design\n- [ ] Deploy to production',
        '> AI is transforming modern technology and engineering across every discipline.',
        'Visit [Google](https://google.com) for more information or [safe local link](/blog.html). Also [unsafe link](javascript:alert(1)) must be sanitized.',
        '![AI Illustration](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800)',
        'Here is inline code: `const answer = 42;` in a sentence.',
        '```typescript\nfunction calculateVelocity(distance: number, time: number): number {\n  return distance / time;\n}\n```',
        '---',
        '| Metric | Accuracy | Latency |\n| :--- | :--- | :--- |\n| GPT-4 | 96% | 240ms |\n| Claude 3.5 | 98% | 180ms |',
      ].join('\n\n');

      const mockBlogs = [
        {
          id: 'test-md-post',
          slug: 'intro-to-ai',
          title: 'Introduction to AI',
          category: 'Skills',
          excerpt: 'Artificial Intelligence is changing the world.',
          paragraphs: [markdownContent],
          cover_image: '',
          image_alt: 'AI header',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'legacy-post',
          slug: 'legacy-story',
          title: 'Legacy Plain Text Story',
          category: 'Updates',
          excerpt: 'A story written before markdown was enabled.',
          paragraphs: [
            'This is the first plain paragraph of our traditional article.',
            'This is the second plain paragraph of our traditional article.',
          ],
          cover_image: '',
          image_alt: 'Legacy story',
          status: 'published',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBlogs),
      });
    });

    // 1. Visit the Markdown blog post
    await page.goto('/blog.html?post=intro-to-ai');

    // Headings
    await expect(page.locator('.blog-prose h1.markdown-h1')).toHaveText('Introduction to AI');
    await expect(page.locator('.blog-prose h2.markdown-h2')).toHaveText('Key Benefits');
    await expect(page.locator('.blog-prose h3.markdown-h3').first()).toHaveText('Ordered Steps');

    // Bold, Italic, Strikethrough
    const firstP = page.locator('.blog-prose p.markdown-p').first();
    await expect(firstP.locator('strong').first()).toContainText('changing the world');
    await expect(firstP.locator('em').first()).toContainText('impressive precision');
    await expect(firstP.locator('del')).toContainText('deprecated methods');

    // Lists
    await expect(page.locator('.blog-prose ul.markdown-ul li.markdown-li')).toContainText(['Faster automation', 'Improved productivity', 'Better decision-making', 'Nested benefit item']);
    await expect(page.locator('.blog-prose ol.markdown-ol li.markdown-li')).toContainText(['Collect data', 'Train neural network', 'Deploy model']);

    // Task List Checkbox
    const taskCheckbox = page.locator('.blog-prose input[type="checkbox"]').first();
    await expect(taskCheckbox).toBeChecked();

    // Blockquote
    await expect(page.locator('.blog-prose blockquote.markdown-blockquote')).toContainText(
      'AI is transforming modern technology and engineering across every discipline.'
    );

    // Links & Security Sanitization
    const googleLink = page.locator('.blog-prose a.markdown-link', { hasText: 'Google' });
    await expect(googleLink).toHaveAttribute('href', 'https://google.com');
    await expect(googleLink).toHaveAttribute('target', '_blank');
    await expect(googleLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Unsafe javascript: link should be sanitized to '#'
    const unsafeLink = page.locator('.blog-prose a.markdown-link', { hasText: 'unsafe link' });
    await expect(unsafeLink).toHaveAttribute('href', '#');

    // Image
    const mdImage = page.locator('.blog-prose img.markdown-image');
    await expect(mdImage).toBeVisible();
    await expect(mdImage).toHaveAttribute('src', /images\.unsplash\.com/);

    // Inline code
    await expect(page.locator('.blog-prose code.markdown-inline-code')).toHaveText('const answer = 42;');

    // Code Block with Syntax Highlighting & Copy Button
    await expect(page.locator('.blog-prose .markdown-code-block')).toBeVisible();
    await expect(page.locator('.blog-prose .markdown-code-lang')).toHaveText('typescript');
    await expect(page.locator('.blog-prose .markdown-copy-btn')).toBeVisible();
    await expect(page.locator('.blog-prose .token.keyword').first()).toBeVisible();

    // Horizontal Rule
    await expect(page.locator('.blog-prose hr.markdown-hr')).toBeVisible();

    // Table inside responsive wrapper
    await expect(page.locator('.blog-prose .markdown-table-wrapper table.markdown-table')).toBeVisible();
    await expect(page.locator('.blog-prose th')).toContainText(['Metric', 'Accuracy', 'Latency']);
    await expect(page.locator('.blog-prose td').first()).toHaveText('GPT-4');

    // 2. Backward compatibility test: Visit legacy post with plain text paragraphs
    await page.goto('/blog.html?post=legacy-story');
    const legacyPs = page.locator('.blog-prose p.markdown-p');
    await expect(legacyPs).toHaveCount(2);
    await expect(legacyPs.first()).toHaveText('This is the first plain paragraph of our traditional article.');
    await expect(legacyPs.nth(1)).toHaveText('This is the second plain paragraph of our traditional article.');
  });

  test('renders user prompt example accurately without raw symbols', async ({ page }) => {
    const promptExampleMarkdown = `# Introduction to AI

Artificial Intelligence is **changing the world**.

## Key Benefits

- Faster automation
- *Improved productivity*
- Better decision-making

> AI is transforming modern technology.

Visit [Google](https://google.com) for more information.

### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`;

    await page.route('**/rest/v1/blogs*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'prompt-demo',
            slug: 'prompt-demo',
            title: 'Introduction to AI',
            category: 'Startup Basics',
            excerpt: 'Artificial Intelligence is changing the world.',
            paragraphs: [promptExampleMarkdown],
            status: 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.goto('/blog.html?post=prompt-demo');

    // Heading 1 - 6
    await expect(page.locator('.blog-prose h1.markdown-h1')).toHaveText('Introduction to AI');
    await expect(page.locator('.blog-prose h2.markdown-h2')).toHaveText('Key Benefits');
    await expect(page.locator('.blog-prose h3.markdown-h3')).toHaveText('Heading 3');
    await expect(page.locator('.blog-prose h4.markdown-h4')).toHaveText('Heading 4');
    await expect(page.locator('.blog-prose h5.markdown-h5')).toHaveText('Heading 5');
    await expect(page.locator('.blog-prose h6.markdown-h6')).toHaveText('Heading 6');

    // Bold, Italic, Lists
    await expect(page.locator('.blog-prose strong')).toHaveText('changing the world');
    await expect(page.locator('.blog-prose em')).toHaveText('Improved productivity');
    await expect(page.locator('.blog-prose ul.markdown-ul li.markdown-li')).toContainText([
      'Faster automation',
      'Improved productivity',
      'Better decision-making',
    ]);

    // Blockquote
    await expect(page.locator('.blog-prose blockquote.markdown-blockquote')).toContainText(
      'AI is transforming modern technology.'
    );

    // Link
    const link = page.locator('.blog-prose a.markdown-link');
    await expect(link).toHaveText('Google');
    await expect(link).toHaveAttribute('href', 'https://google.com');

    // Ensure raw symbols do NOT appear in text
    const proseText = await page.locator('.blog-prose').innerText();
    expect(proseText).not.toContain('# Introduction to AI');
    expect(proseText).not.toContain('**changing the world**');
    expect(proseText).not.toContain('*Improved productivity*');
    expect(proseText).not.toContain('> AI is transforming');
    expect(proseText).not.toContain('[Google](https://google.com)');
  });

  test('admin panel allows entering and editing markdown content seamlessly', async ({ page }) => {
    let capturedSavePayload: any = null;

    // Mock auth endpoints
    await page.route('**/auth/v1/user*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'admin-1', email: 'admin@rcpit.ac.in' }),
      });
    });

    await page.route('**/auth/v1/token*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'fake-refresh',
          user: { id: 'admin-1', email: 'admin@rcpit.ac.in' },
        }),
      });
    });

    const mockBlogs = [
      {
        id: 'blog-1',
        title: 'Existing Markdown Post',
        slug: 'existing-post',
        category: 'Startup Basics',
        excerpt: 'An existing post excerpt',
        paragraphs: ['# Title in DB\n\n- Point 1\n- Point 2\n\n```ts\nconst x = 10;\n```'],
        cover_image: '',
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    await page.route('**/rest/v1/blogs*', async route => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockBlogs),
        });
      } else if (method === 'POST' || method === 'PATCH') {
        capturedSavePayload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              ...mockBlogs[0],
              ...capturedSavePayload,
              id: 'blog-new',
            },
          ]),
        });
      }
    });

    await page.goto('/admin.html');

    // If login form is shown, log in
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('admin@rcpit.ac.in');
      await page.locator('input[type="password"]').fill('admin12345');
      await page.getByRole('button', { name: /Sign In|Login/i }).click();
    }

    // 1. Verify existing blog article loads in admin and clicking Edit populates textarea with markdown
    await expect(page.locator('.admin-card h3', { hasText: 'Existing Markdown Post' })).toBeVisible();
    await page.getByRole('button', { name: 'Edit' }).click();

    const textarea = page.locator('textarea.form-textarea').nth(1); // second textarea is content
    await expect(textarea).toHaveValue('# Title in DB\n\n- Point 1\n- Point 2\n\n```ts\nconst x = 10;\n```');

    // Close modal
    await page.getByRole('button', { name: 'Cancel' }).click();

    // 2. Click + New Article and enter markdown
    await page.getByRole('button', { name: '+ New Article' }).click();
    await page.locator('input[placeholder*="Find your people"]').fill('Future of Quantum Computing');
    await page.locator('textarea[placeholder*="Brief summary"]').fill('A primer on quantum algorithms.');

    const sampleMarkdown = `# Quantum Supremacy\n\nQuantum algorithms are **transformative**.\n\n> Physics is fascinating.\n\n- Superposition\n- Entanglement`;
    await page.locator('textarea[placeholder*="Write your article in Markdown"]').fill(sampleMarkdown);

    await page.getByRole('button', { name: 'Publish Article' }).click();

    // Verify payload preserved markdown
    expect(capturedSavePayload).not.toBeNull();
    expect(capturedSavePayload.paragraphs).toEqual([sampleMarkdown]);
  });
});

