import type { BlogPost } from '@/data/blog';

/** The parent owns fetching; this component only renders the latest entry. */
export default function LatestPosts({ post: featured }: { post?: BlogPost }) {
  if (!featured) return null;

  return (
    <section className="latest-posts" aria-labelledby="latest-title">
      <h2 id="latest-title">Recent blog</h2>
      <article className="latest-post">
        {featured.image && (
          <img src={featured.image} alt={featured.imageAlt ?? ''} width="800" height="600" />
        )}
        <div>
          <span className="blog-category">{featured.category}</span>
          <h3>{featured.title}</h3>
          <p>{featured.excerpt}</p>
          <a href={`/blog.html?post=${featured.slug}`}>Read more ↗</a>
        </div>
      </article>
    </section>
  );
}
