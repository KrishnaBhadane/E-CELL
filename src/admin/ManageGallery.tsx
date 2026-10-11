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
    { image: '', caption: '' },
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
      { image: '', caption: '' },
    ]);
  }

  function startEdit(ev: DbGalleryEvent) {
    setEditingEvent(ev);
    setName(ev.name);
    setUpcoming(Boolean(ev.upcoming));

    const existingPhotos: GalleryPhoto[] = Array.isArray(ev.photos) && ev.photos.length > 0
      ? ev.photos.map(p => ({ image: p.image || '', caption: p.caption || '' }))
      : [{ image: '', caption: '' }];
    setPhotos(existingPhotos);
  }

  function addPhoto() {
    setPhotos(prev => [...prev, { image: '', caption: '' }]);
  }

  function removePhoto(index: number) {
    setPhotos(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [{ image: '', caption: '' }];
    });
  }

  function movePhoto(index: number, direction: 'up' | 'down') {
    setPhotos(prev => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
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
        photos: upcoming ? [] : photos.filter(p => p.image && p.image.trim().length > 0),
      });

      onNotify(editingEvent?.id ? 'Memory event updated!' : 'Memory event added!');
      setEditingEvent(null);
      await loadEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to save memory event.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event and its photos?')) return;
    try {
      await deleteGalleryEvent(id);
      onNotify('Event deleted from memories.');
      await loadEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to delete event.');
    }
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">MEMORIES & GALLERY</h2>
          <p className="admin-section-subtitle">
            Manage photo collections. Add as many photos as you want — they will swing on the interactive string carousel!
          </p>
        </div>
        <button className="btn-silver" onClick={startCreate}>
          + Add Event
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8b929e' }}>Loading memories...</div>
      ) : events.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: '#8b929e', marginBottom: '16px' }}>No events in memories yet.</p>
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
                  <button className="btn-ghost" onClick={() => startEdit(ev)}>Edit Event & Photos</button>
                  <button className="btn-danger" onClick={() => handleDelete(ev.id)}>Delete</button>
                </div>
              </div>

              {!ev.upcoming && ev.photos && ev.photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
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
          <div className="modal-content" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>
                {editingEvent.id ? 'Edit Memory Collection' : 'Add New Memory Collection'}
              </h3>
              <button className="btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setEditingEvent(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Event / Edition Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Eureka 2026, Illuminate Summit"
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                    <h4 style={{ margin: 0, color: '#e2e5e9', fontSize: '1rem' }}>
                      Event Photos ({photos.length})
                    </h4>
                    <button
                      type="button"
                      className="btn-silver"
                      style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                      onClick={addPhoto}
                    >
                      + Add Another Photo
                    </button>
                  </div>
                  <p style={{ color: '#8b929e', fontSize: '0.82rem', margin: '0 0 16px' }}>
                    You can add as many images as you want. Each image will appear as a swinging polaroid on the memories string.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '4px' }}>
                    {photos.map((p, idx) => (
                      <div key={idx} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 600, color: '#aeb4bd', fontSize: '0.82rem' }}>
                            PHOTO #{idx + 1}
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {idx > 0 && (
                              <button
                                type="button"
                                className="btn-ghost"
                                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                                onClick={() => movePhoto(idx, 'up')}
                                title="Move up"
                              >
                                ↑
                              </button>
                            )}
                            {idx < photos.length - 1 && (
                              <button
                                type="button"
                                className="btn-ghost"
                                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                                onClick={() => movePhoto(idx, 'down')}
                                title="Move down"
                              >
                                ↓
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-danger"
                              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                              onClick={() => removePhoto(idx)}
                              title="Delete photo"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>

                        <ImageUploadField
                          label={`Photo ${idx + 1} Image / URL`}
                          currentUrl={p.image ? (p.image.startsWith('http') || p.image.startsWith('/') ? p.image : `/assets/events/${p.image}`) : ''}
                          folder="gallery"
                          onUploaded={url => updatePhoto(idx, { image: url })}
                          hint={`Upload or paste image for photo #${idx + 1}`}
                        />

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Photo Caption / Title</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder={`e.g. Keynote stage, Team Eureka, Audience applause`}
                            value={p.caption || ''}
                            onChange={e => updatePhoto(idx, { caption: e.target.value })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ border: '1px dashed rgba(255,255,255,0.2)', width: '100%', padding: '10px' }}
                      onClick={addPhoto}
                    >
                      + Add Another Photo to this Event
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <button type="button" className="btn-ghost" onClick={() => setEditingEvent(null)}>Cancel</button>
                <button type="submit" className="btn-silver" disabled={submitting}>
                  {submitting ? 'Saving...' : editingEvent.id ? 'Save Event & Photos' : 'Add Event & Photos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
