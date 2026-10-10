import { useState, useEffect } from 'react';
import { fetchGalleryEvents, saveGalleryEvent, deleteGalleryEvent, type DbGalleryEvent, type GalleryPhoto } from '@/lib/supabase';
import ImageUploadField from './ImageUploadField';

interface ManageGalleryProps {
  onNotify: (msg: string) => void;
}

export default function ManageGallery({ onNotify }: ManageGalleryProps) {
  const [events, setEvents] = useState<DbGalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Partial<DbGalleryEvent> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [upcoming, setUpcoming] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([
    { image: '', caption: 'Photo 1' },
    { image: '', caption: 'Photo 2' },
    { image: '', caption: 'Photo 3' },
  ]);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const data = await fetchGalleryEvents();
    setEvents(data);
    setLoading(false);
  }

  function startCreate() {
    setEditingEvent({});
    setName('');
    setUpcoming(false);
    setPhotos([
      { image: '', caption: 'Photo 1' },
      { image: '', caption: 'Photo 2' },
      { image: '', caption: 'Photo 3' },
    ]);
  }

  function startEdit(ev: DbGalleryEvent) {
    setEditingEvent(ev);
    setName(ev.name);
    setUpcoming(Boolean(ev.upcoming));

    const existingPhotos: GalleryPhoto[] = Array.isArray(ev.photos) ? [...ev.photos] : [];
    while (existingPhotos.length < 3) {
      existingPhotos.push({ image: '', caption: `Photo ${existingPhotos.length + 1}` });
    }
    setPhotos(existingPhotos.slice(0, 3));
  }

  function updatePhoto(index: number, changes: Partial<GalleryPhoto>) {
    setPhotos(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...changes };
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter an event name.');
      return;
    }

    setSubmitting(true);
    try {
      await saveGalleryEvent({
        id: editingEvent?.id,
        name: name.trim(),
        upcoming,
        photos: upcoming ? [] : photos.filter(p => p.image.trim().length > 0),
      });

      onNotify(editingEvent?.id ? 'Gallery event updated!' : 'Gallery event added!');
      setEditingEvent(null);
      await loadEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to save gallery event.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this gallery event?')) return;
    try {
      await deleteGalleryEvent(id);
      onNotify('Gallery event deleted.');
      await loadEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to delete gallery event.');
    }
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">GALLERY EVENTS</h2>
          <p className="admin-section-subtitle">
            Manage events with 3 spotlight images displayed in the interactive showcase.
          </p>
        </div>
        <button className="btn-silver" onClick={startCreate}>
          + Add Event
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8b929e' }}>Loading gallery events...</div>
      ) : events.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: '#8b929e', marginBottom: '16px' }}>No events in gallery yet.</p>
          <button className="btn-silver" onClick={startCreate}>Add First Event</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.map(ev => (
            <div key={ev.id} className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{ev.name}</h3>
                  {ev.upcoming ? (
                    <span className="badge-status badge-draft">Upcoming</span>
                  ) : (
                    <span className="badge-status badge-published">{ev.photos?.length || 0} Photos</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-ghost" onClick={() => startEdit(ev)}>Edit Event</button>
                  <button className="btn-danger" onClick={() => handleDelete(ev.id)}>Delete</button>
                </div>
              </div>

              {!ev.upcoming && ev.photos && ev.photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {ev.photos.map((p, i) => (
                    <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', background: '#0c0d10', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <img
                        src={p.image.startsWith('http') || p.image.startsWith('/') ? p.image : `/assets/events/${p.image}`}
                        alt={p.caption}
                        style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '8px', fontSize: '0.78rem', color: '#aeb4bd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.caption || `Photo ${i + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {editingEvent && (
        <div className="modal-overlay" onClick={() => setEditingEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>
                {editingEvent.id ? 'Edit Gallery Event' : 'Add Gallery Event'}
              </h3>
              <button className="btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setEditingEvent(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Event Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Eureka 2026"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cfd4dc', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={upcoming}
                    onChange={e => setUpcoming(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#e2e5e9' }}
                  />
                  <span>Mark as &quot;Upcoming&quot; event (placeholder state without photos)</span>
                </label>
              </div>

              {!upcoming && (
                <div>
                  <h4 style={{ margin: '20px 0 12px', color: '#e2e5e9', fontSize: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                    Three Event Images
                  </h4>

                  {[0, 1, 2].map(idx => (
                    <div key={idx} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontWeight: 600, color: '#aeb4bd', marginBottom: '10px', fontSize: '0.82rem' }}>
                        IMAGE #{idx + 1}
                      </div>

                      <ImageUploadField
                        label={`Photo ${idx + 1} Image`}
                        currentUrl={photos[idx]?.image ? (photos[idx].image.startsWith('http') || photos[idx].image.startsWith('/') ? photos[idx].image : `/assets/events/${photos[idx].image}`) : ''}
                        folder="gallery"
                        onUploaded={url => updatePhoto(idx, { image: url })}
                        hint={`Upload photo #${idx + 1}`}
                      />

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Photo Caption</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={`Caption for photo ${idx + 1}`}
                          value={photos[idx]?.caption || ''}
                          onChange={e => updatePhoto(idx, { caption: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-ghost" onClick={() => setEditingEvent(null)}>Cancel</button>
                <button type="submit" className="btn-silver" disabled={submitting}>
                  {submitting ? 'Saving...' : editingEvent.id ? 'Save Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
