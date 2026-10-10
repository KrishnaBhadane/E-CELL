import { useEffect, useState } from 'react';
import ClubLogo from './ClubLogo';
export default function WelcomeScreen() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setLoading(false), 1000); return () => clearTimeout(timer); }, []);
  return loading ? <div className="welcome-screen" role="status" aria-label="Loading page"><div className="welcome-loading"><ClubLogo /><span className="welcome-spinner" aria-hidden="true" /><span>Loading…</span></div></div> : null;
}
