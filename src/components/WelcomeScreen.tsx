import { useEffect, useState } from 'react';

/** The page mounts underneath so fonts and artwork load during the introduction. */
export default function WelcomeScreen() {
  const [phase, setPhase] = useState<'visible' | 'leaving' | 'done'>('visible');
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let fade: ReturnType<typeof setTimeout>;
    let disposed = false;
    const timer = setTimeout(() => {
      if (!disposed) {
        setPhase('leaving');
        fade = setTimeout(() => setPhase('done'), reduced ? 0 : 250);
      }
    }, reduced ? 0 : 900);
    return () => { disposed = true; clearTimeout(timer); clearTimeout(fade); };
  }, []);
  if (phase === 'done') return null;
  return (
    <div className={`welcome-screen ${phase}`} role="status" aria-label="Welcome to E-Cell RCPIT">
      <span>WELCOME TO</span>
      <strong>E-CELL RCPIT</strong>
      <svg className="welcome-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" /><circle className="welcome-progress" cx="24" cy="24" r="20" pathLength="1" /></svg>
      <button type="button" onClick={() => setPhase('done')}>Enter site</button>
    </div>
  );
}
