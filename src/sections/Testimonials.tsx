import { useEffect, useRef, useState } from 'react';
import { testimonials as defaultTestimonials } from '@/data/testimonials';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fetchTestimonials, type DbTestimonial } from '@/lib/supabase';
import '@/styles/testimonials.css';

interface TestimonialItem {
  name: string;
  initials: string;
  role: string;
  quote: string;
  image?: string;
}

export default function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const [items, setItems] = useState<TestimonialItem[]>(defaultTestimonials);
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const reduced = useReducedMotion();

  useEffect(() => {
    fetchTestimonials().then(data => {
      if (data.length > 0) {
        setItems(
          data.map((item: DbTestimonial) => ({
            name: item.name,
            initials: item.initials || item.name.substring(0, 2).toUpperCase(),
            role: item.role,
            quote: item.quote,
            image: item.image,
          }))
        );
      }
    });
  }, []);

  const move = (direction: number) => {
    if (items.length === 0) return;
    setSelected(current => (current + direction + items.length) % items.length);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    if (root.current) observer.observe(root.current);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  useEffect(() => {
    if (!visible || paused || hovered || focused || hidden || reduced || items.length <= 1) return;
    const timer = setTimeout(() => move(1), 5000);
    return () => clearTimeout(timer);
  }, [selected, visible, paused, hovered, focused, hidden, reduced, items.length]);

  return (
    <section
      ref={root}
      className="testimonials"
      id="testimonials"
      aria-labelledby="testimonial-title"
      data-nav-tone="light"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <h2 id="testimonial-title">TESTIMONIALS</h2>
      <div className="testimonial-frame" role="region" aria-roledescription="carousel" aria-label="Student testimonials">
        <div className="testimonial-track" style={{ transform: `translateX(-${selected * 100}%)` }}>
          {items.map((item, index) => (
            <figure className="testimonial-story" key={item.name + index} aria-hidden={selected !== index} inert={selected !== index}>
              <div className="testimonial-copy">
                <span className="testimonial-demo">COMMUNITY VOICE</span>
                <blockquote>“{item.quote}”</blockquote>
              </div>
              <figcaption className="testimonial-person">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="testimonial-avatar"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="testimonial-avatar" aria-label="Portrait placeholder">
                    {item.initials}
                  </div>
                )}
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="testimonial-controls">
        <button className="glass-control glass-button" aria-label="Previous testimonial" onClick={() => move(-1)}>
          ‹
        </button>
        <span>
          {items.length > 0 ? selected + 1 : 0} / {items.length}
        </span>
        <button className="glass-control glass-button" aria-label="Next testimonial" onClick={() => move(1)}>
          ›
        </button>
        {!reduced && (
          <button
            className="testimonial-pause"
            onClick={() => setPaused(value => !value)}
            aria-label={paused ? 'Play testimonials' : 'Pause testimonials'}
          >
            {paused ? 'Play' : 'Pause'}
          </button>
        )}
      </div>
    </section>
  );
}
