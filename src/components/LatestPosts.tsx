import { blogPosts } from '@/data/blog';

/** Keep data newest first: a new entry automatically moves the previous one into the archive. */
export default function LatestPosts() {
  const post = blogPosts[0];
  if (!post) return null;
  return <section className="latest-posts" aria-labelledby="latest-title">
    <h2 id="latest-title">Recent blog</h2>
    <article className="latest-post">
      <img src={post.image} alt={post.imageAlt ?? ''} width="800" height="600" />
      <div><span className="blog-category">{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p>
        <a href={`/blog.html?post=${post.slug}`}>Read more ↗</a></div>
    </article>
  </section>;
}
