import { useEffect, useRef, useState } from 'react';
import { testimonials } from '@/data/testimonials';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import '@/styles/testimonials.css';

export default function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const reduced = useReducedMotion();
  const move = (direction: number) => setSelected(current => (current + direction + testimonials.length) % testimonials.length);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .2 });
    observer.observe(root.current!);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (!visible || paused || hovered || focused || hidden || reduced) return;
    const timer = setTimeout(() => move(1), 5000);
    return () => clearTimeout(timer);
  }, [selected, visible, paused, hovered, focused, hidden, reduced]);
  return <section ref={root} className="testimonials" id="testimonials" aria-labelledby="testimonial-title" data-nav-tone="light"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <h2 id="testimonial-title">TESTIMONIALS</h2>
    <div className="testimonial-frame" role="region" aria-roledescription="carousel" aria-label="Student testimonials">
      <div className="testimonial-track" style={{ transform: `translateX(-${selected * 100}%)` }}>
        {testimonials.map((item, index) => <figure className="testimonial-story" key={item.name} aria-hidden={selected !== index} inert={selected !== index}>
          <div className="testimonial-copy"><span className="testimonial-demo">DEMO TESTIMONIAL</span><blockquote>“{item.quote}”</blockquote></div>
          <figcaption className="testimonial-person"><div className="testimonial-avatar" aria-label="Placeholder portrait">{item.initials}</div><strong>{item.name}</strong><span>{item.role}</span></figcaption>
        </figure>)}
      </div>
    </div>
    <div className="testimonial-controls">
      <button className="glass-control glass-button" aria-label="Previous testimonial" onClick={() => move(-1)}>‹</button>
      <span>{selected + 1} / {testimonials.length}</span>
      <button className="glass-control glass-button" aria-label="Next testimonial" onClick={() => move(1)}>›</button>
      {!reduced && <button className="testimonial-pause" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Play testimonials' : 'Pause testimonials'}>{paused ? 'Play' : 'Pause'}</button>}
    </div>
  </section>;
}
