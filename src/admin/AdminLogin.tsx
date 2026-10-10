import { useState, type FormEvent } from 'react';
import { loginWithEmail } from '@/lib/supabase';
import ClubLogo from '@/components/ClubLogo';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your admin credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await loginWithEmail(email, password);
      if (authError) {
        setError(authError.message || 'Invalid admin credentials.');
      } else if (data.session) {
        onLoginSuccess();
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your network connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div style={{ display: 'inline-block', marginBottom: '8px' }}>
            <ClubLogo />
          </div>
          <h1 className="admin-login-title">ADMIN PORTAL</h1>
          <p className="admin-login-subtitle">
            Restricted access. Sign in with your approved admin credentials.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 14px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Admin Email / ID</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. admin1@ecell.example"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            <div className="form-hint">Internal email-shaped ID (e.g. admin1@ecell.example)</div>
          </div>

          <div className="form-group" style={{ marginBottom: '26px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-silver"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <a href="/" style={{ color: '#8b929e', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = '#8b929e')}>
            ← Return to public website
          </a>
        </div>
      </div>
    </div>
  );
}
