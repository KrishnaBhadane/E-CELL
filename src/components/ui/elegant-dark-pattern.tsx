import type { ReactNode } from 'react';

/** Supplied dark gradient pattern, kept local and sized to its parent. */
export function DarkGradientBg({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`dark-gradient-bg ${className ?? ''}`}>
      <div className="dark-streaks" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <i key={i} style={{ left: `${i * 18 - 22}%`, opacity: .1 + i * .015 }} />)}</div>
      <div className="dark-dots" aria-hidden="true" />
      {children}
    </div>
  );
}
