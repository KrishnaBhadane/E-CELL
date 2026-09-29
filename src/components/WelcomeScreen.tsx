import { useEffect, useState } from 'react';
/** Keep the plain loader visible for two seconds while initial assets load. */
export default function WelcomeScreen() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let disposed = false;
    let minimumTimer: ReturnType<typeof setTimeout>;
    const minimum = new Promise<void>(resolve => { minimumTimer = setTimeout(resolve, 2000); });
    const finish = () => { if (!disposed) setLoading(false); };
    const ready = () => {
      const images = Array.from(document.images).filter(image => image.loading !== 'lazy');
      void Promise.allSettled([minimum, document.fonts.ready, ...images.map(image => image.decode())]).then(finish);
    };
    // A failed or stalled resource must not block the usable page indefinitely.
    const timeout = setTimeout(finish, 5000);
    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });
    return () => { disposed = true; clearTimeout(minimumTimer); clearTimeout(timeout); window.removeEventListener('load', ready); };
  }, []);
  if (!loading) return null;
  return <div className="welcome-screen" role="status" aria-label="Loading page">
    <div className="welcome-loading"><span className="welcome-spinner" aria-hidden="true" /><span>Loading…</span></div>
  </div>;
}
