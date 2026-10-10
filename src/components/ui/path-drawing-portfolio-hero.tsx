import { useId } from 'react';

/** Adapted from the supplied SVG outline-text design. CSS draws once, avoiding
 * repeated canvas measurements and a permanent JavaScript animation loop. */
export default function PathDrawingPortfolioHero({ brand, colors = ['var(--brand-light-50)', 'var(--brand-light-80)'], label = 'UPCOMING EVENT', status = 'COMING SOON · E-CELL RCPIT' }: { brand: string; colors?: [string, string]; label?: string; status?: string }) {
  const id = useId().replace(/:/g, '');
  return <div className="event-reveal" data-path-drawing-hero>
    <p>{label}</p>
    <svg viewBox="0 0 840 170" role="img" aria-label={brand}>
      <defs><linearGradient id={id}><stop stopColor={colors[0]} /><stop offset="1" stopColor={colors[1]} /></linearGradient></defs>
      <text x="420" y="125" textAnchor="middle" textLength="780" lengthAdjust="spacingAndGlyphs" fill={`url(#${id})`} stroke={`url(#${id})`} strokeWidth="1.8" className="event-outline">{brand}</text>
    </svg>
    <p className="event-coming">{status}</p>
  </div>;
}
