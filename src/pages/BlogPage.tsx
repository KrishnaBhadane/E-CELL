import '@/styles/directory-hero.css';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogCategories, type BlogPost } from '@/data/blog';
import { fetchBlogs } from '@/lib/supabase';
import LatestPosts from '@/components/LatestPosts';
import '@/styles/blog.css';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const slug = new URLSearchParams(location.search).get('post');
  const post = posts.find(item => item.slug === slug);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchBlogs(false).then(dbBlogs => {
      setPosts(
        dbBlogs.map((b, idx) => ({
          slug: b.slug,
          title: b.title,
          category: b.category as BlogPost['category'],
          excerpt: b.excerpt,
          image: b.cover_image || `/assets/blog/editorial-${idx % 3}.svg`,
          imageAlt: b.image_alt || b.title,
          paragraphs: Array.isArray(b.paragraphs) && b.paragraphs.length > 0 ? b.paragraphs : [b.excerpt],
        }))
      );
      setLoading(false);
    });
  }, []);

  const archive = posts.slice(1).filter(item => category === 'All' || item.category === category);

  useEffect(() => {
    document.title = `${post?.title ?? 'Blog'} — E-Cell RCPIT`;
  }, [post]);

  return (
    <>
      <a className="skip-link" href="#blog-content">Skip to articles</a>
      <div id="top" />
      <Header />
      <main className="blog-page" data-nav-tone="dark">
        {slug ? (
          <section className="blog-reader" id="blog-content">
            <a href="/blog.html">← Back to articles</a>
            {post ? (
              <article>
                <span className="blog-meta">{post.category} · Article</span>
                <h1>{post.title}</h1>
                {post.image && (
                  <img className="blog-reader-image" src={post.image} alt={post.imageAlt ?? ''} width="800" height="600" />
                )}
                <p className="blog-standfirst">{post.excerpt}</p>
                <div className="blog-prose">
                  {post.paragraphs.map(text => (
                    <p key={text}>{text}</p>
                  ))}
                </div>
              </article>
            ) : (
              <h1>Article not found.</h1>
            )}
          </section>
        ) : (
          <>
            <header className="directory-heading">
              <span>E-CELL RCPIT / JOURNAL</span>
              <h1>BLOG</h1>
            </header>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#8b929e', padding: '40px 0' }}>Loading stories...</p>
            ) : posts.length > 0 ? (
              <>
                <LatestPosts post={posts[0]} />

                <section id="blog-content" className="blog-library" aria-label="Blog articles">
                  <div className="blog-results-heading">
                    <h2>All stories</h2>
                    <span>{posts.length} {posts.length === 1 ? 'article' : 'articles'}</span>
                  </div>
                  <div className="blog-tabs" aria-label="Article categories">
                    {blogCategories.map(item => (
                      <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>
                        {item}
                      </button>
                    ))}
                  </div>

                  {archive.length > 0 ? (
                    <div className="blog-grid">
                      {archive.map(article => (
                        <article className="blog-card" key={article.slug}>
                          {article.image && (
                            <img src={article.image} alt={article.imageAlt ?? ''} width="800" height="600" loading="lazy" decoding="async" />
                          )}
                          <span className="blog-category">{article.category}</span>
                          <h3>{article.title}</h3>
                          <a href={`/blog.html?post=${article.slug}`} aria-label={`Read ${article.title}`}>
                            Read more ↗
                          </a>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#8b929e', padding: '32px 16px' }}>
                      <p>When you publish your next story, the current headline story will automatically move into this archive grid!</p>
                    </div>
                  )}
                </section>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#8b929e', padding: '60px 16px' }}>
                <p>No published articles yet. Publish articles from the Admin Portal.</p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
