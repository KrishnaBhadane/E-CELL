import '@/styles/directory-hero.css';
import { useEffect, useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogCategories, formatBlogDate, calculateReadingTime, type BlogPost } from '@/data/blog';
import { fetchBlogs } from '@/lib/supabase';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import '@/styles/blog.css';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const slug = new URLSearchParams(location.search).get('post');
  const post = posts.find(item => item.slug === slug);

  useEffect(() => {
    fetchBlogs(false).then(dbBlogs => {
      setPosts(
        dbBlogs.map((b, idx) => {
          const paragraphs = Array.isArray(b.paragraphs) && b.paragraphs.length > 0 ? b.paragraphs : [b.excerpt];
          const publishedAt = b.published_at || b.created_at;
          return {
            slug: b.slug,
            title: b.title,
            category: b.category as BlogPost['category'],
            excerpt: b.excerpt,
            image: b.cover_image || `/assets/blog/editorial-${idx % 3}.svg`,
            imageAlt: b.image_alt || b.title,
            paragraphs,
            publishedAt,
            readingTime: calculateReadingTime(paragraphs),
          };
        })
      );
      setLoading(false);
    });
  }, []);

  // Filtered listing
  const filteredPosts = useMemo(() => {
    return posts.filter(item => {
      const matchesCategory = category === 'All' || item.category === category;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [posts, category, searchQuery]);

  // Related posts for individual article reader
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const inCategory = posts.filter(p => p.slug !== post.slug && p.category === post.category);
    if (inCategory.length >= 2) return inCategory.slice(0, 2);
    const others = posts.filter(p => p.slug !== post.slug && p.category !== post.category);
    return [...inCategory, ...others].slice(0, 2);
  }, [posts, post]);

  // SEO & Head Management
  useEffect(() => {
    if (post) {
      document.title = `${post.title} — E-Cell RCPIT Journal`;

      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', post.excerpt);

      // Open Graph Tags
      const setOgTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      setOgTag('og:title', post.title);
      setOgTag('og:description', post.excerpt);
      if (post.image) setOgTag('og:image', post.image);
      setOgTag('og:url', window.location.href);
    } else {
      document.title = 'The Journal — E-Cell RCPIT';
    }
  }, [post]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
    } catch {
      // Fallback if clipboard API is blocked in strict environments
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <a className="skip-link" href="#blog-content">Skip to articles</a>
      <div id="top" />
      <Header />
      <main className="blog-page" data-nav-tone="light">
        {slug ? (
          <section className="blog-reader" id="blog-content">
            <div className="blog-reader-nav">
              <a href="/blog.html" className="blog-back-link">
                ← Back to articles
              </a>
              {post && (
                <button
                  type="button"
                  className="blog-share-btn"
                  onClick={handleCopyLink}
                  aria-label="Copy article link to clipboard"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? '✓ Link Copied' : 'Copy Link'}
                </button>
              )}
            </div>

            {post ? (
              <article className="blog-article">
                <header className="blog-article-header">
                  <div className="blog-article-meta">
                    <span className="blog-article-category">{post.category}</span>
                    <span className="meta-sep">·</span>
                    <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                    <span className="meta-sep">·</span>
                    <span>{post.readingTime}</span>
                  </div>

                  <h1 className="blog-article-title">{post.title}</h1>

                  {post.excerpt && (
                    <p className="blog-standfirst">{post.excerpt}</p>
                  )}

                  <div className="blog-byline">
                    <div className="byline-badge" aria-hidden="true">E</div>
                    <div className="byline-text">
                      <span className="byline-name">E-Cell RCPIT Editorial Team</span>
                      <span className="byline-sub">Dispatches on student venture creation & innovation</span>
                    </div>
                  </div>
                </header>

                {post.image && (
                  <figure className="blog-article-figure">
                    <img
                      className="blog-article-image blog-reader-image"
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      width="1200"
                      height="675"
                      fetchPriority="high"
                      decoding="async"
                    />
                    {post.imageAlt && post.imageAlt !== post.title && (
                      <figcaption className="blog-article-caption">{post.imageAlt}</figcaption>
                    )}
                  </figure>
                )}

                <div className="blog-prose">
                  <MarkdownRenderer content={post.paragraphs.join('\n\n')} />
                </div>

                <footer className="blog-article-footer">
                  <div className="blog-share-card">
                    <div>
                      <h3>Share this article</h3>
                      <p>Spread insights with fellow student builders and innovators.</p>
                    </div>
                    <div className="blog-share-actions">
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="blog-social-share-btn"
                        aria-label="Share on X"
                        title="Share on X"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M3 3l18 18h-5L3 3h5l13 18M21 3 3 21" />
                        </svg>
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="blog-social-share-btn"
                        aria-label="Share on LinkedIn"
                        title="Share on LinkedIn"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M4 9v12M4 3v.01M10 21V9m0 5a5 5 0 0 1 10 0v7" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        className="blog-share-pill-btn"
                        onClick={handleCopyLink}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        {copied ? '✓ Link Copied to Clipboard' : 'Copy Article Link'}
                      </button>
                    </div>
                  </div>
                </footer>

                {relatedPosts.length > 0 && (
                  <section className="blog-related-section" aria-label="Related articles">
                    <div className="blog-related-header">
                      <h2 className="blog-related-title">More in {post.category}</h2>
                      <a href="/blog.html" className="blog-related-link">View all articles →</a>
                    </div>
                    <div className="blog-related-grid">
                      {relatedPosts.map(rel => (
                        <article className="blog-card" key={rel.slug}>
                          <a href={`/blog.html?post=${rel.slug}`} className="blog-card-media" aria-label={`Read ${rel.title}`}>
                            {rel.image && (
                              <img
                                src={rel.image}
                                alt={rel.imageAlt || rel.title}
                                width="600"
                                height="338"
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                          </a>
                          <div className="blog-card-body">
                            <div className="blog-card-meta">
                              <span className="blog-card-category">{rel.category}</span>
                              <span className="meta-sep">·</span>
                              <time dateTime={rel.publishedAt}>{formatBlogDate(rel.publishedAt)}</time>
                              <span className="meta-sep">·</span>
                              <span>{rel.readingTime}</span>
                            </div>
                            <h3 className="blog-card-title">
                              <a href={`/blog.html?post=${rel.slug}`}>{rel.title}</a>
                            </h3>
                            <p className="blog-card-excerpt">{rel.excerpt}</p>
                            <a href={`/blog.html?post=${rel.slug}`} className="blog-card-link">
                              Read article <span aria-hidden="true">→</span>
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </article>
            ) : (
              <div className="blog-empty-state">
                <h1>Article not found.</h1>
                <p>The story you are looking for may have been updated, renamed, or is currently unpublished.</p>
                <a href="/blog.html" className="blog-reset-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Return to articles
                </a>
              </div>
            )}
          </section>
        ) : (
          <div className="blog-container">
            <header className="blog-header">
              <div className="blog-header-inner">
                <span className="blog-kicker">E-CELL RCPIT / JOURNAL</span>
                <h1 className="blog-title">The Journal</h1>
                <p className="blog-description">
                  Insights, practical guides, and field dispatches from student founders, engineers, and creators at RCPIT.
                </p>
              </div>
            </header>

            <section id="blog-content" aria-label="Blog articles">
              <div className="blog-controls">
                <div className="blog-tabs" role="tablist" aria-label="Article categories">
                  {blogCategories.map(item => (
                    <button
                      key={item}
                      type="button"
                      className={`blog-tab ${category === item ? 'active' : ''}`}
                      aria-pressed={category === item}
                      onClick={() => setCategory(item)}
                    >
                      {item === 'All' ? 'All Articles' : item}
                    </button>
                  ))}
                </div>

                <div className="blog-search-wrapper">
                  <span className="blog-search-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="search"
                    className="blog-search-input"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label="Search articles by title or keyword"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="blog-search-clear"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search query"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '64px 16px', color: '#52525B', fontSize: '15px' }}>
                  Loading articles...
                </div>
              ) : filteredPosts.length > 0 ? (
                <>
                  <div className="blog-results-meta">
                    <span>
                      {category === 'All' ? 'All Publications' : category}
                      {searchQuery ? ` matching "${searchQuery}"` : ''}
                    </span>
                    <span>
                      {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                    </span>
                  </div>

                  <div className="blog-grid">
                    {filteredPosts.map((article, idx) => (
                      <article className="blog-card" key={article.slug}>
                        <a
                          href={`/blog.html?post=${article.slug}`}
                          className="blog-card-media"
                          aria-label={`Read ${article.title}`}
                        >
                          {article.image && (
                            <img
                              src={article.image}
                              alt={article.imageAlt || article.title}
                              width="800"
                              height="450"
                              loading={idx < 3 ? 'eager' : 'lazy'}
                              decoding="async"
                            />
                          )}
                        </a>
                        <div className="blog-card-body">
                          <div className="blog-card-meta">
                            <span className="blog-card-category">{article.category}</span>
                            <span className="meta-sep">·</span>
                            <time dateTime={article.publishedAt}>{formatBlogDate(article.publishedAt)}</time>
                            <span className="meta-sep">·</span>
                            <span>{article.readingTime}</span>
                          </div>
                          <h2 className="blog-card-title">
                            <a href={`/blog.html?post=${article.slug}`}>{article.title}</a>
                          </h2>
                          <p className="blog-card-excerpt">{article.excerpt}</p>
                          <a
                            href={`/blog.html?post=${article.slug}`}
                            className="blog-card-link"
                            aria-label={`Read ${article.title}`}
                          >
                            Read article <span aria-hidden="true">→</span>
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className="blog-empty-state">
                  <h3>No articles found</h3>
                  <p>
                    {searchQuery
                      ? `No articles matched your search for "${searchQuery}".`
                      : `No articles have been published in "${category}" yet.`}
                  </p>
                  <button
                    type="button"
                    className="blog-reset-btn"
                    onClick={() => {
                      setCategory('All');
                      setSearchQuery('');
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
