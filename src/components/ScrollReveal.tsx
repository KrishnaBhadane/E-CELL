import { useEffect, useRef, type ReactNode } from 'react';

export default function ScrollReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const nodes = root.current?.querySelectorAll('h2, h3, p:not([data-scroll-word-line]), figcaption, blockquote');
    if (!nodes || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('text-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: .15 });
    nodes.forEach(node => { node.classList.add('text-reveal'); observer.observe(node); });
    return () => { observer.disconnect(); nodes.forEach(node => node.classList.remove('text-reveal')); };
  }, []);
  return <div ref={root}>{children}</div>;
}
