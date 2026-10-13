import { useState, useEffect, useMemo } from 'react';
import { fetchBlogs, saveBlog, deleteBlog, type DbBlog } from '@/lib/supabase';
import { blogCategories, formatBlogDate, calculateReadingTime } from '@/data/blog';
import ImageUploadField from './ImageUploadField';
import MarkdownRenderer from '@/components/MarkdownRenderer';

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
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [publishedAt, setPublishedAt] = useState('');
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

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
    setPublishedAt(new Date().toISOString().split('T')[0]);
    setEditorTab('write');
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
    const dateSource = blog.published_at || blog.created_at;
    setPublishedAt(dateSource ? dateSource.split('T')[0] : new Date().toISOString().split('T')[0]);
    setEditorTab('write');
  }

  // Word count and reading time estimate
  const estimatedReadingTime = useMemo(() => {
    return calculateReadingTime(content);
  }, [content]);

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) {
      alert('Please provide at least a title and summary.');
      return;
    }

    setSubmitting(true);
    try {
      const paragraphs = content.trim() ? [content.trim()] : [];

      await saveBlog({
        id: editingBlog?.id,
        title: title.trim(),
        slug: slug.trim() || undefined,
        category,
        excerpt: excerpt.trim(),
        paragraphs,
        cover_image: coverImage || undefined,
        status,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      });

      onNotify(editingBlog?.id ? 'Blog post updated successfully!' : 'New blog post published successfully!');
      setEditingBlog(null);
      await loadBlogs();
    } catch (err: unknown) {
      console.error(err);
      alert('Failed to save blog post. Please check your network connection.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;
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
          <h2 className="admin-section-title">EDITORIAL ARTICLES</h2>
          <p className="admin-section-subtitle">
            Manage published articles and drafts. Articles automatically appear chronologically on the public journal sorted by publication date.
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
          {blogs.map(b => (
            <div key={b.id} className="admin-card" style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: '280px', flex: 1 }}>
                {b.cover_image ? (
                  <img src={b.cover_image} alt="" style={{ width: '88px', height: '56px', objectFit: 'cover', borderRadius: '6px', background: '#000' }} />
                ) : (
                  <div style={{ width: '88px', height: '56px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '11px' }}>No image</div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`badge-status ${b.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                      {b.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>{b.category}</span>
                    <span style={{ fontSize: '0.75rem', color: '#8b929e' }}>
                      · {formatBlogDate(b.published_at || b.created_at)}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 500 }}>{b.title}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#8b929e', maxWidth: '540px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.excerpt}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href={`/blog.html?post=${b.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  style={{ textDecoration: 'none', fontSize: '12px', padding: '6px 12px' }}
                >
                  View ↗
                </a>
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
          <div className="modal-content" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>
                  {editingBlog.id ? 'Edit Article' : 'New Article'}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#8b929e' }}>
                  {editingBlog.id ? `Editing slug: /${slug}` : 'Compose an editorial article with rich Markdown formatting'}
                </p>
              </div>
              <button className="btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setEditingBlog(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Article Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Beyond the Campus Gates: Taking Innovation to Students"
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
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

                <div className="form-group">
                  <label className="form-label">Publication Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={publishedAt}
                    onChange={e => setPublishedAt(e.target.value)}
                  />
                  <div className="form-hint">Displayed on the article and controls newest-first ordering.</div>
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">URL Slug</label>
                  <button
                    type="button"
                    style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontSize: '11px', cursor: 'pointer' }}
                    onClick={() => setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))}
                  >
                    Regenerate from title
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="article-url-slug"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                />
              </div>

              <ImageUploadField
                label="Cover Image (Supabase Storage)"
                currentUrl={coverImage}
                folder="blogs"
                onUploaded={url => setCoverImage(url)}
                hint="Upload high-resolution 16:9 editorial artwork or photography"
              />

              {coverImage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '-8px', marginBottom: '16px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={coverImage} alt="Preview" style={{ width: '64px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                  <span style={{ fontSize: '0.78rem', color: '#8b929e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {coverImage}
                  </span>
                  <button
                    type="button"
                    className="btn-danger"
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                    onClick={() => setCoverImage('')}
                  >
                    Clear Image
                  </button>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Summary / Standfirst Excerpt</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '75px' }}
                  placeholder="A clear, compelling 1-2 sentence lead summary displayed in article cards and standfirst..."
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className={`btn-ghost ${editorTab === 'write' ? 'active-editor-tab' : ''}`}
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        background: editorTab === 'write' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                        borderColor: editorTab === 'write' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                        color: editorTab === 'write' ? '#93c5fd' : '#8b929e',
                      }}
                      onClick={() => setEditorTab('write')}
                    >
                      Write Markdown
                    </button>
                    <button
                      type="button"
                      className={`btn-ghost ${editorTab === 'preview' ? 'active-editor-tab' : ''}`}
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        background: editorTab === 'preview' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                        borderColor: editorTab === 'preview' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                        color: editorTab === 'preview' ? '#93c5fd' : '#8b929e',
                      }}
                      onClick={() => setEditorTab('preview')}
                    >
                      Live Preview
                    </button>
                  </div>
                  <span style={{ fontSize: '12px', color: '#8b929e' }}>
                    ~{estimatedReadingTime} ({wordCount} words)
                  </span>
                </div>

                {editorTab === 'write' ? (
                  <>
                    <textarea
                      className="form-textarea"
                      style={{ minHeight: '260px', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.6' }}
                      placeholder="Write your article in Markdown. Supports # Headings, **bold**, *italic*, - lists, > quotes, [links](url), ![images](url), ```code```, and tables."
                      value={content}
                      onChange={e => setContent(e.target.value)}
                    />
                    <div className="form-hint">Tip: Supports full GitHub Flavored Markdown (H1-H6, tables, task lists, code blocks with syntax highlighting).</div>
                  </>
                ) : (
                  <div
                    style={{
                      minHeight: '260px',
                      maxHeight: '420px',
                      overflowY: 'auto',
                      padding: '24px',
                      background: '#FFFFFF',
                      color: '#111111',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    {content.trim() ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                        Nothing to preview yet. Switch back to Write Markdown to add content.
                      </p>
                    )}
                  </div>
                )}
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
