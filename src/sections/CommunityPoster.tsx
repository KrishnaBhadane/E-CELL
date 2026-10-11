import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import '@/styles/community-poster.css';

/** Scroll-driven reveal; completion is permanent for this mounted page. */
export default function CommunityPoster() {
  const containerRef = useRef<HTMLElement>(null);
  const gateWrapRef = useRef<HTMLDivElement>(null);
  const doorLeftRef = useRef<HTMLDivElement>(null);
  const doorRightRef = useRef<HTMLDivElement>(null);
  const laserLeftRef = useRef<HTMLDivElement>(null);
  const laserRightRef = useRef<HTMLDivElement>(null);

  const wordStay1Ref = useRef<HTMLSpanElement>(null);
  const wordHungryRef = useRef<HTMLSpanElement>(null);
  const wordStay2Ref = useRef<HTMLSpanElement>(null);
  const wordFoolishRef = useRef<HTMLSpanElement>(null);

  const authorRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const opened = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const words = [wordStay1Ref.current, wordHungryRef.current, wordStay2Ref.current, wordFoolishRef.current];
    const details = [authorRef.current, ctaRef.current];
    const doors = [doorLeftRef.current, doorRightRef.current];
    const lasers = [laserLeftRef.current, laserRightRef.current];
    const mobile = window.innerWidth <= 768;
    const start = mobile ? 0.10 : 0.08;
    const duration = mobile ? 0.24 : 0.20;
    const wordStart = mobile ? 0.12 : 0.10;
    const step = mobile ? 0.05 : 0.04;
    const finish = Math.max(start + duration, wordStart + step * 5);
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    let frame = 0;
    let visible = false;
    let dirty = true;
    let target = 0;
    let progress = 0;
    let lastTime = 0;
    let observer: IntersectionObserver | undefined;

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', visibilityChanged);
      container?.classList.remove('is-revealing');
    }

    function complete() {
      opened.current = true;
      if (gateWrapRef.current) gateWrapRef.current.style.display = 'none';
      [...words, ...details].forEach(element => {
        if (!element) return;
        element.classList.add('is-active');
        element.style.opacity = '1';
        element.style.transform = 'none';
      });
      stop();
    }

    function reveal(element: HTMLElement | null, amount: number, base: number, offset: number) {
      if (!element) return;
      element.style.opacity = (base + amount * (1 - base)).toFixed(3);
      element.style.transform = `translateY(${((1 - amount) * offset).toFixed(2)}px)`;
      if (amount >= 0.5 && !element.classList.contains('is-active')) element.classList.add('is-active');
    }

    function tick(time: number) {
      frame = 0;
      if (!visible || document.hidden || opened.current) return;
      // Read layout once per scheduled frame, before any style writes.
      if (dirty) {
        const rect = container!.getBoundingClientRect();
        target = Math.max(target, Math.min(finish, clamp((innerHeight - rect.top) / (innerHeight + rect.height))));
        dirty = false;
      }
      const delta = lastTime ? Math.min(time - lastTime, 64) : 16.67;
      lastTime = time;
      progress += (target - progress) * (1 - Math.exp(-delta / 70));
      if (Math.abs(target - progress) < 0.0003) progress = target;
      if (progress >= finish) { complete(); return; }

      const open = clamp((progress - start) / duration);
      doors.forEach((door, index) => {
        if (!door) return;
        door.style.transform = `translateX(${(index ? 1 : -1) * open * 105}%)`;
        door.style.opacity = Math.max(0, 1 - open ** 2.2 * 1.4).toFixed(3);
      });
      lasers.forEach(laser => { if (laser) laser.style.opacity = Math.max(0, 1 - open * 3.5).toFixed(3); });
      words.forEach((word, index) => reveal(word, clamp((progress - wordStart - step * index) / step), 0.2, 4));
      details.forEach((element, index) => reveal(element, clamp((progress - wordStart - step * 4) / step), 0.3, 6 + index * 2));
      if (progress !== target) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    }

    function schedule() {
      dirty = true;
      if (visible && !document.hidden && !opened.current && !frame) frame = requestAnimationFrame(tick);
    }

    function visibilityChanged() {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
      else schedule();
    }

    if (reduced || opened.current) { complete(); return; }
    observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      container.classList.toggle('is-revealing', visible);
      if (visible) schedule();
      else { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    }, { rootMargin: '120px 0px' });
    observer.observe(container);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', visibilityChanged);
    return stop;
  }, [reduced]);

  return (
    <section
      ref={containerRef}
      id="ideas"
      className="community-poster"
      data-nav-tone="dark"
      aria-labelledby="poster-title"
    >
      {/* Background Atmosphere & Cybernetic Grid */}
      <div className="poster-backdrop" aria-hidden="true">
        <div className="poster-ambient-glow" />
        <div className="poster-grid-mesh" />
        <div className="poster-grid-points" />
        <div className="poster-vignette-overlay" />
      </div>

      {/* Cinematic Vault Gate Doors */}
      <div ref={gateWrapRef} className="poster-gate-wrap" aria-hidden="true">
        <div ref={doorLeftRef} className="poster-gate-door door-left">
          <div className="gate-door-sheen" />
          <div ref={laserLeftRef} className="gate-seam-laser beam-right" />
        </div>
        <div ref={doorRightRef} className="poster-gate-door door-right">
          <div className="gate-door-sheen" />
          <div ref={laserRightRef} className="gate-seam-laser beam-left" />
        </div>
      </div>

      <div className="poster-inner">
        {/* Main Typography — Word by Word Illumination */}
        <h2 id="poster-title" className="poster-headline">
          <span className="headline-row row-top">
            <span ref={wordStay1Ref} className="word-chrome word-stay">
              STAY
            </span>
            <span ref={wordHungryRef} className="word-electric word-hungry">
              HUNGRY.
            </span>
          </span>
          <span className="headline-row row-bottom">
            <span ref={wordStay2Ref} className="word-chrome word-stay-2">
              STAY
            </span>
            <span ref={wordFoolishRef} className="word-silver word-foolish">
              FOOLISH.
            </span>
          </span>
        </h2>

        {/* Quote Attribution */}
        <p ref={authorRef} className="poster-author">
          <span className="author-name">— Steve Jobs</span>
          <span className="author-event">Stanford commencement, 2005</span>
        </p>

        {/* CTA Button */}
        <div ref={ctaRef} className="poster-action-wrap">
          <a
            href="/members.html"
            className="poster-meet-btn"
            aria-label="Meet the team"
          >
            <span>MEET THE TEAM</span>
            <span className="cta-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
