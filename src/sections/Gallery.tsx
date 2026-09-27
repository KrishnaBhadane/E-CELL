const photos = [
  { image: 'gallery-02.jpg', caption: 'The Eureka team' },
  { image: 'gallery-03.jpg', caption: 'DevSpark, together' },
  { image: 'gallery-09.jpg', caption: 'People behind the ideas' },
];

export default function Gallery() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const stage = section.querySelector<HTMLElement>('.gallery-stage')!;
    const cards = section.querySelectorAll<HTMLElement>('figure');
    let frame = 0;
    const draw = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      const height = stage.clientHeight;
      const progress = Math.max(0, Math.min(1, -bounds.top / (bounds.height - height)));
      cards.forEach((card, i) => {
        card.style.transform = `translateY(${(1.05 + i * 1.15 - progress * (photos.length * 1.15 + 1.2)) * height}px)`;
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(([entry]) => {
      section.classList.toggle('space-active', entry.isIntersecting);
      if (entry.isIntersecting) { window.addEventListener('scroll', schedule, { passive: true }); schedule(); }
      else window.removeEventListener('scroll', schedule);
    });
    observer.observe(section);
    window.addEventListener('resize', schedule);
    draw();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [reduced]);
  return <section ref={root} id="gallery" className={`space-gallery${reduced ? ' gallery-static' : ''}`} data-nav-tone="dark" aria-labelledby="gallery-title">
    <div className="gallery-stage">
    <div className="space-drift" aria-hidden="true" />
    <div className="gallery-orbit" aria-hidden="true" />
    <h2 id="gallery-title">GALLERY</h2>
    <div className="gallery-photos">{photos.map(photo => <figure key={photo.image}>
      <img src={`/assets/events/${photo.image}`} alt={photo.caption} loading="lazy" decoding="async" width="1200" height="675" />
      <figcaption>{photo.caption}</figcaption>
    </figure>)}</div>
    </div>
  </section>;
}
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
