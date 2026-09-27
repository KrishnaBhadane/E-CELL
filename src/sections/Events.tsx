const events = [
  { title: 'Eureka 2026', image: '/assets/events/gallery-01.jpg', fit: 'contain' },
  { title: 'The Eureka team', image: '/assets/events/gallery-02.jpg' },
  { title: 'DevSpark', image: '/assets/events/gallery-03.jpg' },
  { title: 'Eureka — together', image: '/assets/events/gallery-09.jpg' },
];

export default function Events() {
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const element = rail.current;
    if (!element || reduced || paused) return;
    let visible = false;
    let resumeAt = 0;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(element);
    const postpone = () => { resumeAt = Date.now() + 6000; };
    element.addEventListener('pointerdown', postpone);
    element.addEventListener('wheel', postpone, { passive: true });
    const timer = window.setInterval(() => {
      if (!visible || document.hidden || element.matches(':hover, :focus-within') || Date.now() < resumeAt) return;
      const step = (element.children[1] as HTMLElement).offsetLeft - (element.children[0] as HTMLElement).offsetLeft;
      const current = Math.round(element.scrollLeft / step);
      if (current >= events.length) element.scrollLeft -= events.length * step;
      element.scrollTo({ left: ((current % events.length) + 1) * step, behavior: 'smooth' });
    }, 3500);
    return () => { clearInterval(timer); observer.disconnect(); element.removeEventListener('pointerdown', postpone); element.removeEventListener('wheel', postpone); };
  }, [paused, reduced]);
  return (
    <section id="events" className="events" aria-labelledby="events-title" data-nav-tone="light">
      <div className="events-heading">
        <h2 id="events-title">Our Initiatives</h2>
        {!reduced && <button className="glass-control glass-button" type="button" onClick={() => setPaused(value => !value)}>{paused ? 'Play slideshow' : 'Pause slideshow'}</button>}
      </div>
      <div ref={rail} className="events-gallery" role="region" aria-label="Our events" tabIndex={0}>
        {(reduced ? events : [...events, ...events]).map((event, index) => (
          <figure className="event-card" key={`${event.title}-${index}`} aria-hidden={index >= events.length ? true : undefined}>
            <img src={event.image} alt={event.title} loading="lazy" decoding="async" style={{ objectFit: event.fit === 'contain' ? 'contain' : 'cover' }} />
            <figcaption>{event.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
