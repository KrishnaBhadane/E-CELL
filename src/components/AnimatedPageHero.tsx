import type { CSSProperties } from 'react';

export default function AnimatedPageHero({ title = 'BLOG', id, href = '#blog-content', label = 'Explore the journal' }: { title?: string; id?: string; href?: string; label?: string }) {
  return <header className="blog-intro">
    <h1 id={id} aria-label={title}>{title.split('').map((letter, index) => <span className="blog-letter-mask" key={index} aria-hidden="true"><span style={{ '--letter': index } as CSSProperties}>{letter}</span></span>)}</h1>
    <div className="blog-hero-orbit" aria-hidden="true"><span /></div>
    <a className="glass-control glass-button blog-explore" href={href}>{label} <span aria-hidden="true">↘</span></a>
  </header>;
}
