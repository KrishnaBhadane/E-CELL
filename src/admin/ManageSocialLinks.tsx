import { useState, useEffect } from 'react';
import { fetchSiteSettings, saveSiteSettings } from '@/lib/supabase';

interface ManageSocialLinksProps {
  onNotify: (msg: string) => void;
}

export default function ManageSocialLinks({ onNotify }: ManageSocialLinksProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [x, setX] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const data = await fetchSiteSettings();
    if (data) {
      setInstagram(data.instagram || '');
      setLinkedin(data.linkedin || '');
      setX(data.x || '');
    }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSiteSettings({
        instagram: instagram.trim(),
        linkedin: linkedin.trim(),
        x: x.trim(),
      });
      onNotify('Social links updated everywhere on the site!');
    } catch (err) {
      console.error(err);
      alert('Failed to save social links.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#8b929e' }}>Loading social links...</div>;
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h2 className="admin-section-title">GLOBAL SOCIAL LINKS</h2>
          <p className="admin-section-subtitle">
            Configure social profile links (Instagram, LinkedIn, X). Changes automatically propagate everywhere they appear across the site.
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ maxWidth: '680px' }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              Instagram URL
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://instagram.com/ecell_rcpit"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              LinkedIn URL
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://linkedin.com/company/ecell-rcpit"
              value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
              </svg>
              X (formerly Twitter) URL
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://x.com/ecell_rcpit"
              value={x}
              onChange={e => setX(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="submit" className="btn-silver" disabled={saving}>
              {saving ? 'Saving...' : 'Save Social Links'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
