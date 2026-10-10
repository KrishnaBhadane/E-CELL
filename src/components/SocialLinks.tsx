import { useEffect, useState } from 'react';
import { fetchSiteSettings, type DbSiteSettings } from '@/lib/supabase';

const profiles = [
  { name: 'Instagram', key: 'instagram' as const, path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M17.5 6.5h.01' },
  { name: 'LinkedIn', key: 'linkedin' as const, path: 'M4 9v12M4 3v.01M10 21V9m0 5a5 5 0 0 1 10 0v7' },
  { name: 'X', key: 'x' as const, path: 'M3 3l18 18h-5L3 3h5l13 18M21 3 3 21' },
];

export default function SocialLinks() {
  const [settings, setSettings] = useState<DbSiteSettings | null>(null);

  useEffect(() => {
    fetchSiteSettings().then(data => {
      if (data) setSettings(data);
    });
  }, []);

  return (
    <div className="social-links glass-control nav-glass" aria-label="Social profiles">
      {profiles.map(profile => {
        const url = settings?.[profile.key];
        const hasUrl = Boolean(url && url.trim().length > 0);

        if (hasUrl) {
          return (
            <a
              key={profile.name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label={`${profile.name} — E-Cell RCPIT`}
              title={`${profile.name} — E-Cell RCPIT`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={profile.path} />
              </svg>
            </a>
          );
        }

        return (
          <span
            key={profile.name}
            className="social-icon"
            role="img"
            aria-label={`${profile.name} — profile link coming soon`}
            title={`${profile.name} — profile link coming soon`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={profile.path} />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
