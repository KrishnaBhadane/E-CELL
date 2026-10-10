import { useState, useEffect } from 'react';
import { fetchBlogs, saveBlog, deleteBlog, type DbBlog } from '@/lib/supabase';
import { blogCategories } from '@/data/blog';
import ImageUploadField from './ImageUploadField';

const validCategories = blogCategories.filter(c => c !== 'All');

interface ManageBlogsProps {
  onNotify: (msg: string) => void;
}

export default function ManageBlogs({ onNotify }: ManageBlogsProps) {
  const [blogs, setBlogs] = useState<DbBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<Partial<DbBlog> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<string>(validCategories[0]);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState(''); // Textarea with double-newlines separating paragraphs
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    setLoading(true);
    const data = await fetchBlogs(true); // include drafts in admin
    setBlogs(data);
    setLoading(false);
  }

  function startCreate() {
    setEditingBlog({});
    setTitle('');
    setSlug('');
    setCategory(validCategories[0]);
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setStatus('published');
  }

  function startEdit(blog: DbBlog) {
    setEditingBlog(blog);
    setTitle(blog.title);
    setSlug(blog.slug);
    setCategory(blog.category);
    setExcerpt(blog.excerpt);
    setContent(Array.isArray(blog.paragraphs) ? blog.paragraphs.join('\n\n') : '');
    setCoverImage(blog.cover_image || '');
    setStatus(blog.status);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) {
      alert('Please provide at least a title and summary.');
      return;
    }

    setSubmitting(true);
    try {
      const paragraphs = content
        .split('\n\n')
        .map(p => p.trim())
        .filter(Boolean);

      await saveBlog({
        id: editingBlog?.id,
        title: title.trim(),
        slug: slug.trim() || undefined,
        category,
        excerpt: excerpt.trim(),
        paragraphs,
        cover_image: coverImage || undefined,
        status,
      });

      onNotify(editingBlog?.id ? 'Blog post updated!' : 'New blog post published!');
      setEditingBlog(null);
      await loadBlogs();
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to save blog post. Make sure Supabase tables exist.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await deleteBlog(id);
      onNotify('Blog post deleted.');
      await loadBlogs();
    } catch (err) {
      console.error(err);
      alert('Failed to delete blog post.');
    }
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">BLOG ARTICLES</h2>
          <p className="admin-section-subtitle">
            Published blogs sort newest first. The latest post will headline the &quot;Recent blog&quot; feature, and earlier posts automatically move into the grid.
          </p>
        </div>
        <button className="btn-silver" onClick={startCreate}>
          + New Article
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8b929e' }}>Loading blog articles...</div>
      ) : blogs.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: '#8b929e', marginBottom: '16px' }}>No blog articles found in Supabase.</p>
          <button className="btn-silver" onClick={startCreate}>Create First Blog Post</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {blogs.map((b, idx) => (
            <div key={b.id} className="admin-card" style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: '280px', flex: 1 }}>
                {b.cover_image ? (
                  <img src={b.cover_image} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', background: '#000' }} />
                ) : (
                  <div style={{ width: '80px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>No img</div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`badge-status ${b.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                      {b.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#8b929e' }}>{b.category}</span>
                    {idx === 0 && b.status === 'published' && (
                      <span className="admin-badge" style={{ borderColor: '#34d399', color: '#34d399' }}>★ Headline Recent</span>
                    )}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{b.title}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#8b929e', maxWidth: '520px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.excerpt}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="btn-ghost" onClick={() => startEdit(b)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT / CREATE MODAL */}
      {editingBlog && (
        <div className="modal-overlay" onClick={() => setEditingBlog(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>
                {editingBlog.id ? 'Edit Article' : 'New Article'}
              </h3>
              <button className="btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setEditingBlog(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Find your people. Build something together."
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    if (!editingBlog.id) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                    }
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {validCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={e => setStatus(e.target.value as 'draft' | 'published')}
                  >
                    <option value="published">Published (Visible on site)</option>
                    <option value="draft">Draft (Hidden from visitors)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Slug (URL path)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="finding-your-first-team"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                />
              </div>

              <ImageUploadField
                label="Cover Image (Supabase Storage)"
                currentUrl={coverImage}
                folder="blogs"
                onUploaded={url => setCoverImage(url)}
                hint="Upload an editorial image or illustration (automatic public CDN URL)"
              />

              <div className="form-group">
                <label className="form-label">Summary / Excerpt</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '70px' }}
                  placeholder="Brief summary that appears in cards and recent spotlight..."
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Article Content</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '160px' }}
                  placeholder="Type article paragraphs here. Separate each paragraph with a blank line (double enter)."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
                <div className="form-hint">Tip: Double enter (blank line) creates a separate paragraph block on the blog post page.</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-ghost" onClick={() => setEditingBlog(null)}>Cancel</button>
                <button type="submit" className="btn-silver" disabled={submitting}>
                  {submitting ? 'Saving...' : editingBlog.id ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
