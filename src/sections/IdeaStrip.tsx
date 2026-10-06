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
    const track = section.querySelector<HTMLElement>('.idea-reveal-track')!;
    const stage = section.querySelector<HTMLElement>('.idea-lines')!;
    let frame = 0;
    let distance = 0;
    let offset = 0;
    function measure() {
      const pinned = !reduced && innerHeight >= 560;
      section.dataset.pinned = String(pinned);
      offset = parseFloat(getComputedStyle(stage).top) || 0;
      distance = pinned ? innerHeight * .85 : 0;
      track.style.height = pinned ? `${stage.offsetHeight + distance}px` : '';
      schedule();
    }
    function update() {
      frame = 0;
      const progress = distance ? Math.max(0, Math.min(1, (offset - track.getBoundingClientRect().top) / (distance * .9))) : 1;
      words.forEach((word, index) => word.classList.toggle('word-lit', index < Math.floor(progress * words.length)));
      section.dataset.revealProgress = progress.toFixed(3);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    const observer = new IntersectionObserver(([entry]) => {
      section.classList.toggle('strip-visible', entry.isIntersecting);
      if (entry.isIntersecting) { window.addEventListener('scroll', schedule, { passive: true }); schedule(); }
      else window.removeEventListener('scroll', schedule);
    });
    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    observer.observe(section); window.addEventListener('resize', measure); measure();
    return () => { observer.disconnect(); resize.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure); };
  }, [reduced]);
  return <section ref={root} className="idea-strip" id="ideas" data-nav-tone="light" aria-label="Create together">
    <div className="crossed-strips" aria-hidden="true">{[0, 1].map(index => <div className={`idea-band band-${index}`} key={index}><div>{[0, 1].map(copy => <span key={copy}>{strip.repeat(5)}</span>)}</div></div>)}</div>
    <div className="idea-reveal-track"><div className="idea-lines">{lines.map(line => <p key={line} data-scroll-word-line aria-label={line}>{line.split(' ').map((word, index) => <span key={index} data-word aria-hidden="true">{word} </span>)}</p>)}</div></div>
  </section>;
}
