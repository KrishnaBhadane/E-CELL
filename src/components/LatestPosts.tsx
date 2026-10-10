import { useEffect, useState } from 'react';
import { blogPosts, type BlogPost } from '@/data/blog';
import { fetchBlogs } from '@/lib/supabase';

/** Keep data newest first: a new entry automatically moves the previous one into the archive. */
export default function LatestPosts({ post: propPost }: { post?: BlogPost }) {
  const [featured, setFeatured] = useState<BlogPost>(propPost || blogPosts[0]);

  useEffect(() => {
    if (propPost) {
      setFeatured(propPost);
      return;
    }

    fetchBlogs(false).then(dbBlogs => {
      if (dbBlogs.length > 0) {
        const top = dbBlogs[0];
        setFeatured({
          slug: top.slug,
          title: top.title,
          category: top.category as BlogPost['category'],
          excerpt: top.excerpt,
          image: top.cover_image || '/assets/blog/editorial-0.svg',
          imageAlt: top.image_alt || top.title,
          paragraphs: Array.isArray(top.paragraphs) ? top.paragraphs : [top.excerpt],
        });
      }
    });
  }, [propPost]);

  if (!featured) return null;

  return (
    <section className="latest-posts" aria-labelledby="latest-title">
      <h2 id="latest-title">Recent blog</h2>
      <article className="latest-post">
        <img src={featured.image} alt={featured.imageAlt ?? ''} width="800" height="600" />
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
