import { useState, useEffect } from 'react';
import { fetchTestimonials, saveTestimonial, deleteTestimonial, type DbTestimonial } from '@/lib/supabase';
import ImageUploadField from './ImageUploadField';

interface ManageTestimonialsProps {
  onNotify: (msg: string) => void;
}

export default function ManageTestimonials({ onNotify }: ManageTestimonialsProps) {
  const [testimonials, setTestimonials] = useState<DbTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<DbTestimonial> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('E-Cell participant');
  const [quote, setQuote] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    setLoading(true);
    const data = await fetchTestimonials();
    setTestimonials(data);
    setLoading(false);
  }

  function startCreate() {
    setEditingItem({});
    setName('');
    setRole('E-Cell participant');
    setQuote('');
    setImage('');
  }

  function startEdit(item: DbTestimonial) {
    setEditingItem(item);
    setName(item.name);
    setRole(item.role || '');
    setQuote(item.quote);
    setImage(item.image || '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) {
      alert('Please enter a name and testimonial text.');
      return;
    }

    setSubmitting(true);
    try {
      await saveTestimonial({
        id: editingItem?.id,
        name: name.trim(),
        role: role.trim() || 'E-Cell participant',
        quote: quote.trim(),
        image: image.trim() || undefined,
      });

      onNotify(editingItem?.id ? 'Testimonial updated!' : 'New testimonial added!');
      setEditingItem(null);
      await loadTestimonials();
    } catch (err) {
      console.error(err);
      alert('Failed to save testimonial.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      onNotify('Testimonial removed.');
      await loadTestimonials();
    } catch (err) {
      console.error(err);
      alert('Failed to delete testimonial.');
    }
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">TESTIMONIALS</h2>
          <p className="admin-section-subtitle">
            Manage quotes and member reviews shown in the homepage carousel.
          </p>
        </div>
        <button className="btn-silver" onClick={startCreate}>
          + Add Testimonial
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8b929e' }}>Loading testimonials...</div>
      ) : testimonials.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: '#8b929e', marginBottom: '16px' }}>No testimonials saved in database.</p>
          <button className="btn-silver" onClick={startCreate}>Add First Testimonial</button>
        </div>
      ) : (
        <div className="admin-grid-2">
          {testimonials.map(item => (
            <div key={item.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #aeb4bd, #444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000', fontSize: '0.95rem' }}>
                    {item.initials}
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{item.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#8b929e' }}>{item.role}</span>
                </div>
              </div>

              <blockquote style={{ margin: 0, fontSize: '0.9rem', color: '#cfd4dc', fontStyle: 'italic', lineHeight: 1.5, flex: 1 }}>
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => startEdit(item)}>Edit</button>
                <button className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>
                {editingItem.id ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button className="btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setEditingItem(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Person&apos;s Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Krushna Bhadane"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role / Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. E-Cell participant · Demo profile"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                />
              </div>

              <ImageUploadField
                label="Avatar Image (Optional, initials used if omitted)"
                currentUrl={image}
                folder="testimonials"
                onUploaded={url => setImage(url)}
                hint="Upload profile avatar"
              />

              <div className="form-group">
                <label className="form-label">Testimonial Quote / Description</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '110px' }}
                  placeholder="What did they share about their experience with E-Cell?"
                  value={quote}
                  onChange={e => setQuote(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-ghost" onClick={() => setEditingItem(null)}>Cancel</button>
                <button type="submit" className="btn-silver" disabled={submitting}>
                  {submitting ? 'Saving...' : editingItem.id ? 'Save Testimonial' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
