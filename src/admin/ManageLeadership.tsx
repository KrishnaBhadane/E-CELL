import { useState, useEffect } from 'react';
import { fetchLeadership, saveLeadershipSlot } from '@/lib/supabase';
import ImageUploadField from './ImageUploadField';

interface ManageLeadershipProps {
  onNotify: (msg: string) => void;
}

export default function ManageLeadership({ onNotify }: ManageLeadershipProps) {
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState<'head' | 'co_head' | null>(null);

  // Slot: Head
  const [headName, setHeadName] = useState('');
  const [headRole, setHeadRole] = useState('Head');
  const [headImage, setHeadImage] = useState('/assets/members/portrait-placeholder.svg');
  const [headGithub, setHeadGithub] = useState('');
  const [headLinkedin, setHeadLinkedin] = useState('');

  // Slot: Co-Head
  const [coName, setCoName] = useState('');
  const [coRole, setCoRole] = useState('Co-head');
  const [coImage, setCoImage] = useState('/assets/members/portrait-placeholder.svg');
  const [coGithub, setCoGithub] = useState('');
  const [coLinkedin, setCoLinkedin] = useState('');

  useEffect(() => {
    loadLeadership();
  }, []);

  async function loadLeadership() {
    setLoading(true);
    const data = await fetchLeadership();

    if (data.head) {
      setHeadName(data.head.name);
      setHeadRole(data.head.role || 'Head');
      setHeadImage(data.head.image || '/assets/members/portrait-placeholder.svg');
      setHeadGithub(data.head.github || '');
      setHeadLinkedin(data.head.linkedin || '');
    } else {
      setHeadName('Luffy');
    }

    if (data.co_head) {
      setCoName(data.co_head.name);
      setCoRole(data.co_head.role || 'Co-head');
      setCoImage(data.co_head.image || '/assets/members/portrait-placeholder.svg');
      setCoGithub(data.co_head.github || '');
      setCoLinkedin(data.co_head.linkedin || '');
    } else {
      setCoName('Zoro');
    }

    setLoading(false);
  }

  async function saveSlot(slot: 'head' | 'co_head') {
    setSavingSlot(slot);
    try {
      if (slot === 'head') {
        await saveLeadershipSlot('head', {
          name: headName.trim(),
          role: headRole.trim() || 'Head',
          image: headImage,
          github: headGithub.trim() || undefined,
          linkedin: headLinkedin.trim() || undefined,
        });
        onNotify('Head details updated!');
      } else {
        await saveLeadershipSlot('co_head', {
          name: coName.trim(),
          role: coRole.trim() || 'Co-head',
          image: coImage,
          github: coGithub.trim() || undefined,
          linkedin: coLinkedin.trim() || undefined,
        });
        onNotify('Co-head details updated!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save leadership slot.');
    } finally {
      setSavingSlot(null);
    }
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#8b929e' }}>Loading leadership slots...</div>;
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">LEADERSHIP SLOTS</h2>
          <p className="admin-section-subtitle">
            Two fixed primary leadership cards (Head and Co-head) featured prominently on the homepage and team roster.
          </p>
        </div>
      </div>

      <div className="admin-grid-2">
        {/* HEAD CARD */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="admin-badge" style={{ borderColor: '#ffffff', color: '#ffffff' }}>SLOT 1</span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Cell Head</h3>
            </div>
            <button
              className="btn-silver"
              onClick={() => saveSlot('head')}
              disabled={savingSlot === 'head'}
            >
              {savingSlot === 'head' ? 'Saving...' : 'Save Head'}
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={headName}
              onChange={e => setHeadName(e.target.value)}
              placeholder="e.g. Luffy"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Title</label>
            <input
              type="text"
              className="form-input"
              value={headRole}
              onChange={e => setHeadRole(e.target.value)}
              placeholder="Head"
            />
          </div>

          <ImageUploadField
            label="Head Portrait Photo (Instagram-style Round Photo)"
            currentUrl={headImage}
            folder="leadership"
            onUploaded={url => setHeadImage(url)}
            hint="Upload head's portrait image (sets as round Instagram avatar)"
            isAvatar={true}
          />

          <div className="form-group">
            <label className="form-label">LinkedIn URL</label>
            <input
              type="url"
              className="form-input"
              value={headLinkedin}
              onChange={e => setHeadLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">GitHub URL</label>
            <input
              type="url"
              className="form-input"
              value={headGithub}
              onChange={e => setHeadGithub(e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
        </div>

        {/* CO-HEAD CARD */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="admin-badge" style={{ borderColor: '#aeb4bd', color: '#aeb4bd' }}>SLOT 2</span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Cell Co-head</h3>
            </div>
            <button
              className="btn-silver"
              onClick={() => saveSlot('co_head')}
              disabled={savingSlot === 'co_head'}
            >
              {savingSlot === 'co_head' ? 'Saving...' : 'Save Co-head'}
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={coName}
              onChange={e => setCoName(e.target.value)}
              placeholder="e.g. Zoro"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Title</label>
            <input
              type="text"
              className="form-input"
              value={coRole}
              onChange={e => setCoRole(e.target.value)}
              placeholder="Co-head"
            />
          </div>

          <ImageUploadField
            label="Co-head Portrait Photo (Instagram-style Round Photo)"
            currentUrl={coImage}
            folder="leadership"
            onUploaded={url => setCoImage(url)}
            hint="Upload co-head's portrait image (sets as round Instagram avatar)"
            isAvatar={true}
          />

          <div className="form-group">
            <label className="form-label">LinkedIn URL</label>
            <input
              type="url"
              className="form-input"
              value={coLinkedin}
              onChange={e => setCoLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">GitHub URL</label>
            <input
              type="url"
              className="form-input"
              value={coGithub}
              onChange={e => setCoGithub(e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
