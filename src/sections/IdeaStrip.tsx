import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import '@/styles/idea-strip.css';

const lines = ['Start with an idea. Build it together.', 'Take the first step. Make a real difference.'];
const strip = 'CREATE · CONNECT · BUILD · BEGIN · ';

export default function IdeaStrip() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const section = root.current!;
    const words = Array.from(section.querySelectorAll<HTMLElement>('[data-word]'));
    let frame = 0;
    function update() {
      frame = 0;
      const bounds = section.querySelector('.idea-lines')!.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight * .85 - bounds.top) / (innerHeight * .55)));
      words.forEach((word, index) => word.classList.toggle('word-lit', reduced || index < Math.ceil(progress * words.length)));
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    const observer = new IntersectionObserver(([entry]) => {
      section.classList.toggle('strip-visible', entry.isIntersecting);
      if (entry.isIntersecting) { window.addEventListener('scroll', schedule, { passive: true }); schedule(); }
      else window.removeEventListener('scroll', schedule);
    });
    observer.observe(section); window.addEventListener('resize', schedule); update();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [reduced]);
  return <section ref={root} className="idea-strip" id="ideas" data-nav-tone="light" aria-label="Create together">
    <div className="crossed-strips" aria-hidden="true">{[0, 1].map(index => <div className={`idea-band band-${index}`} key={index}><div>{[0, 1].map(copy => <span key={copy}>{strip.repeat(5)}</span>)}</div></div>)}</div>
    <div className="idea-lines">{lines.map(line => <p key={line} aria-label={line}>{line.split(' ').map((word, index) => <span key={index} data-word aria-hidden="true">{word} </span>)}</p>)}</div>
  </section>;
}
