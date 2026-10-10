import { useState, useEffect } from 'react';
import { fetchMembers, saveMember, deleteMember, type DbMember } from '@/lib/supabase';
import ImageUploadField from './ImageUploadField';

interface ManageMembersProps {
  onNotify: (msg: string) => void;
}

const domainsList = ['Design', 'Events', 'Technology', 'Marketing', 'Operations', 'Outreach'];

export default function ManageMembers({ onNotify }: ManageMembersProps) {
  const [members, setMembers] = useState<DbMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Partial<DbMember> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [domain, setDomain] = useState(domainsList[0]);
  const [image, setImage] = useState('/assets/members/portrait-placeholder.svg');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    const data = await fetchMembers();
    setMembers(data);
    setLoading(false);
  }

  function startCreate() {
    setEditingMember({});
    setName('');
    setDomain(domainsList[0]);
    setImage('/assets/members/portrait-placeholder.svg');
    setGithub('');
    setLinkedin('');
  }

  function startEdit(m: DbMember) {
    setEditingMember(m);
    setName(m.name);
    setDomain(m.domain);
    setImage(m.image || '/assets/members/portrait-placeholder.svg');
    setGithub(m.github || '');
    setLinkedin(m.linkedin || '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter member name.');
      return;
    }

    setSubmitting(true);
    try {
      await saveMember({
        id: editingMember?.id,
        name: name.trim(),
        domain: domain.trim(),
        image: image.trim() || '/assets/members/portrait-placeholder.svg',
        github: github.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
      });

      onNotify(editingMember?.id ? 'Member updated!' : 'New member added!');
      setEditingMember(null);
      await loadMembers();
    } catch (err) {
      console.error(err);
      alert('Failed to save member.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await deleteMember(id);
      onNotify('Member removed.');
      await loadMembers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete member.');
    }
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">TEAM MEMBERS</h2>
          <p className="admin-section-subtitle">
            Manage student members displayed on the public /members.html directory.
          </p>
        </div>
        <button className="btn-silver" onClick={startCreate}>
          + Add Member
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8b929e' }}>Loading team members...</div>
      ) : members.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: '#8b929e', marginBottom: '16px' }}>No members saved in database yet.</p>
          <button className="btn-silver" onClick={startCreate}>Add First Member</button>
        </div>
      ) : (
        <div className="admin-grid-3">
          {members.map(m => (
            <div key={m.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={m.image}
                  alt={m.name}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', background: '#1c1f26', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{m.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#aeb4bd', display: 'inline-block', marginTop: '2px' }}>
                    {m.domain}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: '#79818e' }}>
                {m.github && <span>• GitHub linked</span>}
                {m.linkedin && <span>• LinkedIn linked</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => startEdit(m)}>Edit</button>
                <button className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleDelete(m.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {editingMember && (
        <div className="modal-overlay" onClick={() => setEditingMember(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>
                {editingMember.id ? 'Edit Member' : 'Add New Member'}
              </h3>
              <button className="btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setEditingMember(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sanji"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role / Domain</label>
                <input
                  type="text"
                  className="form-input"
                  list="domain-options"
                  placeholder="e.g. Technology, Design, Outreach..."
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  required
                />
                <datalist id="domain-options">
                  {domainsList.map(d => <option key={d} value={d} />)}
                </datalist>
              </div>

              <ImageUploadField
                label="Member Portrait (Instagram-style Round Photo)"
                currentUrl={image}
                folder="members"
                onUploaded={url => setImage(url)}
                hint="Upload portrait photo. Preview and live site will display as a round Instagram profile picture."
                isAvatar={true}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">GitHub URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://github.com/username"
                    value={github}
                    onChange={e => setGithub(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={e => setLinkedin(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-ghost" onClick={() => setEditingMember(null)}>Cancel</button>
                <button type="submit" className="btn-silver" disabled={submitting}>
                  {submitting ? 'Saving...' : editingMember.id ? 'Save Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
