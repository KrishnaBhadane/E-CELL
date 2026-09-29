import { useEffect, useState, type KeyboardEvent } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogCategories, blogPosts } from '@/data/blog';
import '@/styles/blog.css';
import GenerativeArt from '@/components/ui/generative-art';
import { useBlogScroll } from '@/hooks/useBlogScroll';
import AnimatedPageHero from '@/components/AnimatedPageHero';

const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get('category');
const initialCategory = blogCategories.find(category => category === requestedCategory) ?? 'All';
const slug = params.get('post');
const post = blogPosts.find(article => article.slug === slug);

export default function BlogPage() {
  const [category, setCategory] = useState<typeof blogCategories[number]>(initialCategory);
  const { area, stage, rail } = useBlogScroll(category);
  const articles = blogPosts.filter(article => category === 'All' || article.category === category);
  useEffect(() => { document.title = `${post?.title ?? 'Blog'} — E-Cell RCPIT`; }, []);
  function choose(next: typeof category) {
    setCategory(next);
    const query = new URLSearchParams();
    if (next !== 'All') query.set('category', next);
    history.replaceState(null, '', `/blog.html${query.size ? `?${query}` : ''}`);
  }
  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % blogCategories.length : event.key === 'ArrowLeft' ? (index + blogCategories.length - 1) % blogCategories.length : event.key === 'Home' ? 0 : event.key === 'End' ? blogCategories.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault(); choose(blogCategories[next]);
    document.getElementById(`blog-tab-${next}`)?.focus();
  }
  return <>
    <a className="skip-link" href="#blog-content">Skip to articles</a><div id="top" /><Header />
    <main className="blog-page" data-nav-tone="light">
      <GenerativeArt />
      {slug ? <section className="blog-reader" id="blog-content">
        <a className="glass-control glass-button" href={`/blog.html?category=${encodeURIComponent(category)}`}>← Back to articles</a>
        {post ? <article>
          <div className="blog-meta">{post.category} <span>Sample article</span></div>
          <h1>{post.title}</h1><p className="blog-standfirst">{post.excerpt}</p>
          {post.image && <img className="blog-reader-image" src={post.image} alt={post.imageAlt} width="1200" height="675" />}
          <div className="blog-prose">{post.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        </article> : <div className="blog-missing"><h1>Article not found.</h1><p>Choose an article from the blog to continue reading.</p></div>}
      </section> : <>
        <AnimatedPageHero />
        <section ref={area} id="blog-content" className="blog-library" aria-label="Blog articles">
          <div ref={stage} className="blog-stage">
          <div className="blog-tabs" role="tablist" aria-label="Article categories">{blogCategories.map((item, index) => <button
            className="glass-control glass-button" key={item} id={`blog-tab-${index}`} role="tab" aria-selected={category === item} aria-controls="blog-results"
            tabIndex={category === item ? 0 : -1} onClick={() => choose(item)} onKeyDown={event => navigateTabs(event, index)}>{item}</button>)}</div>
          <div className="blog-results-heading"><h2>{category === 'All' ? 'Latest stories' : category}</h2><span role="status">{articles.length} {articles.length === 1 ? 'article' : 'articles'}</span></div>
          <div ref={rail} className="blog-grid" id="blog-results" role="tabpanel" tabIndex={0} aria-labelledby={`blog-tab-${blogCategories.indexOf(category)}`}>
            {articles.map((article, index) => <article className="blog-card" key={article.slug}>
              <div className="blog-note-masthead"><span>E-CELL RCPIT · JOURNAL</span><span>No. {String(index + 1).padStart(3, '0')}</span></div>
              {article.image ? <img className="blog-card-image" src={article.image} alt={article.imageAlt} loading="lazy" decoding="async" width="1200" height="675" /> : <div className={`blog-card-art art-${article.category === 'Updates' ? 'update' : article.category === 'Skills' ? 'skills' : 'idea'}`} aria-hidden="true"><span>{article.category === 'Updates' ? 'NEXT' : article.category === 'Skills' ? 'SPEAK' : 'IDEA'}</span></div>}
              <div className="blog-card-copy"><span className="blog-category">{article.category}</span><h3>{article.title}</h3><p>{article.excerpt}</p>
                <a className="glass-control glass-button" href={`/blog.html?post=${article.slug}&category=${encodeURIComponent(category)}`} aria-label={`Read ${article.title}`}>Read story <span aria-hidden="true">↗</span></a>
              </div>
            </article>)}
          </div>
          <div className="blog-scroll-progress" aria-hidden="true"><span /></div>
          </div>
        </section>
      </>}
    </main><Footer />
  </>;
}
