import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const photos = [
  { image: 'gallery-02.jpg', caption: 'The Eureka team' },
  { image: 'gallery-03.jpg', caption: 'DevSpark, together' },
  { image: 'gallery-09.jpg', caption: 'People behind the ideas' },
];
const groups = [photos, [photos[2], photos[0], photos[1]]];

export default function Gallery() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const stage = section.querySelector<HTMLElement>('.gallery-stage')!;
    const batches = section.querySelectorAll<HTMLElement>('.gallery-batch');
    let frame = 0;
    const draw = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      const height = stage.clientHeight;
      const progress = Math.max(0, Math.min(1, -bounds.top / (bounds.height - height)));
      batches.forEach((batch, i) => {
        batch.style.transform = `translateY(${(i - progress) * height}px)`;
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
    <div className="gallery-photos">{groups.map((group, index) => <div className="gallery-batch" key={index}>{group.map(photo => <figure key={photo.image}>
      <img src={`/assets/events/${photo.image}`} alt={photo.caption} loading="lazy" decoding="async" width="1200" height="675" />
      <figcaption>{photo.caption}</figcaption>
    </figure>)}</div>)}</div>
    </div>
  </section>;
}
