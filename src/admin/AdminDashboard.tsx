import { useState, useEffect } from 'react';
import { supabase, logoutUser, getCurrentUser } from '@/lib/supabase';
import ClubLogo from '@/components/ClubLogo';
import AdminLogin from './AdminLogin';
import ManageBlogs from './ManageBlogs';
import ManageMembers from './ManageMembers';
import ManageGallery from './ManageGallery';
import ManageTestimonials from './ManageTestimonials';
import ManageLeadership from './ManageLeadership';
import ManageSocialLinks from './ManageSocialLinks';
import '@/styles/admin.css';

type AdminTab = 'blogs' | 'members' | 'gallery' | 'testimonials' | 'leadership' | 'socials';

export default function AdminDashboard() {
  const [sessionUser, setSessionUser] = useState<{ email?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('blogs');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ? { email: session.user.email } : null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const user = await getCurrentUser();
      setSessionUser(user ? { email: user.email } : null);
    } catch {
      setSessionUser(null);
    } finally {
      setCheckingAuth(false);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  async function handleLogout() {
    await logoutUser();
    setSessionUser(null);
  }

  if (checkingAuth) {
    return (
      <div className="admin-login-wrap" style={{ color: '#aeb4bd' }}>
        <p>Loading Admin Portal...</p>
      </div>
    );
  }

  if (!sessionUser) {
    return <AdminLogin onLoginSuccess={checkUser} />;
  }

  return (
    <div className="admin-body">
      <div className="admin-layout">
        {/* TOP NAVBAR */}
        <header className="admin-nav">
          <a href="/" className="admin-brand">
            <ClubLogo />
            <div>
              <span className="admin-brand-title">E-CELL RCPIT</span>
              <span className="admin-badge" style={{ marginLeft: '10px' }}>ADMIN</span>
            </div>
          </a>

          <div className="admin-nav-actions">
            <div className="admin-user-pill">
              <span className="admin-user-dot"></span>
              <span>{sessionUser.email || 'Admin'}</span>
            </div>

            <a href="/" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
              View Website ↗
            </a>

            <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </header>

        {/* TABS SUB-NAVBAR */}
        <nav className="admin-tabs-bar" aria-label="Admin Navigation Tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            <span>📝</span> Blogs
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <span>👥</span> Members
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <span>🖼️</span> Gallery
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`}
            onClick={() => setActiveTab('testimonials')}
          >
            <span>💬</span> Testimonials
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'leadership' ? 'active' : ''}`}
            onClick={() => setActiveTab('leadership')}
          >
            <span>👑</span> Leadership
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'socials' ? 'active' : ''}`}
            onClick={() => setActiveTab('socials')}
          >
            <span>🌐</span> Social Links
          </button>
        </nav>

        {/* MAIN BODY CONTENT */}
        <main className="admin-container">
          {activeTab === 'blogs' && <ManageBlogs onNotify={showToast} />}
          {activeTab === 'members' && <ManageMembers onNotify={showToast} />}
          {activeTab === 'gallery' && <ManageGallery onNotify={showToast} />}
          {activeTab === 'testimonials' && <ManageTestimonials onNotify={showToast} />}
          {activeTab === 'leadership' && <ManageLeadership onNotify={showToast} />}
          {activeTab === 'socials' && <ManageSocialLinks onNotify={showToast} />}
        </main>

        {/* TOAST NOTIFICATION */}
        {toast && (
          <div className="admin-toast">
            <span style={{ color: '#34d399' }}>✓</span>
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
